/**
 * 여름 1일 · 소문: 배우의 사진 → 관광객이 늘어남 → 쉬는 날 바다에 놀러 온 연우와 도현(직업 마1스톤 인물, 손님으로만)
 * → 오후, 스케치북을 안은 지안의 "아무거나요"(대응 J1) → 고른 대응에 따라 만드는 음료가 달라짐(pick)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, motion, end } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_1',
  act: 2, season: 'summer', day: 1,
  label: '여름 1일',
  title: '소문',
  when: '여름 · 오전',
  goal: '말로 설명하는 주문을 들어 보고, 부드럽게 물어봐요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  diary: '여름이 왔다. 배우의 사진 때문에 손님이 늘었다. 스케치북을 안은 손님은 "아무거나요" 하고 메뉴판의 색을 보았다.',
  script: [
    big('여름 · 1일', '소문'),
    bg('cafe_front', 'morning'),
    amb('crowd'),
    bgm('cafe'),
    place('여름 오전 09:30', '카페 앞'),
    cg('summer_rumor'),
    narr('여름이 왔다. 카페 앞에 처음 보는 사람들이 서 있다.'),
    narr('다들 휴대폰을 들고 있다. 배우가 올린 사진이다.'),
    say('customer', 'smile', '여기다! 배우가 다녀간 카페!'),
    cg(null),

    bg('hall', 'summer'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '오늘은 손님이 많겠네요.'),
    say('owner', 'normal', '여름 메뉴가 수첩에 늘었어요. 모르면 언제든 봐요.'),
    show({ left: 'jieun:normal', center: 'yeonwoo:smile', right: 'dohyun:smile' }),
    cg('summer_cameo'),
    narr('앞치마 자국이 남은 두 사람이 들어온다. 카페에서 일하는 사람들 같다.'),
    say('dohyun', 'smile', '쉬는 날이라 바다 보러 왔어요.'),
    say('yeonwoo', 'smile', '저는 아이스 라테요. 여기서 마시고 갈게요.'),
    cg(null),
    mini('brew', {
      id: 'summer_1_cameo', title: '바다 보러 온 두 손님', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'yeonwoo', say: '아이스 라테 하나요. 여기서 마실게요.', menu: 'latte', temp: 'iced', togo: false, thanks: '우유가 부드러워요. 고마워요.' },
        { who: 'dohyun', say: '저는 아메리카노요.', menu: 'americano', temp: 'iced', togo: false, ask: ['temp'], reply: { temp: '여름이니까 아이스요.' }, thanks: '샷이 정확하네요. 좋아요.' },
      ],
    }),
    show({ left: 'jieun:normal', center: 'yeonwoo:smile', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '천천히 만드시는데, 손이 정확하네요.'),
    say('dohyun', 'smile', '저도 처음엔 빨리 하려다 많이 쏟았어요.'),
    think('나만 그런 게 아니었구나.'),
    say('yeonwoo', 'smile', '바다가 예뻐요. 또 올게요.'),
    leave('yeonwoo'),
    leave('dohyun'),
    sfx('door'),

    // 오후: 지안
    place('여름 오후 15:00', '조용해진 오후'),
    bgm('warm'),
    show({ left: 'jieun:normal', right: 'jian:normal' }),
    sfx('bell'),
    respond('jian', 'summer_anything'),
    ...onlyIf({ pick: 'jian.summer_anything=ask_color' },
      mini('brew', {
        id: 'summer_1_jian_yellow', title: '노란색', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'jian', say: '노란색이요. 유자차 주세요.', menu: 'yuja_tea', temp: 'iced', togo: false, ask: ['temp'], reply: { temp: '차갑게요. 더워서요.' }, thanks: '노랗다. 고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.summer_anything=pick_popular' },
      mini('brew', {
        id: 'summer_1_jian_popular', title: '제일 많이 팔리는 것', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'jian', say: '네, 그걸로 주세요.', menu: 'americano', temp: 'iced', togo: false, ticket: '제일 많이 팔리는 것', thanks: '고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.summer_anything=wait_silent' },
      narr('물 한 잔을 드렸다. 지안이 창가에서 천천히 마신다.'),
    ),
    narr('지안은 스케치북을 무릎에 올려놓고, 한 번도 펴지 않는다.'),
    leave('jian'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '저 손님, 요즘 자주 와요. 그림 그리는 사람이래요.'),
    think('그런데 스케치북을 한 번도 안 펴네.'),
    say('owner', 'normal', '오늘 많이 팔았네요.'),
    narr('사장님이 의자에 앉는다. 피곤해 보인다.'),
    motion('owner', 'nod'),
    end(),
  ],
};
