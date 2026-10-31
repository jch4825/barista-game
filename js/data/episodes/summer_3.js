/**
 * 여름 3일 · 식은 커피: 유모차의 은주(디카페인 라테 → 아기를 달래는 사이 다 식음, 대응 E1)
 * → 구석의 수민("제일 싼 거요" = 말로 설명하는 주문 → 구석 자리, 대응 S1)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, mini, respond, term, motion, end } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_3',
  act: 2, season: 'summer', day: 3,
  label: '여름 3일',
  title: '식은 커피',
  when: '여름 · 오전',
  goal: '사람마다 편한 거리가 달라요. 다가갈지, 조용히 둘지 살펴요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  diary: '아기 엄마의 커피는 늘 식는다고 했다. 구석의 학생은 이어폰을 끼고 제일 싼 음료를 시켰다. 한 사람에게는 말이, 한 사람에게는 조용함이 필요했다.',
  script: [
    big('여름 · 3일', '식은 커피'),
    bg('hall', 'summer'),
    amb('cafe'),
    bgm('cafe'),
    place('여름 오전 09:20', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'eunju:normal' }),
    sfx('bell'),
    narr('유모차를 미는 사람이 들어온다. 문턱에서 유모차가 덜컹한다.'),
    narr('아기가 칭얼거린다. 엄마의 눈 밑이 어둡다.'),
    say('eunju', 'normal', '디카페인 라테 하나요.'),
    think('{{디카페인}}. 카페인을 뺀 커피다.'),
    term('decaf'),
    mini('brew', {
      id: 'summer_3_eunju', title: '디카페인 라테', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'eunju', say: '디카페인 라테 하나요.', menu: 'decaf_latte', temp: 'hot', togo: false, ask: ['temp', 'togo'], reply: { temp: '따뜻한 걸로요.', togo: '여기서 마실게요.' }, thanks: '고마워요. 이따 마실게요.' },
      ],
    }),
    narr('은주가 창가에 앉는다. 아기가 울기 시작한다.'),
    narr('은주가 유모차를 흔들고, 안아 올리고, 다시 눕힌다.'),
    narr('삼십 분이 지났다.'),
    show({ left: 'jieun:normal', right: 'eunju:sad' }),
    respond('eunju', 'summer_cold'),
    say('eunju', 'smile', '저 은주예요. 아기 낳고 이 마을로 이사 왔어요.'),
    say('jieun', 'smile', '저는 지은이에요. 저도 이 마을에 온 지 얼마 안 됐어요.'),
    leave('eunju'),
    sfx('door'),

    // 오후: 구석의 수민
    place('여름 오후 16:30', '바닷가 마을 카페'),
    bgm('warm'),
    show({ left: 'jieun:normal', right: 'sumin:normal' }),
    sfx('bell'),
    narr('교복을 입은 학생이 들어온다. 귀에 이어폰을 끼고 있다.'),
    narr('학생이 메뉴판의 맨 아래를 손가락으로 가리킨다.'),
    say('sumin', 'normal', '…제일 싼 거요.'),
    think('제일 싼 거. 수첩에서 찾아봐야겠다.'),
    mini('brew', {
      id: 'summer_3_sumin', title: '제일 싼 거', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'sumin', say: '제일 싼 거요. 차갑게요.', menu: 'barley_tea', temp: 'iced', togo: false, ask: ['togo'], reply: { togo: '…여기서요.' }, ticket: '제일 싼 거', thanks: '…감사합니다.' },
      ],
    }),
    respond('sumin', 'summer_corner'),
    leave('sumin'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '저 학생은 고3이에요. 매일 저 구석에서 공부해요.'),
    say('owner', 'normal', '사람마다 편한 거리가 있어요.'),
    think('은주 씨에게는 말이 필요했고, 저 학생에게는 조용함이 필요했다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
