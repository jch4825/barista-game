/**
 * 메뉴·레시피 데이터 (PRD.md 6장 커피 만들기). 이 데이터를 쓰는 미니게임: js/game/minigames/brew.js
 *
 *  - 레시피 = 컵 하나 + 바탕 재료 하나 + 더하기 재료 0~2 + 온도 + 손 기술(만드는 순서대로).
 *  - 학생이 고른 것(made)은 { cup, base, adds: [], temp } 모양입니다. 레시피와 같은지는 compareRecipe()로 봅니다.
 *  - obj  = 작업대 물건 그림 ID(assets/objects/{id}.webp, npm run objects). 그림이 없으면 brew.js 의 임시 그림.
 *  - icon = js/data/icons.js 의 그림 카드 이름(수첩·기록 화면처럼 작은 그림이 필요한 곳).
 *  - 손님 말(thanks 등)과 띠 글자는 brew.js 의 brewLines()가 음성 목록에 넣습니다.
 *
 * 새 메뉴 넣기 (예: 아이스 아메리카노 · 디카페인 라테 · 믹스커피 · 핸드드립 · 지안의 색 음료)
 *  1) 없는 재료는 INGREDIENTS 에 한 줄(roles: 바탕/더하기, prep: 만드는 순서, auto: 손 기술 없이 넣을 때 읽어 줄 말)
 *  2) 없는 컵은 CUPS 에 한 줄
 *  3) RECIPES 에 한 줄(look: 컵마다 다 만든 음료 그림 ID)
 *  4) 새 손 기술(갈기·드립·젓기…)은 HAND_SKILLS 에 띠 칸(zone)·띠 글자(labels)·손님 반응(react)을 적고,
 *     손 기술을 하는 재료(of)를 정합니다. 띠 하나로 되는 기술이면 brew.js 는 고치지 않아도 됩니다.
 *  예) iced_americano: { name: '아이스 아메리카노', cup: 'glass', base: 'espresso', adds: ['water'], temp: 'iced', skills: ['extract'], look: { glass: 'cup_glass_ice', paper: 'cup_paper' } }
 */

/** 커피 만들기 단계(PRD Q-17): 쉬움 = 손 기술을 모두 보기로 · 보통 = 직접(언제든 [보기]) · 바리스타 = 모든 손 기술 + 라테아트 */
export const LEVELS = ['easy', 'normal', 'barista'];
export const LEVEL_NAMES = { easy: '쉬움', normal: '보통', barista: '바리스타' };

/** 컵 (obj: 빈 컵 그림. cup_glass_ice 는 아이스 아메리카노가 담긴 유리컵) */
export const CUPS = {
  mug: { name: '머그컵', icon: 'coffee', obj: 'cup_mug_empty' },
  thick: { name: '두꺼운 컵', icon: 'coffee', obj: 'cup_thick' },
  glass: { name: '유리컵', icon: 'icecup', obj: 'cup_glass_empty' },
  paper: { name: '종이컵', icon: 'cup', obj: 'cup_paper' },
};

/**
 * 재료. roles: 'base'(바탕) · 'add'(더하기) · prep: 만드는 순서(작을수록 먼저)
 * auto: 손 기술 없이 넣는 재료를 넣을 때 읽어 주는 말(온도마다) · color: 임시 그림의 음료 색
 */
export const INGREDIENTS = {
  espresso: { name: '에스프레소', icon: 'coffee', obj: 'cup_shot', roles: ['base', 'add'], prep: 1, color: '#3A2214' },
  syrup: { name: '시럽', icon: 'sparkle', obj: 'obj_syrup', roles: ['add'], prep: 2, color: '#C98A2E', auto: { hot: '시럽을 넣었어요.', iced: '시럽을 넣었어요.' } },
  water: { name: '물', icon: 'water', obj: 'obj_kettle', roles: ['add'], prep: 3, color: '#DCE9EF', auto: { hot: '뜨거운 물을 부었어요.', iced: '찬물을 부었어요.' } },
  milk: { name: '우유', icon: 'milk', obj: 'obj_milk_bottle', roles: ['base', 'add'], prep: 4, color: '#FBF7EF' },
};

/** 온도 (iced: 만들 때 얼음을 먼저 넣음) */
export const TEMPS = {
  hot: { name: '따뜻하게', icon: 'coffee' },
  iced: { name: '차갑게', icon: 'ice', auto: '얼음을 넣었어요.' },
};

/**
 * 손 기술(PRD 6.4 · docs/recipes.md 동작 A 누르고 떼기): [누르고 있기]를 누르는 동안 띠가 차오르고, '알맞아요' 칸에서 손을 뗌. 띠 위치 0~1
 *  howto: 실시간 설명 · howtoTurn: 턴 방식(시간 제한 끄기·자동 스캔) 설명, [한 칸]씩 움직이고 [멈추기]
 *  of: 이 기술을 하는 재료 · zone: 알맞아요 칸 [시작, 끝] (턴 방식은 8칸: 칸 두 개가 알맞아요에 들어가게)
 *  labels: 띠 글자(색만으로 알리지 않음) · react: 레시피는 맞는데 이 칸을 벗어났을 때 손님 말
 *  from: 이 단계부터 직접(아래 단계에서는 하지 않음) · hotOnly: 따뜻한 음료에서만 · art: 바리스타 단계의 라테아트
 *  sfx: 시작할 때 효과음(assets/audio/manifest.json 에 있는 것) · safety: 시작 전에 짧게 알려 주는 안전(PRD 6.4)
 */
export const HAND_SKILLS = {
  extract: {
    name: '샷 내리기', of: 'espresso', obj: 'obj_machine', icon: 'coffee', sfx: 'pour',
    howto: '[누르고 있기]를 꾹 누르면 샷이 나와요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '띠가 알맞아요 칸에 오면 [멈추기]를 눌러요.',
    zone: [0.44, 0.69],
    labels: { low: '연해요', good: '알맞아요', high: '써요' },
    react: { low: '조금 연하네요.', high: '조금 쓰네요.' },
  },
  foam: {
    name: '거품 내기', of: 'milk', obj: 'obj_pitcher_milk', icon: 'milk', sfx: 'bubbles', from: 'barista', hotOnly: true,
    howto: '[누르고 있기]를 꾹 누르면 거품이 생겨요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '거품이 알맞아요 칸에 오면 [멈추기]를 눌러요.',
    zone: [0.31, 0.56],
    labels: { low: '거품이 적어요', good: '알맞아요', high: '거품이 많아요' },
    react: { low: '거품이 조금 적네요.', high: '거품이 조금 많네요.' },
  },
  steam: {
    name: '우유 데우기', of: 'milk', obj: 'obj_pitcher_milk', icon: 'milk', sfx: 'bubbles', hotOnly: true,
    howto: '[누르고 있기]를 꾹 누르면 우유가 데워져요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '온도가 알맞아요 칸에 오면 [멈추기]를 눌러요.',
    safety: '스팀은 아주 뜨거워요. 손은 손잡이만 잡아요.',
    zone: [0.56, 0.81],
    labels: { low: '미지근해요', good: '알맞아요', high: '뜨거워요' },
    react: { low: '조금 미지근하네요.', high: '조금 뜨겁네요.' },
  },
  pour: {
    name: '붓기', of: 'milk', obj: 'obj_pitcher_milk', icon: 'milk', sfx: 'pour', art: 'heart',
    howto: '[누르고 있기]를 꾹 누르면 우유를 부어요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '컵이 알맞아요 칸까지 차면 [멈추기]를 눌러요.',
    zone: [0.69, 0.94],
    labels: { low: '적어요', good: '알맞아요', high: '넘쳐요' },
    react: { low: '양이 조금 적네요.', high: '조금 넘쳤네요.' },
  },
};

/** 라테아트 모양(PRD 6.4: 하트 → 튤립 → 나뭇잎). M1 은 하트만 */
export const LATTE_ART = { heart: { name: '하트' }, tulip: { name: '튤립' }, leaf: { name: '나뭇잎' } };

/**
 * 레시피 (M1 시험판: 아메리카노 · 따뜻한 우유 · 라테)
 *  look: 컵마다 다 만든 음료 그림 ID · art: 라테아트 모양마다 그림 ID
 *  thanks: 알맞게 만들었을 때 손님 말(주문마다 orders[].thanks 로 바꿀 수 있음) · artThanks: 라테아트가 생겼을 때
 *  color: 임시 그림의 음료 색 · foam: 임시 그림의 거품
 */
export const RECIPES = {
  americano: {
    name: '아메리카노', icon: 'coffee',
    cup: 'mug', base: 'espresso', adds: ['water'], temp: 'hot', skills: ['extract'],
    look: { mug: 'cup_mug_americano', paper: 'cup_paper' },
    color: '#4A2C1B',
    thanks: '향이 좋네요. 고마워요.',
  },
  warm_milk: {
    name: '따뜻한 우유', icon: 'milk',
    cup: 'mug', base: 'milk', adds: [], temp: 'hot', skills: ['steam', 'pour'],
    look: { mug: 'cup_mug_milk', paper: 'cup_paper' },
    color: '#FBF7EF', foam: '#FFFFFF',
    thanks: '따뜻하네요. 고마워요.',
  },
  latte: {
    name: '라테', icon: 'coffee',
    cup: 'mug', base: 'espresso', adds: ['milk'], temp: 'hot', skills: ['extract', 'foam', 'steam', 'pour'],
    look: { mug: 'cup_mug_latte', paper: 'cup_paper' },
    art: { heart: 'cup_mug_heart', tulip: 'cup_mug_tulip', leaf: 'cup_mug_leaf' }, // 튤립·나뭇잎 그림은 자유 영업 시트에서
    color: '#C79A6B', foam: '#F4E7D3',
    thanks: '부드러워요. 고마워요.',
    artThanks: '와, 하트네요! 고마워요.',
  },
};

/** 레시피 수첩에 처음부터 있는 메뉴(정답만 보이지 않게 주문과 상관없이 모두) */
export const STARTER_BOOK = ['americano', 'warm_milk', 'latte'];

/** 작업대에 놓인 것(고를 수 있는 것). 레시피에 없는 것도 섞여 있음(유리컵·차갑게·시럽) */
export const PANTRY = {
  cups: ['mug', 'paper', 'glass'],
  bases: ['espresso', 'milk'],
  adds: ['water', 'milk', 'syrup'],
  temps: ['hot', 'iced'],
};

/** 레시피를 고르는 순서 */
export const RECIPE_STEPS = ['cup', 'base', 'adds', 'temp'];
export const STEP_NAMES = { cup: '컵', base: '바탕', adds: '더하기', temp: '온도' };
export const MAX_ADDS = 2;

/* ------------------------------------------------------------------ */
/* 도우미                                                               */
/* ------------------------------------------------------------------ */

/** 두 목록이 같은 것을 담았나(순서 상관없음) */
export function sameSet(a = [], b = []) {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

/** 주문이 원하는 레시피 { cup, base, adds, temp } (주문의 cup 이 있으면 그 컵: 예 '가져갈게요' → paper) */
export function orderTarget(order = {}) {
  const r = RECIPES[order.menu];
  if (!r) return null;
  return { cup: order.cup || r.cup, base: r.base, adds: [...r.adds], temp: r.temp };
}

/** 고른 재료·온도와 같은 메뉴(컵은 보지 않음). 없으면 null */
export function findMenu(made = {}) {
  for (const [id, r] of Object.entries(RECIPES)) {
    if (r.base === made.base && sameSet(r.adds, made.adds || []) && r.temp === made.temp) return id;
  }
  return null;
}

/** 레시피와 다른 곳: ['cup' | 'base' | 'adds' | 'temp'] (같으면 빈 목록) */
export function compareRecipe(made = {}, target = {}) {
  const diff = [];
  if (made.cup !== target.cup) diff.push('cup');
  if (made.base !== target.base) diff.push('base');
  if (!sameSet(made.adds || [], target.adds || [])) diff.push('adds');
  if (made.temp !== target.temp) diff.push('temp');
  return diff;
}

/** 이 단계에서 직접 하는 손 기술인가 */
export function skillInLevel(id, level = 'normal') {
  const s = HAND_SKILLS[id];
  if (!s) return false;
  return !s.from || LEVELS.indexOf(level) >= LEVELS.indexOf(s.from);
}

/** 레시피에 없는 조합일 때 재료로 손 기술을 정함: 에스프레소 → 샷, 우유 → (에스프레소와 함께면 거품) 데우기·붓기 */
function derivedSkills(made) {
  const ings = new Set([made.base, ...(made.adds || [])]);
  const out = [];
  if (ings.has('espresso')) out.push('extract');
  if (ings.has('milk')) out.push(...(ings.has('espresso') ? ['foam'] : []), 'steam', 'pour');
  return out;
}

/**
 * 만드는 순서: [{ skill: 'extract' } | { auto: 'water' | 'ice' }, …]
 *  - 아는 메뉴면 그 레시피의 손 기술, 모르는 조합이면 재료로 정함(잘못 고른 레시피도 고른 대로 만듦)
 *  - 단계에 없는 기술(from)·차가운 음료의 데우기(hotOnly)는 빼고, 손 기술이 없는 재료는 저절로 넣음(auto)
 *  - 얼음(차갑게)은 맨 먼저, 나머지는 재료의 prep 순서
 */
export function prepSteps(made = {}, level = 'normal') {
  const menu = findMenu(made);
  const want = menu ? RECIPES[menu].skills : derivedSkills(made);
  const skills = want.filter((id) => HAND_SKILLS[id] && skillInLevel(id, level) && !(HAND_SKILLS[id].hotOnly && made.temp !== 'hot'));
  const steps = [];
  if (made.temp === 'iced') steps.push({ auto: 'ice' });
  const ings = [...new Set([made.base, ...(made.adds || [])])].filter((id) => INGREDIENTS[id])
    .sort((a, b) => INGREDIENTS[a].prep - INGREDIENTS[b].prep);
  for (const ing of ings) {
    const mine = skills.filter((id) => HAND_SKILLS[id].of === ing);
    if (mine.length) mine.forEach((id) => steps.push({ skill: id }));
    else steps.push({ auto: ing });
  }
  return steps;
}

/** 레시피 수첩·음성이 함께 쓰는 한 줄: '아메리카노. 머그컵, 에스프레소, 물, 따뜻하게.' */
export function recipeSpeech(id) {
  const r = RECIPES[id];
  if (!r) return '';
  const parts = [CUPS[r.cup]?.name, INGREDIENTS[r.base]?.name, ...r.adds.map((a) => INGREDIENTS[a]?.name), TEMPS[r.temp]?.name].filter(Boolean);
  return `${r.name}. ${parts.join(', ')}.`;
}

/** 주문 하나의 문제(검사 도구용): 빈 목록이면 괜찮음. 인물(who)이 있는지는 brew.js 의 brewProblems 가 봄 */
export function orderProblems(order = {}) {
  const errs = [];
  if (!order.who) errs.push('who(손님) 없음');
  if (!order.say) errs.push('say(주문하는 말) 없음');
  if (!RECIPES[order.menu]) errs.push(`없는 메뉴: ${order.menu} (js/data/menu.js 의 RECIPES)`);
  if (order.cup && !CUPS[order.cup]) errs.push(`없는 컵: ${order.cup} (js/data/menu.js 의 CUPS)`);
  return errs;
}

/** 데이터끼리 맞는지(검사 도구용): 레시피의 컵·재료·온도·손 기술·그림 ID 가 다른 표에 있는지 */
export function menuProblems() {
  const errs = [];
  for (const [id, r] of Object.entries(RECIPES)) {
    if (!CUPS[r.cup]) errs.push(`${id}: 없는 컵 ${r.cup}`);
    if (!INGREDIENTS[r.base]?.roles.includes('base')) errs.push(`${id}: 바탕으로 못 쓰는 재료 ${r.base}`);
    for (const a of r.adds) if (!INGREDIENTS[a]?.roles.includes('add')) errs.push(`${id}: 더하기로 못 쓰는 재료 ${a}`);
    if (r.adds.length > MAX_ADDS) errs.push(`${id}: 더하기는 ${MAX_ADDS}개까지`);
    if (!TEMPS[r.temp]) errs.push(`${id}: 없는 온도 ${r.temp}`);
    for (const s of r.skills) if (!HAND_SKILLS[s]) errs.push(`${id}: 없는 손 기술 ${s}`);
  }
  for (const id of STARTER_BOOK) if (!RECIPES[id]) errs.push(`STARTER_BOOK: 없는 메뉴 ${id}`);
  for (const [k, list] of Object.entries(PANTRY)) {
    const table = { cups: CUPS, bases: INGREDIENTS, adds: INGREDIENTS, temps: TEMPS }[k];
    for (const id of list) if (!table?.[id]) errs.push(`PANTRY.${k}: 없는 것 ${id}`);
  }
  return errs;
}
