/**
 * 읽어 주기
 *  1순위: 미리 만든 음성 파일 (Supertonic 3 로컬 TTS → assets/voice/, npm run voices)
 *  2순위: 브라우저 음성 합성 (Web Speech API, ko-KR)
 *  음성이 없거나 막혀 있어도 게임은 그대로 진행됩니다.
 */

import { store } from '../core/store.js';
import { speakable, hashKey } from '../core/text.js';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let voice = null;
let voiceManifest = {};
let fileAudio = null;
let pendingResolve = null;
let seqId = 0; // speakSeq 를 멈추기 위한 번호

// 브라우저 음성일 때 인물별 높낮이·빠르기 (파일 음성은 voice_cast.json 이 결정)
const VOICE_PROFILE = {
  yeonwoo: { pitch: 1.18, rate: 1.0 },
  dohyun: { pitch: 0.92, rate: 1.0 },
  manager: { pitch: 0.78, rate: 0.95 },
  sora: { pitch: 1.3, rate: 1.08 },
  minjae: { pitch: 0.85, rate: 0.92 },
  mom: { pitch: 1.08, rate: 0.95 },
  teacher: { pitch: 1.05, rate: 0.98 },
  jiho: { pitch: 1.0, rate: 1.0 },
  grandma: { pitch: 1.0, rate: 0.85 },
  customer_f: { pitch: 1.2, rate: 1.02 },
  jieun: { pitch: 1.12, rate: 0.98 },
  owner: { pitch: 0.8, rate: 0.88 },
  haesun: { pitch: 1.0, rate: 0.84 },
  jian: { pitch: 1.18, rate: 0.96 },
  do: { pitch: 0.85, rate: 0.92 },
  kang: { pitch: 0.72, rate: 0.86 },
  han: { pitch: 0.92, rate: 0.98 },
  eunju: { pitch: 1.15, rate: 1.0 },
  sumin: { pitch: 1.25, rate: 1.04 },
  noh: { pitch: 0.78, rate: 0.86 },
  geum: { pitch: 0.95, rate: 1.2 },
  actor: { pitch: 1.1, rate: 0.95 },
  agent: { pitch: 1.0, rate: 1.15 },
  narr: { pitch: 1.1, rate: 0.96 },
  think: { pitch: 1.15, rate: 0.98 },
  sys: { pitch: 1.0, rate: 1.0 },
};

const RATE = { slow: 0.82, normal: 1.0, fast: 1.18 };

function pickVoice() {
  if (!synth) return;
  const list = synth.getVoices().filter((v) => /ko(-|_)?KR|Korean|한국/i.test(`${v.lang} ${v.name}`));
  if (!list.length) return;
  const rank = (v) => (/Google/i.test(v.name) ? 0 : /Natural|Online/i.test(v.name) ? 1 : /Heami|SunHi|Yuna|InJoon/i.test(v.name) ? 2 : 3);
  voice = list.sort((a, b) => rank(a) - rank(b))[0];
}

if (synth) {
  pickVoice();
  synth.addEventListener?.('voiceschanged', pickVoice);
}

export function voiceKey(voiceId, text) {
  return hashKey(`${voiceId}|${speakable(text).trim()}`);
}

function finishPending() {
  if (pendingResolve) {
    const r = pendingResolve;
    pendingResolve = null;
    r();
  }
}

function speakFile(path, s) {
  return new Promise((resolve) => {
    const a = new Audio(`./assets/voice/${path}`);
    a.volume = Math.min(1, s.volMaster + 0.15);
    a.playbackRate = RATE[s.voiceRate] || 1;
    a.preservesPitch = true;
    fileAudio = a;
    pendingResolve = resolve;
    a.onended = finishPending;
    a.onerror = finishPending;
    a.play().catch(finishPending);
  });
}

function speakSynth(line, who, s) {
  if (!synth) return Promise.resolve();
  if (!voice) pickVoice();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(line);
    const prof = VOICE_PROFILE[who] || VOICE_PROFILE.narr;
    u.lang = 'ko-KR';
    if (voice) u.voice = voice;
    u.pitch = prof.pitch;
    u.rate = prof.rate * (RATE[s.voiceRate] || 1);
    u.volume = Math.min(1, s.volMaster + 0.2);
    pendingResolve = resolve;
    u.onend = finishPending;
    u.onerror = finishPending;
    setTimeout(() => { if (pendingResolve === resolve) finishPending(); }, 1500 + line.length * 260);
    try { synth.speak(u); } catch (e) { finishPending(); }
  });
}

export const tts = {
  async init() {
    try {
      const res = await fetch('./assets/voice/manifest.json', { cache: 'no-store' });
      if (res.ok) voiceManifest = (await res.json()).lines || {};
    } catch (e) {
      voiceManifest = {};
    }
  },

  available() {
    return Object.keys(voiceManifest).length > 0 || Boolean(synth && synth.getVoices().length);
  },

  fileCount() { return Object.keys(voiceManifest).length; },

  /**
   * 말하기. 끝나면 resolve.
   * force: '버튼으로만' 설정에서도 다시 듣기 버튼처럼 직접 요청한 경우
   */
  speak(text, who = 'narr', opts = {}) {
    seqId += 1;
    return play(text, who, opts);
  },

  /**
   * 여러 문장을 차례로 읽기. 바뀌는 문장(결과 화면 요약 등)을 조각으로 나누면
   * 조각마다 미리 만든 음성 파일을 쓸 수 있습니다. 다른 speak·stop 이 오면 멈춥니다.
   */
  async speakSeq(parts, who = 'sys', opts = {}) {
    const my = ++seqId;
    for (const part of parts) {
      if (my !== seqId) return;
      await play(part, who, opts);
    }
  },

  stop() {
    seqId += 1;
    halt();
  },
};

function play(text, who, { force = false } = {}) {
  const s = store.settings();
  if (s.voice === 'off') return Promise.resolve();
  if (!force && s.voice !== 'auto') return Promise.resolve();
  const line = speakable(text).trim();
  if (!line) return Promise.resolve();
  halt();
  const path = voiceManifest[voiceKey(who, text)];
  if (path) return speakFile(path, s);
  return speakSynth(line, who, s);
}

function halt() {
  if (fileAudio) {
    try { fileAudio.pause(); } catch (e) { /* 무시 */ }
    fileAudio = null;
  }
  if (synth) {
    try { synth.cancel(); } catch (e) { /* 무시 */ }
  }
  finishPending();
}
