/**
 * 읽어 줄 문장 목록 만들기 (음성 생성용)
 *   node tools/export-lines.mjs  →  tools/voice/lines.json
 * 게임이 실제로 읽어 주는 문장(대사·나레이션·속마음·안내·카드·화면 고정 문장)을 모두 모읍니다.
 * 에피소드 목록은 js/data/episodes/index.js 의 EPISODES + ENDING 입니다.
 * key 는 게임(tts.js)과 같은 규칙: hashKey(`${voiceId}|${speakable(text)}`)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { hashKey, speakable, plain, fill } = await imp('js/core/text.js');
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

const ORDINAL = ['첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째']; // overlays.js 와 같음
const lines = new Map();
const met = new Set(); // meet() 로 만나는 인물(인물 카드는 그때만 읽어 줌)
let epCostume = null; // 지금 모으는 에피소드의 costume(의상별 목소리)
const voiceOf = (who) => costumeVoice(who, epCostume) || CHARS[who]?.voice || 'narr';

function add(voice, text, ep) {
  if (!text || /\{player/.test(text)) return; // 이름이 들어가는 줄은 실행할 때 브라우저 음성으로
  const spoken = speakable(text).trim();
  if (!spoken) return;
  const key = hashKey(`${voice}|${spoken}`);
  if (!lines.has(key)) lines.set(key, { key, voice, text: spoken, ep });
}

function walk(list, ep) {
  for (const b of list || []) {
    switch (b.t) {
      case 'say': add(voiceOf(b.who), b.text, ep); break;
      case 'narr': add('narr', b.text, ep); break;
      case 'think': add('think', b.text, ep); break;
      case 'sys': add('sys', b.text, ep); break;
      case 'guide': add('sys', b.text, ep); break; // 버튼 알려 주기 안내
      case 'phone': add(voiceOf(b.from), b.text, ep); break;
      case 'branch': for (const l of Object.values(b.cases || {})) walk(l, ep); break;
      case 'choose':
        if (b.q) add(b.who === 'jieun' || !b.who ? 'think' : voiceOf(b.who), b.q, ep);
        for (const o of b.options || []) { add('sys', plain(fill(o.label)), ep); walk(o.then, ep); }
        break;
      case 'decide': {
        const qVoice = b.who === 'jieun' ? 'think' : b.who === 'sys' ? 'sys' : voiceOf(b.who || 'owner');
        if (b.q) add(qVoice, b.q, ep);
        if (b.help) add(voiceOf(b.helper || 'owner'), b.help, ep);
        for (const c of b.choices || []) {
          add('sys', plain(fill(c.label)), ep);
          if (typeof c.praise === 'string') add(voiceOf(b.mentor || 'owner'), c.praise, ep);
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
      case 'eyes': for (const [, t] of eyesLines()) add(voiceOf('owner'), t, ep); break;
      case 'letter': add(voiceOf('jieun'), b.speech, ep); break;
      case 'big': add('sys', `${b.text}. ${b.sub}`, ep); break;
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
  if (ep.diary) add('jieun', ep.diary, ep.id); // 결과 화면의 일기(result.js)
  // 오늘의 일정 완료 배너 (overlays.check 와 같은 문장)
  (ep.schedule || []).forEach(([, l], i) => add('sys', `${ORDINAL[i]} 일정 끝! ${l}.`, ep.id));
  add('sys', `${ep.title}: 저장된 곳부터 이어서 할까요?`, ep.id); // 근무표에서 이어하기
  add('sys', `${ep.title}. 오늘의 마일스톤.`, ep.id); // 결과 화면 요약 첫 조각
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
  ['sys', '근무표로 나갈까요? 지금까지 한 것은 저장돼요.'],
  ['sys', '처음 화면으로 갈까요? 지금까지 한 것은 저장돼요.'],
  ['sys', '나는 오늘 어땠나요?'],
  ['sys', '들이쉬기'], ['sys', '내쉬기'], ['sys', '잘했어요. 마음이 조금 편해졌나요?'],
  ['sys', CONFIG.TITLE_SAY], // 처음 화면이 읽어 주는 제목(title.js 의 speakSeq 첫 조각)
  ['sys', CONFIG.TAGLINE.join(' ')], // 처음 화면 캐치프레이즈(title.js 의 speakSeq 둘째 조각)
  ['sys', TIMEOUT_SAY], // 시간 제한 막대가 다 됐을 때(js/ui/timer.js)
];
for (const [v, t] of EXTRA) add(v, t, 'common');
for (const f of FEELINGS) add('sys', f.label, 'common');
// 결과 화면 요약 조각: 스킬 × 별 단계 (result.js 의 speakSeq)
for (const sk of Object.values(SKILLS)) for (const lv of Object.values(LEVELS)) add('sys', `${sk.name}, ${lv.name}.`, 'result');

const out = [...lines.values()];
fs.mkdirSync(path.join(root, 'tools', 'voice'), { recursive: true });
fs.writeFileSync(path.join(root, 'tools', 'voice', 'lines.json'), `${JSON.stringify(out, null, 1)}\n`);
const byVoice = {};
for (const l of out) byVoice[l.voice] = (byVoice[l.voice] || 0) + 1;
console.log(`읽어 줄 문장 ${out.length}줄 → tools/voice/lines.json`);
console.log(byVoice);
