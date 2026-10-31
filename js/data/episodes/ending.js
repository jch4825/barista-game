/**
 * 엔딩(PRD 5.8 · docs/story.md 9장): 겨울 7일의 마지막 컷(칠판의 삐뚤한 이름) 다음
 *  마감 뒤 가게를 둘러보는 지은 → 단골 앨범(album: 8명의 액자, 3단계면 비밀 장면) →
 *  사장님의 한마디 → 사장의 눈(eyes: 숨은 뒷받침 11컷, 처음 보는 장면은 천천히) →
 *  창가의 따뜻한 우유 두 잔(첫 잔 · 할머니의 두 잔 · 마감 우유가 한 컵으로 닫힘) → 크레디트 → 자유 영업 안내
 * EPISODES 에 넣지 않습니다. 마지막 막의 마지막 편(FINALE)을 처음 마치면 main.js 가 엔딩으로 보냅니다.
 * 모든 학생에게 같은 순서(원칙 3). 앨범의 열린 액자와 사장의 눈의 '처음 보는 장면' 표시만 다름.
 */

import { bg, bgm, amb, big, place, show, say, narr, think, cg, album, eyes, credits, motion, end } from '../../core/dsl.js';

export default {
  id: 'ending',
  label: '엔딩',
  title: '한 해의 끝',
  when: '겨울 · 밤',
  goal: '',
  schedule: [],
  skills: [],
  standards: [],
  // cue: 마지막 에피소드를 처음 마친 결과 화면에서 [엔딩 보기]와 함께 읽어 줌(result.js)
  cue: '겨울의 마지막 날까지 마쳤어요. 한 해의 끝을 볼까요?',
  // 엔딩을 처음 본 뒤의 알림(main.js)과 근무표의 안내(hub.js)
  notice: { title: '자유 영업이 열렸어요', body: '이제 언제든 카페 문을 열 수 있어요. 근무표에서 [자유 영업]을 고르면 단골과 손님들이 계속 찾아와요.' },
  script: [
    big('엔딩', '한 해의 끝'),
    bg('hall', 'evening'),
    amb('cafe'),
    bgm('ending'),
    place('겨울 밤 21:00', '마감 뒤'),
    show({ center: 'jieun:smile' }),
    narr('사장님이 칠판에 내 이름을 쓴 밤, 나는 불을 하나만 남기고 가게를 천천히 둘러본다.'),
    narr('창가의 빈 의자, 문 옆의 못, 한 칸 낮아진 컵 선반. 봄에는 몰랐던 것들이 이제는 다 이야기로 보인다.'),
    think('이 카페에 오는 사람들은 저마다 늘 마시던 한 잔이 있었다. 그리고 그 잔마다, 말하지 않은 마음이 있었다.'),
    album(),

    show({ left: 'jieun:smile', right: 'owner:smile' }),
    narr('사장님이 외투를 걸치다 말고, 카운터 앞에 서 있는 나를 본다.'),
    say('owner', 'smile', '다 둘러봤냐. 한 해 동안 많은 사람이 다녀갔지.'),
    say('jieun', 'smile', '네. 처음에는 주문 받는 것도 무서웠는데, 이제는 다들 무엇을 마실지 알 것 같아요.'),
    say('owner', 'normal', '…나도 한 해를 봤다. 네가 못 본 쪽에서.'),
    narr('사장님은 그 말만 하고 창밖을 본다. 나는 처음으로, 사장님 자리에서 본 우리 가게를 떠올려 본다.'),
    eyes(),

    // 마지막 한 잔: 따뜻한 우유
    bg('hall', 'evening'),
    show({ left: 'jieun:smile', right: 'owner:smile' }),
    cg('ending_last_cup'),
    narr('사장님과 나는 창가 자리에 나란히 앉는다. 두 잔의 따뜻한 우유에서 김이 천천히 오른다.'),
    think('봄에 사장님이 건넨 첫 잔, 할머니가 빈 의자 앞에 두던 잔, 그리고 오늘 내가 두 손에 쥐여 드린 잔.'),
    think('모두 같은 따뜻한 우유였다. 그런데 한 잔도, 같은 마음은 아니었다.'),
    say('owner', 'smile', '내일도 문 열지. 일곱 시 전에는 동네 시간이다.'),
    say('jieun', 'smile', '네. 손님은 평소대로 오니까요. 저도 평소대로 열게요.'),
    narr('창밖 항구에 고깃배 불빛이 하나둘 켜진다. 내일 새벽에 바다로 나갈 배들이다.'),
    cg(null),
    motion('owner', 'nod'),
    credits(),
    end(),
  ],
};
