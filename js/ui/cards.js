/**
 * 그림 카드 (판단 장면 + 자유 선택)
 *  - present(): 카드를 보여 주고 고른 결과를 돌려줍니다. 결과 처리(성공/실패/되감기)는 runner 가 합니다.
 *  - 한 번 눌러 고르기 / 두 번 눌러 고르기(첫 번째는 읽어 주기) 설정 지원
 *  - 숫자키 1~4, 화살표, 스위치 스캔 지원
 *  - 읽어 주기: 카드 오른쪽 위 소리 아이콘을 누를 때만(앞 대사 음성이 끊기지 않게).
 *    '카드 읽어 주기' 설정을 켜면 키보드·스캔으로 초점을 옮길 때도 읽음(처음 자동 초점은 읽지 않음)
 *  - 시간 제한(급한 장면): runner 가 만든 막대(js/ui/timer.js)를 카드 위에 붙이고, 시간이 다 되면 {type:'timeout'}
 */

import { $, h, sleep, dur } from '../core/dom.js';
import { plain, fill } from '../core/text.js';
import { ICON } from '../data/icons.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { store } from '../core/store.js';
import { input } from '../core/input.js';
import { bus } from '../core/bus.js';
import { vfx } from './vfx.js';

let wrap = null;
let readTimer = null;
let cancelOpen = null; // 열린 카드의 뒷정리(막대·숫자키·입력 범위). 고르기 전에 닫힐 때 close()가 부름

function readLabel(text, force = false) {
  const s = store.settings();
  if (s.voice === 'off') return;
  if (!force && !(s.voice === 'auto' && s.readCards)) return;
  clearTimeout(readTimer);
  readTimer = setTimeout(() => tts.speak(text, 'sys', { force: true }), 120);
}

/**
 * order: 보여 줄 순서(화면 자리 → 원래 카드 번호). 판단 카드는 정답 자리가 고르게 퍼지도록
 * js/data/episodes/index.js 가 정한 decide.order 를 씀. 결과의 index 는 늘 원래 카드 번호
 */
function build(options, { tried = new Set(), glow = -1, variant = '', help = false, helpLabel = '도와주세요', timer = null, order = null }) {
  const seq = order && order.length === options.length ? order : options.map((_, i) => i);
  const s = store.settings();
  return new Promise((resolve) => {
    const area = $('#layer-task');
    let selected = -1;
    let done = false;
    let offKey = () => {};
    let box = null; // 이 카드 묶음(모듈의 wrap 은 다음 카드로 바뀔 수 있어 따로 둠)
    const btns = [];

    // 막대 멈춤·숫자키 풀기·입력 범위 빼기. 이미 정리했으면 false
    const cleanup = () => {
      if (done) return false;
      done = true;
      timer?.stop();
      offKey();
      input.popScope(box);
      clearTimeout(readTimer);
      if (cancelOpen === cleanup) cancelOpen = null;
      return true;
    };
    const finish = (res) => { if (cleanup()) resolve(res); };

    // k: 화면 자리, seq[k]: 원래 카드 번호
    const select = (k) => {
      selected = k;
      btns.forEach((b, j) => b.classList.toggle('selected', j === k));
      audio.sfx('focus');
      readLabel(plain(fill(options[seq[k]].label)), true);
    };

    const pick = (k) => {
      if (done) return;
      audio.sfx('tap');
      btns[k].classList.add('picked');
      finish({ type: 'pick', index: seq[k] });
    };

    const list = h('div', { class: 'cards' });
    let autoFocus = true; // 카드가 나타날 때의 첫 초점은 읽지 않음
    seq.forEach((i, k) => {
      const c = options[i];
      const label = plain(fill(c.label));
      const b = h('button', {
        class: `card ${tried.has(i) ? 'tried' : ''} ${i === glow ? 'glow' : ''}`, 'data-i': String(i),
        'aria-label': `${k + 1}번. ${label}${tried.has(i) ? '. 해 봤던 카드' : ''}`,
      },
      h('span', { class: 'card-num', text: String(k + 1) }),
      c.icon ? h('span', { class: 'card-ico', html: ICON(c.icon) }) : null,
      h('span', { class: 'card-label', text: label }),
      c.sub ? h('span', { class: 'card-sub', text: plain(fill(c.sub)) }) : null,
      tried.has(i) ? h('span', { class: 'card-tried' }, h('i', { html: ICON('rewind') }), '해 봤어요') : null,
      h('span', { class: 'card-ok', text: '이걸로 할게요 ✓' }),
      h('span', { class: 'card-say', 'aria-hidden': 'true', title: '읽어 주기', html: ICON('volume') }));
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.closest('.card-say')) { audio.sfx('tap'); readLabel(label, true); return; } // 소리 아이콘: 고르지 않고 읽기만
        if (s.selectMode === 'two' && selected !== k) { select(k); return; }
        pick(k);
      });
      b.addEventListener('focus', () => { if (autoFocus) { autoFocus = false; return; } readLabel(label); });
      btns.push(b);
      list.append(b);
    });

    const tools = help
      ? h('div', { class: 'cards-tools' }, h('button', {
        class: 'btn btn-help',
        onclick: (e) => { e.stopPropagation(); audio.sfx('hint'); finish({ type: 'help' }); },
      }, h('i', { html: ICON('hand') }), h('span', { text: helpLabel })))
      : null;

    box = h('div', { class: `cards-wrap n${options.length} ${variant} ${timer ? 'timed' : ''}`, role: 'group', 'aria-label': '카드를 골라 보세요' }, timer ? timer.el : null, list, tools);
    wrap = box;
    area.replaceChildren(box);
    document.body.classList.add('tasking');
    requestAnimationFrame(() => box.classList.add('is-in'));
    input.pushScope(box);
    offKey = bus.on('number-key', (n) => { if (n >= 1 && n <= options.length) pick(n - 1); });
    cancelOpen = cleanup;
    setTimeout(() => input.focusFirst(list), 60);
    if (timer) {
      setTimeout(() => { if (!done) timer.start(); }, dur(450)); // 카드가 다 나타난 뒤부터
      timer.done.then(() => finish({ type: 'timeout' }));
    }
  });
}

export const cards = {
  /** 판단 카드. 결과: {type:'pick', index} | {type:'help'} | {type:'timeout'}(opts.timer 가 있을 때) */
  present(step, opts = {}) {
    return build(step.choices, { ...opts, help: !step.noHelp, helpLabel: step.helpLabel || '도와주세요', variant: step.variant || '', order: step.order || null });
  },

  /** 자유 선택(정답 없음). 결과: index */
  async ask(options, { variant = '' } = {}) {
    const r = await build(options, { variant: `free ${variant}` });
    return r.index;
  },

  async success(index, { great = false } = {}) {
    if (!wrap) return;
    const btns = [...wrap.querySelectorAll('.card')];
    const hit = wrap.querySelector(`.card[data-i="${index}"]`);
    btns.forEach((b) => b.classList.add(b === hit ? 'good' : 'fade'));
    audio.sfx(great ? 'great' : 'good');
    if (hit) vfx.sparkleAt(hit, { n: great ? 16 : 10 });
    await sleep(dur(650));
  },

  async markBad(index) {
    if (!wrap) return;
    const b = wrap.querySelector(`.card[data-i="${index}"]`);
    if (b) b.classList.add('bad');
    await sleep(dur(350));
  },

  close() {
    cancelOpen?.(); // 고르기 전에 닫힘(되감기·나가기): 막대가 다른 장면에서 끝나거나 숫자키가 남지 않게
    document.body.classList.remove('tasking');
    if (!wrap) { $('#layer-task').replaceChildren(); return; }
    const w = wrap;
    wrap = null;
    w.classList.remove('is-in');
    w.classList.add('is-out');
    setTimeout(() => { if (w.parentNode) w.remove(); }, dur(220));
  },
};
