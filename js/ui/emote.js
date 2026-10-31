/**
 * 감정 이모트: 말하는 사람 머리 옆에 잠깐 뜨는 만화 기호 (감정을 그림으로도 읽게 돕기)
 *  - 그림: assets/emotes/emote_{kind}.png, 없으면 아래 SVG 임시 모양 (docs/image_requests.md H-2)
 *  - 화난 표시는 없습니다(위협 연출 금지).
 */

import { h, dur } from '../core/dom.js';
import { img } from '../core/assets.js';

const INK = '#17141C';
const EMOTE_SVG = {
  sweat: `<svg viewBox="0 0 100 100"><path d="M52 8 C64 34 80 50 80 68 C80 84 67 94 52 94 C37 94 24 84 24 68 C24 50 40 34 52 8Z" fill="#7CC6F2" stroke="${INK}" stroke-width="6"/><ellipse cx="42" cy="64" rx="7" ry="11" fill="#fff"/></svg>`,
  exclaim: `<svg viewBox="0 0 100 100"><path d="M38 6 H62 L57 64 H43Z" fill="#FFD43B" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="83" r="10" fill="#FFD43B" stroke="${INK}" stroke-width="6"/></svg>`,
  question: `<svg viewBox="0 0 100 100"><path d="M28 34 C28 16 42 6 54 6 C70 6 80 18 80 30 C80 46 62 50 60 62 V68 H42 V60 C42 44 60 40 60 30 C60 24 56 22 52 22 C46 22 44 28 44 34Z" fill="#3D8BD9" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><circle cx="51" cy="86" r="9" fill="#3D8BD9" stroke="${INK}" stroke-width="6"/></svg>`,
  idea: `<svg viewBox="0 0 100 100"><path d="M50 8 C70 8 82 22 82 40 C82 54 70 60 66 72 H34 C30 60 18 54 18 40 C18 22 30 8 50 8Z" fill="#FFD43B" stroke="${INK}" stroke-width="6"/><rect x="36" y="74" width="28" height="16" rx="4" fill="#fff" stroke="${INK}" stroke-width="6"/></svg>`,
  heart: `<svg viewBox="0 0 100 90"><path d="M50 84 C22 64 4 46 4 28 C4 14 16 4 30 4 C40 4 46 10 50 18 C54 10 60 4 70 4 C84 4 96 14 96 28 C96 46 78 64 50 84Z" fill="#FF6B8B" stroke="${INK}" stroke-width="6"/></svg>`,
  note: `<svg viewBox="0 0 80 100"><path d="M30 10 L74 2 V66 A14 12 0 1 1 64 55 V24 L40 28 V76 A14 12 0 1 1 30 65Z" fill="#16A99A" stroke="${INK}" stroke-width="5"/></svg>`,
  sparkle: `<svg viewBox="0 0 100 100"><path d="M50 2 C55 38 62 45 98 50 C62 55 55 62 50 98 C45 62 38 55 2 50 C38 45 45 38 50 2Z" fill="#FFF2B0" stroke="${INK}" stroke-width="5"/></svg>`,
  tear: `<svg viewBox="0 0 100 100"><path d="M50 10 C62 36 76 52 76 68 C76 82 64 92 50 92 C36 92 24 82 24 68 C24 52 38 36 50 10Z" fill="#9ED3F5" stroke="${INK}" stroke-width="6"/></svg>`,
  dots: `<svg viewBox="0 0 120 50"><circle cx="20" cy="25" r="12" fill="${INK}"/><circle cx="60" cy="25" r="12" fill="${INK}"/><circle cx="100" cy="25" r="12" fill="${INK}"/></svg>`,
  ok: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="#16A99A" stroke="${INK}" stroke-width="6"/><path d="M28 52 L44 68 L74 34" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  blush: `<svg viewBox="0 0 120 60"><g stroke="#FF6B8B" stroke-width="9" stroke-linecap="round"><path d="M14 46 L30 14"/><path d="M42 46 L58 14"/><path d="M70 46 L86 14"/><path d="M98 46 L114 14"/></g></svg>`,
  sigh: `<svg viewBox="0 0 120 80"><path d="M14 56 C30 30 50 66 66 40 C80 18 98 40 108 26" fill="none" stroke="#9AA3AE" stroke-width="10" stroke-linecap="round"/></svg>`,
};

export const EMOTES = Object.keys(EMOTE_SVG);

/** 표정이 바뀔 때 자동으로 띄울 이모트 (웃는 얼굴은 너무 잦아서 뺌) */
export const FACE_EMOTE = { nervous: 'sweat', worried: 'sweat', scared: 'sweat', surprised: 'exclaim', think: 'question', sad: 'tear' };

function emoteHTML(kind) {
  const u = img.url('emotes', `emote_${kind}`);
  return u ? `<img src="${u}" alt="" draggable="false">` : (EMOTE_SVG[kind] || '');
}

/** host 요소 안에 이모트를 잠깐 띄움 */
export function popEmote(host, kind) {
  if (!host || !EMOTE_SVG[kind]) return;
  host.querySelectorAll(':scope > .emote').forEach((e) => e.remove());
  const el = h('span', { class: `emote emote-${kind}`, html: emoteHTML(kind) });
  host.append(el);
  setTimeout(() => el.remove(), dur(1300) < 200 ? 1000 : 1300);
}
