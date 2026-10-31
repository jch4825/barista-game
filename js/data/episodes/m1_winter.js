/**
 * M1 시험판 · 겨울: 네 번째·다섯 번째 기회(힌트는 시선뿐). 정전 밤의 담요·촛불 → 눈 오는 날 · 손녀가 온 날
 */

import { bg, big, place, show, narr, respond, cg, end } from '../../core/dsl.js';

export default {
  id: 'm1_winter',
  act: 1,
  label: '시험 · 겨울',
  title: '정전 밤',
  when: '겨울 · 밤',
  goal: '시선만 보고 그 사람에게 맞게 도와요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]'],
  diary: '정전 밤, 카페에만 불이 켜져 있었다. 할머니는 의자에도 담요를 덮었다. 지안은 다시 그림을 그린다.',
  script: [
    big('겨울 · 불', '시험판'),
    bg('hall', 'blackout'), // 그림 자체가 정전 밤(촛불·랜턴)이라 fx('dark')로 더 어둡게 하지 않음
    place('겨울 밤 19:00', '정전된 마을'),
    cg('blackout_cafe_lit'),
    narr('눈이 많이 와서 마을의 불이 모두 꺼졌다.'),
    narr('불이 켜진 곳은 우리 카페뿐이다. 촛불을 켰다.'),
    cg(null),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    respond('haesun', 'winter_blackout'),
    show({ left: 'jieun:normal', right: 'jian:normal' }),
    respond('jian', 'winter_candle'),
    bg('hall', 'winter'),
    narr('며칠 뒤, 다시 눈이 온다.'),
    respond('jian', 'winter_snow'),
    show({ left: 'jieun:normal', center: 'haesun:smile', right: 'granddaughter:smile' }),
    respond('haesun', 'winter_granddaughter'),
    end(),
  ],
};
