/**
 * 에피소드 목록 + 엔딩
 * 지금은 M1 시험판(사계절 네 편: 해순 할머니·지안의 대응 기회 10개 + 작업대)과 엔딩 자리 표시만 있습니다.
 * 새 게임의 사계절 이야기(PRD.md 5장)를 쓰면 시험판을 빼고 여기에 넣습니다.
 */

import m1Spring from './m1_spring.js';
import m1Summer from './m1_summer.js';
import m1Autumn from './m1_autumn.js';
import m1Winter from './m1_winter.js';
import ending from './ending.js';
import { registerOops } from '../../core/oops.js';
import { MINIGAME_OOPS } from '../../game/minigames/index.js';

/** 이야기 순서(결과 화면이 있는 에피소드). 엔딩은 여기에 넣지 않습니다 */
export const EPISODES = [m1Spring, m1Summer, m1Autumn, m1Winter];

export const ACTS = [
  { n: 1, title: 'M1 시험판', sub: '해순 할머니와 지안, 그리고 작업대', ids: ['m1_spring', 'm1_summer', 'm1_autumn', 'm1_winter'] },
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
