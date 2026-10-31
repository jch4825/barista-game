/**
 * M1 시험판 · 여름: 관광객 주문(작업대: 라테·아메리카노) → 해순 할머니의 의자 → 지안의 첫 두 기회(힌트 강함 → 돌려 말함)
 */

import { bg, big, place, show, leave, say, narr, mini, respond, cg, end } from '../../core/dsl.js';

export default {
  id: 'm1_summer',
  act: 1,
  label: '시험 · 여름',
  title: '그 의자의 손님',
  when: '여름 · 오후',
  goal: '붐비는 여름, 단골의 마음을 살펴요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  costume: { customer: 'sporty' }, // 관광객(여성 목소리)
  diary: '여름에는 줄이 길었다. 할머니 의자에 손님이 앉았다. 지안이라는 손님은 늘 아무거나 달라고 한다.',
  script: [
    big('여름 · 줄', '시험판'),
    bg('hall', 'busy_summer'),
    place('여름 오후 14:00', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'customer:normal' }),
    cg('summer_line'),
    narr('휴가철이라 관광객이 많다.'),
    cg(null),
    say('customer', 'smile', '라테 한 잔이랑 아메리카노 한 잔 주세요.'),
    mini('brew', {
      id: 'm1_summer_brew', title: '관광객 주문', level: 'normal',
      orders: [
        { who: 'customer', say: '라테 한 잔이요.', menu: 'latte', temp: 'iced', togo: true, ask: ['temp', 'togo'] },
        { who: 'customer', say: '아이스 아메리카노도 한 잔이요.', menu: 'americano', temp: 'iced', togo: true },
      ],
    }),
    leave('customer'),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    respond('haesun', 'summer_tourist'),
    show({ left: 'jieun:normal', right: 'jian:normal' }),
    respond('jian', 'summer_anything'),
    bg('hall', 'summer'),
    narr('며칠 뒤.'),
    respond('jian', 'summer_cool'),
    end(),
  ],
};
