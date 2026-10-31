/**
 * 엔딩 화면(PRD 5.8 · docs/story.md 9장): 대본의 album() · eyes() 비트가 부름(runner.js → ov.album · ov.eyes)
 *  - album(): 단골 8명의 액자. 3단계에서 열린 비밀 장면(store.album())은 그림 + 제목 + 한 줄, 아니면 '아직 모르는 이야기'
 *    액자가 하나씩 걸리며 아래 글띠에 그 사람의 이야기 · 늘 마시던 것을 보여 주고 읽어 줌. 다 걸린 뒤 액자를 누르면 다시 봄
 *  - eyes(): 같은 한 해를 사장님의 눈으로 본 11컷(js/data/eyes.js). 대본에서 본 장면(flag 'seen')은 보통 빠르기,
 *    처음 보는 장면은 '처음 보는 장면' 표시 + 줄 사이를 더 길게(PRD 5.6 ✅ 알림 없이 숨긴 것을 엔딩에서 한꺼번에)
 *  글은 화면 + 읽어 주기(tts) + 화면 낭독(announce). 시간 제한 없음: [계속]·[다음]을 누를 때까지 기다림.
 *  목소리를 자르지 않기(2026-10-31): 읽는 중에 [다음]을 누르면 '말이 끝나면 넘어가요', 한 번 더 누르면 바로 넘어감.
 *  그림이 없으면 CG 임시 그림(cg-placeholder.js, '대체 요망')을 작게 줄여 씀.
 */

import { h, sleep, dur, announce } from '../core/dom.js';
import { input } from '../core/input.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { store } from '../core/store.js';
import { img } from '../core/assets.js';
import { REGULARS } from '../data/regulars.js';
import { CHARS, faceHTML } from '../data/characters.js';
import { cgPlaceholder } from './cg-placeholder.js';
import { ALBUM_ORDER, ALBUM_SAY, albumSpeech, usualOf, EYES, EYES_INTRO, EYES_OUTRO, EYES_SAY } from '../data/eyes.js';

const layer = () => document.getElementById('layer-overlay');

function mount(el) {
  layer().append(el);
  input.pushScope(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  return () => {
    input.popScope(el);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(260));
  };
}

/** CG 한 장(그림이 있으면 그림, 없으면 임시 그림). small 이면 1920×1080 판을 줄여 넣음 */
function cgView(id, small = false) {
  const u = img.url('cg', `cg_${id}`);
  if (u) return h('img', { class: 'en-cg-img', src: u, alt: '', draggable: 'false' });
  const ph = cgPlaceholder(id);
  if (!ph) return h('div', { class: 'en-cg-empty' });
  return small ? h('div', { class: 'en-cg-mini' }, ph) : ph;
}

/** 읽어 주기를 기다림(목소리가 꺼져 있으면 글 길이만큼 쉼) */
async function readLine(text, who, slow) {
  const s = store.settings();
  const t0 = performance.now();
  await tts.speak(text, who);
  const spoke = performance.now() - t0;
  const want = Math.min(6000, 900 + String(text).length * 55) * (slow ? 1.35 : 1);
  if (s.voice === 'off' || spoke < 300) await sleep(Math.max(0, want - spoke));
  await sleep(slow ? 1100 : 450);
}

/**
 * [다음] 단추 하나로 '읽는 중이면 다 읽고 넘어가기 · 한 번 더 누르면 바로'를 처리
 * step(run): run(ctl) 이 읽기 작업(ctl.cancelled() · ctl.queued()). 다음으로 넘어갈 때 resolve
 */
function stepper(btn, label) {
  let cur = null;
  const setLabel = (t) => { btn.querySelector('span').textContent = t; };
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const c = cur;
    if (!c || btn.disabled) return;
    if (c.reading && !c.queued) {
      c.queued = true;
      btn.classList.add('is-queued');
      setLabel('말이 끝나면 넘어가요');
      announce('말이 끝나면 넘어가요. 바로 넘어가려면 한 번 더 누르세요.');
      return;
    }
    tts.stop();
    c.release();
  });
  return {
    label(t) { label = t; setLabel(t); },
    step(run) {
      return new Promise((resolve) => {
        const c = { queued: false, reading: true, cancelled: false };
        c.release = () => {
          if (c.cancelled) return;
          c.cancelled = true;
          if (cur === c) cur = null;
          btn.classList.remove('is-queued');
          setLabel(label);
          resolve();
        };
        cur = c;
        btn.classList.remove('is-queued');
        setLabel(label);
        run({ cancelled: () => c.cancelled, queued: () => c.queued }).then(() => { c.reading = false; if (c.queued) c.release(); });
      });
    },
  };
}

const nextBtn = (label = '다음') => h('button', { class: 'btn btn-main en-next' }, h('span', { text: label }), h('b', { 'aria-hidden': 'true', text: ' ▶' }));

/* ---------- 단골 앨범 ---------- */

export async function album() {
  const opened = store.album();
  const capName = h('b', { class: 'al-cap-name' });
  const capTitle = h('span', { class: 'al-cap-title' });
  const capLine = h('p', { class: 'al-cap-line' });
  const capUsual = h('p', { class: 'al-cap-usual' });
  const cap = h('div', { class: 'al-cap' }, h('div', { class: 'al-cap-head' }, capName, capTitle), capLine, capUsual);
  const frames = ALBUM_ORDER.map((who) => {
    const r = REGULARS[who];
    const open = Boolean(opened[who]);
    const pic = open ? cgView(r.album.cg, true)
      : h('div', { class: 'al-closed' }, h('span', { class: 'al-face', html: faceHTML(who, 'normal') }), h('i', { 'aria-hidden': 'true', text: '?' }));
    return h('button', {
      class: `al-frame ${open ? 'is-open' : 'is-closed'}`,
      style: { '--accent': CHARS[who]?.color || '#C9A45C' },
      'aria-label': `${r.name}. ${open ? r.album.title : ALBUM_SAY.closed}`,
      'data-who': who,
    }, h('div', { class: 'al-pic' }, pic), h('span', { class: 'al-name', text: r.name }), h('span', { class: 'al-title', text: open ? r.album.title : ALBUM_SAY.closed }));
  });
  const go = nextBtn('계속');
  const el = h('section', { class: 'ov ov-album', role: 'dialog', 'aria-label': ALBUM_SAY.title },
    h('header', { class: 'al-head' }, h('h2', { text: ALBUM_SAY.title }), h('p', { class: 'al-sub', text: ALBUM_SAY.sub })),
    h('div', { class: 'al-grid' }, ...frames), cap, go);
  const close = mount(el);
  const step = stepper(go, '계속');
  let all = false;

  const showCap = (who) => {
    const r = REGULARS[who];
    const open = Boolean(opened[who]);
    frames.forEach((f) => f.classList.toggle('is-cur', f.dataset.who === who));
    capName.textContent = r.name;
    capTitle.textContent = open ? r.album.title : ALBUM_SAY.closed;
    capLine.textContent = open ? r.album.line : ALBUM_SAY.closedNote;
    capUsual.textContent = `늘 마시던 것 · ${usualOf(who)}`;
    cap.classList.add('on');
    cap.classList.toggle('is-closed', !open);
    announce(`${albumSpeech(who, open)} ${open ? '' : ALBUM_SAY.closedNote}`);
  };
  // 다 걸린 뒤에는 액자를 눌러 다시 보고 들음
  frames.forEach((f) => f.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!all) return;
    showCap(f.dataset.who);
    tts.speak(albumSpeech(f.dataset.who, Boolean(opened[f.dataset.who])), 'sys', { force: true });
  }));
  go.focus({ preventScroll: true });
  audio.sfx('page');
  announce(`${ALBUM_SAY.title}. ${ALBUM_SAY.sub}`);
  await step.step(async (ctl) => {
    await Promise.all([tts.speak(`${ALBUM_SAY.title}. ${ALBUM_SAY.sub}`, 'sys'), sleep(1200)]);
    for (const [i, who] of ALBUM_ORDER.entries()) {
      if (ctl.cancelled() || ctl.queued()) break;
      frames[i].classList.add('on');
      audio.sfx(opened[who] ? 'good' : 'tap');
      showCap(who);
      await readLine(albumSpeech(who, Boolean(opened[who])), 'sys', false);
    }
    frames.forEach((f) => f.classList.add('on'));
    all = true;
    if (ctl.cancelled() || ctl.queued()) return;
    frames.forEach((f) => f.classList.remove('is-cur'));
    cap.classList.remove('is-closed');
    capName.textContent = '';
    capTitle.textContent = '';
    capLine.textContent = ALBUM_SAY.end;
    capUsual.textContent = '액자를 누르면 다시 볼 수 있어요.';
    announce(ALBUM_SAY.end);
    await tts.speak(ALBUM_SAY.end, 'sys');
  }); // 다 읽은 뒤에는 학생이 [계속]을 누를 때까지 기다림(액자를 다시 볼 시간)
  tts.stop();
  close();
  await sleep(dur(300));
}

/* ---------- 사장의 눈 ---------- */

export async function eyes() {
  const seenMap = store.flag('seen') || {};
  const stageEl = h('div', { class: 'ey-stage' });
  const chip = h('p', { class: 'ey-chip' });
  const fresh = h('p', { class: 'ey-fresh', text: EYES_SAY.fresh });
  const count = h('p', { class: 'ey-count' });
  const lines = h('div', { class: 'ey-lines' });
  const go = nextBtn('다음');
  const el = h('section', { class: 'ov ov-eyes', role: 'dialog', 'aria-label': EYES_SAY.title },
    stageEl,
    h('header', { class: 'ey-head' }, h('h2', { text: EYES_SAY.title }), count, fresh),
    h('div', { class: 'ey-box' }, h('span', { class: 'ey-who', html: faceHTML('owner', 'normal') }), h('div', { class: 'ey-text' }, chip, lines)), go);
  const close = mount(el);
  const step = stepper(go, '다음');
  go.focus({ preventScroll: true });

  /** 한 장면: CG 를 바꾸고 줄을 하나씩. 다 읽으면 [다음]을 기다림 */
  const page = async ({ cg = null, head = '', n = 0, isFresh = false, body = [] }) => {
    stageEl.replaceChildren(cg ? cgView(cg) : h('div', { class: 'ey-dark' }));
    stageEl.classList.remove('on');
    requestAnimationFrame(() => stageEl.classList.add('on'));
    chip.textContent = head;
    chip.hidden = !head;
    count.textContent = n ? `${n} / ${EYES.length}` : '';
    fresh.hidden = !isFresh;
    el.classList.toggle('is-fresh', isFresh);
    const rows = body.map((t) => h('p', { class: 'ey-line', text: t }));
    lines.replaceChildren(...rows);
    await step.step(async (ctl) => {
      await sleep(isFresh ? 900 : 400);
      for (const [i, row] of rows.entries()) {
        if (ctl.cancelled()) return;
        row.classList.add('on');
        announce(`${i === 0 && head ? `${head}. ` : ''}${body[i]}`);
        await readLine(body[i], 'owner', isFresh);
      }
    }); // 다 읽은 뒤에는 [다음]을 누를 때까지 기다림
    rows.forEach((r) => r.classList.add('on'));
  };

  audio.sfx('page');
  announce(`${EYES_SAY.title}. ${EYES_SAY.sub}`);
  await page({ head: EYES_SAY.sub, body: EYES_INTRO });
  for (const [i, cut] of EYES.entries()) {
    await page({ cg: cut.cg, head: `${cut.when} · ${cut.title}`, n: i + 1, isFresh: !seenMap[cut.n], body: cut.lines });
  }
  step.label('계속');
  await page({ cg: 'winter_chalk_name', body: EYES_OUTRO });
  tts.stop();
  close();
  await sleep(dur(300));
}
