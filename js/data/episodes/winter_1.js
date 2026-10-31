/**
 * 겨울 1일 · 첫눈: 첫눈 새벽, 마을에 퍼진 "배를 팔았대" 소문 속의 강 씨(대응 K5) → 오후, 밤새 아기 곁을 지킨 은주(대응 E4)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, mini, respond, onlyIf, motion, face, end } from '../../core/dsl.js';

const WINTER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa', 'mix_coffee'];

export default {
  id: 'winter_1',
  act: 4, season: 'winter', day: 1,
  label: '겨울 1일',
  title: '첫눈',
  when: '겨울 · 새벽',
  goal: '소문보다 그 사람을 봐요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로03-02]'],
  diary: '첫눈이 왔다. 강 씨에 대한 소문을 들었지만 묻지 않았다. 은주 씨는 밤새 한숨도 못 잤다고 했다.',
  script: [
    big('겨울 · 1일', '첫눈'),
    bg('alley', 'morning'),
    amb('street'),
    bgm('morning'),
    place('겨울 새벽 05:45', '눈 내린 골목'),
    show({ center: 'jieun:normal' }),
    narr('밤사이 첫눈이 와서, 골목이 하얗게 덮였다.'),
    narr('아직 아무도 지나가지 않은 눈길에, 내가 첫 발자국을 낸다.'),
    think('사장님은 겨울에 오신다고 하셨다. 이제 정말 겨울이다.'),
    bg('hall', 'winter'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    sfx('bell'),
    respond('kang', 'winter_snow'),
    mini('brew', {
      id: 'winter_1_kang', title: '첫눈의 블랙', level: 'normal', book: WINTER_BOOK,
      orders: [{ who: 'kang', say: '블랙.', menu: 'hand_drip', togo: false, usual: true, thanks: '…좋네. 사장 맛이야.' }],
    }),
    narr('강 씨는 창가에 앉아, 배가 한 척 빠진 항구를 오래 본다.'),
    leave('kang'),

    // 오후: 은주
    place('겨울 오후 14:00', '눈 오는 오후'),
    bgm('warm'),
    show({ left: 'jieun:normal', right: 'eunju:sad' }),
    sfx('bell'),
    respond('eunju', 'winter_tired'),
    ...onlyIf({ pick: 'eunju.summer_cold=thick_cup' },
      mini('brew', {
        id: 'winter_1_eunju', title: '은주 씨의 늘 먹던 거', level: 'normal', book: WINTER_BOOK,
        orders: [{ who: 'eunju', say: '늘 먹던 거요. 오늘은 아주 따뜻하게요.', menu: 'decaf_latte', temp: 'hot', togo: false, usual: true, cup: 'thick', thanks: '…따뜻하다. 고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'eunju.summer_cold=reheat|take_baby|' },
      mini('brew', {
        id: 'winter_1_eunju_mug', title: '은주 씨의 늘 먹던 거', level: 'normal', book: WINTER_BOOK,
        orders: [{ who: 'eunju', say: '늘 먹던 거요. 오늘은 아주 따뜻하게요.', menu: 'decaf_latte', temp: 'hot', togo: false, usual: true, thanks: '…따뜻하다. 고마워요.' }],
      }),
    ),
    narr('은주 씨가 창가 자리에서 잠깐 눈을 붙인다. 유모차 속 아기도 새근새근 잔다.'),
    narr('나는 옆 탁자의 컵을 소리 나지 않게 치운다. 지금은 조용한 것이 가장 큰 도움이다.'),
    leave('eunju'),

    bg('hall', 'evening'),
    place('겨울 저녁 19:00', '마감'),
    show({ center: 'jieun:normal' }),
    narr('혼자 하는 마감이다. 창밖에는 눈이 그치지 않고 내린다.'),
    narr('사장님의 하얀 잔을 닦아서, 늘 놓던 자리에 둔다.'),
    face('jieun', 'think'),
    think('사장님은 잘 지내실까. 가을에 떠나신 뒤로 연락이 한 번도 없다.'),
    think('사장님은 원래 말이 적으시니까. 소식이 없는 것도 사장님다운 일이다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
