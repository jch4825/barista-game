/**
 * 입력 관리
 *  - 키보드: Space / Enter / → 로 대사 넘기기, 1~4 숫자로 카드 고르기
 *  - 스위치 자동 스캔: 화면의 버튼을 차례로 강조하고, 스위치(Space/Enter/클릭) 한 번으로 선택
 *  - 포커스 범위(scope): 가장 위에 열린 창 안에서만 이동
 */

import { store } from './store.js';
import { bus } from './bus.js';

const scopes = [];
let advanceHandler = null;
let scanTimer = null;
let scanIndex = -1;

function topScope() {
  // 되감기·나가기로 지워진 창(화면에서 떨어져 나간 요소)은 건너뜀: popScope 를 못 한 범위가 남아도 키보드·스캔이 살아 있게
  for (let i = scopes.length - 1; i >= 0; i--) if (scopes[i].isConnected) return scopes[i];
  return document.getElementById('screen');
}

function visible(el) {
  if (!el || el.disabled) return false;
  if (el.closest('[hidden], .is-hidden')) return false;
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
}

function scanTargets() {
  const scope = topScope();
  const list = [...scope.querySelectorAll('button, [data-scan], input, textarea, select')].filter(visible);
  // 대사 대기 중이면 대사창을 맨 앞에
  return list;
}

function clearScanMark() {
  document.querySelectorAll('.scan-on').forEach((el) => el.classList.remove('scan-on'));
}

/**
 * 강조한 단추가 스크롤 상자(설정 · 달력 · 수첩 목록) 밖이면 그 상자만 굴려 보이게(검수 13.39 25번).
 * scrollIntoView 는 쓰지 않음: 넘침을 숨긴 게임 판까지 밀어 버림. 판이 줄어 그려져 있어 화면 좌표를 상자의 px 로 바꿈
 */
function reveal(el) {
  for (let box = el.parentElement; box && box !== document.body; box = box.parentElement) {
    const st = getComputedStyle(box);
    if (!/(auto|scroll)/.test(st.overflowY) || box.scrollHeight <= box.clientHeight + 1) continue;
    const r = el.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    const k = box.offsetHeight ? br.height / box.offsetHeight : 1;
    const pad = 16 * k;
    if (r.top < br.top + pad) box.scrollTop -= (br.top + pad - r.top) / k;
    else if (r.bottom > br.bottom - pad) box.scrollTop += (r.bottom - (br.bottom - pad)) / k;
  }
}

function scanStep() {
  const list = scanTargets();
  if (!list.length) { clearScanMark(); return; }
  scanIndex = (scanIndex + 1) % list.length;
  clearScanMark();
  const el = list[scanIndex];
  el.classList.add('scan-on');
  el.focus({ preventScroll: true });
  reveal(el);
  bus.emit('scan-focus', el);
}

export const input = {
  init() {
    document.addEventListener('keydown', (e) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      // 스캔 모드: 스위치 = 현재 강조된 것 누르기 (강조가 없으면 대사 넘기기)
      if (store.settings().scan && (e.key === ' ' || e.key === 'Enter')) {
        const on = document.querySelector('.scan-on');
        e.preventDefault();
        if (on && document.contains(on) && visible(on)) { on.click(); scanIndex = -1; }
        else if (advanceHandler) advanceHandler('key');
        return;
      }

      const ae = document.activeElement;
      const onButton = ae && ae !== document.body && (ae.tagName === 'BUTTON' || ae.getAttribute('role') === 'button') && !ae.classList.contains('dlg');

      if ((e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'PageDown') && !onButton) {
        if (advanceHandler && advanceHandler('key')) e.preventDefault();
        return;
      }
      if (e.key === 'Escape') {
        bus.emit('escape');
        return;
      }
      if (/^[1-4]$/.test(e.key)) {
        bus.emit('number-key', Number(e.key));
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        const list = [...topScope().querySelectorAll('button')].filter(visible);
        const i = list.indexOf(document.activeElement);
        if (i >= 0 && list.length > 1) {
          const d = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
          list[(i + d + list.length) % list.length].focus();
          e.preventDefault();
        }
      }
    });

    bus.on('settings', (s) => input.applyScan(s));
    // 학생을 바꾸거나 기록을 불러오면 그 학생의 스캔 설정으로(앞 학생 설정으로 돌면 강조 없이 Space/Enter 만 가로챔, 검수 13.39 8번)
    bus.on('profile', () => input.applyScan(store.settings()));
    input.applyScan(store.settings());
  },

  /** 대사 넘기기 처리 함수 등록 (true 를 돌려주면 처리됨) */
  setAdvanceHandler(fn) { advanceHandler = fn; },

  pushScope(el) {
    for (let i = scopes.length - 1; i >= 0; i--) if (!scopes[i].isConnected) scopes.splice(i, 1); // 지워진 창의 범위는 버림
    scopes.push(el);
    scanIndex = -1;
  },
  popScope(el) {
    const i = scopes.lastIndexOf(el);
    if (i >= 0) scopes.splice(i, 1);
    scanIndex = -1;
    clearScanMark();
  },

  applyScan(s) {
    clearInterval(scanTimer);
    clearScanMark();
    scanIndex = -1;
    if (s.scan) scanTimer = setInterval(scanStep, Math.max(0.8, Number(s.scanSpeed) || 1.8) * 1000);
  },

  /**
   * 창을 닫은 뒤: 초점이 맨 위 범위(처음 화면 · 아래 창) 밖에 남았으면 그 범위의 첫 단추로(방향키 · Enter 가 이어지게, 검수 13.39 20번).
   * 이야기 화면(#screen)이 맨 위면 그대로: Space 가 대사를 넘겨야 함
   */
  refocus() {
    const top = topScope();
    if (!top || top.id === 'screen' || top.contains(document.activeElement)) return;
    input.focusFirst(top);
  },

  /** 새 버튼 묶음이 나타났을 때 첫 버튼에 초점 */
  focusFirst(container) {
    const el = container?.querySelector('button:not([disabled])');
    scanIndex = -1;
    if (!el) return false;
    el.focus({ preventScroll: true });
    return true;
  },
};
