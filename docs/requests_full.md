# 요청서 · 풀 버전 (그림 · 물건 · 블렌더 컷 · 소리 · 음성)

> 생성: `npm run requests`(`tools/export-requests.mjs`) · 이 파일은 직접 고치지 않습니다. 그림이 들어오면 다시 돌리면 목록에서 빠집니다.
> 사용자(2026-10-31): "부족한 컴포넌트 예를 들어 이미지, 추가 효과음, 추가 음성 TTS 파일 등은 요청서를 만들면 내PC에서 제작하겠다. 필요 이미지들은 … 대체 요망이라고 적어두면 된다."
> 지금 게임은 이 목록이 없어도 끝까지 돌아갑니다. 없는 그림은 임시 그림(SVG)에 **"임시 그림 · 대체 요망"** 표시가 붙고, 없는 소리는 조용히 넘어갑니다.
> 그림 규칙은 `docs/image_requests.md` 0장 · 6.1과 같습니다(글자 없음 · 빛살 금지 · 사장님 손은 떨림 없이 차분하게 · 얼굴과 손은 위쪽 2/3).

## 0. 한눈에

| 무엇 | 남은 수 | 넣는 곳 | 그다음 |
| :--- | :--- | :--- | :--- |
| 인물 스탠딩(새 인물 12명) | 설정화 12 + 표정 35장 | `assets/_src/stand/{id}_{표정}.jpg` | `npm run images` → `python tools/face-boxes.py` |
| 장면 그림(CG) | 새로 104장 + `docs/추가 제작.md`에 이미 있는 23장 | `assets/cg/cg_{id}.jpg` | `npm run assets` |
| 작업대 물건 시트 3 | 11개를 시트 1장에 | `assets/_src/objects/sheet_more.jpg` | `npm run objects` |
| 블렌더 한 컷(손 동작) | 15가지 + 포장 컵 · 색 있는 음료(I-28 · I-29) | `tools/blender/scene_bench.py` | `shots_post.py` → `npm run assets` |
| 효과음 · 환경음 | 효과음 7 · 환경음 3 | `tools/audio/audio_map.mjs` | `npm run audio` |
| 배경음악 | 9곡(새로 만듦, 3장 규칙) | `tools/audio/audio_map.mjs` 의 bgm | `npm run audio` |
| 음성 | 바뀐 줄만 | `tools/voice/lines.json` | `npm run voices` |

## 1. 인물 스탠딩 (새 인물)

만드는 순서는 `docs/image_requests.md` 1장과 같습니다: ① 설정화 → ② 보통(설정화를 참조) → ③ 나머지 표정(보통을 참조). 무대에서 오른쪽을 보고 섭니다.
표정은 대본에 쓰인 것만 적었습니다. 그림이 오기 전에는 임시 초상(SVG)으로 섭니다.

### 1.1 도 씨 — 우체부 (id `do`)

- 처음 나오는 날: 봄 3일 · 표정: normal + smile · surprised · worried
- 임시 초상 색: 옷 #2F5D8A · 강조 #B0413E

**① 설정화** `do_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of DO, Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
full-body front view and side view, three expression headshots on the right: calm, warm smile, surprised.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `do_normal` · 9:16 · 참조: `do_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `do_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `do_smile` | smile | warm gentle smile, eyes softened |
| `do_surprised` | surprised | surprised expression, eyes wide, eyebrows raised, mouth slightly open |
| `do_worried` | worried | worried expression, eyebrows drawn together, small frown |

### 1.2 강 씨 — 어부 (id `kang`)

- 처음 나오는 날: 봄 3일 · 표정: normal + smile
- 임시 초상 색: 옷 #5E7154 · 강조 #3B5E6B

**① 설정화** `kang_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of KANG, Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
full-body front view and side view, three expression headshots on the right: calm, warm smile, thoughtful.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `kang_normal` · 9:16 · 참조: `kang_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `kang_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `kang_smile` | smile | warm gentle smile, eyes softened |

### 1.3 한 씨 — 버스 기사 (id `han`)

- 처음 나오는 날: 여름 2일 · 표정: normal + smile · surprised · worried
- 임시 초상 색: 옷 #4A5D8A · 강조 #4A5D8A

**① 설정화** `han_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of HAN, Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
full-body front view and side view, three expression headshots on the right: calm, warm smile, surprised.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `han_normal` · 9:16 · 참조: `han_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `han_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `han_smile` | smile | warm gentle smile, eyes softened |
| `han_surprised` | surprised | surprised expression, eyes wide, eyebrows raised, mouth slightly open |
| `han_worried` | worried | worried expression, eyebrows drawn together, small frown |

### 1.4 은주 — 아기 엄마 (id `eunju`)

- 처음 나오는 날: 여름 3일 · 표정: normal + sad · smile · surprised · worried
- 임시 초상 색: 옷 #E8B4C4 · 강조 #C2708A

**① 설정화** `eunju_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of EUNJU, Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
full-body front view and side view, three expression headshots on the right: calm, warm smile, surprised.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `eunju_normal` · 9:16 · 참조: `eunju_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `eunju_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `eunju_sad` | sad | quietly sad expression, eyes lowered, lips pressed together |
| `eunju_smile` | smile | warm gentle smile, eyes softened |
| `eunju_surprised` | surprised | surprised expression, eyes wide, eyebrows raised, mouth slightly open |
| `eunju_worried` | worried | worried expression, eyebrows drawn together, small frown |

### 1.5 수민 — 고3 학생 (id `sumin`)

- 처음 나오는 날: 여름 3일 · 표정: normal + surprised · nervous · smile
- 임시 초상 색: 옷 #3E4A7A · 강조 #5B6BB0

**① 설정화** `sumin_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of SUMIN, Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
full-body front view and side view, three expression headshots on the right: calm, warm smile, surprised.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `sumin_normal` · 9:16 · 참조: `sumin_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `sumin_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `sumin_surprised` | surprised | surprised expression, eyes wide, eyebrows raised, mouth slightly open |
| `sumin_nervous` | nervous | nervous expression, eyebrows drawn together, small sweat drop, holding something tightly in front of the chest |
| `sumin_smile` | smile | warm gentle smile, eyes softened |

### 1.6 노 씨 — 철물점 주인 (id `noh`)

- 처음 나오는 날: 여름 4일 · 표정: normal + smile
- 임시 초상 색: 옷 #7A6A55 · 강조 #8A5A2B

**① 설정화** `noh_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of NOH, Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
full-body front view and side view, three expression headshots on the right: calm, warm smile, thoughtful.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `noh_normal` · 9:16 · 참조: `noh_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `noh_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `noh_smile` | smile | warm gentle smile, eyes softened |

### 1.7 금 씨 — 늘 바쁜 손님 (id `geum`)

- 처음 나오는 날: 봄 2일 · 표정: normal + angry · surprised · smile
- 임시 초상 색: 옷 #3A3A40 · 강조 #9A7A2A

**① 설정화** `geum_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of GEUM, Korean man in his forties, a busy office worker who commutes by ferry, neat short black hair, dark charcoal suit with a slightly loosened tie, a smartphone in hand, a wristwatch.
full-body front view and side view, three expression headshots on the right: calm, warm smile, surprised.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `geum_normal` · 9:16 · 참조: `geum_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean man in his forties, a busy office worker who commutes by ferry, neat short black hair, dark charcoal suit with a slightly loosened tie, a smartphone in hand, a wristwatch.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `geum_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `geum_angry` | angry | impatient irritated expression, frowning, glancing at a wristwatch |
| `geum_surprised` | surprised | surprised expression, eyes wide, eyebrows raised, mouth slightly open |
| `geum_smile` | smile | warm gentle smile, eyes softened |

### 1.8 배우 — 유명 배우 (id `actor`)

- 처음 나오는 날: 봄 5일 · 표정: normal + smile · surprised
- 임시 초상 색: 옷 #EDE6F2 · 강조 #7A4AA0

**① 설정화** `actor_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of ACTOR, Korean woman in her early thirties, an original fictional actress (not resembling any real person), long dark brown wavy hair, large sunglasses pushed up on her head, elegant cream trench coat over a lavender knit, graceful but tired gentle face.
full-body front view and side view, three expression headshots on the right: calm, warm smile, surprised.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `actor_normal` · 9:16 · 참조: `actor_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean woman in her early thirties, an original fictional actress (not resembling any real person), long dark brown wavy hair, large sunglasses pushed up on her head, elegant cream trench coat over a lavender knit, graceful but tired gentle face.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `actor_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `actor_smile` | smile | warm gentle smile, eyes softened |
| `actor_surprised` | surprised | surprised expression, eyes wide, eyebrows raised, mouth slightly open |

### 1.9 매니저 — 배우의 매니저 (id `agent`)

- 처음 나오는 날: 봄 5일 · 표정: normal + angry
- 임시 초상 색: 옷 #2F3A55 · 강조 #5A5F6A

**① 설정화** `agent_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of AGENT, Korean man in his thirties, an actor's manager, messy black hair, a black headset with a small microphone, navy padded vest over a gray hoodie, a walkie-talkie clipped to his belt.
full-body front view and side view, three expression headshots on the right: calm, warm smile, thoughtful.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `agent_normal` · 9:16 · 참조: `agent_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean man in his thirties, an actor's manager, messy black hair, a black headset with a small microphone, navy padded vest over a gray hoodie, a walkie-talkie clipped to his belt.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `agent_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `agent_angry` | angry | impatient irritated expression, frowning, glancing at a wristwatch |

### 1.10 처음 온 엄마 — 손님 (id `mom2`)

- 처음 나오는 날: 겨울 5일 · 표정: normal + nervous · smile
- 임시 초상 색: 옷 #C9B79A · 강조 #B08A5A

**① 설정화** `mom2_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of MOM2, Korean woman in her early thirties, a shy new mother, long dark brown hair, gentle face, beige knit coat, a baby carrier sling, a small light gray baby stroller.
full-body front view and side view, three expression headshots on the right: calm, warm smile, thoughtful.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `mom2_normal` · 9:16 · 참조: `mom2_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean woman in her early thirties, a shy new mother, long dark brown hair, gentle face, beige knit coat, a baby carrier sling, a small light gray baby stroller.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `mom2_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `mom2_nervous` | nervous | nervous expression, eyebrows drawn together, small sweat drop, holding something tightly in front of the chest |
| `mom2_smile` | smile | warm gentle smile, eyes softened |

### 1.11 젊은 어부 — 어부 (id `young_fisher`)

- 처음 나오는 날: 겨울 4일 · 표정: normal
- 임시 초상 색: 옷 #E0A040 · 강조 #4A7A8A

**① 설정화** `young_fisher_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of YOUNG_FISHER, Korean young man in his twenties, a young fisherman, messy black hair under a mustard yellow knit beanie, orange waterproof work jacket, black rubber boots.
full-body front view and side view, three expression headshots on the right: calm, warm smile, thoughtful.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `young_fisher_normal` · 9:16 · 참조: `young_fisher_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean young man in his twenties, a young fisherman, messy black hair under a mustard yellow knit beanie, orange waterproof work jacket, black rubber boots.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

### 1.12 한 씨의 딸 — 중학생 (id `han_daughter`)

- 처음 나오는 날: 겨울 3일 · 표정: normal + smile
- 임시 초상 색: 옷 #8FA7C9 · 강조 #C77D8E

**① 설정화** `han_daughter_sheet` · 1:1
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution, plain white background.
character design sheet of HAN_DAUGHTER, Korean girl age 14, a middle school student, long straight black hair, bright curious eyes, light blue padded winter jacket, a red knitted scarf.
full-body front view and side view, three expression headshots on the right: calm, warm smile, thoughtful.
Avoid: text, letters, names, numbers, name tag writing, watermark, logo, deformed hands, extra fingers.
```

**② 보통** `han_daughter_normal` · 9:16 · 참조: `han_daughter_sheet`
```
clean modern anime cel-shading, bold clean black outlines, medium saturation, soft warm lighting, warm seaside-cafe palette (forest green and warm wood accents, cream, sand beige, a little soft sea blue), consistent character design, sharp lineart, high resolution.
Korean girl age 14, a middle school student, long straight black hair, bright curious eyes, light blue padded winter jacket, a red knitted scarf.
full-body character design, standing naturally, body turned slightly toward the viewer's right, looking at the viewer, calm neutral expression, mouth closed, hands relaxed at the sides.
plain pure white background, whole body visible from head to feet with empty space above the head, single character centered.
Same face and outfit as the reference image (character sheet).
Avoid: text, letters, numbers, name tag writing, watermark, logo, extra fingers, deformed hands, blurry, cropped head, cropped feet, duplicate character, background objects.
```

**③ 나머지 표정** · 9:16 · 참조: `han_daughter_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `han_daughter_smile` | smile | warm gentle smile, eyes softened |

## 2. 장면 그림 · 이벤트 CG

- 새로 요청하는 104장입니다. 이 밖에 `docs/추가 제작.md`에 프롬프트가 이미 있는 23장(`autumn_key` · `autumn_dawn_open` · `winter_owner_return` · `winter_milk_handover` · `winter_chalk_name` · `ending_last_cup` · `summer_tourist_chair` · `haesun_small_bow` · `autumn_window_haesun` · `haesun_one_cup_wait` · `winter_blanket_chair` · `haesun_blanket_chair_warm` · `winter_granddaughter` · `haesun_three_cups` · `jian_yellow` · `jian_summer_corner` · `jian_green_cold` · `jian_autumn_window` · `jian_opens_sketchbook` · `winter_candle_jian` · `jian_first_line` · `jian_snow_sketchbook` · `jian_many_colors`)도 아직 없습니다.
- 넣는 곳 `assets/cg/cg_{id}.jpg`(16:9, 2K) → `npm run assets`. 나오는 사람의 설정화와 그 장소의 배경을 **참조 이미지로 함께** 넣습니다.
- 사장의 눈(`eye_*`)은 사장님 자리에서 본 그림입니다. 지은은 조금 멀리, 사장님의 손이 앞에 보이고, 기억처럼 조금 따뜻한 빛입니다.

### 2.0 목록

| # | id | 제목 | 나오는 날 | 참조 |
| ---: | :--- | :--- | :--- | :--- |
| 1 | `memory_city` | 기억 · 도시의 큰 카페 | 봄 1일 | `jieun_sheet` · `hall_busy_summer` |
| 2 | `kang_dark_window` | 불 꺼진 창 | 봄 3일 | `kang_sheet` · `cafe_front_morning` |
| 3 | `kang_light_on` | 불 켜진 창 | 봄 3일 | `kang_sheet` · `cafe_front_morning` |
| 4 | `do_standing` | 서서 마시는 사람 | 봄 3일 | `do_sheet` · `hall_spring` |
| 5 | `do_chair_out` | 빼 둔 의자 | 봄 3일 | `do_sheet` · `hall_spring` |
| 6 | `do_rain_letters` | 젖은 편지 | 봄 4일 | `do_sheet` · `hall_spring` |
| 7 | `do_towel` | 마른 수건 | 봄 4일 | `do_sheet` · `hall_spring` |
| 8 | `spring_crew` | 봄 · 벚꽃 주간의 촬영 | 봄 5일 | `actor_sheet` · `agent_sheet` · `alley_morning` |
| 9 | `actor_quiet` | 조용해서 좋네요 | 봄 5일 | `actor_sheet` · `hall_spring` |
| 10 | `owner_cup_shake` | 아주 조금 흔들린 잔 | 봄 5일 | `owner_sheet` · `hall_evening` |
| 11 | `kang_window_sea` | 바다 안 나가요 | 봄 6일 | `kang_sheet` · `harbor_dawn` |
| 12 | `kang_warm_cup` | 따뜻한 새 잔 | 봄 6일 | `kang_sheet` · `hall_morning` |
| 13 | `spring_name` | 봄 · 지은 씨 | 봄 7일 | `haesun_sheet` · `jieun_sheet` · `hall_spring` |
| 14 | `summer_rumor` | 여름 · 사진을 들고 온 사람들 | 여름 1일 | `cafe_front_morning` |
| 15 | `summer_cameo` | 바다를 보러 온 두 사람 | 여름 1일 | `yeonwoo_sheet` · `dohyun_sheet` · `hall_summer` |
| 16 | `han_watch` | 10분 | 여름 2일 | `han_sheet` · `hall_morning` |
| 17 | `han_sits` | 앉아서 마시는 10분 | 여름 2일 | `han_sheet` · `hall_morning` |
| 18 | `eunju_cold_cup` | 늘 식는 커피 | 여름 3일 | `eunju_sheet` · `hall_summer` |
| 19 | `eunju_thick_cup` | 두꺼운 컵 | 여름 3일 | `eunju_sheet` · `hall_summer` |
| 20 | `sumin_corner` | 구석의 이어폰 | 여름 3일 | `sumin_sheet` · `hall_summer` |
| 21 | `sumin_nod` | 작은 끄덕임 | 여름 3일 | `sumin_sheet` · `hall_summer` |
| 22 | `noh_spoon` | 떨리는 숟가락 | 여름 4일 | `owner_sheet` · `noh_sheet` · `hall_summer` |
| 23 | `noh_window_talk` | 바람이 좋네 | 여름 4일 | `noh_sheet` · `hall_summer` |
| 24 | `owner_apron` | 다시 맨 앞치마 끈 | 여름 4일 | `owner_sheet` · `jieun_sheet` · `hall_evening` |
| 25 | `do_heavy_bag` | 무거운 가방 | 여름 5일 | `do_sheet` · `hall_summer` |
| 26 | `do_hook` | 문 옆의 못 | 여름 5일 | `do_sheet` · `hall_summer` |
| 27 | `eunju_listens` | 옆 탁자의 웃음소리 | 여름 5일 | `eunju_sheet` · `hall_summer` |
| 28 | `eunju_baby_talk` | 여섯 달 | 여름 5일 | `eunju_sheet` · `hall_summer` |
| 29 | `owner_pocket` | 주머니 속의 손 | 여름 6일 | `owner_sheet` · `hall_busy_summer` |
| 30 | `sumin_eave` | 처마 밑의 비 | 여름 6일 | `sumin_sheet` · `cafe_front_morning` |
| 31 | `sumin_umbrella` | 세워 둔 우산 | 여름 6일 | `sumin_sheet` · `cafe_front_morning` |
| 32 | `summer_chalk_rule` | 여름 · 동네 시간 | 여름 6일 | `owner_sheet` · `hall_evening` |
| 33 | `han_clock` | 여섯 시 십 분 | 여름 7일 | `jieun_sheet` · `hall_morning` |
| 34 | `han_cup_ready` | 미리 놓인 컵 | 여름 7일 | `han_sheet` · `hall_morning` |
| 35 | `kang_returns` | 며칠 만에 온 날 | 여름 7일 | `kang_sheet` · `hall_morning` |
| 36 | `kang_black_again` | 이 맛이지 | 여름 7일 | `kang_sheet` · `hall_morning` |
| 37 | `summer_village_time` | 여름 · 동네 시간의 첫 아침 | 여름 7일 | `kang_sheet` · `do_sheet` · `han_sheet` · `noh_sheet` · `haesun_sheet` · `hall_morning` |
| 38 | `autumn_first_drip` | 처음 내리는 새벽 블랙 | 가을 1일 | `owner_sheet` · `jieun_sheet` · `hall_autumn` |
| 39 | `kang_suit` | 양복 | 가을 2일 | `kang_sheet` · `hall_autumn` |
| 40 | `kang_suit_cup` | 역시 여기가 편하네 | 가을 2일 | `kang_sheet` · `hall_autumn` |
| 41 | `han_photo` | 딸 사진 | 가을 2일 | `han_sheet` · `hall_autumn` |
| 42 | `han_memo` | 메모지 한 장 | 가을 2일 | `han_sheet` · `hall_autumn` |
| 43 | `noh_shelf` | 낮아진 선반 | 가을 3일 | `noh_sheet` · `hall_autumn` |
| 44 | `noh_wink` | 눈치가 있구먼 | 가을 3일 | `noh_sheet` · `hall_autumn` |
| 45 | `eunju_door` | 걸리는 유모차 | 가을 3일 | `eunju_sheet` · `hall_autumn` |
| 46 | `eunju_space` | 창가 자리 | 가을 3일 | `eunju_sheet` · `hall_autumn` |
| 47 | `festival_rush` | 가을 · 마을 축제 | 가을 4일 | `jieun_sheet` · `festival_alley_autumn` |
| 48 | `owner_drop` | 손님들 앞에서 놓친 컵 | 가을 4일 | `owner_sheet` · `jieun_sheet` · `hall_autumn` |
| 49 | `machine_stop` | 멈춘 머신 | 가을 4일 | `jieun_sheet` · `hall_autumn` |
| 50 | `haesun_alley_greet` | 골목의 첫 인사 | 가을 5일 | `haesun_sheet` · `jieun_sheet` · `alley_morning` |
| 51 | `do_notice` | 퇴직 소식 | 가을 5일 | `do_sheet` · `hall_autumn` |
| 52 | `do_cup_chair` | 의자 앞의 잔 | 가을 5일 | `do_sheet` · `hall_autumn` |
| 53 | `do_first_sit` | 서른 해 만에 앉은 의자 | 가을 5일 | `do_sheet` · `hall_autumn` |
| 54 | `sumin_brochure` | 떨어진 안내서 | 가을 5일 | `sumin_sheet` · `hall_autumn` |
| 55 | `sumin_brochure_back` | 뒤집어 건넨 종이 | 가을 5일 | `sumin_sheet` · `hall_autumn` |
| 56 | `sumin_exam_morning` | 수능 날 아침 | 가을 6일 | `sumin_sheet` · `hall_morning` |
| 57 | `sumin_sleeve` | 슬리브의 파도 | 가을 6일 | `sumin_sheet` · `hall_morning` |
| 58 | `han_fog` | 안개로 늦은 날 | 가을 6일 | `han_sheet` · `bus_terminal_evening` |
| 59 | `han_cup_hands` | 두 손으로 건넨 잔 | 가을 6일 | `han_sheet` · `hall_morning` |
| 60 | `jieun_spill` | 혼자 서두른 날 | 가을 6일 | `jieun_sheet` · `hall_autumn` |
| 61 | `owner_memo` | 선반의 메모 | 가을 6일 | `jieun_sheet` · `hall_evening` |
| 62 | `noh_empty_mug` | 사장님의 빈 잔 | 가을 7일 | `noh_sheet` · `hall_evening` |
| 63 | `noh_newspaper` | 펴 놓은 신문 | 가을 7일 | `noh_sheet` · `hall_evening` |
| 64 | `noh_same` | 가을 · 같네 | 가을 7일 | `noh_sheet` · `jieun_sheet` · `hall_evening` |
| 65 | `kang_first_snow` | 첫눈과 소문 | 겨울 1일 | `kang_sheet` · `hall_winter` |
| 66 | `kang_warm_mug` | 잔까지 따뜻하네 | 겨울 1일 | `kang_sheet` · `hall_winter` |
| 67 | `eunju_tired` | 지친 얼굴 | 겨울 1일 | `eunju_sheet` · `hall_winter` |
| 68 | `eunju_heard` | 물어봐 준 사람 | 겨울 1일 | `eunju_sheet` · `hall_winter` |
| 69 | `kang_secret` | 배를 판 날 | 겨울 2일 | `kang_sheet` · `harbor_dawn` |
| 70 | `noh_heater` | 지나가다 들른 아침 | 겨울 2일 | `noh_sheet` · `hall_winter` |
| 71 | `noh_mix_winter` | 사장 맛이 나 | 겨울 2일 | `noh_sheet` · `hall_winter` |
| 72 | `sumin_envelope` | 봉투 | 겨울 2일 | `sumin_sheet` · `hall_winter` |
| 73 | `sumin_wait` | 기다리는 컵 닦기 | 겨울 2일 | `sumin_sheet` · `jieun_sheet` · `hall_winter` |
| 74 | `han_with_daughter` | 딸과 함께 온 새벽 | 겨울 3일 | `han_sheet` · `han_daughter_sheet` · `hall_winter` |
| 75 | `han_two_cups` | 코코아 한 잔 더 | 겨울 3일 | `han_sheet` · `han_daughter_sheet` · `hall_winter` |
| 76 | `sumin_secret` | 합격 통지서 | 겨울 3일 | `sumin_sheet` · `jieun_sheet` · `hall_winter` |
| 77 | `do_last_day` | 마지막 배달 | 겨울 3일 | `do_sheet` · `cafe_front_morning` |
| 78 | `do_last_hook` | 마지막으로 건 가방 | 겨울 3일 | `do_sheet` · `hall_evening` |
| 79 | `winter_storm` | 겨울 · 폭설 | 겨울 4일 | `jieun_sheet` · `alley_morning` |
| 80 | `noh_lantern` | 랜턴 | 겨울 4일 | `noh_sheet` · `hall_blackout` |
| 81 | `noh_lantern_hung` | 원래 자리 | 겨울 4일 | `noh_sheet` · `hall_blackout` |
| 82 | `winter_gathering` | 겨울 · 단골 여덟 명 | 겨울 4일 | `haesun_sheet` · `kang_sheet` · `do_sheet` · `jian_sheet` · `hall_blackout` |
| 83 | `winter_gathering2` | 겨울 · 천천히 해요 | 겨울 4일 | `han_sheet` · `eunju_sheet` · `sumin_sheet` · `noh_sheet` · `geum_sheet` · `hall_blackout` |
| 84 | `winter_dawn_power` | 불이 들어온 새벽 | 겨울 4일 | `jieun_sheet` · `hall_winter` |
| 85 | `do_secret` | 마지막 우편 | 겨울 5일 | `do_sheet` · `jieun_sheet` · `hall_winter` |
| 86 | `han_secret` | 컵 속의 쪽지 | 겨울 5일 | `han_sheet` · `hall_winter` |
| 87 | `eunju_friend` | 처음 온 엄마 | 겨울 5일 | `eunju_sheet` · `mom2_sheet` · `hall_winter` |
| 88 | `eunju_two_moms` | 두 엄마 | 겨울 5일 | `eunju_sheet` · `mom2_sheet` · `hall_winter` |
| 89 | `haesun_secret` | 남편의 마지막 주문 | 겨울 6일 | `haesun_sheet` · `hall_winter` |
| 90 | `noh_secret` | 처음 떨린 날 | 겨울 6일 | `noh_sheet` · `hall_winter` |
| 91 | `eunju_secret` | 일주일의 말 | 겨울 6일 | `eunju_sheet` · `hall_winter` |
| 92 | `jian_secret` | 지은의 손 | 겨울 6일 | `jian_sheet` · `jieun_sheet` · `hall_winter` |
| 93 | `winter_wipe_cups` | 눈 그친 아침 | 겨울 7일 | `jieun_sheet` · `hall_winter` |
| 94 | `eye_1` | 사장의 눈 1 · 컵을 깬 날 | 엔딩 | `jieun_sheet` · `hall_spring` |
| 95 | `eye_2` | 사장의 눈 2 · 한 칸 내린 선반 | 엔딩 | `hall_morning` |
| 96 | `eye_3` | 사장의 눈 3 · 맛은 시간이 만든다 | 엔딩 | `jieun_sheet` · `geum_sheet` · `hall_spring` |
| 97 | `eye_4` | 사장의 눈 4 · 빈 컵만 | 엔딩 | `jieun_sheet` · `hall_spring` |
| 98 | `eye_5` | 사장의 눈 5 · 칠판의 빈칸 | 엔딩 | `hall_evening` |
| 99 | `eye_7` | 사장의 눈 7 · 앞치마 끈 | 엔딩 | `jieun_sheet` · `hall_evening` |
| 100 | `eye_6` | 사장의 눈 6 · 저 친구가 내립니다 | 엔딩 | `jieun_sheet` · `hall_busy_summer` |
| 101 | `eye_8` | 사장의 눈 8 · 동네 시간 | 엔딩 | `jieun_sheet` · `hall_evening` |
| 102 | `eye_9` | 사장의 눈 9 · 열쇠 | 엔딩 | `jieun_sheet` · `hall_evening` |
| 103 | `eye_10` | 사장의 눈 10 · 서두르면 쏟는다 | 엔딩 | `hall_evening` |
| 104 | `eye_11` | 사장의 눈 11 · 먼 창의 불빛 | 엔딩 | `alley_morning` |

### 2.1 프롬프트

#### 1. `memory_city` · 기억 · 도시의 큰 카페

- 나오는 날: 봄 1일 · 장면: 줄이 길다. "빨리 좀 해 주세요!" · 참조: `jieun_sheet` · `hall_busy_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Memory scene, slightly desaturated: a crowded big chain coffee shop in a city at lunch rush, a long impatient line of office workers, JIEUN behind the counter in a different plain black apron, her hands hurrying, a latte cup tipping over and spilling across the counter, her face tense.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 2. `kang_dark_window` · 불 꺼진 창

- 나오는 날: 봄 3일 · 장면: 새벽, 깜깜한 카페 앞 · 참조: `kang_sheet` · `cafe_front_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Before dawn, dark blue sky: KANG stands outside the closed glass door of the small old cafe, rubbing his cold hands, looking at the dark unlit window, not touching the door handle.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 3. `kang_light_on` · 불 켜진 창

- 나오는 날: 봄 3일 · 장면: 창에 불이 들어온다 · 참조: `kang_sheet` · `cafe_front_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Before dawn: the cafe window suddenly glows with warm yellow light; KANG outside looks up at the lit window with a small relieved smile, his breath visible in the cold air.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 4. `do_standing` · 서서 마시는 사람

- 나오는 날: 봄 3일 · 장면: 무거운 우편 가방 · 참조: `do_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Morning inside the cafe: DO stands at the counter drinking iced americano from a glass, the heavy mailbag pulling one shoulder down, an empty wooden chair right beside him that he does not look at.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 5. `do_chair_out` · 빼 둔 의자

- 나오는 날: 봄 3일 · 장면: 한 칸 빼 둔 의자 · 참조: `do_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Morning inside the cafe: the wooden chair beside the counter has been pulled out a little, ready to sit; DO looks at the pulled-out chair for a long moment with a soft surprised smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 6. `do_rain_letters` · 젖은 편지

- 나오는 날: 봄 4일 · 장면: 자기보다 편지를 먼저 · 참조: `do_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Rainy afternoon: DO comes in soaking wet with water dripping from his cap, hugging the mailbag to his chest, wiping the letters dry with his wet sleeve before his own face; rain streaks on the window.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 7. `do_towel` · 마른 수건

- 나오는 날: 봄 4일 · 장면: 편지가 안 젖었네 · 참조: `do_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Rainy afternoon: two dry folded towels on the counter; DO carefully wipes the letters one by one with a towel, relieved, his own hair still wet.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 8. `spring_crew` · 봄 · 벚꽃 주간의 촬영

- 나오는 날: 봄 5일 · 장면: 골목에 벚꽃, 촬영 팀 · 참조: `actor_sheet` · `agent_sheet` · `alley_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): ACTOR: Korean woman in her early thirties, an original fictional actress (not resembling any real person), long dark brown wavy hair, large sunglasses pushed up on her head, elegant cream trench coat over a lavender knit, graceful but tired gentle face; AGENT: Korean man in his thirties, an actor's manager, messy black hair, a black headset with a small microphone, navy padded vest over a gray hoodie, a walkie-talkie clipped to his belt.
Scene: Cherry blossom week in the narrow seaside alley: petals falling, a small TV drama film crew with cameras, a boom microphone and reflectors, curious villagers watching; the ACTOR in sunglasses and the MANAGER with a headset walking toward the cafe.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 9. `actor_quiet` · 조용해서 좋네요

- 나오는 날: 봄 5일 · 장면: 창밖의 벚꽃 · 참조: `actor_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): ACTOR: Korean woman in her early thirties, an original fictional actress (not resembling any real person), long dark brown wavy hair, large sunglasses pushed up on her head, elegant cream trench coat over a lavender knit, graceful but tired gentle face.
Scene: Inside the cafe by the window: the ACTOR sits alone, sunglasses off, quietly gazing at cherry blossoms outside, an untouched iced coffee with melting ice in front of her, a peaceful tired expression.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 10. `owner_cup_shake` · 아주 조금 흔들린 잔

- 나오는 날: 봄 5일 · 장면: 사장님은 잔을 두 손으로 잡는다 · 참조: `owner_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Evening after closing, only one lamp on: the OWNER holds a white cup of warm milk carefully with both hands, calm and still, looking down into the cup; JIEUN in the background wiping the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 11. `kang_window_sea` · 바다 안 나가요

- 나오는 날: 봄 6일 · 장면: 항구 끝의 빈자리 · 참조: `kang_sheet` · `harbor_dawn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Dawn at the harbor seen through the cafe window: KANG sits by the window holding a cup of black coffee, staring at one empty mooring spot at the end of the pier while the other boats leave.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 12. `kang_warm_cup` · 따뜻한 새 잔

- 나오는 날: 봄 6일 · 장면: 두 손으로 감싼 잔 · 참조: `kang_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Dawn inside the cafe: KANG wraps both big rough hands around a fresh steaming mug of black coffee, looking at the rising steam for a long time.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 13. `spring_name` · 봄 · 지은 씨

- 나오는 날: 봄 7일 · 장면: "지은 씨, 내일 또 봐요." · 참조: `haesun_sheet` · `jieun_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Spring morning by the window: HAESUN stands up from her seat, smiling warmly at JIEUN as she says goodbye; two cups of warm milk on the table, one in front of the empty chair; falling petals outside.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 14. `summer_rumor` · 여름 · 사진을 들고 온 사람들

- 나오는 날: 여름 1일 · 장면: "배우가 다녀간 카페!" · 참조: `cafe_front_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Bright summer morning in front of the cafe: tourists in summer clothes line up holding up their phones showing a photo of the cafe window, excited and chatty.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 15. `summer_cameo` · 바다를 보러 온 두 사람

- 나오는 날: 여름 1일 · 장면: 쉬는 날, 바닷가 마을 · 참조: `yeonwoo_sheet` · `dohyun_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Summer inside the cafe by the window: YEONWOO and DOHYUN, two city baristas on their day off, sit with an iced latte and an iced americano, looking out at the sparkling sea, relaxed smiles.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 16. `han_watch` · 10분

- 나오는 날: 여름 2일 · 장면: 마지막 밤 버스 · 참조: `han_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Early dawn inside the cafe: HAN stands at the counter in his bus driver uniform, eyes red from the night shift, checking his wristwatch; through the window, a night bus parked at the terminal.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 17. `han_sits` · 앉아서 마시는 10분

- 나오는 날: 여름 2일 · 장면: 오랜만에 앉은 의자 · 참조: `han_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Early dawn: HAN sits down on a chair for the first time, watching JIEUN make his drink with a tired gentle smile, his driver cap on the table.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 18. `eunju_cold_cup` · 늘 식는 커피

- 나오는 날: 여름 3일 · 장면: 한 모금도 못 마신 라테 · 참조: `eunju_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Summer inside the cafe by the window: EUNJU rocks a baby stroller with one hand, looking down at a full latte gone cold with its foam collapsed, a quiet sigh.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 19. `eunju_thick_cup` · 두꺼운 컵

- 나오는 날: 여름 3일 · 장면: 이건 천천히 식어요 · 참조: `eunju_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Summer inside the cafe: EUNJU wraps both hands around a thick double-wall mug with a lid, warmth on her face, a small grateful smile, the baby asleep in the stroller.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 20. `sumin_corner` · 구석의 이어폰

- 나오는 날: 여름 3일 · 장면: 벽 쪽으로 돌린 의자 · 참조: `sumin_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Summer afternoon: SUMIN sits in the farthest corner seat with her chair turned toward the wall, earphones in, bent over a thick workbook, a glass of iced barley tea.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 21. `sumin_nod` · 작은 끄덕임

- 나오는 날: 여름 3일 · 장면: 말없이 놓인 보리차 · 참조: `sumin_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Summer afternoon in the corner seat: a glass of iced barley tea has been quietly placed beside SUMIN's workbook; she looks up and gives a tiny nod, earphones still in.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 22. `noh_spoon` · 떨리는 숟가락

- 나오는 날: 여름 4일 · 장면: 종이컵 안의 숟가락 · 참조: `owner_sheet` · `noh_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Summer morning at the counter: the OWNER stirs a paper cup of instant mix coffee with a small spoon, calm hands; NOH sits on a stool looking out the window on purpose, talking about the calm sea.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 23. `noh_window_talk` · 바람이 좋네

- 나오는 날: 여름 4일 · 장면: 창밖의 잔잔한 바다 · 참조: `noh_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Summer morning: NOH and JIEUN both look out the window at the calm glittering sea, NOH smiling quietly; a paper cup of coffee on the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 24. `owner_apron` · 다시 맨 앞치마 끈

- 나오는 날: 여름 4일 · 장면: 아무 말 없이 · 참조: `owner_sheet` · `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Summer evening after closing: JIEUN wipes cups at the counter while the OWNER, standing behind her, quietly reties her loose green apron strings into a firm bow; calm hands, warm lamp light.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 25. `do_heavy_bag` · 무거운 가방

- 나오는 날: 여름 5일 · 장면: 소포가 많은 계절 · 참조: `do_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Hot summer morning: DO hugs a bulging mailbag stuffed with parcels, about to put it down but stopping because the floor is wet; he glances at the empty wall beside the door.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 26. `do_hook` · 문 옆의 못

- 나오는 날: 여름 5일 · 장면: 어깨가 가볍네 · 참조: `do_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Summer morning: a sturdy new hook on the wall beside the door; DO hangs his heavy mailbag on it and rolls his shoulder in relief, smiling.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 27. `eunju_listens` · 옆 탁자의 웃음소리

- 나오는 날: 여름 5일 · 장면: 아기랑만 하는 이야기 · 참조: `eunju_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Summer afternoon: EUNJU sits alone by the window with a sleeping baby in the stroller, looking toward a neighboring table where friends laugh together, a little lonely.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 28. `eunju_baby_talk` · 여섯 달

- 나오는 날: 여름 5일 · 장면: 어제 처음 뒤집기를 했어요 · 참조: `eunju_sheet` · `hall_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Summer afternoon: EUNJU happily tells JIEUN about her baby, glowing with joy, showing with her hands how the baby rolled over for the first time.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 29. `owner_pocket` · 주머니 속의 손

- 나오는 날: 여름 6일 · 장면: 컵을 흘린 뒤 · 참조: `owner_sheet` · `hall_busy_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Very busy summer day: coffee spilled on the counter from a tipped cup; the OWNER calmly wipes it with a cloth, his other hand resting in his apron pocket, his face quiet.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 30. `sumin_eave` · 처마 밑의 비

- 나오는 날: 여름 6일 · 장면: 우산이 없다 · 참조: `sumin_sheet` · `cafe_front_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Summer evening heavy rain: SUMIN stands under the cafe's narrow eave in her school uniform without an umbrella, hugging her backpack, checking the time on her phone.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 31. `sumin_umbrella` · 세워 둔 우산

- 나오는 날: 여름 6일 · 장면: 작은 인사 · 참조: `sumin_sheet` · `cafe_front_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Summer evening rain: a cafe umbrella has been quietly propped next to SUMIN; she opens it and glances back with a tiny bow before walking into the rain.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 32. `summer_chalk_rule` · 여름 · 동네 시간

- 나오는 날: 여름 6일 · 장면: 사장님이 칠판에 쓴 한 줄 · 참조: `owner_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Late summer night after closing: the OWNER stands at the wall chalkboard holding a piece of chalk, writing a line at the top (leave the board blank, the game adds the text); JIEUN watching beside the counter; regulars' mugs lined on the shelf.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 33. `han_clock` · 여섯 시 십 분

- 나오는 날: 여름 7일 · 장면: 종점의 버스 불빛 · 참조: `jieun_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Before dawn inside the cafe: the wall clock shows 6:07; through the window, the headlights of a night bus pull into the terminal; JIEUN behind the counter about to start making a drink.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 34. `han_cup_ready` · 미리 놓인 컵

- 나오는 날: 여름 7일 · 장면: 내 거예요? · 참조: `han_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Dawn: a takeaway paper cup already waiting on the counter; HAN, just walked in, stops and looks at it in surprise.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 35. `kang_returns` · 며칠 만에 온 날

- 나오는 날: 여름 7일 · 장면: 두 손을 탁자 위에 · 참조: `kang_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Dawn: KANG sits at his usual window seat after days away, both hands resting still on the table, turning his face away from the harbor.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 36. `kang_black_again` · 이 맛이지

- 나오는 날: 여름 7일 · 장면: 늘 쓰던 잔 · 참조: `kang_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Dawn: KANG holds his usual mug of black coffee, looking at it for a long time with a small relieved smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 37. `summer_village_time` · 여름 · 동네 시간의 첫 아침

- 나오는 날: 여름 7일 · 장면: 조용한 새벽, 단골 다섯 · 참조: `kang_sheet` · `do_sheet` · `han_sheet` · `noh_sheet` · `haesun_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots; DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes; HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist; NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Quiet summer dawn inside the cafe, no tourists: HAESUN at the window seat with two cups of milk, DO at the counter, NOH in the corner with a paper cup, KANG and HAN finishing their drinks, everyone quiet and comfortable; the chalkboard at the top is blank.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 38. `autumn_first_drip` · 처음 내리는 새벽 블랙

- 나오는 날: 가을 1일 · 장면: 오늘부터 지은 씨가 내려요 · 참조: `owner_sheet` · `jieun_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Autumn dawn: JIEUN carefully pours hot water in slow circles over a hand drip coffee dripper with a gooseneck kettle, focused; the OWNER stands beside her with his hands in his apron pockets, watching quietly.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 39. `kang_suit` · 양복

- 나오는 날: 가을 2일 · 장면: 낡은 양복과 거친 손 · 참조: `kang_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Autumn dawn: KANG walks in wearing an old dark suit and a slightly crooked tie instead of his work clothes, his rough fisherman hands sticking out of the sleeves, looking awkward.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 40. `kang_suit_cup` · 역시 여기가 편하네

- 나오는 날: 가을 2일 · 장면: 느슨하게 푼 넥타이 · 참조: `kang_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Autumn dawn: KANG in his old suit holds his usual mug, loosening his tie a little, relaxing with a small smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 41. `han_photo` · 딸 사진

- 나오는 날: 가을 2일 · 장면: 쓸 종이가 없다 · 참조: `han_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Autumn dawn: HAN sits with a takeaway cup, looking at a photo of his school-age daughter on his phone, a pen in his other hand but no paper.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 42. `han_memo` · 메모지 한 장

- 나오는 날: 가을 2일 · 장면: 딸한테요 · 참조: `han_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Autumn dawn: a small memo pad and pen beside HAN's cup; he writes a short note slowly and folds it into his chest pocket, smiling softly.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 43. `noh_shelf` · 낮아진 선반

- 나오는 날: 가을 3일 · 장면: 사장님이 없는 사이 · 참조: `noh_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Autumn morning, the owner away: NOH with a toolbox lowers a high wooden shelf for heavy coffee bean canisters and replaces a stiff faucet handle with an easy lever handle.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 44. `noh_wink` · 눈치가 있구먼

- 나오는 날: 가을 3일 · 장면: 입에 댄 손가락 · 참조: `noh_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Autumn morning: NOH, holding his toolbox, puts a finger to his lips and gives JIEUN a knowing small smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 45. `eunju_door` · 걸리는 유모차

- 나오는 날: 가을 3일 · 장면: 좁은 통로 · 참조: `eunju_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Autumn: EUNJU tries to push the baby stroller through the narrow aisle between tables at the entrance, the wheel caught on a chair leg, hesitating.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 46. `eunju_space` · 창가 자리

- 나오는 날: 가을 3일 · 장면: 아기가 바다를 좋아해요 · 참조: `eunju_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Autumn: two chairs moved aside to make a space by the window; EUNJU parks the stroller there, the baby looking at the sea, and she smiles at JIEUN gratefully.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 47. `festival_rush` · 가을 · 마을 축제

- 나오는 날: 가을 4일 · 장면: 골목 가득한 축제 손님 · 참조: `jieun_sheet` · `festival_alley_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Autumn seaside village festival: the alley full of flags, food stalls and crowds; a long line in front of the cafe; JIEUN behind the counter looking overwhelmed.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 48. `owner_drop` · 손님들 앞에서 놓친 컵

- 나오는 날: 가을 4일 · 장면: 쨍그랑, 그리고 조용함 · 참조: `owner_sheet` · `jieun_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Busy festival day inside the cafe: a broken cup on the floor, customers suddenly silent and looking; the OWNER stands calmly with his hands behind his apron; JIEUN coming over with a broom.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 49. `machine_stop` · 멈춘 머신

- 나오는 날: 가을 4일 · 장면: 전기가 나갔다 · 참조: `jieun_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Festival day: the espresso machine has gone dark and silent, a few ceiling lights out; JIEUN stares at the machine, nervous, the line still waiting.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 50. `haesun_alley_greet` · 골목의 첫 인사

- 나오는 날: 가을 5일 · 장면: 내가 첫 손님 할게요 · 참조: `haesun_sheet` · `jieun_sheet` · `alley_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Autumn dawn in the alley: HAESUN on her morning walk waves warmly to JIEUN who is on her way to open the cafe alone.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 51. `do_notice` · 퇴직 소식

- 나오는 날: 가을 5일 · 장면: 소식지의 사진 · 참조: `do_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Autumn morning: DO at the counter puts down a bundle of mail; on top lies a post office newsletter with his photo; he looks away out the window.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 52. `do_cup_chair` · 의자 앞의 잔

- 나오는 날: 가을 5일 · 장면: 겨울이면 그만둬요 · 참조: `do_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Autumn morning: DO's usual iced americano placed in front of the chair beside the counter; DO looks at the cup and the chair for a long time.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 53. `do_first_sit` · 서른 해 만에 앉은 의자

- 나오는 날: 가을 5일 · 장면: 가방은 문 옆 못에 · 참조: `do_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Autumn morning: DO's mailbag hangs on the hook by the door; DO sits down on the chair beside the counter for the first time in thirty years, a shy happy smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 54. `sumin_brochure` · 떨어진 안내서

- 나오는 날: 가을 5일 · 장면: 도시의 대학교 · 참조: `sumin_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Autumn: a university admission brochure has fallen on the floor at the counter; SUMIN reaches for it and freezes, her cheeks turning red.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 55. `sumin_brochure_back` · 뒤집어 건넨 종이

- 나오는 날: 가을 5일 · 장면: 보지 않았어요 · 참조: `sumin_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Autumn: JIEUN hands the brochure back to SUMIN turned face down; SUMIN looks at the blank back of the paper for a long moment.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 56. `sumin_exam_morning` · 수능 날 아침

- 나오는 날: 가을 6일 · 장면: 떨리는 손 · 참조: `sumin_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Autumn dawn on exam day: SUMIN stands at the counter without earphones, her hand holding an exam ticket trembling slightly; a hot paper cup and a plain white sleeve on the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 57. `sumin_sleeve` · 슬리브의 파도

- 나오는 날: 가을 6일 · 장면: 다녀올게요 · 참조: `sumin_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Exam day dawn: a small hand-drawn wave doodle on the white paper sleeve of a hot cup; SUMIN looks at it and smiles for the first time.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 58. `han_fog` · 안개로 늦은 날

- 나오는 날: 가을 6일 · 장면: 남은 시간 3분 · 참조: `han_sheet` · `bus_terminal_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Thick fog at dawn at the bus terminal: HAN runs from his bus toward the cafe, late, the clock showing very little time left.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 59. `han_cup_hands` · 두 손으로 건넨 잔

- 나오는 날: 가을 6일 · 장면: 오늘은 이 한 모금이면 돼요 · 참조: `han_sheet` · `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Foggy dawn: JIEUN hands HAN a lidded takeaway cup with both hands; HAN takes it, grateful, ready to run back into the fog.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 60. `jieun_spill` · 혼자 서두른 날

- 나오는 날: 가을 6일 · 장면: 쏟아진 라테 · 참조: `jieun_sheet` · `hall_autumn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Autumn lunch rush, the owner away: a latte spilled over a tray; JIEUN looks down at it, upset, customers waiting.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 61. `owner_memo` · 선반의 메모

- 나오는 날: 가을 6일 · 장면: 서두르면 쏟는다 · 참조: `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Autumn night after closing: JIEUN finds a small handwritten memo stuck inside the closing shelf where cups are turned upside down (no readable text), her face softening.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 62. `noh_empty_mug` · 사장님의 빈 잔

- 나오는 날: 가을 7일 · 장면: 선반 위의 하얀 잔 · 참조: `noh_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Autumn evening: NOH stands at the counter looking at the owner's white cup on the shelf, a packet of instant mix coffee in his hand.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 63. `noh_newspaper` · 펴 놓은 신문

- 나오는 날: 가을 7일 · 장면: 그 잔 줘 · 참조: `noh_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Autumn evening: a folded newspaper laid open at NOH's usual seat; NOH looks at it and sits down.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 64. `noh_same` · 가을 · 같네

- 나오는 날: 가을 7일 · 장면: 사장님 방식의 믹스커피 · 참조: `noh_sheet` · `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Autumn evening: NOH holds a paper cup of instant mix coffee that JIEUN made, eyes closed as he tastes it, a quiet satisfied smile; JIEUN waiting behind the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 65. `kang_first_snow` · 첫눈과 소문

- 나오는 날: 겨울 1일 · 장면: 빈 항구 · 참조: `kang_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: First snow at dawn: KANG brushes snow off his shoulders at the door; through the window, the harbor with one empty mooring spot.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 66. `kang_warm_mug` · 잔까지 따뜻하네

- 나오는 날: 겨울 1일 · 장면: 데운 잔 · 참조: `kang_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Snowy dawn: KANG wraps both cold hands around a pre-warmed mug of black coffee, steam rising, a small gentle smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 67. `eunju_tired` · 지친 얼굴

- 나오는 날: 겨울 1일 · 장면: 밤새 깬 아기 · 참조: `eunju_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: First snowy afternoon: EUNJU comes in with red tired eyes and a sniffling baby in the stroller, about to say something but stopping.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 68. `eunju_heard` · 물어봐 준 사람

- 나오는 날: 겨울 1일 · 장면: 조금 울고, 웃는다 · 참조: `eunju_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Snowy afternoon by the window: EUNJU wipes a tear and laughs at the same time, talking with JIEUN, relieved.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 69. `kang_secret` · 배를 판 날

- 나오는 날: 겨울 2일 · 장면: 그날 바다가 참 잔잔했어 · 참조: `kang_sheet` · `harbor_dawn`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots.
Scene: Winter dawn at the harbor: KANG looks at the calm sea where his boat used to be, remembering the day he sold it; quiet, still water, soft dawn colors.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 70. `noh_heater` · 지나가다 들른 아침

- 나오는 날: 겨울 2일 · 장면: 덜덜거리는 난로 · 참조: `noh_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Snowy morning: NOH stands by an old rattling stove in the cafe, glancing at the empty owner's seat behind the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 71. `noh_mix_winter` · 사장 맛이 나

- 나오는 날: 겨울 2일 · 장면: 종이컵의 그 잔 · 참조: `noh_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Snowy morning: NOH holds a paper cup of mix coffee made by JIEUN, steam rising, a soft smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 72. `sumin_envelope` · 봉투

- 나오는 날: 겨울 2일 · 장면: 아직 뜯지 않은 봉투 · 참조: `sumin_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Winter: SUMIN stands at the counter holding an unopened white university envelope with both hands, looking at JIEUN.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 73. `sumin_wait` · 기다리는 컵 닦기

- 나오는 날: 겨울 2일 · 장면: 내일 열어 볼게요. 여기서요. · 참조: `sumin_sheet` · `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Winter: SUMIN sits on the stool right in front of the counter looking at the envelope, while JIEUN quietly wipes cups nearby.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 74. `han_with_daughter` · 딸과 함께 온 새벽

- 나오는 날: 겨울 3일 · 장면: 남은 시간 10분 · 참조: `han_sheet` · `han_daughter_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist; HAN_DAUGHTER: Korean girl age 14, a middle school student, long straight black hair, bright curious eyes, light blue padded winter jacket, a red knitted scarf.
Scene: Winter dawn: HAN comes in with his daughter HAN_DAUGHTER in a padded jacket; the daughter looks at the cocoa on the menu, HAN looks at the clock.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 75. `han_two_cups` · 코코아 한 잔 더

- 나오는 날: 겨울 3일 · 장면: 오늘은 아빠도 천천히야 · 참조: `han_sheet` · `han_daughter_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist; HAN_DAUGHTER: Korean girl age 14, a middle school student, long straight black hair, bright curious eyes, light blue padded winter jacket, a red knitted scarf.
Scene: Winter dawn: HAN and his daughter sit side by side, a sweet latte and a cocoa on the table, snow outside the window, both smiling.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 76. `sumin_secret` · 합격 통지서

- 나오는 날: 겨울 3일 · 장면: 여기서 열고 싶었어요 · 참조: `sumin_sheet` · `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Winter: SUMIN at the counter opens the envelope and reads the letter, then smiles at JIEUN with teary eyes; JIEUN smiling back.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 77. `do_last_day` · 마지막 배달

- 나오는 날: 겨울 3일 · 장면: 납작한 가방 · 참조: `do_sheet` · `cafe_front_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Winter evening, the "closed" sign on the door (no readable text): DO stands outside with a flat empty mailbag, looking at the warm lit counter inside.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 78. `do_last_hook` · 마지막으로 건 가방

- 나오는 날: 겨울 3일 · 장면: 서른 해 · 참조: `do_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Winter evening: DO hangs his empty mailbag on the hook by the door for the last time and sits on the chair by the counter.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 79. `winter_storm` · 겨울 · 폭설

- 나오는 날: 겨울 4일 · 장면: 마을의 불이 하나씩 꺼진다 · 참조: `jieun_sheet` · `alley_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Heavy snowstorm in the evening: the seaside village alley buried knee-deep in snow, streetlights and windows going dark one by one; JIEUN looking out, worried.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 80. `noh_lantern` · 랜턴

- 나오는 날: 겨울 4일 · 장면: 닳아 반질반질한 손잡이 · 참조: `noh_sheet` · `hall_blackout`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Blackout night: NOH comes in out of the snow holding a big old kerosene-style lantern with a polished worn handle.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 81. `noh_lantern_hung` · 원래 자리

- 나오는 날: 겨울 4일 · 장면: 사장님 자리 위의 못 · 참조: `noh_sheet` · `hall_blackout`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Blackout night: the old lantern hangs on the nail above the owner's empty seat, lighting the whole cafe warmly; NOH looks up at the light.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 82. `winter_gathering` · 겨울 · 단골 여덟 명

- 나오는 날: 겨울 4일 · 장면: 각자의 방식으로 돕는 밤 · 참조: `haesun_sheet` · `kang_sheet` · `do_sheet` · `jian_sheet` · `hall_blackout`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots; DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Blackout night inside the candle-lit cafe: villagers gathered; HAESUN tucking blankets on children, KANG's small gas burner heating a kettle, DO carrying cups, JIAN drawing on paper taped to the wall, warm candle light everywhere.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 83. `winter_gathering2` · 겨울 · 천천히 해요

- 나오는 날: 겨울 4일 · 장면: 줄에서 들려온 한마디 · 참조: `han_sheet` · `eunju_sheet` · `sumin_sheet` · `noh_sheet` · `geum_sheet` · `hall_blackout`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist; EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes; SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack; NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt; GEUM: Korean man in his forties, a busy office worker who commutes by ferry, neat short black hair, dark charcoal suit with a slightly loosened tie, a smartphone in hand, a wristwatch.
Scene: Blackout night: a patient line waiting for hand drip coffee by candle light; GEUM in the middle of the line smiling gently; HAN, EUNJU with a sleeping baby, SUMIN at the kettle and NOH nearby.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 84. `winter_dawn_power` · 불이 들어온 새벽

- 나오는 날: 겨울 4일 · 장면: 눈이 조금 잦아든다 · 참조: `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Dawn after the blackout: the lights come back on in the cafe, people waking up under blankets and clapping, snow still falling softly outside.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 85. `do_secret` · 마지막 우편

- 나오는 날: 겨울 5일 · 장면: 지은 씨 앞으로 온 편지 · 참조: `do_sheet` · `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Snowy morning: DO hands JIEUN a letter in an envelope he wrote himself (no readable text), shy and warm.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 86. `han_secret` · 컵 속의 쪽지

- 나오는 날: 겨울 5일 · 장면: 아빠가 먼저 갈게 · 참조: `han_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Snowy morning: HAN shows two small folded notes on the counter, one in his handwriting and one in his daughter's handwriting (no readable text), smiling proudly.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 87. `eunju_friend` · 처음 온 엄마

- 나오는 날: 겨울 5일 · 장면: 문 앞에서 머뭇거린다 · 참조: `eunju_sheet` · `mom2_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes; MOM2: Korean woman in her early thirties, a shy new mother, long dark brown hair, gentle face, beige knit coat, a baby carrier sling, a small light gray baby stroller.
Scene: Winter: EUNJU comes in with her stroller; behind her another young mother MOM2 hesitates at the door, holding her stroller tightly.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 88. `eunju_two_moms` · 두 엄마

- 나오는 날: 겨울 5일 · 장면: 거봐요, 여기 좋다고 했죠 · 참조: `eunju_sheet` · `mom2_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes; MOM2: Korean woman in her early thirties, a shy new mother, long dark brown hair, gentle face, beige knit coat, a baby carrier sling, a small light gray baby stroller.
Scene: Winter by the window: two strollers parked side by side, EUNJU and MOM2 talking and laughing over warm decaf lattes.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 89. `haesun_secret` · 남편의 마지막 주문

- 나오는 날: 겨울 6일 · 장면: 우유 두 잔 · 참조: `haesun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Winter afternoon by the window: HAESUN tells the story of her late husband's last order, looking at the empty chair with two cups of warm milk in front of her, a tender smile.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 90. `noh_secret` · 처음 떨린 날

- 나오는 날: 겨울 6일 · 장면: 가게 불 꺼지면 네가 켜라 · 참조: `noh_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): NOH: Korean man in his late sixties, owner of a small hardware store, short silver-gray hair, deep smile wrinkles, a pencil tucked behind his ear, brown canvas work vest over a beige shirt, a leather tool pouch on his belt.
Scene: Winter: NOH looks up at the lantern above the owner's seat, remembering, a quiet nostalgic expression.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 91. `eunju_secret` · 일주일의 말

- 나오는 날: 겨울 6일 · 장면: 여기서 처음 말했어요 · 참조: `eunju_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): EUNJU: Korean woman in her early thirties, a new mother, dark brown hair in a messy low bun, soft tired eyes, pastel pink cardigan over a cream top, a gray baby carrier sling across her body, flat shoes.
Scene: Winter: EUNJU sits at the counter talking to JIEUN with a warm grateful smile, the baby asleep.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 92. `jian_secret` · 지은의 손

- 나오는 날: 겨울 6일 · 장면: 커피 내리는 손 · 참조: `jian_sheet` · `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Winter: JIAN shows JIEUN a sketchbook page with a careful drawing of a hand pouring water over a coffee dripper; JIEUN surprised and moved.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 93. `winter_wipe_cups` · 눈 그친 아침

- 나오는 날: 겨울 7일 · 장면: 컵을 닦는 아침 · 참조: `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Bright morning after the snow stopped: JIEUN alone wiping cups one by one at the counter, sunlight reflecting off the snow outside.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 94. `eye_1` · 사장의 눈 1 · 컵을 깬 날

- 나오는 날: 엔딩 · 장면: 빗자루를 두 손으로 꼭 쥔 아이 · 참조: `jieun_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: JIEUN in her green apron gripping a broom with both hands, sweeping up a broken cup, not crying, determined; the owner's calm hand holding out the broom in the foreground.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 95. `eye_2` · 사장의 눈 2 · 한 칸 내린 선반

- 나오는 날: 엔딩 · 장면: 새벽, 컵을 한 칸 아래로 옮기는 손 · 참조: `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view before dawn: the owner's calm hands moving clean cups down to a lower shelf, the empty cafe in soft blue dawn light.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 96. `eye_3` · 사장의 눈 3 · 맛은 시간이 만든다

- 나오는 날: 엔딩 · 장면: 카운터 앞으로 나가며 본 두 사람 · 참조: `jieun_sheet` · `geum_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): GEUM: Korean man in his forties, a busy office worker who commutes by ferry, neat short black hair, dark charcoal suit with a slightly loosened tie, a smartphone in hand, a wristwatch.
Scene: From the OWNER's point of view stepping toward the counter: JIEUN behind the counter, nervous, and GEUM in the line checking his watch.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 97. `eye_4` · 사장의 눈 4 · 빈 컵만

- 나오는 날: 엔딩 · 장면: 그 아이 뒤에 빈 컵을 놓는 손 · 참조: `jieun_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: JIEUN focused on making drinks while the owner's hands quietly set out empty cups in a row behind her.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 98. `eye_5` · 사장의 눈 5 · 칠판의 빈칸

- 나오는 날: 엔딩 · 장면: 오른쪽 아래만 비워 둔 칠판 · 참조: `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view at night: the wall chalkboard with today's menu space and a deliberately empty bottom-right corner (no readable text).
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 99. `eye_7` · 사장의 눈 7 · 앞치마 끈

- 나오는 날: 엔딩 · 장면: 등 뒤에서 다시 매 주는 끈 · 참조: `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: JIEUN's back as she wipes cups, the owner's calm hands retying her green apron strings.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 100. `eye_6` · 사장의 눈 6 · 저 친구가 내립니다

- 나오는 날: 엔딩 · 장면: 앞치마 주머니에서 손을 꺼내며 · 참조: `jieun_sheet` · `hall_busy_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view during the summer rush: a customer pointing at the owner, JIEUN beside the espresso machine looking nervous.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 101. `eye_8` · 사장의 눈 8 · 동네 시간

- 나오는 날: 엔딩 · 장면: 선반의 단골 잔들, 칠판 앞의 분필 · 참조: `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view at night: the regulars' mugs untouched on the shelf, a piece of chalk in the owner's hand in front of the chalkboard.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 102. `eye_9` · 사장의 눈 9 · 열쇠

- 나오는 날: 엔딩 · 장면: 주머니에서 꺼낸 낡은 열쇠 · 참조: `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: an old brass key held out in the owner's calm hand toward JIEUN, who looks nervous but brave.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 103. `eye_10` · 사장의 눈 10 · 서두르면 쏟는다

- 나오는 날: 엔딩 · 장면: 마감 선반에 붙이는 작은 메모 · 참조: `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view at night: the owner's hand sticking a small paper memo inside the closing shelf with upside-down cups (no readable text).
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 104. `eye_11` · 사장의 눈 11 · 먼 창의 불빛

- 나오는 날: 엔딩 · 장면: 깜깜한 마을, 불이 켜진 창 하나 · 참조: `alley_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Night of the blackout from far away: a dark snowy seaside village and one warm lit cafe window glowing in the middle, seen from another house's window.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

## 3. 작업대 물건 시트 3 (`sheet_more`)

- 풀 버전 메뉴(디카페인 · 핸드드립 · 믹스커피 · 보리차 · 유자차 · 딸기우유 · 녹차라테 · 코코아)와 포장 컵에 쓰는 물건입니다. 지금은 임시 그림(SVG)으로 섭니다.
- 시트 규칙은 `docs/image_requests.md` 2장 ①·②와 같습니다(초록 바탕 · 4칸 × 3줄 · 마지막 칸 비움). 참조: `sheet_tools`. 칸 순서는 `tools/import-objects.py`의 `sheet_more`와 같습니다.
- 아직 없는 것: `obj_decaf` · `obj_drip_beans` · `obj_mix` · `obj_barley` · `obj_yuja` · `obj_strawberry` · `obj_matcha` · `obj_cocoa` · `obj_hand_grinder` · `obj_spoon` · `cup_plastic`

**sheet_more** · 1:1 · 참조: `sheet_tools`
```
Same art style, angle, lighting and rendering as the reference image (barista equipment sheet): highly detailed semi-realistic 2D game asset illustration with a soft 3D-rendered look, three-quarter view from slightly above, single soft key light from the upper left, no black outlines.
The square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each cell with wide empty margins; nothing touches or overlaps.
Row 1: a glass jar of dark roasted decaf coffee beans with a plain forest green lid; a small kraft paper bag of whole coffee beans with a folded top; three plain golden-yellow instant coffee mix stick packets fanned out; a glass jar of roasted barley grains with a cork lid.
Row 2: a glass jar of bright yellow-orange citron (yuja) tea preserve with thin peel slices; a glass jar of red strawberry preserve with small fruit pieces; a small open tin of bright green matcha powder with a small bamboo scoop; a small open tin of dark brown cocoa powder with a small metal scoop.
Row 3: a wooden manual hand coffee grinder with a metal crank handle; a long stainless steel bar spoon lying diagonally; a clear plastic takeaway cup with a flat clear lid and a paper straw, empty; the last cell (bottom right) completely empty.
Flat solid chroma key green background (#00B140) everywhere, no gradients, no cast shadows on the background, no green reflections.
Avoid: text, letters, numbers, labels, logos, brand names, watermark, people, hands, black outlines.
```

- 얼음 통(`obj_ice_bucket`) · 레시피 수첩(`obj_recipe_book`)은 `docs/추가 제작.md` 27 · 28번에 있습니다.

## 4. 블렌더 한 컷 (손 동작)

지금 컷이 있는 것: `extract` · `steam` · `pour_latte` · `pour_milk` · `foam` · `water` · `ice` · `pour_glass_latte` · `pour_glass_milk` · `water_glass` · `ice_plastic` · `pour_cocoa` · `pour_glass_cocoa` · `pour_glass_matcha` · `pour_glass_strawberry` · `pour_matcha` · `pour_paper_cocoa` · `pour_paper_latte` · `pour_paper_matcha` · `pour_paper_milk` · `pour_plastic_cocoa` · `pour_plastic_latte` · `pour_plastic_matcha` · `pour_plastic_milk` · `pour_plastic_strawberry` · `water_paper` · `water_plastic`. 아래 손 동작은 컷이 없어 임시 그림(움직이는 SVG)으로 섭니다. 만드는 법은 `docs/recipes.md` 6장 · CLAUDE.md 7장(`scene_bench.py … shots <id>` → `shots_post.py` → `npm run assets`).
게임은 `shots.json`에 맞는 이름의 컷이 있으면 저절로 씁니다(`brew.js`의 `shotIdFor`). 손 동작 id 와 같은 이름이면 그 컷, 붓기 · 물 붓기 · 얼음 담기는 잔마다 `pour{잔}_{latte|milk|색}` · `water{잔}` · `ice{잔}`(잔 = 머그는 없음 · `_glass` · `_paper` · `_plastic`, `docs/recipes.md` 6.7). 이름만 맞으면 코드를 고치지 않아도 됩니다.

| 손 동작 id | 이름 | 동작 | 쓰는 메뉴 | 알맞아요 칸 | 제안 장면 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `grind` | 원두 갈기 | G 기다렸다 누르기 | 아메리카노 | 0.56~0.8 | 그라인더 호퍼의 원두가 줄고, 아래 통에 가루가 쌓임(13단계) |
| `tamp` | 꾹 누르기 | A 누르고 떼기 | 아메리카노 · 라테 · 바닐라 라테 · 디카페인 라테 | 0.44~0.69 | 포터필터 위에서 탬퍼를 누름: 가루가 평평해지는 정도(13단계) |
| `syrup` | 시럽 넣기 | D 박자 | 바닐라 라테 | 2번 | 시럽 펌프를 눌러 컵에 시럽이 들어감(두 번) |
| `jam` | 청 떠 넣기 | D 박자 | 유자차 · 딸기우유 | 2번 | 청 병에서 숟가락으로 떠서 컵에 넣음(두 번) |
| `powder` | 가루 떠 넣기 | D 박자 | 녹차라테 · 코코아 | 2번 | 가루 통에서 숟가락으로 떠서 컵에 넣음(두 번) |
| `whisk` | 말차 풀기 | B 원 그리기 | 녹차라테 | 5바퀴 | 컵 속 말차를 차선으로 풂: 덩어리 → 고운 거품 |
| `milk_in` | 피처에 우유 붓기 | A 누르고 떼기 | 따뜻한 우유 | 0.5~0.75 | 우유병에서 피처에 찬 우유를 따름: 피처 눈금까지 |
| `tap` | 피처 톡톡 | D 박자 | 따뜻한 우유 | 2번 |  |
| `boil` | 물 끓이기 | G 기다렸다 누르기 | 핸드드립 · 보리차 · 유자차 | 0.66~0.88 | 버너 위 주전자의 물이 끓기 시작함: 김과 거품 |
| `steep` | 우리기 | G 기다렸다 누르기 | 보리차 | 0.58~0.82 | 보리차가 우러남: 물 색이 진해짐 |
| `hand_grind` | 손으로 원두 갈기 | B 원 그리기 | 핸드드립 | 6바퀴 | 손 그라인더 손잡이를 돌림 |
| `bloom` | 뜸 붓기 | A 누르고 떼기 | 핸드드립 | 0.3~0.55 | 드리퍼의 커피 가루에 처음 조금 붓기 |
| `bloom_wait` | 뜸 들이기 | G 기다렸다 누르기 | 핸드드립 | 0.62~0.86 | 뜸: 커피 가루가 부풀었다가 가라앉음 |
| `spiral` | 나선 붓기 | B 원 그리기 | 핸드드립 | 3바퀴 | 드리퍼 위로 주전자 물을 나선으로 세 바퀴 |
| `stir` | 젓기 | B 원 그리기 | 믹스커피 · 유자차 · 딸기우유 · 코코아 | 3바퀴 | 컵 속을 숟가락으로 젓기: 가루가 풀리는 정도 |

**I-28 포장 컵(종이컵 · 플라스틱 컵)** 🙋

- 지금 컷은 매장 잔(머그 · 유리컵)만 있습니다. 포장 주문의 얼음 담기 · 물 붓기 · 붓기는 임시 그림입니다(아이스 아메리카노 포장이 가장 많음).
- 플라스틱 컵(아이스 포장): 유리컵 컷(`docs/recipes.md` 6.7)과 같은 카메라 · 같은 빛에서 컵만 바꿈 → `ice_plastic` · `water_plastic` · `pour_plastic_latte` · `pour_plastic_milk`.
- 종이컵(따뜻한 포장): 속이 안 보이므로 위에서 조금 더 내려다본 구도(입구 속 음료 높이)를 먼저 정함 → `water_paper` · `pour_paper_latte` · `pour_paper_milk`.

**I-29 색 있는 우유 음료** 🙋

- 딸기우유(분홍) · 녹차라테(초록) · 코코아(갈색)는 지금 하얀 우유 컷(`pour_milk` · `pour_glass_milk`)이 나옵니다.
- 같은 컷에서 음료 색만 바꿈 → 유리컵(아이스) `pour_glass_strawberry` · `pour_glass_matcha` · `pour_glass_cocoa`, 머그(따뜻하게) `pour_matcha` · `pour_cocoa`(딸기우유는 아이스만).

## 5. 소리

### 5.1 효과음 · 환경음 (사서 쓰는 팩에서 잘라 넣기, `tools/audio/audio_map.mjs`)

| 종류 | id | 쓰는 곳 | 바라는 소리 |
| :--- | :--- | :--- | :--- |
| 효과음 | `snap` | 작업대 · 화면 | 사진 스냅 연출 |
| 효과음 | `bus` | 봄 1일 · 여름 2일 · 가을 2일 · 가을 7일 · 겨울 3일 | 버스가 서는 소리(브레이크 · 문 열림) |
| 효과음 | `espresso` | 작업대 · 화면 | 에스프레소가 나오는 소리 |
| 효과음 | `steam` | 봄 1일 | 스팀 노즐(쉬익) |
| 효과음 | `mixer` | 작업대 · 화면 | 그라인더 가는 소리 |
| 효과음 | `shutter_phone` | 봄 6일 | 휴대전화 사진 찍는 소리 |
| 효과음 | `mug` | 작업대 · 화면 | 머그를 내려놓는 소리 |
| 환경음 | `street` | 봄 1일 · 봄 2일 · 봄 3일 · 봄 4일 · 봄 7일 · 여름 2일 · 여름 6일 · 여름 7일 외 3일 | 바닷가 골목(갈매기 · 먼 파도 · 발소리) |
| 환경음 | `kitchen` | 지금 대본에는 없음 | 주방 |
| 환경음 | `classroom` | 지금 대본에는 없음 | 교실 |

### 5.2 배경음악 (✅ 새로 만듦: 직업 마1스톤 곡과 「The Carousel Turn」은 쓰지 않음)

| mood | 쓰는 곳 | 느낌 · 악기 | 길이 |
| :--- | :--- | :--- | :--- |
| `title` | 처음 화면 | 밤바다, 잔잔한 피아노 + 어쿠스틱 기타, 그리움 | 1~2분 루프 |
| `morning` | 아침 · 새벽 장면(15일) | 맑고 느린 어쿠스틱 기타 + 첼레스타, 하루의 시작 | 1~2분 루프 |
| `cafe` | 가게 안 낮 장면(14일) | 부드러운 재즈 피아노 트리오(작게), 대화를 가리지 않게 | 2분 루프 |
| `warm` | 마감 · 정다운 장면(24일) | 따뜻한 피아노 + 현악 패드, 느림 | 2분 루프 |
| `tension` | 바쁜 날 · 폭설 전(3일) | 낮은 현악 스타카토 + 시계 같은 리듬, 무섭지 않게 | 1분 루프 |
| `peak` | 가을 축제(1일) | 아코디언 + 손뼉 + 작은 북, 흥겹지만 시끄럽지 않게 | 1분 30초 루프 |
| `home` | 도시를 떠나 마을에 오는 장면(1일) | 버스 창밖 같은 잔잔한 신스 패드 + 기타 | 1분 루프 |
| `ending` | 겨울 마지막 날 · 엔딩(2일) | 피아노 솔로에서 현악이 더해지는 감동적인 곡, 루프 없이 끝나도 됨 | 3~4분 |
| `celebrate` | 하루 끝 화면 | 짧고 밝은 마무리(실로폰 + 기타) | 30초 루프 |

- 판매 페이지에 AI 관련 금지 조건이 있는 음악 팩은 쓰지 않습니다(CLAUDE.md 7장). 음악 파일이 없으면 게임은 조용히 넘어갑니다.

## 6. 음성 (Supertonic, 내 PC)

- 읽어 줄 문장 2380줄(`npm run lines` → `tools/voice/lines.json`). `npm run voices`가 바뀐 줄만 만듭니다.
- 새 인물의 목소리 배정은 `tools/voice/voice_cast.json`에 있습니다(Supertonic 목소리가 10개뿐이라 빠르기로 구별, 들어 보고 정함).

| 목소리 | 줄 수 |
| :--- | ---: |
| `sys` | 622 |
| `narr` | 607 |
| `think` | 278 |
| `owner` | 153 |
| `jieun` | 88 |
| `jian` | 70 |
| `do` | 65 |
| `customer_f` | 65 |
| `haesun` | 60 |
| `eunju` | 53 |
| `kang` | 44 |
| `han` | 44 |
| `sumin` | 44 |
| `noh` | 38 |
| `geum` | 27 |
| `customer` | 24 |
| `agent` | 21 |
| `dohyun` | 16 |
| `han_daughter` | 16 |
| `yeonwoo` | 14 |
| `student` | 13 |
| `mom2` | 13 |
| `actor` | 4 |
| `young_fisher` | 1 |

## 7. 넣은 뒤 할 일 (순서)

1. 그림: `npm run images`(스탠딩) → `python tools/face-boxes.py` → `npm run objects`(물건 시트) → `npm run assets`(배경 · CG · 컷) → `npm run credits`
2. 새 그림의 제작 프롬프트를 `tools/credits/image_prompts.mjs`에 한 줄씩(제작 · 저작권 정보)
3. 소리: `tools/audio/audio_map.mjs`에 대응을 적고 `npm run audio` → `assets/audio` 안에서 커밋 · 푸시 → 바깥에서 `git add assets/audio`
4. 음성: `npm run voices`
5. `npm run validate` → 자동 플레이 → `npm run requests`(이 문서가 줄어듦)

