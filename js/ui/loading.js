/**
 * 출근 중 화면: 에피소드(하루)를 시작할 때 그날 쓰는 그림을 미리 받아 둡니다(2026-10-18, 웹판에서 스탠딩이 늦게 뜨던 문제).
 *  - 대본 비트를 훑어 나오는 인물(의상 포함)의 스탠딩·표정 초상, 배경, 사진, CG 를 모아 new Image() 로 받습니다.
 *    소품·효과 그림은 작으므로 처음 한 번 모두 받습니다. 받은 그림은 PRELOADED 에 붙잡아 두어 브라우저가 버리지 않게 합니다.
 *  - 화면: '출근 중…'과 진행 막대. 그림이 모두 이미 받아져 있으면 짧게만 보입니다.
 *  - 너무 오래 걸리면(MAX_MS) 기다리지 않고 시작합니다(못 받은 그림은 나올 때 받음). 읽어 주는 말은 없습니다(글자만).
 *  - 앱을 켜면 모든 그림을 뒤에서 미리 받아 둡니다(warmAll, 2026-10-26 사용자: 웹판에서 그림이 자꾸 한 템포 늦게 뜸).
 *    표지·근무표·결과 화면처럼 출근 중 화면이 챙기지 않던 것도 함께. 그날 그림은 여기서 다시 받지 않고 풀기만 합니다.
 */

import { h, sleep } from '../core/dom.js';
import { img } from '../core/assets.js';
import { CHARS } from '../data/characters.js';
import { PHOTOS } from '../data/photos.js';

const MIN_MS = 900; // 화면이 번쩍 지나가지 않게
const MAX_MS = 15000;
const WARM_AT_ONCE = 6; // 뒤에서 미리 받기: 동시에 받는 수
const PRELOADED = new Map(); // url → Promise<Image|null> (같은 그림은 한 번만, 붙잡아 두어 브라우저가 버리지 않게)
let warming = null;

/** 그림 받기만(풀기 전). low: 뒤에서 미리 받기(화면에 나올 그림보다 나중에) */
function fetchImage(url, low = false) {
  if (!url) return Promise.resolve(null);
  if (!PRELOADED.has(url)) {
    PRELOADED.set(url, new Promise((resolve) => {
      const im = new Image();
      if (low) im.fetchPriority = 'low';
      im.onload = () => resolve(im);
      im.onerror = () => resolve(null);
      im.src = url;
    }));
  }
  return PRELOADED.get(url);
}

/** 받고 풀어 두기(그날 그림: 화면에 나오자마자 그려지게) */
function load(url) {
  return fetchImage(url).then((im) => (im?.decode ? im.decode().catch(() => {}).then(() => im) : im));
}

/** 비트 안의 모든 값(fail·praise·then·branch… 속까지)을 훑음 */
function walk(v, fn) {
  if (Array.isArray(v)) { for (const x of v) walk(x, fn); return; }
  if (!v || typeof v !== 'object') return;
  if (v.t) fn(v);
  for (const x of Object.values(v)) if (x && typeof x === 'object') walk(x, fn);
}

/** 그 에피소드에서 쓰는 그림 주소 목록 */
export function episodeImages(ep) {
  const who = new Set();
  const bgs = new Set();
  const photos = new Set(ep.photo ? [ep.photo] : []);
  const cgs = new Set();
  const addWho = (s) => {
    if (typeof s !== 'string') return;
    const id = s.split(':')[0];
    if (CHARS[id]) who.add(id);
  };
  walk(ep.script || [], (b) => {
    if (b.t === 'bg') bgs.add(b.variant ? `${b.id}_${b.variant}` : b.id);
    else if (b.t === 'photo') photos.add(b.id);
    else if (b.t === 'cg' && b.id) cgs.add(b.id);
    else if (b.t === 'show') Object.values(b.cast || {}).forEach(addWho);
    for (const k of ['who', 'mentor', 'helper', 'from']) addWho(b[k]);
  });

  const urls = [];
  const stand = Object.keys(img.list('stand'));
  for (const id of who) {
    const c = ep.costume?.[id];
    const key = c && img.has('stand', `${id}-${c}_normal`) ? `${id}-${c}` : id;
    for (const k of stand) if (k.startsWith(`${key}_`)) urls.push(img.url('stand', k));
    for (const f of CHARS[id].faces || []) urls.push(`./assets/portraits/${id}_${f}.jpg`);
  }
  for (const k of bgs) urls.push(img.url('bg', k));
  for (const id of photos) urls.push(img.url('photos', PHOTOS[id]?.file || id));
  for (const id of cgs) urls.push(img.url('cg', `cg_${id}`));
  // 소품·효과·되감기 방은 어느 날이든 쓰고 작으므로 모두
  for (const kind of ['items', 'vfx']) for (const k of Object.keys(img.list(kind))) urls.push(img.url(kind, k));
  urls.push(img.url('bg', 'rewind_room'));
  return [...new Set(urls.filter(Boolean))];
}

/**
 * 모든 그림을 뒤에서 미리 받기(앱을 켤 때 한 번). first: 먼저 받을 이야기(이어 하기)
 *  - 순서: 그 이야기 → 소품·효과·되감기 방 → 배경 → 스탠딩 → 초상·사진·CG. 동시에 6개씩, 낮은 우선순위.
 *  - 받기만 하고 풀지(decode)는 않습니다: 모두 풀어 두면 메모리가 수백 MB(스탠딩 한 장 = 4MB). 그날 그림은 출근 중 화면이 풉니다.
 */
export function warmAll(first = null) {
  if (warming) return warming;
  const urls = new Set(first ? episodeImages(first) : []);
  const add = (u) => { if (u) urls.add(u); };
  for (const kind of ['items', 'vfx', 'ui', 'emotes', 'sd', 'objects', 'shots']) for (const k of Object.keys(img.list(kind))) add(img.url(kind, k));
  add(img.url('bg', 'rewind_room'));
  for (const kind of ['bg', 'stand']) for (const k of Object.keys(img.list(kind))) add(img.url(kind, k));
  for (const [id, c] of Object.entries(CHARS)) for (const f of c.faces || []) add(`./assets/portraits/${id}_${f}.jpg`);
  for (const kind of ['photos', 'cg']) for (const k of Object.keys(img.list(kind))) add(img.url(kind, k));
  const list = [...urls];
  let i = 0;
  warm.total = list.length;
  const worker = async () => { while (i < list.length) { await fetchImage(list[i++], true); warm.done += 1; } };
  warming = Promise.all(Array.from({ length: WARM_AT_ONCE }, worker));
  return warming;
}
const warm = { done: 0, total: 0 };
/** 뒤에서 미리 받기 진행 { done, total } (오프닝 무비의 진행 막대·자동 플레이 확인용) */
export const warmProgress = () => ({ ...warm });

/** 출근 중 화면을 띄우고 그날 그림을 받음. 끝나면 화면을 지우고 돌아옴 */
export async function preloadEpisode(ep) {
  const urls = episodeImages(ep);
  const t0 = performance.now();
  const bar = h('i', { class: 'ld-fill' });
  const el = h('div', { class: 'ld', role: 'status', 'aria-live': 'polite' },
    h('div', { class: 'ld-card' },
      h('p', { class: 'ld-day', text: ep.label || '' }),
      h('h2', { class: 'ld-title', text: '출근 중…' }),
      h('div', { class: 'ld-bar', 'aria-hidden': 'true' }, bar),
      h('p', { class: 'ld-note', text: '오늘 필요한 그림을 챙기고 있어요.' })));
  document.getElementById('layer-modal').append(el);

  let done = 0;
  const set = () => {
    const p = urls.length ? done / urls.length : 1;
    bar.style.width = `${Math.round(p * 100)}%`;
  };
  set();
  const all = Promise.all(urls.map((u) => load(u).then(() => { done += 1; set(); })));
  await Promise.race([all, sleep(MAX_MS)]);
  const left = MIN_MS - (performance.now() - t0);
  if (left > 0) await sleep(left);
  el.classList.add('out');
  await sleep(document.body.classList.contains('reduce-motion') ? 0 : 220);
  el.remove();
}
