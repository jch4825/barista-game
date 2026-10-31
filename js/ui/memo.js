/**
 * 점장님의 노란 메모 (오픈북 단서). 화면 오른쪽 위에 늘 붙어 있습니다.
 */

import { $, h, dur } from '../core/dom.js';
import { ICON } from '../data/icons.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';

let el;
let listEl;
let titleEl;
let data = null;
let hiTimer = null;

export const memo = {
  init() {
    el = h('aside', { class: 'memo is-hidden', 'aria-label': '오늘의 메모' });
    titleEl = h('span', { class: 'memo-title' });
    listEl = h('ol', { class: 'memo-list' });
    const sayBtn = h('button', { class: 'memo-btn', 'aria-label': '메모 읽어 주기', html: ICON('volume'), onclick: (e) => { e.stopPropagation(); memo.speak(); } });
    const foldBtn = h('button', { class: 'memo-btn', 'aria-label': '메모 접기', html: ICON('close'), onclick: (e) => { e.stopPropagation(); memo.toggle(false); } });
    el.append(h('div', { class: 'memo-tape' }), h('div', { class: 'memo-head' }, titleEl, sayBtn, foldBtn), listEl);
    el.addEventListener('click', () => { if (el.classList.contains('is-folded')) memo.toggle(true); });
    $('#layer-memo').replaceChildren(el);
  },

  /** items: [[icon, text], ...] 또는 [{icon, text}] */
  set(title, items, { silent = false } = {}) {
    data = { title, items: items.map((it) => (Array.isArray(it) ? { icon: it[0], text: it[1] } : it)) };
    titleEl.textContent = title;
    listEl.replaceChildren(...data.items.map((it, i) => h('li', { 'data-n': i + 1 },
      h('b', { class: 'memo-n', text: String(i + 1) }),
      h('i', { class: 'memo-ico', html: ICON(it.icon || 'memo') }),
      h('span', { text: it.text }))));
    el.classList.remove('is-hidden', 'is-folded');
    if (!silent) {
      el.classList.remove('slap');
      void el.offsetWidth;
      el.classList.add('slap');
      audio.sfx('page');
    }
  },

  highlight(n, ms = 6000) {
    clearTimeout(hiTimer);
    listEl.querySelectorAll('li').forEach((li) => li.classList.toggle('hi', Number(li.dataset.n) === n));
    el.classList.remove('is-folded');
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), dur(900));
    if (ms) hiTimer = setTimeout(memo.clearHighlight, ms);
  },

  clearHighlight() {
    listEl?.querySelectorAll('li.hi').forEach((li) => li.classList.remove('hi'));
  },

  speak() {
    if (!data) return;
    const text = `${data.title}. ${data.items.map((it, i) => `${i + 1}번, ${it.text}`).join('. ')}`;
    tts.speak(text, 'sys', { force: true });
  },

  toggle(open) {
    const willOpen = open ?? el.classList.contains('is-folded');
    el.classList.toggle('is-folded', !willOpen);
    audio.sfx(willOpen ? 'open' : 'close');
  },

  hide() { el.classList.add('is-hidden'); },
  show() { if (data) el.classList.remove('is-hidden'); },

  getState() { return data ? JSON.parse(JSON.stringify(data)) : null; },
  restore(st) {
    if (!st) { data = null; el.classList.add('is-hidden'); return; }
    memo.set(st.title, st.items, { silent: true });
  },
  clear() { data = null; el.classList.add('is-hidden'); },
};
