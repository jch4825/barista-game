/**
 * 엔딩 자리 표시: 새 게임의 엔딩(엔딩 앨범 → 사장의 눈 → 우유 한 컵, PRD.md 5.8)을 만들기 전까지 쓰는 짧은 장면
 * EPISODES 에 넣지 않습니다. 마지막 막의 마지막 편(FINALE)을 처음 마치면 main.js 가 엔딩으로 보냅니다.
 */

import { bg, big, sys, end } from '../../core/dsl.js';

export default {
  id: 'ending',
  label: '엔딩',
  title: '엔딩 (준비 중)',
  when: '',
  goal: '',
  schedule: [],
  skills: [],
  standards: [],
  // cue: 마지막 에피소드를 처음 마친 결과 화면에서 [엔딩 보기]와 함께 읽어 줌(result.js)
  cue: '마지막 이야기까지 해냈어요. 엔딩을 볼까요?',
  // 엔딩을 처음 본 뒤의 알림(main.js)과 근무표의 안내(hub.js)
  notice: { title: '시험 엔딩을 봤어요', body: '엔딩 앨범과 사장의 눈은 아직 만들고 있어요.' },
  script: [
    big('엔딩', '준비 중'),
    bg('cafe_front', 'morning'),
    sys('엔딩 앨범과 사장의 눈은 아직 만들고 있어요.'),
    end(),
  ],
};
