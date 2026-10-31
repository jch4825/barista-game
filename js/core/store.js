/**
 * 저장소: 프로필(학생)별 진행·설정·학습 기록
 *  - localStorage 를 쓰되, 막혀 있으면 메모리에서만 동작합니다(게임은 멈추지 않음).
 *  - 학습 기록은 기기 밖으로 나가지 않습니다(교사가 직접 내보낼 때만 파일 생성).
 */

import { CONFIG } from '../config.js';
import { bus } from './bus.js';

const KEY = CONFIG.SAVE_KEY;
let storageOK = true;

function readRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    storageOK = false;
    return null;
  }
}

function writeRaw(obj) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
    storageOK = true;
  } catch (e) {
    storageOK = false;
  }
}

function uid() {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function newProfile(name) {
  return {
    id: uid(),
    name: name || '플레이어',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: { ...CONFIG.DEFAULT_SETTINGS },
    settingsLocked: false,
    progress: { done: {}, checkpoint: null, unlockedAll: false },
    flags: {},
    stamps: {},      // skill -> { best, count, last }
    log: [],         // 과제 기록
    diary: [],       // { ep, feeling, myFeeling, at }
    terms: [],       // 말 사전
    photos: [],      // 오늘의 한 장
    oops: [],        // 아차 노트(발견한 실패 결과)
    met: [],         // 크루 카드를 본 사람
    tut: {},         // 처음 보는 버튼 알려 주기: 배운 버튼 종류 -> 시각
    interview: [],   // 면접 답변(설정 시)
    playMs: 0,
  };
}

function freshDB() {
  return { version: 2, activeId: null, profiles: {}, teacher: { pin: CONFIG.DEFAULT_TEACHER_PIN }, llm: {} };
}

let db = readRaw() || freshDB();
if (!db.version || db.version < 2) db = freshDB();

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => writeRaw(db), 120);
}
function saveNow() {
  clearTimeout(saveTimer);
  writeRaw(db);
}

function active() {
  return db.profiles[db.activeId] || null;
}

function touch(p) {
  if (p) p.updatedAt = Date.now();
}

/* ---------- 기록 파일(내보내기·불러오기, 2026-10-17): 웹판은 기록이 그 브라우저에만 남아서 파일로 옮기고 보관 ---------- */
const FILE_APP = 'barista-game'; // 직업 마1스톤('job-milestone') 기록 파일은 받지 않음: 두 게임의 학생 기록이 섞이지 않게
const isObj = (v) => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const obj = (v) => (isObj(v) ? v : {});
const list = (v) => (Array.isArray(v) ? v : []);
const ids = (v) => list(v).filter((x) => typeof x === 'string');
const num = (v, d = 0) => (Number.isFinite(v) ? v : d);

/**
 * 파일에서 읽은 학생 한 명 → 이 판의 모양(없는 칸은 기본값, 모양이 다른 칸은 고침). id 가 이상하면 null
 * 모르는 칸(새 판에서 생긴 칸)은 그대로 둡니다 — 이 기기의 기록을 합칠 때 잃지 않게
 */
function normalizeProfile(raw) {
  if (!isObj(raw) || typeof raw.id !== 'string' || !/^[\w-]{1,40}$/.test(raw.id)) return null;
  const base = newProfile();
  const pr = obj(raw.progress);
  return {
    ...raw,
    id: raw.id,
    name: String(raw.name ?? '').trim().slice(0, 20) || base.name,
    createdAt: num(raw.createdAt, Date.now()),
    updatedAt: num(raw.updatedAt, 0),
    settings: { ...base.settings, ...obj(raw.settings) },
    settingsLocked: Boolean(raw.settingsLocked),
    progress: {
      ...pr,
      done: obj(pr.done),
      checkpoint: isObj(pr.checkpoint) ? pr.checkpoint : null,
      unlockedAll: Boolean(pr.unlockedAll),
      ending: isObj(pr.ending) ? pr.ending : undefined,
      daily: isObj(pr.daily) ? pr.daily : undefined,
    },
    flags: obj(raw.flags),
    stamps: obj(raw.stamps),
    log: list(raw.log).filter(isObj),
    diary: list(raw.diary).filter(isObj),
    terms: ids(raw.terms),
    photos: ids(raw.photos),
    oops: ids(raw.oops),
    met: ids(raw.met),
    tut: obj(raw.tut),
    interview: list(raw.interview).filter(isObj),
    saves: obj(raw.saves),
    playMs: num(raw.playMs, 0),
  };
}

/** a 에는 없고 b 에만 있는 칸(모르는 칸을 합칠 때 잃지 않게) */
const onlyIn = (b, a) => Object.fromEntries(Object.entries(b).filter(([k]) => !(k in a)));
const later = (a, b, key) => (!a ? b || null : !b ? a : (num(b[key]) > num(a[key]) ? b : a));
const union = (a, b) => [...new Set([...a, ...b])];
function unionBy(a, b, key, cap = 0) {
  const seen = new Map();
  for (const x of [...a, ...b]) if (!seen.has(key(x))) seen.set(key(x), x);
  const out = [...seen.values()].sort((x, y) => num(x.at) - num(y.at));
  return cap && out.length > cap ? out.slice(out.length - cap) : out;
}

/**
 * 같은 학생의 두 기록 합치기. 지워지는 기록이 없게: 마친 이야기·도장·말 사전·사진·아차·기록은 모두 모으고,
 * 별명·설정·선택 기억(flags)은 더 최근에 한 쪽(cur)을 따릅니다. 늘 cur 의 것을 먼저 두고 old 에만 있는 것을 뒤에 더해서
 * 같은 파일을 두 번 불러와도 그대로입니다.
 */
function mergeProfiles(a, b) {
  const [old, cur] = num(b.updatedAt) > num(a.updatedAt) ? [a, b] : [b, a];
  const done = { ...cur.progress.done };
  for (const [ep, v] of Object.entries(old.progress.done)) {
    const c = done[ep];
    done[ep] = c ? { ...v, ...c, at: Math.max(num(c.at), num(v.at)), times: Math.max(num(c.times), num(v.times)) } : v;
  }
  const stamps = { ...cur.stamps };
  for (const [k, v] of Object.entries(old.stamps)) {
    const c = stamps[k];
    stamps[k] = c ? { best: Math.max(num(c.best), num(v.best)), count: Math.max(num(c.count), num(v.count)), last: Math.max(num(c.last), num(v.last)) } : v;
  }
  const tut = { ...cur.tut };
  for (const [k, t] of Object.entries(old.tut)) tut[k] = tut[k] ? Math.min(tut[k], t) : t;
  const saves = { ...cur.saves };
  for (const [n, s] of Object.entries(old.saves)) saves[n] = later(saves[n], s, 'savedAt');
  // 자동 저장: 더 나중 것. 그 뒤에 그 이야기를 마쳤으면 버림(마친 이야기를 '이어하기'로 띄우지 않게)
  let checkpoint = later(cur.progress.checkpoint, old.progress.checkpoint, 'savedAt');
  if (checkpoint && num(done[checkpoint.ep]?.at) > num(checkpoint.savedAt)) checkpoint = null;
  const [e1, e2] = [old.progress.ending, cur.progress.ending];
  const ending = e1 && e2 ? (num(e2.times) >= num(e1.times) ? e2 : e1) : e2 || e1;
  const [d1, d2] = [old.progress.daily, cur.progress.daily];
  const daily = d1 && d2 ? (num(d2.days) >= num(d1.days) ? d2 : d1) : d2 || d1;
  return {
    ...cur,
    ...onlyIn(old, cur),
    createdAt: Math.min(num(old.createdAt, Date.now()), num(cur.createdAt, Date.now())),
    updatedAt: Math.max(num(old.updatedAt), num(cur.updatedAt)),
    progress: { ...cur.progress, ...onlyIn(old.progress, cur.progress), done, checkpoint, unlockedAll: old.progress.unlockedAll || cur.progress.unlockedAll, ending, daily },
    stamps,
    log: unionBy(cur.log, old.log, (l) => `${l.at}|${l.type}|${l.id ?? ''}|${l.ep ?? ''}`, 2000),
    diary: unionBy(cur.diary, old.diary, (d) => `${d.at}|${d.ep}`),
    interview: unionBy(cur.interview, old.interview, (d) => `${d.at}|${d.q}`),
    terms: union(cur.terms, old.terms),
    photos: union(cur.photos, old.photos),
    oops: union(cur.oops, old.oops),
    met: union(cur.met, old.met),
    tut,
    saves,
    playMs: Math.max(num(old.playMs), num(cur.playMs)),
  };
}

export const store = {
  get storageOK() { return storageOK; },
  saveNow,

  /* ---------- 프로필 ---------- */
  profiles() {
    return Object.values(db.profiles).sort((a, b) => b.updatedAt - a.updatedAt);
  },
  active,
  hasProfile() { return Boolean(active()); },
  createProfile(name) {
    const p = newProfile(name);
    db.profiles[p.id] = p;
    db.activeId = p.id;
    saveNow();
    bus.emit('profile', p);
    return p;
  },
  selectProfile(id) {
    if (!db.profiles[id]) return null;
    db.activeId = id;
    touch(db.profiles[id]);
    saveNow();
    bus.emit('profile', db.profiles[id]);
    return db.profiles[id];
  },
  renameProfile(id, name) {
    if (!db.profiles[id]) return;
    db.profiles[id].name = name;
    saveNow();
    bus.emit('profile', active());
  },
  deleteProfile(id) {
    delete db.profiles[id];
    if (db.activeId === id) db.activeId = Object.keys(db.profiles)[0] || null;
    saveNow();
    bus.emit('profile', active());
  },
  resetProgress(id) {
    const p = db.profiles[id];
    if (!p) return;
    const keep = { id: p.id, name: p.name, createdAt: p.createdAt, settings: p.settings, settingsLocked: p.settingsLocked };
    db.profiles[id] = { ...newProfile(p.name), ...keep };
    saveNow();
    bus.emit('profile', active());
  },

  /* ---------- 설정 ---------- */
  settings() {
    const p = active();
    return { ...CONFIG.DEFAULT_SETTINGS, ...(p ? p.settings : {}) };
  },
  setSetting(key, value) {
    const p = active();
    if (!p) return;
    p.settings[key] = value;
    touch(p);
    save();
    bus.emit('settings', store.settings());
  },
  setSettings(obj) {
    const p = active();
    if (!p) return;
    Object.assign(p.settings, obj);
    touch(p);
    save();
    bus.emit('settings', store.settings());
  },
  settingsLocked() { return Boolean(active()?.settingsLocked); },
  setSettingsLocked(id, v) {
    if (db.profiles[id]) { db.profiles[id].settingsLocked = v; save(); }
  },

  /* ---------- 진행 ---------- */
  isDone(epId) { return Boolean(active()?.progress.done[epId]); },
  markDone(epId) {
    const p = active();
    if (!p) return;
    const prev = p.progress.done[epId];
    p.progress.done[epId] = { at: Date.now(), times: (prev?.times || 0) + 1 };
    if (p.progress.checkpoint?.ep === epId) p.progress.checkpoint = null;
    touch(p);
    saveNow();
  },
  /** 엔딩을 본 기록 { at, times, after: 그때 이야기의 마지막 에피소드 } (없으면 null). 본 뒤에는 모든 이야기가 늘 열림 */
  ending() { return active()?.progress.ending || null; },
  markEnding(after) {
    const p = active();
    if (!p) return;
    const prev = p.progress.ending;
    p.progress.ending = { at: Date.now(), times: (prev?.times || 0) + 1, after };
    touch(p);
    saveNow();
  },
  /* ---------- 매일 매일 카페 생활(무한 모드, 엔딩 뒤): 몇 주 차 · 무슨 요일 · 모은 기록 ---------- */
  daily() { return { week: 1, day: 0, money: 0, smiles: 0, days: 0, weekMoney: 0, weekSmiles: 0, ...(active()?.progress.daily || {}) }; },
  setDaily(d) {
    const p = active();
    if (!p) return;
    p.progress.daily = { ...d };
    touch(p);
    saveNow();
  },
  unlockedAll() { return Boolean(active()?.progress.unlockedAll); },
  setUnlockedAll(id, v) {
    if (db.profiles[id]) { db.profiles[id].progress.unlockedAll = v; saveNow(); }
  },
  checkpoint() { return active()?.progress.checkpoint || null; },
  setCheckpoint(cp) {
    const p = active();
    if (!p) return;
    p.progress.checkpoint = { ...cp, flags: { ...p.flags }, savedAt: Date.now() };
    touch(p);
    save();
  },
  clearCheckpoint() {
    const p = active();
    if (!p) return;
    p.progress.checkpoint = null;
    save();
  },

  /* ---------- 세이브 슬롯 (학생마다 수동 6칸, 자동 저장은 checkpoint) ---------- */
  SLOT_COUNT: 6,
  /** 1~6번 칸 목록(빈 칸은 null) */
  saveSlots() {
    const p = active();
    return Array.from({ length: store.SLOT_COUNT }, (_, i) => p?.saves?.[i + 1] || null);
  },
  slot(n) { return active()?.saves?.[n] || null; },
  /** 저장. 저장 공간이 막혀 있으면 false */
  writeSlot(n, data) {
    const p = active();
    if (!p || n < 1 || n > store.SLOT_COUNT) return false;
    p.saves = p.saves || {};
    const before = p.saves[n];
    p.saves[n] = { ...data, savedAt: Date.now() };
    touch(p);
    saveNow();
    if (!storageOK) { p.saves[n] = before || null; return false; }
    return true;
  },
  deleteSlot(n) {
    const p = active();
    if (!p?.saves) return;
    delete p.saves[n];
    saveNow();
  },
  addPlayTime(ms) {
    const p = active();
    if (!p || !ms) return;
    p.playMs = (p.playMs || 0) + ms;
    save();
  },

  /* ---------- 플래그(선택 기억) ---------- */
  flag(key) { return active()?.flags[key]; },
  setFlag(key, value) {
    const p = active();
    if (!p) return;
    p.flags[key] = value;
    save();
  },
  restoreFlags(flags) {
    const p = active();
    if (!p || !flags) return;
    p.flags = { ...flags };
    save();
  },

  /* ---------- 도장(스킬) ---------- */
  stamps() { return active()?.stamps || {}; },
  /** level: 1 함께 / 2 조금 도움 / 3 스스로 */
  awardStamp(skill, level) {
    const p = active();
    if (!p) return { prev: 0, best: level };
    const cur = p.stamps[skill] || { best: 0, count: 0, last: 0 };
    const prev = cur.best;
    cur.best = Math.max(cur.best, level);
    cur.count += 1;
    cur.last = Date.now();
    p.stamps[skill] = cur;
    touch(p);
    save();
    bus.emit('stamps', p.stamps);
    return { prev, best: cur.best };
  },

  /* ---------- 학습 기록 ---------- */
  log(entry) {
    const p = active();
    if (!p) return;
    p.log.push({ at: Date.now(), ...entry });
    if (p.log.length > 2000) p.log.splice(0, p.log.length - 2000);
    save();
  },
  logs() { return active()?.log || []; },

  addDiary(entry) {
    const p = active();
    if (!p) return;
    p.diary.push({ at: Date.now(), ...entry });
    save();
  },

  unlockTerm(id) {
    const p = active();
    if (!p || p.terms.includes(id)) return false;
    p.terms.push(id);
    save();
    bus.emit('terms', p.terms);
    return true;
  },
  terms() { return active()?.terms || []; },

  /** 아차 노트: 처음 발견한 실패 결과면 true */
  addOops(id) {
    const p = active();
    if (!p) return false;
    if (!p.oops) p.oops = [];
    if (p.oops.includes(id)) return false;
    p.oops.push(id);
    save();
    return true;
  },
  oopsList() { return active()?.oops || []; },

  /* ---------- 처음 보는 버튼 알려 주기(js/ui/tutor.js): 배운 버튼 종류 ---------- */
  tutSeen(key) { return Boolean(active()?.tut?.[key]); },
  markTut(key) {
    const p = active();
    if (!p) return;
    if (!p.tut) p.tut = {};
    if (p.tut[key]) return;
    p.tut[key] = Date.now();
    save();
  },
  resetTut() {
    const p = active();
    if (!p) return;
    p.tut = {};
    save();
  },

  /** 크루 카드: 처음 만난 사람이면 true */
  meet(id) {
    const p = active();
    if (!p) return false;
    if (!p.met) p.met = [];
    if (p.met.includes(id)) return false;
    p.met.push(id);
    save();
    return true;
  },
  metList() { return active()?.met || []; },

  unlockPhoto(id) {
    const p = active();
    if (!p || p.photos.includes(id)) return false;
    p.photos.push(id);
    save();
    return true;
  },
  photos() { return active()?.photos || []; },

  saveInterview(entry) {
    const p = active();
    if (!p) return;
    if (!store.settings().saveInterview) return;
    p.interview.push({ at: Date.now(), ...entry });
    save();
  },

  /* ---------- 교사 ---------- */
  checkPin(pin) { return String(pin) === String(db.teacher.pin); },
  setPin(pin) { db.teacher.pin = String(pin); saveNow(); },
  llmConfig() { return { ...db.llm }; },
  setLlmConfig(cfg) { db.llm = { ...db.llm, ...cfg }; saveNow(); },

  /** 교사용: 특정 프로필 원본 */
  profile(id) { return db.profiles[id] || null; },

  /* ---------- 기록 파일 (js/screens/records.js) ---------- */
  /** 파일에 담을 내용. idList 를 주면 그 학생만, 없으면 이 기기의 모든 학생. 선생님 번호·AI 설정은 넣지 않음 */
  exportRecords(idList) {
    const profiles = (idList || Object.keys(db.profiles)).map((id) => db.profiles[id]).filter(Boolean);
    return { app: FILE_APP, kind: idList ? 'student' : 'class', db: db.version, game: CONFIG.VERSION, exportedAt: Date.now(), profiles: JSON.parse(JSON.stringify(profiles)) };
  },
  /** 파일 내용(JSON) → 학생 목록. 마일스톤 기록 파일이 아니면 null */
  readRecords(data) {
    if (!isObj(data) || data.app !== FILE_APP || !Array.isArray(data.profiles)) return null;
    const out = data.profiles.map(normalizeProfile).filter(Boolean);
    return out.length ? out : null;
  },
  /** 불러오기 전에 보여 줄 것: 새로 더할 학생 · 이 기기의 기록과 합칠 학생 */
  importPlan(profiles) {
    const seen = new Set();
    const add = [];
    const merge = [];
    for (const p of profiles) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      (db.profiles[p.id] ? merge : add).push(p);
    }
    return { add, merge };
  },
  /**
   * 불러오기: 같은 학생(id)은 두 기록을 합치고(mergeProfiles: 지워지는 기록 없음), 새 학생은 더합니다.
   * 저장 공간이 모자라면 불러오기 전으로 되돌리고 null. 처음부터 저장이 막힌 기기면 이번 실행 동안만 씁니다(memoryOnly)
   */
  importRecords(profiles) {
    const wasOK = storageOK;
    const before = JSON.stringify(db);
    const added = [];
    const merged = [];
    for (const inc of profiles) {
      const cur = db.profiles[inc.id];
      db.profiles[inc.id] = cur ? mergeProfiles(normalizeProfile(cur) || inc, inc) : inc;
      if (!cur) added.push(inc.id);
      else if (!merged.includes(inc.id) && !added.includes(inc.id)) merged.push(inc.id);
    }
    // 이 기기에 지금 하는 학생이 없었으면(새 컴퓨터) 불러온 학생 중 가장 최근에 한 학생으로
    if (!db.profiles[db.activeId]) db.activeId = [...added, ...merged].map((id) => db.profiles[id]).sort((x, y) => num(y.updatedAt) - num(x.updatedAt))[0]?.id ?? null;
    saveNow();
    if (!storageOK && wasOK) {
      db = JSON.parse(before);
      saveNow();
      return null;
    }
    bus.emit('profile', active());
    return { added, merged, ids: [...added, ...merged], memoryOnly: !storageOK };
  },
};
