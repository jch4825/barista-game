/**
 * 가을 6일 · 서두르면 쏟는다: 수능 날 아침, 수민의 컵 슬리브(대응 S4) → 안개로 늦은 한 씨(대응 Han4)
 * → (지안 2단계) 묻기 전에 스스로 색을 말함 → 혼자 서두르다 라테를 쏟음
 * → 닫는 때 둘러보기: 마감 선반의 메모 "서두르면 쏟는다."(숨은 장면 10)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, cg, fx, mini, respond, onlyIf, term, motion, face, emote, end } from '../../core/dsl.js';

const AUTUMN_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa'];

export default {
  id: 'autumn_6',
  act: 3, season: 'autumn', day: 6,
  label: '가을 6일',
  title: '서두르면 쏟는다',
  when: '가을 · 새벽',
  goal: '바쁠수록 천천히. 내 손의 속도를 지켜요.',
  schedule: [],
  skills: [],
  standards: ['[12진로01-02]', '[12진로03-04]', '[12진로04-05]'],
  costume: { customer: 'arms' },
  diary: '수능 날 아침, 슬리브에 작은 파도를 그렸다. 혼자 서두르다 쏟았다. 선반에서 사장님의 메모를 찾았다. "서두르면 쏟는다."',
  script: [
    big('가을 · 6일', '서두르면 쏟는다'),
    bg('hall', 'morning'),
    amb('cafe'),
    bgm('morning'),
    place('가을 새벽 06:05', '안개 낀 아침'),
    show({ left: 'jieun:normal', right: 'sumin:nervous' }),
    sfx('bell'),
    narr('새벽부터 짙은 안개가 꼈다. 오늘은 {{수능}} 날이다.'),
    term('exam'),
    narr('수민이 동네 시간에 들어온다. 이렇게 이른 시간에 온 것은 처음이다.'),
    ...onlyIf({ trust: { sumin: '>=4' } },
      narr('수민은 카운터 앞까지 와서, 이어폰을 빼고 나를 보며 주문한다. 여름에는 메뉴판을 손가락으로 가리키기만 했는데.'),
    ),
    ...onlyIf({ trust: { sumin: '<4' } },
      narr('수민은 이어폰을 낀 채로, 메뉴판의 보리차를 가리킨다.'),
    ),
    say('sumin', 'normal', '…보리차요. 따뜻하게, 가져갈게요.'),
    mini('brew', {
      id: 'autumn_6_sumin', title: '수능 날의 보리차', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'sumin', say: '보리차요. 따뜻하게, 가져갈게요.', menu: 'barley_tea', temp: 'hot', togo: true, thanks: '…고맙습니다.' }],
    }),
    respond('sumin', 'autumn_exam'),
    leave('sumin'),

    // 안개로 늦은 한 씨
    show({ left: 'jieun:normal', right: 'han:worried' }),
    respond('han', 'autumn_fog'),
    leave('han'),

    // 지안 2단계: 스스로 색을 말함
    place('가을 오전 10:00', '바닷가 마을 카페'),
    bgm('cafe'),
    show({ left: 'jieun:normal', right: 'jian:normal' }),
    sfx('bell'),
    ...onlyIf({ trust: { jian: '>=4' } },
      narr('지안이 들어와, 내가 묻기도 전에 먼저 말한다.'),
      say('jian', 'smile', '오늘은 갈색이요. 코코아를 따뜻하게 주세요.'),
      think('지안 씨가 스스로 색을 골랐다. 색을 물어봐 드린 날들이 쌓여서일까.'),
    ),
    ...onlyIf({ trust: { jian: '<4' } },
      say('jian', 'normal', '음…'),
      say('jieun', 'normal', '오늘은 어떤 색이에요?'),
      say('jian', 'normal', '…갈색이요. 코코아요.'),
    ),
    mini('brew', {
      id: 'autumn_6_jian', title: '갈색', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'jian', say: '갈색이요. 코코아, 따뜻하게요.', menu: 'cocoa', temp: 'hot', togo: false, thanks: '달고 따뜻하다. 고마워요.' }],
    }),
    leave('jian'),

    // 혼자 서두르다 쏟음
    place('가을 낮 12:20', '점심시간'),
    amb('crowd'),
    show({ left: 'jieun:nervous', right: 'customer:normal' }),
    narr('점심시간이 되자 손님이 한꺼번에 들어온다. 오늘도 사장님은 안 계신다.'),
    say('customer', 'normal', '빨리 좀 부탁해요. 점심시간이 짧아서요.'),
    narr('나도 모르게 손이 빨라진다. 그러다 라테 두 잔을 한 번에 들었다.'),
    sfx('spill'),
    fx('shake'),
    cg('jieun_spill'),
    narr('라테가 쟁반 위로 쏟아졌다.'),
    emote('jieun', 'sweat'),
    think('봄에도 서두르다 컵을 깼다. 그때는 사장님이 옆에 계셨는데.'),
    cg(null),
    say('customer', 'normal', '아, 괜찮아요, 천천히 하세요. 우리가 너무 재촉했네요.'),
    narr('숨을 한 번 크게 쉰다. 그리고 한 잔씩, 천천히 다시 만든다.'),
    mini('brew', {
      id: 'autumn_6_lunch', title: '한 잔씩, 천천히', level: 'normal', book: AUTUMN_BOOK,
      orders: [
        { who: 'customer', say: '따뜻한 라테 하나요. 여기서요.', menu: 'latte', temp: 'hot', togo: false, thanks: '맛있네요. 고마워요.' },
        { who: 'customer', say: '아아도 하나요. 이건 가져갈게요.', menu: 'americano', temp: 'iced', togo: true, thanks: '고마워요.' },
      ],
    }),
    mini('tray', { id: 'autumn_6_tray', title: '천천히 나르기', items: [{ icon: 'coffee', name: '라테' }], to: '창가 자리' }),
    leave('customer'),

    // 마감 둘러보기: 숨은 장면 10
    bg('hall', 'evening'),
    amb('cafe'),
    bgm('warm'),
    place('가을 저녁 19:10', '마감'),
    show({ center: 'jieun:sad' }),
    narr('혼자 하는 마감이다. 낮에 라테를 쏟은 일이 자꾸 떠오른다.'),
    mini('lookaround', {
      id: 'autumn_6_look', title: '닫을 때 둘러보기', bg: ['hall', 'evening'],
      spots: [
        { name: '마감 선반', icon: 'note', x: 92, y: 46, seen: 10, lines: ['컵을 엎어 두는 선반 안쪽에 작은 메모가 붙어 있다. 삐뚤삐뚤한 글씨로 "서두르면 쏟는다."라고 적혀 있다.', { t: 'think', text: '사장님 글씨다. 가게를 맡기기 전에 붙여 두셨나 보다.' }, { t: 'think', text: '오늘 같은 날이 올 줄 아셨던 걸까.' }] },
        { name: '칠판', icon: 'memo', x: 83, y: 32, lines: ['여름에 쓴 "7시 전은 동네 시간"이 그대로 있다. 오른쪽 아래 빈칸도 그대로다.', { t: 'think', text: '사장님은 그 칸에 무엇을 쓰시려는 걸까.' }] },
        { name: '창가 자리', icon: 'chair', x: 24, y: 60, lines: ['유모차 자리 옆으로, 할머니의 의자 두 개가 나란히 놓여 있다.'] },
        { name: '사장님의 잔', icon: 'milk', x: 62, y: 70, lines: ['사장님의 하얀 잔이 깨끗이 엎어져 있다.', { t: 'think', text: '겨울에 오신다고 하셨다. 그때까지 이 잔도 잘 닦아 두자.' }] },
      ],
    }),
    cg('owner_memo'),
    face('jieun', 'smile'),
    think('서두르면 쏟는다. 그러니까, 천천히 해도 된다.'),
    think('내 손은 느린 대신 정확하다. 사장님은 그걸 알고 나에게 가게를 맡기셨다.'),
    cg(null),
    motion('jieun', 'nod'),
    end(),
  ],
};
