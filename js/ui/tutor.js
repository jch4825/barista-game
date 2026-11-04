/**
 * 처음 보는 버튼 알려 주기 (튜토리얼)
 *  - 처음 나오는 버튼·행동 종류에 무지개 테두리가 돌고, 손가락이 누르는 시늉을 하고, 짧은 쪽지가 붙습니다.
 *  - 한 번에 한 종류만(목록 js/data/tutorial.js 의 위에서부터). 누르면 학생마다 '배운 것'으로 기록되어 다시 나오지 않습니다.
 *  - 그림은 #layer-tut 에만 그립니다. 버튼의 모양·배치·초점은 그대로이고, 누르기도 막지 않습니다(pointer-events: none).
 *  - 프롤로그의 guide(key, 안내) 비트가 늘 있는 버튼(되감기·메모·멈춤…)을 이야기 흐름에 맞춰 하나씩 소개합니다.
 *    프롤로그를 건너뛴 학생에게는 다른 이야기의 조용한 대사 때 쪽지로 하나씩 소개합니다.
 *  - 움직임 줄이기: 테두리는 멈춘 무지개, 손가락은 가만히(여러 칸 고르기는 손가락 없이). 차분 모드: 천천히, 은은하게.
 *  - 빛이 가운데에서 퍼지는 연출은 쓰지 않습니다(CLAUDE.md 2-8). 무지개는 버튼 테두리 띠에만 돕니다.
 *  - 쪽지 · 손가락은 서술 · 설명 글(대사 · 창 글 · 카드 · 미니게임 머리글 · 결과 화면, TEXT_SEL)과 다른 단추,
 *    볼 것이 뜨는 장면(AREA_SEL)을 가리지 않는 자리를 고름. 다 가리면 가장 덜 가리는 자리.
 *    앞 자리가 거의 그만큼 괜찮으면 옮기지 않음(흔들림 없게). 화면 맨 아래 줄 단추는 옆이나 위에서 짚음.
 *  - 대사를 기다리는 동안 뜬 '알려 주기만 하는' 쪽지(늘 있는 버튼 소개 · 안 눌러도 되는 것)는 다음 누름이 쪽지를 닫음:
 *    읽기 전에 대사가 넘어가 사라지지 않게(dialogue.advance · 자동 넘김이 holding 을 봄, 2026-11-04 사용자 "버튼 설명이 뜨면 잠시 멈추게").
 *    쪽지 아래에 '톡 누르면 닫혀요'(.tut-tip.hold)
 *  - 안 눌러도 되는 쪽지는 다른 쪽지 자리에 곧바로 이어 뜨지 않음(CALM_GAP). 읽기 전에 밀려 내려가면 한참 쉼(SNOOZE_MS)
 */

import { $, h, announce } from '../core/dom.js';
import { store } from '../core/store.js';
import { bus } from '../core/bus.js';
import { img } from '../core/assets.js';
import { TUT, TUT_BY_KEY } from '../data/tutorial.js';

const W = 1920;
const H = 1080;
const PAD = 8;          // 테두리와 버튼 사이
const TICK = 160;       // 어떤 버튼을 알려 줄지 다시 고르는 간격(ms)
const GROUP_STEP = 1500; // 여러 칸 고르기: 손가락이 다음 칸으로 옮기는 간격
const MIN_SHOW = 1500;   // 안 눌러도 되는 쪽지: 이만큼 떠 있어야 '보여 준 번'으로 셈(다른 쪽지에 밀려 깜빡 지나간 것은 세지 않음)
const ACK_AFTER = 250;   // 쪽지가 뜬 바로 그 순간의 누름은 쪽지를 닫는 누름으로 치지 않음
const CALM_GAP = 2000;   // 안 눌러도 되는 쪽지는 다른 쪽지가 내려간 뒤 이만큼 조용해야 뜸(작업대 단계 사이에 깜빡 뜨지 않게)
const SNOOZE_MS = 15000; // 안 눌러도 되는 쪽지가 다른 쪽지에 밀려 내려가면 이만큼 쉼

// 가리면 안 되는 글: 서술 · 설명(쪽지와 손가락이 피해 감, 2026-11-04 사용자 "버튼 설명이 서술을 덮고 진행을 방해한다")
const TEXT_SEL = [
  '#layer-dock .dlg:not(.is-hidden) :is(.dlg-text, .dlg-name)',
  '#layer-overlay .ov :is(p, h2, h3, li, figcaption)',
  '#layer-task .cards-wrap.is-in :is(.card-label, .card-q, p)',
  '#layer-task .mg .mg-head :is(h2, p)',
  '#layer-task :is(.bw-gate-card, .mg-gate) :is(h3, p)',
  '#layer-task .bw-close-head :is(h3, p)',
  '#layer-task .mg-brew :is(.bw-ask-t, .bw-me, .bw-status, .bw-order-text, .bw-react-text, .bw-name, .bw-lack-say)',
  '#layer-screen .scr :is(p, h2, h3, li)',
].join(', ');
const WHOLE_SEL = '#layer-dock .dlg-text'; // 글자가 하나씩 나오는 글: 나오는 동안은 칸 전체를 피함
const BIG_BTN = 700 * 300;                 // 이보다 큰 단추(장면 그림 = 단추)는 이름 글자만 다른 단추처럼, 그림은 조금만 피함
const TIP_STEP = 48;                       // 쪽지 자리 후보 간격
const AREA_SEL = '#layer-task .mg-brew .bw-close-view'; // 볼 것이 뜨는 장면(작업대 확대 창: "지금!"이 아무 곳에나 뜸): 되도록 비움

/** 누르는 손가락(검지 끝 = 46, 8). 그림 파일 assets/ui/tut_hand.png 가 있으면 그것을 씀 */
const HAND_SVG = `<svg viewBox="0 0 100 120" aria-hidden="true">
  <rect x="35" y="88" width="40" height="22" rx="6" fill="#FFD43B" stroke="#17141C" stroke-width="5"/>
  <path d="M39 60 V15 A7 7 0 0 1 53 15 V46 A6.5 6.5 0 0 1 66 46 V50 A6.5 6.5 0 0 1 79 50 V72 C79 85 70 94 58 94 H50 C42 94 36 90 32 82 L23 66 A6 6 0 0 1 33 59 L39 66 Z"
    fill="#FFFFFF" stroke="#17141C" stroke-width="5" stroke-linejoin="round"/>
  <path d="M53 46 V58 M66 50 V60" fill="none" stroke="#17141C" stroke-width="4" stroke-linecap="round"/>
  <path d="M43 18 V30" fill="none" stroke="#C9D6E8" stroke-width="4" stroke-linecap="round"/>
</svg>`;

let layer = null;
let screenEl = null;
const rings = [];
let handEl = null;
let tipEl = null;
let cur = null;          // 지금 알려 주는 것 { k, els, intro, line }
let armed = null;        // guide 비트로 소개 중 { key, lines, span }
let introMode = false;   // 프롤로그 밖: 늘 있는 버튼을 조용한 대사 때 하나씩
let introCool = 0;       // 소개 사이에 쉬는 대사 수
let lineCount = 0;
let raf = 0;
let groupIdx = 0;
let groupTimer = null;
const memSeen = new Set();     // 학생이 정해지기 전(처음 화면·이름 정하기)
const shows = {};              // 안 눌러도 되는 것: 보여 준 횟수(MIN_SHOW 넘게 떠 있었던 번)
const snooze = {};             // 누름으로 닫은 쪽지: 그 대사가 끝날 때까지 다시 띄우지 않음 { key: lineCount }
const snoozeUntil = {};        // 밀려 내려간 안 눌러도 되는 쪽지: 이때까지 쉼 { key: 시각 }
let lastDrop = 0;
const radiusCache = new WeakMap();
let textCache = { at: 0, rects: [], holders: [], inner: [], btns: [], areas: [], sig: 0 };
let spot = null;               // 쪽지 자리(버튼 · 피할 것이 그대로면 그대로: 매 프레임 자리를 바꾸면 흔들림)
let handLast = null;           // 앞 프레임의 손가락 자리 { key, el, side }

function enabled() { return store.settings().tutorial !== false; }
function reduced() { return document.body.classList.contains('reduce-motion'); }
function isSeen(key) { return store.active() ? store.tutSeen(key) : memSeen.has(key); }

function markSeen(key) {
  if (!key || isSeen(key)) return;
  if (store.active()) store.markTut(key);
  else memSeen.add(key);
  if (armed?.key === key) armed = null;
  if (cur?.k.key === key) drop();
}

/** 화면에 보이고, 다른 창에 가려지지 않은 것만 */
function shown(el) {
  if (el.disabled || el.closest('.is-hidden, [hidden], .is-out')) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return false;
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) return false;
  const hit = document.elementFromPoint(x, y);
  return Boolean(hit) && (hit === el || el.contains(hit));
}

function targets(k) {
  if (k.key === 'next' && store.settings().auto !== 'off') return []; // 자동 넘김이면 누를 일이 없음
  if (k.when && !document.querySelector(k.when)) return [];
  const out = [];
  for (const el of document.querySelectorAll(k.sel)) {
    if (shown(el)) out.push(el);
    if (out.length >= 8) break;
  }
  return out;
}

/** 대사가 기다리는 중이고, 창·카드·미니게임이 없음 */
function quiet() {
  return Boolean(document.querySelector('#layer-dock .dlg-next.on'))
    && !document.body.classList.contains('tasking')
    && !document.querySelector('#layer-overlay .ov, #layer-screen .scr, #layer-modal .ov');
}

function choose() {
  if (armed) {
    const k = TUT_BY_KEY[armed.key];
    if (k && !isSeen(k.key)) {
      const els = targets(k);
      if (els.length) return { k, els };
    }
  }
  const now = performance.now();
  const calm = cur ? 0 : now - lastDrop; // 다른 쪽지가 떠 있으면 0
  for (const k of TUT) {
    if (k.guide || isSeen(k.key) || (k.after && !isSeen(k.after)) || snooze[k.key] === lineCount) continue;
    // 안 눌러도 되는 것: 다른 쪽지가 떠 있거나 막 내려간 때 · 쉬는 중에는 띄우지 않음(지금 떠 있는 그 쪽지는 그대로).
    // 다른 쪽지 자리에 곧바로 이어 뜨면 깜빡 지나가 읽을 수 없음
    if (!k.need && cur?.k.key !== k.key && (calm < CALM_GAP || (snoozeUntil[k.key] || 0) > now)) continue;
    const els = targets(k);
    if (els.length) return { k, els };
  }
  if (introMode && introCool <= 0 && isSeen('next') && quiet()) {
    for (const k of TUT) {
      if (!k.guide || isSeen(k.key)) continue;
      const els = targets(k);
      if (els.length) return { k, els, intro: true };
    }
  }
  return null;
}

function tipText(c) {
  const k = c.k;
  if (k.guide && !c.intro) return ''; // 프롤로그 안내 대사가 설명함
  if (k.tipTwo && store.settings().selectMode === 'two') return k.tipTwo;
  return k.tip || '';
}

/* ---------------- 그리기 ---------------- */
function ring() {
  const el = h('div', { class: 'tut-ring' }, h('i', { class: 'tut-glow' }, h('b')), h('b', { class: 'tut-band' }));
  layer.insertBefore(el, handEl); // 손가락·쪽지보다 아래(CSS z-index 와 같은 순서)
  return el;
}

function conv(r, sr, s) {
  return { x: (r.left - sr.left) / s, y: (r.top - sr.top) / s, w: r.width / s, h: r.height / s };
}

/** 글자가 있는 자리(줄마다 하나). 넓은 칸에 글이 짧으면 빈 곳은 비워 둠(쪽지가 그 옆에 설 수 있게) */
function lineRects(el, sr, s) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const lines = [];
  for (const r of range.getClientRects()) {
    if (r.width < 2 || r.height < 2) continue;
    const c = conv(r, sr, s);
    const same = lines.find((l) => Math.min(l.y + l.h, c.y + c.h) - Math.max(l.y, c.y) > 0.5 * Math.min(l.h, c.h));
    if (!same) { lines.push(c); continue; }
    const x2 = Math.max(same.x + same.w, c.x + c.w);
    const y2 = Math.max(same.y + same.h, c.y + c.h);
    same.x = Math.min(same.x, c.x);
    same.y = Math.min(same.y, c.y);
    same.w = x2 - same.x;
    same.h = y2 - same.y;
  }
  return lines.length ? lines : [conv(el.getBoundingClientRect(), sr, s)];
}

/** 맨 위에 보이는 단추인지(다른 창 · 장면 뒤에 깔린 것, 사라지는 중인 것은 빼려고) */
function onTop(el, r) {
  const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  return Boolean(hit) && (hit === el || el.contains(hit));
}

/**
 * 쪽지 · 손가락이 피할 것(판 좌표)
 *  rects 서술 · 설명 글(짚는 버튼 밖) · holders 버튼을 품은 글(대사 속 말 사전 단추)
 *  inner 여러 칸을 짚을 때 칸마다 글자 { rect, owner } · btns 다른 단추 · areas 장면 크기 단추(이름 글자는 btns)
 */
function textRects(sr, s, targets) {
  const now = performance.now();
  if (now - textCache.at < 250 && textCache.for === targets) return textCache;
  const rects = [];
  const holders = [];
  const typed = Boolean(document.querySelector('#layer-dock .dlg-next.on')); // 대사가 다 나왔음
  for (const el of document.querySelectorAll(TEXT_SEL)) {
    if (!el.textContent.trim()) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || Number(cs.opacity) < 0.1) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (targets.some((t) => t.contains(el))) continue; // 짚는 버튼 안의 글은 아래 inner 로
    // 대사는 글자가 하나씩 나오는 동안 칸 전체, 다 나온 뒤와 그 밖은 글자가 있는 곳만
    rects.push(...(!typed && el.matches(WHOLE_SEL) ? [conv(r, sr, s)] : lineRects(el, sr, s)));
    if (targets.some((t) => el.contains(t))) holders.push(conv(r, sr, s));
  }
  // 여러 칸을 짚을 때: 칸마다 글자 자리(손가락이 짚지 않는 칸의 글 · 단추 이름을 가리지 않게)
  const inner = targets.length > 1 ? targets.flatMap((t) => lineRects(t, sr, s).map((rect) => ({ rect, owner: t }))) : [];
  const btns = [];
  const areas = []; // 볼 것이 뜨는 장면(AREA_SEL) · 장면 크기 단추: 되도록 비움
  for (const el of document.querySelectorAll(AREA_SEL)) {
    const r = el.getBoundingClientRect();
    if (r.width > 4 && r.height > 4) areas.push(conv(r, sr, s));
  }
  for (const b of document.querySelectorAll('#screen button')) {
    if (b.closest('#layer-tut') || targets.some((t) => t === b || t.contains(b) || b.contains(t))) continue;
    const r = b.getBoundingClientRect();
    if (r.width < 4 || r.height < 4 || r.right < 0 || r.bottom < 0 || r.left > window.innerWidth || r.top > window.innerHeight) continue;
    if (!onTop(b, r)) continue;
    const c = conv(r, sr, s);
    if (c.w * c.h <= BIG_BTN) btns.push(c);
    else {
      areas.push(c);
      if (b.textContent.trim()) btns.push(...lineRects(b, sr, s)); // 이름 글자는 다른 단추처럼
    }
  }
  // 피할 것이 바뀌면 쪽지 자리를 다시 고름
  let sig = rects.length * 1000 + btns.length;
  for (const c of [...rects, ...btns, ...areas]) sig = (sig * 31 + Math.round(c.x) + Math.round(c.y) * 7 + Math.round(c.w) * 13 + Math.round(c.h) * 17) % 1000000007;
  textCache = { at: now, rects, holders, inner, btns, areas, sig, for: targets };
  return textCache;
}
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
const covers = (box, rects) => rects.reduce((n, r) => n + overlap(box, r), 0);
/** 판 밖으로 나간 넓이(조금 나간 것은 조금만 나쁨) */
function offscreen(b) {
  const inX = Math.max(0, Math.min(b.x + b.w, W - 8) - Math.max(b.x, 8));
  const inY = Math.max(0, Math.min(b.y + b.h, H - 8) - Math.max(b.y, 8));
  return (b.w * b.h - inX * inY) * 4;
}
/** 손가락 그림이 차지하는 자리(대략, 손끝 = ax · ay) */
function handBox(ax, ay, side) {
  if (side === 'sr') return { x: ax, y: ay - 64, w: 156, h: 128 };
  if (side === 'sl') return { x: ax - 156, y: ay - 64, w: 156, h: 128 };
  if (side === 'fx') return { x: ax - 80, y: ay - 10, w: 140, h: 150 };
  if (side === 'st') return { x: ax - 60, y: ay - 140, w: 140, h: 150 };
  return { x: ax - 60, y: ay - 10, w: 140, h: 150 };
}

function radius(el, r) {
  let v = radiusCache.get(el);
  if (v === undefined) {
    const cs = getComputedStyle(el).borderTopLeftRadius || '0';
    v = cs.endsWith('%') ? { pct: parseFloat(cs) } : { px: parseFloat(cs) || 0 };
    radiusCache.set(el, v);
  }
  return v.pct !== undefined ? Math.min(r.w, r.h) * v.pct / 100 : v.px;
}

function place() {
  raf = 0;
  if (!cur) return;
  const sr = screenEl.getBoundingClientRect();
  const s = sr.width / W || 1;
  const rects = cur.els.filter((el) => el.isConnected).map((el) => ({ ...conv(el.getBoundingClientRect(), sr, s), el }));
  while (rings.length < rects.length) rings.push(ring());
  rects.forEach((r, i) => {
    const el = rings[i];
    const rad = Math.min(radius(r.el, r), r.h / 2) + PAD;
    el.style.transform = `translate(${r.x - PAD}px, ${r.y - PAD}px)`;
    el.style.width = `${r.w + PAD * 2}px`;
    el.style.height = `${r.h + PAD * 2}px`;
    el.style.borderRadius = `${rad}px`;
    el.classList.add('on');
  });
  for (let i = rects.length; i < rings.length; i++) rings[i].classList.remove('on');
  const text = textRects(sr, s, cur.els);
  const hand = placeHand(rects, sr, s, text);
  placeTip(rects, hand, text);
  raf = requestAnimationFrame(place);
}

/** 손가락이 이 칸(r)을 짚을 자리: 아래 → 오른쪽 옆 → 왼쪽 옆 → 위 가운데 서술 · 설명 글과 다른 단추를 가장 덜 가리는 곳 */
function handFor(r, pointed, mode, text, last) {
  // 손가락이 피할 글: 바깥 글 + 지금 짚지 않는 다른 칸(카드 등)의 글. 다른 단추는 조금 덜
  const avoid = [...text.rects, ...text.inner.filter((x) => x.owner !== pointed).map((x) => x.rect)];
  // 아래에서 위로 짚는 것이 먼저(오른쪽이 모자라면 왼쪽 아래에서). 화면 아래쪽 버튼(대화창 버튼 등)은 옆에서 짚어 대사 글자를 가리지 않음
  const wide = mode === 'on' && !cur.k.handAt && r.w > 220; // 넓은 버튼은 글자를 피해 오른쪽 아래
  const below = { side: '', ax: wide ? r.x + r.w * 0.82 : r.x + r.w / 2, ay: mode === 'group' ? r.y + r.h * 0.9 : wide ? r.y + r.h * 0.7 : r.y + r.h * 0.8 };
  if (below.ax + 120 > W) below.side = 'fx';
  const tries = [
    ...(mode === 'group' || r.y + r.h + 160 <= H ? [below] : []),
    { side: 'sr', ax: r.x + r.w + 2, ay: r.y + r.h / 2 },
    { side: 'sl', ax: r.x - 2, ay: r.y + r.h / 2 },
    { side: 'st', ax: r.x + r.w / 2, ay: r.y + r.h * 0.2 }, // 위에서 아래로(화면 맨 아래 줄 단추: 아래 · 옆이 다 막힐 때)
  ];
  const cost = (t) => { const b = handBox(t.ax, t.ay, t.side); return 3 * covers(b, avoid) + covers(b, text.btns) + 0.3 * covers(b, text.areas) + offscreen(b); };
  const scored = tries.map((t) => ({ t, c: cost(t) }));
  let pick = scored.find((x) => x.c === 0) || scored.reduce((a, x) => (x.c < a.c ? x : a));
  // 같은 버튼을 짚는 동안은 앞 자리가 거의 그만큼 괜찮으면 그대로(손가락이 이리저리 뛰지 않게)
  if (last && last.key === cur.k.key && last.el === pointed) {
    const keep = scored.find((x) => x.t.side === last.side);
    if (keep && keep.c <= pick.c + 400) pick = keep;
  }
  return pick.t;
}

function placeHand(rects, sr, s, text) {
  const mode = cur.k.hand;
  if (!rects.length || !mode || (mode === 'group' && reduced())) { handEl.classList.remove('on'); handLast = null; return null; }
  let t;
  let boxes;
  if (mode === 'group') {
    // 여러 칸: 칸마다 자리를 정해 두고 차례로 옮김(쪽지는 그 모든 자리를 피함)
    const all = rects.map((rr) => handFor(rr, rr.el, mode, text, null));
    t = all[groupIdx % rects.length];
    boxes = all.map((x) => handBox(x.ax, x.ay, x.side));
  } else {
    let r = rects[0];
    if (cur.k.handAt) {
      const at = cur.els[0].querySelector(cur.k.handAt);
      if (at) r = conv(at.getBoundingClientRect(), sr, s);
    }
    t = handFor(r, rects[0].el, mode, text, handLast);
    handLast = { key: cur.k.key, el: rects[0].el, side: t.side };
    boxes = [handBox(t.ax, t.ay, t.side)];
  }
  const { side, ax, ay } = t;
  handEl.classList.remove('fx', 'sr', 'sl', 'st');
  if (side) handEl.classList.add(side);
  handEl.classList.toggle('travel', mode === 'group');
  handEl.style.transform = `translate(${ax}px, ${ay}px)`;
  handEl.classList.add('on');
  return { x: ax, y: ay, side, boxes };
}

function placeTip(rects, hand, text) {
  const words = tipText(cur);
  if (!words || !rects.length) { tipEl.classList.remove('on'); return; }
  if (tipEl.textContent !== words) tipEl.textContent = words;
  tipEl.classList.toggle('hold', holdNow()); // 다음 누름이 쪽지를 닫음: '톡 누르면 닫혀요'
  const u = rects.reduce((a, r) => ({
    x1: Math.min(a.x1, r.x), y1: Math.min(a.y1, r.y), x2: Math.max(a.x2, r.x + r.w), y2: Math.max(a.y2, r.y + r.h),
  }), { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
  const tw = tipEl.offsetWidth;
  const th = tipEl.offsetHeight;
  // 여러 칸 고르기: 손가락이 칸을 옮겨 다니므로 쪽지는 손가락을 따라가지 않고 한자리에(손가락이 갈 모든 자리를 피함)
  const group = cur.k.hand === 'group';
  // 버튼 · 피할 것이 그대로면 앞에서 고른 자리 그대로(매 프레임 다시 고르면 쪽지가 흔들림)
  const key = `${cur.k.key}|${Math.round(u.x1)}|${Math.round(u.y1)}|${Math.round(u.x2)}|${Math.round(u.y2)}|${tw}|${th}|${group ? 'g' : hand?.side ?? '-'}|${text.sig}`;
  if (spot?.key !== key) {
    const handRects = hand ? hand.boxes : [];
    const handH = group || (hand && (!hand.side || hand.side === 'fx')) ? 176 : 26; // 아래에서 짚는 손가락 자리를 비움
    // 자리 후보: 손가락 옆, 버튼 위 · 아래(가운데와 왼쪽 끝 ~ 오른쪽 끝을 촘촘히), 버튼 오른쪽 · 왼쪽, 버튼을 품은 글(대사 속 말 사전 단추)의 위 · 아래
    const xs = [(cur.k.hand === 'on' && hand ? hand.x : (u.x1 + u.x2) / 2) - tw / 2];
    for (let x = u.x1 - tw; x <= u.x2; x += TIP_STEP) xs.push(x);
    const tries = [];
    if (!group && hand?.side === 'sr') tries.push({ x: hand.x + 170, y: hand.y - th / 2 });
    if (!group && hand?.side === 'sl') tries.push({ x: hand.x - 170 - tw, y: hand.y - th / 2 });
    if (!group && hand?.side === 'st') tries.push({ x: hand.x - tw / 2, y: hand.y - 156 - th });
    for (const y of [u.y1 - th - 26, u.y1 - th - 6, u.y2 + handH, u.y2 + 6]) for (const x of xs) tries.push({ x, y });
    for (let y = u.y1 - th; y <= u.y2; y += TIP_STEP) tries.push({ x: u.x2 + 26, y }, { x: u.x1 - 26 - tw, y });
    for (const hb of text.holders) for (const x of xs) tries.push({ x, y: hb.y - th - 18 }, { x, y: hb.y + hb.h + 18 });
    const box = (t) => ({ x: Math.max(16, Math.min(W - tw - 16, t.x)), y: Math.max(16, Math.min(H - th - 16, t.y)), w: tw, h: th });
    // 가리는 넓이(서술 · 설명 글 · 짚는 버튼 · 손가락은 세 배, 다른 단추는 한 배, 장면 그림은 조금)가 먼저, 같으면 버튼에 가까운 곳
    const cx = (u.x1 + u.x2) / 2;
    const cy = (u.y1 + u.y2) / 2;
    const score = (t) => {
      const b = box(t);
      const over = 3 * covers(b, text.rects) + covers(b, text.btns) + 0.3 * covers(b, text.areas) + 3 * covers(b, rects) + 3 * covers(b, handRects);
      return over * 10 + Math.hypot(b.x + tw / 2 - cx, b.y + th / 2 - cy);
    };
    let pick = tries.reduce((a, t) => { const v = score(t); return v < a.v ? { t, v } : a; }, { t: tries[0], v: Infinity });
    // 앞 자리가 여전히 거의 그만큼 괜찮으면 그대로(쪽지가 옮겨 다니지 않게)
    if (spot && spot.k === cur.k.key && spot.tw === tw && spot.th === th) {
      const v = score(spot);
      if (v <= pick.v + 150) pick = { t: spot, v };
    }
    const b = box(pick.t);
    spot = { key, k: cur.k.key, tw, th, x: b.x, y: b.y };
  }
  tipEl.style.transform = `translate(${spot.x}px, ${spot.y}px)`;
  tipEl.classList.add('on');
}

function startLoop() { if (!raf) raf = requestAnimationFrame(place); }

/**
 * 대사를 기다리는 동안 '알려 주기만 하는' 쪽지(소개 · 안 눌러도 되는 것)가 떠 있음: 다음 누름은 쪽지를 닫고 대사는 그대로.
 * 자동 넘김도 이것이 풀릴 때까지 기다림(dialogue.js)
 */
function holdNow() {
  if (!cur || !tipText(cur)) return false;
  if (cur.k.need && !cur.intro) return false; // 눌러야 이어지는 것은 그 누름이 곧 할 일
  if (!cur.intro && !cur.k.max) return false;
  return quiet() && Boolean(document.querySelector('#layer-dock .dlg:not(.is-hidden)'));
}

function hideAll() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  rings.forEach((el) => el.classList.remove('on'));
  handEl?.classList.remove('on', 'tap');
  tipEl?.classList.remove('on', 'hold');
  clearInterval(groupTimer);
  groupTimer = null;
}

/** 지금 것을 내림(안 눌러도 되는 것은 MIN_SHOW 넘게 떠 있었으면 한 번으로 세고, 횟수가 차면 배운 것으로) */
function drop() {
  const c = cur;
  cur = null;
  spot = null;
  handLast = null;
  hideAll();
  if (!c) return;
  const k = c.k;
  const now = performance.now();
  lastDrop = now;
  if (!k.guide && k.max && now - c.at >= MIN_SHOW) shows[k.key] = (shows[k.key] || 0) + 1;
  else if (!k.need && !c.intro) snoozeUntil[k.key] = now + SNOOZE_MS; // 읽기 전에 밀려 내려감: 한참 쉬었다 다시
  if (!k.guide && k.max && (shows[k.key] || 0) >= k.max) markSeen(k.key);
}

function begin(pick) {
  cur = { ...pick, line: lineCount, at: performance.now() };
  groupIdx = 0;
  clearInterval(groupTimer);
  if (pick.k.hand === 'group') {
    const tap = () => { handEl.classList.remove('tap'); void handEl.offsetWidth; handEl.classList.add('tap'); };
    setTimeout(tap, 380);
    groupTimer = setInterval(() => { groupIdx += 1; setTimeout(tap, 380); }, GROUP_STEP);
  } else handEl.classList.remove('tap');
  const text = tipText(cur);
  if (text) announce(`처음 보는 버튼: ${text}`);
}

function tick() {
  if (!layer) return;
  const pick = enabled() ? choose() : null;
  if (cur && (!pick || pick.k.key !== cur.k.key)) drop();
  if (!pick) return;
  if (!cur) begin(pick);
  else { cur.els = pick.els; cur.intro = pick.intro; }
  startLoop();
}

/* ---------------- 배운 것 알아채기 ---------------- */
function onPress(e) {
  const t = e.target instanceof Element ? e.target : null;
  if (!t) return;
  for (const k of TUT) {
    if (k.key === 'next' || isSeen(k.key)) continue;
    if (!t.closest(k.sel) || (k.not && t.closest(k.not))) continue;
    markSeen(k.key);
  }
}

/** guide 소개를 끝냄: 늘 있는 버튼은 소개했으면 배운 것으로 */
function disarm() {
  const k = armed && TUT_BY_KEY[armed.key];
  armed = null;
  if (k?.guide) markSeen(k.key);
}

/** 새 대사가 나올 때: guide 소개 기간·쉬는 대사 세기 */
function onLine() {
  lineCount += 1;
  if (introCool > 0) introCool -= 1;
  if (cur?.intro && lineCount > cur.line) { const key = cur.k.key; const long = performance.now() - cur.at >= MIN_SHOW; drop(); if (long) markSeen(key); introCool = 2; }
  if (armed) {
    armed.lines += 1;
    if (armed.lines > armed.span + 1) disarm();
  }
}

export const tutor = {
  init() {
    screenEl = $('#screen');
    layer = $('#layer-tut');
    if (!layer) {
      layer = h('div', { id: 'layer-tut', 'aria-hidden': 'true' });
      screenEl.append(layer);
    }
    const handArt = img.url('ui', 'tut_hand');
    handEl = h('div', { class: 'tut-hand' }, h('div', { class: 'h', html: handArt ? `<img src="${handArt}" alt="">` : HAND_SVG }));
    tipEl = h('div', { class: 'tut-tip' });
    layer.append(handEl, tipEl);
    document.addEventListener('click', onPress, true);
    bus.on('dialogue:tap', () => markSeen('next'));
    bus.on('dialogue:line', onLine);
    bus.on('number-key', () => { if (document.querySelector('#layer-task .cards-wrap.is-in')) markSeen('card'); });
    bus.on('profile', (p) => {
      // 이름을 정하기 전에 배운 것(처음 화면)을 새 학생 기록으로 옮김
      if (p && memSeen.size && !Object.keys(p.tut || {}).length) memSeen.forEach((k) => store.markTut(k));
      drop();
    });
    setInterval(tick, TICK);
  },

  /** 쪽지가 대사를 붙들고 있음(holdNow) */
  holding: holdNow,
  /** 대사창 누름: 쪽지가 떠 있으면 쪽지만 닫고 true(대사는 넘기지 않음) */
  consumeTap() {
    if (!holdNow() || performance.now() - cur.at < ACK_AFTER) return false;
    const c = cur;
    c.at = Math.min(c.at, performance.now() - MIN_SHOW); // 읽고 닫은 것은 한 번 본 것으로
    if (c.intro) { drop(); markSeen(c.k.key); introCool = 2; } else { drop(); snooze[c.k.key] = lineCount; }
    return true;
  },

  /** 이 버튼을 아직 안 배웠으면 true (guide 비트가 안내 대사를 할지 정함) */
  wants(key) { return enabled() && Boolean(store.active()) && !isSeen(key); },

  /** guide 비트: 이 버튼을 안내 대사와 다음 span 개 대사 동안 먼저 알려 줌 */
  arm(key, span = 2) {
    disarm();
    armed = { key, lines: 0, span };
    if (cur && cur.k.key !== key) drop();
  },

  /** 에피소드 시작·끝 (프롤로그 밖에서만 늘 있는 버튼을 조용한 대사 때 소개) */
  setEpisode(id) {
    introMode = Boolean(id) && id !== 'prologue';
    introCool = 2;
    disarm();
    drop();
  },

  /** 설정의 '처음부터 다시 알려 주기' */
  reset() {
    store.resetTut();
    memSeen.clear();
    Object.keys(shows).forEach((k) => delete shows[k]);
    drop();
  },

  /** 디버그·자동 테스트용 */
  current() {
    if (!cur) return null;
    const pointed = cur.k.hand === 'group' ? cur.els[groupIdx % cur.els.length] : cur.els[0];
    return { key: cur.k.key, n: cur.els.length, intro: Boolean(cur.intro), pointed };
  },
};
