/**
 * 여름 1일 · 소문: 배우의 사진 → 관광객이 늘어남 → 쉬는 날 바다에 놀러 온 연우와 도현(직업 마1스톤 인물, 손님으로만)
 * → 오후, 스케치북을 안은 지안의 "아무거나요"(대응 J1) → 고른 대응에 따라 만드는 음료가 달라짐(pick)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, motion, end, info } from '../../core/dsl.js';

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
    info('오늘의 칠판', '배우의 사진이 퍼졌대요. 관광객이 늘었어요.', 'menu'), // 재미 개편 Q-43: 오늘 하나 달라지는 것(미리 알고 시작)
    cg('summer_rumor'),
    narr('여름이 왔다. 아침부터 카페 앞에 처음 보는 사람들이 줄을 서 있다.'),
    narr('다들 휴대전화를 들고 있다. 화면에는 봄에 배우가 올린, 이 카페의 창가 사진이 떠 있다.'),
    say('customer', 'smile', '여기다! 배우가 다녀간 그 카페!'),
    cg(null),

    bg('hall', 'summer'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '오늘은 손님이 많겠네요. 여름 메뉴가 수첩에 늘었으니, 모르면 언제든 펴 봐요.'),
    say('owner', 'normal', '여름에는 거의 다 아이스를 시켜요. 그래도 따뜻한 걸 찾는 사람도 있으니, 꼭 물어봐요.'),
    think('따뜻한지 차가운지, 여기서 마시는지 가져가는지. 주문을 받을 때 그 두 가지는 꼭 확인하자.'),
    show({ left: 'jieun:normal', center: 'yeonwoo:smile', right: 'dohyun:smile' }),
    cg('summer_cameo'),
    narr('어깨에 앞치마 끈 자국이 남은 두 사람이 들어온다. 도시에서 카페 일을 하는 사람들 같다.'),
    say('dohyun', 'smile', '쉬는 날이라 바다 보러 왔어요. 사진에서 본 카페가 여기더라고요.'),
    say('yeonwoo', 'smile', '저는 아이스 라테요. 바다 보면서 여기서 마시고 갈게요.'),
    cg(null),
    mini('brew', {
      id: 'summer_1_cameo', title: '바다 보러 온 두 손님', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'yeonwoo', say: '아이스 라테 하나요. 여기서 마실게요.', menu: 'latte', temp: 'iced', togo: false, thanks: '우유가 부드러워요. 고마워요.' },
        { who: 'dohyun', say: '저는 아메리카노요.', menu: 'americano', temp: 'iced', togo: false, ask: ['temp'], reply: { temp: '여름이니까 당연히 아이스죠.' }, thanks: '샷이 정확하네요. 좋아요.' },
      ],
    }),
    show({ left: 'jieun:normal', center: 'yeonwoo:smile', right: 'dohyun:smile' }),
    say('dohyun', 'smile', '천천히 만드시는데, 손이 참 정확하네요.'),
    say('dohyun', 'smile', '저도 처음에는 빨리 하려다가 많이 쏟았어요. 그래서 그 마음 알아요.'),
    think('도시에서 일하는 바리스타도 쏟아 봤구나. 나만 그런 게 아니었다.'),
    say('yeonwoo', 'smile', '바다가 정말 예뻐요. 다음 쉬는 날에 또 올게요.'),
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
        orders: [{ who: 'jian', say: '노란색이요. 유자차 주세요.', menu: 'yuja_tea', temp: 'iced', togo: false, ask: ['temp'], reply: { temp: '차갑게요. 오늘은 더워서요.' }, thanks: '정말 노랗다. 고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.summer_anything=pick_popular' },
      mini('brew', {
        id: 'summer_1_jian_popular', title: '제일 많이 팔리는 것', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'jian', say: '네, 그걸로 주세요.', menu: 'americano', temp: 'iced', togo: false, ticket: '제일 많이 팔리는 것', thanks: '고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.summer_anything=wait_silent' },
      narr('시원한 물 한 잔을 드렸다. 지안이 창가 구석에서 천천히 마신다.'),
    ),
    narr('지안은 스케치북을 무릎에 올려놓는다. 그런데 가게를 나갈 때까지 한 번도 펴지 않는다.'),
    leave('jian'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '저 손님, 요즘 자주 와요. 그림 그리는 사람이래요.'),
    say('jieun', 'normal', '그런데 스케치북을 한 번도 안 펴셨어요.'),
    say('owner', 'normal', '…그림이 안 그려지는 날도 있겠지요. 사람마다 그런 계절이 있어요.'),
    say('owner', 'normal', '오늘 많이 팔았네요. 수고했어요.'),
    narr('사장님이 의자에 앉아 손목을 천천히 주무른다. 오늘따라 많이 피곤해 보인다.'),
    motion('owner', 'nod'),
    end(),
  ],
};
