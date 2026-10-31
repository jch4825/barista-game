/**
 * 봄 1일 · 첫 컵 (docs/story.md 4장): 도시 카페의 기억 → 저녁 버스로 바닷가 마을 → 문 닫은 카페와 혼자 우유를 마시는 사장님
 * → 따뜻한 우유 한 잔(첫 컵) → "나한테 한 잔 만들어 줘요"(커피 만들기 첫 연습) → "느리네. …그래서 좋아요." → 뒷골목의 작은 방
 * 맥락: 지은이 왜 이 마을에 왔는지(구인 글의 "서두르지 않는 사람"), 왜 사장님이 지은을 받아 주는지(느림 = 정확함)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, info, cg, mini, meet, motion, face, end } from '../../core/dsl.js';

export default {
  id: 'spring_1',
  act: 1, season: 'spring', day: 1,
  label: '봄 1일',
  title: '첫 컵',
  when: '봄 · 저녁',
  goal: '바닷가 마을의 카페를 찾아가요.',
  schedule: [],
  skills: [],
  standards: ['[12진로01-02]', '[12진로03-02]'],
  diary: '버스를 세 시간 타고 바닷가 마을에 왔다. 사장님이 따뜻한 우유를 주었다. 느리다는 말이 처음으로 좋은 말로 들렸다.',
  script: [
    big('봄 · 1일', '첫 컵'),
    // 기억: 도시의 큰 카페
    bg('black'),
    cg('memory_city'),
    sfx('crowd_angry'),
    narr('도시의 큰 카페. 줄이 길다.'),
    say('customer', 'angry', '아직이에요? 빨리 좀 해 주세요!'),
    think('빨리. 더 빨리.'),
    sfx('spill'),
    narr('손이 떨렸다. 컵이 넘어졌다.'),
    think('나는 서두르면 꼭 쏟는다.'),
    think('그래서 그 카페를 그만두었다.'),
    cg(null),

    // 바닷가 마을 버스 종점
    bg('bus_terminal', 'evening'),
    sfx('bus'),
    bgm('home'),
    place('봄 저녁 18:40', '바닷가 마을 버스 종점'),
    show({ center: 'jieun:normal' }),
    narr('도시에서 버스를 세 시간 탔다. 바다 냄새가 난다.'),
    narr('버스 기사님이 시계를 한 번 보고 문을 열어 준다.'),
    think('여기가 그 마을이구나.'),
    info('구인 글', '바닷가 마을 카페에서 함께 일할 사람을 찾습니다. 서두르지 않는 사람이면 좋겠습니다.', 'memo'),
    think('서두르지 않는 사람.'),
    think('그 한 줄 때문에 여기까지 왔다.'),

    // 골목 끝의 카페
    bg('title_cafe', 'dusk'),
    amb('street'),
    place('봄 저녁 19:10', '골목 끝의 카페'),
    show({ center: 'jieun:normal' }),
    narr('골목 끝에 작은 카페가 있다. 간판에는 아무 글자도 없다.'),
    narr('문에 "오늘 영업 끝" 팻말이 걸려 있다.'),
    think('벌써 닫았구나. 내일 다시 올까.'),
    narr('창 너머로 할아버지 한 분이 보인다. 혼자 하얀 잔을 들고 있다.'),
    sfx('door'),
    show({ left: 'jieun:nervous', right: 'owner:normal' }),
    say('owner', 'normal', '…추운데, 들어와요.'),

    // 카페 안
    bg('hall', 'evening'),
    amb('cafe'),
    show({ left: 'jieun:nervous', right: 'owner:normal' }),
    say('owner', 'normal', '그 글 보고 왔어요?'),
    say('jieun', 'nervous', '네. 바리스타 일을 하고 싶어서요.'),
    say('jieun', 'sad', '그런데… 저는 손이 느려요. 서두르면 쏟아요.'),
    think('처음부터 말해 버렸다.'),
    narr('사장님이 아무 말 없이 우유를 데운다.'),
    sfx('steam'),
    cg('spring_first_cup'),
    say('owner', 'normal', '일단 마셔요. 손이 차네.'),
    narr('하얀 잔이 따뜻하다. 우유 냄새가 난다.'),
    think('따뜻하다.'),
    cg(null),
    say('owner', 'normal', '이번엔 나한테 한 잔 만들어 줘요.'),
    say('owner', 'normal', '따뜻한 우유. 천천히.'),
    mini('brew', {
      id: 'spring_1_test', title: '사장님의 따뜻한 우유', level: 'normal',
      book: ['warm_milk'],
      orders: [
        { who: 'owner', say: '따뜻한 우유 한 잔. 여기서 마실게요.', menu: 'warm_milk', temp: 'hot', togo: false, thanks: '…따뜻하네.' },
      ],
    }),
    narr('사장님이 잔을 들고 오래 바라본다.'),
    say('owner', 'normal', '…느리네.'),
    face('jieun', 'sad'),
    think('역시 안 되는구나.'),
    say('owner', 'smile', '그래서 좋아요. 우유는 서두르면 끓어 넘쳐요.'),
    say('owner', 'normal', '내일 아침 여덟 시에 와요.'),
    say('jieun', 'surprised', '네? 저… 일해도 돼요?'),
    motion('owner', 'nod'),
    narr('사장님이 고개를 한 번 끄덕인다.'),
    say('owner', 'normal', '뒷골목에 빈방이 하나 있어요. 오래 비어 있었어요.'),
    say('owner', 'normal', '오늘은 거기서 자요. 바다 소리가 좀 커요.'),
    meet('owner'),

    // 뒷골목의 작은 방
    bg('jieun_room', 'night'),
    amb('home'),
    bgm('warm'),
    place('봄 밤 22:00', '뒷골목의 작은 방'),
    show({ center: 'jieun:smile' }),
    narr('창문으로 바다 소리가 들린다.'),
    think('오늘 처음으로, 느리다는 말이 좋은 말로 들렸다.'),
    think('내일은 여덟 시. 천천히, 정확하게.'),
    meet('jieun'),
    end(),
  ],
};
