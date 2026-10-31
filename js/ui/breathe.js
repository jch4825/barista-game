/**
 * 숨 고르기 (하나, 둘, 셋)
 * 이야기 속 장면에서도, 상단 [숨 고르기] 버튼으로도 언제든 쓸 수 있는 진정 도구입니다.
 */

import { $, h, sleep, dur } from '../core/dom.js';
import { ICON } from '../data/icons.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { input } from '../core/input.js';
import { store } from '../core/store.js';

// 지금 열린 숨 고르기 창. 되감기·나가기(ov.clearAll)로 창이 지워지면 다시 열 수 있게 isConnected 로 봄(2026-10-18)
let current = null;

export async function breathe({ cycles = 3, title = '숨 고르기', note = '' } = {}) {
  if (current?.isConnected) return;
  const circle = h('div', { class: 'br-circle' }, h('span', { class: 'br-word', text: '준비' }), h('b', { class: 'br-count', text: '' }));
  const stopBtn = h('button', { class: 'btn btn-small' }, h('i', { html: ICON('close') }), h('span', { text: '그만하기' }));
  const doneBtn = h('button', { class: 'btn btn-big btn-main is-hidden' }, h('i', { html: ICON('check') }), h('span', { text: '다 했어요' }));
  const dots = h('div', { class: 'br-dots' }, ...Array.from({ length: cycles }, () => h('i')));
  const el = h('section', { class: 'ov ov-breathe', role: 'dialog', 'aria-label': title },
    h('h2', { text: title }),
    note ? h('p', { class: 'br-note', text: note }) : null,
    circle, dots, h('div', { class: 'br-btns' }, stopBtn, doneBtn));
  $('#layer-overlay').append(el);
  current = el;
  input.pushScope(el);
  requestAnimationFrame(() => el.classList.add('is-in'));

  let stopped = false;
  const gone = () => !el.isConnected; // 바깥에서 창을 지웠으면 소리·안내를 멈추고 끝냄
  const stopP = new Promise((r) => stopBtn.addEventListener('click', () => { stopped = true; r(); }, { once: true }));
  const wordEl = circle.querySelector('.br-word');
  const countEl = circle.querySelector('.br-count');
  const voiceOn = store.settings().voice !== 'off';

  const phase = async (word, cls, sfx, secs) => {
    if (stopped || gone()) return;
    wordEl.textContent = word;
    circle.className = `br-circle ${cls}`;
    audio.sfx(sfx);
    if (voiceOn) tts.speak(word, 'sys', { force: true });
    for (let s = 1; s <= secs; s++) {
      if (stopped || gone()) return;
      countEl.textContent = String(s);
      await Promise.race([sleep(1000), stopP]);
    }
  };

  await Promise.race([sleep(dur(600)), stopP]);
  for (let c = 0; c < cycles && !stopped && !gone(); c++) {
    await phase('들이쉬기', 'in', 'breathIn', 4);
    await phase('내쉬기', 'out', 'breathOut', 4);
    dots.children[c]?.classList.add('on');
  }

  if (gone()) { if (current === el) current = null; return false; }
  if (!stopped) {
    wordEl.textContent = '잘했어요';
    countEl.textContent = '';
    circle.className = 'br-circle done';
    audio.sfx('heart');
    if (voiceOn) tts.speak('잘했어요. 마음이 조금 편해졌나요?', 'sys', { force: true });
    stopBtn.classList.add('is-hidden');
    doneBtn.classList.remove('is-hidden');
    doneBtn.focus({ preventScroll: true });
    await new Promise((r) => doneBtn.addEventListener('click', r, { once: true }));
  }
  tts.stop();
  input.popScope(el);
  el.classList.remove('is-in');
  setTimeout(() => el.remove(), dur(250));
  if (current === el) current = null;
  return !stopped;
}
