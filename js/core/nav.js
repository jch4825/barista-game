/**
 * 화면 이동 라우터. 화면 모듈끼리 서로 import 하지 않도록 이름으로 호출합니다.
 *   nav.register('hub', showHub)
 *   nav.go('hub')
 */
const routes = new Map();

export const nav = {
  register(name, fn) { routes.set(name, fn); },
  go(name, ...args) {
    const fn = routes.get(name);
    if (!fn) { console.warn('[nav] 알 수 없는 화면:', name); return undefined; }
    return fn(...args);
  },
};
