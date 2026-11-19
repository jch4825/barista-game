/**
 * 대화창 (영수증 종이 스타일)
 *  - 플레이어가 직접 넘깁니다(클릭 / Space / Enter / → / 스위치). 첫 입력은 타이핑을 끝까지 보여 줌.
 *  - 자동 넘김은 읽어 주기가 끝난 뒤 글자 수에 비례해 기다립니다.
 *  - {{낱말}} 은 말 사전 버튼, **강조** 는 형광펜.
 */

import { $, h, sleep, announce } from '../core/dom.js';
import { fill, parse, plain } from '../core/text.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { stage } from './stage.js';
import { CHARS, speakerLabel, voiceOf, faceHTML } from '../data/characters.js';
import { popEmote, FACE_EMOTE } from './emote.js';
import { ov } from './overlays.js';
import { store } from '../core/store.js';
import { input } from '../core/input.js';
import { ICON } from '../data/icons.js';
import { bus } from '../core/bus.js';
import { tutor } from './tutor.js';

const SPEED = { slow: 55, normal: 30, fast: 14, instant: 0 };
const AUTO = { slow: [2600, 70], normal: [1300, 40] };

let box;
let faceEl;
let nameEl;
let textEl;
let nextEl;
let autoBtn;
let typing = false;
let skipReq = false;
let waitToken = 0;
let advanceResolve = null;
let current = null;
let autoOn = false;
let voicing = false; // 지금 줄의 목소리가 아직 나오는 중
let queued = false;  // 목소리가 나오는 동안 누름: 말이 끝나면 넘김(한 번 더 누르면 바로)
let lineNo = 0;
let replayP = null; // [다시 듣기]로 다시 읽는 목소리: 자동 넘김은 이 말이 끝난 뒤부터 다시 셈
let hiddenEmote = null; // CG 에 가려 무대에서 못 보인 이모트 { who, kind }: 그 사람이 말하는 동안이면 바로, 아니면 바로 다음 대사의 얼굴에
let lineStarting = false; // 새 대사의 표정을 바꾸는 중(그 이모트는 새 얼굴에 띄움)
const history = [];
const lastFace = {}; // 무대에 없는 사람의 마지막 표정(대화창 얼굴 아이콘용)

function ctrlBtn(icon, label, fn) {
  return h('button', {
    class: 'dlg-btn', 'aria-label': label,
    onclick: (e) => { e.stopPropagation(); fn(); },
  }, h('i', { html: ICON(icon) }), h('span', { text: label }));
}

function setPart(t, str) {
  if (t.isText) t.n.data = str;
  else t.n.textContent = str;
}

function fillAll(targets) {
  for (const t of targets) setPart(t, t.full);
}

/** myLine: 이 줄의 번호. 되감기 · 불러오기로 줄이 지워지면(clear · 새 줄) 그만둠: 새 줄의 typing 을 건드리지 않게 */
async function typeOut(targets, myLine) {
  const sp = SPEED[store.settings().textSpeed] ?? 30;
  typing = true;
  skipReq = false;
  if (sp === 0) { fillAll(targets); typing = false; return; }
  for (const t of targets) {
    for (let i = 1; i <= t.full.length; i++) {
      if (lineNo !== myLine) return;
      if (skipReq) { fillAll(targets); typing = false; return; }
      setPart(t, t.full.slice(0, i));
      // 문장부호에서는 조금 쉬어 읽기 리듬을 만듦
      const ch = t.full[i - 1];
      await sleep(/[.!?…]/.test(ch) ? sp * 6 : /[,]/.test(ch) ? sp * 3 : sp);
    }
  }
  typing = false;
}

/** 화면을 눌러도 넘어간다는 설명(2026-11-18 사용자 "화면을 눌러도 게임이 진행된다는 설명이 없다"): 처음 NEXT_HINT 줄 동안은 '다음' 대신 */
const NEXT_HINT = 40;
const NEXT_HINT_TEXT = '화면을 톡 누르면 다음';
const nextLabel = () => ((store.flag('nextSeen') || 0) < NEXT_HINT ? NEXT_HINT_TEXT : '다음');

function setQueued(on) {
  queued = on;
  nextEl.classList.toggle('is-queued', on);
  nextEl.firstChild.textContent = on ? '말이 끝나면 넘어가요' : nextLabel();
}

/** 대사 위에 창(멈춤 · 설정 · 수첩 · 말 사전 · 확인 창)이 열려 있음: 그동안은 넘기지 않음(advance 와 같은 기준) */
const BLOCK_SEL = '#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov';
const blockedNow = () => Boolean(document.querySelector(BLOCK_SEL));

function waitAdvance(voiceP, len) {
  const token = ++waitToken;
  voicing = true;
  replayP = null;
  setQueued(false);
  // 말이 끝나면 넘기기로 한 누름: 창을 열어 목소리가 끊겨도(openScreen 의 tts.stop) 창 뒤에서 넘어가지 않고, 창을 닫은 뒤에 넘김
  const fire = () => {
    if (token !== waitToken || !advanceResolve) return;
    if (blockedNow()) { setTimeout(fire, 300); return; }
    advanceResolve();
  };
  voiceP.then(() => {
    if (token !== waitToken) return;
    voicing = false;
    if (queued) fire();
  });
  return new Promise((resolve) => {
    advanceResolve = () => {
      if (token !== waitToken) return;
      advanceResolve = null;
      setQueued(false);
      resolve();
    };
    if (autoOn) {
      const [base, per] = AUTO[store.settings().auto] || AUTO.normal;
      // 쪽지(버튼 알려 주기)가 떠 있으면 학생이 눌러 닫을 때까지 넘기지 않음.
      // 창이 열려 있으면 기다렸다가 닫힌 뒤 한 번 더 쉬고 넘김. 기다리는 사이 [자동]을 끄면 넘기지 않음
      let held = false;
      const go = () => {
        if (token !== waitToken || !advanceResolve || !autoOn) return;
        if (replayP) { const p = replayP; replayP = null; p.then(() => sleep(base + per * len)).then(go); return; }
        if (tutor.holding()) { setTimeout(go, 300); return; }
        if (blockedNow()) { held = true; setTimeout(go, 300); return; }
        if (held) { held = false; setTimeout(go, base); return; }
        advanceResolve();
      };
      voiceP.then(() => sleep(base + per * len)).then(go);
    }
  });
}

function refreshAutoBtn() {
  autoBtn.classList.toggle('on', autoOn);
  autoBtn.setAttribute('aria-pressed', String(autoOn));
}

export const dialogue = {
  init() {
    faceEl = h('div', { class: 'dlg-face', 'aria-hidden': 'true' });
    nameEl = h('div', { class: 'dlg-name' });
    textEl = h('div', { class: 'dlg-text' });
    nextEl = h('div', { class: 'dlg-next', 'aria-hidden': 'true' }, h('span', { text: '다음' }), h('b', { text: '▼' }));
    autoBtn = ctrlBtn('play', '자동', () => { autoOn = !autoOn; refreshAutoBtn(); if (autoOn) dialogue.advance(); });
    const ctrl = h('div', { class: 'dlg-ctrl' },
      ctrlBtn('volume', '다시 듣기', () => dialogue.replay()),
      ctrlBtn('book', '지난 대화', () => bus.emit('hud:backlog')),
      autoBtn);
    box = h('div', { class: 'dlg is-hidden', role: 'region', 'aria-label': '대화', tabindex: '0' }, faceEl, nameEl, textEl, nextEl, ctrl);
    $('#layer-dock').replaceChildren(box);
    box.addEventListener('click', (e) => { if (!e.target.closest('button')) dialogue.advance(); });
    $('#layer-stage').addEventListener('click', () => dialogue.advance());
    input.setAdvanceHandler(() => dialogue.advance());
    let autoSetting = store.settings().auto; // 설정의 '자동 넘김'. [자동] 버튼으로 바꾼 것은 이 설정이 바뀔 때만 덮어씀
    autoOn = autoSetting !== 'off';
    refreshAutoBtn();
    bus.on('profile', () => { autoSetting = store.settings().auto; autoOn = autoSetting !== 'off'; refreshAutoBtn(); });
    // CG 에 가려 무대에서 못 보인 이모트(stage.emote): 그 사람이 지금 말하는 중이면 대화창 얼굴에, 아니면 다음 대사 때
    bus.on('emote:hidden', ({ who, kind }) => {
      if (!lineStarting && current?.who === who && !box.classList.contains('is-hidden')) popEmote(faceEl, kind);
      else hiddenEmote = { who, kind };
    });
    bus.on('settings', (s) => {
      if (s.auto === autoSetting) return; // 다른 설정을 바꿀 때는 그대로
      autoSetting = s.auto;
      autoOn = s.auto !== 'off';
      refreshAutoBtn();
    });
  },

  /** 넘기기 (처리했으면 true) */
  advance() {
    if (blockedNow()) return false;
    if (typing) { skipReq = true; bus.emit('dialogue:tap'); return true; }
    if (tutor.consumeTap()) return true; // 알려 주기만 하는 쪽지가 떠 있으면 이 누름은 쪽지를 닫음(읽기 전에 넘어가지 않게)
    if (advanceResolve) {
      bus.emit('dialogue:tap');
      // 글자는 목소리보다 먼저 다 나옴: 목소리가 나오는 동안의 누름은 말을 자르지 않고 끝난 뒤 넘김. 한 번 더 누르면 바로 넘김(2026-10-31 고침)
      if (voicing && !queued) { setQueued(true); return true; }
      advanceResolve();
      return true;
    }
    return false;
  },

  /**
   * 한 줄 보여 주기
   * b: { kind:'say'|'narr'|'think'|'sys', who, face, text, noWait }
   */
  async line(b) {
    const kind = b.kind || 'say';
    const who = kind === 'narr' || kind === 'sys' ? null : kind === 'think' ? 'jieun' : b.who;
    const prevFace = who ? (stage.faceOf(who) || lastFace[who] || 'normal') : null;
    lineStarting = true;
    if (who && b.face) stage.setFace(who, b.face);
    lineStarting = false;
    stage.focus(kind === 'say' || kind === 'think' ? who : null);
    const myLine = ++lineNo;
    bus.emit('dialogue:line');

    const t = fill(b.text);
    const label = speakerLabel(who, kind);
    current = { kind, who, text: t };

    box.className = `dlg k-${kind}${who ? ' has-face' : ''}`;
    if (who) {
      const f = b.face || prevFace;
      lastFace[who] = f;
      faceEl.innerHTML = faceHTML(who, f);
      faceEl.style.setProperty('--accent', CHARS[who]?.color || 'var(--main)');
      // 무대에 없는 사람은 대화창 얼굴 옆에 이모트
      if (b.face && FACE_EMOTE[b.face] && FACE_EMOTE[b.face] !== FACE_EMOTE[prevFace] && !stage.isOnStage(who)) popEmote(faceEl, FACE_EMOTE[b.face]);
      else if (hiddenEmote?.who === who) popEmote(faceEl, hiddenEmote.kind); // CG 아래에서 못 보인 이모트
    } else {
      faceEl.replaceChildren();
    }
    hiddenEmote = null; // 바로 다음 대사까지만
    nameEl.textContent = label;
    nameEl.hidden = !label;
    nameEl.style.setProperty('--accent', (who && CHARS[who]?.color) || 'var(--main)');

    textEl.replaceChildren();
    const targets = [];
    for (const s of parse(t)) {
      if (s.type === 'text') {
        const n = document.createTextNode('');
        textEl.append(n);
        targets.push({ n, full: s.v, isText: true });
      } else if (s.type === 'em') {
        const n = h('mark', { class: 'em' });
        textEl.append(n);
        targets.push({ n, full: s.v });
      } else {
        const n = h('button', {
          class: 'term', 'data-term': s.id,
          onclick: (e) => { e.stopPropagation(); ov.glossary(s.id); },
        });
        textEl.append(n);
        targets.push({ n, full: s.v });
      }
    }

    history.push({ kind, who, label, text: plain(t) });
    if (history.length > 120) history.shift();
    announce(`${label ? `${label}: ` : ''}${plain(t)}`);

    nextEl.classList.remove('on');
    const voiceP = tts.speak(t, voiceOf(who, kind));
    // 말하는 동안 입 움직이기: 글자가 다 나오고 목소리가 끝날 때까지
    let voiceDone = false;
    if (kind === 'say' && who) {
      stage.talk(who, true);
      voiceP.then(() => { voiceDone = true; if (lineNo === myLine && !typing) stage.talk(who, false); });
    }
    await typeOut(targets, myLine);
    if (lineNo !== myLine) return; // 되감기 · 불러오기로 지워진 줄: 새 줄의 넘기기(advanceResolve)를 덮어쓰지 않게
    if (kind === 'say' && who && (voiceDone || store.settings().voice === 'off')) stage.talk(who, false);
    if (b.noWait) {
      if (b.waitVoice) await voiceP; // 바로 이어지는 말이 이 목소리를 끊지 않게 끝까지 기다림
      return;
    }

    nextEl.firstChild.textContent = nextLabel();
    nextEl.classList.toggle('is-hint', nextEl.firstChild.textContent === NEXT_HINT_TEXT);
    if (store.hasProfile()) store.setFlag('nextSeen', (store.flag('nextSeen') || 0) + 1);
    nextEl.classList.add('on');
    if (!document.activeElement || document.activeElement === document.body || document.activeElement.closest('#layer-dock') || document.activeElement.closest('#layer-stage')) {
      box.focus({ preventScroll: true });
    }
    await waitAdvance(voiceP, plain(t).length);
    nextEl.classList.remove('on');
    stage.talk(null, false);
    tts.stop();
    audio.sfx('next');
  },

  replay() {
    if (!current) return;
    if (queued) setQueued(false); // 다시 듣는 말을 '말이 끝나면 넘기기'가 끊지 않게
    replayP = tts.speak(current.text, voiceOf(current.who, current.kind), { force: true });
  },

  show() { box.classList.remove('is-hidden'); },
  hide() { box.classList.add('is-hidden'); },
  clear() {
    textEl.replaceChildren();
    faceEl.replaceChildren();
    box.classList.remove('has-face');
    stage.talk(null, false);
    nameEl.textContent = '';
    nameEl.hidden = true;
    current = null;
    typing = false;
    lineNo += 1; // 치고 있던 줄(typeOut)은 그만둠
    advanceResolve = null;
    nextEl.classList.remove('on');
    voicing = false;
    setQueued(false);
    waitToken += 1;
  },
  history() { return history.slice(); },
  resetHistory() { history.length = 0; },
  isWaiting() { return Boolean(advanceResolve) || typing; },
};
