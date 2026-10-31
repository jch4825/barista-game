/**
 * 가을 4일 · 축제(가을의 폭발 사건, PRD 5.5: 위기 넷이 겹침): 주문 폭주 → 느린 손이 처음으로 약점이 됨
 * → 사장님이 손님들 앞에서 컵을 놓침 → 지은: "컵은… 깨지라고 있대요."(봄 2일의 말을 돌려줌) → 머신이 멈춤(손으로 하는 음료만)
 * → 단골들은 돕지 않고 평소 주문을 함. 평소가 위로가 됨 → 마감, 열쇠: "내일은 네가 연다. 손님은 평소대로 온다."(숨은 장면 9)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, fx, mini, seen, motion, face, emote, end } from '../../core/dsl.js';

const AUTUMN_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa'];

export default {
  id: 'autumn_4',
  act: 3, season: 'autumn', day: 4,
  label: '가을 4일',
  title: '축제',
  when: '가을 · 낮',
  goal: '일이 한꺼번에 몰려도, 아는 것부터 하나씩 해요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-04]', '[12진로04-01]', '[12진로01-03]'],
  costume: { customer: 'stripe' },
  diary: '축제 날, 모든 게 한꺼번에 왔다. 사장님이 컵을 놓쳤고, 머신이 멈췄다. 마감 때 사장님이 열쇠를 주셨다. "내일은 네가 연다."',
  script: [
    big('가을 · 4일', '축제'),
    bg('festival_alley', 'autumn'),
    amb('crowd'),
    bgm('peak'),
    place('가을 낮 11:00', '마을 축제'),
    cg('festival_rush'),
    narr('마을 축제 날. 골목에 깃발과 천막이 가득하다.'),
    narr('카페 앞에도 줄이 선다. 여름보다 길다.'),
    cg(null),

    bg('hall', 'autumn'),
    show({ left: 'jieun:nervous', right: 'customer:normal' }),
    mini('brew', {
      id: 'autumn_4_rush', title: '축제 손님', level: 'normal', quit: true, book: AUTUMN_BOOK,
      orders: [
        { who: 'customer', say: '아아 두 잔이요! 가져갈게요.', menu: 'americano', temp: 'iced', togo: true },
        { who: 'customer', say: '아아 하나 더요.', menu: 'americano', temp: 'iced', togo: true },
        { who: 'customer', say: '따뜻한 유자차요. 가져갈게요.', menu: 'yuja_tea', temp: 'hot', togo: true },
      ],
    }),
    show({ left: 'jieun:nervous', center: 'customer:angry', right: 'geum:normal' }),
    say('customer', 'angry', '왜 이렇게 느려요? 축제 끝나겠네!'),
    narr('줄이 점점 길어진다. 내 손은 빨라지지 않는다.'),
    think('천천히, 정확하게. 오늘은 그게 약점이 된다.'),
    emote('jieun', 'sweat'),
    narr('줄 가운데 금 씨가 보인다. 오늘은 재촉하지 않는다. 시계만 본다.'),

    // 사장님이 컵을 놓침
    enter('right', 'owner:normal'),
    narr('사장님이 거들려고 컵을 집는다.'),
    sfx('glass_break'),
    fx('shake'),
    cg('owner_drop'),
    narr('쨍그랑. 컵이 사장님 손에서 미끄러졌다.'),
    narr('가게 안이 갑자기 조용해진다. 사람들이 사장님 손을 본다.'),
    narr('사장님이 떨리는 손을 앞치마 뒤로 숨긴다.'),
    cg(null),
    show({ left: 'jieun:normal', right: 'owner:think' }),
    narr('나는 빗자루를 들고 사장님께 간다.'),
    say('jieun', 'normal', '사장님. 컵은… 깨지라고 있대요.'),
    narr('사장님이 나를 본다. 그리고 아주 작게 웃는다.'),
    say('owner', 'smile', '…그렇지.'),
    say('jieun', 'determined', '쓸고, 천천히 다시 할게요.'),

    // 머신이 멈춤
    sfx('tick_fast'),
    cg('machine_stop'),
    narr('그때, 에스프레소 머신이 툭 하고 꺼진다. 불도 몇 개 꺼진다.'),
    narr('축제 천막에서 전기를 많이 써서, 차단기가 내려갔다고 한다.'),
    cg(null),
    say('owner', 'normal', '머신은 안 돼요. 손으로 하는 것만 해요.'),
    say('owner', 'normal', '따뜻한 우유, 유자차, 핸드드립.'),
    think('에스프레소가 없다. 줄은 그대로다.'),

    // 단골들은 평소 주문을 함 — 평소가 위로가 됨
    bgm('warm'),
    show({ left: 'jieun:nervous', right: 'haesun:normal' }),
    narr('줄 사이로 해순 할머니가 들어온다. 늘 오던 시간이다.'),
    say('haesun', 'normal', '지은 씨, 늘 먹던 거요.'),
    narr('할머니는 줄도, 멈춘 머신도 보지 않는다. 창가에 앉아 기다린다.'),
    think('늘 먹던 거. 따뜻한 우유 두 잔. 그건 머신 없이도 만들 수 있다.'),
    mini('brew', {
      id: 'autumn_4_haesun', title: '머신 없이: 늘 먹던 거', level: 'normal', book: AUTUMN_BOOK,
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false },
      ],
    }),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    narr('강 씨가 줄 끝에서 손을 든다.'),
    say('kang', 'normal', '블랙. 천천히 해.'),
    mini('brew', {
      id: 'autumn_4_kang', title: '머신 없이: 블랙', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'kang', say: '블랙. 천천히 해.', menu: 'hand_drip', togo: false, thanks: '…그래, 이거지.' }],
    }),
    narr('평소의 주문이 하나씩 들어온다. 손이 다시 차분해진다.'),
    face('jieun', 'determined'),
    think('평소대로. 아는 것부터 하나씩.'),
    narr('저녁이 되자 전기가 돌아오고, 줄도 줄어든다.'),

    // 마감: 열쇠
    bg('hall', 'evening'),
    amb('cafe'),
    place('가을 밤 21:00', '축제가 끝난 밤'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    narr('손님이 모두 갔다. 골목에서 축제 음악이 멀어진다.'),
    say('owner', 'normal', '지은아.'),
    think('사장님이 처음으로 말을 놓으셨다.'),
    narr('사장님이 주머니에서 낡은 열쇠를 꺼낸다.'),
    cg('autumn_key'),
    say('owner', 'normal', '내일은 네가 연다.'),
    say('owner', 'normal', '손님은 평소대로 온다.'),
    seen(9),
    narr('열쇠가 손바닥 위에서 따뜻하다. 사장님 주머니에 오래 있었던 열쇠다.'),
    say('owner', 'normal', '손을 좀 쉬게 하려고. 겨울에 올게.'),
    say('jieun', 'nervous', '…네. 열게요.'),
    say('owner', 'smile', '컵 잘 닦고.'),
    cg(null),
    leave('owner'),
    sfx('door'),
    show({ center: 'jieun:normal' }),
    narr('사장님이 골목으로 걸어간다. 뒷모습이 조금 작아 보인다.'),
    think('내일은 내가 연다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
