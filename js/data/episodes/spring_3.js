/**
 * 봄 3일 · 새벽 블랙: 새벽 여섯 시, 불 꺼진 카페 앞의 강 씨(대응 K1) → 사장님의 핸드드립(쉬움: 보기로 배움)
 * → 여는 때 둘러보기(숨은 장면 2: 컵이 지은의 손 높이로 내려와 있음) → 우체부 도 씨, 서서 마시는 사람(대응 D1)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, fx, mini, respond, motion, end } from '../../core/dsl.js';

export default {
  id: 'spring_3',
  act: 1, season: 'spring', day: 3,
  label: '봄 3일',
  title: '새벽 블랙',
  when: '봄 · 새벽',
  goal: '새벽 손님과 우체부 손님을 만나요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  diary: '새벽 여섯 시. 불 꺼진 카페 앞에 강 씨가 서 있었다. 사장님이 손으로 커피를 내렸다. 도 씨는 서서 커피를 마신다.',
  script: [
    big('봄 · 3일', '새벽 블랙'),
    bg('harbor', 'dawn'),
    amb('street'),
    place('봄 새벽 05:50', '항구 앞'),
    show({ center: 'jieun:normal' }),
    narr('바다가 아직 짙은 파란색이다. 항구에서는 배 몇 척이 불을 켜고 그물을 싣는다.'),
    narr('어제 마감 때 사장님이 말했다. "내일은 여섯 시까지 와요. 새벽 손님이 있어요."'),
    think('해도 안 뜬 새벽에 커피를 마시러 오는 사람이 있구나. 누굴까.'),

    bg('cafe_front', 'morning'),
    fx('dark'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    respond('kang', 'spring_dawn'),
    fx('dark', false),

    bg('hall', 'morning'),
    amb('cafe'),
    bgm('morning'),
    show({ left: 'jieun:normal', center: 'kang:normal', right: 'owner:normal' }),
    narr('원두 봉지를 든 사장님이 뒷방에서 나온다.'),
    say('owner', 'normal', '강 씨, 오셨어요.'),
    say('kang', 'normal', '…블랙.'),
    say('owner', 'normal', '지은 씨, 강 씨는 어부예요. 서른 해 동안 배가 나가기 전에 여기서 한 잔을 마셔요.'),
    say('owner', 'normal', '새벽 블랙은 기계 말고 손으로 내려요. 내리는 건 내가 할게요.'),
    say('owner', 'normal', '지은 씨는 도구만 좀 챙겨 줘요. 그리고 옆에서 잘 봐요.'), // 학생은 컵 · 원두 · 물을 챙기고, 손 동작은 사장님의 손(쉬움 = 보기, 2026-11-01 사용자)
    mini('brew', {
      id: 'spring_3_kang', title: '새벽 블랙(사장님의 손 보기)', level: 'easy', maker: 'owner', // 고른 도구가 다르면 사장님이 만들기 전에 일러 줌
      book: ['warm_milk', 'americano', 'hand_drip'],
      orders: [
        { who: 'kang', say: '…블랙.', menu: 'hand_drip', togo: false, thanks: '…좋네.' },
      ],
    }),
    say('owner', 'normal', '원두를 갈고, 물이 끓기를 기다리고, 뜸을 들이고. 하나도 건너뛰면 안 돼요.'),
    say('owner', 'normal', '기다리는 시간도 커피예요. 서두르면 맛이 먼저 알아요.'),
    narr('강 씨는 뒤쪽 테이블에 앉아, 잔을 두 손으로 감싸고 한참 동안 창 너머 바다를 본다.'),
    narr('배가 나갈 시간이 되자, 강 씨는 빈 잔을 카운터에 두고 말없이 항구로 내려간다.'),
    leave('kang'),
    sfx('door'),

    // 여는 때 둘러보기: 숨은 장면 2(알림 없음)
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '다음 손님이 오기 전에 가게를 한 번 둘러봐요. 아침마다 조금씩 달라요.'),
    mini('lookaround', {
      id: 'spring_3_look', title: '여는 때 둘러보기', bg: ['hall', 'morning'],
      spots: [
        { name: '컵 선반', icon: 'cup', x: 92, y: 44, seen: 2, lines: ['컵들이 어제보다 한 칸 아래에 놓여 있다. 까치발을 하지 않아도 손이 닿는다.', { t: 'think', text: '어제는 까치발을 했는데. 밤사이에 누가 옮겨 두었을까.' }] },
        { name: '뒤쪽 테이블', icon: 'chair', x: 36, y: 63, lines: ['강 씨가 앉았던 자리다. 여기서도 창 너머로 항구가 보인다.', { t: 'think', text: '강 씨는 배가 나가기 전에, 꼭 바다부터 보시는구나.' }] },
        { name: '칠판', icon: 'memo', x: 83, y: 32, lines: ['오늘의 메뉴가 적혀 있다. 맨 위에 "새벽 블랙"이 있다.', { t: 'think', text: '메뉴판 맨 위에 둘 만큼, 오래된 손님이구나.' }] },
        { name: '창문', icon: 'window', x: 12, y: 30, lines: ['창밖으로 배들이 줄지어 바다로 나간다. 물결이 햇빛에 반짝인다.'] },
      ],
    }),

    // 우체부 도 씨
    sfx('bell'),
    narr('아침 여덟 시 반, 종이 딸랑 울린다.'),
    show({ left: 'jieun:normal', right: 'do:smile' }),
    narr('커다란 우편 가방을 멘 아저씨가 들어온다. 가방이 무거워서 어깨가 한쪽으로 기울어 있다.'),
    say('do', 'smile', '우편이요! 아, 새 사람이 왔네요, 반가워요.'),
    say('owner', 'normal', '도 씨예요. 서른 해 동안 이 골목의 편지를 다 나른 우체부예요.'),
    say('do', 'smile', '아이스 아메리카노 하나 줘요. 오늘도 갈 데가 많아요.'),
    mini('brew', {
      id: 'spring_3_do', title: '도 씨의 아이스 아메리카노', level: 'normal',
      orders: [
        { who: 'do', say: '아이스 아메리카노 하나요.', menu: 'americano', temp: 'iced', togo: false, ask: ['togo'], reply: { togo: '여기서요. 서서 금방 마시고 갈게요.' }, thanks: '캬, 시원하다. 고마워요.' },
      ],
    }),
    show({ left: 'jieun:normal', right: 'do:smile' }),
    respond('do', 'spring_stand'),
    leave('do'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '도 씨는 서른 해 동안 여기서 한 번도 안 앉았어요.'),
    say('jieun', 'surprised', '서른 해 동안 서서요? 무거운 가방을 메고, 다리가 아프지 않으실까요.'),
    say('owner', 'normal', '사람마다 앉는 때가 있어요. 그때까지는, 앉을 자리만 비워 두면 돼요.'),
    motion('owner', 'nod'),
    think('오늘 만난 두 분은 모두 말이 적었다. 그 대신 눈과 손이 많은 것을 말해 주었다.'),
    end(),
  ],
};
