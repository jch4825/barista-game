/**
 * 가을 5일 · 혼자 여는 아침: 새벽, 처음으로 혼자 문을 엶(가게 열기: 혼자) → 단계에 따라 깊어지는 인사(해순 · 강 씨 2단계)
 * → 단골들의 '늘 먹던 거'(단골 수첩이 도구가 됨, PRD 5.5) → 도 씨의 퇴직 소식(대응 D4) → (도 씨 2단계) 서른 해 만에 앉음
 * → 오후, 수민이 떨어뜨린 대학 안내서(대응 S3)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, term, motion, face, end, info } from '../../core/dsl.js';

const AUTUMN_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa'];

export default {
  id: 'autumn_5',
  act: 3, season: 'autumn', day: 5,
  label: '가을 5일',
  title: '혼자 여는 아침',
  when: '가을 · 새벽',
  goal: '혼자서 가게를 열어요. 단골의 평소 주문이 도구가 돼요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-01]', '[12진로03-01]', '[12진로04-05]'],
  diary: '처음으로 혼자 문을 열었다. 손님들은 평소대로 왔다. 평소 주문을 기억한 것이 오늘 나를 도왔다.',
  script: [
    big('가을 · 5일', '혼자 여는 아침'),
    bg('alley', 'morning'),
    amb('street'),
    bgm('morning'),
    place('가을 새벽 05:40', '카페 가는 골목'),
    info('오늘의 칠판', '오늘은 혼자 문을 열어요.', 'menu'), // 재미 개편 Q-43: 오늘 하나 달라지는 것(미리 알고 시작)
    show({ center: 'jieun:nervous' }),
    narr('아직 어둡다. 걸으면서 주머니 속 열쇠를 몇 번이나 만져 본다.'),
    think('오늘은 사장님이 안 계신다. 무엇이 어디 있는지, 순서가 어떻게 되는지 머릿속으로 한 번 더 떠올린다.'),
    // 해순 할머니 2단계: 골목에서 먼저 인사하고 첫 손님이 되어 줌
    ...onlyIf({ trust: { haesun: '>=4' } },
      cg('haesun_alley_greet'),
      narr('골목 저쪽에서, 아침 산책을 하던 해순 할머니가 손을 흔든다.'),
      say('haesun', 'smile', '지은 씨, 오늘은 혼자 열어요? 사장님이 쉬러 가셨다면서요.'),
      say('haesun', 'smile', '그럼 오늘은 내가 첫 손님 할게요. 서두르지 말고 천천히 열어요.'),
      think('할머니가 먼저 인사해 주셨다. 봄에는 내 이름도 모르셨는데.'),
      cg(null),
    ),
    ...onlyIf({ trust: { haesun: '<4' } },
      narr('골목에는 아무도 없다. 파도 소리만 들린다.'),
    ),

    bg('cafe_front', 'morning'),
    cg('autumn_dawn_open'),
    narr('카페 문 앞에 선다. 열쇠를 넣고, 천천히 돌린다.'),
    cg(null),
    // 그 갈매기(웃음 줄기 3/4: 가을 — 단골처럼 앉아 기다림)
    narr('그런데 테라스 의자마다 갈매기가 한 마리씩 앉아 있다. 꼭 문 열기를 기다리는 단골들처럼.'),
    sfx('squawk'),
    think('…오늘은 손님이 일찍 왔네. 사장님 없이 여는 첫날인데, 혼자는 아니구나.'),
    mini('routine', { id: 'autumn_5_open', kind: 'alone', title: '혼자 여는 아침' }),

    // 강 씨
    bg('hall', 'autumn'),
    amb('cafe'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    sfx('bell'),
    ...onlyIf({ trust: { kang: '>=4' } },
      say('kang', 'smile', '불, 잘 켜 놨네.'),
      say('kang', 'normal', '사장은 손 쉬러 갔다며. 블랙은 천천히 해, 나는 기다릴 수 있어.'),
      think('강 씨가 먼저 말을 걸어 주셨다. "블랙" 말고 다른 말은 처음 들어 본다.'),
    ),
    ...onlyIf({ trust: { kang: '<4' } },
      say('kang', 'normal', '…블랙.'),
    ),
    mini('brew', {
      id: 'autumn_5_kang', title: '혼자 내리는 블랙', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'kang', say: '블랙.', menu: 'hand_drip', togo: false, usual: true, thanks: '…사장 맛이랑 같네.' }],
    }),
    leave('kang'),

    // 단골들의 늘 먹던 거: 수첩이 도구가 됨
    show({ left: 'jieun:normal', right: 'do:smile' }),
    sfx('bell'),
    narr('도 씨가 들어와, 문 옆 못에 가방을 건다.'),
    say('do', 'smile', '늘 먹던 거요. 사장님 없어도 되는 거죠?'),
    think('{{단골}}의 늘 먹던 것은 수첩의 단골 쪽에 적어 두었다. 헷갈리면 수첩을 펴 보면 된다.'),
    term('regular'),
    mini('brew', {
      id: 'autumn_5_do', title: '도 씨의 늘 먹던 거', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'do', say: '늘 먹던 거요.', menu: 'americano', temp: 'iced', togo: false, usual: true, thanks: '이거지. 혼자서도 잘하네.' }],
    }),
    respond('do', 'autumn_notice'),
    term('retire'),
    // 도 씨 2단계: 가방을 걸고 처음 앉음
    ...onlyIf({ trust: { do: '>=4' } },
      cg('do_first_sit'),
      narr('도 씨가 카운터 옆 의자를 한참 바라본다. 그리고 천천히, 처음으로 앉는다.'),
      say('do', 'smile', '허허. 서른 해 만에 여기 앉아 보네.'),
      say('do', 'smile', '앉아서 마시니까, 같은 커피인데도 맛이 다르네요.'),
      think('도 씨가 처음 앉으셨다. 앉으라고 재촉하지 않고, 자리만 비워 둔 날들 덕분일까.'),
      cg(null),
    ),
    ...onlyIf({ trust: { do: '<4' } },
      narr('도 씨는 오늘도 서서 마시고, 가방을 고쳐 메고 나간다.'),
    ),
    leave('do'),

    // 오후: 수민
    place('가을 오후 16:00', '바닷가 마을 카페'),
    bgm('cafe'),
    show({ left: 'jieun:normal', right: 'sumin:normal' }),
    sfx('bell'),
    say('sumin', 'normal', '…보리차요. 오늘은 따뜻하게요.'),
    think('여름 내내 차가운 보리차였는데. 수민에게도 가을이 왔나 보다.'),
    mini('brew', {
      id: 'autumn_5_sumin', title: '따뜻한 보리차', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'sumin', say: '보리차요. 따뜻하게, 여기서요.', menu: 'barley_tea', temp: 'hot', togo: false, thanks: '…고맙습니다.' }],
    }),
    respond('sumin', 'autumn_brochure'),
    leave('sumin'),

    bg('hall', 'evening'),
    bgm('warm'),
    place('가을 저녁 19:00', '혼자 하는 마감'),
    show({ center: 'jieun:normal' }),
    narr('혼자 하는 마감이다. 사장님이 없으니 가게가 더 넓게 느껴진다.'),
    narr('늘 사장님이 마시던 시간에, 나도 우유를 데워 본다.'),
    face('jieun', 'smile'),
    think('손님들은 정말 평소대로 오셨다. "손님은 평소대로 온다." 사장님 말씀이 맞았다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
