/**
 * 사진(폴라로이드): 대본의 photo('id') 비트가 띄우고, 수첩 사진첩과 엔딩 사진 벽에 모입니다.
 * 새 게임의 사진은 아직 없습니다. 넣을 때는 PHOTOS 에 { ep, title, render } 를 더하고 PHOTO_ORDER 에 순서를 적습니다.
 * render(): 사진 안쪽(4:5 비율) HTML. 그림(assets/photos/{id}.jpg)이 없을 때 쓰는 임시 사진입니다.
 */

import { img } from '../core/assets.js';

export const PHOTOS = {};

export const PHOTO_ORDER = [];

/** 사진 안쪽 HTML: assets/photos/{id}.jpg 가 있으면 그 그림, 없으면 render() 임시 사진 */
export function photoHTML(id) {
  const p = PHOTOS[id];
  if (!p) return '';
  const u = img.url('photos', p.file || id);
  if (u) return `<img class="ph-img" src="${u}" alt="" draggable="false">${p.overlay ? p.overlay() : ''}`;
  return p.render();
}
