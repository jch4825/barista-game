/**
 * 가을 2일 · 양복: 새벽, 양복을 입고 온 강 씨(대응 K4) → 6시 10분 한 씨, 딸 사진과 펜(대응 Han3) → 낮의 손님들(가을에도 아아)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, mini, respond, motion, end } from '../../core/dsl.js';

const AUTUMN_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa'];

export default {
  id: 'autumn_2',
  act: 3, season: 'autumn', day: 2,
  label: '가을 2일',
  title: '양복',
  when: '가을 · 새벽',
  goal: '평소와 다른 모습에도, 평소처럼 대해요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  costume: { customer: 'coffee' },
  diary: '강 씨가 양복을 입고 왔다. 한 씨는 딸 사진을 보다가 펜을 꺼냈다. 사람마다 말하지 않는 사정이 있다.',
  script: [
    big('가을 · 2일', '양복'),
    bg('hall', 'autumn'),
    amb('cafe'),
    bgm('morning'),
    place('가을 새벽 06:00', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    sfx('bell'),
    respond('kang', 'autumn_suit'),
    mini('brew', {
      id: 'autumn_2_kang', title: '늘 그 잔', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'kang', say: '블랙.', menu: 'hand_drip', togo: false, thanks: '…좋네.' }],
    }),
    narr('강 씨가 블랙을 다 마시고, 넥타이를 고쳐 맨다. 그리고 버스 정류장 쪽으로 간다.'),
    leave('kang'),

    // 6시 10분: 한 씨
    sfx('bus'),
    show({ left: 'jieun:normal', right: 'han:normal' }),
    narr('여섯 시 십 분. 오늘도 컵을 미리 만들기 시작한다.'),
    mini('brew', {
      id: 'autumn_2_han', title: '한 씨의 늘 먹던 거', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'han', say: '늘 먹던 거요.', menu: 'vanilla_latte', temp: 'hot', togo: true, usual: true, thanks: '고마워요. 딱 이거야.' }],
    }),
    respond('han', 'autumn_note'),
    leave('han'),

    // 낮: 가을에도 아아
    place('가을 낮 12:30', '점심시간'),
    bgm('cafe'),
    show({ left: 'jieun:normal', right: 'customer:normal' }),
    sfx('bell'),
    narr('점심시간. 회사원 손님이 들어온다.'),
    say('customer', 'normal', '아아 하나랑, 따뜻한 라테 하나요.'),
    mini('brew', {
      id: 'autumn_2_lunch', title: '점심시간 손님', level: 'normal', book: AUTUMN_BOOK,
      orders: [
        { who: 'customer', say: '아아 하나요. 가져갈게요.', menu: 'americano', temp: 'iced', togo: true, thanks: '가을에도 이게 최고예요.' },
        { who: 'customer', say: '따뜻한 라테도 하나요.', menu: 'latte', temp: 'hot', togo: true, ask: ['togo'], reply: { togo: '이것도 가져가요.' }, thanks: '고마워요.' },
      ],
    }),
    leave('customer'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('jieun', 'normal', '사장님, 가을인데도 아이스를 많이 찾으시네요.'),
    say('owner', 'smile', '겨울에도 찾아요. 아아는 계절이 없어요.'),
    say('jieun', 'normal', '강 씨가 오늘 양복을 입고 오셨어요.'),
    say('owner', 'normal', '…사람마다 사정이 있어요.'),
    think('사장님은 알고 계신 것 같다. 그래도 말하지 않으신다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
