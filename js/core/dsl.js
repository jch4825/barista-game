/**
 * 시나리오 작성용 도우미 (DSL)
 * 에피소드 파일(js/data/episodes/*.js)은 이 함수들로 '비트(beat)' 배열을 만듭니다.
 * 모든 비트는 { t: '종류', ... } 형태의 순수 데이터라서 검사·내보내기·음성 생성 도구가 그대로 읽을 수 있습니다.
 * 전체 설명: CLAUDE.md 의 '시나리오 DSL' 절
 */

/* ---------- 배경·소리 ---------- */
export const bg = (id, variant) => ({ t: 'bg', id, variant });
export const bgm = (mood) => ({ t: 'bgm', mood });
export const amb = (kind, level = 1) => ({ t: 'amb', kind, level });
export const sfx = (name) => ({ t: 'sfx', name });

/* ---------- 무대 ---------- */
/** 출연진 전체 교체: show({ left: 'jieun:nervous', right: 'boss:smile' }) */
export const show = (cast = {}) => ({ t: 'show', cast });
export const enter = (slot, who) => ({ t: 'enter', slot, who });
export const leave = (who) => ({ t: 'leave', who });
export const face = (who, f) => ({ t: 'face', who, face: f });
export const motion = (who, type) => ({ t: 'motion', who, type }); // bow | nod | shake | jump | breathe
export const camera = (mode) => ({ t: 'camera', mode }); // left | right | center | normal
export const fx = (name, on = true) => ({ t: 'fx', name, on }); // overload | flash | shake | dark | sepia
export const earplugs = (on = true) => ({ t: 'earplugs', on });
/** 감정 이모트: emote('who', 'idea') (sweat exclaim question idea heart note sparkle tear dots ok blush sigh). 표정이 바뀔 때는 자동으로도 뜸 */
export const emote = (who, kind) => ({ t: 'emote', who, kind });
/** 이벤트 CG: cg('door') 로 전체 화면 그림, cg(null) 또는 다음 bg() 로 끝. 그림 파일이 없으면 아무 일도 없음 */
export const cg = (id) => ({ t: 'cg', id });

/* ---------- 대사 ---------- */
/** say('who', '대사') 또는 say('who', 'smile', '대사') */
export function say(who, a, b) {
  return b === undefined ? { t: 'say', who, text: a } : { t: 'say', who, face: a, text: b };
}
export const narr = (text) => ({ t: 'narr', text });
export const think = (text, f) => ({ t: 'think', text, face: f });
export const sys = (text) => ({ t: 'sys', text });
/**
 * 버튼 알려 주기(튜토리얼) 안내 대사: 그 버튼을 아직 안 배운 학생에게만 나옵니다.
 * key 는 js/data/tutorial.js 의 종류. 안내 대사와 다음 span 개 대사 동안 그 버튼에 무지개 테두리 + 손가락
 */
export const guide = (key, text, span = 2) => ({ t: 'guide', key, text, span });
/** 받은 물건 연출: 소품 그림(assets/items/item_*.png) + 이름. 그림이 없으면 icon 픽토그램 */
export const got = (item, title, icon = 'star') => ({ t: 'got', item, title, icon });
export const phone = (from, text) => ({ t: 'phone', from, text });

/* ---------- 화면 정보 ---------- */
export const time = (v) => ({ t: 'time', v });
export const place = (when, text) => ({ t: 'place', time: when, text });
export const big = (text, sub = '') => ({ t: 'big', text, sub });
export const schedule = () => ({ t: 'schedule' });
/** 오늘의 일정 n번을 해냈을 때(해낸 직후에 둠, 미리 알려 주는 용도로 쓰지 않음) */
export const check = (n) => ({ t: 'check', n });
/** 인물 카드: 처음 만난 인물을 소개 (프로필마다 한 번만) */
export const meet = (who) => ({ t: 'meet', who });
/** memo('메모 제목', [['handwash','손 씻기'], ...]) */
export const memo = (title, items) => ({ t: 'memo', title, items });
export const memoHi = (n) => ({ t: 'memoHi', n });
export const info = (title, body, icon) => ({ t: 'info', title, body, icon });

/* ---------- 상호작용 ---------- */
export const act = (label, icon, sfxName) => ({ t: 'act', label, icon, sfx: sfxName });
export const breathe = (cycles = 3, note = '') => ({ t: 'breathe', cycles, note });

/**
 * 판단 카드
 * decide({ id, q, who, skill, memo, title, choices: [ good(...), bad(...) ] })
 *  - q: 질문(대사창). who 가 주인공이면 속마음으로 표시
 *  - memo: 관련 메모 번호(되감은 뒤·도움 요청 때 강조)
 *  - title: 되감기 목록에 보일 짧은 이름
 */
export const decide = (o) => ({ t: 'decide', ...o });
/** 좋은 선택: { praise: '칭찬 대사' | [비트...], next: '라벨', set: {flag: 값} } */
export const good = (icon, label, o = {}) => ({ icon, label, ok: true, ...o });
/** 나쁜 선택: { fail: [결과 장면 비트...], oops: { id, title, lesson, icon } } */
export const bad = (icon, label, o = {}) => ({ icon, label, ok: false, ...o });

/** 자유 선택(정답 없음): choose({ id, q, who, flag, options: [opt(...)] }) */
export const choose = (o) => ({ t: 'choose', ...o });
export const opt = (icon, label, value, o = {}) => ({ icon, label, value, ...o }); // o: { then: [비트], next }

/** 플래그 값에 따라 다른 비트 실행: branch('flag', { 값: [...], _: [...] }) */
export const branch = (flag, cases) => ({ t: 'branch', flag, cases });

/** 미니게임: mini('이름', 옵션). 이름은 js/game/minigames/index.js 의 MINIGAMES */
export const mini = (name, o = {}) => ({ t: 'mini', name, ...o });

/**
 * 한 잔의 마음(단골 대응): respond('haesun', 'spring_cup2')
 * 장면 → 힌트 두 번 → 고르기(볼 때마다 순서를 섞음, [힌트 다시 보기]) → 반응 연출 → 숨은 신뢰(+2/+1/0).
 * 대응 기회의 내용은 js/data/regulars.js. 되감기 지점은 만들지 않습니다(PRD.md 8.7)
 */
export const respond = (who, touch) => ({ t: 'respond', who, touch });

/**
 * 조건부 비트: 조건이 참일 때만 실행. script 안에서 펼쳐 씀
 * ...onlyIf({ flag: 'payPlan=gift' }, say(...), act(...))  · 조건 문법은 js/core/cond.js
 */
let ifSeq = 0;
export const onlyIf = (cond, ...beats) => {
  // 묶음의 조건은 첫 비트에서 한 번만 검사(중간에 상태가 바뀌어도 묶음 전체가 함께 실행)
  const g = `if${++ifSeq}`;
  return beats.map((b, i) => ({ ...b, if: cond, ifGroup: g, ifFirst: i === 0 }));
};

/* ---------- 보상 ---------- */
export const snap = (who, f, title, caption = '') => ({ t: 'snap', who, face: f, title, caption });
export const photo = (id) => ({ t: 'photo', id });
export const stamp = (skill, level = 3) => ({ t: 'stamp', skill, level });
export const term = (id) => ({ t: 'term', id });
export const finish = (title, sub = '') => ({ t: 'finish', title, sub });
/** 엔딩: 사진 벽(모은 사진을 한 장씩 붙이며 제목을 읽어 줌) + 크레디트 */
export const credits = () => ({ t: 'credits' });
/**
 * 마지막 메모(엔딩): 노란 메모에 받는 사람·줄·추신·이름.
 * 받는 사람({player} 님에게)은 화면에만 쓰고, 읽어 주기는 speech(이름이 없는 줄) → 음성 파일을 미리 만들 수 있음
 */
export const letter = ({ to = '', lines = [], ps = '', from = '' }) => ({ t: 'letter', to, lines, ps, from, speech: [...lines, ps].filter(Boolean).join(' ') });

/* ---------- 흐름 ---------- */
export const label = (name) => ({ t: 'label', name });
export const jump = (to) => ({ t: 'jump', to });
export const set = (flag, value) => ({ t: 'set', flag, value });
export const checkpoint = (name) => ({ t: 'checkpoint', name });
export const wait = (ms) => ({ t: 'wait', ms });
export const end = () => ({ t: 'end' });

/** 대사 비트 종류 (도구들이 공통으로 씀) */
export const LINE_TYPES = ['say', 'narr', 'think', 'sys', 'phone'];
