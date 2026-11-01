/**
 * 자유 영업(엔딩 뒤, docs/story.md 10장 ✅): 날 번호(n)로 정해지는 하루. 같은 날은 늘 같은 하루(시드 난수)
 *  - 계절: 28일을 한 바퀴로 봄 → 여름 → 가을 → 겨울(이야기와 같은 달력)
 *  - 손님 6~8명: 아이스 아메리카노가 가장 많음(겨울에도, 사용자 2026-10-31) · 단골의 '늘 먹던 거' · 계절 메뉴 · 애매한 주문
 *    온도나 매장/포장을 말하지 않는 손님도 섞어서, 묻고 되풀이하는 연습이 되게 함
 *  - 이야기 뒤 단골들의 근황(앨범 액자가 열린 단골은 그 뒤의 이야기) · 직업 마1스톤 손님의 한두 마디 · 오늘의 도전 하나
 *  - 대응 기회가 없어서 단골 신뢰는 바뀌지 않음. 하루 끝 화면에는 '오늘 만든 잔'이 나옴
 * main.js 가 store.free().day + 1 로 만들어 틀고, 마치면 날 번호를 올립니다. 검사기는 1~28일을 모두 검사합니다.
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, memo, mini, end } from '../../core/dsl.js';
import { RECIPES } from '../menu.js';
import { REGULARS } from '../regulars.js';

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
const SEASON_NAME = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
const COSTUMES = ['sporty', 'olive', 'coffee', 'stripe', 'arms'];
const FULL_BOOK = Object.keys(RECIPES);

/** 시드 난수(mulberry32): 같은 날은 늘 같은 손님 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 온도가 하나뿐인 메뉴는 그 온도, 아니면 주어진 온도 */
const tempOf = (menu, want) => (RECIPES[menu].temps.length > 1 ? want : RECIPES[menu].temps[0]);

/** 이름 없는 손님의 주문(계절에 따라). r: 난수 */
function guestOrder(season, r) {
  const togo = r() < 0.5;
  const where = togo ? '가져갈게요.' : '여기서 마실게요.';
  const x = r();
  // 1) 아이스 아메리카노: 가장 많음. 온도를 말하지 않는 손님도 섞음(겨울이면 따뜻한 걸 찾기도 함)
  if (x < 0.42) {
    if (r() < 0.35) {
      const hot = season === 'winter' && r() < 0.4;
      return { who: 'customer', say: '아메리카노 하나요.', menu: 'americano', temp: hot ? 'hot' : 'iced', togo, ask: ['temp', 'togo'], reply: { temp: hot ? '오늘은 따뜻한 걸로요.' : '아이스로요. 겨울에도 아아죠.' } };
    }
    const say = ['아아 하나요.', '아이스 아메리카노 하나 주세요.', '아아 한 잔이요.'][Math.floor(r() * 3)];
    return { who: 'customer', say, menu: 'americano', temp: 'iced', togo, ask: ['togo'], reply: { togo: where } };
  }
  // 2) 라테: 여름은 거의 아이스, 겨울은 거의 따뜻하게
  if (x < 0.6) {
    const iced = season === 'summer' ? r() < 0.85 : season === 'winter' ? r() < 0.25 : r() < 0.55;
    return { who: 'customer', say: `${iced ? '아이스' : '따뜻한'} 라테 하나요. ${where}`, menu: 'latte', temp: iced ? 'iced' : 'hot', togo };
  }
  // 3) 계절 메뉴
  if (x < 0.85) {
    const pool = {
      spring: [['strawberry_milk', 'iced', '딸기우유 하나요.'], ['latte', 'iced', '아이스 라테요.'], ['yuja_tea', 'iced', '유자차, 차갑게요.']],
      summer: [['greentea_latte', 'iced', '녹차라테, 차갑게 주세요.'], ['strawberry_milk', 'iced', '딸기우유요!'], ['yuja_tea', 'iced', '시원한 유자차요.']],
      autumn: [['vanilla_latte', 'hot', '따뜻한 바닐라 라테요.'], ['cocoa', 'hot', '코코아, 따뜻하게요.'], ['greentea_latte', 'hot', '따뜻한 녹차라테요.']],
      winter: [['yuja_tea', 'hot', '따뜻한 유자차 주세요.'], ['cocoa', 'hot', '따뜻한 코코아요.'], ['warm_milk', 'hot', '따뜻한 우유 한 잔이요.']],
    }[season];
    const [menu, temp, s] = pool[Math.floor(r() * pool.length)];
    return { who: 'customer', say: s, menu, temp: tempOf(menu, temp), togo, ask: ['togo'], reply: { togo: where } };
  }
  // 4) 애매한 주문: 메뉴판을 보고 알아들어야 함
  const vague = [
    { say: '달게 한 잔이요.', menu: 'vanilla_latte', temp: season === 'summer' ? 'iced' : 'hot', ticket: '달게 한 잔', ask: ['temp'], reply: { temp: season === 'summer' ? '시원하게요.' : '따뜻하게요.' } },
    { say: '제일 싼 거요.', menu: 'barley_tea', temp: season === 'summer' ? 'iced' : 'hot', ticket: '제일 싼 거', ask: ['temp'], reply: { temp: season === 'summer' ? '차갑게요.' : '따뜻하게요.' } },
    { say: '커피 말고, 따뜻한 거요.', menu: 'warm_milk', temp: 'hot', ticket: '커피 말고 따뜻한 것' },
    { say: '카페인 없는 라테 있어요?', menu: 'decaf_latte', temp: season === 'summer' ? 'iced' : 'hot', ticket: '카페인 없는 라테', ask: ['temp'], reply: { temp: season === 'summer' ? '아이스로요.' : '따뜻한 걸로요.' } },
  ][Math.floor(r() * 4)];
  return { who: 'customer', togo, ...vague, ask: [...(vague.ask || []), 'togo'], reply: { ...(vague.reply || {}), togo: where } };
}

/** 단골의 '늘 먹던 거'(해순 할머니는 두 잔). 지안은 그날의 색 */
function regularOrders(who, season) {
  const u = REGULARS[who].usual;
  if (who === 'jian') {
    const color = { spring: ['strawberry_milk', 'iced', '분홍색'], summer: ['greentea_latte', 'iced', '초록색'], autumn: ['yuja_tea', 'hot', '노란색'], winter: ['cocoa', 'hot', '갈색'] }[season];
    return [{ who, say: `오늘은 ${color[2]}이요.`, menu: color[0], temp: tempOf(color[0], color[1]), togo: false, thanks: '오늘 색이다. 고마워요.' }];
  }
  if (who === 'sumin') return [{ who, say: '…늘 먹던 거요.', menu: 'barley_tea', temp: season === 'summer' ? 'iced' : 'hot', togo: false, usual: true }];
  const one = { who, say: '늘 먹던 거요.', menu: u.menu, togo: Boolean(u.togo), usual: true };
  if (RECIPES[u.menu].temps.length > 1) one.temp = u.temp;
  if (who === 'haesun') return [one, { who, say: '한 잔 더, 똑같이.', menu: 'warm_milk', togo: false, more: true }];
  return [one];
}

/** 이야기 뒤의 근황: [앨범이 열렸을 때, 아직일 때] */
const NEWS = {
  haesun: ['해순 할머니는 요즘 방학마다 손녀와 함께 온다. 창가에는 늘 우유 세 잔이 놓인다.', '해순 할머니는 오늘도 창가에서 우유 두 잔을 앞에 두고, 천천히 바다를 본다.'],
  jian: ['지안의 그림이 벽에 하나 더 걸렸다. 이번에는 창밖의 바다 그림이다.', '지안은 오늘도 메뉴판의 색 동그라미를 하나씩 보며, 그날의 색을 고른다.'],
  do: ['도 씨는 이제 매일 카운터 옆 의자에 앉아, 동네 아이들에게 옛날 편지 이야기를 들려준다.', '퇴직한 도 씨가 산책길에 들러, 문 옆 못을 한 번 보고 웃는다.'],
  kang: ['강 씨는 요즘 새벽마다 젊은 어부들과 함께 와서, 바다 이야기를 한다.', '강 씨는 오늘도 새벽 블랙을 마시며 항구를 오래 본다.'],
  han: ['방학이 되면, 한 씨의 딸이 아빠의 마지막 버스를 타고 함께 온다.', '여섯 시 십 분, 한 씨의 버스가 오늘도 종점에 들어온다.'],
  eunju: ['은주 씨가 만든 엄마들 모임이, 일주일에 한 번 이 카페에서 열린다.', '은주 씨는 오늘 아기와 함께, 따뜻한 라테를 끝까지 마셨다.'],
  sumin: ['도시로 간 수민이 엽서를 보냈다. "거기는 바다가 없어서, 가끔 보리차를 마셔요."', '방학을 맞은 수민이 잠깐 들러, 구석 자리에서 창밖을 본다.'],
  noh: ['노 씨는 랜턴을 깨끗이 닦아서, 다시 사장님 자리 위에 걸어 두었다.', '노 씨는 오늘도 "지나가다" 들러서, 그 잔을 마시고 간다.'],
};

/** 직업 마1스톤 손님(손님으로만, CLAUDE.md 3장): 한두 마디 + 주문 */
const CAMEOS = [
  { who: 'yeonwoo', line: '쉬는 날이라 또 바다 보러 왔어요. 여기 오면 마음이 느긋해져요.', order: { say: '아이스 라테 하나요. 여기서 마실게요.', menu: 'latte', temp: 'iced', togo: false } },
  { who: 'dohyun', line: '여기 샷이 정확해서 또 왔어요. 천천히 해 주세요.', order: { say: '아메리카노요.', menu: 'americano', temp: 'iced', togo: false, ask: ['temp'], reply: { temp: '아이스요. 저는 늘 아아예요.' } } },
  { who: 'sora', line: '사진 찍으러 왔다가, 커피가 맛있어서 또 왔어요.', order: { say: '딸기우유 하나요. 사진 찍고 마실게요.', menu: 'strawberry_milk', temp: 'iced', togo: false } },
  { who: 'minjae', line: '공부하다가 머리 좀 식히러 왔어요.', order: { say: '아아 하나요. 가져갈게요.', menu: 'americano', temp: 'iced', togo: true } },
  { who: 'manager', line: '다른 카페를 둘러보는 것도 공부예요. 손이 참 정확하네요.', order: { say: '핸드드립 한 잔 부탁해요.', menu: 'hand_drip', togo: false } },
  { who: 'teacher', line: '학생들이랑 바다 보러 왔어요. 여기 분위기가 참 좋네요.', order: { say: '따뜻한 라테 하나요.', menu: 'latte', temp: 'hot', togo: false } },
  { who: 'jiho', line: '바다 보고 왔더니 목말라요!', order: { say: '아아요! 가져갈게요.', menu: 'americano', temp: 'iced', togo: true } },
  { who: 'grandma', line: '우리 동네에도 이런 카페가 있으면 좋겠네.', order: { say: '따뜻한 우유 한 잔 줘요.', menu: 'warm_milk', togo: false } },
  { who: 'daeri', line: '출장 왔다가 들렀어요. 회의 전에 한 잔 해야죠.', order: { say: '아이스 아메리카노요. 가져갈게요.', menu: 'americano', temp: 'iced', togo: true } },
];

const CHALLENGES = [
  ['speech', '주문을 받으면, 메뉴와 온도를 한 번 되풀이해서 확인해요.'],
  ['question', '매장에서 마실지, 가져갈지 꼭 물어봐요.'],
  ['hourglass', '서두르지 말고, 한 잔씩 순서대로 만들어요.'],
  ['book', '단골이 "늘 먹던 거"라고 하면, 수첩의 단골 쪽을 떠올려요.'],
  ['ice', '손님이 따뜻한지 아이스인지 말하지 않으면, 먼저 물어봐요.'],
];

/**
 * n번째 자유 영업 날(1부터). opts.album: 열린 앨범 액자 { 단골 id: 해 } (근황이 달라짐)
 * opts.regs · opts.seasons: 엔딩 전에 일찍 연 자유 영업(재미 개편 Q-47, 봄 7일 뒤)은 만난 단골 · 마친 계절만(뒤 이야기를 미리 보이지 않게)
 * 돌려줌: 에피소드와 같은 꼴 { id: 'free', label, title, script, … }
 */
export function freeDay(n = 1, { album = {}, regs: metRegs = null, seasons = null } = {}) {
  const day = Math.max(1, Math.floor(n));
  const r = rng(day * 9973 + 17);
  const pool = seasons && seasons.length ? seasons : SEASONS;
  const idx = (day - 1) % (pool.length * 7);
  const season = pool[Math.floor(idx / 7)];
  const sName = SEASON_NAME[season];
  const regs = metRegs && metRegs.filter((id) => REGULARS[id]).length >= 2 ? metRegs.filter((id) => REGULARS[id]) : Object.keys(REGULARS);
  // 오늘 오는 단골 둘(날마다 돌아가며)
  const r1 = regs[day % regs.length];
  const r2 = regs[(day * 3 + 1) % regs.length] === r1 ? regs[(day + 4) % regs.length] : regs[(day * 3 + 1) % regs.length];
  const cameo = r() < 0.6 ? CAMEOS[Math.floor(r() * CAMEOS.length)] : null;
  const challenge = CHALLENGES[(day - 1) % CHALLENGES.length];
  const guests = 4 + Math.floor(r() * 3); // 4~6명 + 단골 둘 (+ 마1스톤 손님)
  const am = [...regularOrders(r1, season), guestOrder(season, r), guestOrder(season, r), guestOrder(season, r)];
  const pm = [...Array.from({ length: guests - 3 }, () => guestOrder(season, r)), ...regularOrders(r2, season)];
  const news = (who) => narr(NEWS[who][album[who] ? 0 : 1]);

  return {
    id: 'free',
    season, // 손맛 단계(frame.js TIMING)도 그 날의 계절
    label: '자유 영업',
    title: `${day}번째 날`,
    when: `${sName} · 하루`,
    goal: '손님마다 주문을 정확히 듣고, 한 잔씩 만들어요.',
    schedule: [],
    skills: [],
    standards: ['[12진로03-01]', '[12진로04-05]'],
    costume: { customer: COSTUMES[day % COSTUMES.length] },
    diary: `${sName}의 자유 영업 ${day}번째 날. 오늘도 손님마다 주문을 확인하고, 한 잔씩 천천히 만들었다.`,
    free: day,
    script: [
      big('자유 영업', `${day}번째 날 · ${sName}`),
      bg('hall', season),
      amb('cafe'),
      bgm('morning'),
      place(`${sName} 아침`, '바닷가 마을 카페'),
      show({ left: 'jieun:normal', right: 'owner:smile' }),
      narr(`오늘도 가게 문을 연다. ${sName} 아침의 바닷가 마을은 조용하다.`),
      say('owner', 'smile', '오늘도 평소대로 해. 손님은 평소대로 오니까.'),
      memo('오늘의 도전', [challenge]),
      news(r1),
      mini('brew', { id: `free_${day}_am`, title: '오전 손님', level: 'normal', quit: true, book: FULL_BOOK, orders: am }),
      ...(cameo ? [
        show({ left: 'jieun:normal', right: `${cameo.who}:smile` }),
        sfx('bell'),
        say(cameo.who, 'smile', cameo.line),
        mini('brew', { id: `free_${day}_cameo`, title: '바다를 보러 온 손님', level: 'normal', quit: true, book: FULL_BOOK, orders: [{ who: cameo.who, ...cameo.order }] }),
        leave(cameo.who),
      ] : []),
      place(`${sName} 오후`, '바닷가 마을 카페'),
      bgm('cafe'),
      news(r2),
      mini('brew', { id: `free_${day}_pm`, title: '오후 손님', level: 'normal', quit: true, book: FULL_BOOK, orders: pm }),
      bg('hall', 'evening'),
      bgm('warm'),
      place(`${sName} 저녁`, '마감'),
      show({ center: 'jieun:smile' }),
      narr('손님이 모두 갔다. 컵을 닦고, 내일 쓸 우유를 냉장고에 채운다.'),
      think('오늘도 한 잔씩, 천천히. 내일도 평소대로 문을 열자.'),
      end(),
    ],
  };
}
