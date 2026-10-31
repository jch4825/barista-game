/**
 * 시나리오 검사기
 *   node tools/validate-scenarios.mjs
 * 인물·표정·배경·소리·아이콘·말 사전·사진·미니게임 참조, 판단 카드 구조, 아차 ID 중복,
 * 라벨/점프, 중첩 비트 규칙, 문장 길이(쉬운 글 기준)를 검사합니다.
 * 검사하는 에피소드는 js/data/episodes/index.js 의 EPISODES(이야기 순서) + ENDING 입니다(목록을 여기에 따로 적지 않음).
 */

import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);

const { CHARS } = await imp('js/data/characters.js');
const { hasIcon } = await imp('js/data/icons.js');
const { findTerm } = await imp('js/data/glossary.js');
const { BG_IDS } = await imp('js/data/backgrounds.js');
const { SFX_NAMES, BGM_NAMES, AMB_NAMES } = await imp('js/av/audio.js');
const { SKILLS } = await imp('js/data/skills.js');
const { PHOTOS } = await imp('js/data/photos.js');
const { CG_IDS } = await imp('js/data/cg.js');
const { EMOTES } = await imp('js/ui/emote.js');
const { condErrors } = await imp('js/core/cond.js');
const { MINIGAMES, MINIGAME_SKINS, MINIGAME_OOPS, MINIGAME_CHECKS } = await imp('js/game/minigames/index.js');
const { menuProblems } = await imp('js/data/menu.js');
const { GUIDE_KEYS } = await imp('js/data/tutorial.js');
const { EPISODES, ACTS, ENDING } = await imp('js/data/episodes/index.js');
const { REGULARS, KINDS } = await imp('js/data/regulars.js');

const MINIS = Object.keys(MINIGAMES);
// 엔딩(ENDING)은 감상 장면: 판단·미니게임·일정 완료·도장을 두지 않음
const NOT_IN_ENDING = new Set(['decide', 'choose', 'mini', 'respond', 'schedule', 'check', 'stamp']);
const SVG_FACES = ['normal', 'smile', 'happy', 'proud', 'worried', 'nervous', 'scared', 'angry', 'surprised', 'sad', 'think'];
const MOTIONS = ['bow', 'nod', 'shake', 'jump', 'breathe'];
// js/core/dsl.js 의 비트 종류
const KNOWN = new Set(['bg', 'bgm', 'amb', 'sfx', 'show', 'enter', 'leave', 'face', 'motion', 'camera', 'fx', 'earplugs', 'say', 'narr', 'think', 'sys', 'phone',
  'time', 'place', 'big', 'schedule', 'memo', 'memoHi', 'info', 'act', 'breathe', 'decide', 'choose', 'branch',
  'mini', 'snap', 'photo', 'stamp', 'term', 'finish', 'credits', 'letter', 'label', 'jump', 'set', 'checkpoint', 'wait', 'end',
  'check', 'meet', 'cg', 'emote', 'guide', 'got', 'respond', 'chalk', 'seen', 'album', 'eyes', 'secret']);
// check(일정 완료)는 실패·칭찬 장면 안에 두지 않습니다(되감기 전 장면에서 완료로 표시되면 안 됨)
const NO_NEST = new Set(['decide', 'choose', 'mini', 'respond', 'label', 'jump', 'checkpoint', 'end', 'schedule', 'check']);
const LONG = 90; // 2026-10-31 사용자 "대본을 너무 단문으로 쓰지 마라. 맥락과 힌트를 중시하라": 한 칸 두 문장 이내, 문장은 이어 써도 됨

let errors = 0;
let warns = 0;
const err = (ep, msg) => { errors += 1; console.log(`  ✗ [${ep}] ${msg}`); };
const warn = (ep, msg) => { warns += 1; console.log(`  △ [${ep}] ${msg}`); };

const oopsIds = new Map();
// 선택 기억(플래그)을 정하는 곳: set · choose 의 flag · 카드·선택지의 set (엔진이 따로 정하는 플래그는 없음)
const flagsSet = new Set();
const flagsUsed = [];
const totals = { beats: 0, lines: 0, chars: 0, decides: 0, responds: 0, oops: 0 };
let curSchedule = [];
let checks = [];

/** 조건(onlyIf)이 보는 선택 기억 이름: flag·notFlag 는 '=' 앞, 숫자 비교({ 이름: '>=4' })는 그 이름, 단골 신뢰(trust)는 'touch' (js/core/cond.js) */
const condFlags = (c) => (Array.isArray(c) ? c.flatMap(condFlags) : Object.entries(c || {}).filter(([k]) => k !== 'album').map(([k, v]) => (k === 'flag' || k === 'notFlag' ? String(v).split('=')[0] : k === 'trust' || k === 'warmth' ? 'touch' : k === 'pick' ? 'picks' : k)));
// pick 조건이 가리키는 선택지가 실제로 있는지(대응 기회 · 선택지 id)
const pickUsed = [];
const REGULAR_IDS = Object.keys(REGULARS);
// 대본에서 부른 대응 기회: '사람.기회' → 에피소드 (한 기회는 이야기에서 한 번만)
const touchUsed = new Map();
// 숨은 장면(seen) 번호: 1~11 이 모두 한 번씩 있는지(PRD 5.6)
const seenUsed = [];
// 비밀 장면(secret): 단골 8명 모두 3단계 장면이 있는지(PRD 8.3)
const secretUsed = new Set();

function checkFace(ep, who, face) {
  if (!face) return;
  const c = CHARS[who];
  if (!c) return;
  if (c.faces) {
    if (!c.faces.includes(face) && !(c.alias && c.alias[face])) err(ep, `${who} 의 표정 '${face}' 없음`);
  } else if (!SVG_FACES.includes(face) && !Object.values(c.standAlias || {}).includes(face)) err(ep, `${who}(임시 초상) 표정 '${face}' 없음`); // standAlias 의 값 = 그림이 올 표정(look·shy 등)
}

function checkCastValue(ep, v) {
  if (!v) return;
  const [id, face] = String(v).split(':');
  if (!CHARS[id]) err(ep, `무대 인물 '${id}' 없음`);
  else checkFace(ep, id, face || 'normal');
}

function checkText(ep, text) {
  if (typeof text !== 'string') { err(ep, `대사 텍스트가 문자열이 아님: ${JSON.stringify(text)}`); return; }
  for (const m of text.matchAll(/\{\{([^}]+)\}\}/g)) {
    const [, id] = m[1].split('|');
    if (!findTerm((id || m[1]).trim())) err(ep, `말 사전에 없는 낱말: {{${m[1]}}}`);
  }
  const plain = text.replace(/\{\{([^}|]+)(\|[^}]+)?\}\}/g, '$1').replace(/\*\*/g, '');
  totals.chars += plain.length;
  if (plain.length > LONG) warn(ep, `긴 대사(${plain.length}자): ${plain.slice(0, 40)}…`);
}

function checkOops(ep, o, where) {
  if (!o || !o.id || !o.title || !o.lesson) { err(ep, `${where}: oops(id/title/lesson) 필요`); return; }
  if (oopsIds.has(o.id)) err(ep, `oops id 중복: ${o.id} (이미 ${oopsIds.get(o.id)})`);
  oopsIds.set(o.id, ep);
  totals.oops += 1;
  if (o.icon && !hasIcon(o.icon)) err(ep, `oops 아이콘 없음: ${o.icon}`);
  checkText(ep, o.lesson);
}

/** 시간 제한(급한 장면): label 필수, 시간이 다 됐을 때의 결과는 as(나쁜 카드 아이콘) 또는 fail+oops */
function checkTimer(ep, b, where) {
  const tm = b.timer;
  if (!tm) return;
  if (!tm.label) err(ep, `${where}: timer.label(왜 급한지) 필요`);
  if (tm.sec !== undefined && !(Number(tm.sec) >= 5)) err(ep, `${where}: timer.sec 는 5초 이상`);
  if (b.t === 'decide') {
    if (tm.as && !(b.choices || []).some((c) => !c.ok && c.icon === tm.as)) err(ep, `${where}: timer.as '${tm.as}' 인 나쁜 카드가 없음`);
    if (!tm.as && !(tm.fail && tm.oops)) err(ep, `${where}: 시간이 다 됐을 때의 결과(timer.as 또는 timer.fail+oops) 필요`);
    if (tm.fail) walk(ep, tm.fail, { nested: true });
  } else if (tm.say) checkText(ep, tm.say);
  if (tm.oops || b.t !== 'decide') checkOops(ep, tm.oops, `${where} timer`);
}

function walk(ep, list, { nested = false, labels = new Set(), jumps = [] } = {}) {
  for (const b of list || []) {
    totals.beats += 1;
    if (!b || !KNOWN.has(b.t)) { err(ep, `알 수 없는 비트: ${JSON.stringify(b)}`); continue; }
    if (nested && NO_NEST.has(b.t)) err(ep, `중첩 목록 안에서 쓸 수 없는 비트: ${b.t}`);
    if (b.if) {
      if (['label', 'jump', 'end', 'check', 'respond'].includes(b.t)) err(ep, `조건(if)을 붙일 수 없는 비트: ${b.t}`);
      // onlyIf 묶음의 조건은 첫 비트에서 한 번만 검사(묶음마다 한 번만 셈)
      if (b.ifFirst !== false) {
        for (const e of condErrors(b.if, REGULAR_IDS)) err(ep, `조건(if) ${e}: ${b.t}`);
        for (const f of condFlags(b.if)) flagsUsed.push([ep, f]);
        for (const c of [b.if].flat()) if (c?.pick) pickUsed.push([ep, c.pick]);
      }
    }
    switch (b.t) {
      case 'bg': if (!BG_IDS.includes(b.id)) err(ep, `배경 없음: ${b.id}`); break;
      case 'bgm': if (b.mood && !BGM_NAMES.includes(b.mood)) err(ep, `BGM 없음: ${b.mood}`); break;
      case 'amb': if (b.kind && !AMB_NAMES.includes(b.kind)) err(ep, `환경음 없음: ${b.kind}`); break;
      case 'sfx': if (!SFX_NAMES.includes(b.name)) err(ep, `효과음 없음: ${b.name}`); break;
      case 'show': Object.values(b.cast || {}).forEach((v) => checkCastValue(ep, v)); break;
      case 'enter': checkCastValue(ep, b.who); break;
      case 'leave': if (!CHARS[b.who]) err(ep, `인물 없음: ${b.who}`); break;
      case 'face': if (!CHARS[b.who]) err(ep, `인물 없음: ${b.who}`); else checkFace(ep, b.who, b.face); break;
      case 'motion': if (!MOTIONS.includes(b.type)) err(ep, `동작 없음: ${b.type}`); break;
      case 'say':
        totals.lines += 1;
        if (!CHARS[b.who]) err(ep, `화자 없음: ${b.who}`);
        checkFace(ep, b.who, b.face);
        checkText(ep, b.text);
        break;
      case 'narr': case 'sys': totals.lines += 1; checkText(ep, b.text); break;
      case 'letter': // 마지막 메모: 받는 사람만 {player} 가능, 읽어 줄 줄(speech)에는 이름을 넣지 않음(음성 파일)
        if (!(b.lines || []).length) err(ep, 'letter 에 줄(lines)이 없음');
        for (const t of [...(b.lines || []), b.ps].filter(Boolean)) { totals.lines += 1; checkText(ep, t); }
        if (/\{player/.test(b.speech || '')) err(ep, 'letter 의 줄·추신에는 {player} 를 쓰지 않아요(받는 사람 to 에만)');
        break;
      case 'got': // 받은 물건: 소품 그림 ID(assets/items) + 그림이 없을 때의 픽토그램
        if (!/^item_[a-z_]+$/.test(b.item || '')) err(ep, `받은 물건 ID는 item_… 이어야 해요: ${b.item}`);
        if (b.icon && !hasIcon(b.icon)) err(ep, `받은 물건 아이콘 없음: ${b.icon}`);
        break;
      case 'guide': // 버튼 알려 주기 안내(js/data/tutorial.js)
        totals.lines += 1;
        if (!GUIDE_KEYS.includes(b.key)) err(ep, `guide 종류 없음: ${b.key} (쓸 수 있는 것: ${GUIDE_KEYS.join(' ')})`);
        checkText(ep, b.text);
        break;
      case 'think': totals.lines += 1; checkFace(ep, 'jieun', b.face); checkText(ep, b.text); break; // 속마음 얼굴은 dialogue.js 처럼 yeonwoo 자리
      case 'phone': totals.lines += 1; if (!CHARS[b.from]) err(ep, `문자 보낸 사람 없음: ${b.from}`); checkText(ep, b.text); break;
      case 'memo': if (!Array.isArray(b.items) || b.items.length > 3) warn(ep, `메모는 3줄 이하 권장: ${b.title}`); (b.items || []).forEach(([ic, t]) => { if (!hasIcon(ic)) err(ep, `메모 아이콘 없음: ${ic}`); checkText(ep, t); }); break;
      case 'act': if (!hasIcon(b.icon)) err(ep, `행동 아이콘 없음: ${b.icon}`); if (b.sfx && !SFX_NAMES.includes(b.sfx)) err(ep, `효과음 없음: ${b.sfx}`); break;
      case 'snap': checkFace(ep, b.who, b.face); break;
      case 'photo': if (!PHOTOS[b.id]) err(ep, `사진 없음: ${b.id}`); break;
      case 'stamp': if (!SKILLS[b.skill]) err(ep, `스킬 없음: ${b.skill}`); break;
      case 'term': if (!findTerm(b.id)) err(ep, `말 사전 id 없음: ${b.id}`); break;
      case 'check':
        if (!Number.isInteger(b.n) || b.n < 1 || b.n > curSchedule.length) err(ep, `일정 번호가 일정표(${curSchedule.length}개) 밖: check(${b.n})`);
        checks.push(b.n);
        break;
      case 'meet': if (!CHARS[b.who]?.card) err(ep, `크루 카드가 없는 인물: meet('${b.who}')`); break;
      case 'cg': if (b.id !== null && !CG_IDS.includes(b.id)) err(ep, `이벤트 CG 없음: ${b.id} (js/data/cg.js)`); break;
      case 'chalk': if (b.text !== null && typeof b.text !== 'string') err(ep, 'chalk 글씨는 문자열 또는 null'); break;
      case 'seen': if (!Number.isInteger(b.n) || b.n < 1 || b.n > 11) err(ep, `숨은 장면 번호는 1~11: seen(${b.n})`); else seenUsed.push([ep, b.n]); break;
      case 'album': case 'eyes': if (ep !== ENDING?.id) err(ep, `${b.t}() 는 엔딩에만`); break;
      case 'secret': if (!REGULARS[b.who]) err(ep, `secret: 없는 단골 ${b.who}`); else secretUsed.add(b.who); break;
      case 'emote':
        if (!CHARS[b.who]) err(ep, `인물 없음: ${b.who}`);
        if (!EMOTES.includes(b.kind)) err(ep, `이모트 없음: ${b.kind}`);
        break;
      case 'label': labels.add(b.name); break;
      case 'jump': jumps.push(b.to); break;
      case 'set': flagsSet.add(b.flag); break;
      case 'branch': flagsUsed.push([ep, b.flag]); for (const l of Object.values(b.cases || {})) walk(ep, l, { nested: true }); break;
      case 'mini':
        if (!MINIS.includes(b.name)) err(ep, `미니게임 없음: ${b.name} (js/game/minigames/index.js 의 MINIGAMES)`);
        if (MINIGAME_SKINS[b.name] && b.skin && !MINIGAME_SKINS[b.name].includes(b.skin)) err(ep, `미니게임 ${b.name} 모양 없음: ${b.skin}`);
        if (b.skill && !SKILLS[b.skill]) err(ep, `스킬 없음: ${b.skill}`);
        if (b.oops) checkOops(ep, b.oops, `mini ${b.name}`);
        checkTimer(ep, b, `mini ${b.name}`);
        for (const e of MINIGAME_CHECKS[b.name]?.(b) || []) err(ep, `mini ${b.name} ${e}`);
        // 커피 만들기: 손님의 주문·고마움 말도 쉬운 한국어 검사
        for (const o of b.orders || []) for (const t of [o.say, o.thanks, o.miss, ...Object.values(o.reply || {})].filter(Boolean)) checkText(ep, t);
        // 둘러보기: 물건의 글 · 숨은 장면(seen)
        for (const sp of b.spots || []) {
          for (const l of sp.lines || []) checkText(ep, typeof l === 'string' ? l : l.text);
          if (sp.seen) seenUsed.push([ep, sp.seen]);
        }
        break;
      case 'respond': { // 한 잔의 마음: 기회의 내용(장면·힌트·선택지)은 아래 단골 검사에서 한 번만 봄
        flagsSet.add('touch');
        flagsSet.add('picks');
        if (!REGULARS[b.who]) { err(ep, `단골 없음: respond('${b.who}') (js/data/regulars.js)`); break; }
        if (!REGULARS[b.who].touches[b.touch]) { err(ep, `대응 기회 없음: respond('${b.who}', '${b.touch}')`); break; }
        const key = `${b.who}.${b.touch}`;
        if (touchUsed.has(key)) err(ep, `대응 기회를 두 번 부름: ${key} (이미 ${touchUsed.get(key)})`);
        else touchUsed.set(key, ep);
        totals.responds += 1;
        break;
      }
      case 'choose':
        if (b.flag) flagsSet.add(b.flag);
        if (b.q) checkText(ep, b.q);
        for (const o of b.options || []) {
          if (o.icon && !hasIcon(o.icon)) err(ep, `선택 아이콘 없음: ${o.icon}`);
          checkText(ep, o.label);
          if (o.set) Object.keys(o.set).forEach((k) => flagsSet.add(k));
          if (o.then) walk(ep, o.then, { nested: true });
          if (o.next) jumps.push(o.next);
        }
        break;
      case 'decide': {
        totals.decides += 1;
        if (b.q) checkText(ep, b.q);
        if (b.skill && !SKILLS[b.skill]) err(ep, `스킬 없음: ${b.skill}`);
        if (!b.id) warn(ep, `decide 에 id 권장: ${b.q}`);
        const oks = (b.choices || []).filter((c) => c.ok);
        if (!oks.length) err(ep, `좋은 선택이 없음: ${b.id}`);
        checkTimer(ep, b, `decide ${b.id}`);
        if ((b.choices || []).length < 2 || b.choices.length > 4) err(ep, `카드는 2~4장: ${b.id}`);
        for (const c of b.choices || []) {
          if (!hasIcon(c.icon)) err(ep, `카드 아이콘 없음: ${c.icon} (${b.id})`);
          checkText(ep, c.label);
          if (c.ok) {
            if (!c.praise) warn(ep, `좋은 선택에 칭찬이 없음: ${b.id}`);
            else if (Array.isArray(c.praise)) walk(ep, c.praise, { nested: true });
            else checkText(ep, c.praise);
            if (c.set) Object.keys(c.set).forEach((k) => flagsSet.add(k));
            if (c.next) jumps.push(c.next);
          } else {
            checkOops(ep, c.oops, `decide ${b.id}`);
            if (c.fail) walk(ep, c.fail, { nested: true });
            else warn(ep, `나쁜 선택에 결과 장면이 없음: ${b.id}`);
          }
        }
        break;
      }
      default: break;
    }
  }
  return { labels, jumps };
}

// 에피소드 목록(js/data/episodes/index.js): id 중복 · 막(ACTS)과 EPISODES 가 맞는지 · 엔딩은 EPISODES 밖에
{
  const ids = EPISODES.map((e) => e?.id);
  for (const id of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) err('index', `에피소드 id 중복: ${id}`);
  if (!ENDING?.id) err('index', 'ENDING(엔딩 자리)이 없음');
  else if (ids.includes(ENDING.id)) err('index', `엔딩(${ENDING.id})은 EPISODES 에 넣지 않아요(ENDING 으로 따로)`);
  const inActs = ACTS.flatMap((a) => a.ids || []);
  for (const id of inActs) if (!ids.includes(id)) err('index', `ACTS 에 있는데 EPISODES 에 없는 에피소드: ${id}`);
  for (const id of ids) if (!inActs.includes(id)) warn('index', `어느 막(ACTS)에도 없는 에피소드: ${id}`);
}

const summary = [];
for (const ep of [...EPISODES, ENDING].filter(Boolean)) {
  const id = ep.id || '(id 없음)';
  if (!Array.isArray(ep.script)) { err(id, 'script 배열이 없음'); continue; }
  const isEnding = ep === ENDING;
  const metaKeys = isEnding ? ['id', 'label', 'title', 'notice'] : ['id', 'label', 'title', 'goal', 'diary', 'schedule'];
  for (const k of metaKeys) if (!ep[k]) err(id, `메타 정보 '${k}' 없음`);
  if (isEnding) {
    // 엔딩 영수증(finish)은 직업 마1스톤의 규칙이라 요구하지 않음(새 엔딩 순서: PRD.md 5.8 · Q-16)
    for (const b of ep.script) if (NOT_IN_ENDING.has(b.t)) err(id, `엔딩에는 둘 수 없는 비트: ${b.t}`);
    if (ep.notice && (!ep.notice.title || !ep.notice.body)) err(id, '엔딩 뒤 알림(notice)에 title·body 가 필요함(main.js · hub.js)');
    if (!ep.cue) warn(id, '결과 화면 [엔딩 보기] 때 읽어 줄 안내(cue)가 없음(result.js 가 ENDING.cue 를 읽음)');
    for (const t of [ep.cue, ep.notice?.title, ep.notice?.body].filter(Boolean)) checkText(id, t);
  }
  (ep.schedule || []).forEach(([ic]) => { if (!hasIcon(ic)) err(id, `일정표 아이콘 없음: ${ic}`); });
  if (ep.photo && !PHOTOS[ep.photo]) err(id, `대표 사진 없음: ${ep.photo}`);
  if (ep.script[ep.script.length - 1]?.t !== 'end') err(id, '마지막 비트는 end() 이어야 함');
  const before = { ...totals };
  curSchedule = ep.schedule || [];
  checks = [];
  const { labels, jumps } = walk(id, ep.script);
  curSchedule.forEach((_, i) => {
    const n = checks.filter((c) => c === i + 1).length;
    if (n === 0) warn(id, `일정 ${i + 1}번을 마치는 check(${i + 1}) 가 없음`);
    if (n > 1) err(id, `check(${i + 1}) 가 ${n}번 있음`);
  });
  for (const j of jumps) if (!labels.has(j)) err(id, `없는 라벨로 점프: ${j}`);
  summary.push({ id, beats: totals.beats - before.beats, lines: totals.lines - before.lines, decides: totals.decides - before.decides, responds: totals.responds - before.responds, oops: totals.oops - before.oops });
}
{
  const seen = new Set();
  for (const [ep, fl] of flagsUsed) {
    if (flagsSet.has(fl) || seen.has(`${ep}|${fl}`)) continue;
    seen.add(`${ep}|${fl}`);
    warn(ep, `선택 기억 '${fl}' 를 정하는 곳이 없음(branch·onlyIf 가 봄)`);
  }
}

// 단골·대응 기회(js/data/regulars.js, PRD.md 8장): 힌트 두 번(사다리) · 맞는 대응 하나 · 신뢰 합 10 이하
{
  const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  for (const [who, r] of Object.entries(REGULARS)) {
    const rid = `단골 ${who}`;
    if (!CHARS[who]) err(rid, `characters.js 에 인물이 없음: ${who}`);
    if (!r.name) err(rid, '이름(name) 없음');
    if (!KINDS[r.wants]) err(rid, `맞는 대응 유형(wants)이 KINDS 에 없음: ${r.wants}`);
    const touches = Object.entries(r.touches || {});
    if (touches.length * 2 > 10) err(rid, `기회 ${touches.length}개: 신뢰 합이 10을 넘을 수 있음(기회는 5개까지)`);
    const nths = touches.map(([, t]) => t.nth);
    for (const n of new Set(nths.filter((x, i) => nths.indexOf(x) !== i))) err(rid, `몇 번째(nth) 중복: ${n}`);
    let prev = null;
    for (const [id, t] of [...touches].sort((a, b) => a[1].nth - b[1].nth)) {
      const where = `${who}.${id}`;
      if (!Number.isInteger(t.nth) || t.nth < 1 || t.nth > 5) err(where, `nth 는 1~5: ${t.nth}`);
      if (!SEASONS.includes(t.season)) err(where, `계절(season) 없음: ${t.season}`);
      else if (prev && SEASONS.indexOf(t.season) < SEASONS.indexOf(prev.season)) err(where, `계절 순서가 nth 와 어긋남(${prev.season} 뒤에 ${t.season})`);
      prev = t;
      if (!t.title) err(where, '제목(title) 없음');
      if (!t.why) err(where, '맞는 대응의 이유(why) 없음(선생님 보고서)');
      else checkText(where, t.why);
      if (t.q) checkText(where, t.q);
      walk(where, t.scene, { nested: true });
      // 힌트 사다리: 1~2번째는 그 사람의 대사 한 번 + 행동 한 번, 3번째부터는 대사 없이(행동·시선 둘)
      const hints = t.hints || [];
      if (hints.length !== 2) err(where, `힌트는 두 개: ${hints.length}개`);
      const spoken = hints.filter((h) => h?.t === 'say' && h.who === who).length;
      if (t.nth <= 2 && spoken !== 1) err(where, `${t.nth}번째 기회의 힌트는 ${who} 의 대사 한 번 + 행동 한 번(지금 대사 ${spoken}개)`);
      if (t.nth >= 3 && spoken) err(where, `${t.nth}번째 기회부터는 힌트에 ${who} 의 대사를 넣지 않아요(행동·시선만)`);
      walk(where, hints, { nested: true });
      const cs = t.choices || [];
      if (cs.length < 2 || cs.length > 4) err(where, `선택지는 2~4개: ${cs.length}개`);
      const best = cs.filter((c) => c.score === 2);
      if (best.length !== 1) err(where, `맞는 대응(score 2)은 하나: ${best.length}개`);
      else if (best[0].kind !== r.wants) warn(where, `맞는 대응의 유형(${best[0].kind})이 ${who} 에게 맞는 유형(${r.wants})과 다름`);
      const ids = cs.map((c) => c.id);
      for (const d of new Set(ids.filter((x, i) => ids.indexOf(x) !== i))) err(where, `선택지 id 중복: ${d}`);
      for (const c of cs) {
        if (!c.id) err(where, `선택지 id 없음: ${c.label}`);
        if (![0, 1, 2].includes(c.score)) err(where, `점수(score)는 2·1·0: ${c.id} ${c.score}`);
        if (!KINDS[c.kind]) err(where, `대응 유형(kind) 없음: ${c.id} ${c.kind}`);
        if (!hasIcon(c.icon)) err(where, `선택지 아이콘 없음: ${c.icon} (${c.id})`);
        checkText(where, c.label);
        if (!(c.after || []).length) warn(where, `반응 뒤 장면(after)이 없음: ${c.id}`);
        // 반응 연출을 글로도(PRD 8.6, 원칙 11): 맞음 = '오래 바라봄', 어긋남 = "괜찮아요"
        const afterText = (c.after || []).map((x) => x.text || '').join(' ');
        if (c.score === 2 && !/오래 바라/.test(afterText)) warn(where, `맞는 대응 뒤 장면에 '오래 바라봄'이 글로 없음: ${c.id}`);
        if (c.score === 0 && !/괜찮아/.test(afterText)) warn(where, `어긋난 대응 뒤 장면에 "괜찮아요"(반말 "괜찮아")가 없음: ${c.id}`);
        walk(where, c.after, { nested: true });
      }
      if (!touchUsed.has(where)) warn(where, '대본 어디에서도 부르지 않는 대응 기회');
    }
  }
}

// 비밀 장면(3단계): 단골마다 secret(who) 가 있는지(엔딩 앨범 액자)
for (const who of REGULAR_IDS) if (!secretUsed.has(who)) warn(`단골 ${who}`, `3단계 비밀 장면 secret('${who}') 이 없음(엔딩 앨범 액자가 열리지 않음)`);

// pick 조건: '사람.기회=선택지' 가 실제로 있는지
for (const [ep, v] of pickUsed) {
  const [key, want = ''] = String(v).split('=');
  const [who, tid] = key.split('.');
  const t = REGULARS[who]?.touches?.[tid];
  if (!t) { err(ep, `pick: 없는 대응 기회 ${key}`); continue; }
  for (const w of want.split('|')) if (!t.choices.some((c) => c.id === w)) err(ep, `pick: ${key} 에 없는 선택지 ${w}`);
}

// 사장의 숨은 장면 11(PRD 5.6): 이야기 어딘가에 seen(n) 이 한 번씩
{
  const count = new Map();
  for (const [, n] of seenUsed) count.set(n, (count.get(n) || 0) + 1);
  for (let n = 1; n <= 11; n++) {
    if (!count.get(n)) warn('사장의 눈', `숨은 장면 ${n} 을 보여 주는 seen(${n}) 이 없음`);
  }
}

// 메뉴·레시피 데이터(js/data/menu.js): 레시피의 컵·재료·온도·손 기술이 표에 있는지
for (const e of menuProblems()) err('menu', e);

// 미니게임 안에서 생기는 아차(js/game/minigames/index.js 의 MINIGAME_OOPS): 에피소드의 아차와 id 가 겹치지 않게
for (const o of MINIGAME_OOPS) checkOops('mini', o, 'mini');

console.log('\n에피소드별 요약');
console.table(summary);
console.log(`합계: 에피소드 ${EPISODES.length}편 + 엔딩 · 비트 ${totals.beats} · 대사 ${totals.lines}줄 · 글자 ${totals.chars} · 판단 ${totals.decides} · 대응 ${totals.responds} · 아차 ${totals.oops}`);
console.log(errors ? `\n✗ 오류 ${errors}개, 경고 ${warns}개` : `\n✓ 오류 없음 (경고 ${warns}개)`);
process.exit(errors ? 1 : 0);
