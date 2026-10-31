/**
 * M1 시험판 · 가을: 세 번째 기회(힌트는 행동 둘). 해순 할머니의 한 잔 남은 우유 · 지안의 노란 잎
 */

import { bg, big, place, show, respond, end } from '../../core/dsl.js';

export default {
  id: 'm1_autumn',
  act: 1,
  label: '시험 · 가을',
  title: '한 잔 남은 우유',
  when: '가을 · 아침',
  goal: '말 대신 행동으로 보이는 마음을 알아채요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]'],
  diary: '가을이다. 우유가 한 잔뿐인 날, 할머니는 서두르지 않았다. 지안은 창밖의 노란 잎을 봤다.',
  script: [
    big('가을 · 손', '시험판'),
    bg('hall', 'autumn'),
    place('가을 아침 09:30', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    respond('haesun', 'autumn_one_milk'),
    show({ left: 'jieun:normal', right: 'jian:normal' }),
    respond('jian', 'autumn_leaves'),
    end(),
  ],
};
