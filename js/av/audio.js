/**
 * 오디오 엔진
 *  - 파일 우선: assets/audio/manifest.json 에 등록된 파일(BGM·효과음·환경음)을 재생합니다.
 *  - 효과음은 파일이 없으면 Web Audio 합성음으로 대신합니다. 배경음악은 파일이 없으면 조용히 둡니다(새 곡을 기다림).
 *  - 장면 속 소리(env)와 화면 조작 소리(ui)를 나눕니다. 귀마개를 끼면 장면 속 소리만 먹먹해집니다.
 */

import { store } from '../core/store.js';
import { bus } from '../core/bus.js';

let ctx = null;
let master, uiBus, envIn, envFilter, envGain, bgmBus, musicGain, duckGain, sfxBus, ambBus, delay, delayFb, delayWet;
let noiseBuf = null;
let brownBuf = null;

let manifest = { bgm: {}, sfx: {}, amb: {} };
const sfxBuffers = new Map();

// 장면 속 소리 목록 (귀마개 영향을 받음)
const ENV_SFX = new Set(['bell', 'knock', 'door', 'phone', 'alarm', 'bus', 'card_beep', 'pen', 'seal', 'water', 'bubbles', 'towel',
  'clink', 'stack', 'pour', 'ice', 'espresso', 'steam', 'spill', 'wipe', 'mop', 'sign', 'tray', 'pos', 'mixer', 'oven', 'beep',
  'shutter_phone', 'highfive', 'mug', 'slip', 'glass_break', 'crowd_angry', 'crash_small', 'tick_fast', 'sweep']);

/* ------------------------------------------------------------------ */
/* 초기화                                                              */
/* ------------------------------------------------------------------ */
function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();

  master = ctx.createGain();
  master.connect(ctx.destination);
  uiBus = ctx.createGain();
  uiBus.connect(master);

  envIn = ctx.createGain();
  envFilter = ctx.createBiquadFilter();
  envFilter.type = 'lowpass';
  envFilter.frequency.value = 18000;
  envGain = ctx.createGain();
  envIn.connect(envFilter);
  envFilter.connect(envGain);
  envGain.connect(master);

  bgmBus = ctx.createGain();
  musicGain = ctx.createGain();
  musicGain.gain.value = 0;
  duckGain = ctx.createGain(); // 읽어 주는 말 아래로 잠깐 낮춤(audio.duck)
  musicGain.connect(duckGain);
  duckGain.connect(bgmBus);
  bgmBus.connect(envIn);
  sfxBus = ctx.createGain();
  sfxBus.connect(envIn);
  ambBus = ctx.createGain();
  ambBus.connect(envIn);

  delay = ctx.createDelay(1.0);
  delay.delayTime.value = 0.34;
  delayFb = ctx.createGain();
  delayFb.gain.value = 0.26;
  delayWet = ctx.createGain();
  delayWet.gain.value = 0.2;
  delay.connect(delayFb);
  delayFb.connect(delay);
  delay.connect(delayWet);
  delayWet.connect(musicGain);

  const len = ctx.sampleRate * 2;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  brownBuf = ctx.createBuffer(1, len * 2, ctx.sampleRate);
  const b = brownBuf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < b.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    b[i] = last * 3.2;
  }
  applyVolumes();
  preloadSfx();
  return ctx;
}

function applyVolumes() {
  if (!ctx) return;
  const s = store.settings();
  const calm = s.theme === 'calm' ? 0.75 : 1;
  master.gain.value = s.volMaster;
  uiBus.gain.value = s.volSfx * calm;
  sfxBus.gain.value = s.volSfx * calm;
  ambBus.gain.value = s.volSfx * 0.8 * calm;
  bgmBus.gain.value = s.volBgm * calm;
}

async function loadManifest() {
  try {
    const res = await fetch('./assets/audio/manifest.json', { cache: 'no-store' });
    if (res.ok) manifest = { bgm: {}, sfx: {}, amb: {}, ...(await res.json()) };
  } catch (e) {
    /* 파일이 없으면 합성음만 사용 */
  }
}

async function preloadSfx() {
  for (const [id, path] of Object.entries(manifest.sfx || {})) {
    if (sfxBuffers.has(id)) continue;
    try {
      const res = await fetch(`./assets/audio/${path}`);
      const arr = await res.arrayBuffer();
      sfxBuffers.set(id, await ctx.decodeAudioData(arr));
    } catch (e) {
      console.warn('[audio] 효과음 불러오기 실패:', id, e.message);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 합성 도우미                                                          */
/* ------------------------------------------------------------------ */
function tone({ type = 'sine', f = 440, f2 = null, t = 0, d = 0.2, g = 0.2, a = 0.005, out, detune = 0 }) {
  const now = ctx.currentTime + t;
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(f, now);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + d);
  o.detune.value = detune;
  const gn = ctx.createGain();
  gn.gain.setValueAtTime(0.0001, now);
  gn.gain.exponentialRampToValueAtTime(Math.max(g, 0.0002), now + a);
  gn.gain.exponentialRampToValueAtTime(0.0001, now + d);
  o.connect(gn);
  gn.connect(out || uiBus);
  o.start(now);
  o.stop(now + d + 0.05);
}

function noise({ t = 0, d = 0.2, g = 0.2, type = 'bandpass', f = 1000, f2 = null, q = 1, a = 0.01, out }) {
  const now = ctx.currentTime + t;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const flt = ctx.createBiquadFilter();
  flt.type = type;
  flt.frequency.setValueAtTime(f, now);
  if (f2) flt.frequency.exponentialRampToValueAtTime(f2, now + d);
  flt.Q.value = q;
  const gn = ctx.createGain();
  gn.gain.setValueAtTime(0.0001, now);
  gn.gain.exponentialRampToValueAtTime(g, now + a);
  gn.gain.exponentialRampToValueAtTime(0.0001, now + d);
  src.connect(flt);
  flt.connect(gn);
  gn.connect(out || uiBus);
  src.start(now, Math.random() * 1.5);
  src.stop(now + d + 0.05);
}

const N = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* ------------------------------------------------------------------ */
/* 합성 효과음 (파일이 없을 때)                                          */
/* ------------------------------------------------------------------ */
const E = () => sfxBus; // 장면 속 소리 출력
const SYN = {
  tap: () => tone({ f: 660, f2: 990, d: 0.06, g: 0.07 }),
  next: () => tone({ type: 'triangle', f: 520, d: 0.05, g: 0.035 }),
  focus: () => tone({ type: 'sine', f: 880, d: 0.03, g: 0.025 }),
  open: () => tone({ type: 'triangle', f: 440, f2: 660, d: 0.12, g: 0.06 }),
  close: () => tone({ type: 'triangle', f: 660, f2: 440, d: 0.12, g: 0.06 }),
  good: () => [72, 76, 79].forEach((m, i) => tone({ type: 'triangle', f: N(m), t: i * 0.07, d: 0.28, g: 0.11 })),
  great: () => {
    [72, 76, 79, 84].forEach((m, i) => tone({ type: 'triangle', f: N(m), t: i * 0.07, d: 0.4, g: 0.12 }));
    noise({ t: 0.3, d: 0.35, g: 0.05, type: 'highpass', f: 6000 });
  },
  hint: () => { tone({ f: N(76), d: 0.3, g: 0.1 }); tone({ f: N(72), t: 0.13, d: 0.35, g: 0.1 }); },
  stamp: () => { tone({ f: 150, f2: 55, d: 0.28, g: 0.45 }); noise({ d: 0.12, g: 0.25, type: 'lowpass', f: 500 }); },
  snap: () => {
    noise({ d: 0.09, g: 0.22, type: 'highpass', f: 2800 });
    tone({ type: 'square', f: 1800, d: 0.025, g: 0.04 });
    noise({ t: 0.1, d: 0.5, g: 0.05, type: 'bandpass', f: 900, q: 0.8, a: 0.05 });
  },
  page: () => noise({ d: 0.28, g: 0.12, type: 'bandpass', f: 1900, f2: 700, q: 0.8 }),
  whoosh: () => noise({ d: 0.38, g: 0.12, type: 'bandpass', f: 400, f2: 2600, q: 0.7 }),
  heart: () => { tone({ f: N(76), d: 1.4, g: 0.08, a: 0.01 }); tone({ f: N(83), t: 0.18, d: 1.6, g: 0.06, a: 0.01 }); },
  coin: () => { tone({ type: 'square', f: N(83), d: 0.08, g: 0.04 }); tone({ type: 'square', f: N(88), t: 0.08, d: 0.35, g: 0.04 }); },
  cheer: () => {
    [60, 64, 67, 72].forEach((m) => tone({ type: 'triangle', f: N(m), d: 1.2, g: 0.07, a: 0.02 }));
    [72, 76, 79, 84, 88].forEach((m, i) => tone({ type: 'triangle', f: N(m), t: 0.12 + i * 0.09, d: 0.5, g: 0.1 }));
  },
  breathIn: () => tone({ f: 220, f2: 330, d: 3.6, g: 0.05, a: 1.4 }),
  breathOut: () => tone({ f: 330, f2: 196, d: 3.6, g: 0.05, a: 0.4 }),

  jingle_complete: () => {
    [67, 72, 76, 79].forEach((m, i) => tone({ type: 'triangle', f: N(m), t: i * 0.11, d: 0.5, g: 0.1 }));
    [72, 76, 79, 84].forEach((m) => tone({ type: 'triangle', f: N(m), t: 0.5, d: 1.4, g: 0.06, a: 0.02 }));
  },
  jingle_oops: () => {
    tone({ type: 'triangle', f: N(74), f2: N(67), t: 0, d: 0.32, g: 0.12 });
    tone({ type: 'triangle', f: N(69), f2: N(62), t: 0.26, d: 0.5, g: 0.11 });
  },
  jingle_rewind: () => {
    noise({ d: 1.0, g: 0.1, type: 'bandpass', f: 3000, f2: 500, q: 2.5, a: 0.05 });
    for (let i = 0; i < 9; i++) tone({ type: 'square', f: 1400 - i * 90, t: i * 0.1, d: 0.04, g: 0.03 });
    tone({ f: N(72), t: 1.0, d: 0.5, g: 0.08 });
  },
  jingle_badge: () => {
    [60, 64, 67, 72, 76].forEach((m, i) => tone({ type: 'triangle', f: N(m), t: i * 0.14, d: 0.7, g: 0.09 }));
    [72, 76, 79, 84].forEach((m) => tone({ type: 'sine', f: N(m), t: 0.8, d: 2.2, g: 0.05, a: 0.05 }));
  },
  jingle_unlock: () => { [84, 88, 91].forEach((m, i) => tone({ f: N(m), t: i * 0.06, d: 0.4, g: 0.05 })); },
  jingle_payday: () => { SYN.coin(); [79, 84, 88].forEach((m, i) => tone({ f: N(m), t: 0.3 + i * 0.08, d: 0.4, g: 0.05 })); },

  // ---- 장면 속 소리 ----
  bell: () => { for (const t of [0, 0.2]) { tone({ f: 1568, t, d: 1.1, g: 0.08, out: E() }); tone({ f: 2093, t: t + 0.02, d: 0.9, g: 0.05, out: E() }); } },
  knock: () => { for (const t of [0, 0.32, 0.64]) { noise({ t, d: 0.08, g: 0.5, type: 'lowpass', f: 320, out: E() }); tone({ f: 95, t, d: 0.09, g: 0.25, out: E() }); } },
  door: () => noise({ d: 0.35, g: 0.12, type: 'lowpass', f: 900, out: E() }),
  phone: () => { for (const t of [0, 0.4]) tone({ type: 'square', f: 170, t, d: 0.26, g: 0.035, out: E() }); },
  alarm: () => { for (let i = 0; i < 4; i++) { tone({ f: 988, t: i * 0.3, d: 0.12, g: 0.05, out: E() }); tone({ f: 1319, t: i * 0.3 + 0.12, d: 0.12, g: 0.04, out: E() }); } },
  bus: () => { noise({ d: 1.8, g: 0.16, type: 'lowpass', f: 250, a: 0.4, out: E() }); noise({ t: 1.2, d: 0.5, g: 0.1, type: 'highpass', f: 2500, out: E() }); },
  card_beep: () => tone({ type: 'square', f: 1760, d: 0.12, g: 0.035, out: E() }),
  pen: () => { for (let i = 0; i < 6; i++) noise({ t: i * 0.08, d: 0.06, g: 0.06, type: 'bandpass', f: 3000, q: 2, out: E() }); },
  seal: () => { tone({ f: 120, f2: 50, d: 0.3, g: 0.45, out: E() }); noise({ d: 0.15, g: 0.2, type: 'lowpass', f: 400, out: E() }); },
  water: () => noise({ d: 1.0, g: 0.07, type: 'bandpass', f: 2400, q: 0.6, a: 0.1, out: E() }),
  bubbles: () => { for (let i = 0; i < 5; i++) tone({ f: 900 + Math.random() * 900, t: i * 0.06, d: 0.07, g: 0.025, out: E() }); },
  towel: () => noise({ d: 0.25, g: 0.1, type: 'bandpass', f: 1500, f2: 2500, out: E() }),
  clink: () => { tone({ f: 2600, d: 0.25, g: 0.06, out: E() }); tone({ f: 3900, t: 0.01, d: 0.18, g: 0.04, out: E() }); },
  stack: () => { noise({ d: 0.06, g: 0.2, type: 'bandpass', f: 2200, q: 2, out: E() }); tone({ f: 1200, d: 0.08, g: 0.03, out: E() }); },
  pour: () => noise({ d: 0.9, g: 0.08, type: 'bandpass', f: 800, f2: 1700, q: 1.2, a: 0.08, out: E() }),
  ice: () => { for (let i = 0; i < 4; i++) tone({ f: 2000 + Math.random() * 1500, t: i * 0.05, d: 0.08, g: 0.04, out: E() }); },
  espresso: () => { noise({ d: 1.4, g: 0.1, type: 'bandpass', f: 600, q: 1, a: 0.2, out: E() }); tone({ type: 'sawtooth', f: 90, d: 1.4, g: 0.02, a: 0.2, out: E() }); },
  steam: () => noise({ d: 1.0, g: 0.06, type: 'highpass', f: 4000, a: 0.1, out: E() }),
  spill: () => { noise({ d: 0.7, g: 0.22, type: 'lowpass', f: 700, f2: 180, out: E() }); tone({ f: 210, f2: 80, d: 0.35, g: 0.08, out: E() }); },
  wipe: () => { for (const t of [0, 0.3, 0.6]) noise({ t, d: 0.25, g: 0.08, type: 'bandpass', f: 1200, f2: 2000, out: E() }); },
  mop: () => { for (const t of [0, 0.5]) noise({ t, d: 0.45, g: 0.08, type: 'lowpass', f: 900, out: E() }); },
  sign: () => { noise({ d: 0.12, g: 0.15, type: 'bandpass', f: 1200, out: E() }); tone({ f: 300, t: 0.1, d: 0.1, g: 0.08, out: E() }); },
  tray: () => { tone({ f: 420, d: 0.18, g: 0.08, out: E() }); noise({ d: 0.08, g: 0.1, type: 'bandpass', f: 1500, out: E() }); },
  pos: () => { tone({ type: 'square', f: 2000, d: 0.05, g: 0.03, out: E() }); noise({ t: 0.1, d: 0.6, g: 0.05, type: 'bandpass', f: 2500, q: 3, out: E() }); },
  mixer: () => { tone({ type: 'sawtooth', f: 70, d: 1.6, g: 0.05, a: 0.2, out: E() }); noise({ d: 1.6, g: 0.18, type: 'bandpass', f: 300, q: 0.8, a: 0.2, out: E() }); },
  oven: () => tone({ f: 1760, d: 1.2, g: 0.06, out: E() }),
  beep: () => { for (const t of [0, 0.22, 0.44]) tone({ type: 'square', f: 1040, t, d: 0.12, g: 0.05, out: E() }); },
  shutter_phone: () => { noise({ d: 0.05, g: 0.15, type: 'highpass', f: 3000, out: E() }); noise({ t: 0.07, d: 0.05, g: 0.12, type: 'highpass', f: 3500, out: E() }); },
  highfive: () => { noise({ d: 0.12, g: 0.4, type: 'bandpass', f: 1600, q: 0.7, out: E() }); tone({ f: 300, f2: 120, d: 0.1, g: 0.1, out: E() }); },
  mug: () => tone({ f: 600, d: 0.2, g: 0.07, out: E() }),
  slip: () => { noise({ d: 0.3, g: 0.12, type: 'bandpass', f: 2000, f2: 600, out: E() }); tone({ f: 90, f2: 50, t: 0.3, d: 0.3, g: 0.35, out: E() }); },
  // 4장 손맛 미니게임(받기·청소·지렁이)
  catch: () => { tone({ type: 'triangle', f: N(84), d: 0.07, g: 0.06 }); tone({ type: 'triangle', f: N(91), t: 0.05, d: 0.1, g: 0.05 }); },
  sweep: () => noise({ d: 0.22, g: 0.1, type: 'bandpass', f: 2600, f2: 1200, q: 0.9, out: E() }),
  pickup: () => { tone({ f: N(79), d: 0.06, g: 0.05 }); tone({ f: N(86), t: 0.05, d: 0.09, g: 0.05 }); },
  nom: () => { tone({ type: 'square', f: N(72), d: 0.05, g: 0.035 }); tone({ type: 'square', f: N(79), t: 0.06, d: 0.07, g: 0.035 }); },
  bump: () => { tone({ type: 'sine', f: 180, f2: 90, d: 0.22, g: 0.12 }); noise({ d: 0.08, g: 0.06, type: 'lowpass', f: 600 }); },
  glass_break: () => { for (let i = 0; i < 7; i++) tone({ f: 2500 + Math.random() * 2500, t: i * 0.03, d: 0.15, g: 0.03, out: E() }); noise({ d: 0.3, g: 0.08, type: 'highpass', f: 3000, out: E() }); },
  crowd_angry: () => noise({ d: 1.4, g: 0.12, type: 'bandpass', f: 500, q: 2, a: 0.2, out: E() }),
  crash_small: () => { for (let i = 0; i < 6; i++) { noise({ t: i * 0.07, d: 0.1, g: 0.12, type: 'bandpass', f: 1500 + i * 200, out: E() }); } },
  tick_fast: () => { for (let i = 0; i < 10; i++) tone({ type: 'square', f: i % 2 ? 1800 : 1500, t: i * 0.12, d: 0.02, g: 0.025, out: E() }); },
  sad_trombone: () => { [67, 66, 65].forEach((m, i) => tone({ type: 'sawtooth', f: N(m - 12), t: i * 0.3, d: 0.32, g: 0.03 })); tone({ type: 'sawtooth', f: N(52), f2: N(50), t: 0.9, d: 0.8, g: 0.03 }); },
};

/* ------------------------------------------------------------------ */
/* 합성 배경음악 (파일이 없을 때)                                        */
/* ------------------------------------------------------------------ */
const MOODS = {
  home: { bpm: 64, style: 'bell', chords: [[53, [0, 4, 7, 11]], [52, [0, 3, 7, 10]], [50, [0, 3, 7, 10]], [48, [0, 4, 7, 11]]] },
  morning: { bpm: 84, style: 'arp', chords: [[48, [0, 4, 7, 12]], [47, [0, 3, 8, 12]], [45, [0, 3, 7, 12]], [41, [0, 4, 7, 12]]] },
  title: { bpm: 92, style: 'arp', chords: [[41, [0, 4, 7, 12]], [43, [0, 4, 7, 12]], [45, [0, 3, 7, 12]], [48, [0, 4, 7, 12]]] },
  cafe: { bpm: 76, style: 'jazz', chords: [[50, [0, 3, 7, 10, 14]], [43, [0, 4, 10, 14, 16]], [48, [0, 4, 7, 11, 14]], [45, [0, 4, 7, 10, 13]]] },
  interview: { bpm: 70, style: 'pulse', chords: [[48, [0, 4, 7, 11]], [45, [0, 3, 7, 10]], [41, [0, 4, 7, 11]], [43, [0, 4, 7]]] },
  tension: { bpm: 72, style: 'pulse', chords: [[45, [0, 3, 7]], [41, [0, 4, 7]], [50, [0, 3, 7]], [40, [0, 4, 7]]] },
  overload: { bpm: 60, style: 'drone', chords: [[40, [0, 7, 13]], [41, [0, 6, 12]]] },
  peak: { bpm: 104, style: 'bounce', chords: [[48, [0, 4, 7, 12]], [45, [0, 3, 7, 12]], [41, [0, 4, 7, 12]], [43, [0, 4, 7, 12]]] },
  warm: { bpm: 62, style: 'pad', chords: [[41, [0, 4, 7, 11]], [43, [0, 4, 7, 10]], [40, [0, 3, 7, 10]], [45, [0, 3, 7, 10]], [38, [0, 3, 7, 10]], [43, [0, 4, 7]], [48, [0, 4, 7, 11]], [48, [0, 4, 7]]],
    melody: [76, null, 74, 72, 74, null, 76, null, 79, null, 76, 74, 72, null, 71, null, 72, null, 74, 76, 74, null, 72, null, 71, null, 72, 74, 72, null, null, null] },
  tea: { bpm: 80, style: 'bell', chords: [[48, [0, 4, 7, 11]], [45, [0, 3, 7, 10]], [50, [0, 3, 7, 10]], [43, [0, 4, 7, 10]]] },
  celebrate: { bpm: 110, style: 'bounce', chords: [[48, [0, 4, 7, 12]], [41, [0, 4, 7, 12]], [43, [0, 4, 7, 12]], [48, [0, 4, 7, 12]]] },
  ending: { bpm: 70, style: 'pad', chords: [[41, [0, 4, 7, 11]], [43, [0, 4, 7, 10]], [40, [0, 3, 7, 10]], [45, [0, 3, 7, 10]], [38, [0, 3, 7, 10]], [43, [0, 4, 7]], [48, [0, 4, 7, 11]], [48, [0, 4, 7, 11]]],
    melody: [72, 74, 76, null, 79, null, 76, null, 77, 76, 74, null, 72, null, 74, null, 76, null, 74, 72, 71, null, 72, null, 74, null, 76, 79, 84, null, null, null] },
};

let mood = null;
let targetMood = null;
let pendingSwitch = null;
let schedTimer = null;
let nextTime = 0;
let step = 0;
let bgmEl = null; // 파일 BGM

function epNote(m, t, d, v = 0.06) {
  const f = N(m);
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  o1.frequency.value = f;
  o2.frequency.value = f * 2;
  const g2 = ctx.createGain();
  g2.gain.value = 0.25;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2600;
  o1.connect(g);
  o2.connect(g2);
  g2.connect(g);
  g.connect(lp);
  lp.connect(musicGain);
  lp.connect(delay);
  o1.start(t); o2.start(t);
  o1.stop(t + d + 0.05); o2.stop(t + d + 0.05);
}

function bellNote(m, t, v = 0.05) {
  const f = N(m);
  for (const [mul, gv, dd] of [[1, v, 1.6], [2.76, v * 0.25, 0.7], [5.4, v * 0.08, 0.35]]) {
    const o = ctx.createOscillator();
    o.frequency.value = f * mul;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gv, t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dd);
    o.connect(g);
    g.connect(musicGain);
    g.connect(delay);
    o.start(t);
    o.stop(t + dd + 0.05);
  }
}

function bassNote(m, t, d, v = 0.08) {
  const o = ctx.createOscillator();
  o.type = 'triangle';
  o.frequency.value = N(m);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 520;
  o.connect(g);
  g.connect(lp);
  lp.connect(musicGain);
  o.start(t);
  o.stop(t + d + 0.05);
}

function padChord(notes, t, d, v = 0.018, cutoff = 950) {
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = cutoff;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.9);
  g.gain.setValueAtTime(v, t + Math.max(1, d - 0.6));
  g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.4);
  g.connect(lp);
  lp.connect(musicGain);
  for (const m of notes) {
    for (const det of [-7, 7]) {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.value = N(m);
      o.detune.value = det;
      o.connect(g);
      o.start(t);
      o.stop(t + d + 0.5);
    }
  }
}

function hat(t, v = 0.012) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  src.connect(hp);
  hp.connect(g);
  g.connect(musicGain);
  src.start(t, Math.random());
  src.stop(t + 0.08);
}

function scheduleStep(def, s, t) {
  const eighth = 60 / def.bpm / 2;
  const bar = Math.floor(s / 8) % def.chords.length;
  const pos = s % 8;
  const [root, iv] = def.chords[bar];
  const tones = iv.map((x) => root + 12 + x);
  switch (def.style) {
    case 'bell': {
      if (pos === 0) { bassNote(root, t, eighth * 8, 0.06); padChord(tones.slice(0, 3), t, eighth * 8, 0.01); }
      const seq = [0, null, 1, 2, null, 3, 2, null];
      const k = seq[pos];
      if (k !== null) bellNote(tones[k % tones.length] + 12, t, 0.035);
      break;
    }
    case 'arp': {
      if (pos === 0 || pos === 4) bassNote(root, t, eighth * 4, 0.07);
      const order = [0, 1, 2, 3, 2, 1, 2, 3];
      epNote(tones[order[pos] % tones.length] + 12, t, eighth * 3, 0.035);
      break;
    }
    case 'jazz': {
      if (pos % 2 === 0) bassNote(root + [0, 7, 12, 7][pos / 2], t, eighth * 2, 0.07);
      if (pos === 1 || pos === 4) tones.slice(1).forEach((m) => epNote(m, t, eighth * 2.5, 0.02));
      if (pos === 6 && Math.random() < 0.5) epNote(tones[tones.length - 1] + 12, t, eighth * 2, 0.025);
      if (pos % 2 === 1) hat(t, 0.008);
      break;
    }
    case 'pulse': {
      bassNote(root, t, eighth * 0.9, 0.05);
      if (pos === 0) padChord(tones, t, eighth * 8, 0.012);
      if (pos === 6 && Math.random() < 0.6) bellNote(tones[2] + 12, t, 0.025);
      break;
    }
    case 'drone': {
      if (pos === 0) padChord(tones, t, eighth * 8, 0.02, 500);
      break;
    }
    case 'bounce': {
      bassNote(root + (pos % 2 ? 12 : 0), t, eighth * 0.9, 0.06);
      const order = [0, 2, 1, 3, 2, 1, 3, 2];
      epNote(tones[order[pos] % tones.length] + 12, t, eighth * 1.6, 0.03);
      if (pos % 2 === 1) hat(t, 0.012);
      break;
    }
    case 'pad': {
      if (pos === 0) { padChord(tones, t, eighth * 8, 0.016); bassNote(root, t, eighth * 8, 0.06); }
      const mel = def.melody;
      if (mel) {
        const idx = Math.floor(s / 2) % mel.length;
        if (s % 2 === 0 && mel[idx]) bellNote(mel[idx], t, 0.04);
      }
      if (pos === 2 || pos === 6) epNote(tones[1] + 12, t, eighth * 3, 0.018);
      break;
    }
    default: break;
  }
}

function scheduler() {
  if (!ctx || !mood || !MOODS[mood]) return;
  const def = MOODS[mood];
  const eighth = 60 / def.bpm / 2;
  while (nextTime < ctx.currentTime + 0.25) {
    scheduleStep(def, step, nextTime);
    nextTime += eighth;
    step += 1;
  }
}

function stopFileBgm() {
  if (!bgmEl) return;
  const el = bgmEl;
  bgmEl = null;
  setTimeout(() => { try { el.pause(); el.src = ''; } catch (e) { /* 무시 */ } }, 50);
}

/**
 * 평소 분위기 곡은 여러 곡을 돌려 가며 틉니다.
 *  - 그 분위기로 들어올 때마다 다음 곡, 한 곡이 끝나면 다음 곡으로 이어서(파일이 있는 곡만)
 *  - 상황 곡은 한 곡 그대로
 * 배경음악은 모두 새 곡을 씁니다(2026-10-27 사용자 결정). 새 곡을 넣으면 { 분위기: [곡 id, …] } 를 적습니다(PRD.md 11.1).
 * 2026-11-01 저작자가 AI 음악 모델로 만든 곡(영어 제목 = Gemini, 한글 제목 = Suno, tools/audio/audio_map.mjs 의 note 에 고른 까닭). 가사가 있는 letter 는 엔딩 크레디트에서만(사용자 결정)
 */
export const BGM_VARIANTS = {
  title: ['glow_a'],              // Rising Glow: 처음 화면과 엔딩에 같은 곡(한 해를 여닫음)
  ending: ['glow_a'],
  morning: ['glow_b'],            // Rising Glow 다른 판: 해 뜨는 아침
  cafe: ['waltz'],                // Galactic Waltz: 손님이 오가는 낮
  celebrate: ['waltz'],           // 하루 끝 결과 화면
  warm: ['ballad_a', 'ballad_b'], // 피아노 발라드 두 판을 돌려 가며: 단골의 마음 · 마감 · 일기
  home: ['ballad_b'],             // 첫날 밤의 작은 방
  tension: ['horizon_a', 'horizon_b'], // Across the Horizon: 계절의 큰 사건
  peak: ['horizon_b'],            // 가을 축제
  blackout: ['chant_a', 'chant_b'],    // 그레고리안 찬송가: 겨울 정전 밤
  credits: ['letter'],            // 아이에게 보내는 편지(가사 있음): 엔딩 크레디트에서만, 한 번
};
// 반복하지 않고 한 번만 트는 곡(끝나면 조용히)
const ONCE = ['letter'];
const variantTurn = {};
const variantsOf = (m) => (BGM_VARIANTS[m] || [m]).filter((id) => manifest.bgm?.[id]);
function nextVariant(m) {
  const list = variantsOf(m);
  if (!list.length) return null;
  if (variantTurn[m] === undefined) variantTurn[m] = Math.floor(Math.random() * list.length) - 1; // 시작 곡도 그때그때 다르게
  variantTurn[m] = (variantTurn[m] + 1) % list.length;
  return list[variantTurn[m]];
}

// 끝나면 처음이 아니라 이 초부터 다시 트는 곡(tools/audio/audio_map.mjs 의 layers at 과 같은 값). 예: { title: 92.16 }
const LOOP_FROM = {};

function startFileBgm(id, moodName = id) {
  const el = new Audio(`./assets/audio/${manifest.bgm[id]}`);
  const playlist = variantsOf(moodName).length > 1;
  const from = LOOP_FROM[id];
  el.loop = !ONCE.includes(id) && !playlist && !from;
  if (from) {
    el.addEventListener('ended', () => {
      if (bgmEl !== el) return;
      el.currentTime = from;
      el.play().catch(() => {});
    });
  }
  if (playlist) {
    el.addEventListener('ended', () => {
      if (bgmEl !== el || mood !== moodName) return;
      const t = ctx.currentTime;
      musicGain.gain.cancelScheduledValues(t);
      musicGain.gain.setValueAtTime(0, t);
      musicGain.gain.linearRampToValueAtTime(1, t + 1.5);
      stopFileBgm();
      startFileBgm(nextVariant(moodName), moodName);
    });
  }
  el.crossOrigin = 'anonymous';
  try {
    const src = ctx.createMediaElementSource(el);
    src.connect(musicGain);
  } catch (e) { /* 같은 요소 중복 연결 방지 */ }
  el.play().catch(() => {});
  bgmEl = el;
}

/* ------------------------------------------------------------------ */
/* 환경음                                                               */
/* ------------------------------------------------------------------ */
let amb = null;

function stopAmbience() {
  if (!amb) return;
  const a = amb;
  amb = null;
  clearInterval(a.timer);
  const now = ctx.currentTime;
  a.gain.gain.cancelScheduledValues(now);
  a.gain.gain.setValueAtTime(a.gain.gain.value, now);
  a.gain.gain.linearRampToValueAtTime(0, now + 0.8);
  setTimeout(() => {
    a.nodes.forEach((n) => { try { n.stop(); } catch (e) { /* 정지됨 */ } });
    if (a.el) { a.el.pause(); a.el.src = ''; }
  }, 900);
}

function startAmbience(kind, level = 1) {
  stopAmbience();
  if (!kind) return;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.connect(ambBus);
  const nodes = [];
  let el = null;
  let timer = null;

  if (manifest.amb?.[kind]) {
    el = new Audio(`./assets/audio/${manifest.amb[kind]}`);
    el.loop = true;
    try { ctx.createMediaElementSource(el).connect(gain); } catch (e) { /* 무시 */ }
    el.play().catch(() => {});
    gain.gain.linearRampToValueAtTime(Math.min(1, 0.9 * level), ctx.currentTime + 1.2);
  } else {
    const base = ctx.createBufferSource();
    base.buffer = brownBuf;
    base.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = kind === 'street' ? 260 : 480;
    base.connect(lp);
    lp.connect(gain);
    base.start();
    nodes.push(base);
    let target = 0.05;
    if (kind === 'crowd') {
      target = 0.11 * level;
      for (const f of [420, 760, 1150]) {
        const src = ctx.createBufferSource();
        src.buffer = noiseBuf;
        src.loop = true;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = f;
        bp.Q.value = 3;
        const vg = ctx.createGain();
        vg.gain.value = 0.25 * level;
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 2 + Math.random() * 3;
        const lfoG = ctx.createGain();
        lfoG.gain.value = 0.2 * level;
        lfo.connect(lfoG);
        lfoG.connect(vg.gain);
        src.connect(bp);
        bp.connect(vg);
        vg.connect(gain);
        src.start(0, Math.random());
        lfo.start();
        nodes.push(src, lfo);
      }
    }
    if (kind === 'kitchen') target = 0.06;
    if (kind === 'street') target = 0.07;
    if (kind === 'home' || kind === 'classroom') target = 0.025;
    gain.gain.linearRampToValueAtTime(target, ctx.currentTime + 1.2);
  }

  timer = setInterval(() => {
    if (!ctx) return;
    const r = Math.random();
    if (kind === 'crowd' && r < 0.7) { playSfx('clink'); if (r < 0.25) playSfx('pour'); }
    if (kind === 'street' && r < 0.25 && !manifest.amb?.street) noise({ d: 2.2, g: 0.06, type: 'lowpass', f: 300, f2: 900, a: 0.8, out: sfxBus });
  }, kind === 'crowd' ? 1400 : 4200);

  amb = { gain, nodes, timer, kind, el, level };
}

function playSfx(name) {
  const buf = sfxBuffers.get(name);
  if (buf) {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ENV_SFX.has(name) ? sfxBus : uiBus);
    src.start();
    return;
  }
  const fn = SYN[name];
  if (fn) fn();
}

/* ------------------------------------------------------------------ */
/* 공개 API                                                            */
/* ------------------------------------------------------------------ */
export const audio = {
  async init() {
    await loadManifest();
  },

  /** 첫 사용자 입력 때 호출 (브라우저 자동재생 정책) */
  unlock() {
    if (!ensure()) return;
    if (ctx.state === 'suspended') ctx.resume();
    // 첫 누름 전에 틀려다 막혀 멈춰 있던 배경음악(예: 표지)을 다시
    if (bgmEl && bgmEl.paused && !bgmEl.ended) bgmEl.play().catch(() => {});
  },


  sfx(name) {
    if (!name || !ensure() || ctx.state !== 'running') return;
    playSfx(name);
  },

  bgm(name) {
    if (!ensure()) return;
    const next = name || null;
    if (next === targetMood) return;
    targetMood = next;
    const now = ctx.currentTime;
    audio.duck(false);
    musicGain.gain.cancelScheduledValues(now);
    musicGain.gain.setValueAtTime(musicGain.gain.value, now);
    musicGain.gain.linearRampToValueAtTime(0, now + 0.8);
    clearTimeout(pendingSwitch);
    pendingSwitch = setTimeout(() => {
      clearInterval(schedTimer);
      stopFileBgm();
      mood = targetMood;
      if (!mood) return;
      const t = ctx.currentTime;
      musicGain.gain.cancelScheduledValues(t);
      musicGain.gain.setValueAtTime(0, t);
      musicGain.gain.linearRampToValueAtTime(1, t + 1.2);
      // 파일이 없는 곡은 조용히 둡니다. 합성 배경음악(MOODS)은 직업 마1스톤 장면에 맞춘 것이라 쓰지 않습니다(배경음악은 모두 새 곡)
      const file = nextVariant(mood);
      if (file) startFileBgm(file, mood);
    }, 850);
  },

  /** 읽어 주는 말 아래로 배경음악을 낮춤(엔딩 크레디트: 가사가 있는 노래와 읽어 주기가 겹치지 않게). 분위기가 바뀌면 저절로 풀림 */
  duck(on) {
    if (!ensure() || !duckGain) return;
    const now = ctx.currentTime;
    duckGain.gain.cancelScheduledValues(now);
    duckGain.gain.setValueAtTime(duckGain.gain.value, now);
    duckGain.gain.linearRampToValueAtTime(on ? 0.3 : 1, now + (on ? 0.5 : 1.5));
  },

  ambience(kind, level = 1) {
    if (!ensure()) return;
    if (kind === 'cafe') kind = null; // 매장 웅성거림은 지움(2026-10-16). 옛 저장을 불러와도 합성음으로 대신 틀지 않음
    if (amb && amb.kind === kind && amb.level === level) return;
    startAmbience(kind || null, level);
  },

  /** 귀마개: 장면 속 소리만 먹먹하게 */
  setEarplugs(on) {
    if (!ensure()) return;
    const now = ctx.currentTime;
    envFilter.frequency.cancelScheduledValues(now);
    envFilter.frequency.setValueAtTime(envFilter.frequency.value, now);
    envFilter.frequency.exponentialRampToValueAtTime(on ? 620 : 18000, now + 0.7);
    envGain.gain.cancelScheduledValues(now);
    envGain.gain.setValueAtTime(envGain.gain.value, now);
    envGain.gain.linearRampToValueAtTime(on ? 0.45 : 1, now + 0.7);
  },

  stopAll() {
    audio.bgm(null);
    if (ctx) { stopAmbience(); audio.setEarplugs(false); }
  },

  state() { return { mood: targetMood, ambience: amb?.kind || null, ambLevel: amb?.level || 1, duck: duckGain ? Number(duckGain.gain.value.toFixed(2)) : 1 }; },
  hasFile(kind, id) { return Boolean(manifest[kind]?.[id]); },
  applyVolumes,
};

bus.on('settings', () => applyVolumes());
bus.on('profile', () => applyVolumes());

/** 도구(검사·에셋 목록)용 */
export const SFX_NAMES = Object.keys(SYN);
export const BGM_NAMES = [...new Set([...Object.keys(MOODS), ...Object.keys(BGM_VARIANTS)])];
export const AMB_NAMES = ['cafe', 'crowd', 'street', 'kitchen', 'home', 'classroom'];
