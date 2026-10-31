/**
 * 봄 7일 · 이름(봄의 끝 장면, PRD 5.5): 벚꽃이 지는 날 → 도 씨와 해순 할머니의 '늘 먹던 거'
 * → 해순 할머니가 이름을 물음 → 나가며 "지은 씨, 내일 또 봐요." → 처음으로 마을에서 이름이 불림 → 봄의 끝
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, cg, mini, onlyIf, motion, face, end } from '../../core/dsl.js';

export default {
  id: 'spring_7',
  act: 1, season: 'spring', day: 7,
  label: '봄 7일',
  title: '이름',
  when: '봄 · 아침',
  goal: '단골의 평소 주문을 기억해서 만들어요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로05-04]'],
  diary: '벚꽃이 다 졌다. 해순 할머니가 처음으로 내 이름을 불렀다. "지은 씨, 내일 또 봐요."',
  script: [
    big('봄 · 7일', '이름'),
    bg('alley', 'morning'),
    amb('street'),
    bgm('morning'),
    place('봄 아침 07:55', '카페 가는 골목'),
    show({ center: 'jieun:normal' }),
    narr('골목에 벚꽃잎이 하얗게 깔려 있다.'),
    think('봄이 다 갔다. 이 마을에 온 지 일주일.'),

    bg('hall', 'spring'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'do:smile' }),
    sfx('bell'),
    say('do', 'smile', '우편이요! 늘 먹던 거 줘요.'),
    mini('brew', {
      id: 'spring_7_do', title: '도 씨의 늘 먹던 거', level: 'normal',
      orders: [
        { who: 'do', say: '늘 먹던 거요.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '이거지! 고마워요.' },
      ],
    }),
    ...onlyIf({ trust: { do: '>=2' } },
      narr('도 씨가 카운터 옆 의자를 한 번 본다. 의자 등에 손을 얹었다가 뗀다.'),
      say('do', 'smile', '허허. 아직은 서서 마실게요.'),
    ),
    ...onlyIf({ trust: { do: '<2' } },
      narr('도 씨가 서서 커피를 다 마시고, 가방을 고쳐 멘다.'),
    ),
    leave('do'),
    sfx('door'),

    // 해순 할머니: 이름
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    sfx('bell'),
    narr('해순 할머니가 들어와 창가에 앉는다.'),
    say('haesun', 'normal', '늘 먹던 거요.'),
    mini('brew', {
      id: 'spring_7_haesun', title: '해순 할머니의 늘 먹던 거', level: 'normal',
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false },
      ],
    }),
    mini('tray', { id: 'spring_7_tray', title: '창가로 가져가기', items: [{ icon: 'milk', name: '따뜻한 우유' }, { icon: 'milk', name: '따뜻한 우유' }], to: '창가 자리' }),
    narr('나는 한 잔을 할머니 앞에, 한 잔을 빈 의자 앞에 놓는다.'),
    say('haesun', 'normal', '새 사람. 이름이 뭐예요?'),
    say('jieun', 'nervous', '지은이에요.'),
    say('haesun', 'smile', '지은. 예쁜 이름이네.'),
    narr('할머니가 우유를 천천히 마신다. 창밖에 벚꽃잎이 떨어진다.'),
    narr('한참 뒤, 할머니가 일어난다.'),
    cg('spring_name'),
    say('haesun', 'smile', '지은 씨, 내일 또 봐요.'),
    face('jieun', 'smile'),
    think('지은 씨.'),
    think('이 마을에서 처음으로, 누가 내 이름을 불러 주었다.'),
    cg(null),
    leave('haesun'),
    sfx('door'),

    bg('hall', 'evening'),
    bgm('warm'),
    place('봄 저녁 19:00', '봄의 마지막 마감'),
    show({ left: 'jieun:smile', right: 'owner:normal' }),
    say('owner', 'normal', '할머니가 이름을 부르셨죠.'),
    say('jieun', 'smile', '네. 들으셨어요?'),
    say('owner', 'smile', '할머니는 이름을 쉽게 안 불러요.'),
    say('owner', 'normal', '봄 동안 수고했어요. 내일부터 여름이에요.'),
    motion('jieun', 'bow'),
    end(),
  ],
};
