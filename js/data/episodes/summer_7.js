/**
 * 여름 7일 · 동네 시간(여름의 끝 장면, PRD 5.5): 첫 '동네 시간'의 새벽 → 6시 10분 한 씨의 컵(대응 Han2)
 * → 며칠 만에 온 강 씨(대응 K3) → 도 씨 · 노 씨 · 해순 할머니까지 단골 다섯이 한 방에 → 조용하다
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, chalk, mini, respond, branch, onlyIf, motion, face, end } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_7',
  act: 2, season: 'summer', day: 7,
  label: '여름 7일',
  title: '동네 시간',
  when: '여름 · 새벽',
  goal: '단골이 오는 시간과 평소 주문을 기억해요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-02]', '[12진로05-04]'],
  diary: '동네 시간의 첫 아침. 단골 다섯 명이 한 방에 있었다. 아무도 크게 말하지 않았다. 조용해서 좋았다.',
  script: [
    big('여름 · 7일', '동네 시간'),
    bg('cafe_front', 'morning'),
    amb('street'),
    bgm('morning'),
    place('여름 새벽 05:50', '카페 앞'),
    show({ center: 'jieun:normal' }),
    narr('골목이 조용하다. 줄이 없다.'),
    narr('문에 사장님의 글씨가 붙어 있다. "7시 전은 동네 시간"'),
    think('오늘부터다.'),
    bg('hall', 'morning'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '오늘은 지은 씨가 열어 봐요. 순서대로.'),
    mini('routine', { id: 'summer_7_open', kind: 'open', title: '동네 시간의 가게 열기' }),

    // 6시 10분: 한 씨
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    respond('han', 'summer_clock'),
    ...onlyIf({ pick: 'han.summer_clock=when_comes|go_out' },
      mini('brew', {
        id: 'summer_7_han', title: '달게 한 잔', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'han', say: '달게 한 잔이요. 가져갈게요.', menu: 'vanilla_latte', temp: 'hot', togo: true, ticket: '달게 한 잔', thanks: '고마워요. 오늘도 살았네.' }],
      }),
    ),
    say('han', 'smile', '동네 시간이라. 좋네요. 버스에서 봤어요.'),
    leave('han'),

    // 며칠 만에 온 강 씨
    respond('kang', 'summer_return'),
    leave('kang'),

    // 도 씨 · 노 씨 · 해순 할머니
    show({ left: 'jieun:normal', center: 'do:smile', right: 'noh:normal' }),
    sfx('bell'),
    say('do', 'smile', '동네 시간이라면서요? 허허. 늘 먹던 거요.'),
    say('noh', 'normal', '나는 그 잔.'),
    mini('brew', {
      id: 'summer_7_do', title: '동네 시간의 첫 주문', level: 'normal', book: SUMMER_BOOK,
      orders: [{ who: 'do', say: '늘 먹던 거요.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '이 시간에 앉아 마시니 좋네.' }],
    }),
    narr('노 씨의 믹스커피는 사장님이 탄다. 숟가락이 천천히 돈다.'),
    sfx('bell'),
    enter('left', 'haesun:smile'),
    show({ left: 'haesun:smile', center: 'do:smile', right: 'noh:normal' }),
    say('haesun', 'smile', '지은 씨, 늘 먹던 거요.'),
    mini('brew', {
      id: 'summer_7_haesun', title: '해순 할머니의 늘 먹던 거', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false },
      ],
    }),

    // 끝 장면: 조용한 방
    cg('summer_village_time'),
    narr('창가에 해순 할머니. 카운터 옆에 도 씨. 구석에 노 씨.'),
    narr('조금 전까지 강 씨와 한 씨도 있었다.'),
    narr('아무도 크게 말하지 않는다. 컵 내려놓는 소리, 파도 소리.'),
    branch('summer_line', {
      queue: [say('haesun', 'smile', '어제는 못 들어왔는데. 오늘은 앉을 자리가 있네.')],
      regulars: [say('haesun', 'smile', '어제 뒷문에서 마신 우유도 따뜻했어요.')],
    }),
    narr('사장님이 오랜만에 의자에 앉는다. 창밖을 본다.'),
    face('jieun', 'smile'),
    think('조용하다. 이 조용함이 좋다.'),
    cg(null),
    say('owner', 'normal', '여름이 다 갔네요.'),
    motion('owner', 'nod'),
    end(),
  ],
};
