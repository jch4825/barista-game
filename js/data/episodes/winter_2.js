/**
 * 겨울 2일 · 봉투: 새벽, (강 씨 3단계) 배를 판 날을 처음 말함 → "지나가다" 들른 노 씨(대응 N4) → (노 씨 2단계) 말없이 난로를 고침
 * → 합격 통지서 봉투를 쥔 수민(대응 S5)
 */

import { bg, bgm, amb, sfx, big, place, show, leave, say, narr, think, cg, mini, respond, onlyIf, secret, motion, face, end } from '../../core/dsl.js';

const WINTER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa', 'mix_coffee'];

export default {
  id: 'winter_2',
  act: 4, season: 'winter', day: 2,
  label: '겨울 2일',
  title: '봉투',
  when: '겨울 · 새벽',
  goal: '말할 준비가 될 때까지 기다려요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]'],
  diary: '노 씨는 오늘도 지나가다 들렀다고 했다. 수민이 뜯지 않은 봉투를 들고 왔다.',
  script: [
    big('겨울 · 2일', '봉투'),
    bg('hall', 'winter'),
    amb('cafe'),
    bgm('morning'),
    place('겨울 새벽 06:00', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'kang:normal' }),
    sfx('bell'),
    mini('brew', {
      id: 'winter_2_kang', title: '강 씨의 블랙', level: 'normal', book: WINTER_BOOK,
      orders: [{ who: 'kang', say: '블랙.', menu: 'hand_drip', togo: false, usual: true, thanks: '…고마워.' }],
    }),
    // 강 씨 3단계: 배를 판 날을 처음 말함
    ...onlyIf({ trust: { kang: '>=7' } },
      cg('kang_secret'),
      narr('강 씨가 잔을 내려놓는다. 한참 창밖을 보다가, 천천히 입을 연다.'),
      say('kang', 'normal', '…여름에 배를 팔았어. 서른 해 동안 탄 배였지.'),
      say('kang', 'normal', '그날 바다가 참 잔잔했어. 그래서 더 아무한테도 못 말했지.'),
      say('kang', 'smile', '그 뒤로도 매일 새벽 여기 와서, 바다에 나가는 척했어.'),
      say('kang', 'smile', '불을 켜 놓고 기다려 줘서, 그 척이 덜 외로웠어.'),
      secret('kang'),
      think('강 씨가 처음으로 이야기를 꺼내셨다. 한 번도 묻지 않고, 늘 불을 켜 둔 날들 덕분일까.'),
      cg(null),
    ),
    ...onlyIf({ trust: { kang: '<7' } },
      narr('강 씨는 말없이 블랙을 마시고, 배 한 척이 빠진 항구를 오래 본다.'),
    ),
    leave('kang'),

    // 노 씨
    place('겨울 아침 08:30', '눈 오는 아침'),
    show({ left: 'jieun:normal', right: 'noh:normal' }),
    sfx('bell'),
    respond('noh', 'winter_check'),
    // 노 씨 2단계: 말없이 난로를 고침
    ...onlyIf({ trust: { noh: '>=4' } },
      narr('노 씨가 커피를 다 마시고 공구 상자를 연다. 그리고 아무 말 없이 난로를 고친다.'),
      narr('덜덜거리던 난로가 조용해지자, 가게 안이 금방 따뜻해진다.'),
      say('noh', 'normal', '고장 난 거 고친 거야. 지나가는 김에.'),
      think('노 씨는 늘 "고장 난 거"라고만 하신다. 모른 척해 드린 날들이 쌓여서, 이렇게 챙겨 주시는 걸까.'),
    ),
    ...onlyIf({ trust: { noh: '<4' } },
      narr('노 씨는 나가면서 난로를 한 번 툭 친다. 난로는 오늘도 덜덜거린다.'),
    ),
    leave('noh'),

    // 오후: 수민의 봉투
    place('겨울 오후 16:00', '바닷가 마을 카페'),
    bgm('warm'),
    show({ left: 'jieun:normal', right: 'sumin:nervous' }),
    sfx('bell'),
    respond('sumin', 'winter_letter'),
    mini('brew', {
      id: 'winter_2_sumin', title: '따뜻한 보리차', level: 'normal', book: WINTER_BOOK,
      orders: [{ who: 'sumin', say: '보리차요. 따뜻하게요.', menu: 'barley_tea', temp: 'hot', togo: false, thanks: '…고맙습니다.' }],
    }),
    leave('sumin'),
    bg('hall', 'evening'),
    place('겨울 저녁 19:00', '마감'),
    show({ center: 'jieun:normal' }),
    narr('라디오에서, 이틀 뒤부터 큰 눈이 온다는 소식이 나온다. 몇 년 만의 폭설이라고 한다.'),
    think('눈이 많이 오면 정전이 될 수도 있다. 뒷방 선반에 사장님이 모아 둔 초가 있었던 것 같다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
