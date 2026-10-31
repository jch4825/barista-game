/**
 * 가을 1일 · 노란 잎: 새벽, "오늘부터 강 씨 블랙은 지은 씨가 내려요"(지은의 첫 핸드드립) → 창밖의 노란 잎을 보는 지안(대응 J3, 고른 것에 따라 음료)
 * → 우유가 한 잔뿐인 날의 해순 할머니(대응 H3) → 마감, 사장님은 잔을 두 손으로 든다
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, cg, mini, respond, onlyIf, term, motion, face, end } from '../../core/dsl.js';

const AUTUMN_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa'];

export default {
  id: 'autumn_1',
  act: 3, season: 'autumn', day: 1,
  label: '가을 1일',
  title: '노란 잎',
  when: '가을 · 새벽',
  goal: '말 대신 행동으로 보이는 마음을 알아채요.',
  schedule: [],
  skills: [],
  standards: ['[12진로03-02]', '[12진로04-05]'],
  diary: '처음으로 강 씨의 블랙을 내 손으로 내렸다. 지안 씨는 창밖의 노란 잎을 보았다. 우유가 한 잔뿐인 날, 할머니는 서두르지 않았다.',
  script: [
    big('가을 · 1일', '노란 잎'),
    bg('hall', 'autumn'),
    amb('cafe'),
    bgm('morning'),
    place('가을 새벽 06:00', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    narr('창밖의 은행나무가 노랗게 물들었다.'),
    say('owner', 'normal', '지은 씨. 오늘부터 강 씨 블랙은 지은 씨가 내려요.'),
    say('jieun', 'surprised', '제가요? 사장님이 늘 하셨잖아요.'),
    say('owner', 'normal', '지금은 지은 씨 손이 더 정확해요.'),
    narr('사장님이 앞치마 주머니에 손을 넣는다.'),
    cg('autumn_first_drip'),
    think('천천히. 사장님이 하던 대로. 갈고, 기다리고, 뜸 들이고.'),
    term('handdrip'),
    cg(null),
    show({ left: 'jieun:determined', right: 'kang:normal' }),
    sfx('bell'),
    say('kang', 'normal', '…블랙.'),
    mini('brew', {
      id: 'autumn_1_kang', title: '처음 내리는 새벽 블랙', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'kang', say: '…블랙.', menu: 'hand_drip', togo: false, thanks: '…괜찮네.' }],
    }),
    narr('강 씨가 한 모금 마시고, 사장님을 한 번 본다.'),
    narr('사장님이 작게 고개를 끄덕인다.'),
    think('{{뜸}}을 들일 때, 사장님이 왜 기다리는 것도 커피라고 했는지 알 것 같다.'),
    term('bloom'),
    leave('kang'),

    // 오전: 지안
    place('가을 오전 10:00', '바닷가 마을 카페'),
    bgm('cafe'),
    show({ left: 'jieun:normal', right: 'jian:normal' }),
    respond('jian', 'autumn_leaves'),
    ...onlyIf({ pick: 'jian.autumn_leaves=ask_color' },
      mini('brew', {
        id: 'autumn_1_jian_yellow', title: '창밖과 같은 노란색', level: 'normal', book: AUTUMN_BOOK,
        orders: [{ who: 'jian', say: '노란색이요. 유자차 주세요.', menu: 'yuja_tea', temp: 'hot', togo: false, ask: ['temp'], reply: { temp: '따뜻하게요.' }, thanks: '창밖이랑 같은 색이다. 고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.autumn_leaves=recommend_cocoa' },
      mini('brew', {
        id: 'autumn_1_jian_cocoa', title: '따뜻한 코코아', level: 'normal', book: AUTUMN_BOOK,
        orders: [{ who: 'jian', say: '코코아요. 따뜻하게요.', menu: 'cocoa', temp: 'hot', togo: false, thanks: '고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.autumn_leaves=wait_silent' },
      mini('brew', {
        id: 'autumn_1_jian_americano', title: '아메리카노', level: 'normal', book: AUTUMN_BOOK,
        orders: [{ who: 'jian', say: '…아메리카노요.', menu: 'americano', temp: 'hot', togo: false, ask: ['temp'], reply: { temp: '따뜻한 걸로요.' }, thanks: '…고마워요.' }],
      }),
    ),
    leave('jian'),

    // 해순 할머니: 우유가 한 잔뿐인 날
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    sfx('bell'),
    respond('haesun', 'autumn_one_milk'),
    narr('오후에 우유 배달이 왔다. 냉장고가 다시 가득 찬다.'),
    leave('haesun'),

    bg('hall', 'evening'),
    bgm('warm'),
    place('가을 저녁 19:00', '마감'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    narr('사장님이 마감 우유를 든다. 오늘은 처음부터 두 손이다.'),
    face('jieun', 'think'),
    think('봄에는 한 손으로 드셨는데.'),
    say('owner', 'normal', '강 씨 블랙, 좋았어요.'),
    say('jieun', 'smile', '고맙습니다.'),
    motion('owner', 'nod'),
    end(),
  ],
};
