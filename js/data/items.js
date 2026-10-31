/**
 * 소품 그림 (assets/items/item_*.png · docs/image_requests.md H-1, 2026-10-12 사용자 제작)
 *  - 누르는 버튼 안의 픽토그램(선 아이콘)은 접근성을 위해 그대로 둡니다.
 *  - 장면 속 물건과 카드 그림에만 씁니다: 아차 카드, 말 사전 카드, 아침 브리핑, 받은 물건, 되감기 회중시계, 사진 대신 그림.
 *  - 그림이 없으면 같은 자리에 픽토그램이 그대로 보입니다.
 */

import { img } from '../core/assets.js';
import { ICON } from './icons.js';

/** 픽토그램 이름 → 소품 그림 (장면 속 물건으로 볼 수 있는 것만) */
export const ITEM_FOR_ICON = {
  caution: 'item_caution',
  icecup: 'item_icecup',
  cup: 'item_papercup',
  cloth: 'item_cloth',
  coffee: 'item_americano',
  tea: 'item_milk',
  memo: 'item_postit',
  tray: 'item_tray',
  croissant: 'item_croissant',
  bread: 'item_saltbread',
  contract: 'item_contract',
  badge: 'item_badge',
  earplug: 'item_earplugs',
  watch: 'item_watch',
  camera: 'item_camera',
};

/** 'item_…' 또는 픽토그램 이름 → 쓸 수 있는 소품 그림 ID (없으면 null) */
export function itemOf(key) {
  if (!key) return null;
  const id = key.startsWith('item_') ? key : ITEM_FOR_ICON[key];
  return id && img.has('items', id) ? id : null;
}

/** 소품 그림 HTML. 그림이 없으면 픽토그램(key 가 픽토그램 이름일 때) */
export function artHTML(key, cls = '') {
  const id = itemOf(key);
  if (id) return `<img class="item-art ${cls}" src="${img.url('items', id)}" alt="" draggable="false">`;
  return key && !key.startsWith('item_') ? ICON(key) : '';
}
