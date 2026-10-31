/**
 * 1920x1080 고정 캔버스를 화면 크기에 맞게 확대/축소(레터박스)
 */
import { CONFIG } from '../config.js';

export function initScale() {
  const screen = document.getElementById('screen');
  const { W, H } = CONFIG.SCREEN;
  const fit = () => {
    const s = Math.min(window.innerWidth / W, window.innerHeight / H);
    screen.style.transform = `translate(-50%, -50%) scale(${s})`;
    document.documentElement.style.setProperty('--scale', String(s));
  };
  window.addEventListener('resize', fit);
  fit();
}
