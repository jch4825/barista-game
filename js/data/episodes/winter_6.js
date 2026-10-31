/**
 * 겨울 6일 · 세 번째 잔: 손녀와 함께 온 해순 할머니(대응 H5) → (해순 3단계) 남편의 마지막 주문 "우유 두 잔"
 * → (노 씨 · 은주 · 지안 3단계) 처음 떨린 날, 일주일의 말, 지은의 손을 그린 종이
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, secret, motion, face, end } from '../../core/dsl.js';

const WINTER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa', 'mix_coffee'];

export default {
  id: 'winter_6',
  act: 4, season: 'winter', day: 6,
  label: '겨울 6일',
  title: '세 번째 잔',
  when: '겨울 · 오후',
  goal: '그 사람에게 소중한 것을 기억해요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로02-01]'],
  diary: '해순 할머니가 손녀를 데려왔다. 창가에 우유가 놓였다. 할머니에게 그 의자는 늘 함께 앉는 자리다.',
  script: [
    big('겨울 · 6일', '세 번째 잔'),
    bg('hall', 'winter'),
    amb('cafe'),
    bgm('warm'),
    place('겨울 오후 15:00', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', center: 'haesun:smile', right: 'granddaughter:smile' }),
    sfx('bell'),
    respond('haesun', 'winter_granddaughter'),
    ...onlyIf({ pick: 'haesun.winter_granddaughter=three_cups|two_cups' },
      mini('brew', {
        id: 'winter_6_three', title: '세 잔', level: 'normal', book: WINTER_BOOK,
        orders: [
          { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
          { who: 'granddaughter', say: '저도 따뜻한 우유요!', menu: 'warm_milk', temp: 'hot', togo: false, thanks: '할머니 거랑 똑같다!' },
          { who: 'haesun', say: '한 잔 더요. 그 자리 거.', menu: 'warm_milk', temp: 'hot', togo: false, thanks: '고마워요.' },
        ],
      }),
    ),
    ...onlyIf({ pick: 'haesun.winter_granddaughter=wait_order' },
      mini('brew', {
        id: 'winter_6_two', title: '늘 먹던 거', level: 'normal', book: WINTER_BOOK,
        orders: [
          { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
          { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false },
        ],
      }),
    ),
    ...onlyIf({ pick: 'haesun.winter_granddaughter=three_cups|two_cups' },
      mini('tray', { id: 'winter_6_tray3', title: '창가로 세 잔', items: [{ icon: 'milk', name: '따뜻한 우유' }, { icon: 'milk', name: '따뜻한 우유' }, { icon: 'milk', name: '따뜻한 우유' }], to: '창가 자리' }),
      narr('한 잔은 할머니 앞에, 한 잔은 손녀 앞에, 한 잔은 빈 의자 앞에.'),
    ),
    ...onlyIf({ pick: 'haesun.winter_granddaughter=wait_order' },
      mini('tray', { id: 'winter_6_tray2', title: '창가로 두 잔', items: [{ icon: 'milk', name: '따뜻한 우유' }, { icon: 'milk', name: '따뜻한 우유' }], to: '창가 자리' }),
      narr('할머니가 한 잔을 빈 의자 앞으로 옮기고, 손녀와 나눠 마신다.'),
    ),

    // 해순 3단계: 남편의 마지막 주문
    ...onlyIf({ trust: { haesun: '>=7' } },
      show({ left: 'jieun:normal', center: 'haesun:smile', right: 'granddaughter:smile' }),
      narr('손녀가 창밖의 눈사람을 보러 나간다. 할머니가 나를 부른다.'),
      cg('haesun_secret'),
      say('haesun', 'normal', '지은 씨. 이 의자 이야기, 해 줄까요.'),
      say('haesun', 'normal', '그 사람은 늘 블랙만 마셨어요. 나는 우유.'),
      say('haesun', 'normal', '그런데 마지막으로 여기 온 날, 그 사람이 우유 두 잔을 시켰어요.'),
      say('haesun', 'smile', '"오늘은 당신이랑 같은 걸로." 그게 마지막 주문이었어요.'),
      say('haesun', 'smile', '그래서 나는 지금도 두 잔을 시켜요. 그 사람 주문대로.'),
      secret('haesun'),
      think('할머니가 이야기를 꺼내셨다. 한 번도 묻지 않고 기다렸기 때문일까.'),
      cg(null),
    ),

    // 노 씨 3단계: 처음 떨린 날
    ...onlyIf({ trust: { noh: '>=7' } },
      show({ left: 'jieun:normal', right: 'noh:normal' }),
      sfx('bell'),
      narr('노 씨가 들어와, 랜턴을 올려다본다.'),
      cg('noh_secret'),
      say('noh', 'normal', '사장이 처음 떨린 날, 내가 옆에 있었어.'),
      say('noh', 'normal', '그날도 그 잔을 탔지. 숟가락이 떨리더라. 둘 다 아무 말 안 했어.'),
      say('noh', 'normal', '그다음 날 이 랜턴을 나한테 맡기더라. "가게 불 꺼지면 네가 켜라."'),
      say('noh', 'smile', '근데 이번엔 네가 먼저 켰더라.'),
      secret('noh'),
      think('노 씨가 처음으로 사장님 이야기를 했다. 모른 척해 드린 날들 덕분일까.'),
      cg(null),
      leave('noh'),
    ),

    // 은주 3단계: 일주일의 말
    ...onlyIf({ trust: { eunju: '>=7' } },
      show({ left: 'jieun:normal', right: 'eunju:smile' }),
      sfx('bell'),
      cg('eunju_secret'),
      say('eunju', 'normal', '지은 씨, 여름에 처음 왔던 날 기억나요?'),
      say('eunju', 'normal', '그 전 일주일 동안, 어른이랑 말한 적이 한 번도 없었어요.'),
      say('eunju', 'smile', '"이건 천천히 식어요." 그 말이 그 주의 첫 대화였어요.'),
      secret('eunju'),
      think('은주 씨가 그 이야기를 해 주었다. 먼저 물어봐 드린 날들 덕분일까.'),
      cg(null),
      leave('eunju'),
    ),

    // 지안 3단계: 지은의 손
    ...onlyIf({ trust: { jian: '>=7' } },
      show({ left: 'jieun:normal', right: 'jian:smile' }),
      sfx('bell'),
      narr('지안이 스케치북을 펴서 나에게 내민다.'),
      cg('jian_secret'),
      narr('종이에 손 하나가 그려져 있다. 드리퍼 위로 천천히 물을 붓는 손.'),
      say('jian', 'smile', '지은 씨 손이에요. 정전 밤에 그렸어요.'),
      say('jian', 'smile', '천천히 움직여서, 그리기 좋았어요. 일 년 만에 처음 끝까지 그린 그림이에요.'),
      secret('jian'),
      think('내 손이 그림이 되었다. 색을 물어봐 드린 날들 덕분일까.'),
      cg(null),
      leave('jian'),
    ),

    bg('hall', 'evening'),
    place('겨울 저녁 19:00', '마감'),
    show({ center: 'jieun:smile' }),
    narr('눈이 완전히 그쳤다. 하늘이 맑다.'),
    narr('창가 의자 위에, 할머니가 두고 간 담요가 곱게 개켜져 있다.'),
    think('내일은 맑다고 한다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
