/**
 * 읽어 줄 문장 목록 만들기 (음성 생성용)
 *   node tools/export-lines.mjs  →  tools/voice/lines.json
 * 게임이 실제로 읽어 주는 문장(대사·나레이션·속마음·안내·카드·화면 고정 문장)을 모두 모읍니다.
 * 에피소드 목록은 js/data/episodes/index.js 의 EPISODES + ENDING, 그리고 자유 영업(free.js, 아래 FREE_DAYS 날 동안)입니다.
 * key 는 게임(tts.js)과 같은 규칙: hashKey(`${voiceId}|${speakable(text)}`)
 * 줄마다 말하는 사람(인물 id, 이름 없는 손님은 '옷차림'까지 customer-olive 처럼)을 기억해 두었다가, 사람별 목록을
 * docs/voice_lines.md(읽는 대본) · tools/voice/people.json(사람 → 그 사람의 줄 key, 도구용)으로 만듭니다
 * (자동 생성물, 2026-11-05 사용자 "인원별로 제작할 대사 목록").
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { hashKey, speakable, plain, fill, sentencesOf } = await imp('js/core/text.js');
const { CHARS, cardSpeech, costumeVoice } = await imp('js/data/characters.js');
const { FEELINGS, SKILLS, LEVELS } = await imp('js/data/skills.js');
const { GLOSSARY } = await imp('js/data/glossary.js');
const { PHOTOS, PHOTO_ORDER } = await imp('js/data/photos.js');
const { MINIGAME_LINES, MINIGAME_OOPS } = await imp('js/game/minigames/index.js');
const { CONFIG } = await imp('js/config.js');
const { saveLines } = await imp('js/screens/saves.js');
const { recordLines } = await imp('js/screens/records.js');
const { TIMEOUT_SAY } = await imp('js/ui/timer.js');
const { QUIT_ASK } = await imp('js/game/minigames/frame.js');
const { EPISODES, ENDING } = await imp('js/data/episodes/index.js');
const { REGULARS } = await imp('js/data/regulars.js');
const { albumLines, eyesLines, creditSpeech } = await imp('js/data/eyes.js');
const { metSpeech } = await imp('js/screens/result.js');
const { usualOf } = await imp('js/data/eyes.js');
const { STATS, MAX_LEVEL, RANKS, won, PAY_HOURS, NO_PAY_SAY, SHOP, GIFT_TO, GIFT_END, PLACED_SAY } = await imp('js/core/grow.js');
const { josa } = await imp('js/core/text.js');
const { freeDay } = await imp('js/data/episodes/free.js');
const cast = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'voice', 'voice_cast.json'), 'utf8'));
// 다시 만들 목소리(Qwen3, 검수 13.55): 사람마다 목소리 설명 · 본보기 문장. 속마음 · 나레이션은 지은의 목소리(covers)
const qcast = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'voice', 'qwen_cast.json'), 'utf8')).people;
// 줄마다 감정 메모(검수 13.57): key → { ko, en }. 사람별 대본의 '감정' 칸
const emo = JSON.parse(fs.readFileSync(path.join(root, 'tools', 'voice', 'emotions.json'), 'utf8')).lines;
const qOwner = Object.fromEntries(Object.entries(qcast).flatMap(([id, v]) => [[id, id], ...(v.covers || []).map((c) => [c, id])]));

const ORDINAL = ['첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째']; // overlays.js 와 같음
const lines = new Map();
const met = new Set(); // meet() 로 만나는 인물(인물 카드는 그때만 읽어 줌)
let epCostume = null; // 지금 모으는 에피소드의 costume(의상별 목소리)
const voiceOf = (who) => costumeVoice(who, epCostume) || CHARS[who]?.voice || 'narr';
/** 말하는 사람: 인물 id. 의상이 있는 인물(이름 없는 손님)은 옷차림까지 → 'customer-olive' */
const spk = (who) => (epCostume?.[who] ? `${who}-${epCostume[who]}` : who);
const by = new Map(); // key → Map(말하는 사람 → Set(나오는 곳))
// 말한 차례(감정 메모를 쓸 때 앞뒤 대사를 보려고, --context 파일): 모든 줄을 나온 순서대로 · 줄마다 처음 나온 자리
const stream = [];
const firstAt = new Map();

/**
 * 통째로 읽히면 뒤 문장에서 목소리가 다른 사람처럼 바뀌는 줄: 문장마다 따로 만듦.
 * 게임은 통째 파일이 없으면 문장 파일을 차례로 이어 읽음(js/av/tts.js 의 playParts). 사람의 귀로 찾은 줄만 적음(검수 13.95)
 */
const SPLIT = new Set([
  '은주 씨가 유모차를 밀고 들어온다. 다행히 오늘은 아기가 곤히 잠들어 있다.', // 여름 5일: 뒤 문장의 목소리가 바뀜(2026-11-08 사용자 "소리가 완전 다른데? 아직도")
  '도 씨가 들어오다 문 옆에서 멈춘다. 빈 벽에 새 못이 하나 박혀 있다.', // 여름 7일: '빈 벽에'부터 목소리가 바뀜(2026-11-08 사용자, 검수 13.98)
  '가슴이 두근거려서 가만히 앉아 있을 수가 없다. 창밖으로 지나가는 갈매기랑 고깃배를 하나씩 세어 보면, 마음이 조금 가라앉을 것 같다.', // 봄 1일: 뒤 문장의 목소리가 흔들림(2026-11-08 사용자, 검수 13.101)
  '노 씨가 카운터 앞 의자에 앉는다. 메뉴판은 보지도 않는다.', // 여름 4일: 다시 뽑을 때마다 '메' · '앉는다'가 번갈아 이상하게 나와 문장마다 고름(2026-11-08 사용자, 검수 13.103)
  '사장님이 하얀 잔을 내 두 손에 쥐여 준다. 잔이 따뜻하고, 달콤한 우유 냄새가 난다.', // 봄 1일: 뒤 문장의 소리가 흔들림(2026-11-10 사용자, 검수 13.115)
  '골목의 벚나무에 꽃봉오리가 부풀어 있다. 바다 쪽에서 갈매기 소리가 들린다.', // 봄 2일: 뒤 문장의 소리가 흔들림(2026-11-10 사용자, 검수 13.115)
  '컵 선반이 높아서, 나는 까치발을 하고 컵을 꺼낸다. 사장님이 그런 나를 잠깐 보고, 아무 말 없이 고개를 돌린다.', // 봄 2일: 뒤 문장(2026-11-10 사용자, 검수 13.115)
  '은빛 머리의 할머니가 천천히 들어온다. 메뉴판은 보지도 않고, 곧장 창가 자리로 간다.', // 봄 2일: 뒤 문장(2026-11-10 사용자, 검수 13.115)
]);
// 엔딩은 귀로 확인하지 못한 채 통째로 읽혀 문장 사이에서 목소리가 흔들린 줄이 많았음(2026-11-09 사용자 "매우 문제가 많다", 검수 13.115): 안내(sys)를 뺀 줄을 모두 문장마다 만듦
const SPLIT_ALL_IN = new Set(['ending']);
// 서술 · 속마음 · 주인공 대사는 두 문장 이상이면 문장마다 만듦: 뒤 문장에서 목소리가 흔들려도 줄 전체의 목소리 지문으로는 드러나지 않음(2026-11-10 사용자 "전체 다시 만들기", 검수 13.115). 귀로 듣고 고른 통째 줄(기록의 heard)은 그대로
const SPLIT_VOICES = new Set(['narr', 'think', 'jieun']);
const qwenMade = JSON.parse(fs.readFileSync(path.join(root, 'tools/voice/qwen_made.json'), 'utf8'));
const heardWhole = (voice, text) => Boolean(qwenMade[hashKey(`${voice}|${speakable(text).trim()}`)]?.heard);

function add(voice, text, ep, who = voice, face = '') {
  if (!text || /\{player/.test(text)) return; // 이름이 들어가는 줄은 실행할 때 브라우저 음성으로
  if ((SPLIT.has(text) || (SPLIT_ALL_IN.has(ep) && voice !== 'sys') || (SPLIT_VOICES.has(voice) && !heardWhole(voice, text))) && sentencesOf(text).length > 1) { for (const part of sentencesOf(text)) add(voice, part, ep, who, face); return; }
  const spoken = speakable(text).trim();
  if (!spoken) return;
  const key = hashKey(`${voice}|${spoken}`);
  if (ep !== 'free' || !firstAt.has(key)) { if (!firstAt.has(key)) firstAt.set(key, stream.length); stream.push({ key, who, face, ep, text }); }
  if (!lines.has(key)) { lines.set(key, { key, voice, text: spoken, ep }); by.set(key, new Map()); }
  const m = by.get(key);
  if (!m.has(who)) m.set(who, new Set());
  m.get(who).add(ep);
}

function walk(list, ep) {
  for (const b of list || []) {
    switch (b.t) {
      case 'say': add(voiceOf(b.who), b.text, ep, spk(b.who), b.face || ''); break;
      case 'narr': add('narr', b.text, ep); break;
      case 'think': add('think', b.text, ep); break;
      case 'sys': add('sys', b.text, ep); break;
      case 'guide': add('sys', b.text, ep); break; // 버튼 알려 주기 안내
      case 'phone': add(voiceOf(b.from), b.text, ep, spk(b.from)); break;
      case 'branch': for (const l of Object.values(b.cases || {})) walk(l, ep); break;
      case 'choose':
        if (b.q) { const jq = b.who === 'jieun' || !b.who; add(jq ? 'think' : voiceOf(b.who), b.q, ep, jq ? 'think' : spk(b.who)); }
        for (const o of b.options || []) { add('sys', plain(fill(o.label)), ep); walk(o.then, ep); }
        break;
      case 'decide': {
        const qWho = b.who === 'jieun' ? 'think' : b.who === 'sys' ? 'sys' : spk(b.who || 'owner');
        const qVoice = b.who === 'jieun' ? 'think' : b.who === 'sys' ? 'sys' : voiceOf(b.who || 'owner');
        if (b.q) add(qVoice, b.q, ep, qWho);
        if (b.help) add(voiceOf(b.helper || 'owner'), b.help, ep, spk(b.helper || 'owner'));
        for (const c of b.choices || []) {
          add('sys', plain(fill(c.label)), ep);
          if (typeof c.praise === 'string') add(voiceOf(b.mentor || 'owner'), c.praise, ep, spk(b.mentor || 'owner'));
          else walk(c.praise, ep);
          walk(c.fail, ep);
          if (c.oops) add('sys', `아차! ${c.oops.title}. ${c.oops.lesson}`, ep);
        }
        // 시간 제한(급한 장면): 시간이 다 됐을 때 따로 쓴 결과 장면·아차
        if (b.timer) { walk(b.timer.fail, ep); if (b.timer.oops) add('sys', `아차! ${b.timer.oops.title}. ${b.timer.oops.lesson}`, ep); }
        break;
      }
      case 'mini': walk(MINIGAME_LINES[b.name]?.(b), ep); break;
      case 'respond': { // 한 잔의 마음(runner.js respondBeat): 장면 · 힌트 · 지은의 속마음 · 선택지 · 반응 뒤 장면
        const tc = REGULARS[b.who]?.touches?.[b.touch];
        if (!tc) break;
        walk(tc.scene, ep);
        walk(tc.hints, ep);
        if (tc.q) add('think', tc.q, ep);
        for (const c of tc.choices || []) { add('sys', plain(fill(c.label)), ep); walk(c.after, ep); }
        break;
      }
      // 화면 안내도 같은 문장으로 (overlays.js 의 tts.speak 와 똑같이 만듦)
      case 'act': add('sys', fill(b.label), ep); break;
      case 'finish': add('sys', `${b.title} ${b.sub}`, ep); break;
      // 엔딩: 사진 벽에 붙는 사진 제목 · 크레디트(overlays.credits) · 앨범 · 사장의 눈(js/ui/ending.js, 문장은 js/data/eyes.js)
      case 'credits': for (const id of PHOTO_ORDER) add('sys', PHOTOS[id].title, ep); add('sys', creditSpeech(), ep); break;
      case 'album': for (const [v, t] of albumLines()) add(v, t, ep); break;
      case 'eyes': for (const [, t] of eyesLines()) add(voiceOf('owner'), t, ep, 'owner'); break;
      case 'letter': add(voiceOf('jieun'), b.speech, ep, 'jieun'); break;
      case 'big': add('sys', b.say || `${b.text}. ${b.sub}`, ep); break; // say: 화면 글과 다르게 읽는 말(자유 영업)
      case 'photo': if (PHOTOS[b.id]) add('sys', `오늘의 한 장. ${PHOTOS[b.id].title}`, ep); break;
      case 'info': add('sys', `${b.title}. ${b.body}`, ep); break;
      case 'meet': met.add(b.who); break;
      // 메모 다시 듣기 (memo.speak 와 같은 문장)
      case 'memo': add('sys', `${b.title}. ${b.items.map((it, i) => `${i + 1}번, ${Array.isArray(it) ? it[1] : it.text}`).join('. ')}`, ep); break;
      default: break;
    }
  }
}

for (const ep of [...EPISODES, ENDING]) {
  epCostume = ep.costume || null;
  walk(ep.script, ep.id);
  epCostume = null;
  if (ep === ENDING) {
    // 엔딩: 결과 화면의 [엔딩 보기] 안내(result.js) · 엔딩 뒤 알림과 근무표 안내(main.js · hub.js)
    add('sys', ep.cue, ep.id);
    if (ep.notice) add('sys', `${ep.notice.title}. ${ep.notice.body}`, ep.id);
    continue; // 일정표·일기·결과 화면이 없음
  }
  // 오늘의 일정표 (overlays.schedule 과 같은 문장): schedule() 비트가 있는 에피소드만
  if (ep.script.some((b) => b.t === 'schedule')) add('sys', `${ep.label}. ${ep.title}. 오늘 할 일. ${(ep.schedule || []).map(([, l], i) => `${i + 1}번, ${l}`).join('. ')}`, ep.id);
  if (ep.diary) add('jieun', ep.diary, ep.id, 'jieun'); // 결과 화면의 일기(result.js)
  // 오늘의 일정 완료 배너 (overlays.check 와 같은 문장)
  (ep.schedule || []).forEach(([, l], i) => add('sys', `${ORDINAL[i]} 일정 끝! ${l}.`, ep.id));
  add('sys', `${ep.title}: 저장된 곳부터 이어서 할까요?`, ep.id); // 근무표에서 이어하기
  add('sys', `${ep.title}. 오늘 하루를 돌아봐요.`, ep.id); // 하루 끝 화면 요약 첫 조각(result.js)
}

// 자유 영업(free.js): 날 번호로 정해지는 하루(손님 말은 정해 둔 문장 가운데서 고름). 칠판 카드 9 × 계절 28일인 252일을
// 두 번(앨범 액자가 열렸을 때 · 아직일 때) 모읍니다. 2520일 · 5040일을 모아도 같은 줄이었음(2026-11-05 확인).
// 큰 제목 · 하루 끝 화면은 날 번호 없이 읽음(b.say · result.js, 검수 13.63: 전에는 날 번호가 들어가 브라우저 음성이었음)
const FREE_DAYS = 252;
const allAlbum = Object.fromEntries(Object.keys(REGULARS).map((k) => [k, 1]));
for (let n = 1; n <= FREE_DAYS; n++) {
  for (const album of [{}, allAlbum]) {
    const d = freeDay(n, { album });
    epCostume = d.costume || null;
    walk(d.script, 'free'); // 큰 제목은 날 번호 없이 읽음(b.say: '자유 영업. 봄의 하루.')
    epCostume = null;
  }
}

// 미니게임 [그만하기] 확인 창(frame.js) · 미니게임 안에서 생기는 아차
add('sys', QUIT_ASK, 'mini');
for (const o of MINIGAME_OOPS) add('sys', `아차! ${o.title}. ${o.lesson}`, 'mini');

// 저장하기·불러오기 (screens/saves.js 의 SAVE_SAY, 확인 창 문장 포함)
for (const t of saveLines()) add('sys', t, 'saves');
add('sys', '판단 장면마다 자동으로 저장돼요. [저장하기]로 원하는 장면을 6칸에 따로 저장할 수 있어요.', 'saves');
// 기록 파일 저장·불러오기 (screens/records.js 의 RECORD_SAY: 확인 창·알림. 별명은 화면에만)
for (const t of recordLines()) add('sys', t, 'saves');

// 인물 카드 (overlays.crewCard 와 같은 문장): 이야기에서 meet() 로 만나는 인물만
for (const id of met) if (CHARS[id]?.card) add('sys', cardSpeech(id), 'crew');

// 말 사전 팝업 (overlays.glossary 와 같은 문장)
for (const g of GLOSSARY) add('sys', `${g.word}. ${fill(g.easy)} 예를 들어, ${fill(g.ex)}`, 'glossary');

// 코드 안에 고정된 문장 (첫 시작·설정·확인 창·결과 화면·숨 고르기·처음 화면 등)
// 미니게임 문장은 각 미니게임의 xxxLines() 가 내보냅니다.
const EXTRA = [
  ['sys', '안녕하세요! 게임에서 쓸 별명을 알려 주세요.'],
  ['sys', '진짜 이름은 쓰지 말고, 나만의 별명을 써요.'],
  ['sys', '보기 편하게 맞춰요.'],
  ['sys', '이 빠르기로 읽어 줄게요.'],
  ['sys', '지은은 오늘 처음으로 바리스타 앞치마를 매요.'], // 첫 시작 빠르기 견본(profile.js)
  ['sys', '달력으로 나갈까요? 지금까지 한 것은 저장돼요.'],
  ['sys', '처음 화면으로 갈까요? 지금까지 한 것은 저장돼요.'],
  ['sys', '나는 오늘 어땠나요?'],
  ['sys', '들이쉬기'], ['sys', '내쉬기'], ['sys', '잘했어요. 마음이 조금 편해졌나요?'],
  ['sys', CONFIG.TITLE_SAY], // 처음 화면이 읽어 주는 제목(title.js 의 speakSeq 첫 조각)
  ['sys', CONFIG.TAGLINE.join(' ')], // 처음 화면 캐치프레이즈(title.js 의 speakSeq 둘째 조각)
  ['sys', TIMEOUT_SAY], // 시간 제한 막대가 다 됐을 때(js/ui/timer.js)
  ['sys', '자유 영업. 오늘 하루를 돌아봐요.'], // 자유 영업의 하루 끝 화면 첫 조각(result.js, 날 번호 없이)
];
for (const [v, t] of EXTRA) add(v, t, 'common');
for (const f of FEELINGS) add('sys', f.label, 'common');
// 하루 끝 화면의 '오늘 만난 사람'(result.js metSpeech): 단골 8명 × 반응 3가지
add('sys', '오늘 만난 사람.', 'result');
for (const who of Object.keys(REGULARS)) for (const sc of [0, 1, 2]) add('sys', metSpeech(who, sc), 'result');
// 결과 화면 요약 조각: 스킬 × 별 단계 (result.js 의 speakSeq)
for (const sk of Object.values(SKILLS)) for (const lv of Object.values(LEVELS)) add('sys', `${sk.name}, ${lv.name}.`, 'result');
// 하루 끝 '오늘의 일'(result.js growView): 받은 돈(해마다 시급 × 6시간) · 능력치가 오른 말(두 문장: tts 가 문장마다 나눠 읽음) · 새 단계(검수 13.63: 모두 브라우저 음성이었음)
for (const hourly of Object.values(CONFIG.WAGE_TABLE)) add('sys', `오늘 받은 돈은 ${won(hourly * PAY_HOURS)}이에요.`, 'result');
for (const t of NO_PAY_SAY) add('sys', t, 'result'); // 봄 1일(면접 날)은 받은 돈이 없음(검수 13.73)
for (const st of STATS) {
  add('sys', st.effect, 'result');
  for (let lv = 2; lv <= MAX_LEVEL; lv++) add('sys', `${josa(st.name, '이/가')} ${lv}단계가 되었어요!`, 'result');
}
for (const r of RANKS.slice(1)) add('sys', `이제 ${r}예요!`, 'result');
// 선물 · 꾸미기(수첩 '나의 성장' → js/ui/gift.js, 검수 13.91): 사는 물음 · 선물 장면(사장님의 말 · 집에서 온 문자는 지은이 읽음 · 지은의 속마음) · 놓은 자리 알림(문장마다)
for (const it of SHOP) add('sys', `${josa(it.name, '을/를')} ${won(it.price)}에 살까요?`, 'notebook');
add('sys', GIFT_TO.owner.head, 'notebook'); add('sys', GIFT_TO.family.head, 'notebook'); add('sys', GIFT_TO.family.reply, 'notebook');
for (const it of SHOP.filter((x) => x.kind === 'gift')) for (const l of it.lines) add(it.to === 'owner' ? 'owner' : 'narr', l, 'notebook', it.to === 'owner' ? 'owner' : 'narr');
add('think', GIFT_END, 'notebook');
for (const pair of Object.values(PLACED_SAY)) for (const t of pair) add('sys', t, 'notebook');
// 수첩의 단골 쪽 [읽어 주기](notebook.js regularsView): 이름 · 늘 마시는 것 · 기억 카드 · 들은 이야기를 이어 읽음.
// 학생마다 아는 것이 달라 통째로는 파일이 없으므로 문장마다(tts 가 문장마다 나눠 읽음, 검수 13.63)
for (const [id, r] of Object.entries(REGULARS)) {
  const parts = [`${r.name}.`, `늘 마시는 것: ${usualOf(id)}`, '늘 마시는 것: 아직 몰라요. "늘 먹던 거"를 한 번 맞게 내면 적혀요.',
    ...Object.values(r.touches || {}).filter((t) => t.card).map((t) => `기억 카드: ${t.card}`),
    r.album ? `들은 이야기: ${r.album.title}. ${r.album.line}` : ''];
  for (const t of parts) for (const p of sentencesOf(t)) add('sys', p, 'notebook');
}

const out = [...lines.values()];
fs.mkdirSync(path.join(root, 'tools', 'voice'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools', 'voice', 'lines.json'), `${JSON.stringify(out, null, 1)}\n`);
const byVoice = {};
for (const l of out) byVoice[l.voice] = (byVoice[l.voice] || 0) + 1;
console.log(`읽어 줄 문장 ${out.length}줄 → tools/voice/lines.json`);
console.log(byVoice);

// ---------- 사람별 목록: docs/voice_lines.md (목소리를 만들 때 쓰는 대본) ----------
// 묶음: 주인공 → 사장님 → 단골 → 이야기의 다른 인물 → 손님으로 오는 직업 마1스톤 인물 → 이름 없는 손님(옷차림별) → 안내
const GROUPS = [
  ['주인공', ['jieun', 'think', 'narr']],
  ['사장님', ['owner']],
  ['단골 8명', ['haesun', 'jian', 'do', 'kang', 'han', 'eunju', 'sumin', 'noh']],
  ['이야기의 다른 인물', ['geum', 'actor', 'agent', 'granddaughter', 'han_daughter', 'mom2', 'young_fisher']],
  ['손님으로 오는 직업 마1스톤 인물', ['yeonwoo', 'dohyun', 'manager', 'sora', 'minjae', 'mom', 'teacher', 'jiho', 'grandma', 'student', 'seojin', 'daeri', 'luna', 'auntie', 'hiker']],
  ['이름 없는 손님(옷차림마다)', null], // customer, customer-…
  ['안내', ['sys']],
];
const LOOK = { // 이름 없는 손님의 옷차림(assets/stand/customer-{옷차림}_normal.webp)
  customer: '회색 머리 중년 남성 · 남색 재킷',
  'customer-olive': '올리브 블라우스 여성',
  'customer-coffee': '커피를 든 여성',
  'customer-sporty': '물병을 든 운동복 여성(여름 관광객)',
  'customer-arms': '팔짱 낀 여성',
  'customer-stripe': '안경 · 줄무늬 셔츠 · 헤드폰 청년',
};
const SPECIAL = { think: '지은의 속마음', narr: '나레이션(지은이 들려주는 이야기)', sys: '안내(화면 · 단추 · 카드)' };
const nameOf = (id) => SPECIAL[id] || LOOK[id] && `손님 · ${LOOK[id]}` || CHARS[id]?.name || id;
const roleOf = (id) => (SPECIAL[id] ? '' : CHARS[id.split('-')[0]]?.role || '');
const EP_NAME = Object.fromEntries([...EPISODES, ENDING].map((e) => [e.id, e.label]));
const placeName = (ep) => EP_NAME[ep] || { free: '자유 영업', common: '화면', mini: '미니게임', saves: '저장', crew: '인물 카드', glossary: '말 사전', result: '하루 끝', notebook: '수첩' }[ep] || ep;
// 사람별 줄(같은 사람의 같은 문장은 한 줄)
const per = new Map();
for (const l of out) {
  for (const [who, eps] of by.get(l.key)) {
    if (!per.has(who)) per.set(who, []);
    per.get(who).push({ text: l.text, voice: l.voice, eps: [...eps] });
  }
}
const customers = [...per.keys()].filter((id) => id === 'customer' || id.startsWith('customer-')).sort((a, b) => (a === 'customer' ? -1 : b === 'customer' ? 1 : a.localeCompare(b)));
const groups = GROUPS.map(([g, ids]) => [g, (ids || customers).filter((id) => per.has(id))]);
const known = new Set(groups.flatMap(([, ids]) => ids));
const rest = [...per.keys()].filter((id) => !known.has(id));
if (rest.length) groups.push(['그 밖', rest]);
const silent = GROUPS.flatMap(([, ids]) => ids || []).filter((id) => !per.has(id)); // 이 게임에서 말하지 않는 인물
const castOf = (voice) => { const c = cast[voice]; return c ? `${c.voice} · ${c.speed}` : '-'; };
const chars = (arr) => arr.reduce((n, x) => n + x.text.length, 0);
const voicesUsed = new Set(out.map((l) => cast[l.voice]?.voice).filter(Boolean));
const nPeople = groups.reduce((n, [, ids]) => n + ids.length, 0);
const md = [];
md.push('# 읽어 줄 문장 · 사람별 목록', '');
md.push('> 자동 생성물(`npm run lines`, `tools/export-lines.mjs`): 직접 고치지 않습니다. 대사를 고치면 다시 만듭니다.', '');
md.push(`이야기 28일 · 엔딩 · 자유 영업 · 화면 안내에서 게임이 읽어 주는 문장을 **말하는 사람마다** 모았습니다. 같은 사람이 같은 문장을 여러 곳에서 말하면 한 줄로 셉니다.`);
md.push(`이름 없는 손님은 같은 '손님'이라도 옷차림(그림)이 다르면 다른 사람으로 나눴습니다. 옷차림마다 목소리 이름도 따로입니다(\`customer\` · \`customer-olive\` 등, 검수 13.58).`);
md.push(`게임이 브라우저 음성으로 읽는 줄(학생 별명이 든 줄)은 빠져 있습니다. 여러 문장을 이어 읽는 말(작업대의 다시 볼 곳 · 하루 끝의 오늘의 일 · 수첩의 단골 쪽)은 문장마다 한 줄입니다(게임이 문장마다 나눠 읽음, 검수 13.63).`, '');
md.push('## 1. 모아 보기', '');
md.push(`- 말하는 사람 **${nPeople}명**(나레이션 · 속마음 · 안내 포함), 문장 **${out.length}줄**(같은 문장을 두 사람이 말하면 사람마다 셈: ${groups.reduce((n, [, ids]) => n + ids.reduce((m, id) => m + per.get(id).length, 0), 0)}줄)`);
md.push(`- 지금 쓰는 Supertonic 목소리 **${voicesUsed.size}개**(M1~M5 · F1~F5)를 빠르기로 나눠 씀(\`tools/voice/voice_cast.json\`)`);
md.push(`- 다시 만들 목소리(Qwen3, 검수 13.52 ~ 13.55): 사람마다 목소리 **${Object.keys(qcast).length}개**. 목소리 설명 · 본보기 문장은 \`tools/voice/qwen_cast.json\`(2장의 사람마다 '목소리'에 옮겨 적음)`);
md.push(`- 줄마다 감정 메모(검수 13.57): **${out.filter((l) => emo[l.key]).length}줄**(\`tools/voice/emotions.json\`, 2장의 '감정' 칸). 감정 메모가 없는 줄은 감정 지시 없이 그 사람의 본보기 목소리대로 읽음`);
if (silent.length) md.push(`- 이 게임에서 말하지 않는 인물(목소리가 필요 없음): ${silent.map((id) => `${nameOf(id)}(\`${id}\`)`).join(' · ')}`);
md.push('');
md.push('| 묶음 | 사람 | id | 하는 일 | 지금 목소리 · 빠르기 | 줄 | 글자 |', '| :--- | :--- | :--- | :--- | :--- | ---: | ---: |');
for (const [g, ids] of groups) for (const id of ids) {
  const arr = per.get(id);
  const vs = [...new Set(arr.map((x) => x.voice))];
  md.push(`| ${g} | ${nameOf(id)} | \`${id}\` | ${roleOf(id)} | ${vs.map((v) => `${v}(${castOf(v)})`).join(', ')} | ${arr.length} | ${chars(arr).toLocaleString('en-US')} |`);
}
md.push('');
md.push('## 2. 사람별 대사', '');
let gi = 0;
for (const [g, ids] of groups) {
  gi += 1;
  md.push(`### 2.${gi} ${g}`, '');
  for (const id of ids) {
    const arr = per.get(id);
    md.push(`#### ${nameOf(id)} (\`${id}\`) · ${arr.length}줄`, '');
    const qid = qOwner[id];
    if (qid && qid !== id) md.push(`> 목소리: ${nameOf(qid)}의 목소리를 함께 씀`, '');
    else if (qid) md.push(`> 목소리: ${qcast[qid].ko}`, '>', `> 본보기 문장: “${qcast[qid].ref}”${qcast[qid].pick ? ` · 고른 목소리: ${qcast[qid].pick}(\`${qcast[qid].refFile}\`)` : ''}`, '');
    const emoOf = (x) => emo[hashKey(`${x.voice}|${x.text}`)]?.ko || '';
    const hasEmo = arr.some(emoOf);
    md.push(hasEmo ? '| # | 대사 | 감정 | 나오는 곳 |' : '| # | 대사 | 나오는 곳 |', hasEmo ? '| ---: | :--- | :--- | :--- |' : '| ---: | :--- | :--- |');
    arr.forEach((x, i) => {
      const where = [...new Set(x.eps.map(placeName))];
      md.push(`| ${i + 1} | ${x.text.replace(/\|/g, '\\|')} |${hasEmo ? ` ${emoOf(x)} |` : ''} ${where.slice(0, 3).join(', ')}${where.length > 3 ? ` 외 ${where.length - 3}곳` : ''} |`);
    });
    md.push('');
  }
}
fs.writeFileSync(path.join(root, 'docs', 'voice_lines.md'), `${md.join('\n')}\n`);
// 도구용: 사람 → 묶음 · 이름 · 지금 목소리 · 그 사람의 줄 key(lines.json 의 key). 사람마다 목소리를 따로 만들 때 씀
const people = {};
for (const [g, ids] of groups) for (const id of ids) {
  people[id] = { group: g, name: nameOf(id), voice: [...new Set(per.get(id).map((x) => x.voice))], keys: per.get(id).map((x) => hashKey(`${x.voice}|${x.text}`)) };
}
fs.writeFileSync(path.join(root, 'tools', 'voice', 'people.json'), `${JSON.stringify(people)}\n`);
console.log(`사람별 목록 ${nPeople}명 → docs/voice_lines.md · tools/voice/people.json`);
// 말한 차례(--context 파일 경로): 감정 메모 작업용. 자유 영업은 줄마다 처음 나온 곳만
const ci = process.argv.indexOf('--context');
if (ci > 0 && process.argv[ci + 1]) {
  fs.writeFileSync(process.argv[ci + 1], JSON.stringify({ stream, firstAt: Object.fromEntries(firstAt) }));
  console.log(`말한 차례 ${stream.length}줄 → ${process.argv[ci + 1]}`);
}
