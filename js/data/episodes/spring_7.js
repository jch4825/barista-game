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
    narr('밤사이 바람이 불어서, 골목에 벚꽃잎이 하얗게 깔려 있다.'),
    think('이 마을에 온 지 일주일이다. 처음에는 골목도 헷갈렸는데, 이제는 카페 가는 길이 손에 익었다.'),

    bg('hall', 'spring'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'do:smile' }),
    sfx('bell'),
    say('do', 'smile', '우편이요! 오늘도 늘 먹던 거 줘요.'),
    think('늘 먹던 것. 도 씨는 비가 와도 아이스 아메리카노, 유리컵에 담아 서서 드신다.'),
    mini('brew', {
      id: 'spring_7_do', title: '도 씨의 늘 먹던 거', level: 'normal',
      orders: [
        { who: 'do', say: '늘 먹던 거요.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '이거지! 말 안 해도 아네요.' },
      ],
    }),
    ...onlyIf({ trust: { do: '>=2' } },
      narr('도 씨가 카운터 옆 의자를 한 번 본다. 의자 등에 손을 얹었다가, 머쓱하게 웃으며 뗀다.'),
      say('do', 'smile', '허허, 아직은 서서 마실게요. 그래도 의자가 거기 있으니 좋네요.'),
    ),
    ...onlyIf({ trust: { do: '<2' } },
      narr('도 씨는 서서 커피를 다 마시고, 무거운 가방을 고쳐 멘다.'),
      think('오늘도 서서 드셨다. 언젠가는 앉아서 쉬실 수 있으면 좋겠다.'),
    ),
    leave('do'),
    sfx('door'),

    // 해순 할머니: 이름
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    sfx('bell'),
    narr('해순 할머니가 들어와, 오늘도 아무 말 없이 창가에 앉는다.'),
    say('haesun', 'normal', '늘 먹던 거요.'),
    think('할머니의 늘 먹던 것은 따뜻한 우유 두 잔이다. 이제는 묻지 않아도 안다.'),
    mini('brew', {
      id: 'spring_7_haesun', title: '해순 할머니의 늘 먹던 거', level: 'normal',
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false, more: true },
      ],
    }),
    mini('tray', { id: 'spring_7_tray', title: '창가로 가져가기', items: [{ icon: 'milk', name: '따뜻한 우유' }, { icon: 'milk', name: '따뜻한 우유' }], to: '창가 자리' }),
    narr('나는 한 잔을 할머니 앞에, 한 잔을 빈 의자 앞에 놓는다.'),
    say('haesun', 'normal', '일주일 동안 매일 봤는데, 이름을 아직 몰랐네. 새 사람, 이름이 뭐예요?'),
    say('jieun', 'nervous', '지은이에요.'),
    say('haesun', 'smile', '지은, 예쁜 이름이네. 부르기도 좋고.'),
    narr('할머니는 우유를 천천히 마신다. 창밖에서 마지막 벚꽃잎이 떨어진다.'),
    narr('한참 뒤, 할머니가 빈 의자 앞의 잔을 한 번 보고 천천히 일어난다.'),
    cg('spring_name'),
    say('haesun', 'smile', '지은 씨, 내일 또 봐요.'),
    face('jieun', 'smile'),
    think('지은 씨. 이 마을에서 처음으로, 누군가 내 이름을 불러 주었다.'),
    think('도시 카페에서는 늘 "저기요"라고만 불렸다. 내 이름을 아는 손님은 한 명도 없었다.'),
    cg(null),
    leave('haesun'),
    sfx('door'),

    bg('hall', 'evening'),
    bgm('warm'),
    place('봄 저녁 19:00', '봄의 마지막 마감'),
    show({ left: 'jieun:smile', right: 'owner:normal' }),
    say('owner', 'normal', '아까 할머니가 이름을 부르셨죠.'),
    say('jieun', 'smile', '네. 사장님도 들으셨어요?'),
    say('owner', 'smile', '할머니는 이름을 쉽게 안 불러요. 일주일 동안 지은 씨를 지켜보신 거예요.'),
    say('owner', 'normal', '봄 동안 수고했어요. 이제 여름이 오면, 바다 보러 오는 손님들로 훨씬 바빠질 거예요.'),
    think('바빠지는 건 아직 무섭다. 그래도 이제 이 마을에는 내 이름을 불러 주는 사람이 있다.'),
    motion('jieun', 'bow'),
    end(),
  ],
};
