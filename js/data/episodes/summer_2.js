/**
 * 여름 2일 · 10분: 새벽 6시 10분, 밤 버스 기사 한 씨(대응 Han1, "달게 한 잔" = 말로 설명하는 주문)
 * → 오전, 해순 할머니의 늘 먹던 거 → 관광객이 빈 의자에 앉음(대응 H2)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, mini, respond, motion, end, info } from '../../core/dsl.js';

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
    info('오늘의 칠판', '새벽 여섯 시 십 분에 밤 버스가 들어와요.', 'menu'), // 재미 개편 Q-43: 오늘 하나 달라지는 것(미리 알고 시작)
    narr('여름 새벽, 종점에 마지막 밤 버스가 들어온다. 봄에 내가 이 마을에 처음 내린 바로 그 종점이다.'),
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
    say('han', 'smile', '어, 봄에 큰 가방 메고 종점에서 내린 사람이죠? 여기서 일하는구나.'),
    think('그때 내가 짐을 다 내릴 때까지 문을 열고 기다려 주신 기사님이다.'),
    say('han', 'smile', '내일도 이 시간에 와요. 여섯 시 십 분.'),
    leave('han'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '한 씨예요. 밤새 버스를 몰고, 새벽에 차를 넣기 전에 여기서 10분 쉬어요.'),
    say('owner', 'normal', '집에 가면 딸이 벌써 학교에 가 있대요. 서로 얼굴 볼 시간이 없는 거죠.'),
    think('밤새 일하고, 10분 쉬고, 집에 가면 딸과 엇갈린다. 그 10분이 한 씨에게는 아주 귀한 시간이겠다.'),

    // 오전: 해순 할머니와 관광객
    place('여름 오전 10:00', '바닷가 마을 카페'),
    bg('hall', 'summer'),
    bgm('cafe'),
    amb('crowd'),
    // 푸슉 머신(웃음 줄기, 재미 개편 3.2): 진지한 사람이 무너지지 않는 순간
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    narr('손님이 오기 전, 머신에 원두를 꾹 눌러 담았다. 너무 세게 눌렀나 보다.'),
    sfx('poof'),
    narr('머신이 "푸슉!" 하고 커피 가루를 뿜는다. 옆에 있던 사장님 얼굴이 새까매졌다.'),
    say('owner', 'normal', '…날씨 좋네.'),
    think('사장님은 얼굴을 닦지도 않고 신문을 넘긴다. 웃으면 안 되는데, 입술을 꾹 깨물었다.'),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    sfx('bell'),
    say('haesun', 'smile', '지은 씨, 늘 먹던 거요.'),
    think('할머니는 여름에도 따뜻한 우유 두 잔이다. 한 잔은 빈 의자 앞에 놓는다.'),
    mini('brew', {
      id: 'summer_2_haesun', title: '해순 할머니의 늘 먹던 거', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false, more: true },
      ],
    }),
    mini('tray', { id: 'summer_2_tray', title: '창가로 가져가기', items: [{ icon: 'milk', name: '따뜻한 우유' }, { icon: 'milk', name: '따뜻한 우유' }], to: '창가 자리' }),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    respond('haesun', 'summer_tourist'),
    narr('창가에 다시 조용함이 돌아온다. 할머니는 빈 의자 앞의 잔을 바라보며 천천히 우유를 마신다.'),
    leave('haesun'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '여름에는 그 의자가 제일 인기예요. 바다가 제일 잘 보이는 자리니까.'),
    think('할머니에게는 바다보다 그 의자가 더 소중한 것 같다. 여름 내내 그 자리를 어떻게 지켜 드릴 수 있을까.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
