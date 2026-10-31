/**
 * VFX: 작은 그림(텍스처)을 여러 개 뿌려 움직이는 파티클 장치
 *  - 텍스처: assets/vfx/vfx_{kind}.png 가 있으면 그 그림, 없으면 아래 SVG 임시 모양 (docs/image_requests.md I 묶음)
 *  - 차분 모드: 개수를 줄이고 빛 번짐을 없앰 / 움직임 줄이기: 파티클을 띄우지 않음
 *  - 좌표는 1920×1080 캔버스 기준
 */

import { $, h } from '../core/dom.js';
import { img } from '../core/assets.js';

let layer = null;

const C = { red: '#E3262E', yellow: '#FFD43B', mint: '#16A99A', sky: '#3D8BD9', ink: '#17141C', cream: '#FFF7E8', gold: '#F2C230' };

/** 그림이 없을 때 쓰는 임시 모양 */
const SVG = {
  sparkle: (c = '#FFFFFF') => `<svg viewBox="0 0 100 100"><path d="M50 0 C55 38 62 45 100 50 C62 55 55 62 50 100 C45 62 38 55 0 50 C38 45 45 38 50 0Z" fill="${c}"/></svg>`,
  star: (c = C.yellow) => `<svg viewBox="0 0 100 100"><path d="M50 6 L62 37 L95 38 L69 58 L78 91 L50 72 L22 91 L31 58 L5 38 L38 37Z" fill="${c}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/></svg>`,
  glow: () => '<svg viewBox="0 0 100 100"><defs><radialGradient id="vg"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#vg)"/></svg>',
  confetti: (c = C.red) => `<svg viewBox="0 0 100 60"><rect x="4" y="4" width="92" height="52" rx="8" fill="${c}"/></svg>`,
  ink: (c = C.red) => `<svg viewBox="0 0 100 100"><path d="M52 8 C70 10 66 30 84 30 C98 32 92 52 86 60 C80 72 92 86 74 90 C58 94 54 80 40 86 C22 94 10 80 16 64 C20 52 4 46 12 32 C20 18 36 26 40 14 C43 8 47 7 52 8Z" fill="${c}" opacity=".85"/></svg>`,
  gear: (c = C.gold) => `<svg viewBox="0 0 100 100"><path d="M43 4h14l3 13 9 4 11-7 10 10-7 11 4 9 13 3v14l-13 3-4 9 7 11-10 10-11-7-9 4-3 13H43l-3-13-9-4-11 7-10-10 7-11-4-9-13-3V43l13-3 4-9-7-11 10-10 11 7 9-4z" fill="${c}" stroke="#8A6A1E" stroke-width="4"/><circle cx="50" cy="50" r="15" fill="#FFF8E1" stroke="#8A6A1E" stroke-width="4"/></svg>`,
  heart: (c = C.red) => `<svg viewBox="0 0 100 90"><path d="M50 86 C20 66 2 46 2 26 C2 12 14 2 28 2 C38 2 46 8 50 16 C54 8 62 2 72 2 C86 2 98 12 98 26 C98 46 80 66 50 86Z" fill="${c}" stroke="${C.ink}" stroke-width="5"/></svg>`,
  bubble: () => '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="rgba(200,235,255,.35)" stroke="rgba(255,255,255,.95)" stroke-width="5"/><ellipse cx="34" cy="32" rx="12" ry="7" fill="#fff" opacity=".9" transform="rotate(-30 34 32)"/></svg>',
  drop: (c = C.sky) => `<svg viewBox="0 0 70 100"><path d="M35 4 C48 30 66 48 66 66 C66 84 52 96 35 96 C18 96 4 84 4 66 C4 48 22 30 35 4Z" fill="${c}" opacity=".85"/></svg>`,
  puff: () => '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fff" opacity=".8"/></svg>',
  paper: (c = C.cream) => `<svg viewBox="0 0 100 70"><rect x="3" y="3" width="94" height="64" rx="4" fill="${c}" stroke="#C9B99A" stroke-width="4"/></svg>`,
  note: (c = C.ink) => `<svg viewBox="0 0 80 100"><path d="M30 10 L74 2 V66 A14 12 0 1 1 64 55 V24 L40 28 V76 A14 12 0 1 1 30 65Z" fill="${c}"/></svg>`,
};

function tex(kind, color) {
  const u = img.url('vfx', `vfx_${kind}`);
  if (u) return `<img src="${u}" alt="" draggable="false">`;
  return (SVG[kind] || SVG.sparkle)(color);
}

/** 1 = 보통, 0.35 = 차분 모드, 0 = 움직임 줄이기 */
function level() {
  const b = document.body.classList;
  if (b.contains('reduce-motion')) return 0;
  if (b.contains('theme-calm')) return 0.35;
  return 1;
}

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** 화면 요소의 가운데를 캔버스 좌표로 */
export function centerOf(el) {
  const scr = $('#screen').getBoundingClientRect();
  const s = scr.width / 1920 || 1;
  const r = el.getBoundingClientRect();
  return { x: (r.left + r.width / 2 - scr.left) / s, y: (r.top + r.height / 2 - scr.top) / s };
}

function part(kind, x, y, size, color) {
  const el = h('i', { class: `vfx-p vfx-${kind}`, html: tex(kind, color) });
  el.style.left = `${x - size / 2}px`;
  el.style.top = `${y - size / 2}px`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  layer.append(el);
  return el;
}

function run(el, frames, ms, easing = 'cubic-bezier(.2,.8,.3,1)') {
  const a = el.animate(frames, { duration: ms, easing, fill: 'forwards' });
  return a.finished.catch(() => {}).then(() => el.remove());
}

export const vfx = {
  init() {
    layer = h('div', { id: 'layer-vfx', 'aria-hidden': 'true' });
    $('#screen').append(layer);
  },

  /** 한 점에서 사방으로 터지기 */
  burst(kind, x, y, { n = 12, dist = [80, 220], size = [28, 64], ms = [600, 1000], gravity = 0, spin = true, colors = null } = {}) {
    const lv = level();
    if (!lv || !layer) return;
    const count = Math.max(1, Math.round(n * lv));
    for (let i = 0; i < count; i++) {
      const s = rand(size[0], size[1]);
      const el = part(kind, x, y, s, colors ? pick(colors) : undefined);
      const ang = (Math.PI * 2 * i) / count + rand(-0.3, 0.3);
      const d = rand(dist[0], dist[1]);
      const dx = Math.cos(ang) * d;
      const dy = Math.sin(ang) * d + gravity;
      const rot = spin ? rand(-200, 200) : 0;
      run(el, [
        { transform: 'translate(0,0) scale(.2) rotate(0deg)', opacity: 1 },
        { transform: `translate(${dx * 0.7}px,${dy * 0.6}px) scale(1) rotate(${rot * 0.6}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${dx}px,${dy}px) scale(.6) rotate(${rot}deg)`, opacity: 0 },
      ], rand(ms[0], ms[1]));
    }
  },

  /** 요소 가운데에서 반짝 */
  sparkleAt(el, opts = {}) {
    if (!el) return;
    const { x, y } = centerOf(el);
    vfx.burst('sparkle', x, y, { n: 14, colors: ['#FFFFFF', '#FFF2B0', C.yellow], ...opts });
    if (level() === 1) {
      const g = part('glow', x, y, 260);
      run(g, [{ transform: 'scale(.3)', opacity: 0.9 }, { transform: 'scale(1.3)', opacity: 0 }], 700);
    }
  },

  /** 별이 from 에서 to 요소로 날아가 박힘 */
  async flyStars(from, toEl, { n = 3 } = {}) {
    const lv = level();
    if (!lv || !layer || !toEl) return;
    const a = from instanceof Element ? centerOf(from) : from;
    const b = centerOf(toEl);
    const jobs = [];
    for (let i = 0; i < n; i++) {
      const el = part('star', a.x, a.y, 70);
      const mx = (a.x + b.x) / 2 + rand(-180, 180);
      const my = Math.min(a.y, b.y) - rand(80, 220);
      jobs.push(run(el, [
        { transform: 'translate(0,0) scale(.4) rotate(0deg)', opacity: 1 },
        { transform: `translate(${mx - a.x}px,${my - a.y}px) scale(1.2) rotate(180deg)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${b.x - a.x}px,${b.y - a.y}px) scale(.5) rotate(360deg)`, opacity: 1 },
      ], 780 + i * 120, 'cubic-bezier(.5,0,.4,1)'));
    }
    await Promise.all(jobs);
    vfx.burst('sparkle', b.x, b.y, { n: 8, dist: [30, 80], size: [20, 40], colors: [C.yellow, '#fff'] });
    toEl.classList.remove('vfx-hit');
    void toEl.offsetWidth;
    toEl.classList.add('vfx-hit');
  },

  /** 위에서 색종이 */
  confetti({ n = 70 } = {}) {
    const lv = level();
    if (!lv || !layer) return;
    const colors = [C.red, C.yellow, C.mint, C.sky, '#FFFFFF'];
    const count = Math.round(n * (lv < 1 ? 0 : 1)); // 차분 모드에서는 색종이 없음
    for (let i = 0; i < count; i++) {
      const x = rand(0, 1920);
      const s = rand(22, 40);
      const el = part('confetti', x, -40, s, pick(colors));
      const dx = rand(-160, 160);
      run(el, [
        { transform: `translate(0,0) rotate(${rand(0, 180)}deg)`, opacity: 1 },
        { transform: `translate(${dx}px,${rand(1000, 1180)}px) rotate(${rand(360, 900)}deg)`, opacity: 0.9 },
      ], rand(1800, 3200), 'cubic-bezier(.3,.1,.6,1)');
    }
  },

  /** 도장 잉크 튐 */
  ink(x, y) {
    vfx.burst('ink', x, y, { n: 7, dist: [40, 120], size: [24, 56], ms: [420, 700], spin: true });
  },

  /** 되감기: 톱니바퀴가 가운데를 돌며 흩어짐 */
  gears() {
    const lv = level();
    if (!lv || !layer || lv < 1) return; // 차분 모드에서는 회전 없음
    for (let i = 0; i < 6; i++) {
      const ang = (Math.PI * 2 * i) / 6;
      const x = 960 + Math.cos(ang) * 260;
      const y = 520 + Math.sin(ang) * 260;
      const el = part('gear', x, y, rand(70, 120));
      run(el, [
        { transform: 'scale(.2) rotate(0deg)', opacity: 0 },
        { transform: 'scale(1) rotate(-160deg)', opacity: 0.95, offset: 0.4 },
        { transform: `translate(${Math.cos(ang) * 120}px,${Math.sin(ang) * 120}px) scale(.8) rotate(-420deg)`, opacity: 0 },
      ], 1100, 'linear');
    }
  },

  /** 따뜻한 장면: 하트·음표가 살짝 떠오름 */
  float(kind, x, y, { n = 3 } = {}) {
    const lv = level();
    if (!lv || !layer) return;
    const count = lv < 1 ? 1 : n;
    for (let i = 0; i < count; i++) {
      const el = part(kind, x + rand(-60, 60), y, rand(36, 54));
      run(el, [
        { transform: 'translate(0,0) scale(.4)', opacity: 0 },
        { transform: `translate(${rand(-20, 20)}px,-60px) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${rand(-40, 40)}px,-160px) scale(.9)`, opacity: 0 },
      ], rand(1200, 1700), 'ease-out');
    }
  },

  clear() { layer?.replaceChildren(); },
};
