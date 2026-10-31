/**
 * 겨울 3일 · 마지막 배달: 방학이라 딸과 함께 온 한 씨(대응 Han5) → (수민 3단계) 지은 앞에서 합격 통지서를 엶
 * → 마감 무렵, 빈 가방의 도 씨(대응 D5) → 겨울에도 아이스
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, secret, motion, face, end } from '../../core/dsl.js';

const WINTER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa', 'mix_coffee'];

export default {
  id: 'winter_3',
  act: 4, season: 'winter', day: 3,
  label: '겨울 3일',
  title: '마지막 배달',
  when: '겨울 · 새벽',
  goal: '끝나는 날에도 평소처럼, 따뜻하게 맞아요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로05-04]'],
  diary: '한 씨가 딸과 함께 왔다. 마감 무렵, 도 씨가 마지막 배달을 마치고 왔다. 빈 가방을 못에 걸었다.',
  script: [
    big('겨울 · 3일', '마지막 배달'),
    bg('hall', 'winter'),
    amb('cafe'),
    bgm('morning'),
    place('겨울 새벽 06:10', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', center: 'han:normal', right: 'han_daughter:normal' }),
    sfx('bus'),
    sfx('bell'),
    mini('brew', {
      id: 'winter_3_han', title: '한 씨의 늘 먹던 거', level: 'normal', book: WINTER_BOOK,
      orders: [{ who: 'han', say: '늘 먹던 거요. 오늘은 여기서 마실게요.', menu: 'vanilla_latte', temp: 'hot', togo: false, usual: true, thanks: '고마워요.' }],
    }),
    respond('han', 'winter_daughter'),
    ...onlyIf({ pick: 'han.winter_daughter=ask_daughter|tell_dad' },
      mini('brew', {
        id: 'winter_3_cocoa', title: '딸의 코코아', level: 'normal', book: WINTER_BOOK,
        orders: [{ who: 'han_daughter', say: '코코아요. 따뜻하게요.', menu: 'cocoa', temp: 'hot', togo: false, thanks: '맛있어요!' }],
      }),
    ),
    narr('둘이 나란히 앉아 창밖의 눈을 본다. 10분이 지나도 한 씨는 일어나지 않는다.'),
    say('han', 'smile', '오늘은 버스를 동료가 넣어 준대요. 천천히 가도 돼요.'),
    leave('han'),
    leave('han_daughter'),

    // 수민 3단계: 합격 통지서
    place('겨울 오전 11:00', '바닷가 마을 카페'),
    ...onlyIf({ trust: { sumin: '>=7' } },
      show({ left: 'jieun:normal', right: 'sumin:nervous' }),
      sfx('bell'),
      narr('수민이 들어와 카운터 앞 의자에 앉는다. 어제의 봉투를 꺼낸다.'),
      say('sumin', 'normal', '여기서 열고 싶었어요. 혼자 열면 무서울 것 같아서.'),
      cg('sumin_secret'),
      narr('수민이 천천히 봉투를 뜯는다. 종이를 펴고, 오래 바라본다.'),
      say('sumin', 'smile', '…합격이에요.'),
      say('jieun', 'smile', '축하해요.'),
      say('sumin', 'normal', '봄에 떠나요. 바다가 없는 도시로요.'),
      say('sumin', 'smile', '그래도 여기서 열어서 다행이에요.'),
      secret('sumin'),
      think('수민이 내 앞에서 봉투를 열었다. 거리를 지켜 준 날들 덕분일까.'),
      cg(null),
      leave('sumin'),
    ),
    ...onlyIf({ trust: { sumin: '<7' } },
      show({ left: 'jieun:normal', right: 'haesun:smile' }),
      sfx('bell'),
      say('haesun', 'smile', '지은 씨, 그 고3 학생 합격했대요. 봄에 떠난대요.'),
      think('수민은 집에서 봉투를 열었구나. 잘됐다.'),
      leave('haesun'),
    ),

    // 마감: 도 씨의 마지막 배달
    bg('hall', 'evening'),
    amb('cafe'),
    bgm('warm'),
    place('겨울 저녁 18:50', '마감 무렵'),
    show({ left: 'jieun:normal', right: 'do:normal' }),
    narr('문에 "오늘 영업 끝" 팻말을 걸었다.'),
    respond('do', 'winter_last'),
    narr('도 씨가 카페 앞으로 온 우편 한 통을 직접 건넨다. 서른 해 동안 하던 일이다.'),
    say('do', 'smile', '늘 먹던 거 줄래요? 겨울에도 아이스.'),
    mini('brew', {
      id: 'winter_3_do', title: '마지막 날의 아이스 아메리카노', level: 'normal', book: WINTER_BOOK,
      orders: [{ who: 'do', say: '늘 먹던 거요. 겨울에도 아이스.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '이거지. 서른 해 동안 이걸로 버텼어요.' }],
    }),
    narr('도 씨가 빈 가방을 내려다본다.'),
    say('do', 'normal', '내일부터는 갈 데가 없네. 허허.'),
    narr('도 씨가 웃는다. 그런데 눈은 웃지 않는다.'),
    leave('do'),
    sfx('door'),
    show({ center: 'jieun:normal' }),
    think('내일도 오시면 좋겠다. 앉으실 의자는 늘 그 자리에 있다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
