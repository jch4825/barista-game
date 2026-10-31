/**
 * 전체 화면 창(설정·수첩·교사 모드 등) 공통 틀
 */

import { $, h, dur } from '../core/dom.js';
import { ICON } from '../data/icons.js';
import { input } from '../core/input.js';
import { bus } from '../core/bus.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';

const stack = [];

export function openScreen({ cls = '', title = '', icon = 'star', closable = true, onClose = null } = {}) {
  tts.stop();
  const body = h('div', { class: 'scr-body' });
  const closeBtn = closable
    ? h('button', { class: 'btn btn-soft scr-close', 'aria-label': '닫기' }, h('i', { html: ICON('close') }), h('span', { text: '닫기' }))
    : null;
  const el = h('section', { class: `scr ${cls}`, role: 'dialog', 'aria-label': title },
    h('header', { class: 'scr-head' }, h('i', { class: 'scr-ico', html: ICON(icon) }), h('h1', { text: title }), closeBtn),
    body);
  $('#layer-screen').append(el);
  input.pushScope(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  audio.sfx('open');

  let closed = false;
  const api = {
    el,
    body,
    close() {
      if (closed) return;
      closed = true;
      const i = stack.indexOf(api);
      if (i >= 0) stack.splice(i, 1);
      input.popScope(el);
      el.classList.remove('is-in');
      setTimeout(() => el.remove(), dur(220));
      audio.sfx('close');
      onClose?.();
    },
    closable,
  };
  closeBtn?.addEventListener('click', (e) => { e.stopPropagation(); api.close(); });
  stack.push(api);
  setTimeout(() => input.focusFirst(body) || closeBtn?.focus(), 60);
  return api;
}

export function topScreen() { return stack[stack.length - 1] || null; }

export function closeAllScreens() {
  while (stack.length) stack[stack.length - 1].close();
}

bus.on('escape', () => {
  if (document.querySelector('#layer-modal .ov')) return; // 확인 창이 먼저 (overlays.confirm 이 '아니요'로 닫음)
  const top = topScreen();
  if (top && top.closable) top.close();
});

/** 큰 선택 버튼 묶음 (설정용) */
export function segmented(options, value, onChange, { disabled = false } = {}) {
  const wrap = h('div', { class: 'seg', role: 'radiogroup' });
  const btns = options.map(([v, label, icon]) => {
    const b = h('button', {
      class: `seg-btn ${v === value ? 'on' : ''}`, role: 'radio', 'aria-checked': String(v === value), disabled,
      onclick: (e) => {
        e.stopPropagation();
        btns.forEach((x) => { x.classList.remove('on'); x.setAttribute('aria-checked', 'false'); });
        b.classList.add('on');
        b.setAttribute('aria-checked', 'true');
        audio.sfx('tap');
        onChange(v);
      },
    }, icon ? h('i', { html: ICON(icon) }) : null, h('span', { text: label }));
    return b;
  });
  wrap.append(...btns);
  return wrap;
}

export function row(label, control, help = '') {
  return h('div', { class: 'set-row' }, h('div', { class: 'set-label' }, h('b', { text: label }), help ? h('small', { text: help }) : null), control);
}
