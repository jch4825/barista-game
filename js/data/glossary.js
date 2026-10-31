/**
 * 말 사전
 * 대사 속 {{낱말}} 또는 {{표시|id}} 로 연결합니다.
 * 낱말은 { id, word, icon, easy, ex, item } 으로 더합니다(2026-10-31 풀 버전: 카페 일에서 쓰는 말).
 * easy: 1~2문장 쉬운 설명 / ex: 일터에서 쓰는 예문 / icon: 그림 / item: 물건 낱말이면 소품 그림(assets/items, 카드에 크게)
 */

export const GLOSSARY = [
  { id: 'aa', word: '아아', icon: 'icecup', easy: '아이스 아메리카노를 줄여 부르는 말이에요. 한국 손님이 가장 많이 시켜요.', ex: '"아아 하나요." = 아이스 아메리카노 한 잔' },
  { id: 'here', word: '매장', icon: 'chair', easy: '가게 안에서 먹고 마시는 것이에요. 머그컵이나 유리컵에 담아요.', ex: '"드시고 가세요?" "네, 매장에서 마실게요."' },
  { id: 'togo', word: '포장', icon: 'bag', easy: '음료를 가게 밖으로 가져가는 것이에요. 종이컵이나 플라스틱 컵에 담아요.', ex: '"가져갈게요." = 포장' },
  { id: 'regular', word: '단골', icon: 'heart', easy: '자주 오는 손님이에요. 늘 먹는 것이 있어요.', ex: '"늘 먹던 거요." 하면 단골 수첩을 봐요.' },
  { id: 'handdrip', word: '핸드드립', icon: 'coffee', easy: '원두 가루에 뜨거운 물을 손으로 천천히 부어 내리는 커피예요. 전기가 없어도 만들 수 있어요.', ex: '"새벽 블랙은 손으로 내려요."' },
  { id: 'bloom', word: '뜸', icon: 'hourglass', easy: '물을 조금 붓고 기다리는 것이에요. 가루가 빵처럼 부풀었다가 가라앉아요.', ex: '"뜸을 들이고, 천천히 부어요."' },
  { id: 'decaf', word: '디카페인', icon: 'coffee', easy: '잠을 깨우는 성분(카페인)을 뺀 커피예요.', ex: '"아기 때문에 디카페인으로 마셔요."' },
  { id: 'closing', word: '마감', icon: 'light_off', easy: '하루 일을 끝내고 가게를 닫는 것이에요.', ex: '"마감 뒤에 컵을 닦아요."' },
  { id: 'blackout', word: '정전', icon: 'light_off', easy: '전기가 끊겨서 불이 들어오지 않는 것이에요.', ex: '"눈이 많이 와서 정전이 됐어요."' },
  { id: 'retire', word: '퇴직', icon: 'bag', easy: '오래 다니던 일을 그만두는 것이에요.', ex: '"도 씨는 겨울에 퇴직해요."' },
  { id: 'exam', word: '수능', icon: 'pen', easy: '대학교에 가려고 보는 큰 시험이에요. 늦가을에 봐요.', ex: '"내일이 수능이에요."' },
];

const byWord = new Map(GLOSSARY.map((g) => [g.word, g]));
const byId = new Map(GLOSSARY.map((g) => [g.id, g]));

export function findTerm(key) {
  if (!key) return null;
  return byId.get(key) || byWord.get(key) || null;
}
