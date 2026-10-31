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
    narr('바다가 아직 파랗다. 배 몇 척이 불을 켜고 있다.'),
    narr('어제 사장님이 말했다. 내일은 여섯 시에 오라고.'),
    think('새벽 손님이 있다고 했다. 누굴까.'),

    bg('cafe_front', 'morning'),
    fx('dark'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    respond('kang', 'spring_dawn'),
    fx('dark', false),

    bg('hall', 'morning'),
    amb('cafe'),
    bgm('morning'),
    show({ left: 'jieun:normal', center: 'kang:normal', right: 'owner:normal' }),
    narr('뒷방에서 사장님이 나온다.'),
    say('owner', 'normal', '강 씨, 오셨어요.'),
    say('kang', 'normal', '…블랙.'),
    say('owner', 'normal', '지은 씨, 강 씨는 어부예요. 서른 해 동안 배 나가기 전에 여기 와요.'),
    say('owner', 'normal', '새벽 블랙은 손으로 내려요. 오늘은 내가 하는 걸 잘 봐요.'),
    mini('brew', {
      id: 'spring_3_kang', title: '새벽 블랙(사장님의 손 보기)', level: 'easy',
      book: ['warm_milk', 'americano', 'hand_drip'],
      orders: [
        { who: 'kang', say: '…블랙.', menu: 'hand_drip', togo: false, thanks: '…좋네.' },
      ],
    }),
    say('owner', 'normal', '원두를 갈고, 물이 끓기를 기다리고, 뜸을 들이고.'),
    say('owner', 'normal', '기다리는 것도 커피예요.'),
    narr('강 씨가 창가에 앉아 바다를 본다. 한참 동안.'),
    leave('kang'),
    sfx('door'),

    // 여는 때 둘러보기: 숨은 장면 2(알림 없음)
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '손님이 더 오기 전에 한 번 둘러봐요.'),
    mini('lookaround', {
      id: 'spring_3_look', title: '여는 때 둘러보기', bg: ['hall', 'morning'],
      spots: [
        { name: '컵 선반', icon: 'cup', x: 92, y: 44, seen: 2, lines: ['컵들이 어제보다 한 칸 아래에 놓여 있다.', { t: 'think', text: '내 손이 딱 닿는 높이다. 누가 옮겼을까.' }] },
        { name: '창가 자리', icon: 'chair', x: 24, y: 60, lines: ['강 씨가 앉았던 자리다.', '여기서 항구가 제일 잘 보인다.'] },
        { name: '칠판', icon: 'memo', x: 83, y: 32, lines: ['오늘의 메뉴. 맨 위에 새벽 블랙이 적혀 있다.'] },
        { name: '창문', icon: 'window', x: 12, y: 30, lines: ['창밖으로 배들이 나가고 있다.', '물결이 반짝인다.'] },
      ],
    }),

    // 우체부 도 씨
    sfx('bell'),
    narr('종이 딸랑 울린다.'),
    show({ left: 'jieun:normal', right: 'do:smile' }),
    say('do', 'smile', '우편이요! 아, 새 사람이네.'),
    say('owner', 'normal', '도 씨예요. 우리 동네 우체부.'),
    say('do', 'smile', '아이스 아메리카노 하나 줘요.'),
    mini('brew', {
      id: 'spring_3_do', title: '도 씨의 아이스 아메리카노', level: 'normal',
      orders: [
        { who: 'do', say: '아이스 아메리카노 하나요.', menu: 'americano', temp: 'iced', togo: false, ask: ['togo'], reply: { togo: '여기서요. 서서 마시고 갈게요.' }, thanks: '캬, 시원하다. 고마워요.' },
      ],
    }),
    show({ left: 'jieun:normal', right: 'do:smile' }),
    respond('do', 'spring_stand'),
    leave('do'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '도 씨는 서른 해 동안 한 번도 안 앉았어요.'),
    think('서른 해 동안 서서. 다리가 아프지 않을까.'),
    say('owner', 'normal', '사람마다 앉는 때가 있어요.'),
    motion('owner', 'nod'),
    end(),
  ],
};
