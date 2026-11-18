/**
 * 손가락 · 마우스 뒤를 따라오는 흐르는 선(2026-11-18 사용자 "설거지나 음료 섞을 때, 화면을 눌리면서 저으면 마우스 포인터 따라서 유동하는 선이 뒤따르도록 하는 이펙트")
 *  - host 안에서 누른 채 움직이면, 지나간 자리를 따라 끝이 가늘어지며 사라지는 선을 그림(캔버스 한 장, 누름을 가로채지 않음)
 *  - 누름은 잡는 단계(capture)에서 들으므로, 안쪽 단추가 누름을 위로 보내지 않아도(stopPropagation) 선이 따라옴
 *  - 게임 판(1920 × 1080)은 창에 맞춰 줄여 그리므로, 화면 좌표를 host 의 판 좌표로 바꿔 그림
 *  - 움직임 줄이기 · 차분 모드: 짧게 남고 번짐(glow) 없이
 * 쓰는 법: const t = attachTrail(host, { color: '255, 255, 255', glow: '160, 210, 255' }); … t.stop()
 */

import { isReducedMotion } from '../core/dom.js';

const LIFE = 420;      // 한 점이 사라지기까지(ms)
const LIFE_STILL = 180;
const MAX_W = 22;      // 가장 굵은 곳(판 px)

export function attachTrail(host, { color = '255, 255, 255', glow = '255, 236, 190', width = MAX_W, when = () => true } = {}) {
  if (!host) return { stop() {} };
  const canvas = document.createElement('canvas');
  canvas.className = 'fx-trail';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: '6' });
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.append(canvas);
  const ctx = canvas.getContext('2d');
  const pts = [];
  let pid = null;
  let raf = 0;
  let on = true;
  const calm = () => isReducedMotion() || document.body.classList.contains('theme-calm');

  const fit = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  };
  /** 화면 좌표 → host 안의 판 좌표(host 가 줄여 그려져도) */
  const local = (e) => {
    const r = host.getBoundingClientRect();
    const sx = r.width / (host.clientWidth || 1);
    const sy = r.height / (host.clientHeight || 1);
    return [(e.clientX - r.left) / (sx || 1), (e.clientY - r.top) / (sy || 1)];
  };
  const add = (e) => {
    const [x, y] = local(e);
    const last = pts[pts.length - 1];
    if (last && Math.hypot(x - last.x, y - last.y) < 2) return;
    pts.push({ x, y, t: performance.now() });
    if (pts.length > 90) pts.shift();
    if (!raf) raf = requestAnimationFrame(draw);
  };
  function draw() {
    raf = 0;
    if (!on) return;
    fit();
    const now = performance.now();
    const life = calm() ? LIFE_STILL : LIFE;
    while (pts.length && now - pts[0].t > life) pts.shift();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pts.length >= 2) {
      // 한 장의 띠(리본)로 채움: 마디마다 따로 그으면 겹친 곳이 구슬처럼 진해졌음. 오래된 쪽(꼬리)은 가늘고 투명하게
      const n = pts.length;
      const half = pts.map((q, i) => {
        const k = Math.max(0, 1 - (now - q.t) / life);
        return (width / 2) * (0.2 + 0.8 * k) * (0.3 + 0.7 * (i / (n - 1)));
      });
      const L = [];
      const R = [];
      for (let i = 0; i < n; i++) {
        const a = pts[Math.max(0, i - 1)];
        const c = pts[Math.min(n - 1, i + 1)];
        let dx = c.x - a.x;
        let dy = c.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        L.push([pts[i].x - dy * half[i], pts[i].y + dx * half[i]]);
        R.push([pts[i].x + dy * half[i], pts[i].y - dx * half[i]]);
      }
      const path = new Path2D();
      const side = (arr, first) => {
        if (first) path.moveTo(arr[0][0], arr[0][1]); else path.lineTo(arr[0][0], arr[0][1]);
        for (let i = 1; i < arr.length - 1; i++) path.quadraticCurveTo(arr[i][0], arr[i][1], (arr[i][0] + arr[i + 1][0]) / 2, (arr[i][1] + arr[i + 1][1]) / 2);
        path.lineTo(arr[arr.length - 1][0], arr[arr.length - 1][1]);
      };
      side(L, true);
      const head = pts[n - 1];
      path.arc(head.x, head.y, half[n - 1], Math.atan2(L[n - 1][1] - head.y, L[n - 1][0] - head.x), Math.atan2(R[n - 1][1] - head.y, R[n - 1][0] - head.x), false); // 머리는 둥글게
      side(R.slice().reverse(), false);
      path.closePath();
      const grad = (alpha, rgb) => {
        const g = ctx.createLinearGradient(pts[0].x, pts[0].y, head.x, head.y);
        g.addColorStop(0, `rgba(${rgb}, 0)`);
        g.addColorStop(1, `rgba(${rgb}, ${alpha})`);
        return g;
      };
      if (!calm()) { // 번짐: 같은 띠를 흐리게 한 번 더(아래)
        ctx.save();
        ctx.filter = 'blur(7px)';
        ctx.fillStyle = grad(0.55, glow);
        ctx.fill(path);
        ctx.restore();
      }
      ctx.fillStyle = grad(0.9, color);
      ctx.fill(path);
    }
    if (pts.length) raf = requestAnimationFrame(draw);
  }

  const down = (e) => {
    if (!on || pid !== null || (e.button ?? 0) > 0 || !when(e)) return;
    pid = e.pointerId;
    pts.length = 0;
    add(e);
  };
  const move = (e) => { if (on && e.pointerId === pid) add(e); };
  const up = (e) => { if (e.pointerId === pid) pid = null; };
  host.addEventListener('pointerdown', down, true);
  host.addEventListener('pointermove', move, true);
  host.addEventListener('pointerup', up, true);
  host.addEventListener('pointercancel', up, true);
  return {
    el: canvas,
    stop() {
      on = false;
      cancelAnimationFrame(raf);
      host.removeEventListener('pointerdown', down, true);
      host.removeEventListener('pointermove', move, true);
      host.removeEventListener('pointerup', up, true);
      host.removeEventListener('pointercancel', up, true);
      canvas.remove();
    },
  };
}
