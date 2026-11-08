/**
 * 미니게임: 몰림(재미 개편 4.4 · 5장 · 7장, 2026-11-01) — 여기저기 생기는 것을 빨리 눌러 처리하기(원본 직업 마1스톤 whack 의 틀을 장면 위에 새로 그림)
 *  theme
 *   - city : 봄 1일 도시 카페의 기억. 주문 종이가 점점 빨리 쌓이고, 끝내 라테가 쏟아짐(이야기의 일: 실패가 아니라 '이곳은 너무 빨랐다')
 *   - cafe : 우리 카페의 몰림 시간(Q-44). 오래 둔 주문은 사장님이 "이건 내가 할게요" 하고 받아 줌(실패 없음). 차분함이 오를수록 사장님이 더 일찍 도와줌
 *   - gull : 그 갈매기 쫓기(웃음 줄기 3.2). 빵을 문 갈매기가 테라스를 이리저리 뛰고, 세 번 맞히면 빵을 떨어뜨림. 오래 걸리면 빵을 물고 날아감(그래도 끝)
 *            갈매기는 테라스 안을 빠르게 뛰어다님(가끔 후다닥 · 잠깐 멈춤, 맞으면 멀리 달아남, 왼쪽으로 가면 그림을 뒤집음). 13초(2026-11-07 사용자 '갈매기가 상당히 빠르게 여기 저기로 움직이는 로직' · '시간을 반으로', 검수 13.77)
 *            움직임 줄이기 · 차분 모드는 예전처럼 자리를 건너뛰기만(hop), 턴 방식은 누를 때만 옮김. 쉬운 길은 0.6배 · 깊은 길은 1.15배 빠르기
 *  실시간이 아니면(설정 시간 제한 끄기 · 자동 스캔) 턴 방식: 하나씩 나오고, 누를 때마다 다음 것이 나옴
 * 옵션: { title, theme, seconds?, bg?: [배경 id, 변형], quit? } · 돌려줌: { ok, attempts: 1, mistakes: 0, cleared, helped, ms }
 * 자동 플레이(?debug): window.__mgAuto
 */

import { h, sleep, dur, isReducedMotion } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { renderBg } from '../../data/backgrounds.js';
import { frame, line, abortGeneration, abortMinigame } from './frame.js';
import { pace, loop, isDebug, startGate, popText } from './arcade.js';
import { bus } from '../../core/bus.js';
import * as grow from '../../core/grow.js';
import { store } from '../../core/store.js';
import { vfx, centerOf } from '../../ui/vfx.js';
import { img } from '../../core/assets.js';

// 그 갈매기 그림(놀이 시트, 2026-11-06 받음): 빵을 문 채 서 있음 · 맞으면 놀람(빵이 빠짐) · 빵을 물고 날아감. 없으면 아래 SVG + 빵 아이콘
const GULL_ART = { stand: 'play_gull_stand', hit: 'play_gull_startle', fly: 'play_gull_fly' };
const gullArt = () => Object.values(GULL_ART).every((id) => img.has('objects', id));

const GULL = '<svg viewBox="0 0 120 92" aria-hidden="true"><path d="M44 78 l-5 12 M62 78 l3 12" stroke="#E2A23A" stroke-width="5" stroke-linecap="round"/><ellipse cx="56" cy="56" rx="36" ry="22" fill="#fff" stroke="#55585C" stroke-width="3"/><path d="M30 50 q14 -30 40 -10 q-14 6 -40 10z" fill="#BCC7CF" stroke="#55585C" stroke-width="3" stroke-linejoin="round"/><circle cx="88" cy="38" r="15" fill="#fff" stroke="#55585C" stroke-width="3"/><path d="M101 38 l16 4 -16 5z" fill="#F2B233" stroke="#8A5A00" stroke-width="2" stroke-linejoin="round"/><circle cx="92" cy="34" r="3" fill="#222"/><path d="M84 28 l10 -2" stroke="#55585C" stroke-width="3" stroke-linecap="round"/></svg>';

const THEMES = {
  city: {
    title: '도시 카페의 점심시간', bg: ['city_cafe', 'rush'], seconds: 32, icon: 'order_check', // 배경: 직업 마1스톤의 피크타임 그림(2026-11-01 사용자)
    howto: '주문 종이를 눌러서 처리해요. 빨리, 더 빨리!',
    spots: [[18, 30], [34, 22], [52, 28], [70, 22], [84, 32], [24, 52], [44, 48], [62, 54], [80, 50], [16, 72], [36, 70], [56, 74], [76, 72]],
    slips: ['아이스 아메리카노 세 잔!', '라테 빨리요!', '아직이에요?', '포장이요!', '바닐라 라테 두 잔!', '물 좀 주세요!', '회사 늦어요!', '아이스로요!'],
    spawn: [1500, 420], max: 9,
    say: { start: '빨리, 더 빨리!', end: '와르르! 라테가 카운터 위로 쏟아졌다.' },
  },
  cafe: {
    title: '몰림 시간', bg: ['hall', 'busy_summer'], seconds: 30, icon: 'order_check',
    howto: '주문 종이를 눌러서 하나씩 처리해요. 오래 두면 사장님이 받아 줘요.',
    howtoAlone: '주문 종이를 눌러서 하나씩 처리해요. 오늘은 사장님이 안 계셔서 주문이 기다려 줘요.',
    spots: [[20, 30], [38, 24], [56, 28], [74, 24], [26, 54], [46, 50], [66, 54], [82, 46], [30, 74], [52, 74], [72, 72]],
    slips: ['아이스 아메리카노 하나요!', '라테 두 잔이요.', '유자차 하나요.', '포장이요!', '딸기우유 하나요.', '따뜻한 우유요.', '아아 둘이요!'],
    // 주문이 나오는 사이(처음 → 끝, ms): 4배 빠르게(2026-11-08 사용자 "몰림 시간의 요청을 4배 빠르게 만들어라. 그래야 사장님의 도움을 받을 수 있다", 검수 13.96). 전에는 [1900, 1000]이라 1초에 두 번만 눌러도 사장님 도움이 없었음
    spawn: [475, 250], max: 11, life: 5200, // max: 한꺼번에 놓이는 주문 종이(자리 11곳 모두). 6장으로 막으면 빨리 누르는 학생은 오래된 종이가 늘 5.2초 안에 처리돼 사장님 도움이 없었음(검수 13.96)
    say: { start: '손님이 한꺼번에 몰려와요. 하나씩 해요.', owner: '이건 내가 할게요.', end: '몰림 시간을 넘겼어요. 사장님과 함께 해냈어요!', alone: '사장님이 안 계셔도 차근차근 해냈어요!' },
  },
  gull: {
    title: '그 갈매기를 쫓아라', bg: ['cafe_front', 'morning'], seconds: 13, icon: 'bread', // 26초는 너무 늘어졌음(2026-11-07 사용자 '시간을 반으로 줄여라')
    howto: '빵을 문 갈매기를 눌러요. 세 번 누르면 빵을 떨어뜨려요.',
    spots: [[22, 66], [36, 58], [50, 70], [64, 60], [78, 68], [30, 78], [58, 80], [72, 52]],
    hits: 3, hop: 1300,
    area: [18, 82, 54, 80], run: 42, dash: 80, // 뛰어다니는 테라스(그림의 %: x 왼쪽 · 오른쪽, y 위 · 아래) · 빠르기(1초에 그림 너비의 %): 보통 · 후다닥
    say: { start: '앗, 갈매기가 빵을 물고 간다!', hit: '꽥!', got: '빵을 되찾았어요! 갈매기는 아쉬운 듯 날아갔어요.', fled: '갈매기가 빵을 물고 바다로 날아갔어요. …내일 또 오겠지.' },
  },
};

const themeOf = (opts) => THEMES[opts.theme] || THEMES.cafe;

export function rushLines(opts = {}) {
  const th = themeOf(opts);
  const out = [...line.intro(opts.title || th.title, th.howto)];
  if (th.howtoAlone) out.push(...line.intro(opts.title || th.title, th.howtoAlone)); // 사장님이 안 계신 날: 틀이 '제목. 할 일'로 읽음(검수 13.63: 이 짝이 없어 브라우저 음성이었음)
  for (const t of Object.values(th.say)) out.push(line.sys(t));
  for (const t of th.slips || []) out.push(line.sys(t));
  return out;
}

export function rushProblems(opts = {}) {
  return opts.theme && !THEMES[opts.theme] ? [`theme 은 ${Object.keys(THEMES).join(' · ')}`] : [];
}

export async function rush(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  const th = themeOf(opts);
  const kind = opts.theme && THEMES[opts.theme] ? opts.theme : 'cafe';
  const title = opts.title || th.title;
  const { turn, k } = pace();
  const [bgId, bgVar] = opts.bg || th.bg;
  const howto = opts.today?.owner === false && th.howtoAlone ? th.howtoAlone : th.howto;
  const f = frame({ title, instruction: howto, icon: th.icon, cls: `mg-scene mg-rush rs-${kind}`, quit: Boolean(opts.quit) });

  let over = false;
  let started = false;
  let cleared = 0;
  let helped = 0;
  let auto = false;
  let doneRes;
  const doneP = new Promise((r) => { doneRes = r; });

  const scene = h('div', { class: 'sc-bg', html: renderBg(bgId, bgVar) });
  const field = h('div', { class: 'ru-field', role: 'group', 'aria-label': title });
  const count = h('p', { class: 'ru-count', 'aria-live': 'polite' });
  const timeBar = h('div', { class: 'ru-time', 'aria-hidden': 'true' }, h('i'));
  f.body.append(scene, field, h('div', { class: 'ru-foot' }, count, timeBar));

  const S = th.spots;
  const live = new Map(); // 자리 → { el, age }
  const fading = new Set(); // 사라지는 중인 종이의 자리: 새 종이가 그 위에 겹쳐 나오지 않게(자리 11곳이 다 찬 몰림 시간, 검수 13.97)
  const free = () => S.map((_, i) => i).filter((i) => !live.has(i) && !fading.has(i));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // 글자(펑! · 꽥!)를 띄울 자리: 그 요소의 가운데를 field 안 좌표로(무대가 화면에 맞춰 줄어 있어도)
  const posOf = (el) => {
    const r = field.getBoundingClientRect();
    const k2 = field.offsetWidth ? r.width / field.offsetWidth : 1;
    const e = el.getBoundingClientRect();
    return { x: (e.left + e.width / 2 - r.left) / k2, y: (e.top + e.height / 2 - r.top) / k2 };
  };
  // 턴 방식: 시계 없이 한 장씩, 이만큼 처리하면 끝(도시 카페도 끝은 와르르). 아래 띠는 시간 대신 처리한 만큼 참
  const goal = kind === 'city' ? 8 : 6;
  const paint = () => {
    if (kind === 'gull') count.textContent = `맞힌 횟수 ${Math.min(cleared, th.hits)} / ${th.hits}`;
    else if (turn) {
      count.textContent = `처리한 주문 ${cleared} · 남은 주문 ${Math.max(0, goal - cleared)}`;
      timeBar.style.setProperty('--t', String(Math.min(1, cleared / goal)));
    } else count.textContent = kind === 'cafe' ? `처리한 주문 ${cleared} · 사장님이 받은 주문 ${helped}` : `처리한 주문 ${cleared} · 남은 주문 ${live.size}`;
  };

  /* ---- 주문 종이(city · cafe) ---- */
  function addSlip() {
    const spots = free();
    if (!spots.length) return;
    const i = pick(spots);
    const text = pick(th.slips);
    const b = h('button', { class: 'ru-slip', style: { left: `${S[i][0]}%`, top: `${S[i][1]}%` }, 'aria-label': `주문 종이: ${text}` },
      h('i', { html: ICON('order_check') }), h('span', { text }));
    b.addEventListener('click', (e) => { e.stopPropagation(); tapSlip(i); });
    field.append(b);
    live.set(i, { el: b, age: 0 });
    if (turn) setTimeout(() => b.focus({ preventScroll: true }), 40);
    paint();
  }
  function removeSlip(i, cls) {
    const s = live.get(i);
    if (!s) return;
    live.delete(i);
    s.el.disabled = true;
    s.el.classList.add(cls);
    const gone = () => { s.el.remove(); fading.delete(i); };
    if (isReducedMotion()) gone();
    else { fading.add(i); setTimeout(gone, dur(380)); }
  }
  // 주문 종이를 누르면 펑 터지고 배경이 조금 흔들림(2026-11-01 사용자). 쌓인 종이가 많을수록 조금 더 흔들림.
  // 움직임 줄이기 · 차분 모드: 흔들림 없이 종이만 사라짐(vfx 도 저절로 줄어듦)
  function jolt() {
    if (isReducedMotion()) return;
    scene.style.setProperty('--amp', `${Math.min(14, 4 + live.size * 1.3)}px`);
    scene.classList.remove('is-jolt');
    void scene.offsetWidth;
    scene.classList.add('is-jolt');
  }
  function tapSlip(i) {
    if (!started || over || !live.has(i)) return;
    audio.sfx('poof'); // 만화 같은 연기 펑(2026-11-01 사용자 "효과음 적절한 거 찾아서")
    const c = centerOf(live.get(i).el);
    vfx.burst('puff', c.x, c.y, { n: 8, dist: [40, 130], size: [44, 96], ms: [360, 600], spin: false });
    vfx.burst('sparkle', c.x, c.y, { n: 10, dist: [70, 190], size: [18, 38], ms: [420, 700], colors: ['#FFFFFF', '#FFE08A', '#F2C230'] });
    jolt();
    const { x, y } = posOf(live.get(i).el);
    popText(field, kind === 'city' ? '펑!' : '좋아요!', x, y - 40);
    removeSlip(i, 'is-done');
    cleared += 1;
    paint();
    if (turn) {
      if (cleared >= goal) finish();
      else addSlip();
    }
    focusNext();
  }
  function focusNext() {
    const next = [...live.values()][0]?.el;
    if (next) setTimeout(() => { if (next.isConnected && !next.disabled) next.focus({ preventScroll: true }); }, 40);
  }

  /* ---- 갈매기(gull) ---- */
  let gullAt = 0;
  let hop = 0;
  // 뛰어다니기(run): 움직임 줄이기 · 차분 모드 · 턴 방식이 아니면. 자리는 그림의 %(y 는 높이의 %라 거리를 잴 때 16:9 로 맞춤)
  const runMode = kind === 'gull' && !turn && !isReducedMotion() && !document.body.classList.contains('theme-calm');
  const spd = (store.path() === 'easy' ? 0.6 : store.path() === 'deep' ? 1.15 : 1) / k;
  const YR = 9 / 16;
  const run = { x: 0, y: 0, tx: 0, ty: 0, v: 0, rest: 0, autoT: 0 };
  const rand = (a, b) => a + Math.random() * (b - a);
  const art = kind === 'gull' && gullArt();
  const gullPic = art ? h('img', { class: 'ru-gull-img', src: img.url('objects', GULL_ART.stand), alt: '', draggable: 'false' }) : null;
  const gullShow = (pose) => { if (gullPic) gullPic.src = img.url('objects', GULL_ART[pose]); };
  let gullBack = 0;
  const gull = kind === 'gull'
    ? h('button', { class: `ru-gull${art ? ' has-art' : ''}`, 'aria-label': '빵을 문 갈매기' }, art ? gullPic : h('span', { class: 'ru-gull-pic', html: GULL }), art ? null : h('i', { class: 'ru-bread', html: ICON('croissant') }))
    : null;
  function placeGull(i) {
    gullAt = i;
    gull.style.left = `${S[i][0]}%`;
    gull.style.top = `${S[i][1]}%`;
    run.x = S[i][0]; run.y = S[i][1];
  }
  /** 다음 갈 곳: far 이면 지금 자리에서 멀리(맞고 달아날 때). 열에 셋은 후다닥 */
  function runTo(far = false) {
    const [x0, x1, y0, y1] = th.area;
    let x = 0, y = 0;
    for (let n = 0; n < 12; n++) {
      x = rand(x0, x1); y = rand(y0, y1);
      if (Math.hypot(x - run.x, (y - run.y) * YR) >= (far ? 32 : 12)) break;
    }
    run.tx = x; run.ty = y;
    run.v = (far ? th.dash * 1.2 : Math.random() < 0.3 ? th.dash : th.run) * spd;
  }
  function runStep(dt) {
    if (run.rest > 0) { run.rest -= dt; return; }
    const dx = run.tx - run.x, dy = run.ty - run.y;
    const d = Math.hypot(dx, dy * YR);
    const len = run.v * dt / 1000;
    if (d <= len) {
      run.x = run.tx; run.y = run.ty;
      if (Math.random() < 0.4) run.rest = rand(120, 380) * k; // 잠깐 멈춰 두리번
      runTo();
    } else {
      run.x += (dx / d) * len; run.y += (dy / d) * len;
    }
    if (Math.abs(dx) > 0.3) gull.classList.toggle('is-left', dx < 0); // 그림은 오른쪽을 봄: 왼쪽으로 가면 뒤집음
    gull.style.left = `${run.x}%`;
    gull.style.top = `${run.y}%`;
  }
  if (gull) {
    field.append(gull);
    placeGull(0);
    if (runMode) { gull.classList.add('is-run'); runTo(); }
    gull.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!started || over) return;
      cleared += 1;
      audio.sfx('squawk');
      const { x, y } = posOf(gull);
      popText(field, th.say.hit, x, y - 60, 'big');
      gull.classList.remove('is-hit');
      void gull.offsetWidth;
      gull.classList.add('is-hit');
      gullShow('hit');
      clearTimeout(gullBack);
      paint();
      if (cleared >= th.hits) { finish('got'); return; }
      gullBack = setTimeout(() => { if (!over) gullShow('stand'); }, dur(450));
      if (runMode) { run.rest = 0; runTo(true); } // 놀라서 멀리 후다닥
      else placeGull(pick(S.map((_, i) => i).filter((i) => i !== gullAt)));
      hop = 0;
    });
  }

  /* ---- 시간 ---- */
  const total = (opts.seconds || th.seconds) * 1000 * k;
  let tAcc = 0;
  let spawnIn = 300;
  // 차분함(지은의 성장)이 오를수록 사장님이 일찍 받아 줌(재미 개편 6.1). 깊은 길(선생님이 정함)은 주문이 조금 빨리 옴
  // 오늘의 칠판 '사장님 외출'(today.owner === false): 받아 주는 사람이 없어 주문이 기다림(실패 없음, 시간이 끝나면 마침)
  const pk = store.path() === 'deep' ? 0.85 : 1;
  const alone = opts.today?.owner === false;
  // 사장님이 받아 주는 때에는 깊은 길 배율(pk)을 곱하지 않음: 곱하면 더 일찍 받아 줘서 깊은 길이 오히려 쉬웠음(검수 13.39 31번)
  const life = alone ? Infinity : th.life ? th.life * k * Math.max(0.6, 1 - (grow.level('calm') - 1) * 0.05) : 0;
  /** 사장님이 주문 하나를 받아 줌(오래 둔 주문 · 자리가 다 찼을 때). 처음 한 번만 "이건 내가 할게요." */
  function ownerTake(i, s) {
    const { x, y } = posOf(s.el);
    // 키보드 · 스캔: 초점은 가장 오래된 종이에 있는데 사장님도 그 종이를 받아 감 → 다음 종이로 옮김(초점이 사라져 Enter 가 먹지 않던 문제, 검수 13.97)
    const hadFocus = s.el === document.activeElement;
    popText(field, '사장님이 받았어요', x, y - 40);
    if (!helped) tts.speak(th.say.owner, 'owner');
    helped += 1;
    removeSlip(i, 'is-owner');
    paint();
    if (hadFocus) focusNext();
  }
  function step(dt) {
    if (over || !started) return;
    tAcc += dt;
    timeBar.style.setProperty('--t', String(Math.min(1, tAcc / total)));
    if (kind === 'gull') {
      if (runMode) runStep(dt);
      else {
        hop += dt;
        if (hop >= th.hop * k) { hop = 0; placeGull(pick(S.map((_, i) => i).filter((i) => i !== gullAt))); }
      }
      run.autoT += dt;
      if (auto && run.autoT > 200) { run.autoT = 0; gull.click(); }
      if (tAcc >= total) finish('fled');
      return;
    }
    const prog = Math.min(1, tAcc / total);
    spawnIn -= dt;
    if (spawnIn <= 0) {
      if (kind === 'city' && live.size >= th.max) { finish(); return; } // 쌓이고 쌓여서 와르르
      // 우리 카페: 자리가 다 찼는데 또 손님이 오면 사장님이 가장 오래된 주문을 받아 주고 새 주문을 놓음(사장님 외출 날은 기다림).
      // 손이 빠른 학생도 몰림이 가장 셀 때는 사장님과 함께 하게(2026-11-08 사용자 "그래야 사장님의 도움을 받을 수 있다", 검수 13.96)
      if (kind === 'cafe' && !alone && live.size >= th.max) { const [i, s] = [...live].reduce((a, b) => (b[1].age > a[1].age ? b : a)); ownerTake(i, s); }
      if (live.size < (kind === 'city' ? S.length : th.max)) addSlip();
      spawnIn = (th.spawn[0] + (th.spawn[1] - th.spawn[0]) * prog) * k * pk;
    }
    if (kind === 'cafe') {
      for (const [i, s] of [...live]) {
        s.age += dt;
        if (s.age >= life) ownerTake(i, s);
      }
    }
    if (auto) { const first = [...live.keys()][0]; if (first !== undefined && Math.random() < 0.35) tapSlip(first); }
    if (tAcc >= total) finish();
  }

  // 몰림 시간의 음악(2026-11-07 사용자 '몰리는 타이밍에 danger 넣는 것도 잊지마요~', 검수 13.83): [시작!] 뒤 Danger, 끝나면 앞의 곡. 차분 모드 · 갈매기는 그대로
  const rushMusic = kind !== 'gull' && !document.body.classList.contains('theme-calm') && audio.hasMood('rush'); // 곡이 없는 판(공개판)에서는 바꾸지 않음
  let prevMood = null;
  let switched = false;
  const musicBack = () => { if (switched) { switched = false; audio.bgm(prevMood); } };
  let endHow = ''; // 갈매기: 'got'(빵을 되찾음) · 'fled'(날아감)
  async function finish(how = '') {
    if (over) return;
    over = true;
    endHow = how;
    curLoop?.stop();
    for (const s of live.values()) s.el.disabled = true;
    if (gull) gull.disabled = true;
    let text = alone && th.say.alone ? th.say.alone : th.say.end;
    if (kind === 'city') {
      audio.sfx('boom');
      f.el.classList.add('is-crash');
      setTimeout(() => audio.sfx('spill'), dur(200));
      setTimeout(() => audio.sfx('glass_break'), dur(420));
    } else if (kind === 'gull') {
      text = how === 'got' ? th.say.got : th.say.fled;
      audio.sfx(how === 'got' ? 'great' : 'whoosh');
      clearTimeout(gullBack);
      gullShow(how === 'got' ? 'hit' : 'fly'); // 빵을 떨어뜨림 · 빵을 물고 날아감
      gull?.classList.remove('is-run', 'is-left'); // 날아가는 모습은 오른쪽 위로(옮김 애니메이션을 다시 켬)
      gull?.classList.add(how === 'got' ? 'is-gone' : 'is-fled');
    } else {
      audio.sfx('great');
      grow.add('rush'); // 지은의 성장: 차분함
    }
    count.textContent = text;
    await Promise.race([Promise.all([tts.speak(text, 'sys'), sleep(dur(900))]), sleep(9000)]);
    musicBack();
    doneRes('done');
  }

  let curLoop = null;
  if (isDebug()) window.__mgAuto = async () => { auto = true; f.el.querySelector('.mg-gate .mg-go')?.click(); await doneP; };
  const offQuit = opts.quit ? bus.on('mg:quit', () => { over = true; musicBack(); doneRes('quit'); abortMinigame(); }) : null;
  f.onAbort(() => { over = true; curLoop?.stop(); musicBack(); doneRes('abort'); });

  paint();
  // 처음 설명(틀이 읽는 '제목. 할 일')을 끊지 않게, 시작 말은 [시작!]을 누른 뒤에(같은 말이 할 일에 들어 있으면 생략, 검수 13.39 15번)
  await Promise.race([startGate(f.body, { note: turn ? '하나씩 차례로 나와요.' : '', ready: f.told }), doneP]);
  if (!stopped() && !over) {
    started = true;
    if (rushMusic) { prevMood = audio.state().mood; switched = true; audio.bgm('rush'); } // 몰림 시간에는 Danger(검수 13.83)
    if (!howto.includes(th.say.start)) tts.speak(th.say.start, 'sys');
    if (kind !== 'gull') { addSlip(); if (!turn) addSlip(); }
    // 턴 방식은 시계를 돌리지 않음: 종이는 누를 때마다 다음 한 장(tapSlip), 갈매기는 누를 때만 자리를 옮김.
    // 시계를 돌리면 저절로 생기는 종이 · 사장님이 받아 가는 종이가 겹쳐 남은 주문이 줄지 않음(검수 13.39 3번)
    if (!turn) curLoop = loop(step, () => (auto ? 4 : 1));
    if (auto && turn) {
      (async () => {
        while (!over && !stopped()) {
          await sleep(90);
          if (gull) gull.click(); else { const first = [...live.keys()][0]; if (first !== undefined) tapSlip(first); }
        }
      })();
    }
    focusNext();
    gull?.focus({ preventScroll: true });
  }
  const how = await doneP;
  offQuit?.();
  curLoop?.stop();
  if (isDebug()) delete window.__mgAuto;
  f.close();
  const ms = performance.now() - t0;
  if (how === 'abort') return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms };
  if (how === 'quit') return { ok: false, quit: true, attempts: 1, mistakes: 0, ms };
  await sleep(dur(150));
  // 도시 카페(늘 와르르로 끝나는 기억) · 갈매기가 빵을 물고 날아감: '한 번에 해냈어요!' 연출 없이 다음 장면으로(검수 13.39 14번)
  return { ok: true, attempts: 1, mistakes: 0, cleared, helped, ms, noCheer: kind === 'city' || (kind === 'gull' && endHow !== 'got') };
}
