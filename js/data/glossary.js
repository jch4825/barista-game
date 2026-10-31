/**
 * 말 사전
 * 대사 속 {{낱말}} 또는 {{표시|id}} 로 연결합니다.
 * 새 게임의 낱말은 아직 없습니다. 넣을 때는 { id, word, icon, easy, ex, item } 을 더합니다.
 * easy: 1~2문장 쉬운 설명 / ex: 일터에서 쓰는 예문 / icon: 그림 / item: 물건 낱말이면 소품 그림(assets/items, 카드에 크게)
 */

export const GLOSSARY = [];

const byWord = new Map(GLOSSARY.map((g) => [g.word, g]));
const byId = new Map(GLOSSARY.map((g) => [g.id, g]));

export function findTerm(key) {
  if (!key) return null;
  return byId.get(key) || byWord.get(key) || null;
}
