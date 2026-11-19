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
 * 단추 밖(어둡게 깐 장면)을 눌러도 시작: 대사를 넘기듯 화면을 누르는 학생이 멈춘 줄 알지 않게(작업대의 [시작!] 창과 같음, 검수 13.39 1번).
 * 앞 대사를 넘기던 손이 바로 시작해 버리지 않게 잠깐(0.7초) 뒤부터, ready(틀의 처음 설명 told)가 있으면 설명을 다 들은 뒤부터.
 * 그 전에 단추 밖을 누르면 [시작!]이 살짝 커졌다 돌아옴. 쟁반은 단추만 누름(css 의 pointer-events)
 */
export const QUICK_MS = 1600; // 숙련자 템포: [시작!]이 저절로 눌리기까지
export const GATE_TAP = '화면 아무 곳이나 눌러도 시작해요.'; // 화면을 눌러도 이어진다는 설명(2026-11-18 사용자 "화면을 눌러도 게임이 진행된다는 설명이 없다")
export function startGate(host, { label = '시작!', note = '', ready = null, quick = false, tap = true } = {}) {
  // quick(숙련자 템포 · 익숙한 놀이): 설명을 기다리지 않고 곧 저절로 시작(턴 방식은 시간이 가지 않으므로 저절로 시작하지 않음)
  const auto = quick && !pace().turn;
  const btn = h('button', { class: `btn btn-big btn-main mg-go${auto ? ' is-quick' : ''}`, style: { '--quick': `${QUICK_MS / 1000}s` } }, h('i', { html: ICON('play') }), h('span', { text: label }));
  const tapNote = tap ? h('p', { class: 'mg-gate-tap' }, h('i', { html: ICON('hand') }), h('span', { text: auto ? '곧 저절로 시작해요. 화면을 누르면 바로 시작해요.' : GATE_TAP })) : null;
  const wrap = h('div', { class: 'mg-gate' }, btn, note ? h('p', { text: note }) : null, tapNote);
  host.append(wrap);
  const shownAt = performance.now() - (quick ? 700 : 0);
  let told = !ready || quick;
  ready?.then(() => { told = true; });
  // 저절로 시작: 다른 창(멈춤 · 설정 · [그만하기] 물음)이 열린 동안은 세지 않고, 닫힌 뒤 다시 QUICK_MS(띠도 처음부터).
  // 틀이 닫히는 중(그만하기 · 되감기의 사라지는 0.22초)이면 그만둠
  let calmAt = performance.now();
  const autoT = auto ? setInterval(() => {
    if (!btn.isConnected || btn.closest('.is-out')) { clearInterval(autoT); return; }
    if (blockedNow()) { calmAt = performance.now(); btn.classList.remove('is-quick'); return; }
    btn.classList.add('is-quick');
    if (performance.now() - calmAt >= QUICK_MS) { clearInterval(autoT); btn.click(); }
  }, 100) : 0;
  // [설명 듣기]를 누르면 저절로 시작하지 않음: 설명을 끝까지 듣고 [시작!] · 화면을 눌러 시작
  const sayB = auto ? host.closest('.mg')?.querySelector('.mg-say') : null;
  const noAuto = () => {
    clearInterval(autoT);
    btn.classList.remove('is-quick');
    const t = tapNote?.querySelector('span');
    if (t) t.textContent = GATE_TAP;
  };
  sayB?.addEventListener('click', noAuto);
  setTimeout(() => btn.focus({ preventScroll: true }), 60);
  wrap.addEventListener('click', () => { // 단추는 누름을 위로 보내지 않음
    if (told && performance.now() - shownAt > 700) { btn.click(); return; }
    btn.classList.remove('is-nudge');
    void btn.offsetWidth;
    btn.classList.add('is-nudge');
  });
  return new Promise((resolve) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearInterval(autoT);
      sayB?.removeEventListener('click', noAuto);
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
