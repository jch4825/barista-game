# 그림 요청서 v1.2 (M1 시험판 + 새 배경 + 장면 그림) — Google Flow용

> 2026-10-28 · 직업 ε바리스타3(2026-10-30 제목 정함)의 첫 그림 묶음입니다. PRD 18장 M1(작업대 + 해순·지안)에 필요한 것만 담았습니다.
> v1.1(2026-10-28): 직업 마1스톤 배경 14장을 바꿀 **새 배경과 메뉴 뒤 배경**을 5장에 더했습니다(디자인 언어 '바닷가 밤'과 함께, ✅ 사용자 결정).
> v1.2(2026-10-28): 주요 장면을 컷신처럼 화면 전체에 보여 줄 **장면 그림**을 6장에 더했습니다(사용자 요청).
> v1.3(2026-10-28): 감성적인 대사·상황마다 **이벤트 CG**(단골 대응 장면 포함, 13장 더함)를 6장에 넣었습니다(사용자 결정).
> 표시: ✅ 사용자가 정한 것 · 🙋 Claude 제안(바꿔도 됨, 4장·5.6 검수 포인트)

## 0. 공통 규칙

### 0.1 Flow에서 만들기
- 아래 **프롬프트 상자를 그대로 복사**해 넣습니다. 마지막 줄 `Avoid: …`도 함께 넣습니다(피할 것).
- **비율**: 인물 = 세로(9:16), 배경 = 가로(16:9), 물건 시트 = 정사각형(1:1).
- **참조 이미지**: '참조' 칸이 있는 그림은 그 그림을 Flow의 참조 이미지(재료)로 함께 넣습니다. 얼굴·옷·크기가 흔들리지 않게 하는 가장 중요한 단계입니다.
  - 인물: ① 설정화 → ② 보통 표정(설정화를 참조) → ③ 나머지 표정(보통을 참조) 순서로 만듭니다.
- 여러 장이 나오면 **얼굴이 설정화와 가장 같은 것**을 고릅니다. 고른 그림은 **2K로 키워서** 받습니다.
- 그림 속 **글자·숫자·이름표 글씨는 없어야** 합니다. 붉은 바탕 + 가운데 원 + 퍼지는 빛살 구도는 쓰지 않습니다(욱일기 연상 금지).

### 0.2 받은 그림을 넣는 곳
| 그림 | 파일 이름 · 넣는 곳 | 그다음 |
| :--- | :--- | :--- |
| 설정화 | `assets/_src/ref/{id}_sheet.jpg` (게임에는 안 나옴, 참조용) | — |
| 인물(스탠딩) | `assets/_src/stand/{id}_{표정}.jpg` (예: `jieun_normal.jpg`) | `npm run images` |
| 작업대 배경 | `assets/bg/workbench_morning.jpg` | `npm run assets` |
| 물건 시트 | `assets/_src/objects/sheet_tools.jpg`, `assets/_src/objects/sheet_cups.jpg` | `npm run objects` |
| 배경(5장) | `assets/bg/{id}.jpg` | `npm run assets` |
| 장면 그림(6장) | `assets/cg/cg_{id}.jpg` | `npm run assets` + `js/data/cg.js`에 한 줄 |

- Flow가 붙인 **원래 파일 이름**은 `assets/_src/SOURCES.md`에 적거나 저에게 알려 주세요(제작·저작권 정보의 '그림' 탭에 들어갑니다).
- 넣어 주시면 제가 배경 지우기·자르기·게임 연결을 합니다. 그림이 오기 전까지 게임은 임시 그림으로 돌아갑니다.

### 0.3 그림체 (모든 인물에 같은 블록)
직업 마1스톤에서 가져와 쓰는 손님 그림과 나란히 서도 어울리게, 같은 그리기 방식에 **새 게임의 색**(게임 메인 색인 초록·따뜻한 나무색·크림·모래색, 바다색은 조금)을 씁니다. 🙋

---

## 1. 인물 (주인공급 4명, ✅ 새로 그림)

### 1.1 지은 — 주인공, 새 바리스타 (id `jieun`)
- ✅ 이름: 지은 · 🙋 21살. 검은 머리를 낮게 묶음, 차분한 갈색 눈. 크림색 긴소매 셔츠(소매를 걷음) + **초록 캔버스 앞치마**(✅ 게임 메인 색 #25844A와 같음, 갈색 가죽 끈), 베이지 바지, 흰 운동화. 오른쪽 손목에 겨자색 머리끈.
- 연우(빨간 앞치마, 단발)와 한눈에 구별되게 했습니다.
- 표정 6장: `normal` 보통 · `smile` 웃음 · `nervous` 긴장 · `determined` 다짐(집중) · `surprised` 놀람 · `sad` 슬픔
- 무대에서 오른쪽을 보고 섭니다(몸을 보는 사람의 오른쪽으로 살짝).

**① 설정화** `jieun_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of JIEUN, age 21, a new barista at a small old cafe in a Korean seaside village. Quiet, careful, steady hands.
Korean young woman age 21, straight black hair tied in a low ponytail with short side bangs, calm round dark brown eyes, gentle slightly serious face, cream long-sleeve henley shirt with sleeves rolled up to the elbows, medium forest green (#25844A) canvas barista apron (clearly green, not navy or blue) with a brown leather neck strap and two front pockets, beige cotton trousers, white canvas sneakers, small mustard yellow hair tie on her right wrist.
full-body front view and side view, three expression headshots on the right: calm focus, shy smile, surprised.
Avoid: navy or blue apron, text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `jieun_normal` · 9:16 · 참조: `jieun_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean young woman age 21, straight black hair tied in a low ponytail with short side bangs, calm round dark brown eyes, gentle slightly serious face, cream long-sleeve henley shirt with sleeves rolled up to the elbows, medium forest green (#25844A) canvas barista apron (clearly green, not navy or blue) with a brown leather neck strap and two front pockets, beige cotton trousers, white canvas sneakers, small mustard yellow hair tie on her right wrist.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, hands lightly together in front of the apron, calm neutral expression, mouth closed.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: navy or blue apron, text, letters, numbers, watermark, logo, writing on the apron, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `jieun_normal` — 아래 상자의 `[표정]` 자리에 표의 영어 문장을 넣습니다.
```
Same character as the reference image: identical face, hairstyle, outfit, colors, body proportions, line style, pose angle and framing, same plain pure white background, whole body from head to feet. Change only the facial expression and hands:
[표정].
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, sharp lineart, high resolution.
Avoid: different outfit, different hairstyle, changed pose angle, text, letters, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```
| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `jieun_smile` | 웃음 | warm happy smile with slightly closed eyes, hands lightly together in front of the apron |
| `jieun_nervous` | 긴장 | nervous expression, eyebrows drawn together, small sweat drop, holding the edge of her apron with both hands |
| `jieun_determined` | 다짐·집중 | focused determined expression, steady eyes, mouth closed, one hand in a small fist at chest height |
| `jieun_surprised` | 놀람 | surprised expression, eyes wide, mouth slightly open, both hands raised a little in front of her chest |
| `jieun_sad` | 슬픔 | quietly sad expression, eyes lowered, lips pressed together, hands holding each other in front of the apron |

**④ 초록 앞치마로 다시 만들기** (✅ 사용자 결정 2026-10-30, 검수 `docs/review.md` I-14) — ✅ 2026-10-30 받음: 6장 + 설정화(⑤)가 게임에 들어감. 아래는 기록으로 둡니다.
첫 묶음(2026-10-29)의 스탠딩 4장(보통·웃음·긴장·다짐)은 앞치마가 남색으로 나왔습니다. 얼굴·자세는 그대로 두고 **지금 그림을 참조 이미지로 넣어 앞치마 색만 바꿉니다**. 그러면 얼굴·크기가 흔들리지 않고, 게임의 팔 사이 지우기 자리(`POCKETS`)와 얼굴 자리도 그대로 맞습니다.

- (2026-10-30 낮에는 색만 초록으로 돌린 임시 그림을 썼고, 같은 날 저녁 수정본이 와서 임시 그림과 도구는 지웠습니다. 남색 첫 판은 `assets/_src/flow_unused/`.)

1. Flow에서 남색 원본(`assets/_src/flow_unused/이미지_fb912df2.jpg` 등)을 참조 이미지로 넣고 아래 상자로 만듭니다. `jieun_smile`·`jieun_nervous`·`jieun_determined`도 각자 자기 원본을 참조로 넣고 같은 상자로 한 장씩 만듭니다.
2. 참조 이미지를 하나 더 넣을 수 있으면 `assets/cg/cg_spring_first_cup.jpg`(앞치마가 초록으로 나온 CG)를 둘째로 넣고, 상자 맨 끝에 `Use the second reference image only for the apron color.`를 붙입니다. 스탠딩과 CG의 초록이 비슷해집니다.
3. 초록 보통(`assets/_src/stand/jieun_normal.jpg`, 다시 만들었으면 그 그림)을 참조로 ③ 상자를 써서 `jieun_surprised`·`jieun_sad`를 만듭니다.
4. 같은 초록 보통을 참조로 ⑤ 상자를 써서 설정화 `jieun_sheet`를 만듭니다(앞으로 CG의 참조 이미지).
5. 받은 그림은 `assets/flow/` 같은 폴더에 두고 말해 주세요. 같은 이름으로 넣고 `npm run images`부터 다시 합니다. 

```
Edit the reference image. Keep everything exactly the same: the same character, face, expression, hairstyle, pose, hands, body proportions, framing, line style, shading and the plain pure white background.
Change only the color of the apron: from navy blue to medium forest green (#25844A), a clear natural green. Keep the apron's shape, folds, seams, two front pockets and the brown leather neck strap as they are.
The apron must be clearly GREEN: not blue, not navy, not teal, not denim.
Avoid: navy apron, blue apron, teal apron, denim apron, changed face, changed expression, changed pose, different outfit, text, letters, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, background objects.
```

**⑤ 설정화 (초록 앞치마 보통에서)** `jieun_sheet` · 1:1 · 참조: 초록 `jieun_normal`
```
Same character as the reference image: identical face, hairstyle, outfit and colors, including the medium forest green (#25844A) apron with the brown leather neck strap.
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, sharp lineart, high resolution, plain white background.
character design sheet of JIEUN, age 21, a new barista at a small old cafe in a Korean seaside village. Quiet, careful, steady hands.
full-body front view and side view, three expression headshots on the right: calm focus, shy smile, surprised.
Avoid: navy apron, blue apron, teal apron, text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

### 1.2 사장님 — 카페 주인 (id `owner`)
- 🙋 66살 남자(성별·나이·이름은 4장 I-2). 단정히 빗어 넘긴 흰 머리, 짙은 회색 눈썹, 깊고 다정한 눈, 짧게 다듬은 흰 수염. 흰 셔츠(소매 한 번 걷음) + 진회색 니트 조끼 + 짙은 갈색 앞치마, 어두운 바지, 갈색 가죽 구두. 목에 줄을 단 돋보기안경.
- 손떨림은 **그림으로 그리지 않습니다**(병명 없이, 이야기의 행동으로만 보여 줌).
- 표정 4장: `normal` 보통(말없이 차분) · `smile` 드문 작은 미소 · `think` 생각 · `strict` 단호함(화내지 않음)
- 무대에서 왼쪽을 보고 섭니다.

**① 설정화** `owner_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of the cafe OWNER, age 66, a quiet master barista who has run a small cafe in a Korean seaside village for thirty years. Few words, warm heart.
Korean man age 66, neatly combed back white hair, thick dark grey eyebrows, deep-set kind eyes, short neatly trimmed white beard, slim build, white collared shirt with sleeves rolled once, charcoal grey knit vest, dark brown canvas apron, dark trousers, brown leather shoes, reading glasses hanging on a cord around his neck.
full-body front view and side view, three expression headshots on the right: calm and quiet, rare small smile, firm but kind.
Avoid: text, letters, names, numbers, watermark, logo, deformed hands, extra fingers, trembling lines, sickly look.
```

**② 보통** `owner_normal` · 9:16 · 참조: `owner_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean man age 66, neatly combed back white hair, thick dark grey eyebrows, deep-set kind eyes, short neatly trimmed white beard, slim build, white collared shirt with sleeves rolled once, charcoal grey knit vest, dark brown canvas apron, dark trousers, brown leather shoes, reading glasses hanging on a cord around his neck.
full-body character design, standing naturally, body turned slightly toward the viewer's left, looking at the viewer, hands loosely clasped behind his back, calm quiet expression, mouth closed.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `owner_normal` — 1.1의 ③ 상자를 그대로 쓰고 `[표정]`만 바꿉니다.
| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `owner_smile` | 작은 미소 | rare small warm smile, eyes softened, hands loosely clasped behind his back |
| `owner_think` | 생각 | thoughtful expression, looking slightly down, one hand touching his beard |
| `owner_strict` | 단호함 | firm serious expression, eyebrows slightly lowered, arms relaxed at his sides, calm not angry |

### 1.3 해순 할머니 — 단골 (id `haesun`)
- ✅ 단골 · 🙋 80살. 단정히 빗은 짧은 은백색 머리, 안경 없음, 가늘고 다정한 눈, 부드러운 주름. 남색 카디건 + 크림색 블라우스, 긴 회색 치마, 작은 갈색 천 가방. 조금 굽은 등.
- 직업 마1스톤의 봉순 할머니(곱슬머리·둥근 안경·주황 코트)와 겹치지 않게 했습니다.
- 표정 3장: `normal` 보통(다정함) · `smile` 작은 웃음 · `look` 옆을 바라봄(빈 의자를 보는 눈길: 고개를 살짝 돌리고 눈을 내리깖, 쓸쓸한 미소)
- 무대에서 왼쪽을 보고 섭니다. 무대에서는 85% 크기로 섭니다(손님 규칙).

**① 설정화** `haesun_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of HAESUN, age 80, a gentle grandmother who visits the village cafe every morning.
Korean grandmother age 80, short neatly combed silver-white hair, no glasses, gentle narrow eyes, soft wrinkles, navy blue cardigan over a cream blouse, long grey skirt, small brown cloth handbag, slightly bent posture.
full-body front view and side view, three expression headshots on the right: gentle, small smile, wistful glance to the side.
Avoid: text, letters, names, numbers, watermark, logo, glasses, curly hair, deformed hands, extra fingers.
```

**② 보통** `haesun_normal` · 9:16 · 참조: `haesun_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean grandmother age 80, short neatly combed silver-white hair, no glasses, gentle narrow eyes, soft wrinkles, navy blue cardigan over a cream blouse, long grey skirt, small brown cloth handbag, slightly bent posture.
full-body character design, standing naturally, body turned slightly toward the viewer's left, looking at the viewer, both hands holding the small handbag in front, gentle calm expression.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, watermark, logo, glasses, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `haesun_normal` — 1.1의 ③ 상자를 쓰고 `[표정]`만 바꿉니다.
| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `haesun_smile` | 작은 웃음 | small warm smile with soft crinkled eyes, both hands holding the handbag in front |
| `haesun_look` | 옆을 바라봄 | head turned slightly to her right, eyes lowered toward something beside her, a quiet wistful smile, hands holding the handbag in front |

### 1.4 지안 — 단골, 그림을 그리던 사람 (id `jian`)
- ✅ 단골 · 🙋 27살 여자(4장 I-3). 어깨까지 오는 물결 머리를 반만 묶음, 귀 뒤에 나무 연필 한 자루, 조금 지친 듯 다정한 눈. 커다란 부드러운 겨자색 니트 카디건(🙋 지은의 초록 앞치마와 겹치지 않게, 지안이 처음 고르는 노란색과 이어지게) + 흰 티셔츠, 넓은 크림색 바지, 캔버스 가방. **덮은 검은 스케치북을 두 팔로 가슴에 안음**.
- 표정 3장: `normal` 보통(조용함, 고르기 어려움) · `smile` 작은 놀란 웃음 · `shy` 망설임(스케치북을 꼭 안고 눈을 내리깖)
- 무대에서 왼쪽을 보고 섭니다. 85% 크기.

**① 설정화** `jian_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of JIAN, age 27, a painter who has not been able to draw for a year and visits the village cafe.
Korean young woman age 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil tucked behind her right ear, kind slightly tired eyes, oversized soft mustard yellow knit cardigan over a white t-shirt, wide cream trousers, canvas tote bag on her shoulder, holding a closed plain black sketchbook against her chest with both arms.
full-body front view and side view, three expression headshots on the right: quiet and unsure, small surprised smile, shy looking down.
Avoid: text, letters, names, numbers, writing on the sketchbook, watermark, logo, beret, deformed hands, extra fingers.
```

**② 보통** `jian_normal` · 9:16 · 참조: `jian_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean young woman age 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil tucked behind her right ear, kind slightly tired eyes, oversized soft mustard yellow knit cardigan over a white t-shirt, wide cream trousers, canvas tote bag on her shoulder, holding a closed plain black sketchbook against her chest with both arms.
full-body character design, standing naturally, body turned slightly toward the viewer's left, looking at the viewer, quiet unsure expression, mouth closed.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, writing on the sketchbook, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `jian_normal` — 1.1의 ③ 상자를 쓰고 `[표정]`만 바꿉니다.
| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `jian_smile` | 작은 웃음 | small surprised smile, eyebrows lifted a little, still holding the closed sketchbook against her chest |
| `jian_shy` | 망설임 | shy hesitant expression, eyes looking down, hugging the closed sketchbook tightly with both arms |

---

## 2. 바리스타 작업대 (✅ 3D처럼 보이는 정교한 2D)
> ✅ 2026-10-28 레시피 설계서 Q-R7: 작업대 물건과 움직임 프레임은 **블렌더로 미리 렌더**합니다(`docs/recipes.md` 6장). 아래 Flow 물건 시트 ①·②는 **만들지 않아도 됩니다**. 이미 만든 시트가 있으면 시험판에서 그대로 씁니다(`npm run objects`). 작업대 배경 ③은 블렌더 시험 렌더를 본 뒤 정합니다.

- 작업대 배경과 물건 두 장은 **같은 시점(앞에서 조금 위로 내려다봄)·같은 빛(왼쪽 위)**이어야 게임에서 겹쳐 놓았을 때 자연스럽습니다.
- 물건 시트는 **초록 바탕**입니다. 흰 컵이 흰 바탕에 묻히지 않게, 게임에서 초록만 지웁니다.
- 마지막 칸(오른쪽 아래)은 **비워 둡니다**. Flow가 오른쪽 아래에 붙이는 표시가 물건을 가리지 않게 하려는 것입니다.
- 순서: ① 물건 시트(기계·도구)를 먼저 만들고, ② 컵 시트와 ③ 배경은 ①을 참조 이미지로 넣어 그림체를 맞춥니다.

**① 물건 시트: 기계·도구** `sheet_tools` · 1:1
```
A game asset sheet of cafe barista equipment, highly detailed semi-realistic 2D illustration with a soft 3D-rendered look, like premium mobile cooking game assets: realistic materials (brushed stainless steel, black plastic, warm oak wood handles, clear glass), clean crisp edges, no black outlines.
Every object is drawn from the same angle: three-quarter view from slightly above (about 30 degrees), consistent scale between objects, the same single soft key light from the upper left, subtle highlights.
The square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each cell with wide empty margins; objects never touch or overlap each other or the cell edges.
Row 1: a compact one-group espresso machine (stainless steel, wooden portafilter handle attached, small steam wand on the right side); a coffee grinder with a clear bean hopper full of coffee beans; an empty espresso portafilter with a wooden handle (empty basket visible); the same portafilter filled with flat tamped ground coffee.
Row 2: a coffee tamper with a wooden handle; an empty stainless steel milk pitcher; the same milk pitcher full of steamed milk with a smooth white foam top; a glass milk bottle full of milk.
Row 3: a stainless steel gooseneck kettle; a white ceramic pour-over dripper with a paper filter; a glass syrup bottle with a pump; the last cell (bottom right) completely empty.
Flat solid chroma key green background (#00B140) everywhere, no gradients, no floor, no cast shadows on the background, no green reflections on the objects.
Avoid: text, letters, numbers, labels, logos, brand names, watermark, people, hands, black outlines, cartoon outlines, overlapping objects, steam.
```

**② 물건 시트: 컵·음료** `sheet_cups` · 1:1 · 참조: `sheet_tools`
```
Same art style, angle, lighting and rendering as the reference image (barista equipment sheet): highly detailed semi-realistic 2D game asset illustration with a soft 3D-rendered look, three-quarter view from slightly above, single soft key light from the upper left, no black outlines.
The square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each cell with wide empty margins; nothing touches or overlaps.
Row 1 (the same plain white ceramic mug with identical shape, size and angle in every cell): an empty mug; the mug full of black americano coffee with light brown crema; the mug full of warm white milk with a little foam; the mug of cafe latte with a smooth light brown milk foam surface and no latte art.
Row 2: the same white mug of cafe latte with a simple white heart latte art on top; an empty thick double-wall cream ceramic mug; an empty tall clear drinking glass; the same tall glass filled with iced americano and ice cubes.
Row 3: a white paper takeaway cup with a white lid and a plain kraft paper sleeve; a small white espresso cup with a shot of espresso and crema; an empty rectangular warm oak serving tray; the last cell (bottom right) completely empty.
Flat solid chroma key green background (#00B140) everywhere, no gradients, no cast shadows on the background, no green reflections.
Avoid: text, letters, numbers, logos, brand names, watermark, people, hands, steam, saucers, spoons, black outlines.
```

**③ 작업대 배경** `workbench_morning` · 16:9 · 참조: `sheet_tools`
```
Semi-realistic painterly 2D illustration with a soft 3D-rendered look, matching the reference image's lighting and rendering, no people.
Close-up of a barista's work counter in a small old cafe in a Korean seaside village, seen from the barista's side; the camera is at standing eye level looking slightly down at the countertop.
Lower half: a long, empty, clean warm oak wooden countertop (game objects will be placed on it later).
Back wall: off-white subway tiles, one simple wooden shelf with a few plain mugs and glass jars of coffee beans, a small window on the upper right showing a calm blue sea and a morning sky.
Soft morning sunlight from the upper left, gentle shadows, a warm, cozy and calm mood, palette of warm wood, cream and soft sea blue. 16:9.
Avoid: people, hands, text, letters, numbers, signs, logos, watermark, coffee machine, cups or objects on the countertop, clutter.
```

---

## 3. 만드는 순서와 체크리스트
**1순위**(시험판에 꼭 필요): 물건 시트 ①② · 작업대 배경 · 네 사람의 설정화와 `보통`.
**2순위**: 나머지 표정(지은 5 · 사장님 3 · 해순 2 · 지안 2).

| # | id | 무엇 | 비율 | 참조 | 넣는 곳 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `sheet_tools` | 물건 시트: 기계·도구 | 1:1 | — | `assets/_src/objects/` |
| 2 | `sheet_cups` | 물건 시트: 컵·음료 | 1:1 | 1 | `assets/_src/objects/` |
| 3 | `workbench_morning` | 작업대 배경 | 16:9 | 1 | `assets/bg/` |
| 4 | `jieun_sheet` → `jieun_normal` | 지은 설정화 → 보통 | 1:1 → 9:16 | 설정화 | `assets/_src/ref/` → `assets/_src/stand/` |
| 5 | `owner_sheet` → `owner_normal` | 사장님 | 1:1 → 9:16 | 설정화 | 〃 |
| 6 | `haesun_sheet` → `haesun_normal` | 해순 할머니 | 1:1 → 9:16 | 설정화 | 〃 |
| 7 | `jian_sheet` → `jian_normal` | 지안 | 1:1 → 9:16 | 설정화 | 〃 |
| 8 | 표정 12장 | 1.1~1.4의 표 | 9:16 | 각자의 `보통` | `assets/_src/stand/` |

## 4. 검수 포인트 🙋
- **I-1** 그림체: 인물은 직업 마1스톤 손님 그림과 같은 그리기 방식에 바닷가 색. 물건·작업대만 3D처럼 보이는 정교한 2D. 두 그림체가 한 화면에 함께 나와도 되는지.
- **I-2** 사장님: 66살 남자로 그렸습니다. 성별·나이·이름을 정해 주세요(이름은 아직 없음).
- **I-3** 지안: 27살 여자, 귀 뒤의 연필과 덮은 스케치북으로 '그림을 그리던 사람'임을 보여 줍니다.
- **I-4** ✅ 지은의 앞치마는 게임 메인 색과 같은 초록(#25844A, 사용자 결정 2026-10-28). 첫 스탠딩이 남색으로 나와 색만 다시 만듭니다(1.1 ④, 2026-10-30). 연우의 빨간 앞치마와도 구별됩니다. 🙋 지안의 카디건은 초록과 겹치지 않게 세이지색에서 겨자색으로 바꿨습니다.
- **I-5** 해순 할머니의 `look`(빈 의자를 보는 눈길): 겨울의 '시선 힌트'에 쓰는 표정입니다.

---

## 5. 배경 그림 (✅ 디자인 바꾸기, 2026-10-28)

사용자 요청(2026-10-28): "배경이, UX가 직업 마1스톤과 똑같아 지루하다. 배경으로 필요한 이미지는 프롬프트로 주세요."
지금 쓰는 배경 14장은 직업 마1스톤의 빵집 카페(빨간 차양·빨간 등·빵 진열장)라서, 같은 게임처럼 보이는 가장 큰 까닭입니다. 아래는 **바닷가 마을의 오래된 카페**로 바꿀 배경입니다.

### 5.1 규격과 넣는 곳
- **비율 16:9**. Flow 기본 크기(1376×768)도 되지만, 고른 그림은 **2K로 키워 받으면** 1920×1080 화면에서 더 또렷합니다.
- 넣는 곳: `assets/bg/{id}.jpg` → `npm run assets`. 원래 파일 이름은 `assets/bg/SOURCES.md`에 적습니다.
- 인물은 화면 가운데 띠(위에서 약 300~750px)에 서고, 아래쪽 약 300px은 대화창이 가립니다. 그래서 **가운데는 비워 두고**, 꼭 보여야 할 것(창가의 빈 의자·칠판·창밖 바다)은 위쪽 2/3에 둡니다.
- **같은 카페**로 보여야 합니다. ① `hall_morning`(카페 홀)을 먼저 만들고, 홀의 다른 시간·계절은 그 그림을 **참조 이미지**로 넣습니다. ② `cafe_front_morning`(카페 앞)은 `hall_morning`을 참조해 창 모양·나무색을 맞춥니다.
- 이야기의 단서가 되는 물건(담요·컵·쪽지·가방 걸이 등)은 배경에 그리지 않습니다. 대응 결과에 따라 달라지기 때문입니다. 칠판은 **비어 있게** 둡니다(사장님이 쓰는 글은 게임이 따로 얹음).

### 5.2 공통 블록 (프롬프트 맨 앞에 붙임)

**[이야기 배경]**
```
Hand-painted anime background art for a gentle story game: clean architectural lines, soft painterly cel shading, subtle paper grain, calm and warm mood. A small old cafe in a quiet seaside village in Korea. Palette: deep sea teal and navy in the shadows, warm golden lamp light, cream plaster walls, warm oak wood, small forest green accents, a little antique brass. Eye-level camera, natural perspective, clear depth, high resolution, 16:9.
```

**[메뉴 뒤 배경]**
```
Quiet atmospheric background plate for game menus: very calm, low contrast, soft focus, painterly. Large simple dark areas on the left and in the center where text panels will be placed; nothing detailed behind the panels. Palette of deep sea teal and navy with a little warm gold. 16:9, high resolution.
```

**[피할 것]** 프롬프트 맨 끝에 붙입니다(카페 안·카페 앞은 둘째 줄도).
```
Avoid: text, letters, numbers, readable signs, writing on boards, logos, brand names, watermark, people, clutter, fisheye distortion.
Avoid: red awning, red pendant lamps, bakery display case, rows of bread.
```
- 빛은 '부드럽게 퍼지는 빛'으로만 적습니다. 해·빛살을 그리라는 말은 넣지 않습니다(욱일기 연상 금지, 0.1). 해 질 녘 그림도 해는 화면에 없고 하늘의 색만 바뀝니다.

### 5.3 목록과 우선순위
P0 = 시안을 정식으로 하면 바로 필요 · P1 = 계절 이야기(M2·M3) 전에 · P2 = 그 장소가 나오는 이야기를 쓸 때

| 우선 | id | 무엇 | 쓰는 곳 | 바꾸는 옛 그림 | 참조 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| P0 | `hall_morning` | 카페 홀 · 아침 | 이야기 기본 장면(손님 맞이·대응 기회) | `counter_morning` · `counter_day` | — |
| P0 | `hall_evening` | 카페 홀 · 마감(해 질 녘) | 마감 · 사장님의 마감 우유 | `counter_closing` | `hall_morning` |
| P0 | `cafe_front_morning` | 카페 앞 · 아침 | 이야기(가게 앞) · 근무표 칸 그림 | 같은 id(빨간 차양 그림) | `hall_morning` |
| P0 | `title_cafe_dusk` | 카페 앞 · 해 질 녘 | 처음 화면 | `cafe_front_morning`(처음 화면에 쓰던 것) | `cafe_front_morning` |
| P0 | `ui_sea_night` | 밤바다(메뉴 뒤) | 전체 화면 창: 근무표·설정·수첩·결과 | 크림 점무늬 바탕 | — |
| P1 | `ui_cafe_dim` | 흐린 카페 안(메뉴 뒤) | 이야기 중에 여는 창: 멈춤·저장·지난 대화 | 크림 점무늬 바탕 | `hall_evening` |
| P1 | `hall_spring` · `hall_summer` · `hall_autumn` · `hall_winter` | 카페 홀 · 계절 4장 | 계절의 고요한 날 | — | `hall_morning` |
| P1 | `hall_blackout` | 카페 홀 · 겨울 정전 밤 | 겨울 폭발 사건(촛불·핸드드립) | — | `hall_morning` |
| P1 | `alley_morning` | 바닷가 골목 | 골목 · 단골이 오는 길 | — | `cafe_front_morning` |
| P1 | `harbor_dawn` | 항구 · 새벽 | 어부 강 씨 | — | — |
| P2 | `hall_busy_summer` | 카페 홀 · 여름 줄 | 여름 폭발 사건 | `counter_peak` | `hall_summer` |
| P2 | `bus_terminal_evening` | 버스 종점 · 저녁 | 버스 기사 한 씨 | `bus_stop_evening` · `bus_stop_morning` | — |
| P2 | `hardware_front` | 철물점 앞 | 철물점 노 씨 | — | `alley_morning` |
| P2 | `post_office_front` | 우체국 앞 | 우체부 도 씨 | — | `alley_morning` |
| P2 | `backroom` | 카페 뒷방(직원 공간) | 앞치마 · 열쇠 장면 | `staff` · `kitchen` | `hall_morning` |
| P2 | `jieun_room_night` | 지은의 방 · 밤 | 하루 끝 일기 | `home_night` · `home_morning` | — |
| P2 | `festival_alley_autumn` | 가을 축제의 골목 | 가을 폭발 사건 | — | `alley_morning` |

- 옛 그림 가운데 `living`·`office`·`tea`는 새 이야기에 쓸 곳이 없어 바꾸지 않고 그냥 두었다가 지웁니다.
- 작업대 배경 `workbench_morning`은 2장 ③에 따로 있습니다(물건 그림체에 맞춘 그림).

### 5.4 프롬프트 (P0)
상자마다 5.2의 공통 블록과 [피할 것]을 이미 넣어 두었습니다. **상자를 그대로 복사**해 넣습니다.

**`hall_morning`** · 카페 홀 · 아침
```
Hand-painted anime background art for a gentle story game: clean architectural lines, soft painterly cel shading, subtle paper grain, calm and warm mood. A small old cafe in a quiet seaside village in Korea. Palette: deep sea teal and navy in the shadows, warm golden lamp light, cream plaster walls, warm oak wood, small forest green accents, a little antique brass. Eye-level camera, natural perspective, clear depth, high resolution, 16:9.
Interior of the cafe in the morning, seen from just behind the wooden counter at standing eye level. On the left, a large old wooden-framed window looking out on a calm blue sea and a small harbor; under the window, a small round table with two mismatched wooden chairs side by side, both empty, one of them a little older. In the middle, open floor space with three small wooden tables. On the right wall, an empty dark green chalkboard in a wooden frame, a wooden shelf with plain cups and glass jars of coffee beans, and a glass door with a small brass bell. Blue-green tiles on the lower walls, a worn wooden floor, a few potted plants, small brass wall lamps. Soft morning light comes in from the window on the left with gentle shadows. The lower quarter of the picture is the plain, empty top of the counter. The middle of the picture stays simple so characters can stand in front of it.
Avoid: text, letters, numbers, readable signs, writing on boards, logos, brand names, watermark, people, clutter, fisheye distortion.
Avoid: red awning, red pendant lamps, bakery display case, rows of bread.
```

**`hall_evening`** · 카페 홀 · 마감 · 참조: `hall_morning`
```
Same cafe interior, same camera angle and the same layout as the reference image: the window seat with two chairs on the left, the empty chalkboard and the shelf on the right, the counter at the bottom.
Evening after closing time: outside the window the sea is deep blue at blue hour with a soft peach glow low on the horizon, small warm lamps are on inside (brass wall lamps and one small lamp on the counter), the chairs are neatly pushed in, a calm and quiet mood.
Hand-painted anime background art for a gentle story game: clean architectural lines, soft painterly cel shading, subtle paper grain, calm and warm mood. A small old cafe in a quiet seaside village in Korea. Palette: deep sea teal and navy in the shadows, warm golden lamp light, cream plaster walls, warm oak wood, small forest green accents, a little antique brass. Eye-level camera, natural perspective, clear depth, high resolution, 16:9.
Avoid: text, letters, numbers, readable signs, writing on boards, logos, brand names, watermark, people, clutter, fisheye distortion.
Avoid: red awning, red pendant lamps, bakery display case, rows of bread.
```

**`cafe_front_morning`** · 카페 앞 · 아침 · 참조: `hall_morning`
```
Hand-painted anime background art for a gentle story game: clean architectural lines, soft painterly cel shading, subtle paper grain, calm and warm mood. A small old cafe in a quiet seaside village in Korea. Palette: deep sea teal and navy in the shadows, warm golden lamp light, cream plaster walls, warm oak wood, small forest green accents, a little antique brass. Eye-level camera, natural perspective, clear depth, high resolution, 16:9.
Exterior of the same small old cafe as the reference image, on a quiet sloping alley in a seaside village, in the morning. A two-story building with weathered cream plaster and dark wood, a faded forest green fabric awning, a big wooden-framed front window with warm light inside, a glass door with a small brass bell, a blank wooden sign board above the door with nothing written on it, a small wooden bench and potted plants by the door, an empty folding chalkboard stand. The cafe fills the right half of the picture. On the left half, the alley slopes down toward a calm blue sea and a small harbor with a few fishing boats under a clear, soft sky; this side stays simple and calm.
Avoid: text, letters, numbers, readable signs, writing on boards, logos, brand names, watermark, people, clutter, fisheye distortion.
Avoid: red awning, red pendant lamps, bakery display case, rows of bread.
```

**`title_cafe_dusk`** · 처음 화면 · 참조: `cafe_front_morning`
```
Same cafe exterior and the same alley as the reference image, at blue hour just after sunset. The sky is a calm gradient from deep blue to a soft peach color near the horizon, the sea is deep teal with a few gentle reflections, the cafe windows glow with warm golden light, and a few small street lamps are on along the alley. The left 45 percent of the picture (the alley and the sea) is calm and simple, with large dark areas for the game title and the menu buttons. Peaceful, inviting and quiet.
Hand-painted anime background art for a gentle story game: clean architectural lines, soft painterly cel shading, subtle paper grain, calm and warm mood. A small old cafe in a quiet seaside village in Korea. Palette: deep sea teal and navy in the shadows, warm golden lamp light, cream plaster walls, warm oak wood, small forest green accents, a little antique brass. Eye-level camera, natural perspective, clear depth, high resolution, 16:9.
Avoid: text, letters, numbers, readable signs, writing on boards, logos, brand names, watermark, people, clutter, fisheye distortion.
Avoid: red awning, red pendant lamps, bakery display case, rows of bread.
```

**`ui_sea_night`** · 메뉴 뒤 · 밤바다
```
Quiet atmospheric background plate for game menus: very calm, low contrast, soft focus, painterly. Large simple dark areas on the left and in the center where text panels will be placed; nothing detailed behind the panels. Palette of deep sea teal and navy with a little warm gold. 16:9, high resolution.
A night view of a calm sea from a seaside village. On the far right edge, the dark wooden frame of an old window and a little warm lamp glow. The rest of the picture is calm dark teal and navy water with soft silvery ripples and a smooth deep navy sky with gentle gradients, with no objects in the left and center. Very low contrast.
Avoid: text, letters, numbers, logos, watermark, people, boats, buildings in the center, bright spots in the center, clutter.
```

### 5.5 프롬프트 (P1 · P2)
P1·P2는 짧게 적었습니다. 만들 때가 되면 같은 방식으로 다듬어 드립니다.

| id | `[이야기 배경]` 또는 `[메뉴 뒤 배경]` 뒤에 붙일 문장 |
| :--- | :--- |
| `ui_cafe_dim` | (메뉴 뒤) The inside of the same cafe at night, completely out of focus: warm golden lamp bokeh on the right, dark wooden walls and shelves melting into deep teal shadows. The left and center are calm and dark. |
| `hall_spring` | Same interior as the reference. Spring morning: pale pink cherry blossom trees along the shore outside the window, a few petals drifting past the glass, fresh soft light. |
| `hall_summer` | Same interior as the reference. Bright summer morning: deep blue sea and white clouds outside, the window half open, thin linen curtains moving softly, a small electric fan on the counter. |
| `hall_autumn` | Same interior as the reference. Autumn afternoon: yellow ginkgo trees by the shore outside, warm low golden light across the floor, a calmer grey-blue sea. |
| `hall_winter` | Same interior as the reference. Winter morning: snow falling outside, snow along the window frame, a little fog at the edges of the glass, a small round heater near the tables. |
| `hall_blackout` | Same interior as the reference during a snowy winter night blackout: the electric lights are off; the room is lit only by several candles in glass jars and two old camping lanterns on the counter and tables, small warm pools of light in deep blue darkness, heavy snow outside, a hand-drip kettle on the counter. Quiet, safe and warm, not scary. |
| `alley_morning` | A narrow sloping alley of low old houses in the same seaside village, morning; flower pots, a hanging laundry line, stone steps, the green awning of the cafe at the far end, the calm sea at the bottom of the slope. |
| `harbor_dawn` | A small fishing harbor at dawn in blue hour: a few small wooden fishing boats moored, coiled ropes and buoys on the stone pier, one small street lamp still on, calm water, the sky turning pale near the horizon. |
| `hall_busy_summer` | Same interior as the reference on a busy summer day: through the window and the glass door, a long line of tourists in the alley is seen only as soft distant silhouettes; extra cups stacked on the counter; bright and lively. (이 그림만 [피할 것]의 `people`을 `people inside the cafe, faces`로 바꿉니다) |
| `bus_terminal_evening` | The last stop of a village bus line by the sea, evening: a small bus shelter with a wooden bench, a parked green-and-cream village bus with nothing written on it, the sea behind a low wall. |
| `hardware_front` | The front of an old hardware store on the same alley: tools, ropes and buckets hanging by the sliding glass doors, a wooden counter inside, a blank sign. |
| `post_office_front` | A small old post office building on the same alley: a blank sign, a postbox, a bicycle with a delivery bag leaning by the door. |
| `backroom` | The small back room of the same cafe: hooks with aprons, shelves with milk crates and coffee bags, a small sink, a key hook by the back door, a little window. |
| `jieun_room_night` | A small rented room above a shop in the same village at night: a desk with a warm lamp and an open notebook, a window showing the dark sea, a folded green apron on the chair. |
| `festival_alley_autumn` | The same alley decorated for a village autumn festival: plain paper lanterns strung between the houses, small food stalls with cream and green awnings, warm evening light. |

### 5.6 검수 포인트 🙋
- **I-6** 카페의 새 모습: 창가 자리(빈 의자 두 개), 빈 칠판, 초록 차양, 바다가 보이는 큰 창. 이 카페의 '얼굴'로 괜찮은지.
- **I-7** 그림체: 이야기 배경은 인물·손님 그림(애니 셀 그림체)과 맞추고, 작업대만 3D처럼 보이는 정교한 2D(2장)입니다.
- **I-8** ✅ P0 다섯 장부터 만듭니다(사용자 결정 2026-10-28). 디자인 '바닷가 밤'(✅ 정함)은 이 다섯 장이 오면 처음 화면·메뉴 뒤에 바로 얹습니다(`title_cafe_dusk` → 처음 화면, `ui_sea_night` → 전체 화면 창 바탕, 홀·카페 앞 → 이야기).

---

## 6. 장면 그림 · 이벤트 CG (✅ 2026-10-28 사용자 요청)
사용자 요청(2026-10-28): "이번 게임은 배경 이미지가 많이 필요하다. 마1스톤에서는 배경을 많지 않게 하고 주요 장면은 사진으로 보여 줬지만, 이번 게임에서는 컷신처럼 주요 장면을 배경에 보여 줘야 감성이 살아난다."
### 6.1 쓰는 법과 규칙
- **엔진**: 대본의 `cg('id')` 비트가 `assets/cg/cg_{id}.jpg`를 화면 전체에 깔고(인물 액자는 잠시 숨김) 그 위로 바닥의 반투명 대화창이 이어집니다. `cg(null)`이면 원래 배경으로 돌아갑니다. 본 장면은 수첩 사진첩에 알림 없이 모입니다(`js/data/cg.js`에 `{ id: { ep, title } }`를 더함).
- **규격**: 16:9, 2K로 키워 받기. 넣는 곳 `assets/cg/cg_{id}.jpg` → `npm run assets`.
- **자리**: 아래쪽 약 1/3(대화창 300px)과 왼쪽 아래 구석(김 문양)은 가려집니다. 얼굴·손·잔처럼 꼭 보여야 할 것은 위쪽 2/3에 둡니다. 맨 위 60px에는 얇은 위쪽 띠가 지나갑니다.
- **✅ CG를 두는 곳**(사용자 결정 2026-10-28: "감성적인 대사나 상황에서는 CG를 뿌려야 한다"): 감성적인 대사·상황마다 이벤트 CG를 띄웁니다. 고정 장면(계절의 큰 사건·고요한 장면·사장의 뒷받침·엔딩)도, 단골 대응 장면도 모두입니다.
- **🙋 대응 장면의 CG 규칙**(대본에 자리를 잡아 둠: `js/data/regulars.js`, 검수 R-25):
  - 힌트 장면에서 그 장면의 CG가 뜨고, 카드를 고르는 동안에도 뒤에 깔립니다.
  - 맞는 대응을 고르면 그 장면만의 CG로 바뀝니다.
  - 무난·어긋남은 힌트 장면 CG가 그대로 이어집니다.
  - 그래서 CG가 있고 없음으로는 점수가 드러나지 않습니다. 그림이 바뀌는 정도의 차이는 반응 연출(오래 바라봄·미소·작은 끄덕임)의 차이와 같은 정도입니다(원칙 1).
  - 힌트 장면의 CG는 대사·서술이 말하는 행동만 그립니다(그림이 답을 더 알려 주지 않게).
- **이벤트 CG 그리기**: 감정이 큰 순간은 가까이 찍습니다(얼굴·손 클로즈업, 어깨 너머, 살짝 기울인 영화 같은 각도). 인물 설계(얼굴·머리·옷)는 설정화와 같게 두고, 칠은 서 있는 그림보다 부드럽고 섬세하게(빛과 그림자, 따뜻한 역광) 합니다. 6.4·6.5의 새 상자에는 이 안내 문장이 들어 있습니다.
- **그림이 오기 전**: 그림이 없는 CG는 건너뛰고(앞 CG가 있으면 그대로 이어짐) 이야기는 그대로 갑니다. `assets/cg/cg_{id}.jpg`를 넣고 `npm run assets`를 하면 바로 뜹니다.
- **그림만으로 알리지 않음**: 그림이 보여 주는 행동은 대사나 서술이 같은 내용을 말합니다(읽어 주기로도 같은 힌트, 원칙 11).
- **사장님의 손**: 떨림을 그리지 않습니다(병명 없이, 원칙 10). 손은 늘 차분하고 자연스럽게.
- **글자 없음**: 칠판·메뉴판·간판에 글자를 그리지 않습니다. 이름이 들어가야 하는 칠판은 게임이 글씨를 얹습니다.
- **만드는 순서**: ① 인물 설정화(1장) → ② 배경 P0(5장) → ③ 장면 P0. 장면은 그 인물의 설정화와 그 장소의 배경을 **참조 이미지로 함께** 넣어야 얼굴과 카페가 같아집니다. 사람이 없는 장면(`blackout_cafe_lit`·`summer_line`·`ending_last_cup`)은 배경만 있으면 먼저 만들 수 있습니다.

### 6.2 공통 블록
**[장면 공통]** 아래 상자들에 이미 들어 있습니다.
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
```
**[피할 것]**
```
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

### 6.3 목록과 우선순위
P0 = 시험판(M1)과 이야기의 첫인상에 바로 필요 · P1 = 계절 이야기(M2·M3) 전에 · P2 = 다른 단골·엔딩의 설정이 정해진 뒤

| 우선 | id | 장면 | 쓰는 곳 | 참조 |
| :--- | :--- | :--- | :--- | :--- |
| P0 | `spring_first_cup` | 봄 첫날 · 사장님이 건네는 첫 컵 | 봄 첫 장면("오늘부터 같이 일하죠.") · PRD 1.5의 상징(봄에는 사장님이 컵을 건넴) | `owner_sheet` · `jieun_sheet` · `hall_morning` |
| P0 | `haesun_two_cups` | 봄 · 우유 두 잔과 빈 의자 | 봄 해순 할머니 1번째 기회: 힌트 장면(할머니의 눈이 빈 의자로 감, 의자 등을 쓸어 줌). 고르기 전 | `haesun_sheet` · `jieun_sheet` · `hall_morning` |
| P0 | `owner_closing_milk` | 봄 끝 · 마감 뒤 혼자 마시는 따뜻한 우유 | 봄 마지막 장면(마감 뒤, 사장님이 혼자 따뜻한 우유를 마심) · 엔딩의 우유 한 컵과 이어짐 | `owner_sheet` · `hall_evening` |
| P0 | `jian_color_menu` | 여름 · 메뉴판의 색 동그라미를 보는 지안 | 여름 지안 1번째 기회: 힌트 장면("오늘은 무슨 색을 마실지 모르겠어요.", 메뉴판의 색 동그라미를 하나씩 봄) · Q-9 | `jian_sheet` · `hall_morning`(여름 빛) |
| P0 | `blackout_cafe_lit` | 겨울 · 정전 밤, 불이 켜진 곳은 카페뿐 | 겨울 정전 밤의 첫 장면("불이 켜진 곳은 우리 카페뿐이다.") · 사람 없음이라 인물 설정화 없이도 만들 수 있음 | `cafe_front_morning` |
| P0 | `haesun_cup_for_him` | 봄 · 의자 앞의 잔 | 봄 해순 할머니 1번째 기회: 맞는 대응 뒤("…고마워요.") | `haesun_sheet` · `hall_morning` |
| P1 | `summer_line` | 여름 · 골목 끝까지 선 줄 | 여름 큰 사건(휴가철에 카페가 명소가 되어 줄이 골목 끝까지 섬) | `cafe_front_morning` |
| P1 | `summer_tourist_chair` | 여름 · 그 의자에 앉은 관광객 | 여름 해순 할머니 2번째 기회: 힌트 장면(말을 멈추고 의자 앞의 잔을 두 손으로 감쌈). 고르기 전 | `haesun_sheet` · `hall_summer` |
| P1 | `autumn_window_haesun` | 가을 · 창가에서 기다리는 할머니 | 가을 해순 할머니 3번째 기회: 힌트 장면(두 손을 무릎에 모으고 창밖을 봄) | `haesun_sheet` · `hall_autumn` |
| P1 | `autumn_key` | 가을 · 사장님이 건네는 가게 열쇠 | 가을 · 사장의 뒷받침 9(큰 장면: "내일은 네가 연다.") | `owner_sheet` · `jieun_sheet` · `hall_evening` |
| P1 | `autumn_dawn_open` | 가을 · 새벽에 혼자 문을 여는 지은 | 가을 큰 사건 다음 날 새벽(지은이 혼자 문을 엶) | `jieun_sheet` · `cafe_front_morning` |
| P1 | `winter_candle_jian` | 겨울 · 촛불 옆의 빈 스케치북 | 겨울 지안 4번째 기회: 힌트 장면(촛불을 오래 봄, 빈 종이를 내려다봄) | `jian_sheet` · `hall_blackout` |
| P1 | `winter_blanket_chair` | 겨울 · 담요와 빈 의자 | 겨울 해순 할머니 4번째 기회: 힌트 장면(할머니가 지은 손의 담요를 보고, 다시 빈 의자를 봄) | `haesun_sheet` · `jieun_sheet` · `hall_blackout` |
| P1 | `winter_granddaughter` | 겨울 · 할머니와 손녀, 그리고 빈 의자 | 겨울 해순 할머니 5번째 기회: 힌트 장면(할머니가 손녀를 보고 빈 의자를 봄, 손녀도 따라 봄) | `haesun_sheet` · `hall_winter` (🙋 손녀는 설정화가 없어 아래 설명대로) |
| P1 | `winter_owner_return` | 겨울 끝 · 눈 그친 아침, 돌아온 사장님 | 겨울 끝 · 사장의 뒷받침 11("컵 닦았냐.") | `owner_sheet` · `jieun_sheet` · `hall_winter` |
| P1 | `winter_milk_handover` | 겨울 끝 · 두 손에 쥐여 주는 마감 우유 | 겨울 마지막 장면(지은이 사장님의 마감 우유를 두 손에 쥐여 줌) · PRD 1.5의 상징 | `owner_sheet` · `jieun_sheet` · `hall_evening` |
| P1 | `winter_chalk_name` | 마지막 컷 · 칠판의 빈칸 | 이야기의 마지막 컷(사장님이 칠판 빈칸에 지은의 이름을 씀). 칠판 글씨는 그리지 않고 게임이 삐뚤한 분필 글씨로 얹음 | `owner_sheet` · `hall_morning` |
| P1 | `ending_last_cup` | 엔딩 · 따뜻한 우유 한 컵 | 엔딩의 마지막 그림(상징이 한 컵으로 닫힘, PRD 5.8) | `hall_morning` |
| P1 | `haesun_small_bow` | 여름 · 할머니의 작은 인사 | 여름 해순 할머니 2번째 기회: 맞는 대응 뒤(손님이 선풍기 앞자리로 옮긴 뒤, 지은을 오래 바라보고 고개를 숙임) | `haesun_sheet` · `hall_summer` |
| P1 | `haesun_one_cup_wait` | 가을 · 한 잔과 빈 의자 | 가을 해순 할머니 3번째 기회: 맞는 대응 뒤("오늘은 내가 마실게요. 기다려 줘서 고마워요.") | `haesun_sheet` · `hall_autumn` |
| P1 | `haesun_blanket_chair_warm` | 겨울 · 이 의자도 따뜻하네요 | 겨울 해순 할머니 4번째 기회: 맞는 대응 뒤("이 의자도 따뜻하네요. 고마워요.") | `haesun_sheet` · `hall_blackout` |
| P1 | `haesun_three_cups` | 겨울 · 세 번째 잔 | 겨울 해순 할머니 5번째 기회: 맞는 대응 뒤("할아버지 것도 있네!", 손녀의 손을 꼭 잡음) | `haesun_sheet` · `hall_winter`(손녀는 `winter_granddaughter`와 같은 설명) |
| P1 | `jian_yellow` | 여름 · 노란색 | 여름 지안 1번째 기회: 맞는 대응 뒤("…노란색이요. 유자차 주세요.") | `jian_sheet` · `hall_morning`(여름 빛) |
| P1 | `jian_summer_corner` | 여름 · 색이 다 똑같아 보여요 | 여름 지안 2번째 기회: 힌트 장면("더워서 그런가, 색이 다 똑같아 보여요.", 스케치북을 가슴에 꼭 안음) | `jian_sheet` · `hall_summer` |
| P1 | `jian_green_cold` | 여름 · 초록색 | 여름 지안 2번째 기회: 맞는 대응 뒤("음… 초록색이요. 녹차라테, 차갑게요.") | `jian_sheet` · `hall_summer` |
| P1 | `jian_autumn_window` | 가을 · 창밖의 노란 잎 | 가을 지안 3번째 기회: 힌트 장면(창밖의 노란 잎을 봄, 메뉴의 색 동그라미를 손가락으로 짚음) | `jian_sheet` · `hall_autumn` |
| P1 | `jian_opens_sketchbook` | 가을 · 다시 펼친 스케치북 | 가을 지안 3번째 기회: 맞는 대응 뒤("창밖이랑 같은 색이요. 노란색.", 자리에 앉아 스케치북을 폄) | `jian_sheet` · `hall_autumn` |
| P1 | `jian_first_line` | 겨울 · 첫 선 | 겨울 지안 4번째 기회: 맞는 대응 뒤("주황색이요. 촛불 색.", 종이에 첫 선을 그음) | `jian_sheet` · `hall_blackout` |
| P1 | `jian_snow_sketchbook` | 겨울 · 두툼해진 스케치북 | 겨울 지안 5번째 기회: 힌트 장면(지은을 봤다가 스케치북을 봄, 창밖의 눈을 봄) | `jian_sheet` · `hall_winter` |
| P1 | `jian_many_colors` | 겨울 · 오늘은 여러 색 | 겨울 지안 5번째 기회: 맞는 대응 뒤("오늘은 여러 색이요. 따뜻한 우유 주세요.") | `jian_sheet` · `hall_winter` |
| P2 | `spring_actor` | 봄 큰 사건 · 벚꽃 주간, 촬영 중 들른 유명 배우와 몰린 손님 | 계절·엔딩 | 배우·매니저 설정화가 먼저 필요 |
| P2 | `summer_neighborhood_hour` | 여름 끝 · "동네 시간"의 첫 아침, 단골 다섯이 조용히 앉아 있음(칠판 글씨는 게임이 얹음) | 계절·엔딩 | 단골 5명 설정화가 먼저 필요 |
| P2 | `autumn_no_same` | 가을 끝 · 노 씨가 지은이 처음 탄 "그 잔"을 맛보고 "같네." 하는 순간 | 계절·엔딩 | 노 씨 설정화가 먼저 필요 |
| P2 | `winter_night_eight` | 겨울 밤 · 단골 여덟이 모여 각자 돕는 장면(랜턴·버너·컵 나르기·버스 전조등·물 끓이기·벽 그림·담요·아기 재우기) | 계절·엔딩 | 단골 8명 · 금 씨 설정화가 먼저 필요 |
| P2 | `owner_eye_01 ~ 11` | 엔딩 · 사장의 눈 11컷: 숨은 장면 11개를 사장님 쪽에서 본 그림(PRD 5.6 표) | 계절·엔딩 | 설정화 + 장면마다 문장이 먼저 필요 |
| P2 | `album_*` | 엔딩 앨범 액자 8장: 단골마다 대표 장면 하나 | 계절·엔딩 | 단골 8명 설정화가 먼저 필요 |

- 숨은 장면 2(도구 높이)·5(칠판 구석의 빈칸)·10(마감 선반의 메모)은 '그림만 바뀜' 장면이라, 장면 그림 대신 배경 그림의 작은 차이(같은 구도에 물건만 다르게)로 만듭니다. P2에서 함께 요청합니다.

**대응 기회별 CG**(시험판 10개 기회 · 맞는 대응이 아니면 힌트 장면 CG가 이어짐)

| 단골 | 기회 | 힌트 장면 CG(모두) | 맞는 대응 CG |
| :--- | :--- | :--- | :--- |
| 해순 할머니 | 봄 · 우유 두 잔(1번째) | `haesun_two_cups` | `haesun_cup_for_him` |
| 해순 할머니 | 여름 · 그 의자의 손님(2번째) | `summer_tourist_chair` | `haesun_small_bow` |
| 해순 할머니 | 가을 · 한 잔 남은 우유(3번째) | `autumn_window_haesun` | `haesun_one_cup_wait` |
| 해순 할머니 | 겨울 · 정전 밤의 의자(4번째) | `winter_blanket_chair` | `haesun_blanket_chair_warm` |
| 해순 할머니 | 겨울 · 손녀가 온 날(5번째) | `winter_granddaughter` | `haesun_three_cups` |
| 지안 | 여름 · 아무거나요(1번째) | `jian_color_menu` | `jian_yellow` |
| 지안 | 여름 · 시원한 거 아무거나(2번째) | `jian_summer_corner` | `jian_green_cold` |
| 지안 | 가을 · 창밖의 노란 잎(3번째) | `jian_autumn_window` | `jian_opens_sketchbook` |
| 지안 | 겨울 · 촛불 아래(4번째) | `winter_candle_jian` | `jian_first_line` |
| 지안 | 겨울 · 눈 오는 날(5번째) | `jian_snow_sketchbook` | `jian_many_colors` |

- 고정 장면 CG(시험판): 봄 `spring_first_cup`(첫 컵) · `owner_closing_milk`(마감 우유), 여름 `summer_line`(줄), 겨울 `blackout_cafe_lit`(정전 밤의 카페).

### 6.4 프롬프트 (P0) — 상자를 그대로 복사

**`spring_first_cup`** · 봄 첫날 · 사장님이 건네는 첫 컵 · 참조: `owner_sheet` · `jieun_sheet` · `hall_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Early spring morning before opening, behind the wooden counter of the cafe. the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal grey knit vest, dark brown apron, reading glasses on a cord) gently hands JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist) a plain white mug of warm milk with a little steam; she receives it carefully with both hands, a little nervous but touched. Medium shot from the side at standing eye level, the two of them left of center, the big window behind them showing a calm pale blue sea in soft morning light. An empty dark green chalkboard on the wall, glass jars of coffee beans on a shelf.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`haesun_two_cups`** · 봄 · 우유 두 잔과 빈 의자 · 참조: `haesun_sheet` · `jieun_sheet` · `hall_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Over-the-shoulder view from behind JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist): in the right foreground, at the middle height of the picture, her hands in cream sleeves hold a small wooden tray with two white mugs of warm milk. In the middle ground, HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) sits at the small round table by the big window; beside her is an empty, slightly older wooden chair that nobody sits on. She gently strokes the back of the empty chair with one hand and looks at it with a quiet, wistful smile. Soft morning light from the window, the calm sea outside.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`owner_closing_milk`** · 봄 끝 · 마감 뒤 혼자 마시는 따뜻한 우유 · 참조: `owner_sheet` · `hall_evening`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Night after closing time. Most cafe lights are off; one small warm lamp glows on the counter. the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal grey knit vest, dark brown apron, reading glasses on a cord) sits alone at the window table, holding a white mug of warm milk in both hands, thin steam rising, looking out at the dark blue night sea through the big window. The chairs are pushed in. Calm and a little lonely, but warm. Seen from across the room, slightly from the side.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_color_menu`** · 여름 · 메뉴판의 색 동그라미를 보는 지안 · 참조: `jian_sheet` · `hall_morning`(여름 빛)
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Summer afternoon at the counter. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) stands in front of the counter, hugging a closed plain black sketchbook to her chest, looking up at the menu board on the wall. The menu board has no words at all: only a neat row of simple painted color circles (yellow, green, orange, brown, white, pink), each next to a small drawing of a cup. Her expression is quiet and unsure. Seen from behind the counter at standing eye level; she is in the center, the menu board on the upper right. Bright but soft summer light.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`blackout_cafe_lit`** · 겨울 · 정전 밤, 불이 켜진 곳은 카페뿐 · 참조: `cafe_front_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A heavy snowy winter night in the seaside village during a blackout: the houses, street lamps and the small harbor are all dark and covered in thick snow under a deep navy sky with falling snowflakes. Only one building glows: the small old cafe from the reference image, its big front window and glass door filled with warm candle and lantern light, a soft warm glow spilling onto the snow in front of it. Wide shot from a little above the sloping alley, the cafe slightly right of center. Quiet and safe, not scary.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```


**`haesun_cup_for_him`** · 봄 · 의자 앞의 잔 · 참조: `haesun_sheet` · `hall_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
Soft morning light from the window on the left. HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) sits at the small round table by the window and gazes for a long time at the white mug of warm milk placed in front of the empty, slightly older wooden chair beside her. Her eyes are a little moist and she wears a quiet, grateful smile; one hand rests gently on the table near the cup. Seen from a low angle across the table: the steaming cup and the empty chair on the right at middle height, her face in the upper left. Tender and calm.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

### 6.5 프롬프트 (P1) — 상자를 그대로 복사

**`summer_line`** · 여름 · 골목 끝까지 선 줄 · 참조: `cafe_front_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A hot, bright summer afternoon on the sloping alley: a long line of tourists in summer clothes stretches from the cafe door down to the far end of the alley, holding phones and hand fans, drawn small and simple; the cafe with its faded forest green awning on the right, the sea at the bottom of the slope. Lively but not chaotic.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`summer_tourist_chair`** · 여름 · 그 의자에 앉은 관광객 · 참조: `haesun_sheet` · `hall_summer`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A busy summer afternoon inside the cafe. At the window table, a young tourist in a sun hat and t-shirt has just sat down on the empty chair beside HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt), smiling and unaware. HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) gently covers the warm milk mug in front of that chair with both hands; she has stopped in the middle of a word, with a small worried look. Other customers in the background are simple and slightly blurred. Medium shot at eye level.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`autumn_window_haesun`** · 가을 · 창가에서 기다리는 할머니 · 참조: `haesun_sheet` · `hall_autumn`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A quiet autumn morning. HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) sits at the window table with both hands folded on her knees, looking out of the big window at yellow ginkgo trees by the sea. Beside her is the empty wooden chair. Warm low autumn light across the wooden floor, a calm grey-blue sea. Seen from across the room at eye level; gentle and still.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`autumn_key`** · 가을 · 사장님이 건네는 가게 열쇠 · 참조: `owner_sheet` · `jieun_sheet` · `hall_evening`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Evening after closing, close-up at the counter: the OWNER's hand places an old brass cafe key on a small ring into JIEUN's open palm. Only their hands, sleeves and the edge of her green apron are sharp in the frame; the OWNER's calm face (white combed-back hair, short white beard, charcoal knit vest) is slightly out of focus above. Warm lamp light, the dark blue window behind. Both hands are steady and natural.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`autumn_dawn_open`** · 가을 · 새벽에 혼자 문을 여는 지은 · 참조: `jieun_sheet` · `cafe_front_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Blue dawn before sunrise in autumn. JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist), wearing a light jacket over her apron, stands alone at the cafe's glass door, turning a brass key in the lock; a few yellow leaves lie on the step. The alley is still dark and empty; the sea and the sky are turning pale near the horizon. Seen from the side, slightly behind her; determined and a little lonely.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`winter_candle_jian`** · 겨울 · 촛불 옆의 빈 스케치북 · 참조: `jian_sheet` · `hall_blackout`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A snowy blackout night inside the cafe, lit only by candles in glass jars. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) sits in a corner seat with an open blank sketchbook on her knees and a pencil in her hand, gazing at a candle flame on the small table beside her. Warm orange candlelight on her face, deep blue shadows around. Close medium shot; quiet and thoughtful.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`winter_blanket_chair`** · 겨울 · 담요와 빈 의자 · 참조: `haesun_sheet` · `jieun_sheet` · `hall_blackout`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A snowy blackout night in the candle-lit cafe. At the window table, HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) sits with a knitted blanket over her knees; beside her is the empty wooden chair. JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist) stands next to the table holding one more folded cream blanket. HAESUN looks at the blanket in JIEUN's hands, then at the empty chair. Small warm candle lights, snow falling outside the dark window. Medium shot at eye level.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`winter_granddaughter`** · 겨울 · 할머니와 손녀, 그리고 빈 의자 · 참조: `haesun_sheet` · `hall_winter` (🙋 손녀는 설정화가 없어 아래 설명대로)
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A snowy afternoon with soft white light from the window. HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) and her GRANDDAUGHTER (Korean girl about ten years old, short black bob hair, cream knit hat, navy duffle coat, rosy cheeks) sit side by side at the window table; both of them look at the empty wooden chair across the table, the girl curious and the grandmother gentle. Snow falls over the sea outside. Medium shot; warm and calm.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`winter_owner_return`** · 겨울 끝 · 눈 그친 아침, 돌아온 사장님 · 참조: `owner_sheet` · `jieun_sheet` · `hall_winter`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
A bright, clear morning after the snow has stopped. The cafe's glass door is open; the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal grey knit vest, dark brown apron, reading glasses on a cord), in a dark wool coat and scarf with a little snow on his shoulders, stands in the doorway and looks at JIEUN behind the counter with a rare small smile. JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist) holds a cloth and a freshly washed white cup, surprised. Fresh snow outside glows softly. Medium wide shot from the side.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`winter_milk_handover`** · 겨울 끝 · 두 손에 쥐여 주는 마감 우유 · 참조: `owner_sheet` · `jieun_sheet` · `hall_evening`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Night after closing, one warm lamp on the counter. JIEUN (Korean woman, 21, straight black hair in a low ponytail with short side bangs, calm dark brown eyes, cream long-sleeve henley with rolled-up sleeves, forest green canvas barista apron with a brown leather strap, mustard hair tie on her right wrist) gently places a white mug of warm milk into the OWNER's hands, her two hands wrapped around his, thin steam rising between them. the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal grey knit vest, dark brown apron, reading glasses on a cord) looks at the cup quietly, his eyes softened. Close medium shot of the two at the counter, warm golden light, dark blue window behind. All hands steady and natural.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`winter_chalk_name`** · 마지막 컷 · 칠판의 빈칸 · 참조: `owner_sheet` · `hall_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Soft morning light in the cafe. the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal grey knit vest, dark brown apron, reading glasses on a cord), seen from behind and slightly to the side, stands at the dark green chalkboard on the wall with a piece of white chalk in his hand, as if he has just finished writing in the lower right corner of the board. The whole board, including that corner, is blank (the words will be added later). Quiet, proud and gentle mood.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`ending_last_cup`** · 엔딩 · 따뜻한 우유 한 컵 · 참조: `hall_morning`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up of a single white mug of warm milk on the warm oak counter in soft morning light, a thin wisp of steam rising, the calm sea blurred through the window behind. Simple, quiet and hopeful.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```


**`haesun_small_bow`** · 여름 · 할머니의 작은 인사 · 참조: `haesun_sheet` · `hall_summer`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
A bright summer afternoon. In the background, the young tourist in a sun hat now sits happily by an electric fan at another table, slightly blurred. In the foreground, HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) sits at the window table beside the empty wooden chair, which is free again with a warm milk mug in front of it. She looks toward the viewer (JIEUN's point of view) with a gentle look and bows her head slightly in thanks. Medium close-up from JIEUN's standing eye level.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`haesun_one_cup_wait`** · 가을 · 한 잔과 빈 의자 · 참조: `haesun_sheet` · `hall_autumn`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
A quiet autumn morning. HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt) at the window table holds a single white mug of warm milk with both hands and looks for a long time at the empty wooden chair across from her. Yellow ginkgo trees outside the window, warm low autumn light on her face and hands, a calm, accepting expression with a faint smile. Shot from beside the empty chair.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`haesun_blanket_chair_warm`** · 겨울 · 이 의자도 따뜻하네요 · 참조: `haesun_sheet` · `hall_blackout`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
The candle-lit cafe on a snowy blackout night. A cream knitted blanket has been laid over the empty wooden chair beside HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt); she smooths it with one hand and gazes at it for a long time, her face softly lit by a nearby candle in a glass jar, a warm, quietly moved expression. Deep blue darkness around, snow falling outside the window.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`haesun_three_cups`** · 겨울 · 세 번째 잔 · 참조: `haesun_sheet` · `hall_winter`(손녀는 `winter_granddaughter`와 같은 설명)
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
A snowy afternoon with soft white light from the window. On the window table stand three white mugs of warm milk: one in front of HAESUN (Korean grandmother, 80, short neat silver-white hair, no glasses, navy cardigan over a cream blouse, long grey skirt), one in front of her GRANDDAUGHTER (Korean girl about ten years old, short black bob hair, cream knit hat, navy duffle coat, rosy cheeks), and the third in front of the empty wooden chair. The girl points at the third cup with a bright, surprised smile; the grandmother holds the girl's hand firmly and looks at the third cup with tender, glistening eyes. Medium close-up; warm and calm.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_yellow`** · 여름 · 노란색 · 참조: `jian_sheet` · `hall_morning`(여름 빛)
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
A summer afternoon at the counter. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt), hugging her closed plain black sketchbook, looks up at the yellow circle on the wordless color-circle menu board on the wall; a small light comes back into her eyes and a faint smile appears. Soft summer light from the side, a gentle warm yellow reflection on her cheek. Shot from a slightly low angle beside the counter; the painted yellow circle is small in the upper right of the frame (no text).
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_summer_corner`** · 여름 · 색이 다 똑같아 보여요 · 참조: `jian_sheet` · `hall_summer`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
The crowded cafe on a hot summer afternoon. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) stands at the counter hugging her closed black sketchbook tightly to her chest, her shoulders a little tense, looking down with a tired, unsure expression. Behind her, the busy cafe full of tourists is blurred into soft, washed-out, similar colors. Medium close-up from behind the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_green_cold`** · 여름 · 초록색 · 참조: `jian_sheet` · `hall_summer`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) bends slightly to look into the glass-door drinks fridge beside the counter; among the cold drinks, a bottle of pale green matcha milk catches her eye. Cool light from the fridge on her face, her expression focused and a little brighter, a soft green reflection in her eyes. Shot from inside the fridge looking out through the glass (no labels or text on the bottles).
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_autumn_window`** · 가을 · 창밖의 노란 잎 · 참조: `jian_sheet` · `hall_autumn`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
An autumn morning at the counter. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) looks out of the big window at the yellow ginkgo trees by the sea, while the fingertip of her right hand rests on a painted color circle of a small wordless menu card lying on the counter (the same color circles as the wall menu board). Warm low autumn light, golden leaves outside, a thoughtful, quiet expression. Medium close-up from the side.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_opens_sketchbook`** · 가을 · 다시 펼친 스케치북 · 참조: `jian_sheet` · `hall_autumn`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
An autumn morning. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) sits at a window table and slowly opens her black sketchbook to a blank page, a warm cup of yellow citron tea beside her, yellow ginkgo leaves outside the window. Warm golden autumn light falls across the page and her hands; her expression is calm with a small, hopeful smile. Shot over her shoulder at a slight angle.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_first_line`** · 겨울 · 첫 선 · 참조: `jian_sheet` · `hall_blackout`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
A snowy blackout night, lit only by a candle in a glass jar. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt)'s hand holds a pencil and draws the very first soft orange line on the blank page of the sketchbook on her knees; her face above is gently lit by the candle, eyes fixed on the line, lips slightly parted, quietly moved. Warm orange candlelight and deep blue shadows. A slightly tilted cinematic angle close to the page.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_snow_sketchbook`** · 겨울 · 두툼해진 스케치북 · 참조: `jian_sheet` · `hall_winter`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
A snowy morning. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt), wearing a scarf over her mustard cardigan, stands near the counter holding a thick black sketchbook with both hands; colorful paper edges peek out between its pages. She glances from the viewer (JIEUN) to the sketchbook, a little shy. Snow falls softly outside the big window behind her. Medium close-up from behind the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

**`jian_many_colors`** · 겨울 · 오늘은 여러 색 · 참조: `jian_sheet` · `hall_winter`
```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Close-up event CG framing with softer, more detailed painterly shading than the standing sprites, same character design.
A snowy morning. JIAN (Korean woman, 27, shoulder-length wavy dark brown hair loosely tied half-up, a wooden pencil behind her right ear, oversized mustard knit cardigan over a white t-shirt) looks at the viewer (JIEUN) for a long moment and then breaks into a warm, open smile, her cheeks slightly flushed from the cold, holding the thick sketchbook full of colorful pages against her chest. Soft white snow light from the window, warm cafe light on her face. Shot at eye level, her face in the upper center.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast.
```

### 6.6 검수 포인트 🙋
- **I-9** ✅ CG를 두는 곳(사용자 결정 2026-10-28): 감성적인 대사·상황마다. 🙋 대응 장면은 힌트 CG → 맞는 대응은 고유 CG, 무난·어긋남은 힌트 CG 유지(6.1, 검수 R-25).
- **I-10** 손녀: 설정화가 없어 10살쯤 · 단발 · 크림색 니트 모자 · 남색 더플코트로 적었습니다. 바꾸거나 설정화를 먼저 만들지.
- **I-11** 지안의 메뉴판: 글자 없이 색 동그라미 + 컵 그림(Q-9 제안). 이 그림이 정해지면 메뉴판 배경과 커피 만들기 화면도 같은 색을 씁니다.
- **I-12** 마지막 컷의 이름: 칠판은 비워 두고 게임이 '지은'을 삐뚤한 분필 글씨로 얹습니다(그림 속 한글 글씨는 생성 그림에서 깨지기 쉬움).
- **I-13** 양: 장면·이벤트 CG P0 6장 · P1 24장 · P2 약 25장. 배경 20장(5장)과 합치면 이야기 전체에 그림 75장쯤이 필요합니다. 계절마다 나눠 만들지.

## 8. 새 놀이의 그림 (재미 개편, 2026-11-01)

> 사용자(2026-11-01): "갈매기, 자동차, 동산 등은 나에게 flow로 제작할 프롬프트를 제시해라." 지금은 코드로 그린 임시 그림(갈매기 · 배 · 등대 · 물고기는 단순한 SVG, 버스 창밖은 색 띠)입니다.
> 그림이 오면 `assets/flow/`에 넣고 알려 주세요. 초록 바탕을 지우고 잘라서 게임에 넣습니다.

### 8.1 규칙
- 그림체는 **5장의 배경과 같은 손그림 애니 배경 그림체**에 맞춥니다(장면 위에 놓여도 튀지 않게). 그래서 프롬프트 맨 앞에 [놀이 그림] 블록을 붙입니다.
- 시트(①·③)는 **초록 바탕 · 4칸 × 3줄 · 마지막 칸 비움**입니다(2장 물건 시트와 같은 규칙).
- 버스 창밖(②)은 **좌우가 이어지는 그림**이어야 끊김 없이 흘러갑니다. 왼쪽 끝과 오른쪽 끝이 맞닿게 해 달라고 적었습니다.
- 글자 · 숫자 · 간판 글씨, 해 · 빛살은 넣지 않습니다(욱일기 연상 금지).

**[놀이 그림]** (①·③ 맨 앞에 붙임)
```
Hand-painted anime game sprites for a gentle story game, matching soft painterly anime background art: clean confident line art in dark brown (not black), soft cel shading with a little painterly texture, warm and friendly look, medium saturation. Palette: deep sea teal and navy, warm cream, warm oak brown, soft forest green, a little antique brass.
```

### 8.2 ① 놀이 시트 `sheet_play` · 1:1 · 참조: `cafe_front_morning`
그 갈매기(쫓기 놀이 · 버스 창밖), 창밖을 지나가는 것들(배 · 등대 · 물고기 · 자동차), 지은의 가방.
```
[놀이 그림 블록]
A game asset sheet. The square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one subject is centered in each cell with wide empty margins; subjects never touch or overlap each other or the cell edges. All subjects use the same light from the upper left.
Row 1 (the same chubby, slightly cheeky seagull in every cell: white body, light grey wings, yellow beak and legs, round black eyes, a little smug expression): the seagull standing on its feet, side view facing right, holding a golden croissant in its beak; the same seagull startled with ruffled feathers, eyes wide, the croissant slipping out of its beak (comic surprise pose); the same seagull flying away to the upper right with wings spread wide, the croissant in its beak; the same seagull gliding seen from slightly below, wings spread, small and simple.
Row 2: a small Korean coastal fishing boat, side view facing left, white hull with a red stripe, a small cabin and a mast with a little flag; a short white lighthouse with two red stripes on a small rock; a silver fish jumping in an arc, side view facing left, with a few water drops; a small white compact car, side view facing left.
Row 3: a small yellow delivery van, side view facing left; a small sky-blue local bus, side view facing left; a large worn canvas backpack (warm brown, rolled blanket strapped on top), side view; the last cell (bottom right) completely empty.
Flat solid chroma key green background (#00B140) everywhere, no gradients, no ground, no cast shadows on the background, no green reflections on the subjects.
Avoid: text, letters, numbers, license plates, logos, brand names, watermark, people, drivers visible in cars, sun, sun rays, overlapping subjects.
```

### 8.3 ② 버스 창밖 세 장 · 16:9 · 참조: `cafe_front_morning`
버스 놀이의 창밖 풍경입니다. 뒤에서부터 **하늘 · 먼 바다 → 동산 → 버스 창틀** 순서로 겹쳐서, 앞의 것이 더 빨리 흘러가게 합니다.

**②-1 먼 바다** `bus_far` (가장 뒤, 천천히 흐름)
```
[5.2 이야기 배경 블록]
A seamless horizontally tileable panorama (the left edge and the right edge match exactly so the picture can repeat side by side). Late afternoon, warm peach and soft blue sky with a few soft clouds; below it, a calm wide sea with gentle light on the water and two or three small distant islands. The lower third is plain calm sea. No land in the foreground, nothing in the middle that draws the eye.
Avoid: text, letters, people, boats, birds, sun, sun disk, sun rays, light beams.
```

**②-2 동산** `bus_hills` (가운데, 조금 빨리 흐름)
```
[5.2 이야기 배경 블록]
A seamless horizontally tileable band of low green coastal hills (the left edge and the right edge match exactly), seen from a moving bus: soft rounded hills with patches of trees, a few small village houses with tiled roofs, a winding stone wall, a utility pole here and there. The hills fill only the lower half of the picture; the whole upper half above the hills is flat solid chroma key green (#00B140) so it can be removed. No green reflections on the hills, keep the grass a natural olive green that is clearly different from the key green.
Avoid: text, letters, signs, people, cars, sun, sun rays.
```

**②-3 버스 창틀** `bus_window_frame` (맨 앞, 움직이지 않음)
```
[5.2 이야기 배경 블록]
The inside of an old Korean local country bus, seen from a passenger seat looking sideways at a large window. The big window glass area fills the middle of the picture and is flat solid chroma key green (#00B140) so the outside view can be placed behind it. Around it: a worn metal window frame with a sliding upper pane, a hanging hand strap ring at the top, the top of a seat back with fabric at the bottom left, a little warm afternoon light on the inside panels. Calm and cozy.
Avoid: text, letters, signs, advertisements, people, hands, sun, sun rays, anything visible through the window.
```

### 8.4 ③ 꾸미기 · 앞치마 시트 `sheet_deco` · 1:1 · 참조: `title_cafe_dusk`
가게 꾸미기(처음 화면의 카페 앞에 놓임)와 앞치마(수첩 '나의 성장')입니다. 지금은 아이콘으로 섭니다.
```
[놀이 그림 블록]
A game asset sheet. The square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each cell with wide empty margins; nothing touches or overlaps. Same light from the upper left.
Row 1: a terracotta flower pot with small white and yellow flowers; a wind chime made of small seashells hanging from a short driftwood bar; a long wooden bench for outside a cafe, three-quarter view; a small warm hanging porch lamp with a brass frame.
Row 2: a small folding A-frame chalkboard stand, the board left completely blank; a small sea-blue cloth flag on a short wooden pole, waving; a navy blue barista bib apron on a wooden hanger; a coffee-brown barista bib apron on a wooden hanger.
Row 3: a blue-and-white striped barista bib apron on a wooden hanger; a coral pink barista bib apron on a wooden hanger; a forest green barista bib apron on a wooden hanger; the last cell (bottom right) completely empty.
Flat solid chroma key green background (#00B140) everywhere, no gradients, no cast shadows on the background, no green reflections.
Avoid: text, letters, numbers, logos, writing on the chalkboard, people, sun, sun rays.
```

### 8.5 검수 포인트 🙋
- 갈매기는 **조금 얄밉고 귀여운 얼굴**이 좋을지, 그냥 평범한 갈매기가 좋을지.
- 자동차 · 버스는 창밖을 지나가는 것으로만 씁니다(버스 놀이). 더 넣고 싶은 것(자전거 · 경운기 등)이 있으면 알려 주세요.
- 도시 카페의 점심시간은 직업 마1스톤의 `counter_peak` 그림을 그대로 씁니다(2026-11-01 사용자). 색을 많이 빼서 지은의 기억처럼 보이게 했습니다.

