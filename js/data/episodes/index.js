/**
 * 에피소드 목록 + 엔딩 (docs/story.md 4장)
 * 한 해 = 계절 4막 × 7일(고요한 날 6 + 폭발 사건 1, Q-12 ✅). 에피소드 하나가 하루입니다(결과 화면 = 하루 끝).
 * 엔딩은 EPISODES 에 넣지 않고, 마지막 막의 마지막 날(FINALE)을 처음 마치면 main.js 가 엔딩으로 보냅니다.
 */

import spring1 from './spring_1.js';
import spring2 from './spring_2.js';
import spring3 from './spring_3.js';
import spring4 from './spring_4.js';
import spring5 from './spring_5.js';
import spring6 from './spring_6.js';
import spring7 from './spring_7.js';
import summer1 from './summer_1.js';
import summer2 from './summer_2.js';
import summer3 from './summer_3.js';
import summer4 from './summer_4.js';
import summer5 from './summer_5.js';
import summer6 from './summer_6.js';
import summer7 from './summer_7.js';
import autumn1 from './autumn_1.js';
import autumn2 from './autumn_2.js';
import autumn3 from './autumn_3.js';
import autumn4 from './autumn_4.js';
import autumn5 from './autumn_5.js';
import autumn6 from './autumn_6.js';
import autumn7 from './autumn_7.js';
import ending from './ending.js';
import { registerOops } from '../../core/oops.js';
import { MINIGAME_OOPS } from '../../game/minigames/index.js';

/** 이야기 순서(결과 화면이 있는 에피소드). 엔딩은 여기에 넣지 않습니다 */
export const EPISODES = [
  spring1, spring2, spring3, spring4, spring5, spring6, spring7,
  summer1, summer2, summer3, summer4, summer5, summer6, summer7,
  autumn1, autumn2, autumn3, autumn4, autumn5, autumn6, autumn7,
];

/** 계절(막): 달력의 한 줄. sub 는 달력에 보이는 한 줄 소개 */
export const ACTS = [
  { n: 1, season: 'spring', title: '봄 · 첫 컵', sub: '바닷가 마을 카페에 온 지은. 해순 할머니 · 도 씨 · 강 씨를 만나요.', ids: ['spring_1', 'spring_2', 'spring_3', 'spring_4', 'spring_5', 'spring_6', 'spring_7'] },
  { n: 2, season: 'summer', title: '여름 · 줄', sub: '사진 한 장으로 카페가 붐벼요. 지안 · 한 씨 · 은주 · 수민 · 노 씨를 만나요.', ids: ['summer_1', 'summer_2', 'summer_3', 'summer_4', 'summer_5', 'summer_6', 'summer_7'] },
  { n: 3, season: 'autumn', title: '가을 · 손', sub: '사장님의 손이 떨려요. 열쇠를 받고 혼자 가게를 열어요.', ids: ['autumn_1', 'autumn_2', 'autumn_3', 'autumn_4', 'autumn_5', 'autumn_6', 'autumn_7'] },
];

/**
 * 엔딩: 마지막 막의 마지막 에피소드(FINALE)를 처음 마치면 결과 화면 뒤에 나옵니다(main.js).
 * 엔딩을 본 학생은 모든 이야기가 늘 열립니다(hub.js).
 */
export const ENDING = ending;
export const FINALE = ACTS[ACTS.length - 1].ids[ACTS[ACTS.length - 1].ids.length - 1];

/**
 * 판단 카드의 정답 자리를 고르게: 이야기 순서대로, 카드 수가 같은 판단끼리 정답(첫 good) 자리를 0 → 1 → 2 … 로 돌려 가며 둠.
 * 나머지 카드는 원래 순서 그대로. decide.order(화면 자리 → 원래 카드 번호)를 cards.js 가 씀. 대본 파일의 순서는 바꾸지 않음
 */
{
  const turn = {};
  for (const ep of EPISODES) for (const b of ep.script) {
    if (b.t !== 'decide') continue;
    const n = b.choices.length;
    const good = b.choices.findIndex((c) => c.ok);
    const slot = (turn[n] = (turn[n] ?? -1) + 1) % n;
    const rest = b.choices.map((_, i) => i).filter((i) => i !== good);
    b.order = good < 0 ? null : [...rest.slice(0, slot), good, ...rest.slice(slot)];
  }
}

const byId = new Map([...EPISODES, ENDING].map((e) => [e.id, e]));

/** 에피소드(또는 엔딩) 찾기: 근무표·세이브 슬롯·이어하기·nav.go('play', id) 가 씀 */
export function getEpisode(id) { return byId.get(id) || null; }

export function nextEpisode(id) {
  const i = EPISODES.findIndex((e) => e.id === id);
  return i >= 0 && i < EPISODES.length - 1 ? EPISODES[i + 1] : null;
}

/** 에피소드 안의 모든 '아차!' 결과 모으기 */
export function collectOops(ep) {
  const out = [];
  const walk = (list) => {
    for (const b of list || []) {
      if (b.t === 'decide') {
        for (const c of b.choices) if (!c.ok && c.oops) out.push({ ...c.oops, ep: ep.id });
        if (b.timer?.oops) out.push({ ...b.timer.oops, ep: ep.id }); // 시간이 다 됐을 때(따로 쓴 결과)
      } else if (b.t === 'mini' && b.oops) {
        out.push({ ...b.oops, ep: ep.id });
        if (b.timer?.oops) out.push({ ...b.timer.oops, ep: ep.id });
      }
      if (b.t === 'branch') for (const l of Object.values(b.cases || {})) walk(l);
    }
  };
  walk(ep.script);
  return out;
}

export const ALL_OOPS = [...EPISODES.flatMap(collectOops), ...MINIGAME_OOPS];
registerOops(ALL_OOPS);
