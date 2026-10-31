/**
 * 가을 7일 · 그 잔(가을의 끝 장면, PRD 5.5): (한 씨 · 수민 2단계) 시계를 보지 않는 한 씨, 이어폰을 뺀 수민
 * → 마감 무렵, 사장님의 빈 잔을 보는 노 씨(대응 N3) → "그 잔 줘." → 수첩의 사장님 손글씨(물 선 + 열 바퀴)
 * → 지은이 처음 타는 믹스커피 → "…같네."
 */

import { bg, bgm, amb, sfx, big, place, show, enter, leave, say, narr, think, cg, mini, respond, onlyIf, motion, face, end } from '../../core/dsl.js';

const AUTUMN_BOOK = ['americano', 'latte', 'warm_milk', 'hand_drip', 'strawberry_milk', 'yuja_tea', 'greentea_latte', 'vanilla_latte', 'decaf_latte', 'barley_tea', 'cocoa', 'mix_coffee'];

export default {
  id: 'autumn_7',
  act: 3, season: 'autumn', day: 7,
  label: '가을 7일',
  title: '그 잔',
  when: '가을 · 새벽',
  goal: '사장님의 방식 그대로, 그 잔을 처음 타요.',
  schedule: [],
  skills: [],
  standards: ['[12진로03-01]', '[12진로04-05]', '[12진로01-02]'],
  diary: '노 씨가 "그 잔"을 시켰다. 수첩에 사장님 손글씨가 있었다. 물은 선까지, 열 바퀴. 노 씨가 말했다. "같네."',
  script: [
    big('가을 · 7일', '그 잔'),
    bg('hall', 'autumn'),
    amb('cafe'),
    bgm('morning'),
    place('가을 새벽 06:10', '바닷가 마을 카페'),
    show({ left: 'jieun:normal', right: 'han:normal' }),
    sfx('bus'),
    sfx('bell'),
    mini('brew', {
      id: 'autumn_7_han', title: '한 씨의 늘 먹던 거', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'han', say: '늘 먹던 거요.', menu: 'vanilla_latte', temp: 'hot', togo: true, usual: true, thanks: '고마워요.' }],
    }),
    // 한 씨 2단계: 시계를 보지 않음
    ...onlyIf({ trust: { han: '>=4' } },
      narr('한 씨가 의자에 앉는다. 오늘은 한 번도 시계를 보지 않는다.'),
      say('han', 'smile', '여기 오면 10분이 길어요. 이상하죠?'),
      say('han', 'smile', '요즘은 버스에서 내리면, 여기 불빛부터 찾게 돼요.'),
      think('한 씨가 시계를 보지 않으신다. 시간을 아껴 드린 날들이 쌓여서일까.'),
    ),
    ...onlyIf({ trust: { han: '<4' } },
      narr('한 씨는 시계를 한 번 보고, 컵을 들고 서둘러 일어난다.'),
    ),
    leave('han'),

    // 수민 2단계: 카운터 앞에 와서 이어폰을 뺌
    place('가을 오후 16:30', '바닷가 마을 카페'),
    bgm('cafe'),
    show({ left: 'jieun:normal', right: 'sumin:normal' }),
    sfx('bell'),
    ...onlyIf({ trust: { sumin: '>=4' } },
      narr('수민이 카운터 앞으로 온다. 그리고 이어폰을 빼서 주머니에 넣는다.'),
    ),
    ...onlyIf({ trust: { sumin: '>=4' }, pick: 'sumin.autumn_exam=draw_wave' },
      say('sumin', 'smile', '시험 끝났어요. 슬리브의 파도 그림, 시험 보는 내내 책상 위에 두었어요.'),
    ),
    ...onlyIf({ trust: { sumin: '>=4' }, pick: 'sumin.autumn_exam=cheer|ask_score' },
      say('sumin', 'smile', '시험 끝났어요. 그날 아침 보리차, 따뜻해서 좋았어요.'),
    ),
    ...onlyIf({ trust: { sumin: '>=4' } },
      say('sumin', 'normal', '오늘은… 구석 말고, 여기 앞자리에서 마실게요.'),
      think('수민이 처음으로 이어폰을 뺐다. 거리를 지켜 드린 날들이 쌓여서일까.'),
    ),
    ...onlyIf({ trust: { sumin: '<4' } },
      narr('수민은 메뉴판을 가리키고, 늘 앉던 구석 자리로 간다. 이어폰은 그대로다.'),
    ),
    mini('brew', {
      id: 'autumn_7_sumin', title: '수민의 보리차', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'sumin', say: '늘 먹던 거요. 오늘은 따뜻하게요.', menu: 'barley_tea', temp: 'hot', togo: false, thanks: '…고맙습니다.' }],
    }),
    leave('sumin'),

    // 끝 장면: 노 씨의 그 잔
    bg('hall', 'evening'),
    amb('cafe'),
    bgm('warm'),
    place('가을 저녁 18:50', '마감 무렵'),
    show({ left: 'jieun:normal', right: 'noh:normal' }),
    sfx('bell'),
    respond('noh', 'autumn_empty'),
    think('그 잔은 사장님이 서른 해 동안 노 씨에게 타 드린 믹스커피다. 나는 한 번도 타 본 적이 없다.'),
    narr('레시피 수첩을 편다. 믹스커피 쪽에 사장님의 손글씨 쪽지가 붙어 있다.'),
    narr('"물은 종이컵 안쪽 선까지. 숟가락으로 열 바퀴."'),
    narr('글씨가 조금 삐뚤다. 손이 떨릴 때 쓰신 것 같다.'),
    think('사장님은 이날을 미리 준비해 두셨구나.'),
    mini('brew', {
      id: 'autumn_7_noh', title: '그 잔', level: 'normal', book: AUTUMN_BOOK,
      orders: [{ who: 'noh', say: '그 잔 줘.', menu: 'mix_coffee', togo: false, usual: true, thanks: '…같네.', miss: '…조금 다르네. 그래도 고맙네.' }],
    }),
    cg('noh_same'),
    narr('노 씨가 종이컵을 두 손으로 감싸고, 천천히 끝까지 마신다.'),
    say('noh', 'smile', '사장한테 전해. 가게는 걱정 말라고.'),
    face('jieun', 'smile'),
    think('"같네." 가을 내내 들은 말 가운데 제일 좋은 말이다.'),
    cg(null),
    leave('noh'),
    sfx('door'),
    show({ center: 'jieun:smile' }),
    narr('창밖의 은행잎이 다 떨어졌다. 저녁 바람이 차다.'),
    think('곧 겨울이다. 사장님이 돌아오신다고 한 계절이다.'),
    motion('jieun', 'nod'),
    end(),
  ],
};
