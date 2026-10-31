/**
 * 4장 손맛 미니게임(받기·청소·지렁이) 공통 도구
 *  - 빠르기는 설정 '시간 제한'을 따릅니다: 보통 = 실시간, 넉넉히 = 두 배 천천히, '두 번 눌러 고르기' = 1.5배 천천히,
 *    끄기·자동 스캔 = 턴 방식(내가 한 번 하면 세상이 한 칸 움직임, 기다리면 세상도 기다림)
 *  - 멈춤·설정·아차 카드처럼 다른 창이 열려 있으면 시간이 가지 않습니다.
 *  - 게임은 [시작!]을 눌러야 움직이기 시작합니다(설명을 다 듣고, 마음의 준비를 하고 시작).
 *  - 방향키는 게임 조작으로 씁니다(다른 창이 열려 있을 때는 원래대로 버튼 사이 이동).
 */

import { h, dur, isReducedMotion } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { timerFactor } from '../../ui/timer.js';

/** { turn: 턴 방식인가, k: 시간 배율(클수록 천천히) } */
export function pace() {
  const k = timerFactor();
  return { turn: k === 0, k: k || 1 };
}

/** 다른 창(멈춤·설정·아차 카드·확인 창)이 열려 있으면 게임 시간을 멈춤 */
export function blockedNow() {
  return document.hidden || Boolean(document.querySelector('#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov'));
}

export const isDebug = () => new URLSearchParams(location.search).has('debug');

/**
 * 실시간 고리: step(dt ms) 를 1초에 약 30번 부름. 다른 창이 열려 있으면 부르지 않음.
 * speed() 를 주면 dt 에 곱함(자동 플레이를 빠르게)
 */
export function loop(step, speed = () => 1) {
  let last = performance.now();
  let on = true;
  const tick = () => {
    if (!on) return;
    const now = performance.now();
    const dt = Math.min(100, now - last);
    last = now;
    if (!blockedNow()) {
      try { step(dt * speed()); } catch (e) { console.error('[arcade]', e); }
    }
    setTimeout(tick, 33);
  };
  setTimeout(tick, 33);
  return { stop() { on = false; } };
}

/**
 * [시작!] 버튼을 host 위에 띄우고 누를 때까지 기다림.
 * note: 버튼 아래 작은 글(예: '천천히 해도 괜찮아요')
 */
export function startGate(host, { label = '시작!', note = '' } = {}) {
  const btn = h('button', { class: 'btn btn-big btn-main mg-go' }, h('i', { html: ICON('play') }), h('span', { text: label }));
  const wrap = h('div', { class: 'mg-gate' }, btn, note ? h('p', { text: note }) : null);
  host.append(wrap);
  setTimeout(() => btn.focus({ preventScroll: true }), 60);
  return new Promise((resolve) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.sfx('tap');
      tts.stop();
      wrap.classList.add('is-out');
      setTimeout(() => wrap.remove(), dur(200));
      resolve();
    }, { once: true });
  });
}

/** 방향키를 게임 조작으로: fn('left'|'right'|'up'|'down'). 돌려준 함수를 부르면 해제 */
export function arrowKeys(fn) {
  const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
  const on = (e) => {
    const d = map[e.key];
    if (!d || blockedNow()) return;
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    e.preventDefault();
    e.stopPropagation();
    fn(d);
  };
  document.addEventListener('keydown', on, true);
  return () => document.removeEventListener('keydown', on, true);
}

/** 장식 글자(착! 반짝! 등)를 잠깐 띄움. 읽어 주지 않음(aria-hidden) */
export function popText(host, text, x, y, cls = '') {
  if (!host) return;
  const el = h('span', { class: `mg-pop ${cls}`.trim(), text, 'aria-hidden': 'true', style: { left: `${x}px`, top: `${y}px` } });
  host.append(el);
  setTimeout(() => el.remove(), isReducedMotion() ? 500 : 750);
}

/**
 * 그림 조각을 이름(key)으로 맞춰 둠: want = Map(key → 만드는 함수). 없어진 것만 빼고 새것만 만들어 붙임.
 * 그대로인 그림은 다시 만들지 않아, 다른 테이블이 바뀔 때마다 등장 효과가 다시 도는 깜빡임이 없음(2026-10-26)
 */
export function keyed(layer, els, want) {
  for (const [k, el] of els) if (!want.has(k)) { el.remove(); els.delete(k); }
  for (const [k, make] of want) {
    if (els.has(k)) continue;
    const el = make();
    if (el) { layer.append(el); els.set(k, el); }
  }
}

/** 상태 묶음 깊은 복사(되감기용) */
export const clone = (o) => JSON.parse(JSON.stringify(o));

/** 0 ≤ i < n 무작위 정수 */
export const rand = (n) => Math.floor(Math.random() * n);
