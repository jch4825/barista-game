/**
 * 이벤트 CG 의 임시 그림(2026-10-31 사용자 "필요 이미지는 조잡한 컴포넌트로 만들되, 대체 요망이라고 적어 두면 된다")
 *  - assets/cg/cg_{id}.jpg 가 없을 때 stage.setCg 가 이것을 띄움: 그 장소의 배경 + 나오는 사람들의 얼굴 + 소품 그림 + 제목 + '대체 요망' 표시
 *  - 장면 정보는 js/data/cg.js 의 ph: { bg, v(배경 변형), cast: ['owner:smile', …], props: [아이콘 이름], desc(한 줄), board(칠판), night }
 *  - 그림 요청서: docs/requests_full.md (CG 마다 프롬프트)
 */

import { h } from '../core/dom.js';
import { renderBg } from '../data/backgrounds.js';
import { CHARS, faceHTML } from '../data/characters.js';
import { ICON } from '../data/icons.js';
import { CGS } from '../data/cg.js';

export function cgPlaceholder(id) {
  const c = CGS[id];
  if (!c) return null;
  const ph = c.ph || {};
  const cast = (ph.cast || []).map((v) => {
    const [who, face = 'normal'] = String(v).split(':');
    const ch = CHARS[who];
    return h('span', { class: 'cgph-who', style: { '--accent': ch?.color || '#7D7D86' } },
      h('span', { class: 'cgph-face', html: ch ? faceHTML(who, face) : '' }),
      h('small', { text: ch?.name || who }));
  });
  const props = (ph.props || []).map((icon) => h('i', { class: 'cgph-prop', html: ICON(icon) }));
  return h('div', { class: `cgph ${ph.night ? 'is-night' : ''} ${ph.board ? 'has-board' : ''}`.trim(), 'data-cg': id },
    h('div', { class: 'cgph-bg', html: ph.bg ? renderBg(ph.bg, ph.v) : '' }),
    h('div', { class: 'cgph-shade' }),
    ph.board ? h('div', { class: 'cgph-board' }) : null,
    cast.length || props.length ? h('div', { class: 'cgph-cast' }, ...cast, ...props) : null,
    h('p', { class: 'cgph-cap' }, h('b', { text: c.title }), ph.desc ? h('span', { text: ph.desc }) : null),
    h('p', { class: 'cgph-tag', text: `임시 그림 · 대체 요망 · cg_${id}` }));
}
