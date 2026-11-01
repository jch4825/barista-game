/**
 * 게임 소리 ← 사운드 팩 대응표 (tools/import-audio.mjs 가 읽음)
 *
 * 원본: 사용자가 구매한 사운드 팩 폴더(SOUND_SRC, 기본 C:\AI\sound effect assets). 원본은 프로젝트에 복사하지 않고,
 *       잘라 내고 음량을 맞춘 .ogg 만 assets/audio/ 에 둡니다(원본을 그대로 내려받을 수 없게).
 * 고르는 기준: 파일 설명·이름 + 길이·음량·밝기·음높이 흐름 분석(소리는 사람이 들어 보고 확정합니다).
 * 바꾸는 법: src 만 고치고 `npm run audio` → 게임에 바로 반영. 줄을 지우면 그 ID 는 합성음으로 돌아갑니다.
 *
 * 항목: id, kind(bgm·sfx·amb), src | layers[{src, at초, gain dB, rate, trim}] | repeat{src, times, every초, gains[], rate, trim}
 *       trim [시작, 끝](초) · fadeIn · fadeOut · lowpass · highpass · loop(이음매 크로스페이드 초) · loopInput(입력 반복 횟수)
 *       target { lufs } 또는 { peak }(dBFS) · bitrate · keepSilence · note(왜 골랐는지)
 *       배경음악(bgm)은 use(게임에서 쓰는 곳) · track(곡 이름)도 적음 → 선생님 모드 '제작·저작권 정보'(tools/export-credits.mjs)
 */

// 2026-10-16: Ambient Puzzle 팩(ambientpuzzlemusicsfxpack)은 제작자가 'AI로 만든 프로젝트에 쓰지 말라'고 해서 빼고 아래 Ovani·VN 소리로 바꿈
const OVA = 'OVANI/Air Sound FX Pack/Air/';
const AC = 'Anime Comedy Sound Effect Pack/';
const CY = 'Cyberleaf-RetroSFXs/';
const IS = 'interfaceanditemsounds/';
const TW = 'userinterfacesoundfxscifitech/';
const VN = 'visualnovelanimemusicpack_v2/WAV/';
const OVV = 'OVANI/Vehicles Heavy Sound FX Pack/Vehicles Heavy/'; // 버스(2026-11-01)
const AIM = 'BGM/'; // 저작자가 AI 음악 모델로 만든 배경음악(프로젝트의 BGM/ 폴더)
// AI 음악은 곡마다 만든 모델을 적음(entry 의 pack). 지금 곡은 모두 Suno(2026-11-01 사용자). Gemini로 만든 곡이 오면 Gemini 팩을 더함
const SUNO = 'ai:suno';

/**
 * 팩 정보 (CREDITS.md · 선생님 모드 '제작·저작권 정보')
 * 모두 사용자가 Humble Bundle에서 구매(사용자 구매 내역 2026-10-16 확인): GameDev Market 묶음 2개(GameDev Market Pro 라이선스) · Ovani Sound 묶음.
 * 팩 안에 작곡가 표기가 없는 것은 판매 페이지에서 찾아 적음. bundle: 구매한 묶음 · ai: 판매 페이지의 AI 관련 조건
 * 배경음악에만 쓰던 팩(Ovani Fantasy Music Pack Vol. 4 · Environmental Ambiences Vol. 2)과 「The Carousel Turn」(AI 음악)은 2026-10-27 뺌
 */
const HB21 = 'Humble Bundle「Music & Sound Effects for Games, Films, and Content Creators Bundle Part 2」(2021-07-29 구매)';
const HB22 = 'Humble Bundle「SFX and Music for Your Games」(2022-08-28 구매)';
const HB24 = 'Humble Bundle「Audio Arcade: The Definitive Collection of Music and Sound FX from Ovani Sound」(2024-07-15 구매)';
const GDM = 'GameDev Market Pro 라이선스';
const OVL = 'Ovani Sound 로열티 프리 라이선스(ovanisound.com/policies/terms-of-service, 출처 표기는 선택)';
const OVAI = '약관은 AI 학습에 쓰는 것만 금지. AI로 만든 프로젝트에 쓰는 것은 막지 않음';
export const PACKS = {
  [VN]: {
    name: 'Visual Novel / Anime Music Pack v2', author: 'Audios With Love', composer: 'Audios With Love',
    composerNote: 'Audios With Love는 판매 페이지에 적힌 제작자 이름입니다. 작곡가 개인 이름은 공개되어 있지 않습니다.',
    license: GDM, bundle: HB22, ai: '판매 페이지에서 AI 관련 조건을 찾지 못함',
  },
  [OVA]: { name: 'Air Sound FX Pack', author: 'Ovani Sound (ovanisound.com)', license: OVL, bundle: HB24, ai: OVAI },
  [AC]: { name: 'Anime Comedy Sound Effects Pack', author: 'W.O.W Sound (wowsound.com)', license: GDM, bundle: HB21 },
  [CY]: { name: 'Retro SFXs', author: 'Andrea Baroni · Cyberleaf Studio (andreabaroni.com)', license: `${GDM}(출처 표기는 선택)`, bundle: HB21 },
  // 만든 곳: Humble 다운로드 페이지 표기(사용자 확인 2026-10-16). 썸네일의 '320'이 우리 팩의 소리 개수(320개)와 같음
  [IS]: { name: 'Interface & Item Sounds (320개, V1~V3)', author: 'GameDev Market', license: GDM, bundle: HB21 },
  [TW]: { name: 'User Interface Sound FX - Scifi & Tech', author: 'TomWinandySFX (tomwinandy.com)', license: GDM, bundle: HB21 },
  [OVV]: { name: 'Vehicles Heavy Sound FX Pack', author: 'Ovani Sound (ovanisound.com)', license: OVL, bundle: HB24, ai: OVAI },
  /* 2026-11-01 사용자: "AI로 만든 음악은 꼭 자를 필요도, 따로 올려서 저작권을 보호할 필요도 없다. 전부 저작자가 만든 음악이므로
   * SUNO나 Gemini 음악 모델로 만든 것이라는 것만 명시하면 된다."
   * 사용자(같은 날 고침): "Rising Glow, Galactic Waltz, Untitled, Across the Horizon 모두 SUNO로 만든 곡이야." → 지금 곡은 모두 Suno
   * 가사가 있는 「아이에게 보내는 편지」는 엔딩 크레디트나 오프닝에서만(사용자) */
  [SUNO]: {
    name: 'Suno로 만든 곡', author: '이 제품의 저작자', composer: '저작자가 Suno(AI)로 만듦',
    license: '저작자가 만든 곡', bundle: '', ai: 'AI로 만든 음악(Suno)',
  },
};

const V = (name) => `${VN}${name}.wav`;
const S = (name) => `${AIM}${name}.mp3`;

export const AUDIO_MAP = [
  /* ---------------- 배경음악 ----------------
   * 새 게임은 배경음악을 모두 새로 넣습니다(2026-10-27 사용자: 직업 마1스톤 곡과 「The Carousel Turn」은 쓰지 않음).
   * 새 곡은 { id, kind: 'bgm', src, use, track, … } 로 여기에 더하고, 쓰는 팩을 PACKS 에 적습니다.
   * 2026-11-01 저작자가 AI 음악 모델로 만든 곡(모두 Suno, 한 곡에 두 판씩: _a · _b). 어느 분위기에 무엇을 트는지는 js/av/audio.js 의 BGM_VARIANTS.
   * 고른 기준: 곡 페이지의 스타일 글 + 길이 · 음량 · 밝기 · 조 분석(사람이 들어 보고 확정). 끝의 무음만 잘라 내고 음량을 맞춤 */
  { id: 'glow_a', kind: 'bgm', pack: SUNO, src: S('Rising Glow'), track: 'Rising Glow', use: '처음 화면 · 엔딩 · 한 해의 마지막 마감', trim: [0, 320.1], fadeOut: 1.5, target: { lufs: -18 }, note: '「Rising Glow」(다장조, 5분 20초): 스타일 "tranquil and hopeful · harp · cello · slow tempo with piano · warm". 고르고 차분해(음량 폭 5.9) 처음 화면과 엔딩에 같은 곡(한 해를 여닫는 곡)' },
  { id: 'glow_b', kind: 'bgm', pack: SUNO, src: S('Rising Glow (1)'), track: 'Rising Glow (2)', use: '아침(가게 열기 전)', trim: [0, 256.4], fadeOut: 1.5, target: { lufs: -18 }, note: '「Rising Glow」의 다른 판(내림마장조, 더 밝음 1063Hz) → 해 뜨는 아침' },
  { id: 'waltz', kind: 'bgm', pack: SUNO, src: S('Galactic Waltz'), track: 'Galactic Waltz', use: '일하는 카페 · 하루 끝(결과 화면)', trim: [0, 173.6], fadeOut: 1, target: { lufs: -19 }, note: '「Galactic Waltz」(내림마장조 왈츠): "grand piano · classical · start with simple rhythm · growing fast tempo · grand ending" → 손님이 오가는 낮의 카페, 하루를 마친 결과 화면' },
  { id: 'ballad_a', kind: 'bgm', pack: SUNO, src: S('Untitled'), track: 'Untitled', use: '따뜻한 장면 · 일기(돌려 듣기 1)', trim: [0, 226.2], fadeOut: 1.5, target: { lufs: -19 }, note: '이름 없는 곡(다장조): "ballad · piano pop", 아주 부드러움(밝기 609Hz) → 단골의 마음 · 마감 · 일기' },
  { id: 'ballad_b', kind: 'bgm', pack: SUNO, src: S('Untitled (1)'), track: 'Untitled (2)', use: '따뜻한 장면(돌려 듣기 2) · 첫날 밤의 작은 방', trim: [0, 200.4], fadeOut: 1.5, target: { lufs: -19 }, note: '같은 곡의 다른 판(다단조, 더 조용함 -16.6 LUFS) → 조금 쓸쓸한 따뜻함, 낯선 마을의 첫날 밤' },
  { id: 'horizon_a', kind: 'bgm', pack: SUNO, src: S('Across the Horizon'), track: 'Across the Horizon', use: '계절의 큰 사건(돌려 듣기 1)', trim: [0, 141.4], fadeOut: 1, target: { lufs: -19 }, note: '「Across the Horizon」(가단조): "soundtrack · cinematic · orchestral", 조용히 시작해 커짐(음량 폭 12) → 촬영 · 줄 · 큰 사건' },
  { id: 'horizon_b', kind: 'bgm', pack: SUNO, src: S('Across the Horizon (1)'), track: 'Across the Horizon (2)', use: '계절의 큰 사건(돌려 듣기 2) · 가을 축제', fadeOut: 3, target: { lufs: -19 }, note: '같은 곡의 다른 판(사단조, 3분 14초로 더 길게 쌓임) → 위기 넷이 겹치는 가을 축제' },
  { id: 'chant_a', kind: 'bgm', pack: SUNO, src: S('그레고리안 찬송가'), track: '그레고리안 찬송가', use: '정전 밤(돌려 듣기 1)', trim: [0, 158.4], fadeOut: 1.5, target: { lufs: -20 }, note: '「그레고리안 찬송가」(바장조): "그레고리안 찬트 · 찬송가 · 무거운" → 폭설로 마을 불이 꺼지고 촛불을 켜는 밤' },
  { id: 'chant_b', kind: 'bgm', pack: SUNO, src: S('그레고리안 찬송가 (1)'), track: '그레고리안 찬송가 (2)', use: '정전 밤(돌려 듣기 2)', trim: [0, 114.4], fadeOut: 1.5, target: { lufs: -20 }, note: '같은 곡의 다른 판(가단조, 1분 54초)' },
  { id: 'letter', kind: 'bgm', pack: SUNO, src: S('아이에게 보내는 편지 (Remastered)'), track: '아이에게 보내는 편지 (Remastered)', use: '엔딩 크레디트(가사가 있는 곡이라 여기서만, 한 번만)', trim: [0, 198.0], fadeOut: 2, target: { lufs: -18 }, note: '가사가 있는 노래(여성 목소리 · 발라드): 사용자 결정으로 엔딩 크레디트 · 오프닝에서만 → 이야기 중에는 대사와 겹치므로 크레디트에서만 한 번 틂' },

  /* ---------------- 환경음(버스, 2026-11-01) ---------------- */
  { id: 'bus', kind: 'amb', src: `${OVV}Diesel/Diesel Engine Interior Loop.wav`, loop: 1.5, lowpass: 3200, target: { lufs: -26 }, bitrate: '64k', note: '디젤 엔진 실내 소리(19초 반복) → 바닷가로 가는 버스 안' },

  /* ---------------- 환경음 ----------------
   * 매장 웅성거림(amb/cafe)은 2026-10-11부터 쓰지 않다가 2026-10-16 파일째 지움(사용자). 옛 저장에 남아 있어도 audio.js 가 틀지 않음 */
  {
    id: 'crowd', kind: 'amb', loop: 3, trim: [0, 46], lowpass: 6000, target: { lufs: -23 }, bitrate: '64k',
    layers: [
      { src: `${IS}V2.0 Files/Humam Mumble [loop] (1).wav`, at: 0, gain: 0, loopInput: 4 },
      { src: `${IS}V2.0 Files/Humam Mumble [loop] (2).wav`, at: 3, gain: 0, loopInput: 4 },
      { src: `${IS}V2.0 Files/Humam Mumble [loop] (1).wav`, at: 7, gain: -2, rate: 1.07, loopInput: 4 },
      { src: `${IS}V2.0 Files/Humam Mumble [loop] (2).wav`, at: 9.5, gain: -2, rate: 0.93, loopInput: 4 },
    ],
    note: '웅성거림 4겹(높낮이를 조금씩 바꿈) → 여러 사람 목소리가 겹치는 피크타임',
  },
  {
    id: 'home', kind: 'amb', loop: 2, target: { lufs: -34 }, bitrate: '48k', brownNoise: { seconds: 32, gain: -42, lowpass: 350 },
    repeat: { src: `${IS}V1.0/MISC/Countdown (5) Tick.wav`, times: 32, every: 1, gains: [0, -4] },
    note: '시계 초침(1초마다, 똑-딱 세기 차이) + 아주 작은 방 소음',
  },

  /* ---------------- 화면 조작(UI) ---------------- */
  { id: 'tap', kind: 'sfx', src: `${IS}V1.0/Interface/Pops/Pop (6).wav`, target: { peak: -12 }, note: '짧고 둥근 팝' },
  { id: 'next', kind: 'sfx', src: `${IS}V1.0/Interface/Pops/Pop (4).wav`, target: { peak: -24 }, note: '대사 넘김: 아주 작게' },
  { id: 'focus', kind: 'sfx', src: `${IS}V1.0/MISC/Prize Wheel Spin 1 (tick).wav`, target: { peak: -22 }, note: '작은 틱' },
  { id: 'good', kind: 'sfx', src: `${AC}Events/AC_Correct_Answer_01v1.wav`, trim: [0, 1.4], fadeOut: 0.4, target: { peak: -8 }, note: '정답(설명: positive · right answer), 음이 올라감' },
  { id: 'great', kind: 'sfx', src: `${AC}Events/AC_Correct_Answer_02.wav`, trim: [0, 2.0], fadeOut: 0.5, target: { peak: -6 }, note: '한 번에 정답: 반짝이는 차임' },
  { id: 'hint', kind: 'sfx', src: `${AC}Chimes and Bells/AC_Thought_Bubble_Chime.wav`, trim: [0, 2.2], fadeOut: 0.6, target: { peak: -10 }, note: '생각 풍선 차임(올라감) → 도와주세요·힌트' },
  { id: 'stamp', kind: 'sfx', src: `${AC}Misc/AC_Drum_Hit_Single.wav`, target: { peak: -5 }, note: '낮고 둥근 북 한 번 → 도장 쿵' },
  { id: 'page', kind: 'sfx', src: `${IS}V1.0/MISC/Book Page (1).wav`, target: { peak: -12 }, note: '책장 넘기기' },
  { id: 'whoosh', kind: 'sfx', src: `${AC}Whooshes Swishes Slides Transitions/AC_Fast_Swish_01.wav`, target: { peak: -14 }, note: '짧은 바람 소리' },
  { id: 'open', kind: 'sfx', src: `${OVA}Whooshes/Air Whoosh Tiny B.wav`, fadeOut: 0.08, target: { peak: -14 }, note: '밝고 짧은 바람 소리(0.55초, 살짝 부풀었다 사라짐) → 창 열기(2026-10-16 교체)' },
  { id: 'close', kind: 'sfx', src: `${OVA}Whooshes/Air Whoosh Tiny C.wav`, fadeOut: 0.08, target: { peak: -15 }, note: '열기보다 조금 낮은 짧은 바람 소리(0.78초, 바로 줄어듦) → 창 닫기(2026-10-16 교체)' },
  { id: 'heart', kind: 'sfx', src: `${AC}Chimes and Bells/AC_Dreamy_Bell_02v2.wav`, trim: [0, 2.5], fadeOut: 0.8, target: { peak: -10 }, note: '맑은 종(positive · dream)' },
  { id: 'coin', kind: 'sfx', src: `${IS}V1.0/Items & Collectables/Coins (8).wav`, target: { peak: -10 }, note: '동전' },
  { id: 'cheer', kind: 'sfx', src: `${IS}V1.0/MISC/You Win (3).wav`, target: { peak: -8 }, note: '짧은 승리 음악(말소리 없음 확인)' },
  { id: 'breathIn', kind: 'sfx', src: `${AC}Chimes and Bells/AC_Dreamy_Chimes_01_Slow.wav`, trim: [0, 4], fadeIn: 0.3, fadeOut: 1.0, lowpass: 7000, target: { peak: -16 }, note: '천천히 올라가는 차임 4초(고음을 조금 깎아 부드럽게)' },
  { id: 'breathOut', kind: 'sfx', src: `${AC}Chimes and Bells/AC_Dreamy_Chimes_03_Descending.wav`, trim: [0, 4], fadeIn: 0.2, fadeOut: 1.2, lowpass: 7000, target: { peak: -16 }, note: '천천히 내려가는 차임 4초' },

  /* ---------------- 징글 ---------------- */
  { id: 'jingle_complete', kind: 'sfx', src: `${IS}V1.0/MISC/You Win (5).wav`, trim: [0, 4], fadeOut: 1.0, target: { peak: -5 }, note: '팡파르(말소리 없음) 4초' },
  { id: 'jingle_badge', kind: 'sfx', src: V('Jingle_PositiveEvent_01'), target: { peak: -4 }, note: '배경음악과 같은 작곡가의 좋은 일 징글(4.7초) → 정규 크루 배지(한 번뿐인 큰 순간, 2026-10-16 교체)' },
  { id: 'jingle_oops', kind: 'sfx', src: `${AC}Expressions/AC_Depressed.wav`, target: { peak: -7 }, note: '내려가는 "띠옹"(downer · boink): 꾸중이 아닌 장난스러운 소리' },
  { id: 'jingle_rewind', kind: 'sfx', src: `${AC}Chimes and Bells/AC_Digital_Chime_Magical_03v2_Reverse.wav`, target: { peak: -8 }, note: '거꾸로 재생한 차임 → 회중시계 되감기' },
  { id: 'jingle_unlock', kind: 'sfx', src: `${IS}V1.0/Items & Collectables/Star Collect.wav`, trim: [0, 1.6], fadeOut: 0.6, target: { peak: -9 }, note: '별 모으기 → 새 낱말·사진·아차 카드' },
  { id: 'jingle_payday', kind: 'sfx', src: `${IS}V.3.0 Files/Cash Register.wav`, target: { peak: -8 }, note: '금전등록기 → 월급날' },

  /* ---------------- 장면 속 소리(귀마개 영향) ---------------- */
  { id: 'bell', kind: 'sfx', src: `${IS}V2.0 Files/Sleigh Bells (1).wav`, trim: [0, 1.6], fadeOut: 0.5, target: { peak: -10 }, note: '작은 방울 여러 개 → 카페 문 종 딸랑' },
  {
    id: 'knock', kind: 'sfx', target: { peak: -8 },
    repeat: { src: `${AC}Misc/AC_Drum_Hit_Single.wav`, times: 3, every: 0.24, gains: [0, -1, -2], rate: 1.8, trim: [0, 0.22] },
    note: '손북 소리를 높이고 짧게 잘라 세 번 → 똑똑똑',
  },
  { id: 'door', kind: 'sfx', src: `${IS}V.3.0 Files/Car Door (3).wav`, target: { peak: -9 }, note: '딸깍-쿵 두 번 나는 실제 문소리' },
  { id: 'phone', kind: 'sfx', src: `${IS}V1.0/MISC/Alert Turn.wav`, target: { peak: -10 }, note: '딩딩 알림 → 문자 왔어요' },
  { id: 'alarm', kind: 'sfx', src: `${IS}V1.0/MISC/Alarm[loop].wav`, fadeOut: 0.3, target: { peak: -16 }, note: '알람 한 바퀴(2.8초)' },
  { id: 'card_beep', kind: 'sfx', src: `${TW}TomWinandySFX_UI_ScifiTech_Confirm_06.wav`, target: { peak: -12 }, note: '높이가 변하지 않는 짧은 삑' },
  { id: 'pen', kind: 'sfx', src: `${IS}V1.0/MISC/Writing (2).wav`, target: { peak: -12 }, note: '종이에 쓰는 사각 소리' },
  { id: 'seal', kind: 'sfx', src: `${AC}Misc/AC_Drum_Hit_Single.wav`, target: { peak: -6 }, note: '도장과 같은 쿵(계약서)' },
  { id: 'water', kind: 'sfx', src: `${CY}Various/SFX_waterSplash.wav`, target: { peak: -12 }, note: '물 튀는 소리(실제 소리에 가까운 잡음)' },
  { id: 'bubbles', kind: 'sfx', src: `${AC}Bubble/AC_Funny_Bubble_02.wav`, target: { peak: -12 }, note: '보글보글' },
  { id: 'towel', kind: 'sfx', src: `${AC}Whooshes Swishes Slides Transitions/AC_Fast_Swish_03.wav`, target: { peak: -14 }, note: '짧게 스치는 소리 → 종이 타월 뽑기' },
  { id: 'clink', kind: 'sfx', src: `${IS}V1.0/Items & Collectables/Ice (1).wav`, target: { peak: -16 }, note: '얼음·유리 부딪는 소리(카페 환경음 사이사이에도 나서 작게)' },
  { id: 'stack', kind: 'sfx', src: `${IS}V1.0/Interface/Switches_Buttons/Switch (5).wav`, target: { peak: -12 }, note: '플라스틱 딸깍' },
  { id: 'pour', kind: 'sfx', src: `${IS}V1.0/Items & Collectables/Potion Drink (4).wav`, target: { peak: -14 }, note: '꼴꼴 액체 소리' },
  { id: 'ice', kind: 'sfx', src: `${IS}V1.0/Items & Collectables/Ice (2).wav`, target: { peak: -12 }, note: '얼음 소리' },
  { id: 'spill', kind: 'sfx', src: `${AC}Cute Sounds/AC_Squirt_01v2.wav`, target: { peak: -8 }, note: '철퍽(squirt · splat)' },
  { id: 'wipe', kind: 'sfx', src: `${AC}Whooshes Swishes Slides Transitions/AC_Sweeping_Slide_01v3.wav`, target: { peak: -12 }, note: '쓱 닦는 소리' },
  { id: 'mop', kind: 'sfx', src: `${AC}Whooshes Swishes Slides Transitions/AC_Sweeping_Slide_01v4.wav`, target: { peak: -12 }, note: '조금 더 낮은 쓱' },
  // 4장 손맛 미니게임(2026-10-15): 받기·청소·지렁이. 들어 보고 바꿀 수 있게 이름 그대로 고름
  { id: 'sweep', kind: 'sfx', src: `${AC}Whooshes Swishes Slides Transitions/AC_Sweeping_Slide_01v2.wav`, target: { peak: -13 }, note: '비질 쓱(먼지 잡기)' },
  { id: 'catch', kind: 'sfx', src: `${AC}Bubble/AC_Bubble_Pop_01.wav`, trim: [0, 0.45], fadeOut: 0.15, target: { peak: -12 }, note: '퐁 → 떨어지는 것을 받았을 때' },
  { id: 'pickup', kind: 'sfx', src: `${CY}GameEvents/SFX_collect&bonus1.wav`, target: { peak: -15 }, note: '레트로 줍기 소리 → 쓰레기 줍기' },
  { id: 'nom', kind: 'sfx', src: `${IS}V1.0/Items & Collectables/Crunch Bite Item (1).wav`, target: { peak: -12 }, note: '바삭 깨무는 소리 → 지렁이가 빵을 먹음' },
  { id: 'bump', kind: 'sfx', src: `${IS}V1.0/MISC/Boing (1).wav`, trim: [0, 0.8], fadeOut: 0.3, target: { peak: -13 }, note: '보잉 → 지렁이가 벽·꼬리에 콩(벌이 아닌 장난스러운 소리)' },
  { id: 'sign', kind: 'sfx', src: `${IS}V1.0/Interface/Switches_Buttons/Switch (6).wav`, target: { peak: -10 }, note: '딸깍(표지판 펼치기·푯말 돌리기)' },
  { id: 'tray', kind: 'sfx', src: `${AC}Impacts/AC_Metal_Impact.wav`, trim: [0, 0.7], fadeOut: 0.4, lowpass: 6000, target: { peak: -10 }, note: '금속 쟁반 내려놓기(울림은 짧게 자름)' },
  { id: 'pos', kind: 'sfx', src: `${TW}TomWinandySFX_UI_ScifiTech_Confirm_03.wav`, target: { peak: -14 }, note: '포스기 버튼 삑' },
  { id: 'oven', kind: 'sfx', src: `${AC}Chimes and Bells/AC_Metal_Ding.wav`, target: { peak: -10 }, note: '작은 금속 띵' },
  { id: 'beep', kind: 'sfx', src: `${CY}GameEvents/SFX_alert4.wav`, target: { peak: -12 }, note: '삐삐 경고음 → 제빙기 고장' },
  { id: 'highfive', kind: 'sfx', src: `${AC}Impacts/AC_Slap_03.wav`, target: { peak: -6 }, note: '짝' },
  {
    id: 'slip', kind: 'sfx', target: { peak: -5 },
    layers: [
      { src: `${AC}Whooshes Swishes Slides Transitions/AC_Sweeping_Slide_01v1.wav`, at: 0, gain: -3 },
      { src: `${AC}Misc/AC_Drum_Hit_Single.wav`, at: 0.32, gain: 0 },
    ],
    note: '미끄러지는 쓱 + 둥근 쿵(다치는 소리처럼 들리지 않게)',
  },
  { id: 'glass_break', kind: 'sfx', src: `${AC}Misc/AC_Heart_Shatter_01.wav`, target: { peak: -8 }, note: '유리 깨짐(만화풍, 짧음)' },
  { id: 'crowd_angry', kind: 'sfx', src: `${IS}V2.0 Files/Humam Mumble [loop] (2).wav`, trim: [0, 3], fadeIn: 0.3, fadeOut: 0.8, keepSilence: true, target: { peak: -14 }, note: '웅성거림 3초' },
  {
    id: 'crash_small', kind: 'sfx', target: { peak: -6 },
    layers: [
      { src: `${IS}V1.0/Interface/Switches_Buttons/Switch (1).wav`, at: 0, gain: 0 },
      { src: `${IS}V1.0/Interface/Switches_Buttons/Switch (5).wav`, at: 0.07, gain: -1 },
      { src: `${IS}V1.0/Interface/Pops/Pop (4).wav`, at: 0.15, gain: -2 },
      { src: `${IS}V1.0/Interface/Switches_Buttons/Switch (9).wav`, at: 0.22, gain: -2 },
      { src: `${IS}V1.0/Interface/Clicks/Click (4).wav`, at: 0.31, gain: -3 },
      { src: `${IS}V1.0/Interface/Switches_Buttons/Switch (5).wav`, at: 0.42, gain: -5 },
      { src: `${IS}V1.0/Interface/Pops/Pop (4).wav`, at: 0.55, gain: -7 },
    ],
    note: '플라스틱 딸깍 소리 7개를 점점 작게 이어 붙임 → 컵 탑이 우르르',
  },
  {
    id: 'tick_fast', kind: 'sfx', target: { peak: -14 },
    repeat: { src: `${IS}V1.0/MISC/Countdown (5) Tick.wav`, times: 12, every: 0.13, gains: [0, -5] },
    note: '초침 12번을 빠르게 → 늦어서 조급한 시계',
  },
  { id: 'sad_trombone', kind: 'sfx', src: `${AC}Expressions/AC_Disappointment_01.wav`, target: { peak: -8 }, note: '내려가는 아쉬운 소리' },
  // 2026-10-31 작업대 손 기술이 모자라거나 넘쳤을 때(사용자 "효과음도 조금 더 극적이게"): 장난스럽고 과장된 소리, 꾸중이 아님
  { id: 'miss_low', kind: 'sfx', src: `${AC}Events/AC_Shrink_01v1.wav`, trim: [0, 1.5], fadeOut: 0.4, target: { peak: -8 }, note: '쪼그라드는 소리 → 손 기술이 모자랄 때(김 빠짐)' },
  { id: 'miss_high', kind: 'sfx', src: `${AC}Expressions/AC_Surprised_01v1.wav`, target: { peak: -8 }, note: '깜짝 놀람 → 손 기술이 넘칠 때' },
  { id: 'miss_sulk', kind: 'sfx', src: `${AC}Expressions/AC_Depressed_Tremolo.wav`, trim: [0, 2], fadeOut: 0.6, target: { peak: -9 }, note: '축 처지는 떨림 → 지은의 시무룩한 얼굴' },
  { id: 'sweat', kind: 'sfx', src: `${AC}Cute Sounds/AC_Funny_Sweat_01v1.wav`, target: { peak: -10 }, note: '식은땀 한 방울(만화 효과음)' },
  // 2026-11-01 재미 개편의 새 놀이(몰림 · 갈매기 · 버스). 사용자 "효과음 적절한 거 찾아서 넣어주고"
  { id: 'poof', kind: 'sfx', src: `${AC}Whooshes Swishes Slides Transitions/AC_Vanish_Funny_Smoke_01v2.wav`, trim: [0, 0.9], fadeOut: 0.35, target: { peak: -9 }, note: '만화 같은 연기 펑(0.1~0.3초가 가장 큼) → 주문 종이를 누르면 펑 터짐' },
  { id: 'boom', kind: 'sfx', src: `${AC}Impacts/AC_Retro_Explosion_02_Subtle.wav`, trim: [0, 1.4], fadeOut: 0.5, target: { peak: -8 }, note: '작은 옛날 게임 폭발(무섭지 않게) → 도시 카페에서 주문이 쌓여 와르르' },
  { id: 'squawk', kind: 'sfx', src: `${AC}Misc/AC_Squeaky_Mouse_02.wav`, trim: [0, 0.3], fadeOut: 0.08, target: { peak: -10 }, note: '짧고 높은 끽 → 그 갈매기를 맞혔을 때 "꽥!"(갈매기 울음 소리는 팩에 없음)' },
  {
    id: 'bus', kind: 'sfx', target: { peak: -10 },
    layers: [{ src: `${OVV}Truck/Truck Braking Pedal Normal.wav` }, { src: `${OVV}Truck/Truck Handbrake Up Normal.wav`, at: 0.7 }],
    note: '브레이크를 밟고 → 손 브레이크 "칙" → 버스가 정류장에 섬(봄 1일 버스 놀이의 끝)',
  },
];

/** 아직 알맞은 원본이 없어 합성음으로 두는 ID (사용자에게 요청할 목록) */
export const MISSING = {
  bgm: [],
  sfx: ['snap', 'espresso', 'steam', 'mixer', 'shutter_phone', 'mug'],
  amb: ['street', 'kitchen', 'classroom'],
};
