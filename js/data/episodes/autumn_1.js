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
    narr('여름이 지나자 관광객이 줄었다. 창밖의 은행나무는 어느새 노랗게 물들었다.'),
    say('owner', 'normal', '지은 씨, 오늘부터 강 씨의 새벽 블랙은 지은 씨가 내려요.'),
    say('jieun', 'surprised', '제가요? 그건 사장님이 서른 해 동안 하신 일이잖아요.'),
    say('owner', 'normal', '지금은 지은 씨 손이 더 정확해요. 봄부터 옆에서 다 봤잖아요.'),
    narr('사장님은 그렇게 말하고, 두 손을 앞치마 주머니에 넣는다.'),
    cg('autumn_first_drip'),
    think('원두를 갈고, 물이 끓기를 기다리고, 뜸을 들이고, 세 번에 나눠 붓는다. 사장님이 하던 그대로 하자.'),
    term('handdrip'),
    cg(null),
    show({ left: 'jieun:determined', right: 'kang:normal' }),
    sfx('bell'),
    say('kang', 'normal', '…블랙.'),
    mini('brew', {
      id: 'autumn_1_kang', title: '처음 내리는 새벽 블랙', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'kang', say: '…블랙.', menu: 'hand_drip', togo: false, thanks: '…괜찮네.' }],
    }),
    narr('강 씨가 한 모금 마시고, 카운터 뒤의 사장님을 한 번 본다.'),
    narr('사장님이 작게 고개를 끄덕인다. 강 씨는 더 말하지 않고, 남은 커피를 천천히 마신다.'),
    think('{{뜸}}을 들이는 동안 손이 근질거렸다. 사장님이 왜 기다리는 것도 커피라고 하셨는지 이제 알 것 같다.'),
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
        orders: [{ who: 'jian', say: '노란색이요. 유자차 주세요.', menu: 'yuja_tea', temp: 'hot', togo: false, ask: ['temp'], reply: { temp: '이제 쌀쌀하니까, 따뜻하게요.' }, thanks: '창밖이랑 같은 색이다. 고마워요.' }],
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
        orders: [{ who: 'jian', say: '…아메리카노요.', menu: 'americano', temp: 'iced', togo: false, ask: ['temp'], reply: { temp: '…아이스로요.' }, thanks: '…고마워요.' }],
      }),
    ),
    leave('jian'),

    // 해순 할머니: 우유가 한 잔뿐인 날
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    sfx('bell'),
    respond('haesun', 'autumn_one_milk'),
    // 모두에게: 빈 의자의 주인(첫 실마리, 2026-11-01 사용자 '두 잔의 까닭이 서야 한다' → 검수 13.25)
    narr('할머니가 빈 의자 쪽을 보며, 혼잣말처럼 작게 말한다.'),
    say('haesun', 'normal', '여보, 오늘은 우유가 늦게 왔대요. 그래도 지은 씨가 따뜻하게 데워 줬어요.'),
    think('할머니가 빈 의자에게 "여보"라고 하셨다. 그 의자는 한 번도 오신 적 없는 할머니 남편분의 자리였구나.'),
    narr('오후 늦게 우유 배달이 왔다. 텅 비었던 냉장고가 다시 가득 찬다.'),
    leave('haesun'),

    bg('hall', 'evening'),
    bgm('warm'),
    place('가을 저녁 19:00', '마감'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    narr('사장님이 마감 우유를 든다. 오늘은 처음부터 두 손으로 잔을 감싼다.'),
    face('jieun', 'think'),
    think('봄에는 한 손으로 드셨는데. 언제부터 두 손으로 드셨을까.'),
    say('owner', 'normal', '강 씨 블랙, 좋았어요. 강 씨가 아무 말도 안 했다면, 그게 강 씨의 칭찬이에요.'),
    say('jieun', 'smile', '고맙습니다. 내일도 제가 내릴게요.'),
    motion('owner', 'nod'),
    end(),
  ],
};
