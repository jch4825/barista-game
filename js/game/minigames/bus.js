/**
 * 미니게임: 바닷가로 가는 버스(재미 개편 7장 · 봄 1일, 2026-11-01) — 도시의 몰림(rush city) 뒤의 느긋한 놀이
 *  - 버스 창밖으로 바다 풍경이 흘러가요. 지나가는 갈매기 · 고깃배 · 등대 · 뛰어오르는 물고기를 눌러서 세요(세기만, 틀림 없음).
 *  - 가끔 버스가 덜컹해요. "덜컹!" 소리가 나면 [손잡이 잡기]. 못 잡으면 지은의 가방이 데굴데굴(웃음, 감점 없음).
 *  - 끝나면 본 것을 말해 줘요. 실시간이 아니면 턴 방식: [다음 풍경]을 누를 때마다 하나씩 지나감
 *  - 움직임 줄이기: 흔들림 없이, 풍경은 미끄러지지 않고 제자리에 나타났다 사라짐
 * 옵션: { title, seconds?, quit? } · 돌려줌: { ok, attempts: 1, mistakes: 0, seen: { gull, boat, … }, held, ms }
 */

import { h, sleep, dur, isReducedMotion } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { frame, line, abortGeneration, abortMinigame } from './frame.js';
import { pace, loop, isDebug, startGate, popText } from './arcade.js';
import { bus as evBus } from '../../core/bus.js';

const TITLE = '바닷가로 가는 버스';
const HOWTO = '창밖으로 지나가는 것을 눌러서 세어요. "덜컹!" 하면 [손잡이 잡기]를 눌러요.';
const SAY = {
  start: '버스가 바닷가 마을로 달려요. 창밖을 봐요.',
  bump: '덜컹!',
  held: '잘 잡았어요!',
  bag: '앗, 가방이 데굴데굴…',
  end: '바다 냄새가 나요. 곧 내릴 정류장이에요.',
};
// 지나가는 것: 그림(SVG) · 이름 · 세는 말
const SIGHTS = {
  gull: { name: '갈매기', unit: '마리', y: [18, 34], svg: '<svg viewBox="0 0 120 60"><path d="M6 34 q26 -28 54 0 q28 -28 54 0" fill="none" stroke="#3D4650" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>' },
  boat: { name: '고깃배', unit: '척', y: [56, 60], svg: '<svg viewBox="0 0 140 90"><path d="M10 56 h120 l-18 26 h-84z" fill="#C8553D" stroke="#5A2A1E" stroke-width="4"/><rect x="52" y="24" width="38" height="32" fill="#F4EAD2" stroke="#5A2A1E" stroke-width="4"/><path d="M70 6 v18" stroke="#5A2A1E" stroke-width="4"/><path d="M70 8 l22 8 -22 6z" fill="#2E9C5A"/></svg>' },
  lighthouse: { name: '등대', unit: '개', y: [40, 44], svg: '<svg viewBox="0 0 80 140"><path d="M28 30 h24 l8 100 h-40z" fill="#fff" stroke="#55585C" stroke-width="4"/><path d="M26 64 h28 M24 96 h32" stroke="#C8553D" stroke-width="12"/><rect x="26" y="12" width="28" height="20" fill="#FFE08A" stroke="#55585C" stroke-width="4"/><path d="M24 12 l16 -10 16 10z" fill="#C8553D" stroke="#55585C" stroke-width="3"/></svg>' },
  fish: { name: '물고기', unit: '마리', y: [58, 64], svg: '<svg viewBox="0 0 110 70"><path d="M14 35 q34 -30 70 0 q-36 30 -70 0z" fill="#7FB3D5" stroke="#2F5D7A" stroke-width="4"/><path d="M84 35 l20 -16 v32z" fill="#7FB3D5" stroke="#2F5D7A" stroke-width="4" stroke-linejoin="round"/><circle cx="34" cy="31" r="4" fill="#222"/></svg>' },
};
const ORDER = ['gull', 'boat', 'gull', 'fish', 'lighthouse', 'gull', 'boat', 'fish', 'gull'];

export function busLines(opts = {}) {
  const out = [...line.intro(opts.title || TITLE, HOWTO), ...Object.values(SAY).map(line.sys)];
  for (const s of Object.values(SIGHTS)) for (let n = 1; n <= 5; n++) out.push(line.sys(`${s.name} ${n}`));
  return out;
}
export function busProblems() { return []; }

export async function bus(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  const title = opts.title || TITLE;
  const { turn, k } = pace();
  const still = isReducedMotion();
  const f = frame({ title, instruction: HOWTO, icon: 'bus', cls: `mg-scene mg-bus${still ? ' is-still' : ''}`, quit: Boolean(opts.quit) });

  let over = false;
  let started = false;
  let auto = false;
  // 버스 안 엔진 소리(환경음 bus). 끝나면 앞의 환경음으로 돌림
  const ambBefore = audio.state();
  audio.ambience('bus');
  const ambBack = () => audio.ambience(ambBefore.ambience, ambBefore.ambLevel);
  let held = 0;
  const seen = Object.fromEntries(Object.keys(SIGHTS).map((id) => [id, 0]));
  let doneRes;
  const doneP = new Promise((r) => { doneRes = r; });

  // 창밖: 하늘 · 먼 산 · 바다(움직이는 층) + 창틀 · 손잡이 · 지은의 가방
  const view = h('div', { class: 'bs-view' }, h('i', { class: 'bs-sky' }), h('i', { class: 'bs-hills' }), h('i', { class: 'bs-sea' }), h('i', { class: 'bs-road' }));
  const lane = h('div', { class: 'bs-lane', role: 'group', 'aria-label': '창밖 풍경' });
  const frameEl = h('i', { class: 'bs-window', 'aria-hidden': 'true' });
  const bag = h('i', { class: 'bs-bag', 'aria-hidden': 'true', html: ICON('bag') });
  const strap = h('button', { class: 'btn btn-big btn-main bs-strap' }, h('i', { html: ICON('hand') }), h('span', { text: '손잡이 잡기' }));
  const nextB = turn ? h('button', { class: 'btn btn-big btn-soft bs-next' }, h('i', { html: ICON('arrow_right') }), h('span', { text: '다음 풍경' })) : null;
  const tally = h('p', { class: 'bs-tally', 'aria-live': 'polite' });
  f.body.append(h('div', { class: 'bs-scene' }, view, lane, frameEl, bag), h('div', { class: 'bs-foot' }, tally, nextB, strap));
  strap.disabled = true;

  const paint = () => {
    const parts = Object.entries(seen).filter(([, n]) => n).map(([id, n]) => `${SIGHTS[id].name} ${n}${SIGHTS[id].unit}`);
    tally.textContent = parts.length ? `본 것: ${parts.join(' · ')}` : '창밖을 봐요. 지나가는 것을 눌러요.';
  };

  /* ---- 지나가는 것 ---- */
  let orderI = 0;
  const flying = new Set();
  function addSight() {
    const id = ORDER[orderI % ORDER.length];
    orderI += 1;
    const s = SIGHTS[id];
    const y = s.y[0] + Math.random() * (s.y[1] - s.y[0]);
    const b = h('button', { class: `bs-sight s-${id}${turn ? ' is-hold' : ''}`, style: { top: `${y}%`, '--dur': `${(6200 * k) / 1000}s` }, 'aria-label': s.name, html: s.svg });
    const it = { b, id, t: 0 };
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!started || over || b.disabled) return;
      b.disabled = true;
      seen[id] += 1;
      audio.sfx('pos');
      const r = b.getBoundingClientRect();
      const lr = lane.getBoundingClientRect();
      const kk = lane.offsetWidth ? lr.width / lane.offsetWidth : 1;
      popText(lane, `${s.name} ${seen[id]}!`, (r.left + r.width / 2 - lr.left) / kk, (r.top - lr.top) / kk);
      tts.speak(`${s.name} ${seen[id]}`, 'sys');
      b.classList.add('is-got');
      paint();
      if (turn) setTimeout(() => nextB?.focus({ preventScroll: true }), 40);
    });
    lane.append(b);
    flying.add(it);
    if (turn) setTimeout(() => b.focus({ preventScroll: true }), 40);
    return it;
  }
  function dropSight(it) {
    flying.delete(it);
    it.b.remove();
  }

  /* ---- 덜컹 ---- */
  let bumpOn = false;
  let bumpT = 0;
  function bumpStart() {
    bumpOn = true;
    bumpT = 0;
    strap.disabled = false;
    strap.classList.add('is-ready');
    audio.sfx('bump');
    f.el.classList.remove('is-bump');
    void f.el.offsetWidth;
    if (!still) f.el.classList.add('is-bump');
    tts.speak(SAY.bump, 'sys');
    setTimeout(() => { if (strap.isConnected && !strap.disabled) strap.focus({ preventScroll: true }); }, 40);
  }
  function bumpEnd(ok) {
    if (!bumpOn) return;
    bumpOn = false;
    strap.disabled = true;
    strap.classList.remove('is-ready');
    if (ok) {
      held += 1;
      audio.sfx('good');
      tts.speak(SAY.held, 'sys');
    } else {
      audio.sfx('slip');
      bag.classList.remove('is-roll');
      void bag.offsetWidth;
      bag.classList.add('is-roll');
      tts.speak(SAY.bag, 'sys');
    }
  }
  strap.addEventListener('click', (e) => { e.stopPropagation(); if (bumpOn) bumpEnd(true); });

  /* ---- 시간 ---- */
  const total = (opts.seconds || 38) * 1000 * k;
  let tAcc = 0;
  let sightIn = 400;
  let nextBump = 7000 * k;
  function step(dt) {
    if (over || !started) return;
    tAcc += dt;
    sightIn -= dt;
    if (sightIn <= 0) { addSight(); sightIn = (2600 + Math.random() * 1400) * k; }
    for (const it of [...flying]) {
      it.t += dt;
      if (auto && !it.b.disabled && it.t > 1200) it.b.click();
      if (it.t >= 6400 * k) dropSight(it);
    }
    nextBump -= dt;
    if (!bumpOn && nextBump <= 0 && tAcc < total - 3000) { bumpStart(); nextBump = (7500 + Math.random() * 3000) * k; }
    if (bumpOn) {
      bumpT += dt;
      if (auto && bumpT > 300) bumpEnd(true);
      if (bumpT >= 1800 * k) bumpEnd(false);
    }
    if (tAcc >= total) finish();
  }

  // 턴 방식: [다음 풍경]마다 하나씩 지나감, 세 번째마다 덜컹(손잡이를 잡을 때까지 기다림)
  let turnN = 0;
  let curTurn = null;
  nextB?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!started || over || bumpOn) return;
    if (curTurn) dropSight(curTurn);
    turnN += 1;
    if (turnN > ORDER.length) { finish(); return; }
    curTurn = addSight();
    if (turnN % 3 === 0) bumpStart();
  });
  if (turn) strap.addEventListener('click', () => setTimeout(() => nextB?.focus({ preventScroll: true }), 40));

  async function finish() {
    if (over) return;
    over = true;
    curLoop?.stop();
    if (bumpOn) bumpEnd(true);
    strap.disabled = true;
    if (nextB) nextB.disabled = true;
    for (const it of flying) it.b.disabled = true;
    const parts = Object.entries(seen).filter(([, n]) => n).map(([id, n]) => `${SIGHTS[id].name} ${n}${SIGHTS[id].unit}`);
    const text = parts.length ? `${parts.join(', ')}를 봤어요. ${SAY.end}` : SAY.end;
    tally.textContent = text;
    audio.sfx('bus'); // 브레이크 → 손 브레이크: 정류장에 섬
    await Promise.race([Promise.all([tts.speak(text, 'sys'), sleep(dur(900))]), sleep(9000)]);
    doneRes('done');
  }

  let curLoop = null;
  if (isDebug()) window.__mgAuto = async () => { auto = true; f.el.querySelector('.mg-gate .mg-go')?.click(); await doneP; };
  const offQuit = opts.quit ? evBus.on('mg:quit', () => { over = true; doneRes('quit'); abortMinigame(); }) : null;
  f.onAbort(() => { over = true; curLoop?.stop(); doneRes('abort'); });

  paint();
  tts.speak(SAY.start, 'sys');
  await Promise.race([startGate(f.body, { note: turn ? '[다음 풍경]을 누를 때마다 하나씩 지나가요.' : '천천히 봐도 괜찮아요.' }), doneP]);
  if (!stopped() && !over) {
    started = true;
    if (turn) {
      nextB.focus({ preventScroll: true });
      if (auto) {
        (async () => {
          while (!over && !stopped()) {
            await sleep(90);
            if (bumpOn) strap.click();
            else if (curTurn && !curTurn.b.disabled) curTurn.b.click();
            else nextB.click();
          }
        })();
      }
    } else curLoop = loop(step, () => (auto ? 4 : 1));
  }
  const how = await doneP;
  offQuit?.();
  curLoop?.stop();
  ambBack();
  if (isDebug()) delete window.__mgAuto;
  f.close();
  const ms = performance.now() - t0;
  if (how === 'abort') return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms };
  if (how === 'quit') return { ok: false, quit: true, attempts: 1, mistakes: 0, ms };
  await sleep(dur(150));
  return { ok: true, attempts: 1, mistakes: 0, seen, held, ms };
}
