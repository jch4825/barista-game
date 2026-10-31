/**
 * 시간 제한 막대 (이야기 속 급한 장면: 판단 카드 · 주문 담기)
 *  - 막대가 점점 줄어듭니다. 남은 시간이 절반 아래면 주황, 30% 아래면 빨강 + 째깍 소리 한 번(팝 모드에서는 은은하게 깜빡임)
 *  - 설정 '시간 제한': 보통(1배) · 넉넉히(2배) · 끄기. 스위치 스캔을 쓰면 꺼지고, '두 번 눌러 고르기'면 1.5배
 *  - 멈춤·설정·지난 대화·말 사전처럼 다른 창이 열려 있으면 멈춥니다(창을 보는 동안 시간이 가지 않게)
 *  - 시간이 다 되면 '시간이 다 됐어요!'를 보여 주고 읽어 준 뒤 done 이 'timeout' 으로 끝납니다
 * 쓰는 곳: js/ui/cards.js(판단 카드), js/game/minigames/order.js(주문서 확인)
 */

import { h, announce } from '../core/dom.js';
import { store } from '../core/store.js';
import { ICON } from '../data/icons.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';

/** 시간이 다 됐을 때 읽어 주는 말 (음성 파일: tools/export-lines.mjs 의 EXTRA) */
export const TIMEOUT_SAY = '시간이 다 됐어요!';

/** 설정에 따른 시간 배율. 0 이면 시간 제한 없음 */
export function timerFactor(s = store.settings()) {
  if (s.timer === 'off' || s.scan) return 0;
  return (s.timer === 'slow' ? 2 : 1) * (s.selectMode === 'two' ? 1.5 : 1);
}

/** 다른 창이 열려 있으면 시간이 가지 않음 */
function blocked() {
  return document.hidden || Boolean(document.querySelector('#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov'));
}

/**
 * 막대 만들기. sec 는 이미 배율을 곱한 초.
 * 돌려줌: { el, done(Promise<'timeout'>), start(), stop() }
 */
export function timerBar({ sec, label = '서둘러요' }) {
  const fill = h('i', { class: 'tm-fill' });
  const text = h('span', { class: 'tm-label', text: label });
  const el = h('div', { class: 'tm', role: 'timer', 'aria-label': `시간 제한: ${label}` },
    h('i', { class: 'tm-ico', html: ICON('hourglass') }), text, h('span', { class: 'tm-track' }, fill));
  const total = Math.max(3, sec) * 1000;
  let left = total;
  let last = 0;
  let iv = null;
  let ended = false; // stop() 뒤에는 다시 시작하지 않음(늦게 온 start 가 막대를 되살리지 않게)
  let warned = false;
  let resolveDone;
  const done = new Promise((r) => { resolveDone = r; });

  const draw = () => {
    const p = Math.max(0, left / total);
    el.style.setProperty('--p', p.toFixed(4));
    el.classList.toggle('mid', p <= 0.5 && p > 0.3);
    el.classList.toggle('warn', p <= 0.3);
    if (p <= 0.3 && !warned) {
      warned = true;
      audio.sfx('tick_fast');
      announce('시간이 얼마 안 남았어요');
    }
  };

  const step = () => {
    const now = performance.now();
    const dt = now - last;
    last = now;
    // 막대가 화면에서 사라지면(되감기·나가기로 창이 지워짐) 멈춤: 다른 장면에서 '시간이 다 됐어요!'가 나오지 않게
    if (!el.isConnected) { api.stop(); return; }
    if (blocked()) return;
    left -= dt;
    draw();
    if (left > 0) return;
    api.stop();
    el.classList.add('over');
    text.textContent = TIMEOUT_SAY;
    audio.sfx('beep');
    announce(TIMEOUT_SAY);
    tts.speak(TIMEOUT_SAY, 'sys');
    resolveDone('timeout');
  };

  const api = {
    el,
    done,
    start() {
      if (iv || ended) return;
      last = performance.now();
      draw();
      iv = setInterval(step, 100);
      announce(`시간 제한이 있어요. ${label}`);
    },
    stop() {
      ended = true;
      clearInterval(iv);
      iv = null;
    },
  };
  return api;
}
