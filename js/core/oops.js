/**
 * 아차 노트 등록부 + '아차! → 되감기' 공통 연출
 * 모든 실패 결과(oops)는 에피소드 데이터에서 모아 등록합니다(episodes/index.js).
 */

import { store } from './store.js';
import { ov } from '../ui/overlays.js';

const registry = new Map();

export function registerOops(list) {
  for (const o of list) if (o?.id) registry.set(o.id, o);
}

export function oopsTotal() { return registry.size; }
export function oopsInfo(id) { return registry.get(id) || null; }
export function oopsAll() { return [...registry.values()]; }

export function oopsFound() {
  return store.oopsList().filter((id) => registry.has(id)).length;
}

/** 아차! 카드를 보여 주고 되감기 연출까지 */
export async function showOops(o) {
  const info = { ...(registry.get(o.id) || {}), ...o };
  const isNew = store.addOops(info.id);
  await ov.oops({ ...info, found: oopsFound(), total: oopsTotal(), isNew });
  await ov.rewindFx();
  return isNew;
}
