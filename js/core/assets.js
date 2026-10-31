/**
 * 그림 목록 (assets/images.json, npm run assets 가 만듦)
 *  - 파일이 있으면 그림을 쓰고, 없으면 각 화면이 지금의 임시 그림(SVG·CSS)을 씁니다.
 *  - 종류: stand(스탠딩) bg(배경) cg(이벤트) photos(오늘의 한 장) sd(꼬마) items(소품) emotes(이모트) vfx(효과) ui(질감) objects(작업대 물건) shots(손 기술의 한 컷)
 *  - 규격과 ID 는 docs/image_requests.md
 */

let list = {};

export const img = {
  async init() {
    try {
      const res = await fetch('./assets/images.json', { cache: 'no-store' });
      if (res.ok) list = await res.json();
    } catch (e) {
      list = {};
    }
  },
  has(kind, id) { return Boolean(list[kind]?.[id]); },
  /** 한 종류의 그림 목록 { id: 경로 } (출근 중 화면의 미리 받기) */
  list(kind) { return list[kind] || {}; },
  /** 그림 주소 (없으면 null) */
  url(kind, id) {
    const p = list[kind]?.[id];
    return p ? `./assets/${p}` : null;
  },
  /** 테스트용: 목록을 직접 넣기 */
  set(kind, id, path) {
    if (!list[kind]) list[kind] = {};
    if (path) list[kind][id] = path;
    else delete list[kind][id];
  },
};
