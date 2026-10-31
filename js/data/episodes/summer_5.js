/**
 * 여름 5일 · 가방 걸이: 소포가 많은 계절, 터질 듯한 도 씨의 가방(대응 D3: 다음 날 문 옆에 가방 걸이 못)
 * → 두꺼운 컵의 은주, "요즘은 아기랑만 이야기해요"(대응 E2)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, mini, respond, onlyIf, motion, end } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_5',
  act: 2, season: 'summer', day: 5,
  label: '여름 5일',
  title: '가방 걸이',
  when: '여름 · 오전',
  goal: '손님이 무엇을 불편해하는지 눈으로 살펴요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로05-04]'],
  diary: '도 씨의 가방은 여름에 더 무겁다. 은주 씨는 요즘 아기하고만 이야기한다고 했다.',
  script: [
    big('여름 · 5일', '가방 걸이'),
    bg('hall', 'summer'),
    amb('cafe'),
    bgm('cafe'),
    place('여름 오전 09:00', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'do:smile' }),
    sfx('bell'),
    say('do', 'smile', '우편이요! 아이고, 덥다.'),
    say('do', 'smile', '늘 먹던 거 줘요.'),
    mini('brew', {
      id: 'summer_5_do', title: '도 씨의 늘 먹던 거', level: 'normal', book: SUMMER_BOOK,
      orders: [{ who: 'do', say: '늘 먹던 거요.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '캬, 살겠다.' }],
    }),
    respond('do', 'summer_hook'),
    ...onlyIf({ pick: 'do.summer_hook=hook' },
      say('owner', 'normal', '못 박는 소리 나더니, 그거였군요.'),
      narr('사장님이 문 옆의 못을 한 번 보고, 작게 웃는다.'),
    ),
    leave('do'),

    // 오후: 은주
    place('여름 오후 13:40', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'eunju:normal' }),
    sfx('bell'),
    narr('은주 씨가 유모차를 밀고 들어온다. 오늘은 아기가 잠들어 있다.'),
    say('eunju', 'smile', '지은 씨, 늘 먹던 거요. 그 두꺼운 컵에요.'),
    mini('brew', {
      id: 'summer_5_eunju', title: '은주 씨의 늘 먹던 거', level: 'normal', book: SUMMER_BOOK,
      orders: [{ who: 'eunju', say: '늘 먹던 거요. 두꺼운 컵에요.', menu: 'decaf_latte', temp: 'hot', togo: false, usual: true, cup: 'thick', thanks: '아, 이 컵. 고마워요.' }],
    }),
    respond('eunju', 'summer_talk'),
    leave('eunju'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '은주 씨, 처음보다 오래 앉아 있다 가네요.'),
    think('누군가에게는 이 카페가 하루에 한 번 사람과 이야기하는 곳이다.'),
    narr('창밖의 골목에 오늘도 관광객이 많다. 내일은 주말이다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
