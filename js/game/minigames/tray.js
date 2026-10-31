/**
 * 미니게임: 쟁반 나르기 — 서두르면 쏟는다 (지은의 느리고 정확한 손 · PRD 2.2 · 숨은 장면 10, 2026-10-31 풀 버전)
 *
 *  - [누르고 걷기]를 누르는 동안 지은이 걷고, 떼면 멈춤. 계속 걸으면 쟁반이 점점 흔들리고, 멈추면 흔들림이 가라앉음.
 *  - 흔들림이 끝까지 차면 조금 흘림: "괜찮아요. 천천히 가요."(실패 없음 · 흘린 수만 기록). 도착하면 끝.
 *  - 흔들림 띠는 글자 칸(괜찮아요 · 조심 · 흔들려요)이 있어 색만으로 알리지 않음
 *  - 턴 방식(시간 제한 끄기 · 자동 스캔): [한 걸음] · [멈춰서 숨 고르기]. [보기]: 저절로 알맞게(보기로 기록)
 * 옵션: { title, items: [{ icon, name }], to: '창가 자리', steps?: 턴 방식 걸음 수(기본 8) }
 * 돌려줌: { ok, attempts: 1, mistakes(흘린 수), spills, watched, ms }
 * 자동 플레이(?debug): window.__mgAuto(흘리지 않게) · window.__mgBad(한 번 흘리게 계속 걸음)
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { renderBg } from '../../data/backgrounds.js';
import { faceHTML } from '../../data/characters.js';
import { frame, line, abortGeneration, timingOf } from './frame.js';
import { pace, loop, isDebug, startGate } from './arcade.js';

const HOWTO = '[누르고 걷기]를 누르는 동안 걸어요. 쟁반이 흔들리면 손을 떼고 멈춰요.';
const HOWTO_TURN = '[한 걸음]으로 걸어요. 쟁반이 흔들리면 [멈춰서 숨 고르기]를 눌러요.';
const WALK_MS = 7000;  // 실시간: 처음부터 끝까지 걷는 시간(멈추지 않으면)
const WOBBLE_UP = 1500; // 쉬지 않고 이만큼 걸으면 흔들림이 가득
const WOBBLE_DOWN = 900; // 멈추면 이만큼 뒤에 가라앉음
const SAY = {
  spill: '앗, 조금 흘렀어요. 괜찮아요. 천천히 가요.',
  careful: '조심! 멈춰서 숨을 골라요.',
  arrive: '도착했어요!',
  watch: '잘 봐요. 흔들리면 멈췄다가 걸어요.',
};
const LABELS = { calm: '괜찮아요', warn: '조심', shake: '흔들려요' };

export function trayLines(opts = {}) {
  const out = [...line.intro(opts.title || '쟁반 나르기', HOWTO), line.sys(HOWTO_TURN)];
  for (const t of [...Object.values(SAY), ...Object.values(LABELS)]) out.push(line.sys(t));
  if (opts.to) out.push(line.sys(`${opts.to}까지 날라요.`));
  return out;
}

export function trayProblems(opts = {}) {
  const errs = [];
  if (!(opts.items || []).length) errs.push('items(나르는 것)가 비어 있음');
  for (const [i, it] of (opts.items || []).entries()) if (!it.icon || !it.name) errs.push(`items[${i}]: icon · name 필요`);
  return errs;
}

export async function tray(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  const { turn, k } = pace();
  const title = opts.title || '쟁반 나르기';
  const items = opts.items || [{ icon: 'cup', name: '잔' }];
  const nSteps = opts.steps || 8;
  const [bgId, bgVar] = opts.bg || ['hall', 'morning'];
  const f = frame({ title, instruction: turn ? HOWTO_TURN : HOWTO, icon: 'tray', cls: 'mg-scene mg-tray' });

  let d = 0;       // 걸은 거리 0~1
  let wob = 0;     // 흔들림 0~1
  let holding = false;
  let pausedMs = 0; // 흘린 뒤 잠깐 멈춤
  let spills = 0;
  let watched = false;
  let mode = 'play';
  let over = false;
  let lastZone = 'calm';
  let tAcc = 0;
  let robot = null;
  let doneRes;
  const doneP = new Promise((res) => { doneRes = res; });

  const scene = h('div', { class: 'sc-bg', html: renderBg(bgId, bgVar) });
  const walker = h('div', { class: 'tr-walker' },
    h('div', { class: 'tr-tray' }, ...items.map((it) => h('i', { class: 'tr-item', html: ICON(it.icon) }))),
    h('span', { class: 'tr-face', html: faceHTML('jieun', 'normal') }));
  const goal = h('div', { class: 'tr-goal' }, h('i', { html: ICON('chair') }), h('span', { text: opts.to || '자리' }));
  const path = h('div', { class: 'tr-path' }, h('i', { class: 'tr-line' }), goal, walker);
  const meter = h('div', { class: 'tr-meter', role: 'meter', 'aria-label': '흔들림', 'aria-valuemin': '0', 'aria-valuemax': '100' },
    h('span', { class: 'tr-seg calm', text: LABELS.calm }), h('span', { class: 'tr-seg warn', text: LABELS.warn }), h('span', { class: 'tr-seg shake', text: LABELS.shake }),
    h('i', { class: 'tr-needle' }));
  const status = h('p', { class: 'tr-status', 'aria-live': 'polite' });
  const goB = turn ? btnOf('arrow_right', '한 걸음', 'btn-big btn-main tr-step') : btnOf('walk', '누르고 걷기', 'btn-big btn-main tr-hold');
  const restB = turn ? btnOf('stop', '멈춰서 숨 고르기', 'btn-big btn-soft tr-rest') : null;
  const watchB = btnOf('watch', '보기', 'btn-big btn-soft tr-watch');
  const ctrl = h('div', { class: 'tr-ctrl' }, goB, restB, watchB);
  f.body.append(scene, path, h('div', { class: 'tr-side' }, h('b', { text: '쟁반' }), h('p', { class: 'tr-items', text: items.map((x) => x.name).join(' · ') }), meter), h('div', { class: 'tr-foot' }, status, ctrl));
  [goB, restB, watchB].forEach((b) => { if (b) b.disabled = true; });

  function btnOf(icon, label, cls) {
    return h('button', { class: `btn ${cls}` }, h('i', { html: ICON(icon) }), h('span', { text: label }));
  }
  const zoneOf = (w) => (w < 0.6 ? 'calm' : w < 0.85 ? 'warn' : 'shake');
  const draw = () => {
    walker.style.left = `${6 + d * 76}%`;
    walker.style.setProperty('--w', wob.toFixed(3));
    meter.style.setProperty('--p', wob.toFixed(3));
    meter.setAttribute('aria-valuenow', String(Math.round(wob * 100)));
    const z = zoneOf(wob);
    meter.dataset.zone = z;
    meter.setAttribute('aria-valuetext', LABELS[z]);
    status.textContent = `흔들림: ${LABELS[z]}`;
    if (z !== lastZone) {
      if (z === 'warn' && mode === 'play') { audio.sfx('focus'); if (turn) tts.speak(SAY.careful, 'sys'); }
      lastZone = z;
    }
    walker.classList.toggle('is-walking', holding);
  };
  const spill = () => {
    spills += 1;
    wob = 0.35;
    pausedMs = 700;
    holding = false;
    goB.classList.remove('is-holding');
    audio.sfx('spill');
    walker.classList.remove('is-spill');
    void walker.offsetWidth;
    walker.classList.add('is-spill');
    tts.speak(SAY.spill, 'sys');
  };
  const arrive = async () => {
    if (over) return;
    over = true;
    holding = false;
    curLoop?.stop();
    draw();
    audio.sfx('tray');
    status.textContent = SAY.arrive;
    await tts.speak(SAY.arrive, 'sys');
    doneRes('done');
  };

  draw();
  // 자동 플레이(?debug): 시작 창보다 먼저 열어 둠(시작 창이 있으면 [시작!]부터 누름)
  const pressGate = () => path.querySelector('.mg-gate .mg-go')?.click();
  if (isDebug()) {
    window.__mgAuto = async () => { robot = 'auto'; pressGate(); await doneP; };
    window.__mgBad = async () => { robot = 'bad'; pressGate(); while (!spills && !over && !stopped()) await sleep(60); robot = 'auto'; };
  }
  let earlyAbort = false;
  f.onAbort(() => { earlyAbort = true; doneRes('abort'); });
  await Promise.race([startGate(path, { note: '천천히 해도 괜찮아요.' }), doneP]);
  if (earlyAbort || stopped()) { if (isDebug()) { delete window.__mgAuto; delete window.__mgBad; } f.close(); return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms: 0 }; }
  [goB, restB, watchB].forEach((b) => { if (b) b.disabled = false; });
  setTimeout(() => goB.focus({ preventScroll: true }), 40);

  if (turn) {
    goB.addEventListener('click', (e) => {
      e.stopPropagation();
      if (over || mode !== 'play') return;
      d = Math.min(1, d + 1 / nSteps);
      wob += 0.32;
      audio.sfx('tap');
      if (wob >= 1) spill();
      draw();
      if (d >= 1) arrive();
    });
    restB.addEventListener('click', (e) => {
      e.stopPropagation();
      if (over || mode !== 'play') return;
      wob = Math.max(0, wob - 0.55);
      audio.sfx('focus');
      draw();
    });
  } else {
    const press = (e) => { e?.preventDefault?.(); if (over || mode !== 'play' || pausedMs > 0) return; holding = true; goB.classList.add('is-holding'); };
    const release = () => { holding = false; goB.classList.remove('is-holding'); };
    goB.addEventListener('pointerdown', (e) => { e.stopPropagation(); goB.setPointerCapture?.(e.pointerId); press(e); });
    goB.addEventListener('pointerup', (e) => { e.stopPropagation(); release(); });
    goB.addEventListener('pointercancel', release);
    goB.addEventListener('lostpointercapture', release);
    goB.addEventListener('blur', release);
    goB.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); e.stopPropagation(); press(); } });
    goB.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); release(); } });
    goB.addEventListener('click', (e) => e.stopPropagation());
    goB.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  watchB.addEventListener('click', (e) => {
    e.stopPropagation();
    if (over || mode !== 'play') return;
    mode = 'watch';
    watched = true;
    holding = false;
    tts.speak(SAY.watch, 'sys');
    [goB, restB, watchB].forEach((b) => { if (b) b.disabled = true; });
  });

  // 실시간 고리(턴 방식에서도 [보기] · 자동 플레이 · 흔들림 가라앉기에 씀)
  const curLoop = loop((dt) => {
    if (over) return;
    tAcc += dt;
    walker.style.setProperty('--t', String((tAcc / 1000).toFixed(2)));
    if (pausedMs > 0) { pausedMs -= dt; draw(); return; }
    // [보기] · 자동 플레이: 흔들림이 조심 칸 앞에서 멈추고, 가라앉으면 다시 걸음
    const auto = mode === 'watch' || robot;
    if (auto && !turn) {
      if (robot === 'bad') holding = true;
      else if (holding && wob >= 0.5) holding = false;
      else if (!holding && wob <= 0.08) holding = true;
    }
    if (auto && turn) {
      if (robot === 'bad' || wob <= 0.4) { d = Math.min(1, d + dt / (WALK_MS * 0.6)); wob = Math.min(1, wob + dt / (WOBBLE_UP * 1.4)); if (wob >= 1) spill(); } else wob = Math.max(0, wob - dt / WOBBLE_DOWN);
      draw();
      if (d >= 1) arrive();
      return;
    }
    if (!turn) {
      if (holding) {
        d = Math.min(1, d + dt / (WALK_MS * k));
        wob = Math.min(1, wob + dt / ((WOBBLE_UP * k) / timingOf(opts).tray)); // 가을부터 조금 빨리 흔들림(frame.js TIMING)
        if (wob >= 1) spill();
      } else wob = Math.max(0, wob - dt / (WOBBLE_DOWN * k));
      draw();
      if (d >= 1) arrive();
    }
  }, () => (robot ? 3 : 1));

  f.onAbort(() => { over = true; curLoop.stop(); doneRes('abort'); });

  const how = await doneP;
  curLoop.stop();
  if (isDebug()) { delete window.__mgAuto; delete window.__mgBad; }
  f.close();
  const ms = performance.now() - t0;
  if (how === 'abort') return { ok: false, aborted: true, attempts: 0, mistakes: spills, ms };
  await sleep(dur(150));
  return { ok: true, attempts: 1, mistakes: spills, spills, watched: watched ? 1 : 0, ms };
}
