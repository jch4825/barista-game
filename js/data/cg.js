/**
 * 이벤트 CG (감정 포인트의 전체 화면 그림, assets/cg/cg_{id}.jpg)
 * 대본의 cg('id') 비트가 씀. 그림이 없으면 임시 그림(js/ui/cg-placeholder.js: 배경 + 얼굴 + 소품 + '대체 요망')이 대신 섬.
 * ✅ 2026-11-06 사용자 결정(PRD Q-53, 검수 13.62): CG 는 결정적인 장면에만 → 첫 컵 · 계절 폭발 사건 · 겨울 밤 단골 모임 · 겨울 끝과 엔딩 ·
 *   단골 비밀 장면 8(엔딩 앨범) · 엔딩 '사장의 눈' 12컷. 나머지 장면은 배경 + 인물(무대)로. 단골 대응(regulars.js)에는 CG 를 쓰지 않음
 *   (예전: 2026-10-28 감성적인 대사·상황마다 CG. 그때 만든 그림은 assets/_src/cg_unused/ · 대본 기록은 git).
 *   그림 요청서는 docs/requests_full.md · docs/추가 제작.md
 *  ep: 처음 나오는 날 · title: 수첩 · 임시 그림의 제목
 *  ph: 임시 그림 { bg, v(배경 변형), cast: ['인물:표정'], props: [아이콘], desc(한 줄), night, board(칠판), refs(요청서의 참조 그림을 더함) }
 *  chalk: 칠판 글씨 자리 { x, y, w, rot }(%) — chalk() 비트가 씀
 */

const P = (bg, v, cast = [], props = [], desc = '', extra = {}) => ({ bg, v, cast, props, desc, ...extra });

export const CGS = {
  /* ---------- 봄 ---------- */
  spring_first_cup: { ep: 'spring_1', title: '봄 · 첫 컵', ph: P('hall', 'evening', ['owner', 'jieun:nervous'], ['milk'], '사장님이 건네는 따뜻한 우유') },
  spring_crew: { ep: 'spring_5', title: '봄 · 벚꽃 주간의 촬영', ph: P('alley', 'morning', ['actor', 'agent'], ['camera'], '골목에 벚꽃, 촬영 팀') },

  /* ---------- 여름 ---------- */
  summer_line: { ep: 'summer_6', title: '여름 · 골목 끝까지 선 줄', ph: P('alley', 'morning', ['jieun:nervous'], ['team'], '골목 끝까지 선 줄') },

  /* ---------- 가을 ---------- */
  autumn_key: { ep: 'autumn_4', title: '가을 · 가게 열쇠', ph: P('hall', 'evening', ['owner', 'jieun'], ['door'], '내일은 네가 연다', { night: true }) },

  /* ---------- 겨울 ---------- */
  kang_secret: { ep: 'winter_2', title: '배를 판 날', ph: P('harbor', 'dawn', ['kang:think'], ['window'], '그날 바다가 참 잔잔했어') },
  sumin_secret: { ep: 'winter_3', title: '합격 통지서', ph: P('hall', 'winter', ['sumin:smile', 'jieun:smile'], ['note'], '여기서 열고 싶었어요') },
  blackout_cafe_lit: { ep: 'winter_4', title: '겨울 · 불 켜진 카페', ph: P('hall', 'blackout', [], ['light'], '마을에서 불이 켜진 곳은 카페뿐', { night: true }) },
  winter_gathering: { ep: 'winter_4', title: '겨울 · 단골 여덟 명', ph: P('hall', 'blackout', ['haesun:smile', 'kang', 'do:smile', 'jian:smile'], ['light', 'coffee'], '각자의 방식으로 돕는 밤', { night: true }) },
  do_secret: { ep: 'winter_5', title: '마지막 우편', ph: P('hall', 'winter', ['do:smile', 'jieun'], ['note'], '지은 씨 앞으로 온 편지') },
  han_secret: { ep: 'winter_5', title: '컵 속의 쪽지', ph: P('hall', 'winter', ['han:smile'], ['note'], '아빠가 먼저 갈게') },
  haesun_secret: { ep: 'winter_6', title: '남편의 마지막 주문', ph: P('hall', 'winter', ['haesun:smile'], ['milk', 'milk'], '우유 두 잔') },
  noh_secret: { ep: 'winter_6', title: '처음 떨린 날', ph: P('hall', 'winter', ['noh:think'], ['light'], '가게 불 꺼지면 네가 켜라') },
  eunju_secret: { ep: 'winter_6', title: '일주일의 말', ph: P('hall', 'winter', ['eunju:smile'], ['speech'], '여기서 처음 말했어요') },
  jian_secret: { ep: 'winter_6', title: '지은의 손', ph: P('hall', 'winter', ['jian:smile', 'jieun:surprised'], ['book', 'hand'], '커피 내리는 손') },
  winter_owner_return: { ep: 'winter_7', title: '겨울 · 컵 닦았냐', ph: P('hall', 'winter', ['owner:smile', 'jieun:surprised'], ['door'], '눈이 그친 아침') },
  winter_milk_handover: { ep: 'winter_7', title: '겨울 · 두 손에 쥐여 준 우유', ph: P('hall', 'evening', ['jieun:smile', 'owner:smile'], ['milk'], '받던 사람이 받치는 사람이 된다', { night: true }) },
  winter_chalk_name: { ep: 'winter_7', title: '마지막 컷 · 칠판의 빈칸', ph: P('hall', 'morning', ['owner:smile'], ['memo'], '오른쪽 아래 빈칸', { board: true }), chalk: { x: 74, y: 52, w: 20, rot: -4 } },
  ending_last_cup: { ep: 'ending', title: '엔딩 · 따뜻한 우유 한 컵', ph: P('hall', 'morning', ['jieun:smile', 'owner:smile'], ['milk', 'milk'], '나란히 앉아 마시는 따뜻한 우유') },
  // 엔딩 '사장의 눈' 11컷(js/data/eyes.js): 같은 장면을 사장님 자리에서 본 그림. 지은은 조금 멀리, 사장님의 손이 앞에 보임
  eye_1: { ep: 'ending', title: '사장의 눈 1 · 컵을 깬 날', ph: P('hall', 'spring', ['jieun:sad'], ['mop'], '빗자루를 두 손으로 꼭 쥔 아이') },
  eye_2: { ep: 'ending', title: '사장의 눈 2 · 한 칸 내린 선반', ph: P('hall', 'morning', [], ['cup', 'hand'], '새벽, 컵을 한 칸 아래로 옮기는 손', { night: true }) },
  eye_3: { ep: 'ending', title: '사장의 눈 3 · 맛은 시간이 만든다', ph: P('hall', 'spring', ['jieun:nervous', 'geum'], ['clock'], '카운터 앞으로 나가며 본 두 사람') },
  eye_4: { ep: 'ending', title: '사장의 눈 4 · 빈 컵만', ph: P('hall', 'spring', ['jieun:determined'], ['cup', 'icecup'], '그 아이 뒤에 빈 컵을 놓는 손') },
  eye_5: { ep: 'ending', title: '사장의 눈 5 · 칠판의 빈칸', ph: P('hall', 'evening', [], ['memo', 'pen'], '오른쪽 아래만 비워 둔 칠판', { board: true, night: true, refs: ['hall_wall'] }) },
  eye_7: { ep: 'ending', title: '사장의 눈 7 · 앞치마 끈', ph: P('hall', 'evening', ['jieun'], ['apron', 'hand'], '등 뒤에서 다시 매 주는 끈', { night: true }) },
  eye_6: { ep: 'ending', title: '사장의 눈 6 · 저 친구가 내립니다', ph: P('hall', 'busy_summer', ['jieun:nervous', 'customer'], ['coffee'], '앞치마 주머니에서 손을 꺼내며', { refs: ['customer-sporty_normal'] }) },
  eye_8: { ep: 'ending', title: '사장의 눈 8 · 동네 시간', ph: P('hall', 'evening', ['jieun'], ['cup', 'memo'], '선반의 단골 잔들, 칠판 앞의 분필', { board: true, night: true }) },
  eye_9: { ep: 'ending', title: '사장의 눈 9 · 열쇠', ph: P('hall', 'evening', ['jieun:nervous'], ['lock', 'hand'], '주머니에서 꺼낸 낡은 열쇠', { night: true }) },
  eye_10: { ep: 'ending', title: '사장의 눈 10 · 서두르면 쏟는다', ph: P('hall', 'evening', [], ['note', 'cup'], '마감 선반에 붙이는 작은 메모', { night: true }) },
  eye_11: { ep: 'ending', title: '사장의 눈 11 · 먼 창의 불빛', ph: P('alley', 'morning', [], ['window', 'light'], '깜깜한 마을, 불이 켜진 창 하나', { night: true }) },
  // 덤 12번째 컷(재미 개편 3.2 웃음 줄기 '그 갈매기'의 끝): 사장님이 몰래 갈매기에게 빵을 줌
  eye_12: { ep: 'ending', title: '사장의 눈 덤 · 그 갈매기', ph: P('cafe_front', 'morning', ['owner'], ['bread'], '사장님이 몰래 갈매기에게 빵을 준다') },
};

export const CG_IDS = Object.keys(CGS);
