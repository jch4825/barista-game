/**
 * 여름 7일 · 동네 시간(여름의 끝 장면, PRD 5.5): 첫 '동네 시간'의 새벽 → 6시 10분 한 씨의 컵(대응 Han2)
 * → 며칠 만에 온 강 씨(대응 K3) → 도 씨 · 노 씨 · 해순 할머니까지 단골 다섯이 한 방에 → 조용하다
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, chalk, mini, respond, branch, onlyIf, motion, face, end, info } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_7',
  act: 2, season: 'summer', day: 7,
  label: '여름 7일',
  title: '동네 시간',
  when: '여름 · 새벽',
  goal: '단골이 오는 시간과 평소 주문을 기억해요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-02]', '[12진로05-04]'],
  diary: '동네 시간의 첫 아침. 단골 다섯 명이 한 방에 있었다. 아무도 크게 말하지 않았다. 조용해서 좋았다.',
  script: [
    big('여름 · 7일', '동네 시간'),
    bg('cafe_front', 'morning'),
    amb('street'),
    bgm('morning'),
    place('여름 새벽 05:50', '카페 앞'),
    info('오늘의 칠판', '오늘부터 아침 7시 전은 동네 시간이에요.', 'menu'), // 재미 개편 Q-43: 오늘 하나 달라지는 것(미리 알고 시작)
    show({ center: 'jieun:normal' }),
    narr('골목이 조용하다. 어제는 문 앞까지 줄이 섰는데, 오늘은 아무도 없다.'),
    narr('문에 사장님의 글씨가 붙어 있다. "7시 전은 동네 시간"'),
    think('오늘이 첫 동네 시간이다. 단골들이 다시 와 주실까.'),
    bg('hall', 'morning'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '오늘은 지은 씨가 가게를 열어 봐요. 늘 하던 순서대로.'),
    mini('routine', { id: 'summer_7_open', kind: 'open', title: '동네 시간의 가게 열기' }),

    // 6시 10분: 한 씨
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    respond('han', 'summer_clock'),
    ...onlyIf({ pick: 'han.summer_clock=when_comes|go_out' },
      mini('brew', {
        id: 'summer_7_han', title: '달게 한 잔', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'han', say: '달게 한 잔이요. 가져갈게요.', menu: 'vanilla_latte', temp: 'hot', togo: true, ticket: '달게 한 잔', thanks: '고마워요. 오늘도 살았네.' }],
      }),
    ),
    say('han', 'smile', '버스에서 문에 붙은 글씨를 봤어요. 동네 시간이라니, 참 좋네요.'),
    // 한 씨의 의외성(2026-11-02 사용자 "의외성 장면 쓰기": 겉모습과 다른 면, 모든 학생에게 같음): 말수 적은 기사님이 딸 이야기만은 멈추지 못함
    narr('한 씨의 버스 열쇠에 작은 털실 인형이 달려 있다. 바늘땀이 삐뚤빼뚤해서, 손으로 만든 것 같다.'),
    say('jieun', 'normal', '열쇠고리가 귀여워요. 누가 만들어 줬어요?'),
    say('han', 'smile', '딸이요. 중학교 2학년인데, 가정 시간에 처음 바느질을 해서 만들었대요.'),
    say('han', 'smile', '그림도 잘 그리고 노래도 잘해요. 수학은 싫어하는데, 그건 나를 닮아서 그래요.'),
    say('han', 'smile', '아침엔 딸기잼 토스트만 먹고, 요즘은 고양이를 키우고 싶어 해요. 그리고 지난주에는….'),
    narr('한 씨가 손목시계를 보더니 말을 멈춘다. 쉬는 십 분이 벌써 다 지났다.'),
    say('han', 'normal', '…내가 원래 이렇게 말이 많은 사람이 아닌데.'),
    think('말수 적은 한 씨가 딸 이야기만은 멈추지 못했다. 그만큼 딸이 보고 싶은 거겠지.'),
    leave('han'),

    // 며칠 만에 온 강 씨
    sfx('bell'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    respond('kang', 'summer_return'),
    leave('kang'),

    // 도 씨 · 노 씨 · 해순 할머니
    show({ left: 'jieun:normal', center: 'do:smile', right: 'noh:normal' }),
    sfx('bell'),
    say('do', 'smile', '허허, 동네 시간이라면서요? 늘 먹던 거 줘요.'),
    say('noh', 'normal', '나는 그 잔.'),
    mini('brew', {
      id: 'summer_7_do', title: '동네 시간의 첫 주문', level: 'normal', book: SUMMER_BOOK,
      orders: [{ who: 'do', say: '늘 먹던 거요.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '이 시간에 여기 있으니 좋네.' }],
    }),
    narr('노 씨의 믹스커피는 오늘도 사장님이 탄다. 숟가락이 천천히, 조심스럽게 돈다.'),
    sfx('bell'),
    enter('left', 'haesun:smile'),
    show({ left: 'haesun:smile', center: 'do:smile', right: 'noh:normal' }),
    say('haesun', 'smile', '지은 씨, 늘 먹던 거요.'),
    mini('brew', {
      id: 'summer_7_haesun', title: '해순 할머니의 늘 먹던 거', level: 'normal', book: SUMMER_BOOK,
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false, more: true },
      ],
    }),

    // 끝 장면: 조용한 방
    cg('summer_village_time'),
    narr('창가에는 해순 할머니, 카운터 옆에는 도 씨, 구석에는 노 씨가 앉아 있다.'),
    narr('조금 전까지는 강 씨와 한 씨도 있었다. 단골 다섯 사람이 한 가게에 모인 것은 처음이다.'),
    narr('아무도 크게 말하지 않는다. 컵 내려놓는 소리와 파도 소리만 들린다.'),
    branch('summer_line', {
      queue: [say('haesun', 'smile', '어제는 못 들어왔는데. 오늘은 앉을 자리가 있네요.')],
      regulars: [say('haesun', 'smile', '어제 뒷문 계단에서 마신 우유도 참 따뜻했어요.')],
    }),
    narr('사장님이 오랜만에 의자에 앉아, 창밖을 본다.'),
    face('jieun', 'smile'),
    think('어제의 시끄러운 줄과는 전혀 다르다. 이 조용함이 이 가게의 진짜 모습인 것 같다.'),
    cg(null),
    say('owner', 'normal', '여름은 이제 시작이에요. 낮에는 줄이 길어도, 아침마다 이렇게 동네 시간을 지켜 가요.'),
    // 계절 끝 배지: 여름을 마치면 바리스타
    sfx('stamp'),
    narr('사장님이 내 앞치마의 배지 옆에, 배지를 하나 더 달아 준다.'),
    say('owner', 'smile', '그 줄을 끝까지 버텼으니, 이제 그냥 바리스타라고 해도 되겠네요.'),
    info('새 배지', '「바리스타」 배지를 받았어요!', 'badge'),
    motion('owner', 'nod'),
    end(),
  ],
};
