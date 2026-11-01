/**
 * 처음 보는 버튼 알려 주기: 버튼·행동 종류 목록 (그리는 일은 js/ui/tutor.js)
 *  - 위에 있을수록 먼저 알려 줍니다. 한 번에 한 종류만 무지개 테두리가 돕니다.
 *  - 학생(프로필)마다 한 번 누르면 '배운 것'으로 기록되고 다시 나오지 않습니다.
 *
 * 항목
 *  key    기록 이름 · sel 찾을 버튼(CSS) · not 눌러도 배운 것으로 치지 않는 안쪽 부분
 *  when   이 요소가 화면에 있을 때만 · after 이 종류를 배운 뒤에만
 *  need   꼭 눌러야 이어지는 것(누를 때까지 매번). 없으면 '안 눌러도 되는 것': max 번 보여 주면 배운 것으로 침
 *  guide  늘 화면에 있는 버튼(위쪽 줄·대화창). 프롤로그의 guide() 안내로 소개하고,
 *         프롤로그를 건너뛴 학생에게는 다른 이야기의 조용한 대사 때 하나씩 쪽지(tip)로 소개
 *  hand   'on' 그 버튼을 누르는 손가락 · 'group' 여러 개 중 고르기(손가락이 모든 칸을 차례로 짚음: 정답을 가리키지 않음)
 *  handAt 손가락이 짚을 안쪽 요소 · tip 쪽지 글(짧게) · tipTwo '두 번 눌러 고르기' 설정일 때 쪽지
 */

export const TUT = [
  /* ---------- 처음 화면 · 이름 정하기 (학생이 정해지기 전에도) ---------- */
  { key: 'title-start', sel: '.title-screen .tt-btn.primary', need: true, hand: 'on', tip: '눌러서 시작해요' },
  { key: 'profile-next', sel: '.scr-profile .btn-big.btn-main', need: true, hand: 'on', tip: '다 하면 눌러요' },

  /* ---------- 이야기: 꼭 눌러야 이어지는 것 ---------- */
  { key: 'start', sel: '.ov-schedule .btn-big', need: true, hand: 'on', tip: '눌러서 시작해요' },
  { key: 'next', sel: '#layer-dock .dlg', when: '#layer-dock .dlg-next.on', need: true, hand: 'on', handAt: '.dlg-next', tip: '화면을 톡 눌러요' },
  { key: 'card', sel: '#layer-task .cards-wrap.is-in .card', not: '.card-say', need: true, hand: 'group', tip: '하나를 골라 눌러요', tipTwo: '한 번 누르면 읽고, 또 누르면 골라요' },
  { key: 'rewind', sel: '.ov-oops .btn-rewind', need: true, hand: 'on', tip: '눌러서 시간을 되돌려요' },
  { key: 'act', sel: '.ov-act .act-btn', need: true, hand: 'on', tip: '직접 눌러요' },
  { key: 'ok', sel: '.ov-phone .btn-big, .ov-gloss .gloss-btns .btn-big, .ov-crew .btn-big, .ov-info .btn-big, .ov-brief .btn-big, .ov-pay .btn-big', need: true, hand: 'on', tip: '다 보면 눌러요' },
  { key: 'continue', sel: '#layer-overlay .ov-next', need: true, max: 3, tip: '눌러서 넘겨요' },
  { key: 'breathe-done', sel: '.ov-breathe .br-btns .btn-big', need: true, hand: 'on', tip: '다 하면 눌러요' },
  { key: 'doc-next', sel: '.doc-next', need: true, hand: 'on', tip: '다 읽으면 눌러요' },
  { key: 'doc-seal', sel: '.docp .act-btn', need: true, hand: 'on', tip: '눌러서 도장을 찍어요' },
  { key: 'iv-chip', sel: '.iv .iv-chip', not: '.chip-say', need: true, hand: 'group', tip: '할 말을 골라 눌러요' },

  /* ---------- 일하는 장면(미니게임·근무판): 정답을 가리키지 않게 모든 칸을 같이 ---------- */
  { key: 'mg-handwash', sel: '.mg .hw-tile, .mg .act-btn.small', need: true, hand: 'group', tip: '눌러서 해 봐요' },
  { key: 'mg-cups', sel: '.mg .cup-bin', need: true, hand: 'group', tip: '눌러서 해 봐요' },
  { key: 'mg-order', sel: '.mg .od-item', need: true, hand: 'group', tip: '눌러서 해 봐요' },
  { key: 'mg-closing', sel: '.mg .cl-spot', need: true, hand: 'group', tip: '눌러서 해 봐요' },
  { key: 'mg-memowrite', sel: '.mg .mw-tip', need: true, hand: 'group', tip: '눌러서 골라요' },
  { key: 'mg-spill', sel: '.mg .sp-tool', need: true, hand: 'group', tip: '도구를 눌러 들어요' },
  // 4장 손맛 미니게임(받기·청소·지렁이): [시작!] → 조작 버튼. 고르는 것은 모두 group(정답을 가리키지 않음)
  { key: 'mg-go', sel: '.mg .mg-go', need: true, hand: 'on', tip: '준비되면 눌러요' },
  // 순서대로: 마지막 일 뒤의 [오픈 준비 완료] 등(2026-11-01)
  { key: 'rt-finish', sel: '.mg .rt-finish', need: true, hand: 'on', tip: '다 하면 눌러요' },
  { key: 'mg-catch', sel: '.mg .ct-move', need: true, hand: 'group', tip: '눌러서 옮겨요' },
  { key: 'mg-catch-place', sel: '.mg .ct-place', after: 'mg-catch', max: 2, hand: 'on', tip: '모은 것을 갖다 놓아요' },
  { key: 'mg-timing', sel: '.mg .tg-drop', need: true, hand: 'on', tip: '빈 칸 위에 오면 눌러요' },
  { key: 'mg-tables', sel: '.mg .tb-spot.dirty', need: true, hand: 'group', tip: '얼룩을 눌러 닦아요' },
  { key: 'mg-whack', sel: '.mg .wh-spot.has', need: true, hand: 'group', tip: '눌러서 치워요' },
  { key: 'mg-whack-bag', sel: '.mg .wh-bag', after: 'mg-whack', max: 2, hand: 'on', tip: '봉투가 차면 눌러요' },
  { key: 'mg-quit', sel: '.mg .mg-quit', after: 'mg-go', max: 2, tip: '그만하고 싶으면 눌러요' },
  { key: 'mg-wait', sel: '.mg .ct-wait-btn, .mg .wh-wait, .mg .tg-step', after: 'mg-go', max: 2, hand: 'on', tip: '누르면 한 칸 기다려요' },
  { key: 'mg-snake', sel: '.mg .sn-dir', need: true, hand: 'group', tip: '눌러서 지렁이를 움직여요' },
  { key: 'mg-snake-again', sel: '.mg .sn-again', max: 2, hand: 'on', tip: '한 판 더 할 수 있어요' },
  { key: 'mg-snake-alarm', sel: '.mg .sn-alarm-btns .btn', need: true, hand: 'group', tip: '하나를 골라 눌러요' },
  { key: 'mg-snake-pocket', sel: '.mg .sn-pocket', after: 'mg-snake', max: 2, tip: '언제든 그만둘 수 있어요' },
  // 작업대(커피 만들기): 처음 만드는 한 잔에서 다음에 누를 것을 차례로(2026-10-31 사용자 "첫 우유 만들기 장면에서 설명이 필요하다"). 컵 · 재료는 정답을 가리키지 않게 group
  { key: 'bw-ask', sel: '.mg-brew .bw-askq', need: true, hand: 'group', tip: '모르는 것은 눌러서 물어봐요' },
  { key: 'bw-confirm', sel: '.mg-brew .bw-confirm', need: true, hand: 'on', tip: '눌러서 주문을 한 번 더 말해요' },
  { key: 'bw-cup', sel: '.mg-brew .bw-hot[data-hot^="cup:"]', when: '.mg-brew .bw-make', need: true, hand: 'group', tip: '손님에게 맞는 컵을 눌러요' },
  { key: 'bw-ing', sel: '.mg-brew .bw-hot[data-hot^="ing:"]', when: '.mg-brew .bw-make', after: 'bw-cup', need: true, hand: 'group', tip: '수첩을 보고 재료를 눌러 넣어요' },
  { key: 'bw-make', sel: '.mg-brew .bw-make', after: 'bw-ing', need: true, hand: 'on', tip: '다 넣으면 눌러요' },
  { key: 'bw-hold', sel: '.mg-brew .bw-hold:not(:disabled)', need: true, hand: 'on', tip: '꾹 누르고, 알맞아요 칸에서 떼요' },
  { key: 'bw-beat', sel: '.mg-brew .bw-now:not(:disabled)', need: true, hand: 'on', tip: '동그라미가 겹칠 때 눌러요' },
  { key: 'bw-serve', sel: '.mg-brew .bw-serve', need: true, hand: 'on', tip: '다 만들면 손님께 드려요' },
  { key: 'wk-mag', sel: '.wk-board .wk-pool .wk-mag', need: true, hand: 'group', tip: '붙일 자석을 눌러요' },
  { key: 'wk-slot', sel: '.wk-board .wk-slot', after: 'wk-mag', max: 2, tip: '칸을 누르면 고르거나 뗄 수 있어요' },
  { key: 'wk-ok', sel: '.wk-board .wk-ok', after: 'wk-slot', need: true, hand: 'on', tip: '다 짜면 눌러요' },
  { key: 'wk-hand', sel: '.wk-now .wk-hand', need: true, hand: 'group', tip: '직접 할지, 볼지 골라요' },
  { key: 'wk-next', sel: '.wk-next', need: true, hand: 'on', tip: '눌러서 다음 시간으로' },

  /* ---------- 결과 화면 ---------- */
  { key: 'rs-feel', sel: '.scr-result .rs-feel-btn', need: true, hand: 'group', tip: '오늘 기분을 골라요' },
  { key: 'rs-next', sel: '.scr-result .btn-big.btn-main', need: true, hand: 'on', tip: '눌러서 넘어가요' },

  /* ---------- 안 눌러도 되는 것(두 번 보여 주면 배운 것으로) ---------- */
  { key: 'term', sel: '#layer-dock .dlg .term', max: 2, hand: 'on', tip: '눌러 보면 뜻을 알려 줘요' },
  { key: 'help', sel: '#layer-task .cards-wrap.is-in .btn-help', after: 'card', max: 2, hand: 'on', tip: '모르겠으면 눌러요' },
  { key: 'alt', sel: '.ov-oops .oops-btns .btn-soft', after: 'rewind', max: 2, tip: '이대로 이어 갈 수도 있어요' },
  { key: 'listen', sel: '.ov-gloss .gloss-btns .btn-small, .ov-crew .btn-small, .mg .mg-say', after: 'ok', max: 2, tip: '누르면 읽어 줘요' },
  { key: 'card-say', sel: '#layer-task .cards-wrap.is-in .card-say', after: 'help', max: 2, tip: '소리 그림: 카드를 읽어 줘요' },
  { key: 'iv-tab', sel: '.iv .iv-tab', after: 'iv-chip', max: 2, tip: '대답하는 방법을 바꿀 수 있어요' },
  { key: 'iv-help', sel: '.iv .iv-help .btn', after: 'iv-chip', max: 2, tip: '못 들었으면 눌러요' },
  { key: 'wk-auto', sel: '.wk-auto', after: 'wk-next', max: 2, tip: '누르면 저절로 흘러가요' },
  { key: 'mg-order-out', sel: '.mg .od-in', after: 'mg-order', max: 2, hand: 'on', tip: '누르면 하나 빼요' },
  { key: 'bw-watch', sel: '.mg-brew .bw-watch:not(:disabled)', after: 'bw-hold', max: 2, hand: 'on', tip: '먼저 보고 싶으면 눌러요' },
  { key: 'bw-book', sel: '.mg-brew .bw-book-btn', after: 'bw-cup', max: 2, hand: 'on', tip: '레시피가 궁금하면 눌러요' },
  { key: 'bw-again', sel: '.mg-brew .bw-again', max: 2, hand: 'on', tip: '다시 해 볼 수 있어요' }, // 주문서 확인: 트레이 물건 빼기(터치에서 찾기 어려웠음)

  /* ---------- 늘 있는 버튼: 프롤로그 guide() 로 소개 ---------- */
  { key: 'hud-memo', sel: '.hud .hud-btn[aria-label="메모"]', guide: true, hand: 'on', tip: '메모: 할 일 칠판을 접고 펴요' },
  { key: 'hud-rewind', sel: '.hud .hud-rewind', guide: true, hand: 'on', tip: '되감기: 판단 장면 앞으로 돌아가요' },
  { key: 'dlg-replay', sel: '#layer-dock .dlg-btn[aria-label="다시 듣기"]', guide: true, hand: 'on', tip: '다시 듣기: 한 번 더 읽어 줘요' },
  { key: 'dlg-backlog', sel: '#layer-dock .dlg-btn[aria-label="지난 대화"]', guide: true, hand: 'on', tip: '지난 대화: 지나간 말을 다시 봐요' },
  { key: 'hud-notebook', sel: '.hud .hud-notebook', guide: true, hand: 'on', tip: '수첩: 도장과 말 사전을 봐요' },
  { key: 'hud-recipe', sel: '.hud .hud-recipe', guide: true, hand: 'on', tip: '레시피: 메뉴마다 만드는 법을 봐요' },
  { key: 'hud-pause', sel: '.hud .hud-btn[aria-label="멈춤"]', guide: true, hand: 'on', tip: '멈춤: 쉬기 · 저장하기 · 불러오기' },
  { key: 'hud-settings', sel: '.hud .hud-btn[aria-label="설정"]', guide: true, hand: 'on', tip: '설정: 글자 크기와 소리를 바꿔요' },
  { key: 'dlg-auto', sel: '#layer-dock .dlg-btn[aria-label="자동"]', guide: true, hand: 'on', tip: '자동: 말이 저절로 넘어가요' },
  // 급한 장면의 시간 제한 막대(버튼은 아님): 첫 급한 장면 앞의 guide('timer') 안내 동안 막대에 무지개 테두리
  { key: 'timer', sel: '.cards-wrap .tm, .mg .tm', guide: true, tip: '막대가 다 줄기 전에 골라요' },
];

export const TUT_BY_KEY = Object.fromEntries(TUT.map((k) => [k.key, k]));

/** guide() 비트에 쓸 수 있는 종류 (검사기용): 늘 있는 버튼 + 이야기 속 첫 행동 */
export const GUIDE_KEYS = TUT.filter((k) => k.guide || ['next', 'term', 'card', 'help', 'rewind', 'act'].includes(k.key)).map((k) => k.key);
