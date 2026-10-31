/**
 * 여름 2일 · 10분: 새벽 6시 10분, 밤 버스 기사 한 씨(대응 Han1, "달게 한 잔" = 말로 설명하는 주문)
 * → 오전, 해순 할머니의 늘 먹던 거 → 관광객이 빈 의자에 앉음(대응 H2)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, mini, respond, motion, end } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_2',
  act: 2, season: 'summer', day: 2,
  label: '여름 2일',
  title: '10분',
  when: '여름 · 새벽',
  goal: '시간이 없는 손님에게는 기다리지 않게 해요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-02]', '[12진로04-05]'],
  costume: { customer: 'sporty' },
  diary: '새벽 버스 기사님은 10분만 쉰다. 관광객이 할머니의 빈 의자에 앉았다. 할머니는 말을 멈추고 잔을 감쌌다.',
  script: [
    big('여름 · 2일', '10분'),
    bg('bus_terminal', 'evening'),
    amb('street'),
    place('여름 새벽 06:10', '버스 종점'),
    narr('새벽, 종점에 마지막 밤 버스가 들어온다.'),
    sfx('bus'),
    bg('hall', 'morning'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'han:normal' }),
    respond('han', 'summer_first'),
    mini('brew', {
      id: 'summer_2_han', title: '달게 한 잔', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'han', say: '달게 한 잔이요. 따뜻한 걸로, 가져갈게요.', menu: 'vanilla_latte', temp: 'hot', togo: true, ticket: '달게 한 잔', thanks: '아, 달다. 이제 좀 살겠네.' },
      ],
    }),
    say('han', 'smile', '내일도 이 시간에 와요. 여섯 시 십 분.'),
    leave('han'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '한 씨예요. 밤새 버스를 몰아요.'),
    say('owner', 'normal', '집에 가면 딸이 학교에 간대요. 서로 얼굴 볼 시간이 없죠.'),
    think('밤새 일하고, 10분 쉬고, 딸과는 엇갈리고.'),

    // 오전: 해순 할머니와 관광객
    place('여름 오전 10:00', '바닷가 마을 카페'),
    bg('hall', 'summer'),
    bgm('cafe'),
    amb('crowd'),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    sfx('bell'),
    say('haesun', 'smile', '지은 씨, 늘 먹던 거요.'),
    mini('brew', {
      id: 'summer_2_haesun', title: '해순 할머니의 늘 먹던 거', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false },
      ],
    }),
    mini('tray', { id: 'summer_2_tray', title: '창가로 가져가기', items: [{ icon: 'milk', name: '따뜻한 우유' }, { icon: 'milk', name: '따뜻한 우유' }], to: '창가 자리' }),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    respond('haesun', 'summer_tourist'),
    narr('창가에 다시 조용함이 돌아온다.'),
    leave('haesun'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '여름엔 그 의자가 제일 인기예요. 바다가 보이니까.'),
    think('할머니에게는 바다보다 그 의자가 더 소중한 것 같다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
