/**
 * M1 시험판 · 봄: 해순 할머니의 우유 두 잔(첫 대응 기회, 힌트 강함) + 작업대(따뜻한 우유)
 * 진짜 이야기(봄 · 첫 컵, PRD.md 5.5)를 쓰면 이 시험판 에피소드는 지웁니다.
 */

import { bg, big, place, show, meet, say, think, narr, sfx, mini, respond, cg, end } from '../../core/dsl.js';

export default {
  id: 'm1_spring',
  act: 1,
  label: '시험 · 봄',
  title: '우유 두 잔',
  when: '봄 · 아침',
  goal: '해순 할머니에게 따뜻한 우유 두 잔을 내요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  diary: '오늘 처음으로 우유를 데웠다. 할머니는 두 잔을 시켰다. 한 잔은 빈 의자 앞에 놓였다.',
  script: [
    big('봄 · 첫 컵', '시험판'),
    bg('hall', 'spring'),
    place('봄 아침 08:50', '바닷가 마을 카페'),
    show({ left: 'jieun:nervous', right: 'owner:normal' }),
    meet('jieun'),
    cg('spring_first_cup'),
    say('owner', 'normal', '오늘부터 같이 일하죠.'),
    say('owner', 'normal', '서두르지 않아도 돼요.'),
    cg(null),
    meet('owner'),
    think('천천히, 정확하게 하자.'),
    sfx('bell'),
    narr('문 위의 종이 울렸다.'),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    say('haesun', 'normal', '따뜻한 우유 두 잔 줘요.'),
    mini('brew', {
      id: 'm1_spring_brew', title: '따뜻한 우유 두 잔', level: 'normal',
      orders: [
        { who: 'haesun', say: '따뜻한 우유 한 잔이요.', menu: 'warm_milk' },
        { who: 'haesun', say: '한 잔 더요.', menu: 'warm_milk' },
      ],
    }),
    respond('haesun', 'spring_cup2'),
    bg('hall', 'evening'),
    cg('owner_closing_milk'),
    narr('마감 뒤, 사장님이 혼자 따뜻한 우유를 마신다.'),
    end(),
  ],
};
