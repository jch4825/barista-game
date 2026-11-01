/**
 * 가을 3일 · 손잡이: 사장님이 은행에 간 사이, 노 씨가 몰래 선반을 낮춤(대응 N2) → 사장님은 말없이 그 선반을 씀
 * → 유모차가 걸린 은주(대응 E3) → (은주 신뢰 4 이상) 처음 끝까지 마심 · 사장님이 의자를 치워 유모차 자리를 만듦
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, motion, face, end, info } from '../../core/dsl.js';

const AUTUMN_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa'];

export default {
  id: 'autumn_3',
  act: 3, season: 'autumn', day: 3,
  label: '가을 3일',
  title: '손잡이',
  when: '가을 · 오전',
  goal: '말없이 돕는 사람의 마음을 지켜 줘요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]', '[12진로05-04]'],
  diary: '노 씨가 몰래 선반을 낮췄다. 사장님은 아무 말 없이 그 선반을 썼다. 은주 씨의 유모차 자리가 생겼다.',
  script: [
    big('가을 · 3일', '손잡이'),
    bg('hall', 'autumn'),
    amb('cafe'),
    bgm('cafe'),
    place('가을 오전 09:30', '바닷가 마을 카페'),
    info('오늘의 칠판', '사장님이 은행에 가요. 잠깐 혼자 가게를 봐요.', 'menu'), // 재미 개편 Q-43: 오늘 하나 달라지는 것(미리 알고 시작)
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '은행에 좀 다녀올게요. 한 시간쯤 걸려요.'),
    leave('owner'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'noh:normal' }),
    sfx('bell'),
    respond('noh', 'autumn_shelf'),
    leave('noh'),

    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    narr('사장님이 돌아와 원두 통을 꺼내려다, 한 칸 낮아진 선반을 한 번 본다. 바뀐 수도꼭지 손잡이도 본다.'),
    narr('사장님은 아무 말 없이 원두 통을 꺼낸다. 통을 내리는 손이 전보다 편해 보인다.'),
    think('누가 고쳤는지, 사장님도 아실 것이다. 그래도 사장님도 노 씨도 서로 아무 말 하지 않는다.'),

    // 은주
    place('가을 오후 13:30', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'eunju:worried' }),
    respond('eunju', 'autumn_space'),
    ...onlyIf({ pick: 'eunju.summer_cold=thick_cup' },
      mini('brew', {
        id: 'autumn_3_eunju', title: '은주 씨의 늘 먹던 거', level: 'normal', book: AUTUMN_BOOK,
        orders: [{ who: 'eunju', say: '늘 먹던 거요. 그 두꺼운 컵에요.', menu: 'decaf_latte', temp: 'hot', togo: false, usual: true, cup: 'thick', thanks: '고마워요. 오늘은 따뜻할 때 마셔 볼게요.' }],
      }),
    ),
    ...onlyIf({ pick: 'eunju.summer_cold=reheat|take_baby|' },
      mini('brew', {
        id: 'autumn_3_eunju_mug', title: '은주 씨의 늘 먹던 거', level: 'normal', book: AUTUMN_BOOK,
        orders: [{ who: 'eunju', say: '늘 먹던 거요.', menu: 'decaf_latte', temp: 'hot', togo: false, usual: true, thanks: '고마워요. 오늘은 따뜻할 때 마셔 볼게요.' }],
      }),
    ),
    // 2단계(신뢰 4 이상): 처음 끝까지 마심 · 사장님이 유모차 자리를 만듦
    ...onlyIf({ trust: { eunju: '>=4' } },
      narr('한 시간 뒤, 은주 씨가 빈 컵을 들고 카운터로 온다.'),
      say('eunju', 'smile', '지은 씨, 이거 봐요. 아기 낳고 처음으로 끝까지 다 마셨어요.'),
      narr('은주 씨가 빈 컵을 자랑하듯 들어 보인다.'),
      enter('right', 'owner:normal'),
      narr('그 모습을 본 사장님이, 창가 쪽 의자 하나를 말없이 뒷방으로 옮긴다.'),
      say('owner', 'normal', '이제 여기는 유모차 자리예요. 다음부터는 문에서 바로 들어와요.'),
      face('jieun', 'smile'),
      think('은주 씨가 끝까지 마신 첫 잔이다. 사장님도 그걸 보고 계셨나 보다.'),
    ),
    ...onlyIf({ trust: { eunju: '<4' } },
      narr('은주 씨는 오늘도 라테를 반쯤 남기고, 우는 아기를 안고 일어난다.'),
      say('eunju', 'normal', '또 올게요. 다음에는 다 마셔 볼게요.'),
    ),
    leave('eunju'),

    bg('hall', 'evening'),
    bgm('warm'),
    place('가을 저녁 19:00', '마감'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '내일은 바다 축제예요. 일 년에 한 번, 골목이 사람으로 가득 차는 날이에요.'),
    say('owner', 'normal', '오늘은 일찍 자요. 내일은 하루 종일 서 있어야 해요.'),
    narr('사장님이 마감 우유를 두 손으로 든다. 그래도 잔이 조금 흔들린다.'),
    think('요즘은 사장님 잔이 흔들리는 날이 많다. 내일은 내가 더 많이 해야겠다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
