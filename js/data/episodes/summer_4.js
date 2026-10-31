/**
 * 여름 4일 · 그 잔: 철물점 노 씨 — 사장님이 타는 믹스커피, 숟가락이 조금 떨림(대응 N1: 모른 척)
 * → 지안의 "시원한 거 아무거나"(대응 J2, 고른 대응에 따라 음료가 달라짐) → 마감, 사장님이 앞치마 끈을 다시 매 줌(숨은 장면 7)
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, seen, motion, face, end } from '../../core/dsl.js';

const SUMMER_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea'];

export default {
  id: 'summer_4',
  act: 2, season: 'summer', day: 4,
  label: '여름 4일',
  title: '그 잔',
  when: '여름 · 오전',
  goal: '말하지 않는 것을 지켜 주는 것도 친절이에요.',
  schedule: [],
  skills: [],
  standards: ['[12진로04-05]'],
  diary: '철물점 노 씨는 사장님이 타 주는 믹스커피만 마신다. 사장님의 숟가락이 조금 떨렸다. 마감 때 사장님이 내 앞치마 끈을 다시 매 주었다.',
  script: [
    big('여름 · 4일', '그 잔'),
    bg('hall', 'summer'),
    amb('cafe'),
    bgm('cafe'),
    place('여름 오전 08:20', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', center: 'owner:normal', right: 'noh:normal' }),
    sfx('bell'),
    say('owner', 'normal', '노 씨, 오셨어요.'),
    say('noh', 'normal', '그래. 그 잔.'),
    say('owner', 'normal', '지은 씨, 철물점 노 씨예요. 나랑 서른 해 친구예요.'),
    narr('사장님이 종이컵에 믹스커피 봉지를 뜯는다. 물을 붓고, 숟가락으로 젓는다.'),
    respond('noh', 'summer_spoon'),
    say('noh', 'normal', '역시 이 맛이야.'),
    narr('노 씨가 컵을 비우고, 말없이 나간다.'),
    leave('noh'),
    sfx('door'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    say('owner', 'normal', '믹스커피는 내가 타요. 노 씨는 그 잔만 마셔요.'),
    narr('사장님이 손을 앞치마 주머니에 넣는다.'),
    think('아까 숟가락이 떨렸던 것. 나도 묻지 않았다.'),

    // 오후: 지안
    place('여름 오후 14:30', '붐비는 오후'),
    bg('hall', 'busy_summer'),
    amb('crowd'),
    show({ left: 'jieun:normal', right: 'jian:normal' }),
    respond('jian', 'summer_cool'),
    ...onlyIf({ pick: 'jian.summer_cool=ask_cool_color' },
      mini('brew', {
        id: 'summer_4_jian_green', title: '초록색', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'jian', say: '초록색이요. 녹차라테, 차갑게요.', menu: 'greentea_latte', temp: 'iced', togo: false, ask: ['togo'], reply: { togo: '구석에서 마실게요.' }, thanks: '시원한 초록이다. 고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.summer_cool=recommend_pink' },
      mini('brew', {
        id: 'summer_4_jian_pink', title: '딸기우유', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'jian', say: '네, 딸기우유로 할게요.', menu: 'strawberry_milk', temp: 'iced', togo: false, thanks: '고마워요.' }],
      }),
    ),
    ...onlyIf({ pick: 'jian.summer_cool=pry_sketch' },
      mini('brew', {
        id: 'summer_4_jian_any', title: '아무거나', level: 'normal', book: SUMMER_BOOK,
        orders: [{ who: 'jian', say: '아무거나 주세요. 시원한 걸로요.', menu: 'americano', temp: 'iced', togo: false, ticket: '시원한 거 아무거나', thanks: '…고마워요.' }],
      }),
    ),
    leave('jian'),

    // 마감: 숨은 장면 7(대사 없는 연출)
    bg('hall', 'evening'),
    amb('cafe'),
    bgm('warm'),
    place('여름 저녁 19:20', '마감'),
    show({ left: 'jieun:normal', right: 'owner:normal' }),
    narr('하루 종일 손님이 많았다. 앞치마 끈이 풀려 늘어져 있다.'),
    narr('컵을 닦고 있는데, 등 뒤에서 누가 끈을 잡는다.'),
    cg('owner_apron'),
    narr('사장님이 아무 말 없이 내 앞치마 끈을 다시 매 준다.'),
    seen(7),
    narr('사장님의 손이 조금 느리다. 그래도 매듭은 단단하다.'),
    cg(null),
    face('jieun', 'smile'),
    think('고맙다고 말하려는데, 사장님은 벌써 컵을 닦고 있다.'),
    motion('owner', 'nod'),
    end(),
  ],
};
