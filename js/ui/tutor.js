/**
 * 처음 보는 버튼 알려 주기 (튜토리얼)
 *  - 처음 나오는 버튼·행동 종류에 무지개 테두리가 돌고, 손가락이 누르는 시늉을 하고, 짧은 쪽지가 붙습니다.
 *  - 한 번에 한 종류만(목록 js/data/tutorial.js 의 위에서부터). 누르면 학생마다 '배운 것'으로 기록되어 다시 나오지 않습니다.
 *  - 그림은 #layer-tut 에만 그립니다. 버튼의 모양·배치·초점은 그대로이고, 누르기도 막지 않습니다(pointer-events: none).
 *  - 프롤로그의 guide(key, 안내) 비트가 늘 있는 버튼(되감기·메모·멈춤…)을 이야기 흐름에 맞춰 하나씩 소개합니다.
 *    프롤로그를 건너뛴 학생에게는 다른 이야기의 조용한 대사 때 쪽지로 하나씩 소개합니다.
 *  - 움직임 줄이기: 테두리는 멈춘 무지개, 손가락은 가만히(여러 칸 고르기는 손가락 없이). 차분 모드: 천천히, 은은하게.
 *  - 빛이 가운데에서 퍼지는 연출은 쓰지 않습니다(CLAUDE.md 2-8). 무지개는 버튼 테두리 띠에만 돕니다.
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
const shows = {};              // 안 눌러도 되는 것: 보여 준 횟수
const counted = new WeakSet();
const radiusCache = new WeakMap();

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
  for (const k of TUT) {
    if (k.guide || isSeen(k.key) || (k.after && !isSeen(k.after))) continue;
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
  const hand = placeHand(rects, sr, s);
  placeTip(rects, hand);
  raf = requestAnimationFrame(place);
}

function placeHand(rects, sr, s) {
  const mode = cur.k.hand;
  if (!rects.length || !mode || (mode === 'group' && reduced())) { handEl.classList.remove('on'); return null; }
  let r = rects[0];
  if (mode === 'group') r = rects[groupIdx % rects.length];
  else if (cur.k.handAt) {
    const at = cur.els[0].querySelector(cur.k.handAt);
    if (at) r = conv(at.getBoundingClientRect(), sr, s);
  }
  // 손가락 방향: 아래에 자리가 있으면 아래에서 위로 짚음(오른쪽이 모자라면 왼쪽 아래에서).
  // 화면 아래쪽 버튼(대화창 버튼 등)은 옆에서 짚어 대사 글자를 가리지 않음
  let side = '';
  let ax;
  let ay;
  if (mode === 'group' || r.y + r.h + 160 <= H) {
    const wide = mode === 'on' && !cur.k.handAt && r.w > 220; // 넓은 버튼은 글자를 피해 오른쪽 아래
    ax = wide ? r.x + r.w * 0.82 : r.x + r.w / 2;
    ay = mode === 'group' ? r.y + r.h * 0.9 : wide ? r.y + r.h * 0.7 : r.y + r.h * 0.8;
    if (ax + 120 > W) side = 'fx';
  } else if (r.x + r.w + 180 <= W) {
    side = 'sr'; ax = r.x + r.w + 2; ay = r.y + r.h / 2;
  } else {
    side = 'sl'; ax = r.x - 2; ay = r.y + r.h / 2;
  }
  handEl.classList.remove('fx', 'sr', 'sl');
  if (side) handEl.classList.add(side);
  handEl.classList.toggle('travel', mode === 'group');
  handEl.style.transform = `translate(${ax}px, ${ay}px)`;
  handEl.classList.add('on');
  return { x: ax, y: ay, side, r };
}

function placeTip(rects, hand) {
  const text = tipText(cur);
  if (!text || !rects.length) { tipEl.classList.remove('on'); return; }
  if (tipEl.textContent !== text) tipEl.textContent = text;
  const u = rects.reduce((a, r) => ({
    x1: Math.min(a.x1, r.x), y1: Math.min(a.y1, r.y), x2: Math.max(a.x2, r.x + r.w), y2: Math.max(a.y2, r.y + r.h),
  }), { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity });
  const tw = tipEl.offsetWidth;
  const th = tipEl.offsetHeight;
  let x;
  let y;
  const sideX = hand?.side === 'sr' ? hand.x + 170 : hand?.side === 'sl' ? hand.x - 170 - tw : null;
  if (sideX !== null && sideX >= 16 && sideX + tw <= W - 16) {
    // 옆에서 짚는 손가락 바깥쪽, 같은 높이
    y = hand.y - th / 2;
    x = sideX;
  } else if (sideX !== null) {
    // 옆에 자리가 없으면(화면 가장자리 · 작업대의 [누르고 있기]) 버튼 위에: 쪽지가 손가락에 가리지 않게
    x = (u.x1 + u.x2) / 2 - tw / 2;
    y = u.y1 - th - 26;
  } else {
    // 위가 비어 있으면 위에, 아니면(위쪽 줄 버튼) 손가락 아래에
    x = (cur.k.hand === 'on' && hand ? hand.x : (u.x1 + u.x2) / 2) - tw / 2;
    y = u.y1 - th - 26;
    if (y < 16) y = u.y2 + (hand ? 176 : 26);
  }
  x = Math.max(16, Math.min(W - tw - 16, x));
  y = Math.max(16, Math.min(H - th - 16, y));
  tipEl.style.transform = `translate(${x}px, ${y}px)`;
  tipEl.classList.add('on');
}

function startLoop() { if (!raf) raf = requestAnimationFrame(place); }

function hideAll() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  rings.forEach((el) => el.classList.remove('on'));
  handEl?.classList.remove('on', 'tap');
  tipEl?.classList.remove('on');
  clearInterval(groupTimer);
  groupTimer = null;
}

/** 지금 것을 내림(안 눌러도 되는 것은 보여 준 횟수가 차면 배운 것으로) */
function drop() {
  const c = cur;
  cur = null;
  hideAll();
  if (!c) return;
  const k = c.k;
  if (!k.guide && k.max && (shows[k.key] || 0) >= k.max) markSeen(k.key);
}

function begin(pick) {
  cur = { ...pick, line: lineCount };
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
  if (cur.els.some((el) => !counted.has(el))) {
    shows[cur.k.key] = (shows[cur.k.key] || 0) + 1;
    cur.els.forEach((el) => counted.add(el));
  }
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
  if (cur?.intro && lineCount > cur.line) { const key = cur.k.key; drop(); markSeen(key); introCool = 2; }
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
  current() { return cur ? { key: cur.k.key, n: cur.els.length, intro: Boolean(cur.intro) } : null; },
};
