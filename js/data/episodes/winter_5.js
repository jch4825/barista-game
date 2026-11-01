/**
 * 겨울 5일 · 불이 들어온 아침: 아직 눈이 오는 아침, 두툼해진 스케치북의 지안(대응 J5, 고른 것에 따라 음료)
 * → (도 씨 3단계) 마지막 우편은 도 씨가 지은에게 쓴 편지 → (한 씨 3단계) 딸에게 쓴 쪽지
 * → 처음 온 엄마를 데려온 은주(대응 E5)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, secret, motion, face, end, info } from '../../core/dsl.js';

const WINTER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa', 'mix_coffee'];

export default {
  id: 'winter_5',
  act: 4, season: 'winter', day: 5,
  label: '겨울 5일',
  title: '불이 들어온 아침',
  when: '겨울 · 아침',
  goal: '처음 온 사람에게도 따뜻하게 다가가요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로05-04]', '[12진로02-01]'],
  diary: '정전 다음 날, 가게는 다시 평소로 돌아왔다. 지안 씨의 스케치북이 두툼해졌다. 은주 씨가 처음 온 엄마를 데려왔다.',
  script: [
    big('겨울 · 5일', '불이 들어온 아침'),
    bg('hall', 'winter'),
    amb('cafe'),
    bgm('morning'),
    place('겨울 아침 09:00', '바닷가 마을 카페'),
    info('오늘의 칠판', '전기가 다시 들어왔어요. 손님이 한꺼번에 올지도 몰라요.', 'menu'), // 재미 개편 Q-43: 오늘 하나 달라지는 것(미리 알고 시작)
    show({ center: 'jieun:normal' }),
    narr('정전 밤에 쓴 컵들을 아침까지 다 닦았다. 창밖에는 아직 눈이 조금씩 내린다.'),
    narr('사장님 자리 위에는 노 씨의 랜턴이 그대로 걸려 있다.'),
    think('밤새 북적이던 가게가 다시 조용하다. 오늘은 다시 평소의 하루다.'),

    // 도 씨 3단계: 마지막 우편
    ...onlyIf({ trust: { do: '>=7' } },
      show({ left: 'jieun:normal', right: 'do:smile' }),
      sfx('bell'),
      narr('도 씨가 들어온다. 이제 우편 가방은 없고, 손에 편지 한 통만 들었다.'),
      say('do', 'smile', '배달이 하나 남았어요. 이건 내가 쓴 편지예요.'),
      cg('do_secret'),
      narr('봉투에 또박또박한 글씨로 "지은 씨에게"라고 적혀 있다.'),
      say('do', 'normal', '서른 해 동안 남의 편지만 날랐어요. 마지막은 내 편지를 날라 보고 싶었어요.'),
      say('do', 'normal', '사실, 그만두는 게 무서웠어요. 내일부터 갈 데가 없을까 봐.'),
      say('do', 'smile', '그런데 내가 앉을 자리를 늘 비워 둔 데가 있더라고요. 여기요.'),
      secret('do'),
      think('도 씨가 무서웠다고 말씀하셨다. 앉을 자리를 만들어 두고 기다린 날들 덕분일까.'),
      cg(null),
      mini('brew', {
        id: 'winter_5_do', title: '도 씨의 늘 먹던 거', level: 'normal', book: WINTER_BOOK,
        orders: [{ who: 'do', say: '늘 먹던 거요. 오늘은 앉아서 천천히.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '이제 매일 앉아서 마실 수 있겠네.' }],
      }),
      leave('do'),
    ),

    // 한 씨 3단계: 컵 속의 쪽지
    ...onlyIf({ trust: { han: '>=7' } },
      show({ left: 'jieun:normal', right: 'han:smile' }),
      sfx('bell'),
      narr('한 씨가 들어온다. 오늘은 쉬는 날이라 운전복이 아니라 두꺼운 외투 차림이다.'),
      cg('han_secret'),
      narr('한 씨가 접힌 종이 두 장을 카운터에 올려놓는다.'),
      say('han', 'smile', '컵 받침 뒤에 이렇게 써서, 식탁에 두고 왔어요. "아빠가 먼저 갈게. 아침 꼭 먹어."'),
      say('han', 'smile', '그리고 이건 딸의 답장이에요. 오늘 아침에 받았어요.'),
      narr('두 번째 종이에 삐뚤빼뚤한 글씨가 있다. "아빠도 아침 먹어."'),
      secret('han'),
      think('한 씨가 쪽지를 보여 주셨다. 10분을 아껴 드린 날들 덕분일까.'),
      cg(null),
      leave('han'),
    ),

    // 지안
    show({ left: 'jieun:normal', right: 'jian:shy' }),
    sfx('bell'),
    respond('jian', 'winter_snow'),
    ...onlyIf({ pick: 'jian.winter_snow=ask_color' },
      mini('brew', {
        id: 'winter_5_jian_milk', title: '여러 색', level: 'normal', book: WINTER_BOOK,
        orders: [{ who: 'jian', say: '따뜻한 우유 주세요. 하얀색은 모든 색을 담을 수 있대요.', menu: 'warm_milk', temp: 'hot', togo: false, thanks: '여러 색이 다 들어갈 것 같아요. 고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.winter_snow=usual_yuja|pry_sketch' },
      mini('brew', {
        id: 'winter_5_jian_yuja', title: '늘 마시던 노란색', level: 'normal', book: WINTER_BOOK,
        orders: [{ who: 'jian', say: '유자차요. 따뜻하게요.', menu: 'yuja_tea', temp: 'hot', togo: false, thanks: '고마워요.' }],
      }),
    ),
    leave('jian'),

    // 몰림 시간(재미 개편 Q-44): 전기가 들어오자 마을 사람들이 한꺼번에
    narr('전기가 들어오자, 며칠 동안 따뜻한 것을 못 마신 마을 사람들이 한꺼번에 몰려온다.'),
    mini('rush', { id: 'winter_5_rush', theme: 'cafe', title: '불이 들어온 날의 몰림 시간' }),

    // 은주와 처음 온 엄마
    place('겨울 오후 14:00', '바닷가 마을 카페'),
    bgm('warm'),
    show({ left: 'jieun:normal', center: 'eunju:normal', right: 'mom2:nervous' }),
    respond('eunju', 'winter_friend'),
    ...onlyIf({ pick: 'eunju.summer_cold=thick_cup' },
      mini('brew', {
        id: 'winter_5_moms', title: '두 엄마', level: 'normal', book: WINTER_BOOK,
        orders: [
          { who: 'mom2', say: '따뜻한 걸로요. 아, 디카페인도 있어요?', menu: 'decaf_latte', temp: 'hot', togo: false, thanks: '정말 따뜻하다. 고마워요.' },
          { who: 'eunju', say: '나는 늘 먹던 거요. 그 두꺼운 컵에요.', menu: 'decaf_latte', temp: 'hot', togo: false, usual: true, cup: 'thick', thanks: '고마워요, 지은 씨.' },
        ],
      }),
    ),
    ...onlyIf({ pick: 'eunju.summer_cold=reheat|take_baby|' },
      mini('brew', {
        id: 'winter_5_moms_mug', title: '두 엄마', level: 'normal', book: WINTER_BOOK,
        orders: [
          { who: 'mom2', say: '따뜻한 걸로요. 아, 디카페인도 있어요?', menu: 'decaf_latte', temp: 'hot', togo: false, thanks: '정말 따뜻하다. 고마워요.' },
          { who: 'eunju', say: '나는 늘 먹던 거요.', menu: 'decaf_latte', temp: 'hot', togo: false, usual: true, thanks: '고마워요, 지은 씨.' },
        ],
      }),
    ),
    narr('두 사람이 유모차를 나란히 세우고 이야기를 나눈다. 가끔 웃음소리가 들린다.'),
    think('여름에 혼자 식은 커피를 보던 은주 씨가, 오늘은 다른 사람을 데려왔다.'),
    leave('eunju'),
    leave('mom2'),

    bg('hall', 'evening'),
    place('겨울 저녁 19:00', '마감'),
    show({ center: 'jieun:smile' }),
    narr('눈이 그쳐 간다. 라디오에서 내일은 맑다고 한다.'),
    think('정전 밤에 모였던 사람들이, 오늘은 평소대로 왔다. 평소대로라는 게 이렇게 고마운 일이었다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
