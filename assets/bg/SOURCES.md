# 배경 그림 원래 파일 이름

## 2026-10-29 새 배경(바닷가 마을 카페, `docs/image_requests.md` 5장)

사용자가 Google Flow로 만들어 2K(2752×1536)로 받은 그림을 `assets/flow/`에 넣은 것을 ID 이름으로 옮겼습니다. 화면에서는 1920×1080에 맞춰 꽉 채웁니다(object-fit: cover). Flow 파일 이름에 시각이 없어 받은 시각(파일 시각)을 비고에 적습니다.

| 게임 파일 | 원래 이름 | 쓰이는 장면 |
| :--- | :--- | :--- |
| `hall_morning.jpg` | `Anime_cafe_interior_in_morning_bcf994be_2K.jpg` | 카페 홀 · 아침(기본 장면) · 2026-10-29 21:26 |
| `hall_evening.jpg` | `Cafe_interior_at_dusk_49d3a500_2K.jpg` | 카페 홀 · 마감(봄 마감 우유) · 2026-10-29 21:27 |
| `cafe_front_morning.jpg` | `Cafe_exterior_in_seaside_village_657a2d99_2K.jpg` | 카페 앞 · 아침(엔딩 자리 표시 · 근무표 칸) · 2026-10-29 21:48 |
| `title_cafe_dusk.jpg` | `Cafe_exterior_at_blue_hour_0e12efce_2K.jpg` | 처음 화면 · 2026-10-29 22:14 |
| `ui_sea_night.jpg` | `Night_view_of_calm_sea_b97a69b1_2K.jpg` | 전체 화면 창 바탕(근무표·설정·수첩·결과) · 2026-10-29 22:15 |
| `ui_cafe_dim.jpg` | `Calm_sea_viewed_from_window_12e14554_2K.jpg` | 이야기 중에 여는 창 바탕(멈춤·지난 대화·되감기) · 2026-10-29 22:17 |
| `hall_spring.jpg` | `Interior_room_with_window_seat_0b7262ff_2K.jpg` | 카페 홀 · 봄(봄 첫 장면) · 2026-10-29 22:18 |
| `hall_summer.jpg` | `Interior_layout_with_sea_view_a5ea62c6_2K.jpg` | 카페 홀 · 여름(여름 '며칠 뒤') · 2026-10-29 22:19 |
| `hall_autumn.jpg` | `Cozy_room_with_window_seat_87cafe2a_2K.jpg` | 카페 홀 · 가을 · 2026-10-29 22:20 |
| `hall_winter.jpg` | `Cozy_winter_interior_illustration_09d1786a_2K.jpg` | 카페 홀 · 겨울(겨울 '며칠 뒤') · 2026-10-29 22:21 |
| `hall_blackout.jpg` | `Candles_lit_snowy_cafe_interior_d1f8b29f_2K.jpg` | 카페 홀 · 겨울 정전 밤 · 2026-10-29 22:22 |
| `alley_morning.jpg` | `Alley_leading_to_seaside_cafe_64f4d21e_2K.jpg` | 바닷가 골목(아직 대본에 없음) · 2026-10-29 22:23 |
| `harbor_dawn.jpg` | `Fishing_harbor_at_dawn_98f286a7_2K.jpg` | 항구 · 새벽(아직 대본에 없음) · 2026-10-29 22:24 |
| `hall_busy_summer.jpg` | `Anime_cafe_interior_design_backg…_6465513c_2K.jpg` | 카페 홀 · 여름 줄(여름 첫 장면) · 2026-10-29 22:25 |
| `bus_terminal_evening.jpg` | `Village_bus_at_seaside_evening_e91ef768_2K.jpg` | 버스 종점 · 저녁(아직 대본에 없음) · 2026-10-29 22:26 |
| `hardware_front.jpg` | `Hardware_store_storefront_in_vil…_6bd17865_2K.jpg` | 철물점 앞(아직 대본에 없음) · 2026-10-29 22:27 |
| `post_office_front.jpg` | `Post_office_building_in_alley_b737af03_2K.jpg` | 우체국 앞(아직 대본에 없음) · 2026-10-29 22:27 |
| `backroom.jpg` | `Cafe_storage_room_interior_3f70e456_2K.jpg` | 카페 뒷방(아직 대본에 없음) · 2026-10-29 22:28 |
| `jieun_room_night.jpg` | `Desk_illuminated_by_warm_lamp_e67e25ab_2K.jpg` | 지은의 방 · 밤(아직 대본에 없음) · 2026-10-29 22:29 |
| `festival_alley_autumn.jpg` | `Alley_decorated_for_autumn_festival_a53c331d_2K.jpg` | 가을 축제의 골목(아직 대본에 없음) · 2026-10-29 22:30 |
| `workbench_morning.jpg` | `Barista_counter_in_seaside_cafe_ae055ecd_2K.jpg` | 작업대(커피 만들기) 배경 · 2026-10-29 21:25 |

- 대본에서는 `bg('hall', 'spring')`처럼 씁니다(`js/data/backgrounds.js`의 `PHOTO_SCENES`, 그림이 없으면 비슷한 임시 그림).
- 같은 날 만든 그림 가운데 쓰지 않은 것은 `assets/_src/flow_unused/`에 둡니다: 카페 앞 첫 시안(`Cafe_in_seaside_village_19e544d2_2K.jpg`, 간판에 글자가 있음) · 메뉴 뒤 첫 시안(`Game_menu_background_plate_7d6701d3_2K.jpg`).

## 직업 마1스톤에서 가져온 배경(2026-10-10, 1376×768)

새 배경으로 바뀐 11장(`counter_morning`·`counter_day`·`counter_closing`·`counter_peak`·`bus_stop_morning`·`bus_stop_evening`·`staff`·`kitchen`·`home_morning`·`home_night`, 빨간 차양의 옛 `cafe_front_morning`)은 2026-10-29에 `assets/_src/bg_old/`로 옮겼습니다(배포에서 빠짐, 원본 `C:\AI\game`에도 있음). 아래 셋은 새 이야기에 쓸 곳이 없어 나중에 지웁니다.

| 게임 파일 | 원래 이름 | 쓰이는 장면 |
| :--- | :--- | :--- |
| `city_cafe_rush.jpg` | `Customers_waiting_in_bakery_cafe_20261010155034.jpg`(직업 마1스톤의 `counter_peak.jpg`, 2026-11-01 사용자 "마1스톤의 붐비는 카페 이미지 받아와라") | 봄 1일 도시 카페의 점심시간(러시) |
| `living.jpg` | `Apartment_living_room_with_lamp_20261010155029.jpg` | (쓰지 않음) |
| `office.jpg` | `Manager_office_in_bakery_20261010155041.jpg` | (쓰지 않음) |
| `tea.jpg` | `Two_empty_mugs_on_table_20261010155042.jpg` | (쓰지 않음) |
