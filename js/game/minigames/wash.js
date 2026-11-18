/**
 * 미니게임: 설거지 — 하루를 마치기 전, 오늘 쓴 머그를 씻어요(2026-11-18 사용자 "매일 종료 전 설거지하는 미니 게임 넣기, 이 때 미니 게임은 블랜더로 제작하고,
 * 입이 닿는 곳과 안쪽 중심으로 씻는 활동 만들기")
 *
 *  - 개수대의 머그를 위에서 본 블렌더 한 컷(tools/blender/scene_bench.py … wash → wash_post.py → assets/shots/wash_mug_* · wash.json).
 *  - 닦을 곳은 둘: 입이 닿는 곳(테두리 · 그 아래 안쪽의 입술 자국) · 안쪽 가운데(바닥에 마른 커피 고리와 막). 차례는 자유.
 *    그림 속 그 자리(테두리의 고리 · 바닥의 동그라미)가 곧 단추(장면 밖 단추 없음: 2026-11-12 사용자 "이런 게임에선 외부 버튼은 독이다").
 *  - 터치 기반(기본): 그 자리를 꾹 누르고 있으면 수세미가 저절로 돌며 닦음(작업대 원 그리기와 같은 규칙).
 *    드래그 활용: 수세미를 그 자리에서 문질러야 닦임(움직인 만큼). 턴 방식: 톡 = 한 번 문지르기(다섯 번이면 깨끗).
 *    키보드 · 스캔: 그 자리 단추에서 Space · Enter 를 누르고 있기(턴 방식은 한 번 누를 때마다 한 번).
 *  - 얼룩은 5단계로 조각조각 지워지고, 문지를수록 거품이 남. 두 곳이 다 깨끗해지면 수도꼭지(그림 위 단추)를 눌러 헹굼 → 반짝.
 *    다 닦기 전에 수도꼭지를 누르면 아직 닦을 곳을 알려 줌(감점 없음, 선생님 화면 비고 '먼저 누른 수도꼭지').
 *  - [보기]: 수세미가 알아서 두 곳을 닦고 헹구는 것을 보여 줌(보기로 기록).
 *  - 움직임 줄이기 · 차분 모드: 수세미가 돌지 않고 그 자리에 놓임, 반짝임 · 고리의 깜빡임 없음.
 * 옵션: { title?, quit? } · 돌려줌: { ok, attempts: 1, mistakes: 0, watched, turn, early, noCheer: true, ms }
 * 자동 플레이(?debug): window.__mgAuto(끝까지) · window.__mgBad(다 닦기 전에 수도꼭지를 한 번 누른 뒤 끝까지)
 */

import { h, sleep, dur, isReducedMotion } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { store } from '../../core/store.js';
import { img } from '../../core/assets.js';
import { frame, line, abortGeneration, timingOf } from './frame.js';
import { pace, loop, isDebug, startGate, popText } from './arcade.js';
import * as grow from '../../core/grow.js';
import { attachTrail } from '../../ui/trail.js';

const TITLE = '마감 설거지';
const HOWTO = '입이 닿는 곳과 안쪽 가운데를 꾹 누르고 있으면 수세미로 닦아요. 다 닦으면 수도꼭지를 눌러 헹궈요.';
const HOWTO_DRAG = '수세미로 입이 닿는 곳과 안쪽 가운데를 문질러 닦아요. 다 닦으면 수도꼭지를 눌러 헹궈요.';
const HOWTO_TURN = '입이 닿는 곳과 안쪽 가운데를 톡톡 눌러 닦아요. 다 닦으면 수도꼭지를 눌러 헹궈요.';
const ZONES = {
  rim: { name: '입이 닿는 곳', done: '입이 닿는 곳이 깨끗해요.' },
  in: { name: '안쪽 가운데', done: '안쪽 가운데가 깨끗해요.' },
};
const SAY = {
  rinse: '이제 수도꼭지를 눌러 거품을 헹궈요.',
  early: '아직 닦을 곳이 남았어요. 반짝이는 곳을 먼저 닦아요.',
  done: '깨끗해요! 내일 아침에도 이 잔으로 기분 좋게 마실 수 있어요.',
  watch: '잘 봐요. 입이 닿는 곳을 빙 둘러 닦고, 안쪽 가운데를 동글동글 닦아요.',
};
const LEVELS = 5;           // 얼룩 단계(블렌더 그림 wash_mug_{rim|in}_l1 ~ l5)
const SCRUB_MS = 2600;      // 꾹 누르고 있을 때 한 곳을 다 닦는 시간(× 빠르기 k)
const LAP_MS = 900;         // 수세미가 한 바퀴 도는 시간
const RINSE_MS = 2000;      // 헹구는 시간
const TURN_STEP = 1 / LEVELS; // 턴 방식: 한 번 문지르기
const DRAG_PER = 3.2;       // 드래그 활용: 그 자리 둘레(타원 지름의 몇 배)만큼 문지르면 다 닦임

/** 블렌더 그림의 자리(assets/shots/wash.json, tools/blender/wash_post.py). 없으면 null(임시 그림) */
let washMeta = null;
const metaP = fetch('./assets/shots/wash.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({})).then((m) => { washMeta = m; return m; });

export function washLines(opts = {}) {
  const title = opts.title || TITLE;
  const out = [...line.intro(title, HOWTO), ...line.intro(title, HOWTO_DRAG), ...line.intro(title, HOWTO_TURN)];
  for (const z of Object.values(ZONES)) out.push(line.sys(z.done));
  for (const t of Object.values(SAY)) out.push(line.sys(t));
  return out;
}
export function washProblems() { return []; }

export async function wash(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  const { turn, k } = pace();
  const drag = !turn && store.settings().control === 'drag';
  const still = isReducedMotion();
  const title = opts.title || TITLE;
  const howto = turn ? HOWTO_TURN : drag ? HOWTO_DRAG : HOWTO;
  const f = frame({ title, instruction: howto, icon: 'cup', cls: `mg-scene mg-wash${still ? ' is-still' : ''}`, quit: Boolean(opts.quit), kind: 'wash', opts });
  const ws = timingOf(opts).week; // 주가 바뀔수록 살짝 빨라짐: 수세미가 도는 빠르기 · 닦이는 빠르기
  const meta = (await Promise.race([metaP, sleep(1500)]))?.mug || null;
  const art = meta && img.has('shots', meta.plate) ? meta : null;
  const [W, H] = art ? art.size : [1920, 1080];
  const geo = art || FALLBACK;

  const dirt = { rim: 1, in: 1 };   // 남은 얼룩 0 ~ 1
  const foam = { rim: 0, in: 0 };   // 거품 0 ~ 3
  let active = null;   // 지금 닦는 곳
  let holding = false;
  let angle = 0;       // 수세미가 도는 각
  let over = false;
  let rinsing = false;
  let rinsed = false;
  let watched = false;
  let early = 0;
  let robot = null;    // 'watch' · 'auto' · 'bad'
  let wipeAt = 0;
  let doneRes;
  const doneP = new Promise((res) => { doneRes = res; });

  /* ---- 그림: 배경판(판 크기 W × H 를 칸에 꽉 차게) + 얼룩 · 거품 · 물줄기 · 수세미 ---- */
  const pct = (a, b) => `${(a / b) * 100}%`;
  const place = (el, [x, y, w, hh]) => Object.assign(el.style, { left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(hh, H) });
  const layer = (id, rect, cls = '') => {
    if (!art || !rect || !img.has('shots', id)) return null;
    const el = h('img', { class: `ws-layer ${cls}`.trim(), src: img.url('shots', id), alt: '', draggable: 'false', 'aria-hidden': 'true' });
    place(el, rect);
    el.hidden = true;
    return el;
  };
  const box = h('div', { class: 'ws-box' });
  if (art) box.append(h('img', { class: 'ws-plate', src: img.url('shots', art.plate), alt: '', draggable: 'false' }));
  else box.innerHTML = fallbackSVG();
  const stains = { rim: [], in: [] };
  const foams = { rim: [], in: [] };
  for (const z of ['rim', 'in']) {
    for (let lv = 1; lv <= LEVELS; lv++) stains[z][lv] = layer(`wash_mug_${z}_l${lv}`, art?.stain?.[z]?.[lv]);
    for (let a = 1; a <= 3; a++) foams[z][a] = layer(`wash_mug_foam_${z}_${a}`, art?.foam?.[z]?.[a], 'ws-foam');
  }
  const streams = [0, 1].map((i) => layer(`wash_mug_rinse_${i}`, art?.rinse?.[i], 'ws-stream'));
  for (const el of [...stains.rim, ...stains.in, ...foams.rim, ...foams.in, ...streams]) if (el) box.append(el);
  // 수세미: 놓인 자리(그림) → 닦을 때 그 자리로 옮겨 돎
  const sponge = h('span', { class: 'ws-sponge', 'aria-hidden': 'true' });
  const sp = art?.sponge && img.has('shots', 'wash_mug_sponge') ? art.sponge : null;
  if (sp) sponge.append(h('img', { src: img.url('shots', 'wash_mug_sponge'), alt: '', draggable: 'false' }));
  else sponge.classList.add('is-svg');
  const spW = sp ? sp[2] : 170;
  const spH = sp ? sp[3] : 130;
  const home = sp ? [sp[0] + sp[2] / 2, sp[1] + sp[3] / 2] : [geo.rim.cx - geo.rim.rx - 160, geo.rim.cy + 60];
  Object.assign(sponge.style, { width: pct(spW, W), height: pct(spH, H) });
  const spongeAt = ([x, y], tilt = 0, scrubbing = true) => {
    sponge.classList.toggle('is-scrub', scrubbing);
    sponge.style.left = pct(x - spW / 2, W);
    sponge.style.top = pct(y - spH / 2, H);
    sponge.style.setProperty('--r', `${tilt.toFixed(1)}deg`);
  };
  spongeAt(home, 0, false);
  box.append(sponge);

  // 닦을 곳 = 단추(그림 속 테두리의 고리 · 바닥의 동그라미). 안쪽 가운데가 위(테두리 고리 안쪽을 누르면 안쪽 가운데)
  const ell = (e, grow_ = 0) => [e.cx - e.rx - grow_, e.cy - e.ry - grow_, (e.rx + grow_) * 2, (e.ry + grow_) * 2];
  const zoneBtn = (z) => {
    const e = z === 'rim' ? geo.rim : geo.inside;
    const b = h('button', { class: `ws-zone is-${z}`, 'aria-label': `${ZONES[z].name} 닦기` },
      h('span', { class: 'ws-ring', 'aria-hidden': 'true' }),
      h('span', { class: 'ws-tag' }, h('span', { text: ZONES[z].name })));
    place(b, ell(e, z === 'rim' ? 22 : 8));
    return b;
  };
  const zb = { rim: zoneBtn('rim'), in: zoneBtn('in') };
  // 수도꼭지(그림 위쪽의 꼭지 · 손잡이): 다 닦은 뒤 헹굼
  const tapAt = geo.tap || [geo.rim.cx + 160, 70]; // 판 위쪽에 보이는 수도꼭지 밑동
  const tapB = h('button', { class: 'ws-tap', 'aria-label': '수도꼭지 틀어 헹구기', 'aria-disabled': 'true' },
    h('span', { class: 'ws-ring', 'aria-hidden': 'true' }), h('span', { class: 'ws-tag' }, h('span', { text: '수도꼭지' })));
  place(tapB, [tapAt[0] - 95, Math.max(32, tapAt[1] - 70), 190, 170]);
  const watchB = h('button', { class: 'ws-watch', 'aria-label': '보기: 닦는 것을 보여 줘요' }, h('i', { html: ICON('watch') }), h('span', { text: '보기' }));
  box.append(zb.rim, zb.in, tapB);
  const status = h('p', { class: 'ws-status', 'aria-live': 'polite' });
  const scene = h('div', { class: 'ws-scene' }, box);
  f.body.append(scene, watchB, status);
  // 닦을 곳을 누른 채 문지르면 손가락 뒤를 따라오는 흐르는 선(2026-11-18 사용자, js/ui/trail.js): 흰 머그 위에서도 보이게 비눗물빛 파랑 + 짙은 물빛 번짐
  const trail = attachTrail(scene, { color: '96, 196, 255', glow: '20, 96, 170', when: (e) => Boolean(e.target.closest?.('.ws-zone')) });
  [zb.rim, zb.in, tapB, watchB].forEach((b) => { b.disabled = true; });

  // 칸에 꽉 차게(위아래가 조금 잘림): 판 좌표 % 가 늘 그림과 맞음
  const fit = () => {
    const s = Math.max(scene.clientWidth / W, scene.clientHeight / H) || 1;
    box.style.width = `${W * s}px`;
    box.style.height = `${H * s}px`;
  };
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
  ro?.observe(scene);
  fit();

  /* ---- 그리기 ---- */
  const levelOf = (z) => Math.ceil(dirt[z] * LEVELS - 1e-6);
  const draw = () => {
    for (const z of ['rim', 'in']) {
      const lv = levelOf(z);
      stains[z].forEach((el, i) => { if (el) el.hidden = i !== lv; });
      foams[z].forEach((el, i) => { if (el) el.hidden = !(i && i <= foam[z]); });
      zb[z].classList.toggle('is-clean', dirt[z] <= 0);
      zb[z].classList.toggle('is-on', active === z && holding);
      zb[z].setAttribute('aria-label', dirt[z] <= 0 ? `${ZONES[z].name}: 깨끗해요` : `${ZONES[z].name} 닦기`);
      zb[z].style.setProperty('--d', dirt[z].toFixed(3));
      if (!art) fallbackDraw(box, z, dirt[z], foam[z]);
    }
    const ready = dirt.rim <= 0 && dirt.in <= 0;
    tapB.classList.toggle('is-ready', ready && !rinsed);
    tapB.setAttribute('aria-disabled', String(!ready || rinsed));
    status.textContent = rinsed ? '깨끗해요!' : ready ? '수도꼭지를 눌러 헹궈요' : `닦을 곳: ${['rim', 'in'].filter((z) => dirt[z] > 0).map((z) => ZONES[z].name).join(' · ')}`;
  };

  /* ---- 닦기 ---- */
  const zoneCenter = (z) => (z === 'rim' ? [geo.rim.cx, geo.rim.cy] : [geo.inside.cx, geo.inside.cy]);
  const spongeOn = (z, a) => {
    if (still) { spongeAt(z === 'rim' ? [geo.rim.cx - geo.rim.rx * 0.9, geo.rim.cy] : zoneCenter(z), 0); return; } // 움직임 줄이기: 돌지 않고 테두리 왼쪽에(위쪽이면 이름표를 가림)
    if (z === 'rim') spongeAt([geo.rim.cx + Math.cos(a) * geo.rim.rx * 0.93, geo.rim.cy + Math.sin(a) * geo.rim.ry * 0.93], (a * 180) / Math.PI + 90);
    else spongeAt([geo.inside.cx + Math.cos(a) * geo.inside.rx * 0.42, geo.inside.cy + Math.sin(a) * geo.inside.ry * 0.42], Math.sin(a) * 18);
  };
  const scrub = (z, amount) => {
    if (dirt[z] <= 0 || rinsing) return;
    const before = levelOf(z);
    dirt[z] = Math.max(0, dirt[z] - amount);
    foam[z] = Math.max(foam[z], Math.min(3, Math.ceil((1 - dirt[z]) * 3 + 0.01)));
    const now = performance.now();
    if (now - wipeAt > 420) { audio.sfx('wipe'); wipeAt = now; }
    if (levelOf(z) < before && levelOf(z) > 0) audio.sfx('bubbles');
    if (dirt[z] <= 0) cleaned(z);
    draw();
  };
  const cleaned = (z) => {
    holding = false;
    active = null;
    audio.sfx('great');
    const [x, y] = zoneCenter(z);
    const r = box.getBoundingClientRect();
    popText(f.body, '뽀득!', ((x / W) * r.width + r.left - f.body.getBoundingClientRect().left), ((y / H) * r.height + r.top - f.body.getBoundingClientRect().top) - 40, 'big');
    tts.speak(ZONES[z].done, 'sys');
    setTimeout(() => { if (!active) spongeAt(home, 0, false); }, dur(500));
    if (dirt.rim <= 0 && dirt.in <= 0) setTimeout(() => { if (!over && !rinsed) { tts.speak(SAY.rinse, 'sys'); if (!robot) tapB.focus({ preventScroll: true }); } }, dur(900));
    else { const next = dirt.rim > 0 ? 'rim' : 'in'; if (!robot) zb[next].focus({ preventScroll: true }); }
  };
  const press = (z) => {
    if (over || rinsing || dirt[z] <= 0 || robot === 'watch') return;
    active = z;
    holding = true;
    spongeOn(z, angle);
    draw();
  };
  const release = () => { if (!holding) return; holding = false; draw(); };

  /* ---- 헹구기 ---- */
  const rinse = async () => {
    if (over || rinsing || rinsed) return;
    if (dirt.rim > 0 || dirt.in > 0) {
      early += 1;
      audio.sfx('tap');
      tts.speak(SAY.early, 'sys');
      for (const z of ['rim', 'in']) if (dirt[z] > 0) { zb[z].classList.remove('is-nudge'); void zb[z].offsetWidth; zb[z].classList.add('is-nudge'); }
      return;
    }
    rinsing = true;
    holding = false;
    active = null;
    spongeAt(home, 0, false);
    tapB.classList.remove('is-ready');
    status.textContent = '헹구는 중…';
    audio.sfx('water');
    box.classList.add('is-rinsing');
    let i = 0;
    const flick = setInterval(() => { streams.forEach((el, j) => { if (el) el.hidden = j !== i % 2; }); i += 1; }, still ? 400 : 110);
    if (!art) box.classList.add('is-rinse-svg');
    await sleep(dur(RINSE_MS * (robot ? 0.4 : 1)));
    clearInterval(flick);
    streams.forEach((el) => { if (el) el.hidden = true; });
    foam.rim = 0;
    foam.in = 0;
    rinsing = false;
    rinsed = true;
    box.classList.remove('is-rinsing', 'is-rinse-svg');
    box.classList.add('is-shine');
    draw();
    audio.sfx('pang');
    const r = box.getBoundingClientRect();
    const fb = f.body.getBoundingClientRect();
    popText(f.body, '반짝!', (geo.rim.cx / W) * r.width + r.left - fb.left, (geo.rim.cy / H) * r.height + r.top - fb.top - geo.rim.ry * (r.height / H), 'big');
    over = true;
    await Promise.race([Promise.all([tts.speak(SAY.done, 'sys'), sleep(dur(1400))]), sleep(9000)]); // 말이 멈춰도 닫힘
    doneRes('done');
  };

  /* ---- 시작 ---- */
  draw();
  const pressGate = () => f.body.querySelector('.mg-gate .mg-go')?.click();
  if (isDebug()) {
    window.__mgAuto = async () => { robot = 'auto'; pressGate(); await doneP; };
    window.__mgBad = async () => { pressGate(); await sleep(80); [zb.rim, zb.in, tapB].forEach((b) => { b.disabled = false; }); rinse(); robot = 'auto'; };
  }
  let earlyAbort = false;
  f.onAbort(() => { earlyAbort = true; over = true; doneRes('abort'); });
  await Promise.race([startGate(f.body, { note: '천천히 닦아도 괜찮아요.', ready: f.told, quick: f.familiar }), doneP]);
  if (earlyAbort || stopped()) { cleanup(); f.close(); return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms: 0 }; }
  [zb.rim, zb.in, tapB, watchB].forEach((b) => { b.disabled = false; });
  if (!robot) setTimeout(() => zb.rim.focus({ preventScroll: true }), 40);

  for (const z of ['rim', 'in']) {
    const b = zb[z];
    if (turn) {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (over || rinsing || dirt[z] <= 0 || robot === 'watch') return;
        active = z;
        spongeOn(z, angle);
        angle += Math.PI * 0.9;
        scrub(z, TURN_STEP + 0.001);
        setTimeout(() => { if (active === z) { spongeOn(z, angle); } }, dur(160));
      });
      continue;
    }
    let pid = null;
    let last = null; // 드래그 활용: 지난 손가락 자리(판 좌표)
    const toPlate = (e) => { const r = box.getBoundingClientRect(); return [((e.clientX - r.left) / (r.width || 1)) * W, ((e.clientY - r.top) / (r.height || 1)) * H]; };
    b.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || pid !== null) return;
      e.stopPropagation();
      e.preventDefault();
      pid = e.pointerId;
      b.setPointerCapture?.(e.pointerId);
      press(z);
      if (drag) { last = toPlate(e); spongeAt(last); }
    });
    b.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== pid || !last || active !== z) return;
      const p = toPlate(e);
      const d = Math.hypot(p[0] - last[0], p[1] - last[1]);
      last = p;
      spongeAt(p, (p[0] - home[0]) * 0.02);
      const e_ = z === 'rim' ? geo.rim : geo.inside;
      scrub(z, d / ((e_.rx + e_.ry) * DRAG_PER * k));
    });
    const up = (e) => { if (e.pointerId !== pid) return; pid = null; last = null; release(); };
    b.addEventListener('pointerup', up);
    b.addEventListener('pointercancel', up);
    b.addEventListener('lostpointercapture', up);
    b.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); e.stopPropagation(); press(z); } });
    b.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); release(); } });
    b.addEventListener('blur', release);
    b.addEventListener('click', (e) => e.stopPropagation());
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  tapB.addEventListener('click', (e) => { e.stopPropagation(); rinse(); });
  watchB.addEventListener('click', (e) => {
    e.stopPropagation();
    if (over || rinsing || robot) return;
    robot = 'watch';
    watched = true;
    holding = false;
    [zb.rim, zb.in, tapB, watchB].forEach((b) => { b.disabled = true; });
    tts.speak(SAY.watch, 'sys');
  });

  // 고리: 누르고 있는 동안 닦임 · 수세미가 돎 · 보기 · 자동 플레이
  const curLoop = loop((dt) => {
    if (over || rinsing) return;
    if (robot) {
      const z = dirt.rim > 0 ? 'rim' : dirt.in > 0 ? 'in' : null;
      if (!z) { rinse(); return; }
      active = z;
      holding = true;
    }
    if (!holding || !active) return;
    angle += ((dt * ws) / LAP_MS) * Math.PI * 2;
    if (!drag || robot) {
      spongeOn(active, angle);
      scrub(active, (dt * ws) / (SCRUB_MS * (robot === 'watch' ? 1.2 : k)));
    }
  }, () => (robot === 'auto' || robot === 'bad' ? 4 : 1));

  function cleanup() {
    curLoop?.stop?.();
    trail.stop();
    ro?.disconnect();
    if (isDebug()) { delete window.__mgAuto; delete window.__mgBad; }
  }
  f.onAbort(() => { over = true; doneRes('abort'); });

  const how = await doneP;
  cleanup();
  f.close();
  const ms = performance.now() - t0;
  if (how === 'abort') return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms };
  await sleep(dur(150));
  grow.add('wash'); // 지은의 성장: 차분함(끝까지 한 마감 일)
  return { ok: true, attempts: 1, mistakes: 0, watched: watched ? 1 : 0, turn: turn ? 1 : 0, early, noCheer: true, ms };
}

/* ---- 그림이 없을 때(블렌더 그림을 받기 전 · 다른 판): 위에서 본 머그를 SVG 로 ---- */
const FALLBACK = {
  rim: { cx: 1000, cy: 560, rx: 230, ry: 220 },
  inside: { cx: 990, cy: 650, rx: 110, ry: 105 },
  lever: [1240, 120],
};
function fallbackSVG() {
  const { rim, inside } = FALLBACK;
  return `<svg class="ws-svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="1920" height="1080" fill="#9AA3A8"/><rect x="0" y="0" width="1920" height="170" fill="#8A5A34"/>
    <rect x="1180" y="40" width="120" height="120" rx="60" fill="#E6E9EC" stroke="#7C868D" stroke-width="6"/>
    <ellipse cx="${rim.cx + 20}" cy="${rim.cy + 70}" rx="${rim.rx + 10}" ry="${rim.ry}" fill="rgba(0,0,0,.18)"/>
    <path d="M${rim.cx + rim.rx - 10} ${rim.cy - 30} q150 10 150 120 q0 110 -150 120" fill="none" stroke="#F3F0E9" stroke-width="44" stroke-linecap="round"/>
    <ellipse cx="${rim.cx}" cy="${rim.cy}" rx="${rim.rx + 18}" ry="${rim.ry + 18}" fill="#F3F0E9" stroke="#C9C2B4" stroke-width="4"/>
    <ellipse cx="${rim.cx}" cy="${rim.cy + 12}" rx="${rim.rx}" ry="${rim.ry}" fill="#E9E3D8"/>
    <ellipse cx="${inside.cx}" cy="${inside.cy}" rx="${inside.rx + 40}" ry="${inside.ry + 38}" fill="#F6F2EA"/>
    <g class="ws-svg-stain" data-z="rim"><ellipse cx="${rim.cx}" cy="${rim.cy}" rx="${rim.rx + 8}" ry="${rim.ry + 8}" fill="none" stroke="#7A4A24" stroke-width="16" stroke-dasharray="40 22"/></g>
    <g class="ws-svg-stain" data-z="in"><ellipse cx="${inside.cx}" cy="${inside.cy}" rx="${inside.rx - 10}" ry="${inside.ry - 10}" fill="#6E4524" opacity=".55"/><ellipse cx="${inside.cx}" cy="${inside.cy}" rx="${inside.rx}" ry="${inside.ry}" fill="none" stroke="#4E2C14" stroke-width="14"/></g>
    <g class="ws-svg-foam" data-z="rim">${Array.from({ length: 22 }, (_, i) => `<circle cx="${rim.cx + Math.cos(i * 0.29) * rim.rx}" cy="${rim.cy + Math.sin(i * 0.29) * rim.ry}" r="${10 + (i % 3) * 4}" fill="#fff" opacity=".9"/>`).join('')}</g>
    <g class="ws-svg-foam" data-z="in">${Array.from({ length: 14 }, (_, i) => `<circle cx="${inside.cx + Math.cos(i * 0.45) * (i % 4) * 22}" cy="${inside.cy + Math.sin(i * 0.45) * (i % 4) * 20}" r="${12 + (i % 3) * 4}" fill="#fff" opacity=".9"/>`).join('')}</g>
    <rect class="ws-svg-stream" x="1228" y="0" width="16" height="${inside.cy}" fill="#CFE8F5" opacity=".8"/>
  </svg>`;
}
function fallbackDraw(box, z, d, fm) {
  const st = box.querySelector(`.ws-svg-stain[data-z="${z}"]`);
  if (st) st.style.opacity = String(d);
  const fo = box.querySelector(`.ws-svg-foam[data-z="${z}"]`);
  if (fo) fo.style.opacity = String(fm / 3);
}
