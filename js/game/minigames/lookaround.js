/**
 * 미니게임: 둘러보기 — 여는 때 · 닫는 때 가게 물건을 눌러 봄 (PRD 5.6 · Q-13 ✅, 2026-10-31 풀 버전)
 *
 *  - 카페 그림 위에 물건 단추(그림 + 이름)가 놓임. 누르면 짧은 글(지은이 본 것 · 속마음)을 보여 주고 읽어 줌. 본 것에는 표시.
 *  - 사장의 숨은 뒷받침 2 · 5 · 10(그림으로만 바뀌는 장면)을 여기서 찾을 수 있음. 찾아도 알림은 없음(seen 으로 조용히 기록)
 *  - [다 둘러봤어요]는 언제든 누를 수 있음(다 보지 않아도 됨). 화면 읽기 프로그램을 쓰는 학생도 같은 단추로 같은 기회
 * 옵션: { title, bg: [배경 id, 변형], spots: [{ name, icon, x, y, lines: ['글' | { t: 'think', text }], seen?: 1~11 }], quit? }
 * 돌려줌: { ok, attempts: 1, mistakes: 0, ms, looked(본 수) }
 * 자동 플레이(?debug): window.__mgAuto(모두 보고 끝냄)
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { store } from '../../core/store.js';
import { input } from '../../core/input.js';
import { renderBg } from '../../data/backgrounds.js';
import { frame, line, abortGeneration } from './frame.js';
import { isDebug } from './arcade.js';

const HOWTO = '가게 안의 물건을 눌러 봐요. 다 봤으면 [다 둘러봤어요]를 눌러요.';
const DONE = '다 둘러봤어요';

const lineOf = (l) => (typeof l === 'string' ? { t: 'narr', text: l } : l);

export function lookaroundLines(opts = {}) {
  const out = [...line.intro(opts.title || '둘러보기', HOWTO)];
  for (const s of opts.spots || []) {
    out.push(line.sys(s.name));
    for (const l of (s.lines || []).map(lineOf)) out.push(l.t === 'think' ? line.think(l.text) : line.narr(l.text));
  }
  return out;
}

export function lookaroundProblems(opts = {}) {
  const errs = [];
  if (!(opts.spots || []).length) errs.push('spots(물건)가 비어 있음');
  for (const [i, s] of (opts.spots || []).entries()) {
    if (!s.name || !s.icon) errs.push(`spots[${i}]: name · icon 필요`);
    if (!(s.x >= 0 && s.x <= 100 && s.y >= 0 && s.y <= 100)) errs.push(`spots[${i}]: x · y 는 0~100(%)`);
    if (!(s.lines || []).length) errs.push(`spots[${i}]: lines(보여 줄 글) 필요`);
    if (s.seen !== undefined && !(Number.isInteger(s.seen) && s.seen >= 1 && s.seen <= 11)) errs.push(`spots[${i}]: seen 은 1~11`);
  }
  return errs;
}

export async function lookaround(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  const title = opts.title || '둘러보기';
  const [bgId, bgVar] = opts.bg || ['hall', 'morning'];
  const spots = opts.spots || [];
  const f = frame({ title, instruction: HOWTO, icon: 'watch', cls: 'mg-scene mg-look', quit: false });

  const looked = new Set();
  let over = false;
  let doneRes;
  const doneP = new Promise((res) => { doneRes = res; });
  let card = null;

  const scene = h('div', { class: 'sc-bg', html: renderBg(bgId, bgVar) });
  const btns = spots.map((s, i) => {
    const b = h('button', { class: 'lk-spot', style: { left: `${s.x}%`, top: `${s.y}%` }, 'aria-label': s.name },
      h('span', { class: 'lk-ico', html: ICON(s.icon) }),
      h('span', { class: 'lk-name', text: s.name }),
      h('i', { class: 'lk-seen', html: ICON('check') }));
    b.addEventListener('click', (e) => { e.stopPropagation(); open(i); });
    return b;
  });
  const finish = h('button', { class: 'btn btn-big btn-main lk-done' }, h('i', { html: ICON('check') }), h('span', { text: DONE }));
  finish.addEventListener('click', (e) => { e.stopPropagation(); if (!card) { audio.sfx('tap'); over = true; doneRes('done'); } });
  const count = h('p', { class: 'lk-count', 'aria-live': 'polite' });
  const paintCount = () => { count.textContent = `본 것 ${looked.size} / ${spots.length}`; };
  paintCount();
  f.body.append(scene, h('div', { class: 'lk-spots', role: 'group', 'aria-label': '가게 물건' }, ...btns), h('div', { class: 'lk-foot' }, count, finish));
  setTimeout(() => btns[0]?.focus({ preventScroll: true }), 80);

  /** 물건 하나 보기: 글 카드(한 줄씩 넘김) */
  async function open(i) {
    if (over || card || stopped()) return;
    const s = spots[i];
    audio.sfx('page');
    const lines = (s.lines || []).map(lineOf);
    const text = h('p', { class: 'lk-text' });
    const who = h('b', { class: 'lk-who' });
    const next = h('button', { class: 'btn btn-big btn-main lk-next' }, h('i', { html: ICON('arrow_right') }), h('span', { text: '다음' }));
    card = h('section', { class: 'ov ov-look', role: 'dialog', 'aria-label': s.name },
      h('div', { class: 'lk-card' }, h('header', {}, h('i', { html: ICON(s.icon) }), h('h3', { text: s.name })), who, text, next));
    document.getElementById('layer-overlay').append(card);
    input.pushScope(card);
    requestAnimationFrame(() => card?.classList.add('is-in'));
    for (let k = 0; k < lines.length; k++) {
      const l = lines[k];
      who.textContent = l.t === 'think' ? '지은의 속마음' : '';
      text.className = `lk-text ${l.t === 'think' ? 'is-think' : ''}`;
      text.textContent = l.text;
      next.querySelector('span').textContent = k === lines.length - 1 ? '닫기' : '다음';
      setTimeout(() => next.focus({ preventScroll: true }), 40);
      tts.speak(l.text, l.t === 'think' ? 'think' : 'narr');
      await new Promise((res) => next.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); res(); }, { once: true }));
      if (stopped()) return;
    }
    tts.stop();
    // 숨은 뒷받침: 알림 없이 기록만
    if (s.seen) store.setFlag('seen', { ...(store.flag('seen') || {}), [s.seen]: true });
    looked.add(i);
    btns[i].classList.add('is-seen');
    paintCount();
    const el = card;
    card = null;
    input.popScope(el);
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(180));
    setTimeout(() => (btns[i + 1] || finish).focus({ preventScroll: true }), 60);
  }

  if (isDebug()) {
    window.__mgAuto = async () => {
      for (let i = 0; i < spots.length && !over && !stopped(); i++) {
        if (looked.has(i)) continue;
        btns[i].click();
        while (card && !stopped()) { await sleep(60); card?.querySelector('.lk-next')?.click(); }
      }
      if (!over) finish.click();
      await doneP;
    };
  }
  f.onAbort(() => { over = true; if (card) { input.popScope(card); card.remove(); card = null; } doneRes('abort'); });

  const how = await doneP;
  if (isDebug()) delete window.__mgAuto;
  f.close();
  const ms = performance.now() - t0;
  if (how === 'abort') return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms };
  await sleep(dur(150));
  return { ok: true, attempts: 1, mistakes: 0, ms, looked: looked.size, noCheer: true }; // 둘러보기는 '잘했어요' 연출 없이
}
