/**
 * 시나리오 실행기
 *  - 에피소드의 비트 배열을 순서대로 실행합니다.
 *  - 판단 카드(decide): 좋은 선택 → 칭찬·도장 / 나쁜 선택 → 결과 장면 → 아차! → 선택 직전으로 되감기
 *    급한 장면(decide 의 timer)은 막대가 줄어들고, 시간이 다 되면 '못 고른 결과' → 아차! → 되감기
 *  - 판단·선택·미니게임마다 '되감기 지점'과 자동 저장을 남깁니다.
 *  - 상단 [되감기] 버튼으로 지난 지점 어디로든 즉시 돌아갈 수 있습니다.
 * 새 게임의 대응 비트(respond)·작업대 비트(brew)는 여기에 더합니다(PRD.md 15.3).
 */

import { store } from './store.js';
import { bus } from './bus.js';
import { plain, fill, josa } from './text.js';
import { sleep, $ } from './dom.js';
import { showOops } from './oops.js';
import { checkCond } from './cond.js';
import { stage } from '../ui/stage.js';
import { dialogue } from '../ui/dialogue.js';
import { memo } from '../ui/memo.js';
import { hud } from '../ui/hud.js';
import { cards } from '../ui/cards.js';
import { ov } from '../ui/overlays.js';
import { breathe as breatheUI } from '../ui/breathe.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';
import { MINIGAMES } from '../game/minigames/index.js';
import { abortMinigame } from '../game/minigames/frame.js';
import { SKILLS } from '../data/skills.js';
import { vfx } from '../ui/vfx.js';
import { tutor } from '../ui/tutor.js';
import { timerBar, timerFactor } from '../ui/timer.js';
import { setCostumes } from '../data/characters.js';
import { findTerm } from '../data/glossary.js';
import { touchOf, REGULARS } from '../data/regulars.js';
import * as grow from './grow.js';

class Interrupt {
  constructor(kind, data) { this.kind = kind; this.data = data; }
}

let session = null;

function deferred() {
  let resolve;
  let reject;
  const p = new Promise((res, rej) => { resolve = res; reject = rej; });
  p.catch(() => {});
  return { p, resolve, reject };
}

function newSession(ep) {
  const labels = {};
  ep.script.forEach((b, i) => { if (b.t === 'label') labels[b.name] = i; });
  return { ep, labels, index: 0, epoch: 0, stamps: [], points: [], photos: [], terms: [], interrupt: deferred(), earplugs: false, today: null };
}

/* ------------------------------------------------------------------ */
/* 상태 저장·복원                                                        */
/* ------------------------------------------------------------------ */
function snapshot(s) {
  const st = stage.getState();
  if (s.cgOff) { st.cg = null; st.chalk = null; } // 걷기로 한 CG(flushCgOff 전)는 없는 것으로
  return {
    stage: st,
    memo: memo.getState(),
    time: hud.getTime(),
    place: hud.getPlace(),
    sched: hud.getSchedule().done,
    audio: audio.state(),
    earplugs: s.earplugs,
    today: s.today ? { ...s.today } : null, // 오늘의 칠판이 바꾸는 일(남은 얼음 · 우유 …)
    flags: { ...(store.active()?.flags || {}) },
  };
}

function clearTask() {
  abortMinigame(); // 미니게임 도중 되감기·나가기: 실시간 고리·방향키까지 정리
  cards.close();
  $('#layer-task').replaceChildren();
  document.body.classList.remove('tasking', 'mg-open', 'mg-scene-open');
}

/** keepFlags: 선택 기억은 그대로(다른 해에 저장한 칸을 불러올 때) */
function restore(s, snap, { keepFlags = false } = {}) {
  s.cgOff = false;
  tts.stop();
  ov.clearAll();
  clearTask();
  dialogue.clear();
  stage.restore(snap.stage);
  memo.restore(snap.memo);
  hud.setTime(snap.time);
  hud.setPlace(snap.place || '');
  hud.setSchedule(s.ep.schedule, snap.sched || []);
  audio.bgm(snap.audio?.mood || null);
  audio.ambience(snap.audio?.ambience || null, snap.audio?.ambLevel || 1);
  s.earplugs = Boolean(snap.earplugs);
  s.today = snap.today ? { ...snap.today } : null;
  audio.setEarplugs(s.earplugs);
  stage.effect('earplugs', s.earplugs);
  if (!keepFlags) store.restoreFlags(snap.flags);
}

function addPoint(s, index, title, snap) {
  s.points = s.points.filter((p) => p.index !== index);
  s.points.push({ index, title: String(title).slice(0, 40), snap, at: Date.now() });
  if (s.points.length > 15) s.points.shift();
  hud.setRewindEnabled(true);
  bus.emit('rewind-points', s.points.length);
}

// 자유 영업은 날마다 id 가 'free' 로 같아서 몇 번째 날인지(free)도 적어 둠: 다른 날의 비트 번호로 이어 가지 않게(검수 13.39 4번 · 7번)
const dayOf = (ep) => (ep.free ? { free: ep.free } : {});

function save(s, index, name, snap) {
  // dayAt: 이 날을 처음부터 시작한 때(이어 하기로 마쳐도 하루 끝 화면이 아침의 기록까지 셈, 검수 13.39 27번)
  store.setCheckpoint({ ep: s.ep.id, ...dayOf(s.ep), year: store.year(), index, name, dayAt: s.dayAt, snapshot: snap || snapshot(s) });
  hud.saved();
}

function target(s, name) {
  if (!(name in s.labels)) throw new Error(`[runner] 없는 라벨: ${name}`);
  return s.labels[name];
}

/* ------------------------------------------------------------------ */
/* 보상                                                                  */
/* ------------------------------------------------------------------ */
/** quiet: 컷인이 이미 스킬과 별을 보여 줬으면 토스트 대신 별이 수첩으로 날아감 */
function award(s, skill, level, { quiet = false } = {}) {
  if (!SKILLS[skill]) return;
  store.awardStamp(skill, level);
  s.stamps.push({ skill, level });
  audio.sfx('stamp');
  if (quiet) vfx.flyStars({ x: 960, y: 470 }, hud.stampTarget(), { n: level });
  else ov.toast(`${SKILLS[skill].name} 도장 ${'★'.repeat(level)}${'☆'.repeat(3 - level)}`, SKILLS[skill].icon);
}

/** 좋은 결과 연출: '잘했어요' 컷인 → 도장(별이 수첩으로) */
async function celebrate(s, w, { skill = null, level = 3, title = '' }) {
  await w(ov.cutin({ skill: SKILLS[skill] ? skill : null, level, title }));
  if (skill) award(s, skill, level, { quiet: true });
}

function highlightRef(ref) {
  if (ref) memo.highlight(Number(ref));
}

// 판단·선택 질문의 기본 인물: 주인공 지은(속마음으로 보임)과 도와주는 사장님(tools/export-lines.mjs 도 같은 규칙)
function qKind(b) {
  if (b.who === 'jieun') return 'think';
  if (b.who === 'sys') return 'sys';
  return 'say';
}

function praiseBeats(praise, b) {
  if (Array.isArray(praise)) return praise;
  return [{ t: 'say', who: b.mentor || 'owner', face: 'smile', text: praise }];
}

function defaultHelp(b) {
  if (b.memo) return `메모 ${b.memo}번을 같이 볼까요? 거기에 힌트가 있어요.`;
  return '천천히 다시 생각해 봐요. 무엇이 가장 안전할까요?';
}

/* ------------------------------------------------------------------ */
/* 비트 실행                                                             */
/* ------------------------------------------------------------------ */
// 장면만 바꾸는 비트(학생이 누르거나 기다리지 않음). 이어진 것끼리 한 묶음으로 함(quietBatch)
const QUIET = new Set(['bg', 'bgm', 'amb', 'sfx', 'show', 'enter', 'leave', 'face', 'camera', 'fx', 'earplugs', 'cg', 'time', 'place', 'label', 'set', 'seen', 'secret', 'today', 'memo', 'memoHi', 'term', 'stamp', 'checkpoint']);
// 무대(배경 · 인물 · 카메라)를 바꾸는 비트. 표정은 넣지 않음(이미 서 있는 사람이라 CG 가 들어오는 동안 바뀌어도 됨)
const STAGE_MOVE = new Set(['bg', 'show', 'enter', 'leave', 'camera']);
// 미니게임 뒤 가림막을 걷지 않고 지나가는 비트: 이어지는 미니게임 · 대응(그 안의 비트가 정함) · 갈림길 · 끝
const COVER_KEEP = new Set(['mini', 'respond', 'branch', 'jump', 'end']);
// 걷기로 한 CG 를 그대로 두고 지나가는 비트: 대응(그 안의 비트가 정함) · 갈림길
const CG_KEEP = new Set(['respond', 'branch', 'jump']);

/**
 * cg(null) 은 곧바로 걷지 않고, 학생이 볼 다음 비트 앞에서 걷음(s.cgOff). 그 사이의 장면 바꾸기(나가는 인물 · 배경 · 새 인물)는
 * CG 아래에서 끝나서, 걷힐 때 앞 인물 · 앞 배경이 비치지 않음. 대응의 뒤 장면 끝의 cg(null) 처럼 묶음 밖으로 이어져도 같음(검수 13.39 11번)
 */
function flushCgOff(s) {
  if (!s.cgOff) return;
  s.cgOff = false;
  stage.settle(); // 등장 · 퇴장 움직임은 끝난 모습으로
  stage.setCg(null);
}

/** 비트를 기다린 뒤 되감기 · 나가기로 달라졌으면 그만둠(epoch) */
function guard(s) {
  const E = s.epoch;
  return async (p) => {
    const r = await p;
    if (s.epoch !== E) throw new Interrupt('stale');
    return r;
  };
}

/** 조건부 비트(onlyIf)가 돌지: 묶음의 첫 비트가 이미 정한 것은 그대로 */
function willRun(s, b) {
  if (!b.if) return true;
  if (b.ifGroup && !b.ifFirst && s.ifGroups && b.ifGroup in s.ifGroups) return s.ifGroups[b.ifGroup];
  return checkCond(b.if, (k) => store.flag(k), { album: store.album() });
}

/**
 * 장면만 바꾸는 비트 묶음 seq[k..]을 한꺼번에(검수 13.39 11번):
 *  - 묶음 끝에 CG 가 켜지고 무대도 바뀌면, CG 를 먼저 덮은 뒤 그 아래에서 배경 · 인물을 바꿈(인물이 잠깐 떴다가 CG 에 가려지지 않게)
 *  - CG 가 꺼지는 것은 묶음이 끝난 뒤 학생이 볼 비트 앞에서(flushCgOff): 그 전의 바꾸기는 CG 아래에서
 *  - 미니게임 뒤 가림막 아래에서는 그냥 차례로(가림막이 가림)
 * top: 에피소드의 비트(번호가 저장 지점 · 라벨에 쓰임). 돌려줌: { next: 다음 비트 번호 }
 */
async function quietBatch(s, seq, k, top, w) {
  let j = k;
  while (j < seq.length && QUIET.has(seq[j].t)) j += 1;
  const now = s.cgOff ? null : stage.cgId(); // 걷기로 한 CG 는 없는 것으로
  let cg = now;
  let moves = false;
  for (let i = k; i < j; i++) {
    const b = seq[i];
    if (!willRun(s, b)) continue;
    if (b.t === 'cg') cg = b.id || null;
    else if (b.t === 'bg') cg = null; // 배경을 바꾸면 CG 가 꺼짐(stage.setBg)
    if (STAGE_MOVE.has(b.t)) moves = true;
  }
  const hold = moves && !stage.isCovered() && cg && cg !== now ? cg : null;
  if (hold) { s.cgOff = false; stage.setCg(cg); await w(stage.cgSettled()); } // CG 를 먼저 덮음(걷기로 한 앞 CG 위로)
  s.cgHold = hold;
  try {
    for (let i = k; i < j; i++) await w(exec(s, seq[i], top ? i : null));
  } finally {
    s.cgHold = null;
  }
  return { next: j };
}

async function runSub(s, list, w) {
  const seq = list || [];
  for (let k = 0; k < seq.length;) {
    if (QUIET.has(seq[k].t)) { k = (await quietBatch(s, seq, k, false, w)).next; continue; }
    await w(exec(s, seq[k], null));
    k += 1;
  }
}

async function exec(s, b, index) {
  const w = guard(s);

  // 조건부 비트(선택 기억). onlyIf 묶음은 첫 비트에서 한 번만 검사
  if (b.if) {
    s.ifGroups = s.ifGroups || {};
    const cond = () => checkCond(b.if, (k) => store.flag(k), { album: store.album() });
    let ok;
    if (b.ifGroup) {
      if (b.ifFirst || !(b.ifGroup in s.ifGroups)) s.ifGroups[b.ifGroup] = cond();
      ok = s.ifGroups[b.ifGroup];
    } else ok = cond();
    if (!ok) return undefined;
  }

  // 미니게임 뒤 가림막: 학생이 볼 비트가 오면 걷음. 그 전의 장면 바꾸기는 가림막 아래에서 곧바로 됨(검수 13.39 10번)
  if (stage.isCovered() && !QUIET.has(b.t) && !COVER_KEEP.has(b.t)) await w(stage.uncover());
  if (s.cgOff && !QUIET.has(b.t) && !CG_KEEP.has(b.t)) flushCgOff(s);

  switch (b.t) {
    case 'bg': await w(stage.setBg(b.id, b.variant, { keepCg: Boolean(s.cgHold || s.cgOff) })); return undefined;
    case 'bgm': audio.bgm(b.mood); return undefined;
    case 'amb': audio.ambience(b.kind, b.level || 1); return undefined;
    case 'sfx': audio.sfx(b.name); return undefined;
    case 'show': stage.setCast(b.cast); await w(sleep(150)); return undefined;
    case 'enter': stage.enter(b.slot, b.who); await w(sleep(150)); return undefined;
    case 'leave': stage.leave(b.who); return undefined;
    case 'face': stage.setFace(b.who, b.face); return undefined;
    case 'motion': stage.motion(b.who, b.type); return undefined;
    case 'camera': stage.camera(b.mode); return undefined;
    case 'fx': stage.effect(b.name, b.on); return undefined;
    case 'earplugs':
      s.earplugs = b.on;
      audio.setEarplugs(b.on);
      stage.effect('earplugs', b.on);
      return undefined;

    case 'say':
    case 'narr':
    case 'think':
    case 'sys':
      await w(dialogue.line({ kind: b.t, who: b.who, face: b.face, text: b.text }));
      return undefined;
    case 'phone': await w(ov.phone({ from: b.from, text: b.text })); return undefined;
    case 'guide': // 버튼 알려 주기: 이미 배운 버튼이면 안내 대사를 건너뜀
      if (!tutor.wants(b.key)) return undefined;
      if (b.key === 'timer' && !timerFactor()) return undefined; // 시간 제한을 끈 학생에게는 막대 안내가 필요 없음
      tutor.arm(b.key, b.span);
      await w(dialogue.line({ kind: 'sys', text: b.text }));
      return undefined;

    case 'time': hud.setTime(b.v); return undefined;
    case 'place': {
      ov.place(b.time, b.text);
      hud.setPlace(b.text);
      const hm = String(b.time || '').match(/(\d{1,2}:\d{2})/);
      if (hm) hud.setTime(hm[1]);
      return undefined;
    }
    case 'big': dialogue.hide(); await w(ov.big(b.text, b.sub)); dialogue.show(); return undefined;
    case 'schedule': dialogue.hide(); await w(ov.schedule(s.ep)); dialogue.show(); return undefined;
    case 'check': hud.checkStep(b.n); await w(ov.check(b.n, s.ep.schedule?.[b.n - 1])); return undefined;
    case 'meet': if (store.meet(b.who)) await w(ov.crewCard(b.who)); return undefined;
    case 'cg':
      if (s.cgHold) { if (b.id && b.id === s.cgHold) store.unlockPhoto(`cg_${b.id}`); return undefined; } // 묶음(quietBatch)이 CG 를 맡음
      if (!b.id) { // 걷기는 학생이 볼 다음 비트 앞에서(flushCgOff). 가림막 아래에서는 곧바로
        if (stage.cgId() && !stage.isCovered()) s.cgOff = true;
        else stage.setCg(null);
        return undefined;
      }
      s.cgOff = false;
      if (stage.setCg(b.id)) store.unlockPhoto(`cg_${b.id}`);
      return undefined;
    case 'chalk': stage.chalk(b.text, { shaky: b.shaky }); await w(sleep(b.text ? Math.min(2600, 400 + String(b.text).length * 120) : 0)); return undefined;
    case 'seen': // 사장의 숨은 뒷받침: 알림 없이 기록만(PRD 5.6 ✅)
      store.setFlag('seen', { ...(store.flag('seen') || {}), [b.n]: true });
      store.log({ type: 'seen', ep: s.ep.id, n: b.n });
      return undefined;
    case 'secret': store.openAlbum(b.who); store.log({ type: 'secret', ep: s.ep.id, who: b.who }); return undefined;
    case 'album': dialogue.hide(); await w(ov.album()); return undefined;
    case 'eyes': dialogue.hide(); await w(ov.eyes()); return undefined;
    case 'emote': stage.emote(b.who, b.kind); return undefined;
    case 'memo': memo.set(b.title, b.items); await w(sleep(250)); return undefined;
    case 'memoHi': memo.highlight(b.n); return undefined;
    case 'info': await w(ov.info({ title: b.title, body: b.body, icon: b.icon })); return undefined;
    case 'today': s.today = { ...(b.mods || {}) }; return undefined; // 오늘의 칠판이 그날 일을 바꿈: 미니게임 옵션의 today 로(작업대 · 몰림)

    case 'act': await w(ov.act({ label: fill(b.label), icon: b.icon, sfx: b.sfx })); return undefined;
    case 'breathe': {
      const done = await w(breatheUI({ cycles: b.cycles, note: b.note }));
      if (done && b.skill) award(s, b.skill, 3);
      store.log({ type: 'breathe', ep: s.ep.id, done });
      return undefined;
    }

    case 'snap': await w(ov.snap({ who: b.who, face: b.face, title: b.title, caption: fill(b.caption) })); return undefined;
    case 'photo': s.photos.push(b.id); await w(ov.photo(b.id)); return undefined;
    case 'got': await w(ov.got({ item: b.item, title: fill(b.title || ''), icon: b.icon })); return undefined;
    case 'stamp': award(s, b.skill, b.level || 3); return undefined;
    case 'term': {
      const t = findTerm(b.id);
      if (t && store.unlockTerm(t.id)) {
        s.terms.push(t.id);
        audio.sfx('jingle_unlock');
        ov.toast(`말 사전에 '${t.word}'${josa(t.word, '이/가').slice(t.word.length)} 들어왔어요`, 'book');
      }
      return undefined;
    }
    case 'finish': dialogue.hide(); await w(ov.finish({ title: b.title, sub: b.sub })); dialogue.show(); return undefined;
    // 엔딩 연출: 대화창은 다음 대사가 나올 때 다시 보임(연출 사이에 지난 대사가 깜빡 보이지 않게)
    case 'credits': dialogue.hide(); await w(ov.credits()); return undefined;
    case 'letter': dialogue.hide(); await w(ov.letter({ to: fill(b.to), lines: b.lines, ps: b.ps, from: b.from, speech: b.speech })); return undefined;

    case 'label': return undefined;
    case 'jump': return { jump: target(s, b.to) };
    case 'set': store.setFlag(b.flag, b.value); return undefined;
    case 'branch': {
      const v = store.flag(b.flag);
      const list = (v !== undefined && v !== null && b.cases[String(v)]) || b.cases._ || [];
      await runSub(s, list, w);
      return undefined;
    }
    case 'checkpoint': save(s, index, b.name); return undefined;
    case 'wait': await w(sleep(b.ms)); return undefined;
    case 'end': return { end: true };

    case 'decide': return decideBeat(s, b, index, w);
    case 'choose': return chooseBeat(s, b, index, w);
    case 'mini': return miniBeat(s, b, index, w);
    case 'respond': return respondBeat(s, b, index, w);
    default:
      console.warn('[runner] 알 수 없는 비트', b);
      return undefined;
  }
}

/* ---------------- 판단 카드 ---------------- */
async function decideBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const snap = snapshot(s);
  addPoint(s, index, b.title || plain(fill(b.q || '판단')), snap);
  save(s, index, id, snap);
  const t0 = performance.now();
  const tried = new Set();
  const okIdx = b.choices.map((c, i) => (c.ok ? i : -1)).filter((i) => i >= 0);
  const helpLv = store.settings().help;
  let picks = 0;
  let fails = 0;
  let helps = 0;
  let timeouts = 0;
  let glow = -1;

  for (;;) {
    if (b.q) await w(dialogue.line({ kind: qKind(b), who: b.who || 'owner', face: b.face, text: b.q, noWait: true }));
    // 시간 제한(급한 장면): 설정 배율 · 한 번 실패한 뒤에는 1.5배 · 두 번 넘게 실패하면 막대 없이
    const factor = b.timer ? timerFactor() : 0;
    const tm = factor && fails < 2 ? timerBar({ sec: (b.timer.sec || 15) * factor * (fails ? 1.5 : 1), label: b.timer.label }) : null;
    const res = await w(cards.present(b, { tried, glow, timer: tm }));

    if (res.type === 'help') {
      helps += 1;
      cards.close();
      highlightRef(b.memo);
      await w(dialogue.line({ kind: 'say', who: b.helper || 'owner', face: 'teach', text: b.help || defaultHelp(b) }));
      if (helps >= 2 && okIdx.length) glow = okIdx[0];
      store.log({ type: 'help', ep: s.ep.id, id });
      continue;
    }

    picks += 1;
    if (res.type === 'timeout') {
      // 시간이 다 됨: 아무것도 못 고른 결과(멈춰 버린 카드와 같은 결과, 또는 따로 쓴 장면) → 아차! → 되감기
      fails += 1;
      timeouts += 1;
      await w(sleep(1000)); // '시간이 다 됐어요!'를 보여 주고 읽어 줌
      cards.close();
      const as = b.timer.as ? b.choices.find((x) => !x.ok && x.icon === b.timer.as) : null;
      const oops = b.timer.oops || as?.oops || { id: `${id}:time`, title: '시간이 다 됐어요', lesson: '급할 때는 생각보다 먼저 정해진 말과 행동을 해요.', icon: 'hourglass' };
      store.log({ type: 'fail', ep: s.ep.id, id, chosen: '시간 초과', oops: oops.id, timeout: true });
      await runSub(s, b.timer.fail || as?.fail || [], w);
      await w(showOops(oops));
      restore(s, snap);
      if (helpLv !== 'self') highlightRef(b.memo);
      const glowAfterT = helpLv === 'many' ? 1 : helpLv === 'some' ? 2 : 3;
      if (fails >= glowAfterT && okIdx.length) glow = okIdx[0];
      continue;
    }
    const c = b.choices[res.index];
    if (c.ok) {
      // 별 = 고를 때 실제로 보인 도움: 정답 반짝임 → 함께 · 아차(되감기)·메모 강조·도움 버튼 → 조금 도움 · 없음 → 스스로
      const level = glow >= 0 ? 1 : fails || helps ? 2 : 3;
      await w(cards.success(res.index, { great: level === 3 }));
      cards.close();
      memo.clearHighlight();
      await celebrate(s, w, { skill: b.skill, level, title: b.title });
      store.log({
        type: 'decide', ep: s.ep.id, id, q: plain(fill(b.q || b.title || '')), skill: b.skill || null,
        picks, rewinds: fails, helps, timeouts, level, chosen: plain(fill(c.label)),
        tried: [...tried].map((i) => plain(fill(b.choices[i].label))), ms: Math.round(performance.now() - t0),
      });
      if (c.set) for (const [k, v] of Object.entries(c.set)) store.setFlag(k, v);
      if (c.praise) await runSub(s, praiseBeats(c.praise, b), w);
      if (c.next) return { jump: target(s, c.next) };
      return undefined;
    }

    // 나쁜 선택: 결과 장면 → 아차! → 선택 직전으로 되감기
    fails += 1;
    await w(cards.markBad(res.index));
    cards.close();
    tried.add(res.index);
    store.log({ type: 'fail', ep: s.ep.id, id, chosen: plain(fill(c.label)), oops: c.oops?.id || null });
    if (c.fail) await runSub(s, c.fail, w);
    await w(showOops(c.oops || { id: `${id}:${res.index}`, title: '다시 생각해 봐요', lesson: c.hint || '', icon: 'think' }));
    restore(s, snap);
    // 되감은 뒤 도움(설정: 도움 많이 / 보통 / 스스로)
    if (helpLv !== 'self') highlightRef(b.memo);
    const glowAfter = helpLv === 'many' ? 1 : helpLv === 'some' ? 2 : 3;
    if (fails >= glowAfter && okIdx.length) glow = okIdx[0];
  }
}

/* ---------------- 자유 선택 ---------------- */
async function chooseBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const snap = snapshot(s);
  addPoint(s, index, b.title || plain(fill(b.q || '선택')), snap);
  save(s, index, id, snap);
  if (b.q) await w(dialogue.line({ kind: qKind(b), who: b.who || 'jieun', face: b.face, text: b.q, noWait: true }));
  const i = await w(cards.ask(b.options, { variant: b.variant || '' }));
  const o = b.options[i];
  cards.close();
  if (b.flag) store.setFlag(b.flag, o.value);
  if (o.set) for (const [k, v] of Object.entries(o.set)) store.setFlag(k, v);
  store.log({ type: 'choose', ep: s.ep.id, id, value: o.value, chosen: plain(fill(o.label)) });
  if (o.then) await runSub(s, o.then, w);
  if (o.next) return { jump: target(s, o.next) };
  return undefined;
}

/* ---------------- 한 잔의 마음 (단골 대응, PRD.md 8장) ---------------- */
// 반응 연출: 점수 0 = 작은 끄덕임 · 1 = 미소 · 2 = 오래 바라봄. 점수는 보여 주지 않고, 반응은 뒤 장면(after)의 글로도 전함
const REACT = {
  0: { motion: 'nod', ms: 500 },
  1: { face: 'smile', sfx: 'clink', ms: 700 },
  2: { face: 'smile', emote: 'heart', sfx: 'heart', ms: 1400 },
};

function shuffledIndex(n) {
  const a = [...Array(n).keys()];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function respondBeat(s, b, index, w) {
  const t = touchOf(b.who, b.touch);
  if (!t) { console.warn('[runner] 없는 대응 기회', b.who, b.touch); return undefined; }
  const id = `${b.who}.${b.touch}`;
  // 이어 하기는 이 장면부터. 되감기 지점은 만들지 않음: 숨은 점수를 찾아 다시 고르는 놀이가 되지 않게(PRD.md 8.7)
  save(s, index, id, snapshot(s));
  const t0 = performance.now();
  await runSub(s, t.scene, w);
  await runSub(s, t.hints, w);
  let replays = 0;
  for (;;) {
    if (t.q) await w(dialogue.line({ kind: 'think', text: t.q, noWait: true }));
    // 볼 때마다 순서를 섞음: 정답 자리를 외우지 않게
    const order = shuffledIndex(t.choices.length);
    const res = await w(cards.present({ choices: order.map((i) => t.choices[i]), helpLabel: '힌트 다시 보기' }));
    cards.close();
    if (res.type === 'help') {
      replays += 1;
      store.log({ type: 'hint', ep: s.ep.id, id });
      await runSub(s, t.hints, w);
      continue;
    }
    const c = t.choices[order[res.index]];
    // 신뢰 = 기회마다 마지막 대응의 점수(선택 기억 'touch'). 되감기·저장과 함께 돌아감
    store.setFlag('touch', { ...(store.flag('touch') || {}), [id]: c.score });
    // 고른 대응(선택지 id): 그 뒤 장면이 고른 것에 따라 달라질 때 onlyIf({ pick: '사람.기회=선택지' }) 가 봄(예: 지안이 고른 색의 음료)
    store.setFlag('picks', { ...(store.flag('picks') || {}), [id]: c.id });
    store.log({
      type: 'respond', ep: s.ep.id, id, who: b.who, touch: b.touch, season: t.season, nth: t.nth,
      choice: c.id, kind: c.kind, score: c.score, chosen: plain(fill(c.label)), replays, ms: Math.round(performance.now() - t0),
    });
    const fx = REACT[c.score] || REACT[0];
    // 힌트 CG 가 떠 있으면 잠깐 걷어 그 사람의 반응(끄덕임 · 미소 · 오래 바라봄)이 보이게 함. CG 아래 인물은 숨어 있어 반응이 보이지 않았음(검수 13.39 12번).
    // 반응 뒤에는 늘 CG 로 돌아감: 맞는 대응은 그 장면만의 CG(after 맨 앞), 나머지는 힌트 CG. 셋 다 같은 모양이라 CG 로 점수가 드러나지 않음(R-25)
    flushCgOff(s);
    const hintCg = stage.cgId();
    const lift = Boolean(hintCg) && stage.isOnStage(b.who);
    if (lift) { stage.setCg(null); await w(stage.cgSettled()); }
    if (fx.motion) stage.motion(b.who, fx.motion);
    if (fx.face) stage.setFace(b.who, fx.face);
    if (fx.emote) stage.emote(b.who, fx.emote);
    if (fx.sfx) audio.sfx(fx.sfx);
    await w(sleep(fx.ms));
    if (lift && c.after?.[0]?.t !== 'cg') stage.setCg(hintCg);
    await runSub(s, c.after, w);
    // 지은의 성장(재미 개편 6장): 단골을 만난 것(기억 · 응대) + 기억 카드 '오늘 알게 된 것'.
    // 카드는 고른 대응과 관계없이 늘 받음(점수가 드러나지 않게, 원칙 1). 수첩의 단골 쪽에 남음
    grow.add('respond');
    if (t.card && grow.addCard(id)) {
      audio.sfx('page');
      ov.toast(`수첩에 ${REGULARS[b.who]?.name || ''}의 기억 카드가 생겼어요`, 'book');
    }
    return undefined;
  }
}

/* ---------------- 미니게임 ---------------- */
async function miniBeat(s, b, index, w) {
  const id = b.id || `${s.ep.id}@${index}`;
  const snap = snapshot(s);
  addPoint(s, index, b.title || b.name, snap);
  save(s, index, id, snap);
  const fn = MINIGAMES[b.name];
  if (!fn) { console.warn('[runner] 없는 미니게임', b.name); return undefined; }
  // 미니게임 판 아래를 가림막으로 덮어 둠(판과 함께 0.25초). 끝나고 판이 걷힐 때 앞 장면 · 지난 대사가 다시 비치지 않고,
  // 다음 장면은 가림막 아래에서 다 바꾼 뒤 걷음(exec). 대화창은 비우고 다음 대사까지 숨김(big · finish 뒤 dialogue.show 에서도 지난 대사가 나오지 않게, 검수 13.39 10번)
  dialogue.clear();
  dialogue.hide();
  stage.cover({ fade: true });
  // 그 날의 계절 = 손맛 단계(frame.js TIMING) · 오늘의 칠판(today: 같은 날의 미니게임이 함께 씀, 남은 얼음 · 우유가 이어짐)
  const r = await w(fn({ ...b, season: b.season || s.ep.season || null, today: b.today || s.today || null }));
  if (r?.aborted) return undefined; // 도중에 정리됨(되감기·나가기): 이 장면은 이미 끝남
  // 미니게임이 돌려준 자세한 기록(커피 만들기: 만든 메뉴·다시 만들기·보기·손 기술마다 알맞음 수·라테아트·단계·턴 방식)
  const detail = {};
  for (const k of ['served', 'made', 'cups', 'remakes', 'kept', 'watched', 'skills', 'art', 'turn', 'asked', 'spills', 'looked', 'cleared', 'helped', 'seen', 'held', 'moved', 'kid']) if (r?.[k] !== undefined) detail[k] = r[k];
  if (r?.adapted?.length) detail.adapted = r.adapted; // 오늘의 칠판에 맞춰 손님에게 권한 것(선생님 화면 비고)
  if (r?.level !== undefined) detail.stage = r.level;
  if (r?.quit) { // [그만하기]: 남은 일은 지은이 알아서 함(frame.js QUIT_ASK). 축하·별 없이 다음 장면으로
    store.log({ type: 'mini', ep: s.ep.id, id, name: b.name, title: b.title || null, skill: b.skill || null, quit: true, attempts: r.attempts || 0, mistakes: r.mistakes || 0, ms: Math.round(r.ms || 0), ...detail });
    return undefined;
  }
  const level = r.attempts === 1 && r.mistakes === 0 ? 3 : r.attempts <= 2 && r.mistakes <= 2 ? 2 : 1;
  if (!r.noCheer) await celebrate(s, w, { skill: b.skill, level, title: b.title });
  store.log({ type: 'mini', ep: s.ep.id, id, name: b.name, title: b.title || null, skill: b.skill || null, attempts: r.attempts, mistakes: r.mistakes, level, ms: Math.round(r.ms || 0), ...detail });
  return undefined;
}

/* ------------------------------------------------------------------ */
/* 실행 루프                                                             */
/* ------------------------------------------------------------------ */
async function loop(s) {
  while (s.index < s.ep.script.length) {
    const b = s.ep.script[s.index];
    s.current = b;
    s.beatSnap = snapshot(s); // 수동 저장(세이브 슬롯)은 '지금 비트가 시작된 순간'을 저장
    let r;
    try {
      const p = QUIET.has(b.t) ? quietBatch(s, s.ep.script, s.index, true, guard(s)) : exec(s, b, s.index);
      p.catch(() => {});
      r = await Promise.race([p, s.interrupt.p]);
    } catch (e) {
      if (!(e instanceof Interrupt)) throw e;
      s.epoch += 1;
      s.interrupt = deferred();
      if (e.kind === 'abort') return 'aborted';
      if (e.kind === 'jump') {
        const pt = e.data;
        s.points = s.points.filter((p) => p.index < pt.index);
        restore(s, pt.snap);
        await ov.rewindFx();
        s.index = pt.index;
        continue;
      }
      continue;
    }
    if (r && r.end) return 'ended';
    if (r && r.jump !== undefined) { s.index = r.jump; continue; }
    if (r && r.next !== undefined) { s.index = r.next; continue; }
    s.index += 1;
  }
  return 'ended';
}

export const runner = {
  /** 에피소드 실행. resume: store.checkpoint() 값 */
  async play(ep, { resume = null } = {}) {
    if (session) runner.abort();
    const s = newSession(ep);
    session = s;
    ov.clearAll();
    clearTask();
    dialogue.clear();
    dialogue.resetHistory();
    dialogue.show();
    setCostumes(ep.costume);
    tutor.setEpisode(ep.id);
    hud.setEpisode(ep.label, ep.title);
    hud.setTime('');
    hud.setPlace('');
    hud.setSchedule(ep.schedule, []);
    hud.setRewindEnabled(false);
    hud.show();
    s.dayAt = Date.now();
    if (resume && resume.ep === ep.id && (resume.free ?? ep.free) === ep.free) {
      // 다른 해에 저장한 칸: 선택 기억(신뢰 · 고른 대응 · 숨은 장면)은 되살리지 않음. 새해는 관계가 처음부터(store.newYear, 검수 13.39 23번).
      // 해가 적히기 전의 저장 칸(note 가 있음)은 첫해에만 되살림. 자동 저장은 새해에 지워지므로 늘 이번 해
      const sameYear = (resume.year ?? ('note' in resume ? 1 : store.year())) === store.year();
      restore(s, resume.snapshot, { keepFlags: !sameYear });
      if (resume.dayAt) s.dayAt = resume.dayAt; // 자동 저장(이어 하기): 그날을 시작한 때 그대로
      s.index = resume.index;
      // 세이브 슬롯에서 불러온 경우: 이 에피소드에서 모은 도장·사진·말도 함께
      if (Array.isArray(resume.stamps)) s.stamps = [...resume.stamps];
      if (Array.isArray(resume.photos)) s.photos = [...resume.photos];
      if (Array.isArray(resume.terms)) s.terms = [...resume.terms];
    } else {
      stage.clear();
      memo.clear();
      audio.stopAll();
    }
    const t0 = Date.now();
    const status = await loop(s);
    store.addPlayTime(Date.now() - t0);
    if (session === s) { session = null; tutor.setEpisode(null); }
    tts.stop();
    return { status, stamps: s.stamps, photos: s.photos, terms: s.terms, ms: Date.now() - t0, dayAt: s.dayAt };
  },

  rewindPoints() { return session ? session.points.slice().reverse() : []; },

  /** 세이브 슬롯에 넣을 지금 상태. 진행 중인 비트가 시작된 순간으로 저장합니다(불러오면 그 비트부터 다시) */
  captureSave() {
    const s = session;
    if (!s || !s.beatSnap) return null;
    const last = dialogue.history().slice(-1)[0] || null;
    return {
      ep: s.ep.id,
      ...dayOf(s.ep),
      year: store.year(), // 다른 해에 불러오면 선택 기억을 되살리지 않음(검수 13.39 23번)
      index: s.index,
      snapshot: s.beatSnap,
      stamps: [...s.stamps], photos: [...s.photos], terms: [...s.terms],
      line: last ? { label: last.label || '', text: last.text } : null,
      note: '',
    };
  },

  jumpTo(point) {
    if (!session) return;
    session.interrupt.reject(new Interrupt('jump', point));
  },

  abort() {
    if (!session) return;
    const s = session;
    session = null;
    tutor.setEpisode(null);
    s.interrupt.reject(new Interrupt('abort'));
    s.epoch += 1;
    tts.stop();
    ov.clearAll();
    vfx.clear();
    clearTask();
  },

  isRunning() { return Boolean(session); },
  currentEpisode() { return session?.ep || null; },
  /** 디버그·자동 테스트용: 지금 실행 중인 비트 */
  currentBeat() { return session?.current || null; },
};
