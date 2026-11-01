# CLAUDE.md: 직업 ε바리스타3

발달장애 학생(특수학교 고등부·전공과)을 위한 **바리스타 이야기 게임**입니다. 주인공 지은이 바닷가 마을의 오래된 카페에서 봄부터 겨울까지 일하며, 단골 8명의 말하지 않는 마음을 알아채고 그 사람에게 맞는 '한 잔의 마음'을 건넵니다. 이야기가 끝나도 커피 만들기(자유 영업)를 계속할 수 있습니다.
상업 목적이 아니라 **교육 품질**이 목표입니다. 문서와 대화는 한국어로 씁니다.

- **제목은 「직업 ε바리스타3」**(사용자 결정 2026-10-30, PRD Q-3). 앞의 ε는 '3을 좌우로 뒤집은 모양'입니다. 글로만 쓰는 곳(창 제목·설치 파일·대본·문서)은 그리스 문자 ε(U+03B5), 처음 화면의 큰 제목은 진짜 3을 뒤집어 그립니다(`title.js`의 `titleMark`, 함렛에 ε가 없음). 소리로 읽을 때는 `CONFIG.TITLE_SAY`('직업 바리스타'): 앞뒤의 3은 소리 내지 않습니다(사용자 결정). 제목에 조사를 바로 붙이지 않습니다(글은 3으로, 소리는 '바리스타'로 끝나 은/는이 어긋남).
- **이름은 짓지 않습니다**(Q-3, 사용자 결정 2026-10-30): 마을 · 카페 · 사장님은 '바닷가 마을' · '카페' · '사장님'으로만 부르고, 간판은 비워 둡니다. 대사 · 그림 프롬프트에 새 고유 이름을 만들지 않습니다.
- **한 해는 계절마다 7일**(고요한 날 6 + 폭발 사건 1, 한 해 28일 + 엔딩, Q-12). 숨은 장면은 여는 때 · 닫는 때 [둘러보기]로도 찾습니다(Q-13).
- **기준 문서: `PRD.md`**(v0.6, 2026-10-30). 검수 문서는 `docs/review.md`, 그림 요청서는 `docs/image_requests.md`. 결정이 필요한 것은 PRD 20장의 Q 번호로 묻습니다.
- 이 폴더는 「직업 마1스톤」 v2.0.0(`C:\AI\game`)을 복사해 엔진만 남긴 것입니다(2026-10-27 M0). **원본 폴더는 사용자가 말할 때만 고칩니다.** 지운 파일·옛 문서·옛 코드는 원본에서 찾아 참고합니다(예: 주문 담기 `js/game/minigames/order.js`, 매일 매일 카페 생활 `js/data/daily.js`, 옛 안내 `CLAUDE.md`).
- 지금 이야기는 **풀 버전**입니다(2026-10-31, 사용자 "클라우드 세션에서 모든 게임을 만들어라"): 봄 · 여름 · 가을 · 겨울 28일(`js/data/episodes/{spring,summer,autumn,winter}_{1..7}.js`, 단골 8명 × 대응 5번 = 40) + 엔딩(`ending.js`: 단골 앨범 → 사장의 눈 11컷 → 마지막 우유 한 잔 → 크레디트) + 자유 영업(`free.js`, 엔딩 뒤) + 새 해. 설계서는 `docs/story.md`(Q-22~), 아직 없는 그림 · 소리 · 음성은 `docs/requests_full.md`(`npm run requests`가 만듦). 시험판(m1_*)은 지웠습니다(원본은 git 기록).

---

## 1. 실행과 검사

```bash
npm run web          # 개발 서버 http://localhost:5175 (의존성 없음, ES 모듈이라 file:// 로는 안 열림)
npm start            # Electron (app:// 프로토콜)
npm run validate     # 시나리오 검사: 오류 0 이어야 함
npm run export       # 읽기용 대본 → scenarios/*.md (자동 생성물, 직접 고치지 않기)
npm run requests     # 아직 없는 그림 · 물건 · 블렌더 컷 · 소리 · 음성 요청서 → docs/requests_full.md (자동 생성물)
npm run assets       # 소리 assets/audio/{bgm,sfx,amb}/ → manifest.json, 그림 → assets/images.json
npm run images       # assets/_src/{stand,vfx,…} 원본 → 게임용 그림(tools/import-images.py) + 목록
npm run objects      # 작업대 물건 시트 assets/_src/objects/sheet_*.jpg → assets/objects/{id}.webp(초록 바탕 지우기·자르기) + 목록. --check 는 python tools/import-objects.py --check
npm run lines        # 읽어 줄 문장 목록 → tools/voice/lines.json
npm run voices       # 목록 + Supertonic 3 로컬 TTS로 음성 생성(바뀐 줄만)
npm run credits      # 선생님 모드 '제작·저작권 정보' 자료 → assets/credits/credits.json
npm run build:web    # 웹판 배포용 폴더(dist/). 웹판은 새 Vercel 프로젝트로만, 공개(정식 배포)는 사용자 허락 뒤에만
npm run build:win    # 설치용 앱(appId kr.barista-game.app). 앱 아이콘은 아직 없음
```

- 브라우저 확인: 미리 보기 설정 `barista-web`(5175). 원본 직업 마1스톤은 `job-milestone-original`(5173)로 따로 띄웁니다. 두 게임은 저장 키(`barista.v1` / `jobms.v2`), 기록 파일 표시(`barista-game` / `job-milestone`), 포트가 달라 섞이지 않습니다.
- 자동 플레이: `http://localhost:5175/?debug`에서 콘솔로 `const { autoplay } = await import('/tools/autoplay.js'); await autoplay({ episode: 'm1_spring' });`. 단골 대응은 `respond: 'best'|'ok'|'miss'|'random'`, `hint: true`(힌트 다시 보기 한 번)로 고르고, 결과의 `touch`로 신뢰 점수를 봅니다.
- **사용자가 브라우저 패널에서 직접 게임을 해 볼 때가 있습니다.** 그 탭은 다시 불러오지 말고, 시험은 새 탭(`tabs_create`)에서 합니다. 같은 저장소(`barista.v1`)를 함께 쓰므로 시험 탭에서는 콘솔로 `localStorage.setItem`을 막아 두고(그 키만), 끝나면 다시 불러와 풀어 둡니다.
- **브라우저 패널이 숨겨져 있으면 `requestAnimationFrame`이 멈춥니다.** 카드가 `is-in`을 못 받아 자동 플레이가 멈춘 것처럼 보입니다. 시험할 때만 콘솔에서 `window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16)`로 바꿔 끼우고, 시간 막대가 멈추지 않게 `document.hidden`도 false로 둡니다.
- 대사·데이터를 고친 뒤에는 **`npm run validate` → 자동 플레이 → `npm run export` → `npm run voices`** 순서로 진행합니다.

### 저장소(깃허브, 사용자 결정 2026-10-31)

- **공개** `jch4825/barista-game`(main): 게임 전체. 클라우드 세션은 이 저장소로 엽니다.
- **비공개** `jch4825/barista-game-audio`: 효과음 · 환경음 · 배경음악(사서 쓰는 팩에서 잘라 만든 것이라 공개하지 않음). 공개 저장소의 `assets/audio` 자리에 **서브모듈**로 연결. 받을 때 `git clone --recurse-submodules`(권한이 없으면 `assets/audio`가 비고 게임은 소리 없이 돎, `audio.js`가 목록 없음을 그냥 넘어감).
- 소리를 바꾸면(`npm run audio` · `npm run assets`가 `assets/audio/manifest.json`을 다시 씀): `assets/audio` 안에서 커밋 · 푸시 → 바깥에서 `git add assets/audio`로 가리키는 커밋을 바꿔 커밋 · 푸시.
- 공개에 넣지 않는 것(`.gitignore`): 다른 게임 화면 같은 남의 참고 그림(`docs/design/ref_*`), 사서 쓰는 소리(위 서브모듈만), 블렌더 자동 백업 `*.blend1`, 확인용 출력 `assets/_src/_check/`, 블렌더 렌더 원본 프레임 `assets/_src/blender/shots/*.png`(컷마다 수백 MB라 이 PC에만, 사용자 결정 2026-11-01: 게임 그림 `assets/shots/*.webp` · 자리 정보 json · 미리 보기 jpg만 올림. 다시 만들 때는 이 PC에서 렌더 → `shots_post.py`). 새 참고 그림은 `ref_`로 시작하는 이름으로 둡니다. 선생님 화면 '작업 기록'의 `assets/credits/credits.json`에는 사용자의 요청 글이 들어 있어 함께 공개됩니다.
- 이 컴퓨터에만 있는 것: 블렌더(한 컷 렌더) · Supertonic(음성) · 원본 소리 팩(`SOUND_SRC`) · Suno 배경음악 원본(`BGM/`) · 원본 직업 마1스톤(`C:\AI\game`). 그래서 `npm run voices` · `npm run audio` · 블렌더 렌더는 이 컴퓨터에서 합니다. 클라우드 세션에서 고친 것은 이 폴더에서 `git pull`(소리까지 `git pull --recurse-submodules`)로 받습니다.

## 2. 절대 원칙 (PRD 2장)

1. **변수는 숨기고, 힌트는 보이게.** 단골 신뢰 점수는 학생 화면에 나오지 않습니다. 대응 직후 짧은 반응 연출(작은 끄덕임 / 미소 / 오래 바라봄)만 나옵니다.
2. **감점 없음.** 어긋난 대응도 사람을 해치지 않습니다. 단골은 "괜찮아요" 하고 넘어갑니다. 실패 화면이 없습니다(정전 밤에도).
3. **변수는 이야기의 깊이만 바꿉니다.** 사장의 뒷받침 11장면, 계절 폭발 사건 4개, 겨울 밤 단골 8명 모임은 모든 학생에게 같습니다.
4. **규칙이 아니라 사람을 봅니다.** 맞는 대응은 사람마다 다릅니다(해순 할머니 = 기다림, 지안 = 부드러운 질문).
5. **공정한 힌트.** 대화 속에 두 번(대사 한 번, 행동 한 번). 맞는 대응은 힌트로 이유를 말할 수 있어야 합니다. 만날수록 힌트가 줄어듭니다.
6. **사장의 뒷받침은 알림 없이 숨깁니다.** 못 봐도 되고, 엔딩 '사장의 눈'에서 한꺼번에 보여 줍니다.
7. **손으로 만드는 커피.** 커피 만들기는 정답 고르기가 아니라 손으로 하는 일입니다. 실수는 그 잔의 결과로 보이고 다시 만들면 됩니다. **커피 솜씨는 단골 신뢰에 더하지 않습니다**(손이 불편한 학생이 관계에서 손해 보지 않게).
8. **3D처럼 보이는 정교한 2D**: 작업대 오브젝트는 같은 시점·같은 빛·같은 배율로, 묶음마다 한 장에 모아 요청합니다.
9. **쉬운 한국어**: 대사 한 칸은 두 문장 이내(검사기 경고), 한 칸 90자 이내. 비유와 관용 표현은 아끼고, 꼭 필요하면 `{{말 사전}}`으로. 사용자(2026-10-31): "대본을 너무 단문으로 쓰지 마라. 맥락과 힌트를 중시하라." → 짧게 끊지 말고 **이유 · 바뀐 것 · 느낌을 이어 씀**("…해서 …했다"). 대응의 힌트는 맞는 대응의 이유를 말할 수 있을 만큼 분명하게, 어긋난 뒤에는 지은의 속마음으로 배운 점을 한 줄.
10. **진단명 라벨링 금지**: 지은도 사장님도 병명·진단명으로 부르지 않습니다. 사장의 손떨림은 "손을 쉬게 한다"로 말합니다. 동정·영웅화를 하지 않습니다.
11. **접근성 회귀 금지**: 모든 조작은 `<button>`, 키보드·스캔으로 가능. 시선·행동 힌트와 반응 연출도 글과 소리로 함께 냅니다. 손 기술에는 턴 방식과 [보기]가 있습니다. 차분 모드·움직임 줄이기에서 번쩍임·흔들림을 없앱니다.
12. **타사 IP 금지**: 「커피토크」에서는 '재료를 골라 만드는 방식'과 '애매한 주문을 단서로 풀기'만 가져옵니다. 이름·화면 모양·레시피 이름·인물·그림·음악은 가져오지 않습니다. **욱일기 연상 연출 금지**(붉은 바탕 + 가운데 원 + 퍼지거나 도는 빛살). 그림 프롬프트에도 sunburst·radial rays를 넣지 않습니다.
13. **데이터는 한 파일**: 단골·대응·힌트(`js/data/regulars.js`)와 메뉴·레시피(`js/data/menu.js`)는 데이터로만 둡니다.
14. **반 친구와 순위 비교 금지**(실패를 숨기게 됨).

## 3. 재활용 규칙 (사용자 결정 2026-10-27)

- 그대로 씀: **효과음·환경음 전부**, **손님 그림**, 효과 그림(VFX), 본문 글꼴(Pretendard), 엔진.
- **배경은 새 그림으로 바꿨습니다**(사용자 결정 2026-10-28: 직업 마1스톤과 똑같아 보여서 바꿈 → 2026-10-29 새 배경 21장 넣음, 요청서 `docs/image_requests.md` 5장). 바뀐 옛 배경 11장은 `assets/_src/bg_old/`(배포에서 빠짐), 쓸 곳 없는 `living`·`office`·`tea`는 나중에 지웁니다.
- **직업 마1스톤의 주조연은 손님으로만** 나옵니다(연우·도현·점장·소라·민재·엄마·김선영 선생님·지호 + 손님들). 그림·목소리 배정(`tools/voice/voice_cast.json`)을 그대로 써서 알아보게 합니다.
- **새로 만듦**: 주인공급 인물(지은, 사장님, 단골 8명. 금 씨도 권함), **배경음악 전부**(직업 마1스톤 곡과 「The Carousel Turn」은 쓰지 않음), 작업대 오브젝트(정교한 2D).
- 배경음악 파일이 없으면 조용히 둡니다(`js/av/audio.js`). 합성 배경음악은 쓰지 않습니다.
- **배경음악은 사용자가 Suno로 만든 곡**(2026-11-01): 원본 MP3는 프로젝트의 `BGM/`(이 PC에만, `.gitignore`) → `tools/audio/audio_map.mjs`의 `S('곡 이름')` 줄 → `npm run audio`(끝 무음 자르기 · 음량 맞춤 → 비공개 `assets/audio/bgm/*.ogg`). 어느 분위기(`bgm('warm')` 등)에 어느 곡을 트는지는 `audio.js`의 `BGM_VARIANTS`(여러 곡이면 돌려 듣기), 한 번만 트는 곡은 `ONCE`. **가사가 있는 「아이에게 보내는 편지」(`letter`)는 엔딩 크레디트(`bgm('credits')`)나 오프닝에서만**(사용자 결정). 크레디트를 읽어 주는 동안은 `audio.duck(true)`로 음악을 낮춤(분위기가 바뀌면 저절로 풀림).

## 4. 구조

```
index.html            CSP: script-src 'self', connect-src 'self'(AI 면접관을 뺐으므로 밖으로 나가는 연결 없음)
css/                  base(토큰·테마·인쇄·글꼴, 메인 색 --main) · ui · screens · minigames(미니게임 틀 + 옛 미니게임 스타일 일부) · brew(작업대) · skin-sea(디자인 언어 '바닷가 밤': 위의 옛 모양 위에 덮어씀, body.skin-sea)
js/main.js            부트, nav 등록, HUD 이벤트, 에피소드 → 결과 화면 → (마지막 편이면) 엔딩 흐름, ?debug 훅(window.__jm)
js/config.js          TITLE·TITLE_SAY(소리)·TAGLINE(가칭)·SAVE_KEY('barista.v1')·WAGE_TABLE·JOB·DEFAULT_SETTINGS
js/core/              runner(비트 실행·판단·되감기·저장) · dsl · cond(onlyIf 조건) · store('barista.v1') · text · oops · assets · input · nav · bus · scale · dom
js/ui/                stage · dialogue · cards · memo · hud · overlays · vfx · emote · breathe · timer · tutor · loading · ending(엔딩 앨범 · 사장의 눈) · cg-placeholder(그림이 없는 CG 의 임시 그림, '대체 요망')
js/game/minigames/    frame(머리글·[그만하기]·도중 정리·abortGeneration) · arcade(실시간·턴 방식 고리) · brew(커피 만들기: 주문 받기 + 작업대 + 손 기술) · routine(순서대로) · lookaround(둘러보기) · tray(쟁반 나르기) · index(등록부 · 읽어 줄 문장 · 옵션 검사)
js/data/              episodes/(봄~겨울 28일 · ending · free 자유 영업) · regulars(단골 8명 · 대응 40 · 숨은 신뢰 · 앨범) · eyes(엔딩 글: 앨범 · 사장의 눈 · 크레디트) · characters(지은·사장님·단골·조연 + 직업 마1스톤 인물 = 손님) · faceboxes · portrait-svg · backgrounds(SVG) · icons · skills · tutorial · items · menu(메뉴 · 재료 · 손 동작 · 주문 도우미) · cg(장면 그림 + 임시 그림 정보) · glossary(말 사전) · photos(틀만) · credits(제작 정보 고정 글)
js/screens/           title · profile · hub(달력: 계절 × 7일 + 엔딩 · 자유 영업 · 새 해) · result(하루 끝: 오늘 만난 사람 · 오늘 만든 잔 · 일기) · notebook(수첩: 단골 · 메뉴 도감 · 장면 앨범 · 말 사전 · 일기) · settings · teacher · credits · menus · saves · records · screen
js/av/                audio(파일 우선) · tts(음성 파일 우선 + Web Speech)
tools/                serve · validate-scenarios · export-script · export-lines · run-voices · voice/ · scan-assets · autoplay · import-images.py · import-objects.py(물건 시트) · blender/(scene_bench.py 장면·렌더 · sprites_post.py 물건 그림 · shots_post.py 한 컷) · import-audio · import-movies · crop-portraits.py · face-boxes.py · export-credits · build-web
assets/               stand/(61, 지은 6·사장님 4·해순 3·지안 3 + 이전 인물·손님) · bg/(24: 새 21 + 옛 3) · cg/(7) · vfx/(16) · portraits/(13) · objects/(작업대 물건 22) · shots/(손 기술의 한 컷, 블렌더) · audio/{sfx,amb}/ · fonts/ · voice/ · _src/(원본·블렌더 장면 _src/blender, 배포에서 빠짐)
```

## 5. 시나리오 DSL (`js/core/dsl.js`)

에피소드 파일은 메타 정보 + `script: [비트…]`이고, 모든 비트는 `{ t: '종류', … }` 순수 데이터입니다.

| 분류 | 함수 |
| :--- | :--- |
| 배경·소리 | `bg(id, variant)` `bgm(mood)` `amb(kind, level)` `sfx(name)` |
| 무대 | `show({left,center,right})` `enter(slot, 'id:표정')` `leave(id)` `face(id, 표정)` `motion(id, 종류)` `camera(…)` `fx(…)` `earplugs(on)` `emote(id, kind)` `cg(id)` |
| 대사 | `say(who, [face], text)` `narr(text)` `think(text)` `sys(text)` `phone(from, text)` `guide(key, text, span)` |
| 화면 정보 | `time` `place` `big(제목, 부제)` `schedule()` `check(n)` `meet(id)` `memo(제목, [[아이콘, 글], …])` `memoHi(n)` `info(title, body)` |
| 상호작용 | `act(label, icon, sfx)` `breathe(cycles, note)`(엔진에만 남음: 2026-10-28 '숨 고르기'를 화면에서 뺌) |
| 숨은 것 · 엔딩 | `chalk(text, shaky)`(CG 칠판 위 분필 글씨, 자리는 `cg.js`의 chalk) `seen(n)`(사장님의 숨은 장면 n: 알림 없이 기록, 둘러보기 spots 의 `seen` 도 같음) `secret(who)`(단골 3단계 비밀 장면 → 엔딩 앨범 액자) `album()` `eyes()`(엔딩 화면 `js/ui/ending.js`, 글은 `js/data/eyes.js`) |
| 판단·선택 | `respond(who, touch)`(단골 대응) `decide({ … choices:[good(…), bad(…)] })` `choose({ … options:[opt(…)] })` `branch(flag, { 값: […] })` `...onlyIf(조건, 비트…)`(조건 문법: `js/core/cond.js`) |
| 미니게임 | `mini('이름', { … })` (등록부: `js/game/minigames/index.js`): `brew`(커피 만들기) · `routine`(순서대로: 가게 열기 · 혼자 열기 · 정전 준비) · `lookaround`(둘러보기: spots, 숨은 장면) · `tray`(쟁반 나르기: 서두르면 쏟음. 지은은 오른쪽에서 왼쪽 자리로 걸음, 창가 자리가 그림 왼쪽이라서. [시작!]은 화면 가운데에 크게) |
| 보상·끝 | `snap` `photo(id)` `got(item, 이름)` `stamp(skill, level)` `term(id)` `finish(title, sub)` `credits()` `letter({…})` `label` `jump` `set` `checkpoint` `wait` `end()` |

- 직업 마1스톤의 면접(`ask`·`ivStart`·`ivEnd`), 계약서(`doc…`), 근무판(`briefing`·`board`·`block`…) 비트는 지웠습니다.
- **대응 `respond('haesun', 'spring_cup2')`**(PRD 8장): 기회의 내용은 `js/data/regulars.js`에 있습니다. 장면 → 힌트 두 번 → 지은의 속마음 → 카드(볼 때마다 섞음, [힌트 다시 보기]) → 반응 연출(0 작은 끄덕임 · 1 미소 · 2 오래 바라봄) → 반응 뒤 장면. 점수는 선택 기억 `touch`(`{ '사람.기회': 점수 }`, 같은 기회는 마지막 대응)에 두고, 신뢰는 그 사람 점수의 합(0~10, `trustOf`)입니다. 조건은 `...onlyIf({ trust: { haesun: '>=4' } }, …)`. 되감기 지점을 만들지 않습니다(이어 하기 저장만). 힌트 사다리(1~2번째 대사 한 번 + 행동 한 번, 3번째부터 그 사람의 대사 없이)·맞는 대응 하나·신뢰 합 10 이하는 `npm run validate`가 검사합니다. 점수는 학생 화면에 나오지 않고 선생님 화면 '단골과의 관계'에서만 봅니다.
- **작업대(커피 만들기)**: `mini('brew', { title, level: 'easy'|'normal'|'barista', orders: [{ who, say, menu, temp?, togo?, ask?: ['temp','togo'], reply?, cup?, usual?, ticket?, thanks?, miss? }], quit?, book?, pantry? })`(PRD 6장). **주문 받기**(2026-10-31 사용자 "라테를 주문하면서 종이컵인지 머그컵인지 말하지 않는다. 테이크아웃인지 대화도 없다. 한국인은 아이스 아메리카노를 가장 많이 주문한다"): 손님이 말하지 않은 온도 · 매장/포장은 지은이 묻고(`ask`, 대답은 `reply`), 메모(온도 · 매장/포장 · 메뉴)를 되풀이한 뒤 만듦. 컵은 매장 × 온도로 정해짐(매장 · 따뜻하게 = 머그, 매장 · 아이스 = 유리컵, 포장 = 종이컵 · 플라스틱 컵). 손님 주문은 아이스 아메리카노가 가장 많고, 따뜻한 아메리카노는 겨울에도 드뭄. 단골의 '늘 먹던 거'(`usual`)는 수첩의 단골 쪽으로 기억. 메뉴·재료·손 기술·손님 반응은 `js/data/menu.js`(새 메뉴는 데이터 한 줄), 흐름·임시 그림은 `brew.js` 머리 주석. 화면은 **카운터 한 장면(포인트 앤 클릭, 2026-10-31 사용자 의견)**: 카운터 그림(`bg/workbench_morning`) 16:9 판(`.bw-set`, 칸에 꽉 채움) 위에 물건 단추(`.bw-hot`, 자리는 `brew.js`의 `HOT_POS`·`CUP_ROW` %)를 놓음. 컵을 누르면 가운데 받침(`.bw-mat`)으로, 재료 물건(에스프레소 = 머신, 물 = 주전자, 우유 · 시럽)을 누르면 넣고 다시 누르면 뺌, 얼음을 누르면 차갑게(손 띠의 온도 칸 [따뜻하게]를 누르면 그 위에 **온도 고르기 창** `openTemp`: [따뜻하게] · [차갑게], 창 밖 · Esc는 그대로 닫음, 2026-10-31 사용자). 차례는 자유이고 `arrange()`가 레시피에 맞춰 바탕 · 더하기로 나눔. 아래 손 띠(`.bw-panel[data-kind=hand]`)에 넣은 것 · [처음부터 다시] · [만들기 시작], 손님은 왼쪽 위 말풍선, 레시피 수첩은 카운터 위 공책(`.bw-book-btn`). 물건 크기는 실제 비율(머그 높이 10cm = 판 높이 9.6%). 자리의 bottom은 **물건 바닥**(이름표 `.bw-hot-name`은 그 아래에 매달림): 카운터 판(그림 아래에서 12.3~32.4%) 위에 서 있는 물건은 `BACK` 25%, 수첩은 `FRONT` 17.5%(손 띠 바로 위), 받침은 19.5%에 넓게(13.5%), 머신은 뒷줄보다 3.5% 앞(크고 무거운 물건이라 판 앞쪽, 이름표는 바로 아래). 컵 줄과 병 줄 아래 나무판. 손 기술은 카운터 위에 뜨는 **확대 창**(`.bw-close`: 이름 띠 + 블렌더 한 컷 + 오른쪽 **세로 띠**(아래부터 낮음 · 알맞아요 · 높음) + 지금 칸 · 단추, [시작!] 창도 그 안), 드리기는 큰 쟁반(카운터 왼쪽 47%) 위의 잔 · 설명은 오른쪽. 손 기술이 모자라거나 넘치면 `missShow()`: 창 흔들림 · 큰 글자 도장(앗, 연해요!) · 시무룩한 지은(넘침 = 식은땀, 모자람 = 그늘 줄) · 방울/김 · 효과음 `miss_low`·`miss_high`·`miss_sulk`·`sweat`(장난스러운 과장, 감점 없음). 연출 뒤 확대 창 아래에서 학생이 스스로 고름(2026-10-31 사용자): **[다시 하기]**(띠 · 한 컷을 비우고 그 손 기술만 바로 다시, `askRetry`·`missClear`) / [이대로 하기](그 잔의 결과로 다음 단계). 레시피가 틀리면 손님이 차분히 말하고 [다시 만들기], [이대로 하기]로 드린 잔은 손님이 결과를 말하고 [다시 만들기]/[그대로 드리기]. 자동 플레이 `__mgAuto({ miss: 1, keep? })`로 이 길을 시험. 손 기술은 실시간이면 [누르고 있기]를 누르는 동안 띠가 차오르고 떼면 정함(짧게 톡은 처음부터, 가운데 36%는 '딱 좋아요'), 턴 방식은 [한 칸]·[멈추기]. 설명 글은 `menu.js`의 `howto`(누르고 떼기)·`howtoTurn`(턴 방식). 레시피·동작 설계는 `docs/recipes.md`(✅ 한 잔 4~6동작, 동작 A~H). 손 기술의 한 컷(`assets/shots/{id}_plate`·`{id}_l00…`·`{id}_s00…` + `shots.json`의 자리·단계 수)이 있으면 `shotView`가 작업대 칸을 그 장면으로 채우고 띠 값·줄기(누르는 동안·[보기]·[한 칸] 직후)에 맞는 프레임을 겹침, 없으면 물건 그림. 결과의 `attempts`는 엔진 약속(늘 1), 드린 잔은 `served`. 손 기술 기록(`skills`)은 선생님 화면 판단 기록의 비고에 나오고, 단골 신뢰에는 더하지 않습니다(원칙 7). 확대 창의 장면 그림 = 단추(2026-10-31 사용자 "화면을 눌러도 되도록 모두"): 누르고 떼기는 그림을 꾹, 기다렸다 누르기 · 박자는 그림을 톡 = [지금!] · [톡] · [담기], 원 그리기는 그림을 꾹(저절로 돎) 또는 원을 그림, 턴 방식은 그림을 톡 = [한 칸] · [기다리기](정하는 단추는 단추만), [시작!] 창은 카드 밖을 눌러도 시작. `maker: 'owner'`(사장님이 내리는 장면, 봄 3일): [만들기 시작]에서 사장님이 먼저 살펴 다르면 만들지 않고 "재료가 조금 부족하네요." 등으로 일러 줌(`ownerCheck` · `fixNow`). **계절 손맛 단계**(2026-11-01 사용자, `frame.js` `TIMING`, `docs/recipes.md` 4장): runner 가 미니게임 옵션에 그 날의 `season`을 넣음. 봄 · 여름 = 박자 판정 띠 · 칸 2배, 가을 = 박자는 원래대로 · 띠가 차는 손 동작 1.5배 빠르게 · 쟁반 흔들림 1.3배, 겨울 = 2배 · 1.5배. 주문의 `count`(손님이 말한 잔 수, 주문 확인이 '두 잔') · `more`(앞 주문의 다음 잔, '한 잔 더'): 잔은 한 주문에 하나씩 만들고, 한 잔을 드린 뒤 단추는 [다음 주문]. 처음 만드는 한 잔은 `js/data/tutorial.js`의 `bw-` 항목이 다음에 누를 것(주문 확인 → 컵 → 재료 → 만들기 시작 → 누르고 있기)을 손가락으로 짚고, 봄 1일 첫 우유 앞에 사장님의 순서 안내 카드(`info`). `npm run validate`가 `MINIGAME_CHECKS.brew`(옵션)와 `menuProblems()`(메뉴 데이터)를 검사합니다.
- 에피소드 마지막 비트는 `end()`. 엔딩은 `EPISODES`에 넣지 않고, 마지막 막의 마지막 편(`FINALE`)을 처음 마치면 `main.js`가 엔딩으로 보냅니다.
- 새 인물 id: `jieun`(지은) · `owner`(사장님) · 단골 `haesun`(해순 할머니) · `jian`(지안) · `do`(도 씨) · `kang`(강 씨) · `han`(한 씨) · `eunju`(은주) · `sumin`(수민) · `noh`(노 씨) · 조연 `geum`(금 씨) · `actor`(배우) · `agent`(매니저) · `granddaughter`(손녀) · `han_daughter`(한 씨의 딸) · `mom2`(처음 온 엄마) · `young_fisher`(젊은 어부). 조건 `onlyIf`는 신뢰 외에 `{ warmth: '>=16' }`(마을 온기) · `{ album: 'haesun' }` · `{ pick: 'jian.summer_anything=ask_color|x' }`(고른 대응, 끝을 '|'로 비우면 '아직 안 고름'도). 그림이 오기 전에는 임시 초상(svg)으로 섭니다. 그림으로 올 표정(`look`·`shy` 등)은 `standAlias`의 값으로 적어 두면 검사기가 표정으로 인정합니다. 판단 카드·속마음의 기본 인물은 지은·사장님입니다(`runner.js`·`dialogue.js`·`export-lines.mjs`).

## 6. 자주 틀리는 것 (엔진 규칙)

- **메인 색은 초록**(사용자 결정 2026-10-28): `--main` #25844A · `--main-d` #1B5E35(`css/base.css`, 차분 모드·고대비에도 따로 있음). 새 화면·버튼은 `var(--main)`과 `.btn-main`을 씁니다. 빨강 `--red`는 경고·틀림 표시(시간 막대 경고, 틀린 칸, 주의 상자)에만 씁니다. 인물 색이 없을 때의 강조색 기본값도 `var(--main)`입니다.
- **디자인 언어 '바닷가 밤'**(사용자 결정 2026-10-28, `css/skin-sea.css`, `docs/review.md` 6장): 짙은 바다색 판(`--plate`) + 가는 금색 이중 테두리(`border` + 안쪽 `outline`) + 금색 명조 제목(`--font-title`) + 부드러운 그림자. 대화창·카드·창 안의 긴 글은 밝은 종이(`--parch`)에 둡니다. 고른 것은 밝은 띠(`--plate-hi`) + 티스푼 + 굵은 테두리로, 색만이 아니라 모양으로도 알립니다. 검은 굵은 테두리·딱딱한 그림자(`8px 8px 0`)·기울인 카드·테이프·도장은 옛 '마일스톤 팝' 모양이라 새 화면에 쓰지 않습니다. 새 화면을 만들면 `skin-sea.css`에도 규칙을 더하고, 차분 모드(`.theme-calm`)·고대비(`.contrast`)에서도 확인합니다. 빛살·해 문양은 쓰지 않습니다.
- **화면 움직임·조작**(사용자 요청 2026-10-28):
  - 선택 카드는 위아래로 놓인 반투명 단추(`.cards` 세로, 한 줄씩 미끄러져 등장, fill `backwards`라 끝난 뒤 `.fade`·`.good`이 먹음).
  - 이야기 위쪽 띠(HUD)는 48px 반투명 알약 띠, 단추는 아이콘 + 글자를 가로로. 누르는 자리는 `::before`로 넓힘.
  - 위쪽 띠·멈춤의 [레시피]는 `showRecipeBook()`(`brew.js`)을 엶. 작업대가 열려 있으면 작업대 안의 수첩을 엶.
  - 성공 연출은 `ov.cutin`(`.ov-success`, `sc-*`): 「메타포: 리판타지오」의 움직임 느낌만 참고하고, 그 게임의 글자·문양·그림·소리는 쓰지 않음. 빛살은 금지이고, 조각은 띠와 같은 한 방향으로만 흐름. 차분 모드·움직임 줄이기는 `.still`로 움직임 없이 보임.
  - 단골 대응의 반응 연출은 크게 만들지 않음(원칙 1).
  - 대화창은 장면에 녹아드는 바닥 그늘(2026-10-31 사용자 의견 '아래 띠가 따로 있어 어색하고 게임 같지 않다'): 판 · 테두리 없이 `.dlg` 배경이 아래로 갈수록 짙어지고, `::after`가 띠 위 160px를 투명에서 띠 색으로 이어 줌(누름은 통과). 이름은 띠 안 왼쪽 위의 금색 글 + 인물 색 밑줄, 얼굴은 이름 앞 작은 동그라미, [다시 듣기 · 지난 대화 · 자동]은 오른쪽 위의 작은 알약. 종류는 그늘 색 `--dlg-rgb`와 밑줄 모양(속마음 = 점선)으로 구별. 왼쪽 `::before`의 커피 김과 향기 문양은 그대로.
  - 감성적인 대사·상황마다 이벤트 CG `cg('id')`를 화면 전체에 둠(사용자 결정 2026-10-28, `assets/cg/cg_{id}.jpg`, id는 `js/data/cg.js`에 등록해야 검사 통과). 그림이 없으면 건너뛰고 앞 CG가 이어짐. 단골 대응은 `regulars.js`에서 scene 끝 = 힌트 CG, 점수 2의 after 맨 앞 = 그 장면만의 CG, 모든 선택지의 after 맨 끝 = `cg(null)`(무난·어긋남은 힌트 CG가 이어져 CG 유무로 점수가 드러나지 않음, 검수 R-25). CG는 배경 층 안이라 떠 있는 동안 `fx`·카메라 확대가 먹지 않게 해 둠(`ui.css`). 요청서는 `docs/image_requests.md` 6장.
- `h()`의 style 객체에서 `--변수`는 `setProperty`로 처리되어 있습니다(그냥 대입하면 안 먹음).
- 입력창에서 Enter로 다음 화면에 넘어갈 때는 `preventDefault()`, 다음 버튼 포커스는 지연시킵니다.
- 오버레이와 화면을 열면 `input.pushScope`, 닫으면 `popScope`. 지워진 창의 범위는 `input.js`가 건너뛰지만, 정상 닫기에서는 꼭 `popScope`합니다.
- 비동기 화면 조작 뒤에 이야기를 이어 갈 때는 runner의 `w()`로 감쌉니다(되감기 뒤 이전 작업이 화면을 건드리지 않게 하는 epoch 검사).
- **미니게임 정리**: 되감기·나가기·[그만하기]는 `abortMinigame()`을 부릅니다. 새 미니게임은 `f.onAbort(…)`로 고리·막대·방향키를 멈추고, 대사·잠깐 쉬기를 기다리는 곳에서는 `abortGeneration()`을 받아 두었다가 기다린 뒤 달라졌으면 그만둡니다(2026-10-27 버그 고침: 정리된 뒤 늦게 끝난 기다림이 다음 장면에 대사·아차를 띄우던 문제).
- **목소리를 자르지 않기**(2026-10-31 사용자 의견 '음성 진행 중 다음으로 넘어가 말이 끊어진다'): 대사는 목소리가 나오는 동안 누르면 '말이 끝나면 넘어가요'로 받아 두고 끝난 뒤 넘김, 한 번 더 누르면 바로 넘김(`dialogue.js` `setQueued`). 작업대에서 게임이 스스로 다음 단계로 갈 때의 말은 `talkAfter`(지금 읽는 한 문장은 끝까지), 학생이 누른 것에 답하는 말은 `talk`(`brew.js`). 순서대로(`routine.js`)는 마지막 일 뒤에 저절로 닫지 않고 아래에 큰 단추([오픈 준비 완료] · [마감 완료] · [준비 완료], `ROUTINES`의 `finish`)를 띄워 학생이 눌러 마침: 누르면 효과음만, 목소리가 아직 나오면 그 말이 끝난 뒤 닫고 한 번 더 누르면 바로(2026-11-01 사용자: 마지막 말을 읽다가 끊겨 버그 같음).
- 화면 가득한 장면 미니게임(`frame({ cls: 'mg-scene …' })`: 쟁반 · 둘러보기 · 순서대로)이 열린 동안은 `body.mg-scene-open`으로 앞 대사의 대화창을 숨김(대화창이 아래 단추를 가리고 누름을 가로채던 버그, 2026-10-31). 작업대는 `body.brew-open`.
- 시간 막대(`js/ui/timer.js`)는 한 번 멈추면 다시 시작하지 않고, 화면에서 사라지면 스스로 멈춥니다. 카드는 `cards.close()`가 막대·숫자키·입력 범위를 정리합니다.
- Electron에서는 `window.prompt` 대신 `ov.prompt()`. 확인 창(`ov.confirm`·`ov.prompt`)은 맨 위 층 `#layer-modal`.
- 끝 장면이 투명한 CSS 애니메이션(`forwards`)은 움직임 줄이기에서 아예 안 보입니다. `body.reduce-motion … { animation: none !important; }`로 멈춰 두고 타이머로 지웁니다.
- 코드에 `tts.speak('새 문장')`을 넣으면 음성 파일이 없어 브라우저 음성으로 읽힙니다. 같은 문장을 `export-lines.mjs`의 `EXTRA`(또는 미니게임 `xxxLines()`)에 넣고 `npm run voices`.
- 프로필에 목록·기록처럼 합쳐야 하는 새 칸(신뢰·앨범·몇 번째 해 등)을 만들면 `normalizeProfile`·`mergeProfiles`(`store.js`)에도 넣습니다.
- 새 그림 종류·폴더를 만들면 `js/ui/loading.js`의 `warmAll` 목록에도 넣습니다.
- 숫자 읽기: `speakable()`이 소리 나는 대로 바꿉니다. 새 단위 명사가 나오면 `js/core/text.js`의 `sayNumbers()` 고유어 목록에 넣습니다.

## 7. 에셋

- **작업대 물건**: ✅ 앞으로는 블렌더로 미리 렌더(2026-10-28, `docs/recipes.md` 6장). 블렌더 창의 MCP가 연결되지 않아도, Steam의 블렌더 5.2.3(`C:\Program Files (x86)\Steam\steamapps\common\Blender\blender.exe`)을 창 없이 돌립니다: `blender --background --factory-startup --python tools/blender/scene_bench.py -- C:/AI/game3/assets/_src/blender <preview|full|bg|sprites|extract|all>`(출력 폴더는 절대 경로로: 상대 경로면 렌더 그림이 `C:ssets\…`로 감) → 물건 그림 `python -X utf8 tools/blender/sprites_post.py assets/_src/blender/sprites assets/_src/blender/sprites_game`(그림자째 4:3·1:1 아래 맞춤). 물건 그림은 게임 그림 목록에 아직 넣지 않음. ✅ 작업대는 **손 동작마다 한 컷**(Q-R9, 2026-10-29): `scene_bench.py … shots`(배경판 + 잔이 차오르는 13단계 × 줄기 있음/없음) → `python -X utf8 tools/blender/shots_post.py assets/_src/blender/shots assets/shots` → `npm run assets`(`images.json`의 `shots`) → `npm run credits`. 지금은 샷 내리기(`extract`, 잔이 참)·우유 데우기(`steam`, 피처 속 우유 + 집게 온도계 바늘 + 김)·붓기(`pour` → `pour_milk`·`pour_latte`, 배경판 `pour_plate` 하나, 라테는 하트 프레임 `pour_latte_a…`). 붓기는 컵 안에 에스프레소(디카페인 포함)가 있으면 라테 컷. 거품 내기(`foam`, 피처 속 우유가 부풀어 오름)까지 손 기술 넷이 모두 컷. **물 붓기**(`water`, 아메리카노: 에스프레소가 든 머그에 드립 주전자로 뜨거운 물, 크레마가 흩어짐)도 컷이고, 손 동작(누르고 있다가 떼기, 알맞아요 0.69~0.94)이면 띠 값만큼 차오르고, 저절로 넣는 단계면 띠 · 단추 없는 확대 창에서 저절로 차오름(`autoShot`). 아이스(유리컵, 밝은 컵받침 위)는 얼음 담기(`ice`, 0~8개: 박자마다 쌓여 0 → 3 → 5 → 8개, 적어요면 절반쯤에서 멈춤) · 찬물 붓기(`water_glass`) · 우유 붓기(`pour_glass_milk` · `pour_glass_latte`, 배경판 `pour_glass_plate`, `docs/recipes.md` 6.7). 어떤 컷을 쓸지는 `brew.js`의 `shotIdFor`(잔 · 온도 · 안에 든 것): 이름 규칙 `pour{잔}_{latte|milk|색}` · `water{잔}` · `ice{잔}`(잔 = 머그는 없음 · `_glass` · `_paper` · `_plastic`, 잔과 온도가 맞을 때만), 그 밖의 손 동작은 손 동작 id 와 같은 이름. 이 이름으로 컷을 더 만들면 코드를 고치지 않아도 씀. 포장 컵 · 음료 색 컷(`docs/recipes.md` 6.8, 검수 13.12): 종이컵(따뜻하게, 크라프트 슬리브, 머그처럼 위에서) `water_paper` · `pour_paper_{milk,latte,matcha,cocoa}`, 길쭉한 플라스틱 컵(차갑게, 유리컵처럼 앞에서, 얼음 24개) `ice_plastic` · `water_plastic` · `pour_plastic_{milk,latte,strawberry,matcha,cocoa}`, 음료 색만 바꾼 붓기 `pour_{matcha,cocoa}` · `pour_glass_{strawberry,matcha,cocoa}`. 피처에 우유 붓기(`milk_in`, 우유병 → 피처 안쪽 눈금 선) · 피처 톡톡(`tap`, 굵은 거품이 톡마다 사라짐)도 컷(`docs/recipes.md` 6.9). 남은 손 동작도 모두 컷(`docs/recipes.md` 6.10): 원두 갈기 `grind` · 꾹 누르기 `tamp` · 물 끓이기 `boil`(뚜껑 온도계) · 손으로 원두 갈기 `hand_grind` · 뜸 붓기 `bloom` · 뜸 들이기 `bloom_wait` · 나선 붓기 `spiral`, 컵에 넣기 · 젓기 · 우리기는 `{동작}[_iced][_{바탕}]`(따뜻한 잔 = 위에서 본 머그, 아이스 = 앞에서 본 유리컵, 믹스커피 젓기만 종이컵 `stir_paper_mix`): 시럽 · 청(유자 · 딸기) · 가루(코코아 · 말차) · 말차 풀기(대나무 차선) · 젓기 · 우리기(보리차 티백). 에스프레소가 없는 잔의 물 붓기는 `water{잔}_{바탕}`(보리차 · 유자차 · 믹스커피). 기다렸다 누르기는 기다리는 동안 줄기 프레임(갈리는 가루 · 김), 정하면 멈춘 프레임. 하나만 다시 만들 때는 셋째 인자로(`… shots steam`), 구도만 볼 때는 `shots_preview`. 지금 도구는 Flow로 만든 시트(4칸 × 3줄, 크로마키 초록, 마지막 칸 비움)를 `assets/_src/objects/sheet_tools.jpg`·`sheet_cups.jpg`로 두고 `npm run objects`. 칸 순서와 ID는 `tools/import-objects.py`의 `SHEETS`와 `docs/image_requests.md` 2장이 같아야 합니다. 그림이 없는 물건은 `brew.js`의 임시 그림(SVG)으로 섭니다.
- **그림**: 원본을 ID 이름으로 `assets/_src/{stand,vfx,items,photos}/`에 두고 `npm run images`(배경 지우기·자르기 → WebP). 원래 파일 이름은 `assets/_src/SOURCES.md`, 출처 표는 `assets/CREDITS.md`. 스탠딩을 넣은 뒤에는 `python tools/face-boxes.py`. 팔과 몸 사이에 흰 바탕이 남으면 `--check`로 좌표를 보고 `POCKETS`에 적습니다.
- **배경·장면 그림**: 배경은 `assets/bg/{id}.jpg`, CG는 `assets/cg/cg_{id}.jpg`에 2K 그대로 두고 `npm run assets`(원래 이름은 `assets/bg/SOURCES.md`). 대본은 `bg('hall', 'spring')` → `hall_spring.jpg`. 새 장소 id는 `js/data/backgrounds.js`의 `PHOTO_SCENES`에 더합니다(검사기가 id를 알고, 그림이 없을 때 비슷한 임시 그림으로 섬). 메뉴 뒤 그림은 `skin-sea.css`의 `.scr`(밤바다 `ui_sea_night`, 멈춤·지난 대화·되감기는 `ui_cafe_dim`). Flow가 2026-10-29부터 파일 이름에 시각을 넣지 않아 받은 시각을 SOURCES 표의 비고에 적습니다(`export-credits`가 읽음).
- 새 그림을 넣으면 `tools/credits/image_prompts.mjs`에 제작 프롬프트를 한 줄 더하고 `npm run credits`.
- **소리**: 사용자가 Humble Bundle에서 산 팩(`C:\AI\sound effect assets`, 환경 변수 `SOUND_SRC`)에서 `tools/audio/audio_map.mjs` 대응표대로 잘라 넣습니다(`npm run audio`). 원본 WAV는 프로젝트에 복사하지 않습니다. 판매 페이지에 AI 관련 금지 조건이 있는 팩은 쓰지 않습니다.
- **음성**: `tools/voice/voice_cast.json`(인물 → Supertonic 목소리) → `npm run voices`. Supertonic 위치 `C:\AI\supertonic3-local-tts-20260520-r2\supertonic3-local-tts`(`SUPERTONIC_DIR`). 새 인물에게는 새 목소리를 배정합니다(2026-10-28 임시: 지은 F3 · 사장님 M3 · 해순 F4 · 지안 F5. Supertonic 목소리가 10개뿐이라 옛 인물과 겹치고 속도로 구분하므로 들어 보고 정합니다).
- **글꼴**: 게임에 넣은 OFL 글꼴만. 본문 Pretendard, 제목 **함렛 Hahmlet**(가변 100~900, 2026-10-28 사용자 결정, `assets/fonts/HahmletVariable.ttf`). 함렛의 한글은 2,788자(KS X 1001 2,350자 모두)라 없는 글자는 Pretendard로 나옵니다. 새 글꼴은 받기 전에 파일 이름·출처·크기를 말하고 허락을 받고, 받은 뒤 cmap으로 글자 범위를 확인합니다(Google Fonts 목록의 unicode-range는 실제 글자 수가 아님).
- 처음 화면의 'AI로 만든 그림·음성·음악을 씁니다'(`AI_NOTICE`)는 지우지 않습니다. 학생 이름은 본명 대신 별명을 쓰도록 안내합니다.

## 8. 작업 방식 (사용자 선호)

- 큰 단계를 마칠 때마다 무엇을 했는지 중간 보고합니다. 결정이 필요한 것(설정·인물·감정 장면·그림)은 PRD의 Q 번호나 검수 문서의 '검수 포인트'로 묻습니다. 검수 문서는 `docs/review.md`로 만듭니다(`npm run credits`가 이 파일을 '작업 기록' 탭으로 읽음).
- 사용자는 설계를 붙여 넣어 지시할 때가 많습니다. 설계에 없는 것은 🙋 제안으로 표시하고, 사용자가 정한 것(✅)과 섞지 않습니다.
- 그림·음악은 사용자가 만들거나 사서 넣습니다. 필요하면 요청서(프롬프트·규격)를 만듭니다. 생성 그림은 필요한 모습을 **한 장에 모두** 요청합니다(따로 만들면 얼굴·크기가 흔들림).
- 공개 배포(웹판 정식 배포, 공개 주소)는 사용자 허락 뒤에만 합니다. 소스 저장소는 공개로 두기로 함(2026-10-31, 1장 '저장소').
