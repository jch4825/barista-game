/**
 * 선물 · 꾸미기가 보이는 곳(검수 13.91, PRD Q-54. 2026-11-08 사용자 "가게 꾸미기 메뉴는 실제로 구매해도 변화가 전혀 없다" → '추천 순서')
 *  - counterDecos(): 작업대 카운터의 창틀 위에 산 카운터 꾸미기(brew.js 가 판에 넣음)
 *  - frontDecos(): 처음 화면의 카페 앞에 산 가게 앞 꾸미기(title.js)
 *  - showGift(it): 선물을 주는 장면(사장님은 얼굴 + 말, 가족은 집에서 온 문자) → 지은의 속마음. 수첩의 [다시 보기]도 같은 장면
 *  - showPlaced(it): 꾸미기를 산 뒤 '여기에 놓았어요'(그 장면을 작게, 새 물건에 금빛 테두리 + 반짝이. 빛살 없음)
 * 그림(objects/{id})이 없으면 동그라미 아이콘(대체 요망: docs/image_requests.md 8.6 sheet_gift). 읽어 주는 말은 tools/export-lines.mjs 의 '선물 · 꾸미기'(같은 문장을 여기와 함께 고침)
 */

import { $, h, sleep, dur, announce } from '../core/dom.js';
import { ICON } from '../data/icons.js';
import { img } from '../core/assets.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { input } from '../core/input.js';
import { faceHTML, CHARS } from '../data/characters.js';
import { renderBg } from '../data/backgrounds.js';
import * as grow from '../core/grow.js';
import { vfx } from './vfx.js';

/** 카운터 그림(workbench_morning)의 창틀 윗면: 판 아래에서 %(물건 바닥) */
export const SILL = 48.3;

const artOf = (it) => (img.has('objects', it.id) ? `<img src="${img.url('objects', it.id)}" alt="" draggable="false">` : `<i class="dc-ico">${ICON(it.icon)}</i>`);

/** 카운터 창틀 위의 꾸미기(산 것만, 누르지 않는 그림). mark: 금빛으로 짚을 물건 id */
export function counterDecos({ mark = null } = {}) {
  const items = grow.SHOP.filter((it) => it.kind === 'counter' && (grow.owns(it.id) || it.id === mark));
  if (!items.length) return null;
  return h('div', { class: 'bw-decos', 'aria-hidden': 'true' }, ...items.map((it) => h('span', {
    class: `bw-deco d-${it.id}${img.has('objects', it.id) ? ' has-art' : ''}${it.id === mark ? ' is-new' : ''}`,
    style: { left: `${it.sill}%`, bottom: `${SILL}%`, height: `${it.h}%` },
    html: artOf(it),
  })));
}

/** 처음 화면의 카페 앞 꾸미기(산 것만). 그림이 있으면 그 물건 그림, 없으면 동그라미 아이콘 */
export function frontDecos({ mark = null } = {}) {
  const items = grow.SHOP.filter((it) => it.kind === 'deco' && (grow.owns(it.id) || it.id === mark));
  if (!items.length) return null;
  return h('div', { class: 'tt-deco', 'aria-label': `가게 꾸미기: ${items.map((it) => it.name).join(', ')}` },
    ...items.map((it) => {
      const art = img.has('objects', it.id);
      return h('span', { class: `tt-deco-item d-${it.id}${art ? ' has-art' : ''}${it.id === mark ? ' is-new' : ''}`, title: it.name, style: { left: `${it.spot[0]}%`, top: `${it.spot[1]}%` },
        html: art ? `<img src="${img.url('objects', it.id)}" alt="" draggable="false">` : ICON(it.icon) });
    }));
}

/* ---------- 창 띄우기(수첩 같은 전체 화면 위: #layer-modal) ---------- */
function mount(el) {
  const host = $('#layer-modal') || $('#layer-overlay');
  host.append(el);
  input.pushScope(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  return () => {
    input.popScope(el);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(260));
  };
}
const clicked = (btn) => new Promise((resolve) => btn.addEventListener('click', (e) => { e.stopPropagation(); resolve(); }, { once: true }));
const btn = (label, icon, cls = '') => h('button', { class: `btn btn-big ${cls}`.trim() }, h('i', { html: ICON(icon) }), h('span', { text: label }));

/** 선물 상자(임시 그림이 아니라 늘 쓰는 포장: 크림 종이 + 초록 리본) */
const BOX = `<svg viewBox="0 0 200 180" aria-hidden="true">
  <rect x="22" y="70" width="156" height="100" rx="8" fill="#F4EAD2" stroke="#5E4520" stroke-width="5"/>
  <rect class="gf-lid" x="12" y="44" width="176" height="34" rx="7" fill="#FFF7E6" stroke="#5E4520" stroke-width="5"/>
  <rect x="88" y="70" width="24" height="100" fill="#25844A" stroke="#1B5E35" stroke-width="3"/>
  <rect class="gf-lid" x="88" y="44" width="24" height="34" fill="#25844A" stroke="#1B5E35" stroke-width="3"/>
  <path class="gf-lid" d="M100 44 C 78 10, 48 22, 66 42 Z M100 44 C 122 10, 152 22, 134 42 Z" fill="#2E9C5A" stroke="#1B5E35" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

/**
 * 선물 주기: 상자 → [드리기]/[보내기] → 상자가 열리고 물건 → 받는 사람의 말(사장님: 얼굴 · 말, 가족: 집에서 온 문자) 한 칸씩 → 지은의 속마음 → [닫기]
 * 감점 · 점수 없음. 단골 신뢰에 더하지 않음(원칙 1 · 7)
 */
export async function showGift(it) {
  const to = grow.GIFT_TO[it.to] || grow.GIFT_TO.owner;
  const owner = it.to === 'owner';
  const stage = h('div', { class: 'gf-stage' }, h('span', { class: 'gf-box', html: BOX }), h('span', { class: 'gf-item', html: artOf(it) }));
  const talk = h('div', { class: 'gf-talk', 'aria-live': 'polite' });
  const next = btn(owner ? '드리기' : '보내기', 'gift', 'btn-main');
  const card = h('div', { class: `gf-card to-${it.to}` },
    h('p', { class: 'gf-head', text: to.head }),
    h('h2', { class: 'gf-name', text: it.name }),
    stage, talk, h('div', { class: 'gf-btns' }, next));
  const el = h('section', { class: 'ov ov-gift', role: 'dialog', 'aria-label': `선물: ${it.name}` }, card);
  const close = mount(el);
  next.focus({ preventScroll: true });
  announce(`${to.head} ${it.name}`);
  tts.speak(to.head, 'sys');
  await clicked(next);

  // 상자 열기
  tts.stop();
  card.classList.add('is-open');
  audio.sfx('good');
  setTimeout(() => vfx.sparkleAt(stage, { n: 14, colors: ['#FFD43B', '#FFFFFF', '#6FD49A'] }), dur(300));
  next.querySelector('span').textContent = '다음';
  next.querySelector('i').innerHTML = ICON('arrow_right');
  await sleep(dur(500));

  const show = (node, text, voice) => {
    talk.replaceChildren(node);
    announce(text);
    return tts.speak(text, voice);
  };
  if (!owner) {
    audio.sfx('phone');
    talk.replaceChildren(h('p', { class: 'gf-reply', text: to.reply }));
    announce(to.reply);
    await tts.speak(to.reply, 'sys');
  }
  for (const line of it.lines) {
    const node = owner
      ? h('div', { class: 'gf-say' }, h('span', { class: 'gf-face', html: faceHTML('owner', 'smile') }), h('div', {}, h('b', { text: CHARS.owner?.name || '사장님' }), h('p', { text: line })))
      : h('div', { class: 'gf-phone' }, h('small', { text: to.reply }), h('p', { class: 'gf-bubble', text: line }));
    show(node, line, owner ? 'owner' : 'narr');
    next.focus({ preventScroll: true });
    await clicked(next);
    tts.stop();
  }
  // 지은의 속마음 → 닫기
  show(h('p', { class: 'gf-think' }, h('span', { class: 'gf-face', html: faceHTML('jieun', 'smile') }), h('em', { text: grow.GIFT_END })), grow.GIFT_END, 'think');
  next.querySelector('span').textContent = '닫기';
  next.querySelector('i').innerHTML = ICON('check');
  next.focus({ preventScroll: true });
  await clicked(next);
  tts.stop();
  close();
  await sleep(dur(200));
}

/** 꾸미기를 산 뒤: 그 물건이 놓인 장면을 작게(1920 × 1080 판을 줄여 그림). 새 물건은 금빛 테두리 + 반짝이 */
export async function showPlaced(it) {
  const counter = it.kind === 'counter';
  const [title, note] = grow.PLACED_SAY[counter ? 'counter' : 'front'];
  const inner = h('div', { class: `pl-inner ${counter ? 'is-counter' : 'is-front'}` });
  if (counter) {
    if (img.has('bg', 'workbench_morning')) inner.style.backgroundImage = `url('${img.url('bg', 'workbench_morning')}')`;
    const decos = counterDecos({ mark: it.id });
    if (decos) inner.append(decos);
  } else {
    inner.append(h('div', { class: 'tt-bg', html: renderBg('title_cafe', 'dusk') }));
    const decos = frontDecos({ mark: it.id });
    if (decos) inner.append(decos);
  }
  const ok = btn('좋아요', 'check', 'btn-main');
  const el = h('section', { class: 'ov ov-placed', role: 'dialog', 'aria-label': title },
    h('div', { class: 'pl-card' }, h('h2', { text: title }), h('div', { class: 'pl-scene' }, inner), h('p', { class: 'pl-note', text: note }), ok));
  const close = mount(el);
  ok.focus({ preventScroll: true });
  announce(`${it.name}. ${title} ${note}`);
  tts.speak(`${title} ${note}`, 'sys');
  setTimeout(() => { const n = el.querySelector('.is-new'); if (n) vfx.sparkleAt(n, { n: 14, colors: ['#FFD43B', '#FFFFFF', '#FFE9A8'] }); }, dur(450));
  await clicked(ok);
  tts.stop();
  close();
  await sleep(dur(200));
}
