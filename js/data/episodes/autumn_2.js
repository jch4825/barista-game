/**
 * 가을 2일 · 양복: 새벽, 양복을 입고 온 강 씨(대응 K4) → 6시 10분 한 씨, 딸 사진과 펜(대응 Han3) → 낮의 손님들(가을에도 아아)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, mini, respond, motion, end, info } from '../../core/dsl.js';

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
    info('오늘의 칠판', '바람이 쌀쌀해요. 그래도 아이스 아메리카노는 잘 나가요.', 'menu'), // 재미 개편 Q-43: 오늘 하나 달라지는 것(미리 알고 시작)
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    sfx('bell'),
    respond('kang', 'autumn_suit'),
    mini('brew', {
      id: 'autumn_2_kang', title: '늘 그 잔', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'kang', say: '블랙.', menu: 'hand_drip', togo: false, thanks: '…좋네.' }],
    }),
    narr('강 씨는 블랙을 다 마시고 넥타이를 고쳐 맨다. 그리고 항구가 아니라, 버스 정류장 쪽으로 걸어간다.'),
    think('어디에 가시는 걸까. 늘 항구로 가시던 분인데.'),
    leave('kang'),

    // 6시 10분: 한 씨
    sfx('bus'),
    show({ left: 'jieun:normal', right: 'han:normal' }),
    narr('여섯 시 십 분, 종점에 밤 버스가 들어온다. 나는 한 씨의 달게 한 잔을 미리 만들기 시작한다.'),
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
    // 금 씨의 아아(웃음 줄기 2/3: 가을 — 손이 빨개져도)
    show({ left: 'jieun:normal', right: 'geum:normal' }),
    say('geum', 'normal', '아아… 하나요.'),
    narr('찬 바람이 부는데, 금 씨는 오늘도 아이스 아메리카노다. 컵을 쥘 손이 벌써 빨갛다.'),
    mini('brew', {
      id: 'autumn_2_geum', title: '가을에도 아아', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'geum', say: '아아… 하나요.', menu: 'americano', temp: 'iced', togo: true, thanks: '으, 손 시려. 그래도 이거죠.' }],
    }),
    leave('geum'),
    show({ left: 'jieun:normal', right: 'customer:normal' }),
    narr('점심시간, 근처 회사에 다니는 손님이 들어온다. 바람이 쌀쌀한데도 겉옷 소매를 걷고 있다.'),
    say('customer', 'normal', '아아 하나랑 따뜻한 라테 하나요. 하나는 팀장님 거예요.'),
    mini('brew', {
      id: 'autumn_2_lunch', title: '점심시간 손님', level: 'normal', book: AUTUMN_BOOK,
      orders: [
        { who: 'customer', say: '아아 하나요. 가져갈게요.', menu: 'americano', temp: 'iced', togo: true, thanks: '가을에도 이게 최고예요.' },
        { who: 'customer', say: '따뜻한 라테도 하나요.', menu: 'latte', temp: 'hot', togo: true, ask: ['togo'], reply: { togo: '이것도 가져가요.' }, thanks: '고마워요.' },
      ],
    }),
    leave('customer'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('jieun', 'normal', '사장님, 날이 쌀쌀한데도 아이스를 많이 찾으시네요.'),
    say('owner', 'smile', '겨울에도 찾아요. 이 동네 사람들한테 아아는 계절이 없어요.'),
    say('jieun', 'normal', '그런데 사장님, 강 씨가 오늘 양복을 입고 오셨어요. 항구 말고 버스 쪽으로 가셨고요.'),
    say('owner', 'normal', '…사람마다 말하지 않는 사정이 있어요. 강 씨가 말할 때까지는, 늘 그 잔이면 돼요.'),
    think('사장님은 무언가 알고 계신 것 같다. 그래도 끝까지 말하지 않으신다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
