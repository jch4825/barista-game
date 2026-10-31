/**
 * 이벤트 CG (감정 포인트의 전체 화면 그림, assets/cg/cg_{id}.jpg)
 * 대본의 cg('id') 비트가 씀. 그림이 없으면 임시 그림(js/ui/cg-placeholder.js: 배경 + 얼굴 + 소품 + '대체 요망')이 대신 섬.
 * 2026-10-28 사용자 결정: 감성적인 대사·상황마다 CG 를 띄움. 그림 요청서는 docs/image_requests.md 6장 · docs/requests_full.md
 * 대응 장면(js/data/regulars.js): 힌트 장면에서 뜨고, 맞는 대응은 그 장면만의 CG 로 바뀜, 무난·어긋남은 힌트 CG 가 이어짐.
 *  ep: 처음 나오는 날 · title: 수첩 · 임시 그림의 제목
 *  ph: 임시 그림 { bg, v(배경 변형), cast: ['인물:표정'], props: [아이콘], desc(한 줄), night, board(칠판) }
 *  chalk: 칠판 글씨 자리 { x, y, w, rot }(%) — chalk() 비트가 씀
 */

const P = (bg, v, cast = [], props = [], desc = '', extra = {}) => ({ bg, v, cast, props, desc, ...extra });

export const CGS = {
  /* ---------- 봄 ---------- */
  memory_city: { ep: 'spring_1', title: '기억 · 도시의 큰 카페', ph: P('hall', 'busy_summer', ['jieun:nervous'], ['clock'], '줄이 길다. "빨리 좀 해 주세요!"') },
  spring_first_cup: { ep: 'spring_1', title: '봄 · 첫 컵', ph: P('hall', 'evening', ['owner', 'jieun:nervous'], ['milk'], '사장님이 건네는 따뜻한 우유') },
  owner_closing_milk: { ep: 'spring_2', title: '봄 · 마감 우유', ph: P('hall', 'evening', ['owner'], ['milk'], '마감 뒤 혼자 마시는 우유', { night: true }) },
  haesun_two_cups: { ep: 'spring_2', title: '우유 두 잔과 빈 의자', ph: P('hall', 'spring', ['haesun'], ['chair', 'milk'], '창가 자리, 빈 의자') },
  haesun_cup_for_him: { ep: 'spring_2', title: '의자 앞의 잔', ph: P('hall', 'spring', ['haesun:smile'], ['milk', 'chair'], '빈 의자 앞에 놓인 잔') },
  kang_dark_window: { ep: 'spring_3', title: '불 꺼진 창', ph: P('cafe_front', 'morning', ['kang'], ['light_off'], '새벽, 깜깜한 카페 앞', { night: true }) },
  kang_light_on: { ep: 'spring_3', title: '불 켜진 창', ph: P('cafe_front', 'morning', ['kang:smile'], ['light'], '창에 불이 들어온다') },
  do_standing: { ep: 'spring_3', title: '서서 마시는 사람', ph: P('hall', 'spring', ['do:smile'], ['bag'], '무거운 우편 가방') },
  do_chair_out: { ep: 'spring_3', title: '빼 둔 의자', ph: P('hall', 'spring', ['do:smile'], ['chair'], '한 칸 빼 둔 의자') },
  do_rain_letters: { ep: 'spring_4', title: '젖은 편지', ph: P('hall', 'spring', ['do:worried'], ['note'], '자기보다 편지를 먼저') },
  do_towel: { ep: 'spring_4', title: '마른 수건', ph: P('hall', 'spring', ['do:smile'], ['towel'], '편지가 안 젖었네') },
  spring_crew: { ep: 'spring_5', title: '봄 · 벚꽃 주간의 촬영', ph: P('alley', 'morning', ['actor', 'agent'], ['camera'], '골목에 벚꽃, 촬영 팀') },
  actor_quiet: { ep: 'spring_5', title: '조용해서 좋네요', ph: P('hall', 'spring', ['actor:smile'], ['window'], '창밖의 벚꽃') },
  owner_cup_shake: { ep: 'spring_5', title: '아주 조금 흔들린 잔', ph: P('hall', 'evening', ['owner:think'], ['milk'], '사장님은 잔을 두 손으로 잡는다', { night: true }) },
  kang_window_sea: { ep: 'spring_6', title: '바다 안 나가요', ph: P('harbor', 'dawn', ['kang'], ['window'], '항구 끝의 빈자리') },
  kang_warm_cup: { ep: 'spring_6', title: '따뜻한 새 잔', ph: P('hall', 'morning', ['kang:smile'], ['coffee'], '두 손으로 감싼 잔') },
  spring_name: { ep: 'spring_7', title: '봄 · 지은 씨', ph: P('hall', 'spring', ['haesun:smile', 'jieun:smile'], [], '"지은 씨, 내일 또 봐요."') },

  /* ---------- 여름 ---------- */
  summer_rumor: { ep: 'summer_1', title: '여름 · 사진을 들고 온 사람들', ph: P('cafe_front', 'morning', ['customer:smile'], ['camera'], '"배우가 다녀간 카페!"') },
  summer_cameo: { ep: 'summer_1', title: '바다를 보러 온 두 사람', ph: P('hall', 'summer', ['yeonwoo:smile', 'dohyun:smile'], ['window'], '쉬는 날, 바닷가 마을') },
  han_watch: { ep: 'summer_2', title: '10분', ph: P('hall', 'morning', ['han'], ['clock'], '마지막 밤 버스') },
  han_sits: { ep: 'summer_2', title: '앉아서 마시는 10분', ph: P('hall', 'morning', ['han:smile'], ['chair'], '오랜만에 앉은 의자') },
  eunju_cold_cup: { ep: 'summer_3', title: '늘 식는 커피', ph: P('hall', 'summer', ['eunju:sad'], ['coffee'], '한 모금도 못 마신 라테') },
  eunju_thick_cup: { ep: 'summer_3', title: '두꺼운 컵', ph: P('hall', 'summer', ['eunju:smile'], ['coffee', 'lid'], '이건 천천히 식어요') },
  sumin_corner: { ep: 'summer_3', title: '구석의 이어폰', ph: P('hall', 'summer', ['sumin'], ['book'], '벽 쪽으로 돌린 의자') },
  sumin_nod: { ep: 'summer_3', title: '작은 끄덕임', ph: P('hall', 'summer', ['sumin:smile'], ['cup'], '말없이 놓인 보리차') },
  noh_spoon: { ep: 'summer_4', title: '떨리는 숟가락', ph: P('hall', 'summer', ['owner:think', 'noh'], ['coffee'], '종이컵 안의 숟가락') },
  noh_window_talk: { ep: 'summer_4', title: '바람이 좋네', ph: P('hall', 'summer', ['noh:smile'], ['window'], '창밖의 잔잔한 바다') },
  owner_apron: { ep: 'summer_4', title: '다시 맨 앞치마 끈', ph: P('hall', 'evening', ['owner', 'jieun'], ['apron'], '아무 말 없이', { night: true }) },
  do_heavy_bag: { ep: 'summer_5', title: '무거운 가방', ph: P('hall', 'summer', ['do:worried'], ['bag'], '소포가 많은 계절') },
  do_hook: { ep: 'summer_5', title: '문 옆의 못', ph: P('hall', 'summer', ['do:smile'], ['bag', 'hand'], '어깨가 가볍네') },
  eunju_listens: { ep: 'summer_5', title: '옆 탁자의 웃음소리', ph: P('hall', 'summer', ['eunju'], ['speech'], '아기랑만 하는 이야기') },
  eunju_baby_talk: { ep: 'summer_5', title: '여섯 달', ph: P('hall', 'summer', ['eunju:smile'], ['heart'], '어제 처음 뒤집기를 했어요') },
  summer_line: { ep: 'summer_6', title: '여름 · 골목 끝까지 선 줄', ph: P('alley', 'morning', ['jieun:nervous'], ['team'], '골목 끝까지 선 줄') },
  owner_pocket: { ep: 'summer_6', title: '주머니 속의 손', ph: P('hall', 'busy_summer', ['owner:think'], ['caution'], '컵을 흘린 뒤') },
  sumin_eave: { ep: 'summer_6', title: '처마 밑의 비', ph: P('cafe_front', 'morning', ['sumin'], ['water'], '우산이 없다', { night: true }) },
  sumin_umbrella: { ep: 'summer_6', title: '세워 둔 우산', ph: P('cafe_front', 'morning', ['sumin:smile'], ['door'], '작은 인사', { night: true }) },
  summer_chalk_rule: { ep: 'summer_6', title: '여름 · 동네 시간', ph: P('hall', 'evening', ['owner'], ['memo'], '사장님이 칠판에 쓴 한 줄', { board: true, night: true }), chalk: { x: 62, y: 38, w: 46, rot: -2 } },
  han_clock: { ep: 'summer_7', title: '여섯 시 십 분', ph: P('hall', 'morning', ['jieun'], ['clock', 'bus'], '종점의 버스 불빛') },
  han_cup_ready: { ep: 'summer_7', title: '미리 놓인 컵', ph: P('hall', 'morning', ['han:surprised'], ['cup'], '내 거예요?') },
  kang_returns: { ep: 'summer_7', title: '며칠 만에 온 날', ph: P('hall', 'morning', ['kang'], ['window'], '두 손을 탁자 위에') },
  kang_black_again: { ep: 'summer_7', title: '이 맛이지', ph: P('hall', 'morning', ['kang:smile'], ['coffee'], '늘 쓰던 잔') },
  summer_village_time: { ep: 'summer_7', title: '여름 · 동네 시간의 첫 아침', ph: P('hall', 'morning', ['kang', 'do:smile', 'han', 'noh', 'haesun:smile'], ['sign_open'], '조용한 새벽, 단골 다섯') },

  /* ---------- 가을 ---------- */
  autumn_first_drip: { ep: 'autumn_1', title: '처음 내리는 새벽 블랙', ph: P('hall', 'autumn', ['owner', 'jieun:determined'], ['coffee'], '오늘부터 지은 씨가 내려요') },
  kang_suit: { ep: 'autumn_2', title: '양복', ph: P('hall', 'autumn', ['kang'], ['badge'], '낡은 양복과 거친 손') },
  kang_suit_cup: { ep: 'autumn_2', title: '역시 여기가 편하네', ph: P('hall', 'autumn', ['kang:smile'], ['coffee'], '느슨하게 푼 넥타이') },
  han_photo: { ep: 'autumn_2', title: '딸 사진', ph: P('hall', 'autumn', ['han'], ['phone', 'pen'], '쓸 종이가 없다') },
  han_memo: { ep: 'autumn_2', title: '메모지 한 장', ph: P('hall', 'autumn', ['han:smile'], ['note'], '딸한테요') },
  noh_shelf: { ep: 'autumn_3', title: '낮아진 선반', ph: P('hall', 'autumn', ['noh'], ['hand'], '사장님이 없는 사이') },
  noh_wink: { ep: 'autumn_3', title: '눈치가 있구먼', ph: P('hall', 'autumn', ['noh:smile'], ['freeze'], '입에 댄 손가락') },
  eunju_door: { ep: 'autumn_3', title: '걸리는 유모차', ph: P('hall', 'autumn', ['eunju:worried'], ['chair'], '좁은 통로') },
  eunju_space: { ep: 'autumn_3', title: '창가 자리', ph: P('hall', 'autumn', ['eunju:smile'], ['window'], '아기가 바다를 좋아해요') },
  festival_rush: { ep: 'autumn_4', title: '가을 · 마을 축제', ph: P('festival_alley', 'autumn', ['jieun:nervous'], ['team'], '골목 가득한 축제 손님') },
  owner_drop: { ep: 'autumn_4', title: '손님들 앞에서 놓친 컵', ph: P('hall', 'autumn', ['owner:think', 'jieun:surprised'], ['caution'], '쨍그랑, 그리고 조용함') },
  machine_stop: { ep: 'autumn_4', title: '멈춘 머신', ph: P('hall', 'autumn', ['jieun:nervous'], ['light_off'], '전기가 나갔다') },
  autumn_key: { ep: 'autumn_4', title: '가을 · 가게 열쇠', ph: P('hall', 'evening', ['owner', 'jieun'], ['door'], '내일은 네가 연다', { night: true }) },
  autumn_dawn_open: { ep: 'autumn_5', title: '가을 · 혼자 여는 새벽', ph: P('cafe_front', 'morning', ['jieun:determined'], ['door'], '열쇠가 딸깍 돌아간다', { night: true }) },
  haesun_alley_greet: { ep: 'autumn_5', title: '골목의 첫 인사', ph: P('alley', 'morning', ['haesun:smile', 'jieun'], ['greet'], '내가 첫 손님 할게요') },
  do_notice: { ep: 'autumn_5', title: '퇴직 소식', ph: P('hall', 'autumn', ['do'], ['note'], '소식지의 사진') },
  do_cup_chair: { ep: 'autumn_5', title: '의자 앞의 잔', ph: P('hall', 'autumn', ['do:smile'], ['chair', 'cup'], '겨울이면 그만둬요') },
  do_first_sit: { ep: 'autumn_5', title: '서른 해 만에 앉은 의자', ph: P('hall', 'autumn', ['do:smile'], ['chair'], '가방은 문 옆 못에') },
  sumin_brochure: { ep: 'autumn_5', title: '떨어진 안내서', ph: P('hall', 'autumn', ['sumin:nervous'], ['book'], '도시의 대학교') },
  sumin_brochure_back: { ep: 'autumn_5', title: '뒤집어 건넨 종이', ph: P('hall', 'autumn', ['sumin'], ['book'], '보지 않았어요') },
  sumin_exam_morning: { ep: 'autumn_6', title: '수능 날 아침', ph: P('hall', 'morning', ['sumin:nervous'], ['pen'], '떨리는 손') },
  sumin_sleeve: { ep: 'autumn_6', title: '슬리브의 파도', ph: P('hall', 'morning', ['sumin:smile'], ['cup'], '다녀올게요') },
  han_fog: { ep: 'autumn_6', title: '안개로 늦은 날', ph: P('bus_terminal', 'evening', ['han:worried'], ['clock'], '남은 시간 3분') },
  han_cup_hands: { ep: 'autumn_6', title: '두 손으로 건넨 잔', ph: P('hall', 'morning', ['han:smile'], ['cup'], '오늘은 이 한 모금이면 돼요') },
  jieun_spill: { ep: 'autumn_6', title: '혼자 서두른 날', ph: P('hall', 'autumn', ['jieun:sad'], ['caution'], '쏟아진 라테') },
  owner_memo: { ep: 'autumn_6', title: '선반의 메모', ph: P('hall', 'evening', ['jieun'], ['note'], '서두르면 쏟는다', { night: true }) },
  noh_empty_mug: { ep: 'autumn_7', title: '사장님의 빈 잔', ph: P('hall', 'evening', ['noh'], ['milk'], '선반 위의 하얀 잔', { night: true }) },
  noh_newspaper: { ep: 'autumn_7', title: '펴 놓은 신문', ph: P('hall', 'evening', ['noh'], ['note'], '그 잔 줘', { night: true }) },
  noh_same: { ep: 'autumn_7', title: '가을 · 같네', ph: P('hall', 'evening', ['noh:smile', 'jieun'], ['coffee'], '사장님 방식의 믹스커피', { night: true }) },

  /* ---------- 겨울: 대본을 쓰며 더함 ---------- */
  blackout_cafe_lit: { ep: 'winter_4', title: '겨울 · 불 켜진 카페', ph: P('hall', 'blackout', [], ['light'], '마을에서 불이 켜진 곳은 카페뿐', { night: true }) },
  // 해순 할머니: 힌트 장면 · 맞는 대응
  summer_tourist_chair: { ep: 'summer_2', title: '그 의자의 손님', ph: P('hall', 'summer', ['haesun:look', 'customer'], ['chair'], '관광객이 빈 의자에 앉는다') },
  haesun_small_bow: { ep: 'summer_2', title: '할머니의 작은 인사', ph: P('hall', 'summer', ['haesun:smile'], ['chair'], '다시 빈 의자') },
  autumn_window_haesun: { ep: 'autumn_1', title: '창가에서 기다리는 할머니', ph: P('hall', 'autumn', ['haesun:look'], ['window'], '두 손을 무릎에 모으고') },
  haesun_one_cup_wait: { ep: 'autumn_1', title: '한 잔과 빈 의자', ph: P('hall', 'autumn', ['haesun:smile'], ['milk', 'chair'], '오늘은 내가 마실게요') },
  winter_blanket_chair: { ep: 'winter_4', title: '담요와 빈 의자', ph: P('hall', 'blackout', ['haesun:look', 'jieun'], ['cloth', 'chair'], '촛불 아래', { night: true }) },
  haesun_blanket_chair_warm: { ep: 'winter_4', title: '이 의자도 따뜻하네요', ph: P('hall', 'blackout', ['haesun:smile'], ['cloth', 'chair'], '담요를 덮은 빈 의자', { night: true }) },
  winter_granddaughter: { ep: 'winter_6', title: '할머니와 손녀', ph: P('hall', 'winter', ['haesun', 'granddaughter'], ['chair'], '두 사람이 빈 의자를 본다') },
  haesun_three_cups: { ep: 'winter_6', title: '세 번째 잔', ph: P('hall', 'winter', ['haesun:smile', 'granddaughter:smile'], ['milk', 'milk', 'milk'], '할아버지 것도 있네!') },
  // 지안: 힌트 장면 · 맞는 대응
  jian_color_menu: { ep: 'summer_1', title: '메뉴판의 색 동그라미', ph: P('hall', 'summer', ['jian:shy'], ['menu'], '색 동그라미를 하나씩 본다') },
  jian_yellow: { ep: 'summer_1', title: '노란색', ph: P('hall', 'summer', ['jian:smile'], ['tea'], '노란색이요. 유자차 주세요.') },
  jian_summer_corner: { ep: 'summer_4', title: '색이 다 똑같아 보여요', ph: P('hall', 'busy_summer', ['jian:shy'], ['book'], '스케치북을 꼭 안고') },
  jian_green_cold: { ep: 'summer_4', title: '초록색', ph: P('hall', 'summer', ['jian:smile'], ['icecup'], '녹차라테, 차갑게요') },
  jian_autumn_window: { ep: 'autumn_1', title: '창밖의 노란 잎', ph: P('hall', 'autumn', ['jian'], ['window'], '노란 은행잎') },
  jian_opens_sketchbook: { ep: 'autumn_1', title: '다시 펼친 스케치북', ph: P('hall', 'autumn', ['jian:smile'], ['book'], '빈 종이를 편다') },
  winter_candle_jian: { ep: 'winter_4', title: '촛불 옆의 빈 스케치북', ph: P('hall', 'blackout', ['jian:shy'], ['light', 'book'], '빈 종이', { night: true }) },
  jian_first_line: { ep: 'winter_4', title: '첫 선', ph: P('hall', 'blackout', ['jian:smile'], ['pen'], '주황색, 촛불 색', { night: true }) },
  jian_snow_sketchbook: { ep: 'winter_5', title: '두툼해진 스케치북', ph: P('hall', 'winter', ['jian:shy'], ['book'], '알록달록한 종이 끝') },
  jian_many_colors: { ep: 'winter_5', title: '오늘은 여러 색', ph: P('hall', 'winter', ['jian:smile'], ['heart'], '여러 색이요') },
};

export const CG_IDS = Object.keys(CGS);
