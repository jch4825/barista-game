# 요청서 · 풀 버전 (그림 · 물건 · 블렌더 컷 · 소리 · 음성)

> 생성: `npm run requests`(`tools/export-requests.mjs`) · 이 파일은 직접 고치지 않습니다. 그림이 들어오면 다시 돌리면 목록에서 빠집니다.
> **그림 프롬프트만 보려면 `docs/아직 없는 그림.md`**(아직 없는 그림 · 영상의 프롬프트를 만들 순서대로 한 번호로 모은 것, 같은 명령이 함께 만듦).
> 사용자(2026-10-31): "부족한 컴포넌트 예를 들어 이미지, 추가 효과음, 추가 음성 TTS 파일 등은 요청서를 만들면 내PC에서 제작하겠다. 필요 이미지들은 … 대체 요망이라고 적어두면 된다."
> 지금 게임은 이 목록이 없어도 끝까지 돌아갑니다. 없는 그림은 임시 그림(SVG)에 **"임시 그림 · 대체 요망"** 표시가 붙고, 없는 소리는 조용히 넘어갑니다.
> 그림 규칙은 `docs/image_requests.md` 0장 · 6.1과 같습니다(글자 없음 · 빛살 금지 · 사장님 손은 떨림 없이 차분하게 · 얼굴과 손은 위쪽 2/3).

## 0. 한눈에

| 무엇 | 남은 수 | 넣는 곳 | 그다음 |
| :--- | :--- | :--- | :--- |
| 인물 스탠딩(새 인물 0명) | 설정화 0 + 표정 0장 | `assets/_src/stand/{id}_{표정}.jpg` | `npm run images` → `python tools/face-boxes.py` |
| 장면 그림(CG) | 새로 0장 + `docs/추가 제작.md`에 이미 있는 0장 | `assets/cg/cg_{id}.jpg` | `npm run assets` |
| 작업대 물건 · 다 만든 잔 시트 | 0개를 시트 0장에 | `assets/_src/objects/{시트}.jpg` | `npm run objects` |
| 새 놀이의 그림 | 0장(없음) | `assets/flow/`에 두고 알려 주기 → `assets/_src/play/{id}.jpg` | 초록 바탕 지우기 · 자르기(그림이 오면 넣는 길을 만듦) |
| 블렌더 한 컷(손 동작) | 컷이 없는 손 동작 0 · 🙋 있으면 더 맞는 컷 0(지금은 비슷한 컷이 나옴) · 드래그 활용 그림 0 | `tools/blender/scene_bench.py` | `shots_post.py` → `npm run assets` |
| 효과음 · 환경음 | 효과음 2 · 환경음 2 | `tools/audio/audio_map.mjs` | `npm run audio` |
| 배경음악 | 0곡(✅ 저작자가 Suno 유료 요금제로 만든 곡으로 채움, 2026-11-09) | `BGM/` → `tools/audio/audio_map.mjs` 의 bgm | `npm run audio` |
| 음성 | 바뀐 줄만 | `tools/voice/lines.json` | `npm run voices` |

## 1. 인물 스탠딩 (새 인물)

만드는 순서는 `docs/image_requests.md` 1장과 같습니다: ① 설정화 → ② 보통(설정화를 참조) → ③ 나머지 표정(보통을 참조). 무대에서 오른쪽을 보고 섭니다.
표정은 대본에 쓰인 것만 적었습니다. 그림이 오기 전에는 임시 초상(SVG)으로 섭니다.

## 2. 장면 그림 · 이벤트 CG

- 새로 요청하는 0장입니다. 이 밖에 `docs/추가 제작.md`에 프롬프트가 이미 있는 0장()도 아직 없습니다.
- 넣는 곳 `assets/cg/cg_{id}.jpg`(16:9, 2K) → `npm run assets`. 나오는 사람의 설정화와 그 장소의 배경을 **참조 이미지로 함께** 넣습니다.
- 사장의 눈(`eye_*`)은 사장님 자리에서 본 그림입니다. 지은은 조금 멀리, 사장님의 손이 앞에 보이고, 기억처럼 조금 따뜻한 빛입니다.

### 2.0 목록

| # | id | 제목 | 나오는 날 | 참조 |
| ---: | :--- | :--- | :--- | :--- |

### 2.1 프롬프트

## 3. 작업대 물건 · 다 만든 잔 시트 (Flow, 2026-11-06 사용자 결정 Q-52)

- 카운터(재료 고르기)의 물건, 드리기 쟁반 · 레시피 수첩의 다 만든 잔, 버리는 장면의 개수대 · 건조대 · 쓰레기통, 우유 · 얼음이 다 떨어진 날의 빈 우유병 · 빈 얼음 통입니다. 지금은 임시 그림(SVG)으로 섭니다(빈 그릇은 가득 찬 그림을 흐리게, 검수 13.62).
- 시트 규칙은 `docs/image_requests.md` 2장 ①·②와 같습니다(4칸 × 3줄 · 칸마다 물건 하나 · 마지막 칸 비움). 바탕은 크로마키 초록이고, **초록 물건(녹차라테 · 말차)이 든 `sheet_drinks_blue`만 파란 바탕**입니다(초록 바탕이면 초록 물건이 바탕과 함께 지워짐).
- 참조 그림(`assets/_src/objects/sheet_tools.jpg` · `sheet_cups.jpg`)을 꼭 붙여 같은 그림체 · 시점 · 빛으로 만듭니다. 같은 컵(머그 · 유리컵 · 플라스틱 컵)은 한 줄에 모아 모양 · 크기를 맞춥니다. 김(steam)은 게임이 그리므로 넣지 않습니다.
- 받은 그림은 `assets/_src/objects/{시트 이름}.jpg`로 두거나 `assets/flow/`에 두고 알려 주세요 → `npm run objects`(점검은 `python tools/import-objects.py --check`). 칸 순서는 `tools/import-objects.py`의 `SHEETS`와 같습니다.
- 아직 없는 것: 없음

## 4. 새 놀이의 그림 (재미 개편)

- 몰림 · 그 갈매기 쫓기 · 바닷가로 가는 버스 · 가게 꾸미기 · 앞치마의 그림입니다. 지금은 코드로 그린 임시 그림(SVG · 색 띠 · 아이콘)으로 섭니다.
- 프롬프트 · 규칙은 `docs/image_requests.md` 8장에 있습니다(시트는 초록 바탕 · 4칸 × 3줄 · 마지막 칸 비움, 버스 창밖은 좌우가 이어지는 그림).
- 받은 그림은 `assets/flow/`에 두고 알려 주세요. `assets/_src/play/{id}.jpg`로 옮겨 넣으면 이 목록에서 빠집니다.

- 모두 있습니다.

## 5. 블렌더 한 컷 (손 동작)

지금 컷이 있는 것: `extract` · `steam` · `pour_latte` · `pour_milk` · `foam` · `water` · `ice` · `pour_glass_latte` · `pour_glass_milk` · `water_glass` · `ice_plastic` · `pour_cocoa` · `pour_glass_cocoa` · `pour_glass_matcha` · `pour_glass_strawberry` · `pour_matcha` · `pour_paper_cocoa` · `pour_paper_latte` · `pour_paper_matcha` · `pour_paper_milk` · `pour_plastic_cocoa` · `pour_plastic_latte` · `pour_plastic_matcha` · `pour_plastic_milk` · `pour_plastic_strawberry` · `water_paper` · `water_plastic` · `milk_in` · `tap` · `bloom` · `bloom_wait` · `boil` · `grind` · `hand_grind` · `jam_iced_strawberry` · `jam_iced_yuja` · `jam_yuja` · `powder_cocoa` · `powder_iced_cocoa` · `powder_iced_matcha` · `powder_matcha` · `spiral` · `steep` · `steep_iced` · `stir_cocoa` · `stir_iced_cocoa` · `stir_iced_strawberry` · `stir_iced_yuja` · `stir_paper_mix` · `stir_yuja` · `syrup` · `syrup_iced` · `tamp` · `whisk` · `whisk_iced` · `water_barley` · `water_glass_barley` · `water_glass_yuja` · `water_paper_mix` · `water_yuja` · `steam_kid` · `hotwater_pitcher_yuja` · `ice_strawberry` · `jam_pitcher_yuja` · `pourin_glass_americano` · `pourin_glass_latte` · `pourin_glass_yuja` · `pourin_plastic_americano` · `pourin_plastic_latte` · `pourin_plastic_yuja` · `stir_pitcher_yuja` · `water_glass_ice` · `water_plastic_ice` · `water_plastic_yuja` · `hotwater_pitcher_cocoa` · `hotwater_pitcher_matcha` · `pourin_glass_cocoa` · `pourin_glass_matcha` · `pourin_plastic_cocoa` · `pourin_plastic_matcha` · `powder_pitcher_cocoa` · `powder_pitcher_matcha` · `stir_pitcher_cocoa` · `whisk_pitcher_matcha` · `ice_barley` · `ice_plastic_barley` · `jam_paper_yuja` · `jam_plastic_strawberry` · `powder_paper_cocoa` · `powder_paper_matcha` · `steep_paper_barley` · `steep_plastic_barley` · `stir_paper_cocoa` · `stir_paper_yuja` · `stir_plastic_strawberry` · `syrup_paper_espresso` · `syrup_plastic_espresso` · `water_paper_barley` · `water_paper_yuja` · `water_plastic_barley` · `whisk_paper_matcha`. 만드는 법은 `docs/recipes.md` 6장 · CLAUDE.md 7장(`scene_bench.py … shots <id>` → `shots_post.py` → `npm run assets`).
게임은 `shots.json`에 맞는 이름의 컷이 있으면 저절로 씁니다(`js/data/menu.js`의 `shotNames`, 작업대 `brew.js`의 `shotIdFor`). 손 동작 id 와 같은 이름이면 그 컷, 붓기 · 물 붓기 · 얼음 담기는 잔마다 `pour{잔}_{latte|milk|색}` · `water{잔}` · `ice{잔}`(잔 = 머그는 없음 · `_glass` · `_paper` · `_plastic`, `docs/recipes.md` 6.7), 컵에 넣기 · 젓기 · 우리기는 `{동작}[_iced]_{바탕}`(포장 컵은 `{동작}{잔}_{바탕}`, 6.10). 이름만 맞으면 코드를 고치지 않아도 됩니다.
아래 목록은 메뉴마다 온도 · 매장/포장 · 단계를 모두 따라가며 작업대가 고를 컷을 셈한 것입니다.

### 5.1 컷이 없는 손 동작 (임시 그림으로 섬)

- 없습니다. 메뉴판의 모든 잔에서 손 동작마다 블렌더 컷이 나옵니다.

### 5.2 있으면 더 맞는 컷 🙋 (지금은 비슷한 컷이 나옴)

- 이 잔들도 지금 블렌더 컷이 나옵니다. 다만 다른 잔(포장 컵인데 머그 · 유리컵)이나 다른 음료(보리차 · 유자차인데 아메리카노)의 컷이라, 만들면 더 꼭 맞습니다. 급하지 않습니다(`docs/recipes.md` 6.10 🙋).
- 만드는 법: 지금 나오는 컷과 같은 장면에서 잔만 바꿉니다. 종이컵은 `water_paper`, 플라스틱 컵은 `water_plastic`과 같은 카메라 · 빛(얼음 24개), 물 붓기는 음료 색만 그 바탕으로(보리차 = 호박색 · 티백, 유자차 = 청이 풀림).

- 없습니다.

### 5.3 조작법 '드래그 활용'의 그림 (`docs/recipes.md` 6.11)

- 붓는 컷에 덜 기운 그릇(`… tilt`)이 없으면 끌어 붓기는 되지만 그릇이 기울어 보이지 않고, 얼음 담기 컷에 얼음 통 · 국자(`… drag_ice`)가 없으면 터치 기반처럼 눌러서 담습니다.

- 모두 있습니다.

## 6. 소리

### 6.1 효과음 · 환경음 (사서 쓰는 팩에서 잘라 넣기, `tools/audio/audio_map.mjs`)

| 종류 | id | 쓰는 곳 | 바라는 소리 |
| :--- | :--- | :--- | :--- |
| 효과음 | `espresso` | 작업대 · 화면 | 에스프레소가 나오는 소리 |
| 효과음 | `mug` | 작업대 · 화면 | 머그를 내려놓는 소리 |
| 환경음 | `kitchen` | 지금 대본에는 없음 | 주방 |
| 환경음 | `classroom` | 지금 대본에는 없음 | 교실 |

### 6.2 배경음악 (✅ 새로 만듦: 직업 마1스톤 곡과 「The Carousel Turn」은 쓰지 않음)

| mood | 쓰는 곳 | 느낌 · 악기 | 길이 |
| :--- | :--- | :--- | :--- |
| 모두 있음 | ✅ 저작자가 Suno 유료 요금제로 만든 곡(2026-11-09, 배정은 `js/av/audio.js` 의 BGM_VARIANTS · 검수 13.113) | | |

- 판매 페이지에 AI 관련 금지 조건이 있는 음악 팩은 쓰지 않습니다(CLAUDE.md 7장). 음악 파일이 없으면 게임은 조용히 넘어갑니다.

## 7. 음성 (Supertonic, 내 PC)

- 읽어 줄 문장 4238줄(`npm run lines` → `tools/voice/lines.json`). `npm run voices`가 바뀐 줄만 만듭니다.
- 새 인물의 목소리 배정은 `tools/voice/voice_cast.json`에 있습니다(Supertonic 목소리가 10개뿐이라 빠르기로 구별, 들어 보고 정함).
- 사람별 대본(주인공 · 사장님 · 단골 · 조연 · 손님 옷차림별 · 안내, 줄 수 · 글자 수)은 `docs/voice_lines.md`(`npm run lines`가 함께 만듦).

| 목소리 | 줄 수 |
| :--- | ---: |
| `sys` | 1048 |
| `narr` | 1016 |
| `think` | 496 |
| `owner` | 236 |
| `jieun` | 235 |
| `customer-sporty` | 100 |
| `customer-coffee` | 86 |
| `customer-arms` | 84 |
| `customer-stripe` | 82 |
| `jian` | 80 |
| `customer-olive` | 78 |
| `do` | 70 |
| `haesun` | 65 |
| `eunju` | 59 |
| `han` | 51 |
| `sumin` | 51 |
| `kang` | 50 |
| `noh` | 44 |
| `geum` | 34 |
| `customer` | 30 |
| `agent` | 23 |
| `dohyun` | 22 |
| `granddaughter` | 19 |
| `yeonwoo` | 18 |
| `han_daughter` | 18 |
| `sora` | 17 |
| `mom2` | 16 |
| `grandma` | 16 |
| `student` | 15 |
| `teacher` | 15 |
| `minjae` | 15 |
| `daeri` | 15 |
| `jiho` | 15 |
| `manager` | 14 |
| `actor` | 4 |
| `young_fisher` | 1 |

## 8. 넣은 뒤 할 일 (순서)

1. 그림: `npm run images`(스탠딩) → `python tools/face-boxes.py` → `npm run objects`(물건 시트) → `npm run assets`(배경 · CG · 컷) → `npm run credits`
2. 새 그림의 제작 프롬프트를 `tools/credits/image_prompts.mjs`에 한 줄씩(제작 · 저작권 정보)
3. 소리: `tools/audio/audio_map.mjs`에 대응을 적고 `npm run audio` → `assets/audio` 안에서 커밋 · 푸시 → 바깥에서 `git add assets/audio`
4. 음성: `npm run voices`
5. `npm run validate` → 자동 플레이 → `npm run requests`(이 문서가 줄어듦)

