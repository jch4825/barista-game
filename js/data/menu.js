/**
 * 메뉴·레시피 데이터 (PRD.md 6장 커피 만들기 · docs/recipes.md). 이 데이터를 쓰는 미니게임: js/game/minigames/brew.js
 *
 *  - 주문 = 메뉴 + 온도(따뜻하게 · 아이스) + 매장/포장(드시고 가요 · 가져가요). 손님이 말하지 않은 것은 지은이 물어봄(orders[].ask).
 *  - 컵은 매장/포장과 온도로 정해짐(2026-10-31 사용자 의견 "종이컵인지 머그컵인지, 테이크아웃인지 대화가 없다"):
 *    드시고 가요 = 따뜻하면 머그컵 · 차가우면 유리컵 / 가져가요 = 따뜻하면 종이컵 · 차가우면 플라스틱 컵. 믹스커피처럼 컵이 정해진 메뉴는 cup
 *  - 레시피 = 바탕 재료 하나 + 더하기 0~2 + 온도 + 손 동작(steps, 만드는 순서대로). 학생이 고른 것(made)은 { cup, base, adds: [], temp }.
 *  - 손 동작(HAND_SKILLS)의 act: hold(A 누르고 있다가 떼기) · wait(G 기다렸다 누르기) · circle(B 원 그리기: 젓기 · 나선 붓기) · beats(D 박자 맞춰 누르기)
 *  - obj = 작업대 물건 그림 ID(assets/objects/{id}.webp). 그림이 없으면 brew.js 의 임시 그림(대체 요망, docs/requests_full.md)
 *  - 손님 말(thanks 등)과 띠 글자는 brew.js 의 brewLines()가 음성 목록에 넣습니다.
 *
 * 한국 손님의 주문 습관(2026-10-31 사용자): 아이스 아메리카노가 가장 많고, 겨울에도 많음. 따뜻한 아메리카노는 주로 겨울.
 *  → 아메리카노는 아이스가 기본(temps 의 첫째), 이야기·자유 영업의 일반 손님 주문도 아이스 아메리카노를 가장 많이 둠
 *
 * 새 메뉴 넣기: 없는 재료는 INGREDIENTS 에 한 줄(roles · prep · skills), RECIPES 에 한 줄(temps · steps · look), 새 손 동작은 HAND_SKILLS 에 한 줄
 */

/** 커피 만들기 단계(PRD Q-17): 쉬움 = 손 동작을 모두 보기로 · 보통 = 직접(언제든 [보기]) · 바리스타 = 거품 · 라테아트까지 + 판정 칸이 좁음 */
export const LEVELS = ['easy', 'normal', 'barista'];
export const LEVEL_NAMES = { easy: '쉬움', normal: '보통', barista: '바리스타' };

/** 매장/포장 */
export const SERVICES = {
  here: { name: '드시고 가요', short: '매장', icon: 'chair' },
  togo: { name: '가져가요', short: '포장', icon: 'bag' },
};
/** 컵 고르기 규칙: 매장/포장 × 온도 */
export const SERVICE_CUP = { here: { hot: 'mug', iced: 'glass' }, togo: { hot: 'paper', iced: 'plastic' } };

/** 컵 (obj: 빈 컵 그림) */
export const CUPS = {
  mug: { name: '머그컵', icon: 'coffee', obj: 'cup_mug_empty' },
  thick: { name: '두꺼운 컵', icon: 'coffee', obj: 'cup_thick' },
  glass: { name: '유리컵', icon: 'icecup', obj: 'cup_glass_empty' },
  paper: { name: '종이컵', icon: 'cup', obj: 'cup_paper' },
  plastic: { name: '플라스틱 컵', icon: 'icecup', obj: 'cup_plastic' },
};

/**
 * 재료. roles: 'base'(바탕) · 'add'(더하기) · prep: 넣는 순서(작을수록 먼저)
 * skills: 레시피에 없는 조합일 때 이 재료로 하는 손 동작(온도마다 다르면 { hot, iced }) · auto: 손 동작 없이 넣을 때 읽어 주는 말
 * color: 임시 그림의 음료 색 · shelf: 벽 선반에 놓이는 병·통(brew.js 의 자리)
 */
export const INGREDIENTS = {
  espresso: { name: '에스프레소', icon: 'coffee', obj: 'cup_shot', roles: ['base', 'add'], prep: 2, color: '#3A2214', skills: ['grind', 'tamp', 'extract'] },
  decaf: { name: '디카페인 원두', icon: 'coffee', obj: 'obj_decaf', roles: ['base'], prep: 2, color: '#4A2A18', skills: ['grind', 'tamp', 'extract'], shelf: true },
  drip: { name: '드립 원두', icon: 'coffee', obj: 'obj_drip_beans', roles: ['base'], prep: 2, color: '#24160C', skills: ['hand_grind', 'boil', 'bloom', 'bloom_wait', 'spiral'], shelf: true },
  mix: { name: '믹스커피', icon: 'coffee', obj: 'obj_mix', roles: ['base'], prep: 1, color: '#B07F52', skills: [], auto: { hot: '믹스커피 가루를 컵에 털어 넣었어요.' }, shelf: true },
  barley: { name: '보리차 티백', icon: 'tea', obj: 'obj_barley', roles: ['base'], prep: 1, color: '#C98E4E', skills: ['steep'], shelf: true },
  yuja: { name: '유자청', icon: 'tea', obj: 'obj_yuja', roles: ['base'], prep: 1, color: '#F2C230', skills: ['jam'], shelf: true },
  strawberry: { name: '딸기청', icon: 'juice', obj: 'obj_strawberry', roles: ['base'], prep: 1, color: '#EE7F9C', skills: ['jam'], shelf: true },
  matcha: { name: '말차 가루', icon: 'tea', obj: 'obj_matcha', roles: ['base'], prep: 1, color: '#6FA543', skills: ['powder', 'whisk'], shelf: true },
  cocoa: { name: '코코아 가루', icon: 'coffee', obj: 'obj_cocoa', roles: ['base'], prep: 1, color: '#6B3E26', skills: ['powder'], shelf: true },
  syrup: { name: '바닐라 시럽', icon: 'sparkle', obj: 'obj_syrup', roles: ['add'], prep: 0, color: '#C98A2E', skills: ['syrup'] },
  water: { name: '물', icon: 'water', obj: 'obj_kettle', roles: ['add'], prep: 3, color: '#DCE9EF', skills: ['water'], auto: { hot: '뜨거운 물을 부었어요.', iced: '찬물을 부었어요.' } },
  milk: { name: '우유', icon: 'milk', obj: 'obj_milk_bottle', roles: ['base', 'add'], prep: 4, color: '#FBF7EF', skills: { hot: ['steam', 'pour'], iced: ['pour'] } },
};

/** 온도 (iced: 얼음 담기가 먼저) */
export const TEMPS = {
  hot: { name: '따뜻하게', say: '따뜻한', icon: 'coffee' },
  iced: { name: '아이스', say: '아이스', icon: 'ice', auto: '얼음을 넣었어요.' },
};

/**
 * 손 동작(PRD 6.4 · docs/recipes.md 2장). 위치 값 p 는 0~1, '알맞아요' 칸 zone = [시작, 끝]
 *  act: hold(누르는 동안 차오르고 떼면 정함) · wait(저절로 차오르고 [지금!]을 누르면 정함, 일찍 = 낮음 · 늦게 = 높음)
 *       circle(누르고 있거나 손가락으로 원을 그리면 바퀴가 돎. laps = 알맞은 바퀴 수) · beats(동그라미가 겹칠 때 n 번 누름, 빠르면 높음 · 늦으면 낮음)
 *  of: 이 동작을 하는 재료(배열 가능, 'ice' 는 얼음) · labels: 띠 글자(색만으로 알리지 않음) · react: 그 칸을 벗어났을 때 손님 말
 *  from: 이 단계부터 직접(아래 단계에서는 하지 않음) · temp: 이 온도에서만 · art: 바리스타 단계의 라테아트
 *  sfx: 시작할 때 효과음 · safety: 시작 전 한 줄 안전 안내(PRD 6.4) · ms: 띠가 끝까지 가는 시간(보통, 없으면 brew.js 의 기본)
 */
export const HAND_SKILLS = {
  grind: {
    name: '원두 갈기', act: 'wait', of: ['espresso', 'decaf'], obj: 'obj_grinder', icon: 'coffee', sfx: 'mixer', ms: 4200,
    howto: '그라인더가 원두를 갈아요. 알맞아요 칸에 오면 [지금!]을 눌러 멈춰요.',
    howtoTurn: '[기다리기]를 누르면 조금씩 갈려요. 알맞아요 칸에서 [지금!]을 눌러요.',
    zone: [0.56, 0.8],
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '조금 연하네요.', high: '조금 쓰네요.' },
  },
  tamp: {
    name: '꾹 누르기', act: 'hold', of: ['espresso', 'decaf'], obj: 'obj_tamper', icon: 'hand', sfx: 'stack',
    howto: '[누르고 있기]를 꾹 누르면 힘이 들어가요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '힘이 알맞아요 칸에 오면 [멈추기]를 눌러요.',
    zone: [0.44, 0.69],
    labels: { low: '약해요', good: '알맞아요', high: '세요' },
    react: { low: '조금 연하네요.', high: '조금 쓰네요.' },
  },
  extract: {
    name: '샷 내리기', act: 'hold', of: ['espresso', 'decaf'], obj: 'obj_machine', icon: 'coffee', sfx: 'pour',
    howto: '[누르고 있기]를 꾹 누르면 샷이 나와요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '띠가 알맞아요 칸에 오면 [멈추기]를 눌러요.',
    zone: [0.44, 0.69],
    labels: { low: '연해요', good: '알맞아요', high: '써요' },
    react: { low: '조금 연하네요.', high: '조금 쓰네요.' },
  },
  ice: {
    name: '얼음 담기', act: 'beats', n: 3, of: 'ice', obj: 'obj_ice_bucket', icon: 'ice', sfx: 'ice', temp: 'iced',
    howto: '동그라미가 가운데 원에 겹칠 때 [담기]를 눌러요. 세 번 해요.',
    howtoTurn: '[한 칸]으로 동그라미를 줄이고, 원에 겹치면 [담기]를 눌러요.',
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '얼음이 조금 적네요.', high: '얼음이 조금 많네요.' },
  },
  syrup: {
    name: '시럽 넣기', act: 'beats', n: 2, of: 'syrup', obj: 'obj_syrup', icon: 'sparkle', sfx: 'stack',
    howto: '동그라미가 가운데 원에 겹칠 때 [펌프]를 눌러요. 두 번 해요.',
    howtoTurn: '[한 칸]으로 동그라미를 줄이고, 원에 겹치면 [펌프]를 눌러요.',
    labels: { low: '덜 달아요', good: '알맞아요', high: '너무 달아요' },
    react: { low: '조금 덜 다네요.', high: '조금 많이 다네요.' },
  },
  jam: {
    name: '청 떠 넣기', act: 'beats', n: 2, of: ['yuja', 'strawberry'], obj: 'obj_yuja', icon: 'tea', sfx: 'pour',
    howto: '동그라미가 가운데 원에 겹칠 때 [떠 넣기]를 눌러요. 두 번 해요.',
    howtoTurn: '[한 칸]으로 동그라미를 줄이고, 원에 겹치면 [떠 넣기]를 눌러요.',
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '조금 덜 다네요.', high: '조금 많이 다네요.' },
  },
  powder: {
    name: '가루 떠 넣기', act: 'beats', n: 2, of: ['cocoa', 'matcha'], obj: 'obj_cocoa', icon: 'coffee', sfx: 'stack',
    howto: '동그라미가 가운데 원에 겹칠 때 [떠 넣기]를 눌러요. 두 번 해요.',
    howtoTurn: '[한 칸]으로 동그라미를 줄이고, 원에 겹치면 [떠 넣기]를 눌러요.',
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '조금 연하네요.', high: '조금 진하네요.' },
  },
  whisk: {
    name: '말차 풀기', act: 'circle', laps: 5, of: 'matcha', obj: 'obj_matcha', icon: 'tea', sfx: 'wipe',
    howto: '[누르고 있기]를 누르거나 컵 위에 원을 그려요. 다섯 바퀴에서 멈춰요.',
    howtoTurn: '[한 칸]을 누르면 반 바퀴씩 돌아요. 다섯 바퀴에서 [멈추기]를 눌러요.',
    labels: { low: '덜 풀렸어요', good: '알맞아요', high: '너무 저었어요' },
    react: { low: '가루가 조금 남았네요.', high: '거품이 조금 많네요.' },
  },
  steam: {
    name: '우유 데우기', act: 'hold', of: 'milk', obj: 'obj_pitcher_milk', icon: 'milk', sfx: 'bubbles', temp: 'hot',
    howto: '[누르고 있기]를 꾹 누르면 우유가 데워져요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '온도가 알맞아요 칸에 오면 [멈추기]를 눌러요.',
    safety: '스팀은 아주 뜨거워요. 손은 손잡이만 잡아요.',
    zone: [0.56, 0.81],
    labels: { low: '미지근해요', good: '알맞아요', high: '뜨거워요' },
    react: { low: '조금 미지근하네요.', high: '조금 뜨겁네요.' },
  },
  foam: {
    name: '거품 내기', act: 'hold', of: 'milk', obj: 'obj_pitcher_milk', icon: 'milk', sfx: 'bubbles', from: 'barista', temp: 'hot',
    howto: '[누르고 있기]를 꾹 누르면 거품이 생겨요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '거품이 알맞아요 칸에 오면 [멈추기]를 눌러요.',
    zone: [0.31, 0.56],
    labels: { low: '거품이 적어요', good: '알맞아요', high: '거품이 많아요' },
    react: { low: '거품이 조금 적네요.', high: '거품이 조금 많네요.' },
  },
  milk_in: {
    name: '피처에 우유 붓기', act: 'hold', of: 'milk', obj: 'obj_milk_bottle', icon: 'milk', sfx: 'pour', temp: 'hot',
    howto: '[누르고 있기]를 꾹 누르면 피처에 우유가 들어가요. 선에서 손을 떼요.',
    howtoTurn: '우유가 선에 오면 [멈추기]를 눌러요.',
    zone: [0.5, 0.75],
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '양이 조금 적네요.', high: '양이 조금 많네요.' },
  },
  tap: {
    name: '피처 톡톡', act: 'beats', n: 2, of: 'milk', obj: 'obj_pitcher_milk', icon: 'milk', sfx: 'clink', temp: 'hot',
    howto: '동그라미가 가운데 원에 겹칠 때 [톡]을 눌러요. 큰 거품이 사라져요.',
    howtoTurn: '[한 칸]으로 동그라미를 줄이고, 원에 겹치면 [톡]을 눌러요.',
    labels: { low: '거품이 거칠어요', good: '알맞아요', high: '거품이 꺼졌어요' },
    react: { low: '거품이 조금 거칠네요.', high: '거품이 조금 적네요.' },
  },
  pour: {
    name: '붓기', act: 'hold', of: 'milk', obj: 'obj_pitcher_milk', icon: 'milk', sfx: 'pour', art: 'heart',
    howto: '[누르고 있기]를 꾹 누르면 우유를 부어요. 알맞아요 칸에서 손을 떼요.',
    howtoTurn: '컵이 알맞아요 칸까지 차면 [멈추기]를 눌러요.',
    zone: [0.69, 0.94],
    labels: { low: '적어요', good: '알맞아요', high: '넘쳐요' },
    react: { low: '양이 조금 적네요.', high: '조금 넘쳤네요.' },
  },
  water: {
    name: '물 붓기', act: 'hold', of: 'water', obj: 'obj_kettle', icon: 'water', sfx: 'pour',
    howto: '[누르고 있기]를 꾹 누르면 주전자로 물을 부어요. 잔이 알맞아요 칸까지 차면 손을 떼요.',
    howtoTurn: '물이 알맞아요 칸까지 차면 [멈추기]를 눌러요.',
    zone: [0.69, 0.94], // 블렌더 물 붓기 컷(water)과 같은 칸: 0.69~0.94 = 거의 가득, 1 = 받침에 넘침(docs/recipes.md 6.6)
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '조금 진하네요.', high: '조금 싱겁네요.' },
  },
  boil: {
    name: '물 끓이기', act: 'wait', of: 'water', obj: 'obj_kettle', icon: 'water', sfx: 'bubbles', temp: 'hot', ms: 4600,
    howto: '물이 끓기를 기다려요. 보글보글 끓으면 [지금!]을 눌러요.',
    howtoTurn: '[기다리기]를 누르면 물이 데워져요. 끓으면 [지금!]을 눌러요.',
    safety: '주전자와 김은 뜨거워요. 손잡이만 잡아요.',
    zone: [0.66, 0.88],
    labels: { low: '일러요', good: '알맞아요', high: '늦어요' },
    react: { low: '물이 조금 미지근하네요.', high: '물이 조금 졸았네요.' },
  },
  steep: {
    name: '우리기', act: 'wait', of: 'barley', obj: 'obj_barley', icon: 'tea', sfx: 'water', ms: 4600,
    howto: '티백이 우러나기를 기다려요. 색이 알맞으면 [지금!]을 눌러 꺼내요.',
    howtoTurn: '[기다리기]를 누르면 조금씩 우러나요. 알맞으면 [지금!]을 눌러요.',
    zone: [0.58, 0.82],
    labels: { low: '연해요', good: '알맞아요', high: '진해요' },
    react: { low: '조금 연하네요.', high: '조금 진하네요.' },
  },
  hand_grind: {
    name: '손으로 원두 갈기', act: 'circle', laps: 6, of: 'drip', obj: 'obj_hand_grinder', icon: 'coffee', sfx: 'mixer',
    howto: '[누르고 있기]를 누르거나 손잡이 쪽에 원을 그려요. 여섯 바퀴에서 멈춰요.',
    howtoTurn: '[한 칸]을 누르면 반 바퀴씩 돌아요. 여섯 바퀴에서 [멈추기]를 눌러요.',
    labels: { low: '덜 갈았어요', good: '알맞아요', high: '너무 갈았어요' },
    react: { low: '조금 연하네요.', high: '조금 쓰네요.' },
  },
  bloom: {
    name: '뜸 붓기', act: 'hold', of: 'water', obj: 'obj_dripper', icon: 'water', sfx: 'pour', temp: 'hot',
    howto: '[누르고 있기]를 살짝 눌러 물을 조금만 부어요. 가루가 젖으면 손을 떼요.',
    howtoTurn: '가루가 알맞게 젖으면 [멈추기]를 눌러요.',
    zone: [0.3, 0.55],
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '조금 진하네요.', high: '조금 연하네요.' },
  },
  bloom_wait: {
    name: '뜸 들이기', act: 'wait', of: 'drip', obj: 'obj_dripper', icon: 'hourglass', sfx: 'bubbles', temp: 'hot', ms: 5000,
    howto: '가루가 빵처럼 부풀었다가 가라앉아요. 가라앉기 시작하면 [지금!]을 눌러요.',
    howtoTurn: '[기다리기]를 누르며 지켜봐요. 가라앉기 시작하면 [지금!]을 눌러요.',
    zone: [0.62, 0.86],
    labels: { low: '일러요', good: '알맞아요', high: '늦어요' },
    react: { low: '조금 연하네요.', high: '조금 진하네요.' },
  },
  spiral: {
    name: '나선 붓기', act: 'circle', laps: 3, of: 'water', obj: 'obj_dripper', icon: 'water', sfx: 'pour', temp: 'hot',
    howto: '[누르고 있기]를 누르거나 드리퍼 위에 천천히 원을 그려요. 세 바퀴에서 멈춰요.',
    howtoTurn: '[한 칸]을 누르면 반 바퀴씩 부어요. 세 바퀴에서 [멈추기]를 눌러요.',
    labels: { low: '적어요', good: '알맞아요', high: '많아요' },
    react: { low: '조금 진하네요.', high: '조금 연하네요.' },
  },
  stir: {
    name: '젓기', act: 'circle', laps: 3, of: ['mix', 'yuja', 'strawberry', 'cocoa'], obj: 'obj_spoon', icon: 'cup', sfx: 'wipe',
    howto: '[누르고 있기]를 누르거나 컵 위에 원을 그려요. 알맞은 바퀴에서 멈춰요.',
    howtoTurn: '[한 칸]을 누르면 반 바퀴씩 돌아요. 알맞은 바퀴에서 [멈추기]를 눌러요.',
    labels: { low: '덜 저었어요', good: '알맞아요', high: '너무 저었어요' },
    react: { low: '가루가 조금 남았네요.', high: '조금 흘렀네요.' },
  },
};

/** 라테아트 모양(PRD 6.4: 하트 → 튤립 → 나뭇잎). 이야기에서는 하트 */
export const LATTE_ART = { heart: { name: '하트' }, tulip: { name: '튤립' }, leaf: { name: '나뭇잎' } };

/** 지안의 '색'(PRD Q-9 🙋): 메뉴판의 색 동그라미 */
export const COLORS = {
  yellow: { name: '노란색', hex: '#F2C230' },
  green: { name: '초록색', hex: '#7DAF4E' },
  pink: { name: '분홍색', hex: '#F2A0B6' },
  brown: { name: '갈색', hex: '#8A5A3C' },
  white: { name: '하얀색', hex: '#F7F3EA' },
};

/**
 * 레시피
 *  temps: 고를 수 있는 온도(첫째가 메뉴판의 기본) · steps: 손 동작 순서(그 온도·단계에 없는 것은 빠짐) · cup: 컵이 정해진 메뉴
 *  look: 컵마다 다 만든 음료 그림 ID · art: 라테아트 그림 ID · color: 임시 그림의 음료 색 · foam: 거품 색
 *  thanks: 알맞게 만들었을 때 손님 말(주문마다 orders[].thanks 로 바꿈) · artThanks: 라테아트가 생겼을 때
 *  zones · laps: 이 메뉴에서만 다른 '알맞아요' 칸 · 바퀴 수(예: 믹스커피의 사장님 방식) · note: 수첩의 손글씨 메모
 *  tag: 지안의 색(COLORS) · desc: 수첩의 짧은 설명
 */
export const RECIPES = {
  americano: {
    name: '아메리카노', icon: 'coffee',
    base: 'espresso', adds: ['water'], temps: ['iced', 'hot'], steps: ['ice', 'grind', 'tamp', 'extract', 'water'],
    look: { mug: 'cup_mug_americano', glass: 'cup_glass_ice' },
    color: '#4A2C1B',
    thanks: '향이 좋네요. 고마워요.',
    desc: '가장 많이 팔리는 커피. 아이스를 많이 찾아요.',
  },
  latte: {
    name: '라테', icon: 'coffee',
    base: 'espresso', adds: ['milk'], temps: ['hot', 'iced'], steps: ['ice', 'tamp', 'extract', 'foam', 'steam', 'pour'],
    look: { mug: 'cup_mug_latte' },
    art: { heart: 'cup_mug_heart', tulip: 'cup_mug_tulip', leaf: 'cup_mug_leaf' },
    color: '#C79A6B', foam: '#F4E7D3',
    thanks: '부드러워요. 고마워요.',
    artThanks: '와, 하트네요! 고마워요.',
    desc: '에스프레소에 우유를 넣어요.',
  },
  vanilla_latte: {
    name: '바닐라 라테', icon: 'coffee',
    base: 'espresso', adds: ['milk', 'syrup'], temps: ['hot', 'iced'], steps: ['syrup', 'ice', 'tamp', 'extract', 'steam', 'pour'],
    look: { mug: 'cup_mug_latte' }, art: { heart: 'cup_mug_heart' }, // 겉보기는 라테와 같음(2026-11-01)
    color: '#CFA373', foam: '#F6EAD6',
    thanks: '딱 좋게 다네요. 고마워요.',
    desc: '달게 마시고 싶은 손님에게. 라테에 바닐라 시럽.',
  },
  decaf_latte: {
    name: '디카페인 라테', icon: 'coffee',
    base: 'decaf', adds: ['milk'], temps: ['hot', 'iced'], steps: ['ice', 'tamp', 'extract', 'foam', 'steam', 'pour'],
    look: { mug: 'cup_mug_latte' }, // 겉보기는 라테와 같음
    color: '#C49A70', foam: '#F4E7D3',
    thanks: '이거면 마음 놓고 마셔요. 고마워요.',
    desc: '카페인을 뺀 원두로 만든 라테.',
  },
  warm_milk: {
    name: '따뜻한 우유', icon: 'milk',
    base: 'milk', adds: [], temps: ['hot'], steps: ['milk_in', 'steam', 'tap', 'pour'],
    look: { mug: 'cup_mug_milk' },
    color: '#FBF7EF', foam: '#FFFFFF', tag: 'white',
    thanks: '따뜻하네요. 고마워요.',
    desc: '우유만 데워요. 하얀색.',
  },
  hand_drip: {
    name: '핸드드립', icon: 'coffee',
    base: 'drip', adds: ['water'], temps: ['hot'], steps: ['hand_grind', 'boil', 'bloom', 'bloom_wait', 'spiral'],
    look: { mug: 'cup_mug_americano' }, // 머그에 담은 블랙 커피: 아메리카노 그림과 같음(2026-11-01 사용자 "다른 이미지를 써도")
    color: '#2A1A10',
    thanks: '깊네요. 고마워요.',
    desc: '전기 없이도 만드는 커피. 천천히 내려요.',
  },
  mix_coffee: {
    name: '믹스커피', icon: 'coffee',
    base: 'mix', adds: ['water'], temps: ['hot'], cup: 'paper', steps: ['auto:mix', 'water', 'stir'],
    zones: { water: [0.6, 0.78] }, laps: { stir: 10 },
    color: '#B07F52',
    thanks: '…같네.',
    note: '사장님 메모: 물은 종이컵 안쪽 선까지. 숟가락으로 열 바퀴.',
    desc: '종이컵에 믹스 한 봉지.',
  },
  barley_tea: {
    name: '보리차', icon: 'tea',
    base: 'barley', adds: ['water'], temps: ['hot', 'iced'], steps: ['boil', 'water', 'steep', 'ice'],
    color: '#C98E4E',
    thanks: '구수하네요. 고마워요.',
    desc: '메뉴판에서 가장 싼 음료.',
  },
  yuja_tea: {
    name: '유자차', icon: 'tea',
    base: 'yuja', adds: ['water'], temps: ['hot', 'iced'], steps: ['ice', 'boil', 'jam', 'water', 'stir'],
    color: '#F2C230', tag: 'yellow',
    thanks: '상큼해요. 고마워요.',
    desc: '노란색. 유자청에 물을 부어요.',
  },
  greentea_latte: {
    name: '녹차라테', icon: 'tea',
    base: 'matcha', adds: ['milk'], temps: ['iced', 'hot'], steps: ['powder', 'whisk', 'ice', 'steam', 'pour'],
    color: '#A8C97F', tag: 'green',
    thanks: '쌉쌀하고 시원해요. 고마워요.',
    desc: '초록색. 말차를 풀고 우유를 부어요.',
  },
  strawberry_milk: {
    name: '딸기우유', icon: 'juice',
    base: 'strawberry', adds: ['milk'], temps: ['iced'], steps: ['ice', 'jam', 'pour', 'stir'],
    color: '#F7B6C8', tag: 'pink',
    thanks: '달콤해요. 고마워요.',
    desc: '분홍색. 딸기청에 우유를 부어요.',
  },
  cocoa: {
    name: '코코아', icon: 'coffee',
    base: 'cocoa', adds: ['milk'], temps: ['hot', 'iced'], steps: ['powder', 'ice', 'steam', 'pour', 'stir'],
    color: '#8A5A3C', foam: '#C9A487', tag: 'brown',
    thanks: '달고 따뜻해요. 고마워요.',
    desc: '갈색. 코코아 가루에 우유를 부어요.',
  },
};

/** 레시피 수첩에 처음부터 있는 메뉴(정답만 보이지 않게 주문과 상관없이). 계절마다 늘어남(opts.book) */
export const STARTER_BOOK = ['americano', 'latte', 'warm_milk'];
/** 이야기에 나오는 모든 메뉴(자유 영업 · 엔딩 뒤 수첩) */
export const ALL_MENUS = Object.keys(RECIPES);

/** 작업대에 놓인 것(고를 수 있는 것). 주문에 든 것은 brew.js 가 더함 */
export const PANTRY = {
  cups: ['mug', 'glass', 'paper', 'plastic'],
  bases: ['espresso', 'milk'],
  adds: ['water', 'milk', 'syrup'],
  temps: ['hot', 'iced'],
};

export const RECIPE_STEPS = ['cup', 'base', 'adds', 'temp'];
export const STEP_NAMES = { cup: '컵', base: '바탕', adds: '더하기', temp: '온도' };
export const MAX_ADDS = 2;

/* ------------------------------------------------------------------ */
/* 도우미                                                               */
/* ------------------------------------------------------------------ */

const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
/** 이 동작이 이 재료에 하는 것인가 */
export const skillOf = (id, ing) => asList(HAND_SKILLS[id]?.of).includes(ing);

/** 두 목록이 같은 것을 담았나(순서 상관없음) */
export function sameSet(a = [], b = []) {
  return a.length === b.length && [...a].sort().join() === [...b].sort().join();
}

/** 주문의 온도(없으면 메뉴판의 기본) */
export function orderTemp(order = {}) {
  const r = RECIPES[order.menu];
  return order.temp || r?.temps[0] || 'hot';
}
/** 주문의 매장/포장 */
export const orderService = (order = {}) => (order.togo ? 'togo' : 'here');

/** 주문에 맞는 컵: 주문이 정한 컵 → 메뉴가 정한 컵 → 매장/포장 × 온도 */
export function cupFor(order = {}) {
  const r = RECIPES[order.menu];
  return order.cup || r?.cup || SERVICE_CUP[orderService(order)][orderTemp(order)];
}

/** 주문이 원하는 레시피 { cup, base, adds, temp } */
export function orderTarget(order = {}) {
  const r = RECIPES[order.menu];
  if (!r) return null;
  return { cup: cupFor(order), base: r.base, adds: [...r.adds], temp: orderTemp(order) };
}

/** 지은이 물어봐야 하는 것: 주문에 적은 ask(손님이 말하지 않은 것). 온도가 하나뿐인 메뉴 · 컵이 정해진 메뉴는 묻지 않음 */
export function orderAsk(order = {}) {
  const r = RECIPES[order.menu];
  return asList(order.ask).filter((k) => (k === 'temp' ? (r?.temps.length || 0) > 1 : k === 'togo' ? !order.cup && !r?.cup : false));
}

/** 묻는 말(지은) */
export const ASK_SAY = {
  temp: '따뜻한 걸로 드릴까요, 아이스로 드릴까요?',
  togo: '드시고 가세요, 가져가세요?',
};
/** 손님의 대답(기본). orders[].reply 로 바꿈 */
export function replyOf(order, key) {
  if (order.reply?.[key]) return order.reply[key];
  if (key === 'temp') return orderTemp(order) === 'iced' ? '아이스로 주세요.' : '따뜻한 걸로 주세요.';
  return order.togo ? '가져갈게요.' : '먹고 갈게요.';
}

/** 메뉴 이름(온도를 붙여서): '아이스 아메리카노' · '따뜻한 라테' · 온도가 하나뿐이면 이름만 */
export function drinkName(menu, temp) {
  const r = RECIPES[menu];
  if (!r) return '';
  if (r.temps.length < 2) return r.name;
  return `${TEMPS[temp]?.say || ''} ${r.name}`.trim();
}

const CUP_COUNT = ['', '한', '두', '세', '네'];
/** 주문 확인(지은이 되풀이): '아이스 아메리카노 한 잔, 가져가시는 거죠?' · usual 이면 '늘 드시던 걸로 준비할게요.'
 *  count: 손님이 말한 잔 수('두 잔'. 한 잔씩 만드니 나머지는 다음 주문으로 따로) · more: 앞 주문의 다음 잔('한 잔 더')(2026-10-31 사용자: 두 잔인데 한 잔이라고 함) */
export function repeatBack(order = {}) {
  if (order.usual) return '늘 드시던 걸로 준비할게요.';
  const cupFixed = order.cup || RECIPES[order.menu]?.cup;
  const tail = cupFixed ? '맞으시죠?' : order.togo ? '가져가시는 거죠?' : '드시고 가시는 거죠?';
  const n = order.more ? '한 잔 더' : `${CUP_COUNT[order.count || 1]} 잔`;
  return `${drinkName(order.menu, orderTemp(order))} ${n}, ${tail}`;
}

/** 고른 재료·온도와 같은 메뉴(컵은 보지 않음). 없으면 null */
export function findMenu(made = {}) {
  for (const [id, r] of Object.entries(RECIPES)) {
    if (r.base === made.base && sameSet(r.adds, made.adds || []) && r.temps.includes(made.temp)) return id;
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

/** 이 단계에서 직접 하는 손 동작인가 */
export function skillInLevel(id, level = 'normal') {
  const s = HAND_SKILLS[id];
  if (!s) return false;
  return !s.from || LEVELS.indexOf(level) >= LEVELS.indexOf(s.from);
}

/** 레시피 steps 의 'auto:재료'(손 동작 없이 그 자리에서 넣음) */
const isAuto = (id) => String(id).startsWith('auto:');

/** 이 온도에서 하는 손 동작인가 */
const skillInTemp = (id, temp) => !HAND_SKILLS[id]?.temp || HAND_SKILLS[id].temp === temp;

/** 레시피에 없는 조합일 때 재료로 손 동작을 정함 */
function derivedSkills(made) {
  const ings = [...new Set([made.base, ...(made.adds || [])])].filter((id) => INGREDIENTS[id]).sort((a, b) => INGREDIENTS[a].prep - INGREDIENTS[b].prep);
  const out = made.temp === 'iced' ? ['ice'] : [];
  for (const ing of ings) {
    const sk = INGREDIENTS[ing].skills;
    const list = Array.isArray(sk) ? sk : sk?.[made.temp] || [];
    for (const s of list) if (!out.includes(s)) out.push(s);
  }
  return out;
}

/**
 * 만드는 순서: [{ skill: 'extract', ing } | { auto: 'water' | 'ice' | 'mix' }, …]
 *  - 아는 메뉴면 그 레시피의 steps, 모르는 조합이면 재료로 정함(잘못 고른 레시피도 고른 대로 만듦)
 *  - 단계에 없는 동작(from) · 그 온도에 하지 않는 동작(temp)은 빼고, 손 동작이 없는 재료는 맨 앞에 저절로 넣음(auto)
 *  - ing: 그 동작이 다루는 이 잔의 재료(컵에 들어가는 때를 셈: 그 재료의 마지막 동작이 끝나면 컵에 듦)
 */
export function prepSteps(made = {}, level = 'normal') {
  const menu = findMenu(made);
  const ings = [...new Set([made.base, ...(made.adds || [])])].filter((id) => INGREDIENTS[id]);
  const want = (menu ? RECIPES[menu].steps : derivedSkills(made))
    .filter((id) => isAuto(id) || (HAND_SKILLS[id] && skillInLevel(id, level) && skillInTemp(id, made.temp)));
  const steps = [];
  const covered = new Set();
  for (const id of want) {
    if (isAuto(id)) { // 'auto:mix': 손 동작 없이 이 자리에서 넣음
      const x = id.slice(5);
      if (ings.includes(x)) { covered.add(x); steps.push({ auto: x }); }
      continue;
    }
    const ing = id === 'ice' ? 'ice' : ings.find((x) => skillOf(id, x)) || null;
    if (!ing) continue; // 이 잔에 없는 재료의 동작
    covered.add(ing);
    steps.push({ skill: id, ing });
  }
  const autos = ings.filter((x) => !covered.has(x)).sort((a, b) => INGREDIENTS[a].prep - INGREDIENTS[b].prep).map((x) => ({ auto: x }));
  if (made.temp === 'iced' && !covered.has('ice')) autos.unshift({ auto: 'ice' });
  return [...autos, ...steps];
}

/** 이 메뉴에서의 손 동작(메뉴마다 다른 칸 · 바퀴 수를 덮어씀) */
export function skillFor(id, menu = null) {
  const s = HAND_SKILLS[id];
  if (!s) return null;
  const r = RECIPES[menu];
  const zone = r?.zones?.[id];
  const laps = r?.laps?.[id];
  return zone || laps ? { ...s, ...(zone ? { zone } : {}), ...(laps ? { laps } : {}) } : s;
}

/** 레시피 수첩·음성이 함께 쓰는 한 줄: '아메리카노. 아이스 또는 따뜻하게. 에스프레소, 물.' */
export function recipeSpeech(id) {
  const r = RECIPES[id];
  if (!r) return '';
  const temps = r.temps.map((t) => TEMPS[t].name).join(' 또는 ');
  const parts = [INGREDIENTS[r.base]?.name, ...r.adds.map((a) => INGREDIENTS[a]?.name)].filter(Boolean);
  return `${r.name}. ${temps}. ${parts.join(', ')}.`;
}

/** 수첩 맨 위의 컵 고르기 규칙(읽어 줌) */
export const CUP_RULE = '드시고 가면 따뜻한 음료는 머그컵, 차가운 음료는 유리컵. 가져가면 따뜻한 음료는 종이컵, 차가운 음료는 플라스틱 컵.';

/** 주문 하나의 문제(검사 도구용): 빈 목록이면 괜찮음. 인물(who)이 있는지는 brew.js 의 brewProblems 가 봄 */
export function orderProblems(order = {}) {
  const errs = [];
  if (!order.who) errs.push('who(손님) 없음');
  if (!order.say) errs.push('say(주문하는 말) 없음');
  const r = RECIPES[order.menu];
  if (!r) { errs.push(`없는 메뉴: ${order.menu} (js/data/menu.js 의 RECIPES)`); return errs; }
  if (order.cup && !CUPS[order.cup]) errs.push(`없는 컵: ${order.cup} (js/data/menu.js 의 CUPS)`);
  if (order.temp && !r.temps.includes(order.temp)) errs.push(`${order.menu} 에 없는 온도: ${order.temp}`);
  if (r.temps.length > 1 && !order.temp) errs.push(`${order.menu}: 온도(temp)를 정해야 함(${r.temps.join('·')})`);
  for (const k of asList(order.ask)) if (!['temp', 'togo'].includes(k)) errs.push(`ask 는 temp · togo 만: ${k}`);
  if (order.togo !== undefined && typeof order.togo !== 'boolean') errs.push('togo 는 true · false');
  if (order.count !== undefined && !(Number.isInteger(order.count) && order.count >= 1 && order.count < CUP_COUNT.length)) errs.push(`count 는 1~${CUP_COUNT.length - 1}`);
  if (order.count > 1 && order.more) errs.push('count 와 more 는 함께 쓰지 않음');
  return errs;
}

/** 데이터끼리 맞는지(검사 도구용): 레시피의 컵·재료·온도·손 동작·그림 ID 가 다른 표에 있는지 */
export function menuProblems() {
  const errs = [];
  const ACTS = ['hold', 'wait', 'circle', 'beats'];
  for (const [id, s] of Object.entries(HAND_SKILLS)) {
    if (!ACTS.includes(s.act)) errs.push(`손 동작 ${id}: act 는 ${ACTS.join('·')}`);
    if (['hold', 'wait'].includes(s.act) && !(s.zone?.length === 2 && s.zone[0] < s.zone[1])) errs.push(`손 동작 ${id}: zone 필요`);
    if (s.act === 'circle' && !(s.laps >= 1)) errs.push(`손 동작 ${id}: laps 필요`);
    if (s.act === 'beats' && !(s.n >= 1 && s.n <= 4)) errs.push(`손 동작 ${id}: n 은 1~4`);
    for (const k of ['low', 'good', 'high']) if (!s.labels?.[k]) errs.push(`손 동작 ${id}: labels.${k} 없음`);
    for (const k of ['low', 'high']) if (!s.react?.[k]) errs.push(`손 동작 ${id}: react.${k} 없음`);
    if (!s.howto || !s.howtoTurn) errs.push(`손 동작 ${id}: howto · howtoTurn 필요`);
    for (const ing of asList(s.of)) if (ing !== 'ice' && !INGREDIENTS[ing]) errs.push(`손 동작 ${id}: 없는 재료 ${ing}`);
  }
  for (const [id, r] of Object.entries(RECIPES)) {
    if (r.cup && !CUPS[r.cup]) errs.push(`${id}: 없는 컵 ${r.cup}`);
    if (!INGREDIENTS[r.base]?.roles.includes('base')) errs.push(`${id}: 바탕으로 못 쓰는 재료 ${r.base}`);
    for (const a of r.adds) if (!INGREDIENTS[a]?.roles.includes('add')) errs.push(`${id}: 더하기로 못 쓰는 재료 ${a}`);
    if (r.adds.length > MAX_ADDS) errs.push(`${id}: 더하기는 ${MAX_ADDS}개까지`);
    if (!r.temps?.length || r.temps.some((t) => !TEMPS[t])) errs.push(`${id}: temps 가 비었거나 없는 온도`);
    for (const s of r.steps || []) if (isAuto(s) ? !INGREDIENTS[s.slice(5)] : !HAND_SKILLS[s]) errs.push(`${id}: 없는 손 동작 ${s}`);
    if (r.tag && !COLORS[r.tag]) errs.push(`${id}: 없는 색 ${r.tag}`);
    // 한 잔 4~6동작(✅ Q-R3, 보통 단계): 믹스커피 · 보리차처럼 짧은 잔은 그대로 둠
    for (const t of r.temps) {
      const n = prepSteps({ cup: SERVICE_CUP.here[t], base: r.base, adds: r.adds, temp: t }, 'normal').filter((x) => x.skill).length;
      if (n < 2 || n > 6) errs.push(`${id}(${t}): 보통 단계 손 동작 ${n}개(2~6개)`);
    }
  }
  // 같은 재료·온도로 두 메뉴가 겹치면 학생이 만든 잔이 무엇인지 정할 수 없음
  const keys = new Map();
  for (const [id, r] of Object.entries(RECIPES)) for (const t of r.temps) {
    const k = `${r.base}|${[...r.adds].sort().join(',')}|${t}`;
    if (keys.has(k)) errs.push(`${id} 와 ${keys.get(k)}: 재료와 온도가 같음`);
    keys.set(k, id);
  }
  for (const id of STARTER_BOOK) if (!RECIPES[id]) errs.push(`STARTER_BOOK: 없는 메뉴 ${id}`);
  for (const [k, list] of Object.entries(PANTRY)) {
    const table = { cups: CUPS, bases: INGREDIENTS, adds: INGREDIENTS, temps: TEMPS }[k];
    for (const id of list) if (!table?.[id]) errs.push(`PANTRY.${k}: 없는 것 ${id}`);
  }
  return errs;
}
