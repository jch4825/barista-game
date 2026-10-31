/**
 * 상단 HUD: 에피소드 이름 + 지금 장소, 오늘의 일정 칩(①②③), 시계, 저장 표시, 되감기, 메모, 수첩, 레시피, 설정, 멈춤
 * 2026-10-28: '숨 고르기' 대신 [레시피](레시피 수첩). 모양은 css/skin-sea.css(반투명 길쭉한 띠 + 가로로 긴 단추)
 * 버튼은 언제나 그림 + 글자를 함께 보여 줍니다.
 */

import { CONFIG } from '../config.js';
import { $, h } from '../core/dom.js';
import { ICON } from '../data/icons.js';
import { bus } from '../core/bus.js';
import { audio } from '../av/audio.js';

let el;
let epEl;
let titleEl;
let placeEl;
let schedEl;
let clockEl;
let savedEl;
let rewindBtn;
let notebookBtn;
let sched = { items: [], done: [] };
let savedTimer = null;

function btn(icon, label, evt, extra = '') {
  return h('button', {
    class: `hud-btn ${extra}`,
    'aria-label': label,
    onclick: (e) => { e.stopPropagation(); audio.sfx('tap'); bus.emit(evt); },
  }, h('i', { html: ICON(icon) }), h('span', { text: label }));
}

function drawSched() {
  const next = sched.items.findIndex((_, i) => !sched.done.includes(i + 1));
  schedEl.replaceChildren(...sched.items.map(([icon, label], i) => {
    const n = i + 1;
    const done = sched.done.includes(n);
    return h('span', {
      class: `hud-step ${done ? 'done' : ''} ${i === next ? 'next' : ''}`,
      title: label,
      'aria-label': `${n}번 ${label}${done ? ', 끝' : ''}`,
    }, h('b', { text: String(n) }), h('i', { html: ICON(icon) }), done ? h('em', { html: ICON('check') }) : null);
  }));
  schedEl.classList.toggle('is-hidden', !sched.items.length);
}

export const hud = {
  init() {
    epEl = h('span', { class: 'hud-ep' });
    titleEl = h('span', { class: 'hud-title' });
    placeEl = h('span', { class: 'hud-place' });
    schedEl = h('div', { class: 'hud-sched is-hidden', role: 'list', 'aria-label': '오늘의 일정' });
    clockEl = h('span', { class: 'hud-clock', 'aria-label': '지금 시각' });
    savedEl = h('span', { class: 'hud-saved', 'aria-hidden': 'true' }, h('i', { html: ICON('check') }), h('span', { text: '저장했어요' }));
    rewindBtn = btn('rewind', '되감기', 'hud:rewind', 'hud-rewind');
    notebookBtn = btn('book', '수첩', 'hud:notebook', 'hud-notebook');
    el = h('header', { class: 'hud is-hidden' },
      h('div', { class: 'hud-left' },
        h('span', { class: 'hud-logo', text: CONFIG.BADGE }), // 제목 화면 배지와 같은 글
        epEl,
        h('div', { class: 'hud-where' }, titleEl, placeEl)),
      schedEl,
      h('div', { class: 'hud-right' },
        savedEl,
        clockEl,
        rewindBtn,
        btn('memo', '메모', 'hud:memo'),
        notebookBtn,
        btn('coffee', '레시피', 'hud:recipe', 'hud-recipe'),
        btn('settings', '설정', 'hud:settings'),
        btn('pause', '멈춤', 'hud:pause')));
    $('#layer-hud').replaceChildren(el);
  },
  show() { el.classList.remove('is-hidden'); },
  hide() { el.classList.add('is-hidden'); },
  setEpisode(label, title) {
    epEl.textContent = label || '';
    titleEl.textContent = title || '';
  },
  /** 지금 장소 (장소 자막이 나올 때 함께 바뀜) */
  setPlace(text) {
    placeEl.textContent = text ? `📍 ${text}` : '';
    placeEl.classList.toggle('is-hidden', !text);
  },
  getPlace() { return placeEl.textContent.replace('📍 ', ''); },
  /** 오늘의 일정: items = [[아이콘, 글], …] */
  setSchedule(items = [], done = []) {
    sched = { items: items || [], done: [...done] };
    drawSched();
  },
  checkStep(n) {
    if (!sched.done.includes(n)) sched.done.push(n);
    drawSched();
    const chip = schedEl.children[n - 1];
    chip?.classList.add('pop');
    return chip || null;
  },
  getSchedule() { return { items: sched.items, done: [...sched.done] }; },
  setTime(t) {
    clockEl.textContent = t ? `🕘 ${t}` : '';
    clockEl.classList.toggle('is-hidden', !t);
  },
  getTime() { return clockEl.textContent.replace('🕘 ', ''); },
  /** 자동 저장 표시 (잠깐 보였다 사라짐) */
  saved() {
    clearTimeout(savedTimer);
    savedEl.classList.add('on');
    savedTimer = setTimeout(() => savedEl.classList.remove('on'), 1600);
  },
  setRewindEnabled(on) {
    rewindBtn.disabled = !on;
    rewindBtn.classList.toggle('is-off', !on);
  },
  pulseRewind() {
    rewindBtn.classList.remove('pulse');
    void rewindBtn.offsetWidth;
    rewindBtn.classList.add('pulse');
  },
  /** 별이 날아가 박힐 곳(수첩 버튼) */
  stampTarget() { return notebookBtn; },
};
