/**
 * 이벤트 CG (감정 포인트의 전체 화면 그림, assets/cg/cg_{id}.jpg)
 * 대본의 cg('id') 비트가 쓰고, 그림이 있을 때만 보입니다. 본 CG 는 수첩 사진첩에 모입니다.
 * 2026-10-28 사용자 결정: 감성적인 대사·상황마다 CG 를 띄움. 그림 요청서는 docs/image_requests.md 6장.
 * 대응 장면(js/data/regulars.js): 힌트 장면에서 뜨고, 맞는 대응은 그 장면만의 CG 로 바뀜, 무난·어긋남은 힌트 CG 가 이어짐.
 * 그림이 아직 없어도 자리만 잡아 둡니다(그림을 assets/cg/ 에 넣고 npm run assets 하면 바로 보임).
 */

export const CGS = {
  // 고정 장면(모든 학생)
  spring_first_cup: { ep: 'm1_spring', title: '봄 · 첫 컵' },
  owner_closing_milk: { ep: 'm1_spring', title: '봄 · 마감 우유' },
  summer_line: { ep: 'm1_summer', title: '여름 · 골목 끝까지 선 줄' },
  blackout_cafe_lit: { ep: 'm1_winter', title: '겨울 · 불 켜진 카페' },
  // 해순 할머니: 힌트 장면 · 맞는 대응
  haesun_two_cups: { ep: 'm1_spring', title: '우유 두 잔과 빈 의자' },
  haesun_cup_for_him: { ep: 'm1_spring', title: '의자 앞의 잔' },
  summer_tourist_chair: { ep: 'm1_summer', title: '그 의자의 손님' },
  haesun_small_bow: { ep: 'm1_summer', title: '할머니의 작은 인사' },
  autumn_window_haesun: { ep: 'm1_autumn', title: '창가에서 기다리는 할머니' },
  haesun_one_cup_wait: { ep: 'm1_autumn', title: '한 잔과 빈 의자' },
  winter_blanket_chair: { ep: 'm1_winter', title: '담요와 빈 의자' },
  haesun_blanket_chair_warm: { ep: 'm1_winter', title: '이 의자도 따뜻하네요' },
  winter_granddaughter: { ep: 'm1_winter', title: '할머니와 손녀' },
  haesun_three_cups: { ep: 'm1_winter', title: '세 번째 잔' },
  // 지안: 힌트 장면 · 맞는 대응
  jian_color_menu: { ep: 'm1_summer', title: '메뉴판의 색 동그라미' },
  jian_yellow: { ep: 'm1_summer', title: '노란색' },
  jian_summer_corner: { ep: 'm1_summer', title: '색이 다 똑같아 보여요' },
  jian_green_cold: { ep: 'm1_summer', title: '초록색' },
  jian_autumn_window: { ep: 'm1_autumn', title: '창밖의 노란 잎' },
  jian_opens_sketchbook: { ep: 'm1_autumn', title: '다시 펼친 스케치북' },
  winter_candle_jian: { ep: 'm1_winter', title: '촛불 옆의 빈 스케치북' },
  jian_first_line: { ep: 'm1_winter', title: '첫 선' },
  jian_snow_sketchbook: { ep: 'm1_winter', title: '두툼해진 스케치북' },
  jian_many_colors: { ep: 'm1_winter', title: '오늘은 여러 색' },
};

export const CG_IDS = Object.keys(CGS);
