/**
 * 여름 6일 · 골목 끝까지(여름의 폭발 사건, PRD 5.5): 줄이 골목 끝까지 섬 → 단골이 들어오지 못함, 관광객이 할머니 의자에서 사진
 * → 우유가 떨어짐(도움 요청: 'summer_help') → "저 직원 말고 사장님이 해 주세요" → "오늘의 커피는 저 친구가 내립니다"(숨은 장면 6)
 * → 사장님이 컵을 흘리고 손을 주머니에 넣음 → 선택 'summer_line': 줄을 계속 처리한다(queue) / 단골 컵을 따로 둔다(regulars)
 * → 비, 처마 밑의 수민(대응 S2) → 사장님이 칠판에 "7시 전은 동네 시간"(숨은 장면 8, 선택마다 앞의 한 줄이 다름)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, chalk, mini, respond, choose, opt, branch, seen, motion, face, emote, fx, end } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_6',
  act: 2, season: 'summer', day: 6,
  label: '여름 6일',
  title: '골목 끝까지',
  when: '여름 · 아침',
  goal: '아주 바쁜 날, 누구를 먼저 생각할지 골라요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-04]', '[12진로04-05]', '[12진로04-01]'],
  costume: { customer: 'sporty' },
  diary: '줄이 골목 끝까지 섰다. 단골들은 들어오지 못했다. 사장님이 칠판에 썼다. "7시 전은 동네 시간."',
  script: [
    big('여름 · 6일', '골목 끝까지'),
    bg('alley', 'morning'),
    amb('crowd'),
    bgm('tension'),
    place('여름 아침 06:30', '카페 앞 골목'),
    cg('summer_line'),
    narr('주말 아침. 문을 열기도 전에 줄이 서 있다.'),
    narr('줄이 골목 끝까지 이어진다.'),
    cg(null),
    bg('hall', 'busy_summer'),
    show({ left: 'jieun:nervous', right: 'owner:normal' }),
    say('owner', 'normal', '열어요.'),
    sfx('door'),
    mini('brew', {
      id: 'summer_6_rush', title: '골목 끝까지 선 줄', level: 'normal', quit: true, book: SUMMER_BOOK,
      orders: [
        { who: 'customer', say: '아아 두 잔이요! 가져갈게요.', menu: 'americano', temp: 'iced', togo: true },
        { who: 'customer', say: '아아 하나 더요.', menu: 'americano', temp: 'iced', togo: true },
        { who: 'customer', say: '라테 하나요. 사진 찍고 마실 거예요.', menu: 'latte', temp: 'iced', togo: false, ask: ['temp'], reply: { temp: '당연히 아이스죠.' } },
        { who: 'customer', say: '딸기우유요. 가져갈게요.', menu: 'strawberry_milk', temp: 'iced', togo: true },
      ],
    }),

    // 들어오지 못한 단골들
    narr('창밖에 해순 할머니가 보인다. 줄 끝에 서 있다가, 천천히 돌아간다.'),
    narr('도 씨는 가게 앞을 지나간다. 문 옆의 못을 한 번 보고.'),
    narr('창가에서는 관광객이 할머니의 빈 의자에 앉아 사진을 찍는다.'),
    face('jieun', 'sad'),
    think('늘 오던 사람들이 들어오지 못한다.'),

    // 우유가 떨어짐: 도움 요청
    narr('우유병이 텅 비었다. 냉장고에도 없다.'),
    emote('jieun', 'sweat'),
    choose({
      id: 'summer_help', flag: 'summer_help', q: '우유가 떨어졌다. 어떻게 할까?', who: 'jieun',
      options: [
        opt('speech', '사장님께 "우유가 떨어졌어요." 하고 말한다.', 'ask', {
          then: [
            say('jieun', 'nervous', '사장님, 우유가 떨어졌어요.'),
            say('owner', 'smile', '말해 줘서 고마워요.'),
            narr('사장님이 어딘가에 전화를 건다. 잠시 뒤 노 씨가 우유 상자를 들고 뒷문으로 온다.'),
            say('noh', 'normal', '마트 앞에서 마침 만났지. 받아.'),
          ],
        }),
        opt('run', '혼자 해결하려고 우유를 사러 뛰어나간다.', 'run', {
          then: [
            narr('앞치마를 벗고 문으로 뛰어간다.'),
            say('owner', 'normal', '지은 씨.'),
            narr('사장님이 나를 부른다. 큰 소리가 아니다.'),
            say('owner', 'normal', '가게는 같이 하는 거예요. 다음엔 말해 줘요.'),
            narr('사장님이 전화를 건다. 잠시 뒤 노 씨가 우유 상자를 들고 뒷문으로 온다.'),
            say('noh', 'normal', '마트 앞에서 마침 만났지. 받아.'),
          ],
        }),
      ],
    }),

    // 숨은 장면 6: "오늘의 커피는 저 친구가 내립니다"
    show({ left: 'jieun:nervous', center: 'customer:normal', right: 'owner:normal' }),
    say('customer', 'normal', '저기요. 저 직원 말고, 사장님이 해 주세요.'),
    say('customer', 'normal', '사장님 커피 마시러 왔거든요.'),
    narr('사장님이 앞치마 주머니에서 손을 꺼낸다.'),
    say('owner', 'normal', '오늘의 커피는 저 친구가 내립니다.'),
    seen(6),
    narr('손님이 나를 본다. 사장님은 더 말하지 않는다.'),
    think('저 친구. 사장님이 나를 그렇게 불렀다.'),
    mini('brew', {
      id: 'summer_6_doubt', title: '오늘의 커피', level: 'normal', book: SUMMER_BOOK,
      orders: [{ who: 'customer', say: '그럼… 따뜻한 라테요. 여기서요.', menu: 'latte', temp: 'hot', togo: false, thanks: '…어, 맛있네요. 미안해요.' }],
    }),

    // 사장님이 컵을 흘림
    sfx('spill'),
    cg('owner_pocket'),
    narr('사장님이 들던 컵이 기울었다. 커피가 카운터에 흘렀다.'),
    narr('사장님은 말없이 행주로 닦고, 손을 주머니에 넣는다.'),
    say('owner', 'normal', '…괜찮아요.'),
    cg(null),
    think('요즘 사장님은 말이 줄었다. 손을 자주 주머니에 넣는다.'),

    // 선택: 줄 / 단골
    narr('오후가 되어도 줄은 줄지 않는다.'),
    narr('창밖에 해순 할머니가 또 보인다. 이번엔 줄 맨 끝이다.'),
    choose({
      id: 'summer_line', flag: 'summer_line', q: '어떻게 할까?', who: 'jieun',
      options: [
        opt('team', '줄을 계속 처리한다. 순서대로 빨리 만든다.', 'queue', {
          then: [
            narr('나는 줄 선 손님의 잔을 순서대로 만든다.'),
            narr('해순 할머니는 한참 기다리다, 고개를 끄덕이고 돌아간다.'),
            narr('강 씨도, 한 씨도, 오늘은 오지 않았다.'),
          ],
        }),
        opt('cup', '단골의 평소 잔을 따로 만들어, 뒷문에서 건넨다.', 'regulars', {
          then: [
            narr('나는 할머니의 따뜻한 우유를 만들어 뒷문으로 나간다.'),
            say('haesun', 'smile', '아이고, 지은 씨. 바쁜데.'),
            narr('할머니가 뒷문 계단에 앉아 우유를 마신다. 빈 컵 하나는 옆에 둔다.'),
            narr('줄 선 관광객 몇 명이 투덜거린다. "왜 저 사람은 먼저 줘요?"'),
            say('owner', 'normal', '저분은 서른 해째 오시는 분입니다.'),
          ],
        }),
      ],
    }),

    // 저녁 비, 처마 밑의 수민
    place('여름 저녁 18:30', '비 오는 저녁'),
    bg('cafe_front', 'morning'),
    fx('dark'),
    amb('street'),
    sfx('water'),
    show({ left: 'jieun:normal', right: 'sumin:normal' }),
    respond('sumin', 'summer_rain'),
    fx('dark', false),

    // 마감: 숨은 장면 8 "7시 전은 동네 시간"
    bg('hall', 'evening'),
    amb('cafe'),
    bgm('warm'),
    place('여름 밤 20:30', '늦은 마감'),
    show({ left: 'jieun:sad', right: 'owner:normal' }),
    narr('손님이 다 갔다. 가게 안이 조용하다.'),
    narr('사장님이 선반의 컵들을 본다. 단골들의 잔이다.'),
    branch('summer_line', {
      queue: [narr('오늘 한 번도 쓰지 않은 잔들이 그대로 놓여 있다.'), say('owner', 'normal', '오늘은 줄이 이겼네요.')],
      regulars: [narr('뒷문으로 건넨 할머니의 잔이 깨끗이 씻겨 있다.'), say('owner', 'smile', '잘했어요. 할머니가 웃으셨어요.')],
    }),
    say('owner', 'normal', '지은 씨. 이 가게는 원래 동네 사람들 거예요.'),
    narr('사장님이 분필을 든다. 칠판 맨 위에 천천히 쓴다.'),
    cg('summer_chalk_rule'),
    chalk('7시 전은\n동네 시간'),
    seen(8),
    narr('글씨가 조금 떨린다. 그래도 반듯하다.'),
    say('owner', 'normal', '내일부터 아침 7시 전에는 동네 사람만 받아요.'),
    say('owner', 'normal', '관광객은 7시부터. 늦게 와도 맛은 같아요.'),
    face('jieun', 'smile'),
    think('동네 시간. 할머니도, 강 씨도, 한 씨도 다시 올 수 있다.'),
    cg(null),
    motion('jieun', 'nod'),
    end(),
  ],
};
