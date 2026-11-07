# 요청서 · 풀 버전 (그림 · 물건 · 블렌더 컷 · 소리 · 음성)

> 생성: `npm run requests`(`tools/export-requests.mjs`) · 이 파일은 직접 고치지 않습니다. 그림이 들어오면 다시 돌리면 목록에서 빠집니다.
> **그림 프롬프트만 보려면 `docs/아직 없는 그림.md`**(아직 없는 그림 · 영상의 프롬프트를 만들 순서대로 한 번호로 모은 것, 같은 명령이 함께 만듦).
> 사용자(2026-10-31): "부족한 컴포넌트 예를 들어 이미지, 추가 효과음, 추가 음성 TTS 파일 등은 요청서를 만들면 내PC에서 제작하겠다. 필요 이미지들은 … 대체 요망이라고 적어두면 된다."
> 지금 게임은 이 목록이 없어도 끝까지 돌아갑니다. 없는 그림은 임시 그림(SVG)에 **"임시 그림 · 대체 요망"** 표시가 붙고, 없는 소리는 조용히 넘어갑니다.
> 그림 규칙은 `docs/image_requests.md` 0장 · 6.1과 같습니다(글자 없음 · 빛살 금지 · 사장님 손은 떨림 없이 차분하게 · 얼굴과 손은 위쪽 2/3).

## 0. 한눈에

| 무엇 | 남은 수 | 넣는 곳 | 그다음 |
| :--- | :--- | :--- | :--- |
| 인물 스탠딩(새 인물 1명) | 설정화 0 + 표정 1장 | `assets/_src/stand/{id}_{표정}.jpg` | `npm run images` → `python tools/face-boxes.py` |
| 장면 그림(CG) | 새로 17장 + `docs/추가 제작.md`에 이미 있는 5장 | `assets/cg/cg_{id}.jpg` | `npm run assets` |
| 작업대 물건 · 다 만든 잔 시트 | 14개를 시트 2장에 | `assets/_src/objects/{시트}.jpg` | `npm run objects` |
| 새 놀이의 그림 | 0장(없음) | `assets/flow/`에 두고 알려 주기 → `assets/_src/play/{id}.jpg` | 초록 바탕 지우기 · 자르기(그림이 오면 넣는 길을 만듦) |
| 블렌더 한 컷(손 동작) | 컷이 없는 손 동작 0 · 🙋 있으면 더 맞는 컷 15(지금은 비슷한 컷이 나옴) · 드래그 활용 그림 5 | `tools/blender/scene_bench.py` | `shots_post.py` → `npm run assets` |
| 효과음 · 환경음 | 효과음 6 · 환경음 3 | `tools/audio/audio_map.mjs` | `npm run audio` |
| 배경음악 | 0곡(✅ 저작자가 AI 음악 모델 Suno로 만든 곡으로 채움, 2026-11-01) | `BGM/` → `tools/audio/audio_map.mjs` 의 bgm | `npm run audio` |
| 음성 | 바뀐 줄만 | `tools/voice/lines.json` | `npm run voices` |

## 1. 인물 스탠딩 (새 인물)

만드는 순서는 `docs/image_requests.md` 1장과 같습니다: ① 설정화 → ② 보통(설정화를 참조) → ③ 나머지 표정(보통을 참조). 무대에서 오른쪽을 보고 섭니다.
표정은 대본에 쓰인 것만 적었습니다. 그림이 오기 전에는 임시 초상(SVG)으로 섭니다.

### 1.1 은주 — 아기 엄마 (id `eunju`)

- 처음 나오는 날: 여름 3일 · 표정: normal + sad · smile · surprised · worried · nervous
- 이미 있는 것: 설정화 · 보통 · sad · smile · surprised · worried — 아래는 아직 없는 것만
- 임시 초상 색: 옷 #E8B4C4 · 강조 #C2708A


**③ 나머지 표정** · 9:16 · 참조: `eunju_normal` — `docs/image_requests.md` 1장 ③의 상자에 아래 문장을 넣습니다.

| id | 표정 | `[표정]`에 넣을 문장 |
| :--- | :--- | :--- |
| `eunju_nervous` | nervous | nervous expression, eyebrows drawn together, small sweat drop, holding something tightly in front of the chest |

## 2. 장면 그림 · 이벤트 CG

- 새로 요청하는 17장입니다. 이 밖에 `docs/추가 제작.md`에 프롬프트가 이미 있는 5장(`autumn_key` · `winter_owner_return` · `winter_milk_handover` · `winter_chalk_name` · `ending_last_cup`)도 아직 없습니다.
- 넣는 곳 `assets/cg/cg_{id}.jpg`(16:9, 2K) → `npm run assets`. 나오는 사람의 설정화와 그 장소의 배경을 **참조 이미지로 함께** 넣습니다.
- 사장의 눈(`eye_*`)은 사장님 자리에서 본 그림입니다. 지은은 조금 멀리, 사장님의 손이 앞에 보이고, 기억처럼 조금 따뜻한 빛입니다.

### 2.0 목록

| # | id | 제목 | 나오는 날 | 참조 |
| ---: | :--- | :--- | :--- | :--- |
| 1 | `sumin_secret` | 합격 통지서 | 겨울 3일 | `sumin_sheet` · `jieun_sheet` · `hall_winter` |
| 2 | `winter_gathering` | 겨울 · 단골 여덟 명 | 겨울 4일 | `haesun_sheet` · `kang_sheet` · `do_sheet` · `jian_sheet` · `hall_blackout` |
| 3 | `do_secret` | 마지막 우편 | 겨울 5일 | `do_sheet` · `jieun_sheet` · `hall_winter` |
| 4 | `han_secret` | 컵 속의 쪽지 | 겨울 5일 | `han_sheet` · `hall_winter` |
| 5 | `jian_secret` | 지은의 손 | 겨울 6일 | `jian_sheet` · `jieun_sheet` · `hall_winter` |
| 6 | `eye_1` | 사장의 눈 1 · 컵을 깬 날 | 엔딩 | `jieun_sheet` · `hall_spring` |
| 7 | `eye_2` | 사장의 눈 2 · 한 칸 내린 선반 | 엔딩 | `hall_morning` |
| 8 | `eye_3` | 사장의 눈 3 · 맛은 시간이 만든다 | 엔딩 | `jieun_sheet` · `geum_sheet` · `hall_spring` |
| 9 | `eye_4` | 사장의 눈 4 · 빈 컵만 | 엔딩 | `jieun_sheet` · `hall_spring` |
| 10 | `eye_5` | 사장의 눈 5 · 칠판의 빈칸 | 엔딩 | `hall_evening` |
| 11 | `eye_7` | 사장의 눈 7 · 앞치마 끈 | 엔딩 | `jieun_sheet` · `hall_evening` |
| 12 | `eye_6` | 사장의 눈 6 · 저 친구가 내립니다 | 엔딩 | `jieun_sheet` · `hall_busy_summer` |
| 13 | `eye_8` | 사장의 눈 8 · 동네 시간 | 엔딩 | `jieun_sheet` · `hall_evening` |
| 14 | `eye_9` | 사장의 눈 9 · 열쇠 | 엔딩 | `jieun_sheet` · `hall_evening` |
| 15 | `eye_10` | 사장의 눈 10 · 서두르면 쏟는다 | 엔딩 | `hall_evening` |
| 16 | `eye_11` | 사장의 눈 11 · 먼 창의 불빛 | 엔딩 | `alley_morning` |
| 17 | `eye_12` | 사장의 눈 덤 · 그 갈매기 | 엔딩 | `owner_sheet` · `cafe_front_morning` |

### 2.1 프롬프트

#### 1. `sumin_secret` · 합격 통지서

- 나오는 날: 겨울 3일 · 장면: 여기서 열고 싶었어요 · 참조: `sumin_sheet` · `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): SUMIN: Korean girl age 18, a high school senior, short straight black bob haircut, quiet serious eyes, navy school uniform blazer with a white shirt and a navy skirt, white wired earphones, a dark backpack.
Scene: Winter: SUMIN at the counter opens the envelope and reads the letter, then smiles at JIEUN with teary eyes; JIEUN smiling back.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 2. `winter_gathering` · 겨울 · 단골 여덟 명

- 나오는 날: 겨울 4일 · 장면: 각자의 방식으로 돕는 밤 · 참조: `haesun_sheet` · `kang_sheet` · `do_sheet` · `jian_sheet` · `hall_blackout`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): KANG: Korean man in his sixties, an old fisherman, weathered tanned skin, short dark gray hair, gray stubble, a dark navy knit beanie, olive green work jacket over a thick cream sweater, big rough hands, black rubber work boots; DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Blackout night inside the candle-lit cafe: villagers gathered; HAESUN tucking blankets on children, KANG's small gas burner heating a kettle, DO carrying cups, JIAN drawing on paper taped to the wall, warm candle light everywhere.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 3. `do_secret` · 마지막 우편

- 나오는 날: 겨울 5일 · 장면: 지은 씨 앞으로 온 편지 · 참조: `do_sheet` · `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): DO: Korean man in his early sixties, a village mail carrier, short gray hair under a navy postal cap, kind face with smile wrinkles, navy blue postal uniform jacket with a thin red stripe, a heavy worn brown leather mailbag on a shoulder strap, sturdy walking shoes.
Scene: Snowy morning: DO hands JIEUN a letter in an envelope he wrote himself (no readable text), shy and warm.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 4. `han_secret` · 컵 속의 쪽지

- 나오는 날: 겨울 5일 · 장면: 아빠가 먼저 갈게 · 참조: `han_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): HAN: Korean man in his mid forties, a night bus driver, short black hair, tired kind eyes with faint dark circles, navy bus driver uniform with a loosened tie, a navy driver cap, a wristwatch on his left wrist.
Scene: Snowy morning: HAN shows two small folded notes on the counter, one in his handwriting and one in his daughter's handwriting (no readable text), smiling proudly.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 5. `jian_secret` · 지은의 손

- 나오는 날: 겨울 6일 · 장면: 커피 내리는 손 · 참조: `jian_sheet` · `jieun_sheet` · `hall_winter`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Winter: JIAN shows JIEUN a sketchbook page with a careful drawing of a hand pouring water over a coffee dripper; JIEUN surprised and moved.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 6. `eye_1` · 사장의 눈 1 · 컵을 깬 날

- 나오는 날: 엔딩 · 장면: 빗자루를 두 손으로 꼭 쥔 아이 · 참조: `jieun_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: JIEUN in her green apron gripping a broom with both hands, sweeping up a broken cup, not crying, determined; the owner's calm hand holding out the broom in the foreground.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 7. `eye_2` · 사장의 눈 2 · 한 칸 내린 선반

- 나오는 날: 엔딩 · 장면: 새벽, 컵을 한 칸 아래로 옮기는 손 · 참조: `hall_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view before dawn: the owner's calm hands moving clean cups down to a lower shelf, the empty cafe in soft blue dawn light.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 8. `eye_3` · 사장의 눈 3 · 맛은 시간이 만든다

- 나오는 날: 엔딩 · 장면: 카운터 앞으로 나가며 본 두 사람 · 참조: `jieun_sheet` · `geum_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
New characters (match their character sheets): GEUM: Korean man in his forties, a busy office worker who commutes by ferry, neat short black hair, dark charcoal suit with a slightly loosened tie, a smartphone in hand, a wristwatch.
Scene: From the OWNER's point of view stepping toward the counter: JIEUN behind the counter, nervous, and GEUM in the line checking his watch.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 9. `eye_4` · 사장의 눈 4 · 빈 컵만

- 나오는 날: 엔딩 · 장면: 그 아이 뒤에 빈 컵을 놓는 손 · 참조: `jieun_sheet` · `hall_spring`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: JIEUN focused on making drinks while the owner's hands quietly set out empty cups in a row behind her.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 10. `eye_5` · 사장의 눈 5 · 칠판의 빈칸

- 나오는 날: 엔딩 · 장면: 오른쪽 아래만 비워 둔 칠판 · 참조: `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view at night: the wall chalkboard with today's menu space and a deliberately empty bottom-right corner (no readable text).
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 11. `eye_7` · 사장의 눈 7 · 앞치마 끈

- 나오는 날: 엔딩 · 장면: 등 뒤에서 다시 매 주는 끈 · 참조: `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: JIEUN's back as she wipes cups, the owner's calm hands retying her green apron strings.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 12. `eye_6` · 사장의 눈 6 · 저 친구가 내립니다

- 나오는 날: 엔딩 · 장면: 앞치마 주머니에서 손을 꺼내며 · 참조: `jieun_sheet` · `hall_busy_summer`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view during the summer rush: a customer pointing at the owner, JIEUN beside the espresso machine looking nervous.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 13. `eye_8` · 사장의 눈 8 · 동네 시간

- 나오는 날: 엔딩 · 장면: 선반의 단골 잔들, 칠판 앞의 분필 · 참조: `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view at night: the regulars' mugs untouched on the shelf, a piece of chalk in the owner's hand in front of the chalkboard.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 14. `eye_9` · 사장의 눈 9 · 열쇠

- 나오는 날: 엔딩 · 장면: 주머니에서 꺼낸 낡은 열쇠 · 참조: `jieun_sheet` · `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view: an old brass key held out in the owner's calm hand toward JIEUN, who looks nervous but brave.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 15. `eye_10` · 사장의 눈 10 · 서두르면 쏟는다

- 나오는 날: 엔딩 · 장면: 마감 선반에 붙이는 작은 메모 · 참조: `hall_evening`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: From the OWNER's point of view at night: the owner's hand sticking a small paper memo inside the closing shelf with upside-down cups (no readable text).
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 16. `eye_11` · 사장의 눈 11 · 먼 창의 불빛

- 나오는 날: 엔딩 · 장면: 깜깜한 마을, 불이 켜진 창 하나 · 참조: `alley_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Night of the blackout from far away: a dark snowy seaside village and one warm lit cafe window glowing in the middle, seen from another house's window.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

#### 17. `eye_12` · 사장의 눈 덤 · 그 갈매기

- 나오는 날: 엔딩 · 장면: 사장님이 몰래 갈매기에게 빵을 준다 · 참조: `owner_sheet` · `cafe_front_morning`

```
Cinematic story-game event illustration (CG) in clean modern anime cel-shading with bold clean outlines, matching the reference images exactly: the same faces, hairstyles, outfits and body proportions as the character sheets, and the same cafe as the background reference. Quiet, warm, emotional mood; soft diffused light; gentle depth of field. A small old cafe in a quiet seaside village in Korea; palette of deep sea teal and navy shadows, warm golden lamp light, cream walls, warm oak wood, small forest green accents. 16:9, high resolution. Composition: faces, hands and key objects stay in the upper two thirds; the lower third is calm and a little darker (table top or floor) because a translucent dialogue box will cover it.
Scene: Early spring morning in front of the cafe: the OWNER (Korean man, 66, neatly combed back white hair, short white beard, white shirt, charcoal apron) crouches by the terrace and quietly gives a small piece of bread to a chubby white seagull, with a tiny secret smile; the cafe door is still closed, soft morning light, calm sea behind. No sun rays.
Avoid: text, letters, numbers, writing on boards, readable signs, logos, watermark, extra people, distorted hands, extra fingers, trembling lines, sickly look, red awning, bakery display case, harsh contrast, sunburst, radial rays.
```

## 3. 작업대 물건 · 다 만든 잔 시트 (Flow, 2026-11-06 사용자 결정 Q-52)

- 카운터(재료 고르기)의 물건, 드리기 쟁반 · 레시피 수첩의 다 만든 잔, 버리는 장면의 개수대 · 건조대 · 쓰레기통, 우유 · 얼음이 다 떨어진 날의 빈 우유병 · 빈 얼음 통입니다. 지금은 임시 그림(SVG)으로 섭니다(빈 그릇은 가득 찬 그림을 흐리게, 검수 13.62).
- 시트 규칙은 `docs/image_requests.md` 2장 ①·②와 같습니다(4칸 × 3줄 · 칸마다 물건 하나 · 마지막 칸 비움). 바탕은 크로마키 초록이고, **초록 물건(녹차라테 · 말차)이 든 `sheet_drinks_blue`만 파란 바탕**입니다(초록 바탕이면 초록 물건이 바탕과 함께 지워짐).
- 참조 그림(`assets/_src/objects/sheet_tools.jpg` · `sheet_cups.jpg`)을 꼭 붙여 같은 그림체 · 시점 · 빛으로 만듭니다. 같은 컵(머그 · 유리컵 · 플라스틱 컵)은 한 줄에 모아 모양 · 크기를 맞춥니다. 김(steam)은 게임이 그리므로 넣지 않습니다.
- 받은 그림은 `assets/_src/objects/{시트 이름}.jpg`로 두거나 `assets/flow/`에 두고 알려 주세요 → `npm run objects`(점검은 `python tools/import-objects.py --check`). 칸 순서는 `tools/import-objects.py`의 `SHEETS`와 같습니다.
- 아직 없는 것: `obj_milk_bottle_empty` · `obj_hand_grinder` · `obj_spoon` · `counter_plant` · `counter_shells` · `counter_flowers` · `counter_hourglass` · `counter_lighthouse` · `gift_bread` · `gift_mug` · `gift_scarf` · `gift_postcard` · `gift_beans` · `gift_blanket`

### `sheet_empty` · 1:1 · 초록 바탕 · 참조: `sheet_tools`(우유병이 있는 시트)

- 우유가 다 떨어진 날(오늘의 칠판 · 자유 영업) 카운터의 빈 우유병 + 거의 보이지 않는 손 도구 둘(손 기술 컷이 없을 때만). **첫 줄 세 칸만** 그리고 나머지는 비움
- 칸: 1줄 `obj_milk_bottle_empty` · `obj_hand_grinder` · `obj_spoon` / 나머지 칸 모두 비움

```
Same art style, angle, lighting and rendering as the reference images (barista equipment and cup sheets): highly detailed semi-realistic 2D game asset illustration with a soft 3D-rendered look, three-quarter view from slightly above, single soft key light from the upper left, no black outlines.
The square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each used cell with wide empty margins; nothing touches or overlaps.
Row 1: the same glass milk bottle as in the reference image, now empty: clear glass with only a thin trace of milk at the bottom, the same cap; a wooden manual hand coffee grinder with a metal crank handle; a long stainless steel bar spoon lying diagonally; the remaining cells of this row completely empty.
Rows 2 to 3: every cell completely empty. Only 3 objects in the whole image.
Flat solid chroma key green background (#00B140) everywhere, no gradients, no cast shadows on the background, no green reflections.
Avoid: text, letters, numbers, labels, logos, brand names, watermark, people, hands, steam, latte art, black outlines.
```

### `sheet_gift` · 1:1 · 초록 바탕 · 참조: `sheet_tools` · `sheet_cups`

- 수첩 '나의 성장'에서 사는 것(검수 13.91): 카운터 꾸미기 다섯(작업대 카운터 오른쪽 창틀 위에 놓임, 머그와 같은 배율) + 선물 여섯(선물 장면에서 상자가 열리면 보임). 초록 바탕이라 초록이 거의 없게(다육이는 청회색, 꽃은 말린 들꽃). 그림이 오기 전에는 동그라미 아이콘
- 칸: 1줄 `counter_plant` · `counter_shells` · `counter_flowers` · `counter_hourglass` / 2줄 `counter_lighthouse` · `gift_bread` · `gift_mug` · `gift_scarf` / 3줄 `gift_postcard` · `gift_beans` · `gift_blanket` / 마지막 칸 비움

```
Same art style, angle, lighting and rendering as the reference images (barista equipment and cup sheets): highly detailed semi-realistic 2D game asset illustration with a soft 3D-rendered look, three-quarter view from slightly above, single soft key light from the upper left, no black outlines.
The square image is divided into an invisible grid of 4 columns and 3 rows. Exactly one object is centered in each cell with wide empty margins; nothing touches or overlaps.
Row 1 (small decorations for a cafe window sill, each about as tall as a mug or a little taller): a small round terracotta pot with one plump pale blue-grey echeveria succulent (dusty blue-grey, not bright green); a small clear glass jar with a cork lid, filled with little seashells in cream, peach and pale pink; a small cream ceramic vase with a loose bunch of dried seaside wildflowers: lavender purple sea lavender, cream and pale yellow blossoms, muted olive-brown stems; an hourglass with a warm oak wood frame and pale sand, the sand halfway fallen.
Row 2: a small table lamp shaped like a lighthouse with red and white stripes and a softly glowing warm yellow window at the top; a kraft paper bakery bag with the top folded open, two round golden bread rolls and the end of a baguette poking out; a new ceramic mug in deep sea blue with a cream inside and a thin cream wave line around the middle, empty; a neatly folded soft knit wool scarf in warm mustard and cream stripes with short tassels.
Row 3: a postcard with a painted calm blue sea and small islands, leaning on a plain cream envelope with a small sea-blue stamp shape, no writing anywhere; a kraft paper coffee bean bag with a fold-over top and a tin tie, standing upright, a few roasted coffee beans beside it; a neatly folded soft fleece lap blanket in warm oatmeal beige with a cream tartan check pattern; the last cell (bottom right) completely empty.
Flat solid chroma key green background (#00B140) everywhere, no gradients, no cast shadows on the background, no green reflections.
Avoid: text, letters, numbers, labels, logos, brand names, watermark, people, hands, steam, latte art, black outlines.
```

## 4. 새 놀이의 그림 (재미 개편)

- 몰림 · 그 갈매기 쫓기 · 바닷가로 가는 버스 · 가게 꾸미기 · 앞치마의 그림입니다. 지금은 코드로 그린 임시 그림(SVG · 색 띠 · 아이콘)으로 섭니다.
- 프롬프트 · 규칙은 `docs/image_requests.md` 8장에 있습니다(시트는 초록 바탕 · 4칸 × 3줄 · 마지막 칸 비움, 버스 창밖은 좌우가 이어지는 그림).
- 받은 그림은 `assets/flow/`에 두고 알려 주세요. `assets/_src/play/{id}.jpg`로 옮겨 넣으면 이 목록에서 빠집니다.

- 모두 있습니다.

## 5. 블렌더 한 컷 (손 동작)

지금 컷이 있는 것: `extract` · `steam` · `pour_latte` · `pour_milk` · `foam` · `water` · `ice` · `pour_glass_latte` · `pour_glass_milk` · `water_glass` · `ice_plastic` · `pour_cocoa` · `pour_glass_cocoa` · `pour_glass_matcha` · `pour_glass_strawberry` · `pour_matcha` · `pour_paper_cocoa` · `pour_paper_latte` · `pour_paper_matcha` · `pour_paper_milk` · `pour_plastic_cocoa` · `pour_plastic_latte` · `pour_plastic_matcha` · `pour_plastic_milk` · `pour_plastic_strawberry` · `water_paper` · `water_plastic` · `milk_in` · `tap` · `bloom` · `bloom_wait` · `boil` · `grind` · `hand_grind` · `jam_iced_strawberry` · `jam_iced_yuja` · `jam_yuja` · `powder_cocoa` · `powder_iced_cocoa` · `powder_iced_matcha` · `powder_matcha` · `spiral` · `steep` · `steep_iced` · `stir_cocoa` · `stir_iced_cocoa` · `stir_iced_strawberry` · `stir_iced_yuja` · `stir_paper_mix` · `stir_yuja` · `syrup` · `syrup_iced` · `tamp` · `whisk` · `whisk_iced` · `water_barley` · `water_glass_barley` · `water_glass_yuja` · `water_paper_mix` · `water_yuja` · `steam_kid` · `hotwater_pitcher_yuja` · `ice_strawberry` · `jam_pitcher_yuja` · `pourin_glass_americano` · `pourin_glass_latte` · `pourin_glass_yuja` · `pourin_plastic_americano` · `pourin_plastic_latte` · `pourin_plastic_yuja` · `stir_pitcher_yuja` · `water_glass_ice` · `water_plastic_ice` · `water_plastic_yuja` · `hotwater_pitcher_cocoa` · `hotwater_pitcher_matcha` · `pourin_glass_cocoa` · `pourin_glass_matcha` · `pourin_plastic_cocoa` · `pourin_plastic_matcha` · `powder_pitcher_cocoa` · `powder_pitcher_matcha` · `stir_pitcher_cocoa` · `whisk_pitcher_matcha` · `ice_barley` · `ice_plastic_barley`. 만드는 법은 `docs/recipes.md` 6장 · CLAUDE.md 7장(`scene_bench.py … shots <id>` → `shots_post.py` → `npm run assets`).
게임은 `shots.json`에 맞는 이름의 컷이 있으면 저절로 씁니다(`js/data/menu.js`의 `shotNames`, 작업대 `brew.js`의 `shotIdFor`). 손 동작 id 와 같은 이름이면 그 컷, 붓기 · 물 붓기 · 얼음 담기는 잔마다 `pour{잔}_{latte|milk|색}` · `water{잔}` · `ice{잔}`(잔 = 머그는 없음 · `_glass` · `_paper` · `_plastic`, `docs/recipes.md` 6.7), 컵에 넣기 · 젓기 · 우리기는 `{동작}[_iced]_{바탕}`(포장 컵은 `{동작}{잔}_{바탕}`, 6.10). 이름만 맞으면 코드를 고치지 않아도 됩니다.
아래 목록은 메뉴마다 온도 · 매장/포장 · 단계를 모두 따라가며 작업대가 고를 컷을 셈한 것입니다.

### 5.1 컷이 없는 손 동작 (임시 그림으로 섬)

- 없습니다. 메뉴판의 모든 잔에서 손 동작마다 블렌더 컷이 나옵니다.

### 5.2 있으면 더 맞는 컷 🙋 (지금은 비슷한 컷이 나옴)

- 이 잔들도 지금 블렌더 컷이 나옵니다. 다만 다른 잔(포장 컵인데 머그 · 유리컵)이나 다른 음료(보리차 · 유자차인데 아메리카노)의 컷이라, 만들면 더 꼭 맞습니다. 급하지 않습니다(`docs/recipes.md` 6.10 🙋).
- 만드는 법: 지금 나오는 컷과 같은 장면에서 잔만 바꿉니다. 종이컵은 `water_paper`, 플라스틱 컵은 `water_plastic`과 같은 카메라 · 빛(얼음 24개), 물 붓기는 음료 색만 그 바탕으로(보리차 = 호박색 · 티백, 유자차 = 청이 풀림).

| 만들 컷 | 손 동작 | 쓰는 잔 | 지금 나오는 컷 |
| :--- | :--- | :--- | :--- |
| `syrup_paper_espresso` | 시럽 넣기 | 바닐라 라테 · 따뜻하게 · 종이컵 | `syrup` |
| `syrup_plastic_espresso` | 시럽 넣기 | 바닐라 라테 · 아이스 · 플라스틱 컵 | `syrup_iced` |
| `water_paper_barley` | 물 붓기 | 보리차 · 따뜻하게 · 종이컵 | `water_paper` |
| `steep_paper_barley` | 우리기 | 보리차 · 따뜻하게 · 종이컵 | `steep` |
| `water_plastic_barley` | 물 붓기 | 보리차 · 아이스 · 플라스틱 컵 | `water_plastic` |
| `steep_plastic_barley` | 우리기 | 보리차 · 아이스 · 플라스틱 컵 | `steep_iced` |
| `jam_paper_yuja` | 청 떠 넣기 | 유자차 · 따뜻하게 · 종이컵 | `jam_yuja` |
| `water_paper_yuja` | 물 붓기 | 유자차 · 따뜻하게 · 종이컵 | `water_paper` |
| `stir_paper_yuja` | 젓기 | 유자차 · 따뜻하게 · 종이컵 | `stir_yuja` |
| `powder_paper_matcha` | 가루 떠 넣기 | 녹차라테 · 따뜻하게 · 종이컵 | `powder_matcha` |
| `whisk_paper_matcha` | 말차 풀기 | 녹차라테 · 따뜻하게 · 종이컵 | `whisk` |
| `jam_plastic_strawberry` | 청 떠 넣기 | 딸기우유 · 플라스틱 컵 | `jam_iced_strawberry` |
| `stir_plastic_strawberry` | 젓기 | 딸기우유 · 플라스틱 컵 | `stir_iced_strawberry` |
| `powder_paper_cocoa` | 가루 떠 넣기 | 코코아 · 따뜻하게 · 종이컵 | `powder_cocoa` |
| `stir_paper_cocoa` | 젓기 | 코코아 · 따뜻하게 · 종이컵 | `stir_cocoa` |

### 5.3 조작법 '드래그 활용'의 그림 (`docs/recipes.md` 6.11)

- 붓는 컷에 덜 기운 그릇(`… tilt`)이 없으면 끌어 붓기는 되지만 그릇이 기울어 보이지 않고, 얼음 담기 컷에 얼음 통 · 국자(`… drag_ice`)가 없으면 터치 기반처럼 눌러서 담습니다.

| 컷 | 필요한 그림 | 쓰는 잔 |
| :--- | :--- | :--- |
| `water_glass_ice` | `scene_bench.py … tilt` (덜 기운 그릇) | 아메리카노 · 아이스 · 유리컵 |
| `water_plastic_ice` | `scene_bench.py … tilt` (덜 기운 그릇) | 아메리카노 · 아이스 · 플라스틱 컵 |
| `ice_barley` | `scene_bench.py … drag_ice` (얼음 통 · 국자) | 보리차 · 아이스 · 유리컵 |
| `ice_plastic_barley` | `scene_bench.py … drag_ice` (얼음 통 · 국자) | 보리차 · 아이스 · 플라스틱 컵 |
| `water_plastic_yuja` | `scene_bench.py … tilt` (덜 기운 그릇) | 유자차 · 아이스 · 플라스틱 컵 |

## 6. 소리

### 6.1 효과음 · 환경음 (사서 쓰는 팩에서 잘라 넣기, `tools/audio/audio_map.mjs`)

| 종류 | id | 쓰는 곳 | 바라는 소리 |
| :--- | :--- | :--- | :--- |
| 효과음 | `snap` | 작업대 · 화면 | 사진 스냅 연출 |
| 효과음 | `espresso` | 작업대 · 화면 | 에스프레소가 나오는 소리 |
| 효과음 | `steam` | 봄 1일 | 스팀 노즐(쉬익) |
| 효과음 | `mixer` | 작업대 · 화면 | 그라인더 가는 소리 |
| 효과음 | `shutter_phone` | 봄 6일 | 휴대전화 사진 찍는 소리 |
| 효과음 | `mug` | 작업대 · 화면 | 머그를 내려놓는 소리 |
| 환경음 | `street` | 봄 1일 · 봄 2일 · 봄 3일 · 봄 4일 · 봄 7일 · 여름 2일 · 여름 6일 · 여름 7일 외 4일 | 바닷가 골목(갈매기 · 먼 파도 · 발소리) |
| 환경음 | `kitchen` | 지금 대본에는 없음 | 주방 |
| 환경음 | `classroom` | 지금 대본에는 없음 | 교실 |

### 6.2 배경음악 (✅ 새로 만듦: 직업 마1스톤 곡과 「The Carousel Turn」은 쓰지 않음)

| mood | 쓰는 곳 | 느낌 · 악기 | 길이 |
| :--- | :--- | :--- | :--- |
| 모두 있음 | ✅ 저작자가 AI 음악 모델 Suno로 만든 곡(2026-11-01, 배정은 `js/av/audio.js` 의 BGM_VARIANTS · 검수 13.29) | | |

- 판매 페이지에 AI 관련 금지 조건이 있는 음악 팩은 쓰지 않습니다(CLAUDE.md 7장). 음악 파일이 없으면 게임은 조용히 넘어갑니다.

## 7. 음성 (Supertonic, 내 PC)

- 읽어 줄 문장 3592줄(`npm run lines` → `tools/voice/lines.json`). `npm run voices`가 바뀐 줄만 만듭니다.
- 새 인물의 목소리 배정은 `tools/voice/voice_cast.json`에 있습니다(Supertonic 목소리가 10개뿐이라 빠르기로 구별, 들어 보고 정함).
- 사람별 대본(주인공 · 사장님 · 단골 · 조연 · 손님 옷차림별 · 안내, 줄 수 · 글자 수)은 `docs/voice_lines.md`(`npm run lines`가 함께 만듦).

| 목소리 | 줄 수 |
| :--- | ---: |
| `sys` | 1048 |
| `narr` | 684 |
| `think` | 297 |
| `owner` | 207 |
| `jieun` | 149 |
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

