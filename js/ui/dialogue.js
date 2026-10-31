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

async function typeOut(targets) {
  const sp = SPEED[store.settings().textSpeed] ?? 30;
  typing = true;
  skipReq = false;
  if (sp === 0) { fillAll(targets); typing = false; return; }
  for (const t of targets) {
    for (let i = 1; i <= t.full.length; i++) {
      if (skipReq) { fillAll(targets); typing = false; return; }
      setPart(t, t.full.slice(0, i));
      // 문장부호에서는 조금 쉬어 읽기 리듬을 만듦
      const ch = t.full[i - 1];
      await sleep(/[.!?…]/.test(ch) ? sp * 6 : /[,]/.test(ch) ? sp * 3 : sp);
    }
  }
  typing = false;
}

function setQueued(on) {
  queued = on;
  nextEl.classList.toggle('is-queued', on);
  nextEl.firstChild.textContent = on ? '말이 끝나면 넘어가요' : '다음';
}

function waitAdvance(voiceP, len) {
  const token = ++waitToken;
  voicing = true;
  setQueued(false);
  voiceP.then(() => {
    if (token !== waitToken) return;
    voicing = false;
    if (queued && advanceResolve) advanceResolve();
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
      voiceP.then(() => sleep(base + per * len)).then(() => {
        if (token === waitToken && advanceResolve) advanceResolve();
      });
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
    bus.on('settings', (s) => {
      if (s.auto === autoSetting) return; // 다른 설정을 바꿀 때는 그대로
      autoSetting = s.auto;
      autoOn = s.auto !== 'off';
      refreshAutoBtn();
    });
  },

  /** 넘기기 (처리했으면 true) */
  advance() {
    if (document.querySelector('#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov')) return false;
    if (typing) { skipReq = true; bus.emit('dialogue:tap'); return true; }
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
    if (who && b.face) stage.setFace(who, b.face);
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
    } else {
      faceEl.replaceChildren();
    }
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
    await typeOut(targets);
    if (kind === 'say' && who && (voiceDone || store.settings().voice === 'off')) stage.talk(who, false);
    if (b.noWait) {
      if (b.waitVoice) await voiceP; // 바로 이어지는 말이 이 목소리를 끊지 않게 끝까지 기다림
      return;
    }

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
    tts.speak(current.text, voiceOf(current.who, current.kind), { force: true });
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
    advanceResolve = null;
    voicing = false;
    setQueued(false);
    waitToken += 1;
  },
  history() { return history.slice(); },
  resetHistory() { history.length = 0; },
  isWaiting() { return Boolean(advanceResolve) || typing; },
};
