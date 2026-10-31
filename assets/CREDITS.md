# 그림 출처

이 게임(「직업 ε바리스타3」)이 「직업 마1스톤」에서 가져와 쓰는 그림입니다(2026-10-27). 직업 마1스톤 전용 그림(소품·오늘의 한 장·표지 영상·픽셀 아트·앱 아이콘)은 이 폴더에서 지웠고, 기록은 원본 `C:\AI\game\assets\CREDITS.md`에 있습니다.

| 묶음 | 파일 | 만든 방법 | 비고 |
| :--- | :--- | :--- | :--- |
| 배경 14장 | `assets/bg/*.jpg` | 사용자가 Google Flow(생성형 AI)로 제작 | 원래 이름은 `assets/bg/SOURCES.md`. 오른쪽 아래에 생성 도구 표시(✦)가 남아 있음 |
| 스탠딩 17장(연우·도현·점장) | `assets/stand/*.webp` | 사용자가 Google Flow(생성형 AI)로 제작 → `tools/import-images.py`로 배경 지우기·자르기 | 원본은 `assets/_src/stand/`. 새 게임에서는 손님으로 나옴 |
| 조연·손님 스탠딩 23장 (2026-10-12) | `assets/stand/{grandma,hiker,daeri,…,customer-*}_*.webp` | 사용자가 Google Flow(생성형 AI)로 제작(전신, 흰 배경) → 같은 도구로 배경 지우기·자르기 | 원본·원래 이름은 `assets/_src/stand/`, `assets/_src/SOURCES.md` |
| 크루·가족 스탠딩 3장(소라·민재·엄마) | `assets/stand/{sora,minjae,mom}_normal.webp` | 사용자가 Google Flow(생성형 AI)로 제작(전신, 흰 배경) → 배경 지우기·자르기 | 원래 파일 이름 기록 없음 |
| 루나 2장 (2026-10-15) | `assets/stand/luna_*.webp` | Claude가 드린 프롬프트로 사용자가 Google Flow에서 제작 | 원래 이름은 `assets/_src/SOURCES.md` |
| VFX 텍스처 16장 | `assets/vfx/*.png` | 사용자가 Google Flow(생성형 AI)로 제작(초록 배경) → 같은 도구로 크로마키·자르기 | 원본은 `assets/_src/vfx/` |
| 표정 초상 13장 | `assets/portraits/*.jpg` | 설정화 시트(`assets/*_sheet.jpg`)를 `tools/crop-portraits.py`로 자름 | 문자·수첩에 사용 |

- 그림마다 제작 프롬프트 복기·원래 이름·만든 날짜는 선생님 모드 → **제작·저작권 정보 → 그림** 탭에 있습니다(자료: `tools/credits/image_prompts.mjs`, `npm run credits`).
- Google Flow 결과물: Google은 소유권을 주장하지 않는다고 안내(Flow 도움말). 보이지 않는 워터마크(SynthID)가 들어 있고, 한국 거주자에게는 보이는 표시가 붙습니다. 인물·효과는 그 표시를 지웠고, 배경에는 남아 있습니다. 처음 화면에 'AI로 만든 그림·음성·음악을 씁니다'를 늘 보여 줍니다.

# 글꼴 출처

| 파일 | 글꼴 | 라이선스 |
| :--- | :--- | :--- |
| `assets/fonts/PretendardVariable.woff2` | Pretendard Variable 1.309 · © 2023 Kil Hyung-jin (github.com/orioncactus/pretendard) | SIL Open Font License 1.1 (`assets/fonts/OFL-Pretendard.txt`, 배포본에 함께 들어감) |
| `assets/fonts/HahmletVariable.ttf` | 함렛 Hahmlet 1.002(가변 굵기 100~900) · © 2020 The Hahmlet Project Authors (github.com/hyper-type/hahmlet), Google Fonts 공식 저장소 `ofl/hahmlet/Hahmlet[wght].ttf`를 받아 이름만 바꿈(2026-10-28) | SIL Open Font License 1.1 (`assets/fonts/OFL-Hahmlet.txt`) |

- 효과음·환경음 출처는 `assets/audio/CREDITS.md`에 있습니다. 배경음악은 새 곡을 넣을 때 적습니다.
