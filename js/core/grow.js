/**
 * 지은의 성장(재미 개편 6장, docs/redesign.md · Q-39 ~ Q-42, 2026-11-01 사용자 "날 믿고 전체 수정하자")
 *  - 능력치 넷(손맛 · 기억 · 응대 · 차분함): 한 일만큼 오르고(잘한 만큼이 아니라), 떨어지지 않고, 이야기를 막지 않음
 *  - 익숙함: 같은 손 기술을 MASTER_AT 번 하면 '익숙해짐' → 작업대에서 [맡기기](저절로 딱 좋게)를 고를 수 있음
 *  - 단계(배지): 계절의 마지막 날을 마칠 때마다 한 단계(사장님이 앞치마에 달아 줌)
 *  - 일급(시급 × 6시간): 하루 끝 결과 화면에서 받음(같은 날을 다시 해도 한 번만). 팁은 없음(2026-11-04 사용자). 받은 돈으로 선물 · 카운터 꾸미기 · 가게 앞 꾸미기 · 앞치마
 * 단골 신뢰(원칙 1)는 여기에 섞지 않습니다. 이것은 지은 자신의 기록이라 학생 화면에 보이고, 반 친구와 견주는 화면은 없습니다(원칙 14).
 * 저장 칸은 store 의 grow(newGrow · normalizeGrow · mergeGrow).
 */

import { store, NO_PAY_DAYS } from './store.js';
import { currentWage } from '../config.js';

export const STATS = [
  { id: 'hand', name: '손맛', icon: 'coffee', how: '커피를 만들고 손 기술을 할수록 올라요.', effect: '알맞아요 칸이 조금씩 넓어져요.' },
  { id: 'memory', name: '기억', icon: 'book', how: '단골을 만나고, 늘 먹던 것을 만들수록 올라요.', effect: '단골의 늘 먹던 것을 한 번에 담을 수 있어요.' },
  { id: 'service', name: '응대', icon: 'speech', how: '손님에게 묻고 대답을 들을수록 올라요.', effect: '온도와 매장 · 포장을 한 번에 물어볼 수 있어요.' },
  { id: 'calm', name: '차분함', icon: 'breathe', how: '바쁜 시간과 쟁반 나르기를 끝까지 할수록 올라요.', effect: '바쁜 시간에 사장님이 더 일찍 도와줘요.' },
];

// 레벨 1 ~ 10 에 필요한 점수(한 일의 양). 봄을 마치면 3 ~ 4, 한 해를 마치면 7 ~ 9 쯤
const STEPS = [0, 4, 10, 18, 28, 40, 55, 72, 92, 115];
export const MAX_LEVEL = STEPS.length;
export const MASTER_AT = 10;
/** 레벨마다 쓸모(작업대 · 몰림 시간이 읽음) */
export const UNLOCK = { memoryUsual: 3, serviceAsk: 3 };

/** 하루에 일한 시간(결과 화면의 시급 계산). 가게는 아침 8시에 열고, 지은은 손님이 많은 6시간을 일함 */
export const PAY_HOURS = 6;
/** 일급이 없는 날(봄 1일 면접)의 하루 끝 말: 문장마다 음성 파일(tools/export-lines.mjs) */
export const NO_PAY_SAY = ['오늘은 면접을 본 날이라 받은 돈이 없어요.', '내일부터 일한 만큼 받아요.'];

export const RANKS = ['견습 바리스타', '새내기 바리스타', '바리스타', '마을의 바리스타', '우리 카페의 바리스타'];
const SEASON_LAST = ['spring_7', 'summer_7', 'autumn_7', 'winter_7'];

const c = (g, k) => g.counts[k] || 0;
const skillTotal = (g) => Object.values(g.skills).reduce((a, n) => a + n, 0);

/** 능력치 점수(한 일의 양) */
export function statPoints(g = store.grow()) {
  return {
    hand: c(g, 'cups') + Math.floor(skillTotal(g) / 2),
    memory: c(g, 'respond') * 2 + c(g, 'usual'),
    service: c(g, 'asks') + c(g, 'respond'),
    calm: c(g, 'rush') * 3 + c(g, 'tray') * 2 + c(g, 'routine'),
  };
}

export function levelOf(points) {
  let lv = 1;
  STEPS.forEach((need, i) => { if (points >= need) lv = i + 1; });
  return lv;
}

/** { hand: { points, level, next(다음 레벨까지 남은 점수, 끝이면 0) }, … } */
export function stats(g = store.grow()) {
  const pts = statPoints(g);
  return Object.fromEntries(STATS.map(({ id }) => {
    const level = levelOf(pts[id]);
    const next = level >= MAX_LEVEL ? 0 : STEPS[level] - pts[id];
    return [id, { points: pts[id], level, next }];
  }));
}

export const level = (id) => stats()[id].level;

/** 한 일을 더함. 오른 능력치가 있으면 [{ id, name, level }] */
export function add(kind, n = 1) {
  if (!n) return [];
  const before = stats();
  store.updateGrow((g) => { g.counts[kind] = (g.counts[kind] || 0) + n; });
  return rose(before);
}

/** 손 기술을 한 번 함. 처음 익숙해졌으면 true */
export function addSkill(id) {
  if (!id) return false;
  let first = false;
  store.updateGrow((g) => {
    const n = (g.skills[id] || 0) + 1;
    g.skills[id] = n;
    if (n === MASTER_AT) first = true;
  });
  return first;
}

export const skillCount = (id) => store.grow().skills[id] || 0;
/** [맡기기]를 쓴 횟수(능력치에는 들지 않음): 처음 몇 번만 말로 알림(검수 13.87) */
export const handoffUses = () => store.grow().counts.handoff || 0;
export const isMastered = (id) => skillCount(id) >= MASTER_AT;
export const handoffOn = (id) => isMastered(id) && Boolean(store.grow().handoff[id]);
export function setHandoff(id, on) {
  store.updateGrow((g) => { g.handoff = { ...g.handoff, [id]: Boolean(on) }; });
}

function rose(before) {
  const after = stats();
  return STATS.filter(({ id }) => after[id].level > before[id].level).map(({ id, name }) => ({ id, name, level: after[id].level }));
}

/* ---------- 하루의 시작과 끝(결과 화면이 '오늘 오른 것'을 보여 줌) ---------- */
let dayStart = null;
/** 이야기를 시작할 때(main.js) */
export function markDay() { dayStart = { stats: stats(), rank: rank().index }; }
/** 오늘 오른 능력치 · 새 단계(이어 하기로 시작했으면 시작 기록이 없어 빈 목록) */
export function dayRise() {
  if (!dayStart) return { stats: [], rank: null };
  const now = stats();
  const up = STATS.filter(({ id }) => now[id].level > dayStart.stats[id].level).map((st) => ({ ...st, level: now[st.id].level }));
  const r = rank();
  const out = { stats: up, rank: r.index > dayStart.rank ? r : null };
  dayStart = null;
  return out;
}

/** 단계: 마친 적이 있는 계절 수(계절의 마지막 날). 처음부터 · 새 해에도 떨어지지 않음(검수 13.39 24번) */
export function rank() {
  const n = SEASON_LAST.filter((ep) => store.everDone(ep)).length;
  return { index: n, name: RANKS[n] };
}

/** 오늘의 일급(시급 × 6시간, 팁은 없음). 이미 받은 날이면 null, 일급이 없는 날(봄 1일 면접, store 의 NO_PAY_DAYS)이면 { none: true } */
export function payFor(key) {
  if (NO_PAY_DAYS.includes(key)) return { none: true };
  const k = `${store.year()}:${key}`;
  if (store.grow().paid[k] !== undefined) return null;
  const { hourly } = currentWage();
  const wage = hourly * PAY_HOURS;
  return { key: k, hourly, hours: PAY_HOURS, wage, total: wage };
}

export function receive(pay) {
  if (!pay || pay.none) return;
  store.updateGrow((g) => {
    if (g.paid[pay.key] !== undefined) return;
    g.paid[pay.key] = pay.total;
    g.money += pay.total;
    g.earned += pay.total;
  });
}

/* ---------- 선물 · 꾸미기 · 앞치마 (Q-42 · Q-54, 검수 13.91) ----------
 * 2026-11-08 사용자 "가게 꾸미기 메뉴는 실제로 구매해도 변화가 전혀 없다 … 점장님 선물, 부모님 선물 같은 것도 좋은 방법" → '추천 순서'
 *  - gift(선물): 사장님 · 가족에게. 사면 바로 주는 장면(js/ui/gift.js: 사장님은 얼굴 + 말, 가족은 문자), 수첩에서 [다시 보기]. 한 번씩만
 *  - counter(카운터 꾸미기): 작업대 카운터의 창틀 위(sill: 가로 %, h: 높이 %). 학생이 가장 오래 보는 장면
 *  - deco(가게 앞 꾸미기): 처음 화면의 카페 앞(title_cafe) 그림 위(spot: 그림 안의 자리 %)
 *  - apron(앞치마): 입으면 지은의 스탠딩 · 얼굴이 그 색(tools/recolor-stand-apron.py, characters.js 의 apronLook)
 * 산 것은 모두 grow.owned. 선물은 단골 신뢰에 더하지 않음(원칙 1 · 7), 사장님 선물은 손떨림과 잇지 않음(원칙 10). 그림은 docs/image_requests.md 8.6(sheet_gift) */
export const GIFT_TO = {
  owner: { name: '사장님', head: '사장님께 선물을 드려요.' },
  family: { name: '가족', head: '집에 있는 가족에게 선물을 보내요.', reply: '집에서 문자가 왔어요.' }, // 🙋 '부모님' 대신 '가족'(학생마다 집이 달라서)
};
/** 선물 장면 끝의 지은의 속마음(모든 선물에 같음) */
export const GIFT_END = '일해서 번 돈으로, 고마운 사람에게 마음을 전했다.';
/** 꾸미기를 산 뒤 '여기에 놓았어요' 창의 [제목, 덧말](js/ui/gift.js showPlaced) */
export const PLACED_SAY = {
  counter: ['카운터 창가에 놓았어요.', '커피를 만들 때, 카운터 창가에서 볼 수 있어요.'],
  front: ['가게 앞에 놓았어요.', '처음 화면의 카페 앞에서 볼 수 있어요.'],
};
export const SHOP = [
  // 선물(사장님: lines = 사장님의 말 · 가족: lines = 문자). 한 칸 두 문장 · 90자 이내(원칙 9)
  { id: 'gift_bread', kind: 'gift', to: 'owner', name: '갓 구운 빵 한 봉지', price: 15000, icon: 'bread', desc: '아침 일찍 빵집에서 산 따뜻한 빵이에요.',
    lines: ['빵 냄새가 가게에 가득하네요. 아직 따뜻해요.', '반은 지은 씨 거예요. 같이 먹어야 더 맛있으니까요.'] },
  { id: 'gift_mug', kind: 'gift', to: 'owner', name: '바다색 머그컵', price: 40000, icon: 'cup', desc: '사장님이 쓸 새 머그컵이에요.',
    lines: ['내 컵을 사 왔어요? 나는 늘 손님 컵 가운데 남는 걸로 마셨는데.', '고마워요. 마감 뒤에 마시는 따뜻한 우유는, 이제 이 컵에 마셔야겠네요.'] },
  { id: 'gift_scarf', kind: 'gift', to: 'owner', name: '털목도리', price: 60000, icon: 'gift', desc: '바닷바람이 찬 날, 목을 따뜻하게 감싸요.',
    lines: ['아침에 가게 문을 열 때 바닷바람이 차거든요. 딱 좋겠네요.', '지은 씨가 일해서 번 돈으로 산 거라, 더 따뜻할 것 같아요.'] },
  { id: 'gift_postcard', kind: 'gift', to: 'family', name: '바다 엽서와 편지', price: 5000, icon: 'note', desc: '바닷가 마을 엽서에 편지를 써서 보내요.',
    lines: ['엽서 잘 받았어. 바다가 정말 예쁘더라.', '네 글씨를 보니까, 잘 지내는 것 같아서 마음이 놓여.'] },
  { id: 'gift_beans', kind: 'gift', to: 'family', name: '우리 카페 원두', price: 25000, icon: 'coffee', desc: '내가 일하는 카페의 원두를 보내요.',
    lines: ['보내 준 원두로 아침에 커피를 내려 마셨어. 네가 일하는 카페의 맛이구나.', '다음에는 네가 내려 주는 커피를 마시러 갈게.'] },
  { id: 'gift_blanket', kind: 'gift', to: 'family', name: '포근한 무릎 담요', price: 50000, icon: 'gift', desc: '저녁에 덮는 포근한 담요예요.',
    lines: ['담요가 정말 포근해. 저녁마다 덮고 있어.', '네가 일해서 번 돈으로 산 거라 더 따뜻해. 고마워.'] },
  // 카운터 꾸미기: 작업대 카운터 오른쪽 창틀 위(창틀 윗면 = 카운터 판 아래에서 48.3%, brew.js 의 SILL)
  { id: 'counter_plant', kind: 'counter', name: '작은 다육이 화분', price: 20000, icon: 'sparkle', sill: 70.2, h: 7.2, desc: '창가에 놓는 작고 통통한 화분이에요.' },
  { id: 'counter_shells', kind: 'counter', name: '조개껍데기 유리병', price: 15000, icon: 'sparkle', sill: 75.6, h: 9, desc: '바닷가에서 주운 조개를 모은 병이에요.' },
  { id: 'counter_flowers', kind: 'counter', name: '들꽃 꽃병', price: 30000, icon: 'sparkle', sill: 81.2, h: 14, desc: '마을 길가에 핀 들꽃을 꽂아요.' },
  { id: 'counter_hourglass', kind: 'counter', name: '모래시계', price: 35000, icon: 'hourglass', sill: 86.8, h: 9.5, desc: '모래가 천천히 떨어져요. 기다리는 시간도 예뻐요.' },
  { id: 'counter_lighthouse', kind: 'counter', name: '등대 모양 작은 등', price: 45000, icon: 'light', sill: 92.2, h: 13, desc: '창가를 따뜻하게 밝혀요.' },
  // 가게 앞 꾸미기
  { id: 'deco_pot', kind: 'deco', name: '문 옆 화분', price: 30000, icon: 'sparkle', spot: [75, 70.5], desc: '문 옆에 작은 화분을 놓아요.' },
  { id: 'deco_chime', kind: 'deco', name: '조개 풍경', price: 25000, icon: 'bell_call', spot: [59, 44], desc: '바람이 불면 딸랑딸랑 울려요.' },
  { id: 'deco_bench', kind: 'deco', name: '창가 긴 의자', price: 60000, icon: 'chair', spot: [31, 86], desc: '가게 앞에 앉아 쉬는 의자예요.' },
  { id: 'deco_lamp', kind: 'deco', name: '처마 등', price: 70000, icon: 'light', spot: [95.5, 44], desc: '밤에도 가게 앞이 환해요.' },
  { id: 'deco_board', kind: 'deco', name: '오늘의 메뉴 칠판', price: 40000, icon: 'menu', spot: [44, 84], desc: '문 앞에 세우는 작은 칠판이에요.' },
  { id: 'deco_flag', kind: 'deco', name: '바다색 깃발', price: 20000, icon: 'sign_open', spot: [88, 27], desc: '바닷바람에 펄럭여요.' },
  { id: 'apron_navy', kind: 'apron', name: '남색 앞치마', price: 30000, color: '#26406B', desc: '차분한 남색이에요.' },
  { id: 'apron_brown', kind: 'apron', name: '갈색 앞치마', price: 30000, color: '#7A4E2D', desc: '커피 빛 갈색이에요.' },
  { id: 'apron_stripe', kind: 'apron', name: '줄무늬 앞치마', price: 40000, color: '#3C6E8F', desc: '바다 같은 줄무늬예요.' },
  { id: 'apron_coral', kind: 'apron', name: '산호색 앞치마', price: 50000, color: '#D9775E', desc: '봄 바다의 산호색이에요.' },
];
export const APRON_BASIC = { id: 'basic', kind: 'apron', name: '기본 초록 앞치마', price: 0, color: '#25844A', desc: '사장님이 처음 준 앞치마예요.' };
export const apronOf = (id) => (id === 'basic' ? APRON_BASIC : SHOP.find((x) => x.id === id && x.kind === 'apron')) || APRON_BASIC;

export const owns = (id) => id === 'basic' || store.grow().owned.includes(id);
export const money = () => store.grow().money;

/** 사기. 돈이 모자라거나 이미 있으면 false */
export function buy(id) {
  const item = SHOP.find((x) => x.id === id);
  if (!item || owns(id) || money() < item.price) return false;
  store.updateGrow((g) => {
    g.money -= item.price;
    g.owned = [...g.owned, id];
    if (item.kind === 'apron') g.apron = id;
  });
  return true;
}

export function wearApron(id) {
  if (!owns(id)) return;
  store.updateGrow((g) => { g.apron = id; });
}

/* ---------- 모으기 ---------- */
export function addPerfect(menuId) {
  if (!menuId || store.grow().perfect.includes(menuId)) return false;
  store.updateGrow((g) => { g.perfect = [...g.perfect, menuId]; });
  return true;
}
export function addOdd(id) {
  if (!id || store.grow().odd.includes(id)) return false;
  store.updateGrow((g) => { g.odd = [...g.odd, id]; });
  return true;
}
export function addCard(key) {
  if (!key || store.grow().cards.includes(key)) return false;
  store.updateGrow((g) => { g.cards = [...g.cards, key]; });
  return true;
}

/** 숫자를 '61,920원'처럼 */
export const won = (n) => `${Math.round(n).toLocaleString('ko-KR')}원`;
