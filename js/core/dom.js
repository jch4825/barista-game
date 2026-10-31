/**
 * 작은 DOM 도우미 모음
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/**
 * 요소 만들기: h('button', { class: 'btn', onclick: fn, 'aria-label': '...' }, '글자', childEl)
 * attrs.html 은 innerHTML(신뢰된 내부 문자열만), attrs.text 는 textContent.
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) {
        if (sk.startsWith('--')) el.style.setProperty(sk, sv);
        else el.style[sk] = sv;
      }
    }
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, String(v));
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

export function clear(el) {
  if (el) el.replaceChildren();
  return el;
}

/** 버튼 클릭 한 번을 기다림 */
export function onceClick(el) {
  return new Promise((resolve) => el.addEventListener('click', (e) => resolve(e), { once: true }));
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** 접근성: 스크린리더 알림 */
export function announce(text) {
  const el = document.getElementById('sr-live');
  if (!el) return;
  el.textContent = '';
  setTimeout(() => { el.textContent = text; }, 30);
}

export function isReducedMotion() {
  return document.body.classList.contains('reduce-motion');
}

/** 애니메이션 시간: 움직임 줄이기 설정이면 짧게 */
export function dur(ms) {
  return isReducedMotion() ? Math.min(ms, 120) : ms;
}
