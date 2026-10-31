/**
 * 무대: 배경 + 인물 + 카메라 + 특수 효과 + 이벤트 CG
 *  - 인물은 스탠딩 그림(assets/stand/)이 있으면 스탠딩으로, 없으면 '오늘의 한 장' 모티프의 폴라로이드로 섭니다.
 *  - 스탠딩: 숨쉬기, 눈 깜빡임(_blink), 말하는 입(_talk), 자리 방향에 맞춰 좌우 반전
 *  - 표정이 바뀌면 감정 이모트가 잠깐 뜹니다(emote.js).
 */

import { $, h, sleep, dur } from '../core/dom.js';
import { img } from '../core/assets.js';
import { renderBg } from '../data/backgrounds.js';
import { CHARS, portraitHTML, resolveFace, hasStand, standURL, standFace } from '../data/characters.js';
import { popEmote, FACE_EMOTE } from './emote.js';
import { cgPlaceholder } from './cg-placeholder.js';
import { CGS } from '../data/cg.js';

const SLOTS = ['left', 'center', 'right'];
const WANT_LOOK = { left: 'right', right: 'left' }; // 자리별로 인물이 바라봐야 하는 쪽(무대 가운데)
const state = { bg: null, variant: null, cast: { left: null, center: null, right: null }, camera: 'normal', fx: {}, cg: null, chalk: null };
let bgA;
let bgB;
let showingA = true;
let stageEl;
let fxEl;
let cgEl;
let chalkEl;
let blinkTimer = null;
let talkTimer = null;
let talkWho = null;

function parseCast(v) {
  if (!v) return null;
  if (typeof v === 'object') return { id: v.id, face: v.face || 'normal' };
  const [id, face] = String(v).split(':');
  return { id, face: face || 'normal' };
}

function polaroid(slot, c) {
  const ch = CHARS[c.id] || { name: c.id, role: '' };
  const el = h('figure', { class: `pol slot-${slot}`, 'data-char': c.id, 'data-slot': slot },
    h('div', { class: 'pol-photo', html: portraitHTML(c.id, c.face) }),
    h('figcaption', { class: 'pol-cap' }, h('b', { text: ch.name }), ch.role ? h('span', { text: ch.role }) : null));
  el.style.setProperty('--accent', ch.color || '#888');
  return el;
}

function standImgs(id, face) {
  const base = standURL(id, face);
  const blink = standURL(id, face, 'blink');
  const talk = standURL(id, face, 'talk');
  return [
    h('img', { class: 'st-img', src: base, alt: '', draggable: 'false' }),
    blink ? h('img', { class: 'st-blink', src: blink, alt: '', draggable: 'false' }) : null,
    talk ? h('img', { class: 'st-talk', src: talk, alt: '', draggable: 'false' }) : null,
  ].filter(Boolean); // replaceChildren 은 null 을 글자 'null' 로 넣음
}

function standing(slot, c) {
  const ch = CHARS[c.id] || { name: c.id };
  const flip = ch.look && WANT_LOOK[slot] && ch.look !== WANT_LOOK[slot];
  const body = h('div', { class: 'st-body' }, ...standImgs(c.id, c.face));
  const el = h('figure', { class: `stand slot-${slot} ${flip ? 'flip' : ''}`, 'data-char': c.id, 'data-slot': slot, 'data-face': standFace(c.id, c.face) },
    body, h('figcaption', { class: 'st-name', text: ch.name }));
  el.style.setProperty('--accent', ch.color || '#888');
  if (ch.standScale) el.style.setProperty('--st-scale', String(ch.standScale)); // 손님은 조금 작게(발밑 기준)
  el.dataset.nextBlink = String(Date.now() + 1500 + Math.random() * 3000);
  return el;
}

function figure(slot, c) {
  return hasStand(c.id) ? standing(slot, c) : polaroid(slot, c);
}

function slotEl(slot) {
  return stageEl.querySelector(`[data-slot="${slot}"]`);
}

/** 스탠딩 눈 깜빡임 (2.6~5.6초마다 0.13초) */
function tickBlink() {
  const now = Date.now();
  stageEl.querySelectorAll('.stand').forEach((el) => {
    const b = el.querySelector('.st-blink');
    if (!b || el.classList.contains('talking')) return;
    if (now >= Number(el.dataset.nextBlink || 0)) {
      el.classList.add('blinking');
      setTimeout(() => el.classList.remove('blinking'), 130);
      el.dataset.nextBlink = String(now + 2600 + Math.random() * 3000);
    }
  });
}

export const stage = {
  init() {
    const layer = $('#layer-bg');
    bgA = h('div', { class: 'bg-layer is-on' });
    bgB = h('div', { class: 'bg-layer' });
    fxEl = h('div', { class: 'bg-fx' });
    cgEl = h('div', { class: 'bg-cg', 'aria-hidden': 'true' });
    chalkEl = h('div', { class: 'bg-chalk', 'aria-hidden': 'true' });
    layer.replaceChildren(bgA, bgB, fxEl, cgEl, chalkEl);
    stageEl = $('#layer-stage');
    clearInterval(blinkTimer);
    blinkTimer = setInterval(tickBlink, 250);
  },

  async setBg(id, variant) {
    if (state.cg) stage.setCg(null);
    if (state.chalk) stage.chalk(null);
    if (state.bg === id && state.variant === variant) return;
    state.bg = id;
    state.variant = variant || null;
    const next = showingA ? bgB : bgA;
    const prev = showingA ? bgA : bgB;
    next.innerHTML = renderBg(id, variant);
    next.dataset.bg = `${id}${variant ? `_${variant}` : ''}`;
    next.classList.add('is-on');
    prev.classList.remove('is-on');
    showingA = !showingA;
    await sleep(dur(500));
    if (!prev.classList.contains('is-on')) prev.innerHTML = '';
  },

  /**
   * 이벤트 CG (assets/cg/cg_{id}.jpg). 그림이 없으면 임시 그림(cg-placeholder.js, 대체 요망)을 띄움.
   * js/data/cg.js 에 없는 id 면 아무것도 하지 않고 false. 바뀌면 칠판 글씨(chalk)는 지움
   */
  setCg(id) {
    const u = id ? img.url('cg', `cg_${id}`) : null;
    const ph = id && !u ? cgPlaceholder(id) : null;
    if (id && !u && !ph) return false;
    if (state.cg !== (id || null)) stage.chalk(null);
    state.cg = id || null;
    if (id) {
      cgEl.replaceChildren(u ? h('img', { src: u, alt: '' }) : ph);
      requestAnimationFrame(() => cgEl.classList.add('is-on'));
    } else {
      cgEl.classList.remove('is-on');
      setTimeout(() => { if (!state.cg) cgEl.replaceChildren(); }, dur(500));
    }
    stageEl.classList.toggle('cg-on', Boolean(id));
    return Boolean(id);
  },

  /**
   * 칠판 글씨(분필): 지금 CG 의 칠판 자리(cg.js 의 chalk: { x, y, w, rot } %)에 글자를 한 자씩 삐뚤게 씀. null 이면 지움.
   * 사장님이 쓰는 글씨는 shaky: true(글자마다 조금씩 기울고 오르내림, PRD 5.5 '글씨가 삐뚤다')
   */
  chalk(text, { shaky = false, instant = false } = {}) {
    state.chalk = text ? { text, shaky } : null;
    if (!chalkEl) return;
    if (!text) { chalkEl.replaceChildren(); chalkEl.classList.remove('is-on'); return; }
    const spot = CGS[state.cg]?.chalk || { x: 50, y: 34, w: 46, rot: 0 };
    const lines = String(text).split('\n');
    let n = 0;
    const box = h('div', { class: `chalk-text ${shaky ? 'is-shaky' : ''}`.trim(), style: { left: `${spot.x}%`, top: `${spot.y}%`, width: `${spot.w}%`, '--rot': `${spot.rot || 0}deg` } },
      ...lines.map((ln) => h('span', { class: 'chalk-line' }, ...[...ln].map((ch) => {
        n += 1;
        const r = shaky ? ((n * 37) % 11) - 5 : 0; // 같은 글씨는 늘 같은 모양(무작위 아님)
        const dy = shaky ? ((n * 53) % 9) - 4 : 0;
        return h('i', { text: ch, style: { '--r': `${r}deg`, '--dy': `${dy}px`, '--d': instant ? '0s' : `${(n * 0.12).toFixed(2)}s` } });
      }))));
    chalkEl.replaceChildren(box);
    chalkEl.classList.add('is-on');
  },

  /** 출연진 전체 교체: { left:'jieun:smile', right:'owner' } (빠진 칸은 비움) */
  setCast(cast = {}, { replace = true } = {}) {
    for (const slot of SLOTS) {
      if (!replace && !(slot in cast)) continue;
      const want = parseCast(cast[slot]);
      const cur = state.cast[slot];
      const el = slotEl(slot);
      if (!want) {
        if (el) {
          el.classList.add('m-out');
          setTimeout(() => el.remove(), dur(320));
        }
        state.cast[slot] = null;
        continue;
      }
      if (cur && el && cur.id === want.id) {
        if (cur.face !== want.face) stage.setFace(want.id, want.face);
        continue;
      }
      if (el) el.remove();
      const node = figure(slot, want);
      node.classList.add('m-in');
      stageEl.append(node);
      setTimeout(() => node.classList.remove('m-in'), dur(450));
      state.cast[slot] = { ...want };
    }
  },

  /** 한 사람만 들어오기 / 나가기 */
  enter(slot, v) { stage.setCast({ [slot]: v }, { replace: false }); },
  leave(who) {
    for (const slot of SLOTS) if (state.cast[slot]?.id === who) stage.setCast({ [slot]: null }, { replace: false });
  },

  setFace(who, face) {
    for (const slot of SLOTS) {
      const c = state.cast[slot];
      if (!c || c.id !== who) continue;
      if (c.face === face) return;
      const prevFace = c.face;
      c.face = face;
      const el = slotEl(slot);
      if (el?.classList.contains('stand')) {
        const f = standFace(who, face);
        if (el.dataset.face !== f) {
          el.dataset.face = f;
          el.querySelector('.st-body').replaceChildren(...standImgs(who, face));
          el.classList.remove('m-pop');
          void el.offsetWidth;
          el.classList.add('m-pop');
        }
      } else {
        const photo = el?.querySelector('.pol-photo');
        if (photo && resolveFace(who, prevFace) !== resolveFace(who, face)) {
          photo.classList.add('swap');
          setTimeout(() => {
            photo.innerHTML = portraitHTML(who, face);
            photo.classList.remove('swap');
          }, dur(90));
        }
      }
      if (FACE_EMOTE[face] && FACE_EMOTE[face] !== FACE_EMOTE[prevFace]) stage.emote(who, FACE_EMOTE[face]);
    }
  },

  isOnStage(who) { return SLOTS.some((s) => state.cast[s]?.id === who); },
  /** 무대에 선 사람의 지금 표정 (없으면 null) */
  faceOf(who) { return SLOTS.map((s) => state.cast[s]).find((c) => c?.id === who)?.face || null; },

  /** 감정 이모트 (무대에 없으면 false) */
  emote(who, kind) {
    const el = stageEl.querySelector(`[data-char="${who}"]`);
    if (!el) return false;
    popEmote(el, kind);
    return true;
  },

  /** 말하는 사람 강조 (who 가 무대에 없으면 모두 보통) */
  focus(who) {
    const any = stage.isOnStage(who);
    stageEl.querySelectorAll('.pol, .stand').forEach((el) => {
      const me = el.dataset.char === who;
      el.classList.toggle('speaking', any && me);
      el.classList.toggle('dim', any && !me);
    });
  },

  /** 말하는 동안 입 움직이기 (_talk 그림이 있는 스탠딩만) */
  talk(who, on) {
    clearInterval(talkTimer);
    stageEl.querySelectorAll('.stand.talking').forEach((el) => el.classList.remove('talking', 'mouth'));
    talkWho = on ? who : null;
    if (!on) return;
    const el = stageEl.querySelector(`.stand[data-char="${who}"]`);
    if (!el?.querySelector('.st-talk')) return;
    el.classList.add('talking');
    talkTimer = setInterval(() => {
      if (talkWho !== who || !el.isConnected) { clearInterval(talkTimer); return; }
      el.classList.toggle('mouth');
    }, 140);
  },

  motion(who, type) {
    stageEl.querySelectorAll(`[data-char="${who}"]`).forEach((el) => {
      const cls = `m-${type}`;
      el.classList.remove(cls);
      void el.offsetWidth;
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), dur(1300));
    });
  },

  camera(mode = 'normal') {
    state.camera = mode;
    const root = $('#screen');
    root.classList.remove('cam-left', 'cam-right', 'cam-center');
    if (mode !== 'normal') root.classList.add(`cam-${mode}`);
  },

  /** 특수 효과: overload(소리 과부하), earplugs(먹먹함), flash, shake, sepia, dark */
  effect(name, on = true) {
    state.fx[name] = on;
    $('#screen').classList.toggle(`fx-${name}`, Boolean(on));
    if (name === 'shake' && on) setTimeout(() => stage.effect('shake', false), dur(500));
    if (name === 'flash' && on) setTimeout(() => stage.effect('flash', false), dur(400));
  },

  hideCast(hidden) { stageEl.classList.toggle('is-hidden', Boolean(hidden)); },

  getState() {
    return JSON.parse(JSON.stringify({ bg: state.bg, variant: state.variant, cast: state.cast, camera: state.camera, fx: state.fx, cg: state.cg, chalk: state.chalk }));
  },

  restore(st) {
    if (!st) return;
    stageEl.replaceChildren();
    state.cast = { left: null, center: null, right: null };
    if (st.bg) {
      state.bg = null;
      stage.setBg(st.bg, st.variant);
    }
    stage.setCg(st.cg || null);
    if (st.chalk) stage.chalk(st.chalk.text, { shaky: st.chalk.shaky, instant: true });
    stage.setCast(Object.fromEntries(SLOTS.map((s) => [s, st.cast?.[s] ? `${st.cast[s].id}:${st.cast[s].face}` : null])));
    stage.camera(st.camera || 'normal');
    const root = $('#screen');
    [...root.classList].filter((c) => c.startsWith('fx-')).forEach((c) => root.classList.remove(c));
    state.fx = {};
    for (const [k, v] of Object.entries(st.fx || {})) if (v && k !== 'shake' && k !== 'flash') stage.effect(k, true);
  },

  clear() {
    stageEl.replaceChildren();
    state.cast = { left: null, center: null, right: null };
    stage.setCg(null);
    stage.chalk(null);
    stage.camera('normal');
    const root = $('#screen');
    [...root.classList].filter((c) => c.startsWith('fx-')).forEach((c) => root.classList.remove(c));
    state.fx = {};
  },
};
