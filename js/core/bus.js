/**
 * 아주 작은 이벤트 버스 (HUD 갱신, 저장 알림 등)
 */
const listeners = new Map();

export const bus = {
  on(evt, fn) {
    if (!listeners.has(evt)) listeners.set(evt, new Set());
    listeners.get(evt).add(fn);
    return () => listeners.get(evt)?.delete(fn);
  },
  emit(evt, data) {
    for (const fn of listeners.get(evt) || []) {
      try { fn(data); } catch (e) { console.error('[bus]', evt, e); }
    }
  },
};
