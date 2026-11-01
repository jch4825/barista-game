/**
 * 겨울 4일 · 정전(겨울의 폭발 사건, PRD 5.5 · 5.7): 폭설로 마을 정전, 불이 켜진 곳은 카페뿐
 * → 촛불 → 노 씨의 랜턴(대응 N5) → 강 씨의 버너 → 정전 밤의 준비(순서대로) → 손으로 내리는 커피(핸드드립)
 * → 단골 8명이 각자의 방식으로 도움(모두에게 같음, 3단계면 한두 줄 더 깊어짐) → 해순 할머니의 담요(대응 H4) · 지안의 촛불(대응 J4)
 * → 줄에서 금 씨: "천천히 해요."(마을 온기가 높으면 한 줄 더) → 느리고 정확한 손이 힘이 됨 → 새벽에 불이 들어옴. 실패 화면 없음
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, fx, mini, act, respond, onlyIf, term, motion, face, emote, end } from '../../core/dsl.js';

const WINTER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa', 'mix_coffee'];

export default {
  id: 'winter_4',
  act: 4, season: 'winter', day: 4,
  label: '겨울 4일',
  title: '정전',
  when: '겨울 · 밤',
  goal: '전기가 없는 밤. 느리고 정확한 손으로 한 잔씩 내려요.',
  schedule: [],
  skills: [],
  standards: ['[12진로01-03]', '[12진로03-04]', '[12진로05-04]', '[12진로04-06]'],
  costume: { customer: 'coffee' },
  diary: '폭설로 마을의 불이 모두 꺼졌다. 불이 켜진 곳은 우리 카페뿐이었다. 단골들이 모두 와서 도왔다. 느린 내 손이 오늘 밤에는 필요했다.',
  script: [
    big('겨울 · 4일', '정전'),
    bg('alley', 'morning'),
    fx('dark'),
    amb('street'),
    bgm('blackout'), // 그레고리안 찬송가: 마을 불이 꺼지는 무거운 밤(2026-11-01)
    place('겨울 저녁 18:20', '폭설'),
    cg('winter_storm'),
    narr('라디오에서 말한 대로, 오후부터 눈이 쏟아졌다. 골목에 눈이 무릎까지 쌓였다.'),
    narr('저녁이 되자 마을의 불이 하나씩 꺼진다. 가로등도, 집집의 창문도.'),
    term('blackout'),
    cg(null),
    fx('dark', false),

    bg('hall', 'blackout'),
    amb('home'),
    show({ center: 'jieun:nervous' }),
    narr('카페도 깜깜해졌다. 에스프레소 머신도, 냉장고도 멈췄다.'),
    think('침착하자. 사장님이라면 어떻게 하셨을까.'),
    narr('그저께 생각해 둔 대로, 뒷방 선반에서 사장님이 모아 둔 초를 꺼낸다.'),
    act('병 속 초에 불 붙이기', 'light', 'tap'),
    cg('blackout_cafe_lit'),
    narr('촛불이 하나, 둘 켜진다. 창으로 노란 불빛이 새어 나간다.'),
    narr('깜깜한 마을에서, 불이 켜진 곳은 이 카페뿐이다.'),
    cg(null),

    // 노 씨의 랜턴
    sfx('door'),
    show({ left: 'jieun:normal', right: 'noh:normal' }),
    respond('noh', 'winter_lantern'),
    // 강 씨의 버너
    sfx('door'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    narr('강 씨가 어깨의 눈을 털며 들어온다. 손에 작은 가스버너를 들었다.'),
    say('kang', 'normal', '배에서 쓰던 거야. 이걸로 물은 끓일 수 있어.'),
    ...onlyIf({ trust: { kang: '>=7' } },
      narr('강 씨 뒤로 젊은 어부 두 명이 따라 들어온다.'),
      say('young_fisher', 'normal', '강 씨가 불 켜진 데 가 있으라고 해서요.'),
      say('kang', 'smile', '이따 매듭 묶는 거 알려 줄게. 불 켜진 데서 배워야 잘 보이지.'),
    ),
    mini('routine', {
      id: 'winter_4_prep', kind: 'blackout', title: '정전 밤의 준비',
      steps: [
        { icon: 'caution', name: '버너 놓기', done: '강 씨의 버너를 평평하고 단단한 곳에 놓았어요.' },
        { icon: 'water', name: '주전자에 물 붓기', done: '주전자에 물을 붓고 버너 위에 올렸어요.' },
        { icon: 'coffee', name: '드리퍼 놓기', done: '드리퍼와 원두를 꺼내 놓았어요.' },
        { icon: 'cup', name: '컵 꺼내기', done: '컵을 촛불 옆에 줄지어 놓았어요.' },
      ],
    }),
    say('kang', 'normal', '전기가 없으니, 오늘은 손으로 내리는 커피뿐이네.'),
    think('{{핸드드립}}은 사장님이 강 씨에게 늘 내리던 커피다. 가을 내내 내가 이어서 내린 커피이기도 하다.'),

    // 사람들이 모여듦
    bgm('warm'),
    narr('촛불을 보고 사람들이 하나둘 들어온다. 불이 꺼져 추워진 집을 나온 사람들이다.'),
    show({ left: 'jieun:normal', center: 'do:smile', right: 'han:normal' }),
    sfx('door'),
    say('do', 'smile', '불빛 보고 왔어요. 뭐 도울 거 없어요?'),
    say('do', 'smile', '컵은 내가 나를게요. 서른 해 동안 편지를 날랐는데, 컵이라고 못 나르겠어요?'),
    ...onlyIf({ trust: { do: '>=7' } },
      narr('들어오는 사람마다 도 씨의 손을 잡는다. "도 씨, 그동안 정말 고마웠어요."'),
      narr('도 씨가 머쓱하게 웃는다. 서른 해 동안 도 씨의 편지를 받던 집의 사람들이다.'),
    ),
    narr('밖에서 엔진 소리가 난다. 한 씨가 버스를 골목 입구에 세운다.'),
    say('han', 'normal', '전조등을 켜 둘게요. 눈길이 잘 보이게요.'),
    narr('버스 불빛이 눈길을 환하게 비춘다. 사람들이 그 빛을 따라 카페로 온다.'),
    ...onlyIf({ trust: { han: '>=7' } },
      narr('한 씨는 버스에서 내리는 사람마다 먼저 인사한다. "조심히 오세요. 저기가 카페예요."'),
    ),

    mini('brew', {
      id: 'winter_4_drip', title: '정전 밤의 핸드드립', level: 'normal', book: WINTER_BOOK,
      pantry: { cups: ['mug', 'paper'], bases: ['drip', 'milk'], adds: ['water'], temps: ['hot'] },
      orders: [
        { who: 'do', say: '블랙 한 잔이요. 몸 좀 녹이게요.', menu: 'hand_drip', togo: false, thanks: '아, 살겠다. 손으로 내리니까 더 맛있네.' },
        { who: 'customer', say: '저도 따뜻한 커피 한 잔이요.', menu: 'hand_drip', togo: false, thanks: '고마워요. 이런 밤에 커피라니.' },
      ],
    }),
    mini('tray', { id: 'winter_4_tray', title: '촛불 사이로 나르기', items: [{ icon: 'coffee', name: '블랙' }, { icon: 'coffee', name: '블랙' }, { icon: 'cloth', name: '담요' }], to: '창가 자리', bg: ['hall', 'blackout'] }),

    // 해순 할머니의 담요
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    narr('해순 할머니가 담요를 한 아름 안고 왔다. 할머니는 아이들에게 담요를 하나씩 덮어 준다.'),
    say('haesun', 'smile', '집에 두면 뭐 해요. 이런 날은 다 같이 덮어야지.'),
    respond('haesun', 'winter_blackout'),

    // 지안의 촛불
    show({ left: 'jieun:normal', right: 'jian:shy' }),
    respond('jian', 'winter_candle'),
    ...onlyIf({ trust: { jian: '>=7' } },
      narr('지안이 촛불 옆 벽에 커다란 종이를 붙이고, 그림을 그리기 시작한다.'),
      narr('아이들이 모여들고, 어른들도 그림 앞에서 이야기를 나눈다.'),
    ),

    // 수민 · 은주
    show({ left: 'jieun:normal', center: 'sumin:normal', right: 'eunju:normal' }),
    narr('수민은 버너 옆에 서서 주전자를 지킨다. 물이 끓으면 조심스럽게 나에게 건넨다.'),
    say('sumin', 'normal', '물, 다 끓었어요. 뜨거우니까 조심하세요.'),
    ...onlyIf({ trust: { sumin: '>=7' } },
      narr('잠시 뒤, 수민이 이어폰을 빼고 아이들에게 그림책을 읽어 준다.'),
    ),
    narr('은주 씨는 창가 자리에서 아기를 재운다. 작은 자장가 소리가 들린다.'),
    ...onlyIf({ trust: { eunju: '>=7' } },
      narr('다른 엄마들이 은주 씨 옆으로 모인다. 아기들이 나란히 잠든다.'),
    ),

    // 금 씨: 천천히 해요
    cg('winter_gathering'),
    narr('컵을 기다리는 줄이 생겼다. 나는 한 잔씩, 천천히 내린다.'),
    narr('물을 끓이고, 뜸을 들이고, 세 번에 나눠 붓는다. 한 잔에 몇 분씩 걸린다.'),
    emote('jieun', 'sweat'),
    think('빨리 해야 하나. 줄이 점점 길어진다.'),
    cg('winter_gathering2'),
    show({ left: 'jieun:nervous', right: 'geum:normal' }),
    narr('줄 가운데에 금 씨가 서 있다. 봄에 "빨리요" 하고 재촉하던 바로 그 금 씨다.'),
    say('geum', 'smile', '천천히 해요.'),
    ...onlyIf({ warmth: '>=16' },
      say('geum', 'smile', '오늘은 다들 기다릴 수 있어요. 불 켜 줘서 고마워요.'),
    ),
    narr('줄 선 사람들이 고개를 끄덕인다. 아무도 재촉하지 않는다.'),
    face('jieun', 'determined'),
    think('천천히, 정확하게.'),
    think('가을 축제 때는 약점이던 내 느린 손이, 오늘 밤에는 모두를 기다리게 하고 따뜻하게 한다.'),
    cg(null),
    mini('brew', {
      id: 'winter_4_drip2', title: '한 잔씩, 천천히', level: 'normal', book: WINTER_BOOK,
      pantry: { cups: ['mug', 'paper'], bases: ['drip', 'milk'], adds: ['water'], temps: ['hot'] },
      orders: [
        { who: 'geum', say: '블랙이요. 천천히 해요.', menu: 'hand_drip', togo: false, thanks: '…빨리 마시는 것보다 낫네요.' },
      ],
    }),

    // 새벽
    narr('밤이 깊었다. 사람들은 담요를 덮고, 촛불 곁에서 졸거나 조용히 이야기를 나눈다.'),
    narr('노 씨의 랜턴이 밤새 사장님 자리 위에서 가게를 비춘다.'),
    place('겨울 새벽 05:30', '불이 들어온 새벽'),
    sfx('beep'),
    cg('winter_dawn_power'),
    narr('새벽, 냉장고가 웅 하고 다시 돌기 시작한다. 전기가 들어왔다.'),
    narr('사람들이 박수를 친다. 창밖에는 아직 눈이 조금씩 내린다.'),
    face('jieun', 'smile'),
    think('밤새 몇 잔을 내렸는지 모르겠다. 그래도 한 잔도 쏟지 않았다.'),
    cg(null),
    motion('jieun', 'bow'),
    end(),
  ],
};
