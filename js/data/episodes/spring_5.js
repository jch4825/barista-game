/**
 * 봄 5일 · 벚꽃 주간(봄의 폭발 사건, PRD 5.5): 골목에 드라마 촬영 → 매니저의 여러 잔 주문(사장님은 뒤에서 컵만 놓음: 숨은 장면 4)
 * → 배우가 해순 할머니의 자리에 앉으려 함 → 선택 'spring_seat': 지킨다(keep) / 내준다(give). 둘 다 실패가 아님
 * → 배우: "조용해서 좋네요." → 마감, 사장님의 잔이 아주 조금 흔들림 → 그날 밤 배우가 이 카페 사진을 올림(여름의 소문)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, choose, opt, branch, seen, motion, face, end } from '../../core/dsl.js';

export default {
  id: 'spring_5',
  act: 1, season: 'spring', day: 5,
  label: '봄 5일',
  title: '벚꽃 주간',
  when: '봄 · 오전',
  goal: '바쁜 날에도 단골의 자리를 생각해요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로04-04]'],
  diary: '벚꽃이 핀 날, 배우가 왔다. 할머니의 자리 앞에서 나는 선택을 했다. 사장님의 잔이 아주 조금 흔들렸다.',
  script: [
    big('봄 · 5일', '벚꽃 주간'),
    bg('alley', 'morning'),
    amb('crowd'),
    bgm('tension'),
    place('봄 오전 08:40', '벚꽃 핀 골목'),
    cg('spring_crew'),
    narr('벚꽃이 활짝 피었다. 골목에 촬영 팀이 왔다.'),
    narr('드라마를 찍는다고 한다. 사람들이 구경하러 모여 있다.'),
    cg(null),

    bg('hall', 'spring'),
    show({ left: 'jieun:nervous', right: 'agent:normal' }),
    narr('헤드셋을 쓴 사람이 급하게 들어온다.'),
    say('agent', 'normal', '배우님 쉬는 시간이에요. 커피 여러 잔 부탁해요!'),
    say('agent', 'normal', '아아 둘, 아이스 라테 하나요. 다 가져갈 거예요.'),
    narr('사장님은 주문을 받지 않는다. 내 뒤에서 빈 컵만 하나씩 꺼내 놓는다.'),
    seen(4),
    think('사장님이 컵을 놓아 주신다. 나는 만들기만 하면 된다.'),
    mini('brew', {
      id: 'spring_5_crew', title: '촬영 팀 주문', level: 'normal', quit: true,
      book: ['warm_milk', 'americano', 'latte', 'hand_drip'],
      orders: [
        { who: 'agent', say: '아아 하나요. 가져갈게요.', menu: 'americano', temp: 'iced', togo: true },
        { who: 'agent', say: '아아 하나 더요.', menu: 'americano', temp: 'iced', togo: true },
        { who: 'agent', say: '라테는 차갑게요. 이것도 가져가요.', menu: 'latte', temp: 'iced', togo: true, thanks: '와, 빠르다. 고마워요!' },
      ],
    }),

    // 배우가 할머니의 자리에
    show({ left: 'jieun:normal', center: 'actor:normal', right: 'agent:normal' }),
    narr('선글라스를 쓴 사람이 들어온다. 사람들이 숨을 죽인다.'),
    say('agent', 'normal', '배우님, 조용한 자리 찾으셨죠? 저기 창가요.'),
    narr('배우가 창가로 간다. 해순 할머니가 늘 앉는 자리다.'),
    narr('배우가 할머니 옆의 빈 의자를 끌어당긴다.'),
    think('곧 할머니가 오실 시간이다. 저 의자는 늘 비워 두는 의자다.'),
    choose({
      id: 'spring_seat', flag: 'spring_seat', q: '어떻게 할까?', who: 'jieun',
      options: [
        opt('chair', '"그 자리는 늘 오시는 분 자리예요." 하고 다른 자리를 안내한다.', 'keep', {
          then: [
            say('jieun', 'nervous', '죄송해요. 그 자리는 늘 오시는 분이 앉으세요.'),
            say('jieun', 'normal', '저쪽 창가도 조용해요. 벚꽃이 더 잘 보여요.'),
            say('agent', 'angry', '배우님이 앉으신다는데요?'),
            enter('right', 'owner:strict'),
            say('owner', 'strict', '그 자리는 예약이 있습니다.'),
            narr('사장님 목소리는 크지 않다. 그런데 아무도 더 말하지 않는다.'),
            say('actor', 'smile', '괜찮아요. 저쪽이 좋겠네요.'),
            say('actor', 'smile', '자리를 지키는 가게네요.'),
            sfx('bell'),
            narr('해순 할머니가 들어와, 늘 앉는 자리에 앉는다.'),
            narr('할머니가 나를 보고 작게 고개를 끄덕인다.'),
          ],
        }),
        opt('greet', '배우가 그 자리에 앉게 둔다.', 'give', {
          then: [
            narr('배우가 빈 의자에 앉는다.'),
            sfx('bell'),
            narr('해순 할머니가 들어온다. 창가를 보고 걸음을 멈춘다.'),
            narr('할머니는 아무 말 없이, 서서 기다린다.'),
            narr('배우가 할머니를 본다. 탁자 위의 우유 자국과 빈 의자를 본다.'),
            say('actor', 'surprised', '할머니 자리였군요. 죄송해요.'),
            narr('배우가 일어나 의자를 할머니께 돌려 드린다.'),
            say('haesun', 'smile', '아이고, 괜찮아요.'),
            narr('할머니가 자리에 앉는다. 배우는 저쪽 창가로 간다.'),
          ],
        }),
      ],
    }),
    show({ left: 'jieun:normal', right: 'haesun:normal' }),
    say('haesun', 'normal', '늘 먹던 거요.'),
    think('늘 먹던 것. 따뜻한 우유 두 잔이다.'),
    mini('brew', {
      id: 'spring_5_haesun', title: '늘 먹던 거요', level: 'normal',
      orders: [
        { who: 'haesun', say: '늘 먹던 거요.', menu: 'warm_milk', temp: 'hot', togo: false, usual: true },
        { who: 'haesun', say: '한 잔 더, 똑같이.', menu: 'warm_milk', temp: 'hot', togo: false },
      ],
    }),

    show({ left: 'jieun:normal', center: 'actor:smile', right: 'agent:normal' }),
    cg('actor_quiet'),
    narr('배우가 창밖의 벚꽃을 한참 본다. 커피가 다 식을 때까지.'),
    say('actor', 'smile', '여기, 조용해서 좋네요.'),
    cg(null),
    leave('actor'),
    leave('agent'),
    sfx('door'),
    narr('촬영 팀이 떠난다. 골목이 다시 조용해진다.'),

    // 마감: 아주 조금 흔들린 잔
    bg('hall', 'evening'),
    amb('cafe'),
    bgm('warm'),
    place('봄 저녁 19:10', '마감'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    branch('spring_seat', {
      keep: [say('owner', 'normal', '아까, 자리 지킨 거.'), say('owner', 'smile', '…잘했어요.')],
      give: [say('owner', 'normal', '아까, 배우가 일어난 거.'), say('owner', 'smile', '할머니가 기다려 줘서예요. 지은 씨도 잘 봤어요.')],
    }),
    cg('owner_cup_shake'),
    narr('사장님이 마감 우유를 든다. 잔이 아주 조금 흔들린다.'),
    narr('사장님은 잔을 두 손으로 잡는다.'),
    think('오늘 많이 바쁘셔서 피곤하신가 보다.'),
    cg(null),
    narr('그날 밤, 배우가 이 카페 사진을 올렸다고 한다.'),
    narr('"바닷가 마을의 조용한 카페." 사진 밑에 그렇게 적혀 있었다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
