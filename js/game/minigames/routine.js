/**
 * 미니게임: 순서대로 — 가게 열기 · 마감 · 혼자 여는 아침 · 정전 준비 (docs/recipes.md 동작 H, 2026-10-31 풀 버전)
 *
 *  - 카페 그림 위에 오늘 할 일이 물건 단추로 한 줄. 지금 할 것이 금색으로 빛남. 빛나는 것을 누르면 다음이 빛남.
 *  - 순서가 아닌 것을 누르면 "그건 조금 뒤에 해요. 빛나는 것부터 해요."(감점 없음, 실수 수만 기록)
 *  - 아래 할 일 목록(번호 · 이름 · 끝낸 표시)이 늘 보임. 누를 때마다 한 일을 한 줄로 읽어 줌. 시간 제한 없음
 * 옵션: { title, kind: 'open' | 'alone' | 'close' | 'blackout', steps?: [{ icon, name, done }], bg?: [배경 id, 변형], quit? }
 * 돌려줌: { ok, attempts: 1, mistakes(순서가 아닌 것을 누른 수), ms } · 도중에 정리되면 { aborted: true }
 * 자동 플레이(?debug): window.__mgAuto(순서대로 모두) · window.__mgBad(순서가 아닌 것을 한 번 누름)
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { renderBg } from '../../data/backgrounds.js';
import { frame, line, abortGeneration, abortMinigame } from './frame.js';
import { isDebug } from './arcade.js';
import { bus } from '../../core/bus.js';

/** 하루를 여닫는 순서(같은 순서를 날마다 되풀이: 작업 단계와 절차 [12진로03-01]) */
export const ROUTINES = {
  open: {
    title: '가게 열기', bg: ['hall', 'morning'],
    howto: '빛나는 것을 순서대로 눌러요. 가게 열 준비를 해요.',
    steps: [
      { icon: 'light', name: '불 켜기', done: '불을 켰어요.' },
      { icon: 'coffee', name: '커피 머신 켜기', done: '머신이 천천히 데워져요.' },
      { icon: 'cup', name: '컵 데우기', done: '컵을 따뜻한 물로 데웠어요.' },
      { icon: 'milk', name: '우유 채우기', done: '냉장고에 우유를 채웠어요.' },
      { icon: 'sign_open', name: '간판 돌리기', done: '간판을 열었어요 쪽으로 돌렸어요.' },
    ],
  },
  alone: {
    title: '혼자 여는 아침', bg: ['cafe_front', 'morning'],
    howto: '사장님이 하던 순서 그대로예요. 빛나는 것을 순서대로 눌러요.',
    steps: [
      { icon: 'door', name: '열쇠로 문 열기', done: '열쇠가 딸깍 돌아갔어요.' },
      { icon: 'light', name: '불 켜기', done: '불을 켰어요.' },
      { icon: 'coffee', name: '커피 머신 켜기', done: '머신이 천천히 데워져요.' },
      { icon: 'cup', name: '컵 데우기', done: '컵을 따뜻한 물로 데웠어요.' },
      { icon: 'sign_open', name: '간판 돌리기', done: '간판을 열었어요 쪽으로 돌렸어요.' },
    ],
  },
  close: {
    title: '마감', bg: ['hall', 'evening'],
    howto: '빛나는 것을 순서대로 눌러요. 내일을 위해 정리해요.',
    steps: [
      { icon: 'towel', name: '머신 닦기', done: '머신을 깨끗이 닦았어요.' },
      { icon: 'cloth', name: '컵 닦기', done: '컵을 닦아서 엎어 두었어요.' },
      { icon: 'mop', name: '바닥 쓸기', done: '바닥을 쓸었어요.' },
      { icon: 'sign_open', name: '간판 돌리기', done: '간판을 닫았어요 쪽으로 돌렸어요.' },
      { icon: 'light_off', name: '불 끄기', done: '불을 껐어요.' },
    ],
  },
  blackout: {
    title: '정전 밤의 준비', bg: ['hall', 'blackout'],
    howto: '전기가 없어요. 빛나는 것을 순서대로 눌러 손으로 커피를 내릴 준비를 해요.',
    steps: [
      { icon: 'light', name: '촛불 켜기', done: '병 속 촛불이 하나씩 켜졌어요.' },
      { icon: 'caution', name: '버너 놓기', done: '강 씨의 버너를 평평한 곳에 놓았어요.' },
      { icon: 'water', name: '주전자에 물 붓기', done: '주전자에 물을 붓고 버너에 올렸어요.' },
      { icon: 'coffee', name: '드리퍼 놓기', done: '드리퍼와 원두를 꺼내 놓았어요.' },
    ],
  },
};

const SYS = {
  wrong: '그건 조금 뒤에 해요. 빛나는 것부터 해요.',
  done: '다 했어요!',
};

const routineOf = (opts) => ROUTINES[opts.kind] || ROUTINES.open;
const stepsOf = (opts) => (Array.isArray(opts.steps) && opts.steps.length ? opts.steps : routineOf(opts).steps);

/** 읽어 주는 문장 (tools/export-lines.mjs) */
export function routineLines(opts = {}) {
  const r = routineOf(opts);
  const title = opts.title || r.title;
  const out = [...line.intro(title, r.howto), line.sys(SYS.wrong), line.sys(SYS.done)];
  stepsOf(opts).forEach((s, i) => out.push(line.sys(`${i + 1}. ${s.name}`), line.sys(s.done)));
  return out;
}

/** 옵션 검사(시나리오 검사 도구) */
export function routineProblems(opts = {}) {
  const errs = [];
  if (opts.kind && !ROUTINES[opts.kind]) errs.push(`kind 는 ${Object.keys(ROUTINES).join(' · ')}`);
  for (const [i, s] of (opts.steps || []).entries()) if (!s.icon || !s.name || !s.done) errs.push(`steps[${i}]: icon · name · done 필요`);
  return errs;
}

export async function routine(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration();
  const stopped = () => abortGeneration() !== gen;
  const r = routineOf(opts);
  const steps = stepsOf(opts);
  const title = opts.title || r.title;
  const [bgId, bgVar] = opts.bg || r.bg;
  const f = frame({ title, instruction: r.howto, icon: 'checklist', cls: 'mg-scene mg-routine', quit: Boolean(opts.quit) });

  let next = 0;
  let mistakes = 0;
  let over = false;
  let doneRes;
  const doneP = new Promise((res) => { doneRes = res; });

  const scene = h('div', { class: 'sc-bg', html: renderBg(bgId, bgVar) });
  const say = h('p', { class: 'rt-say', 'aria-live': 'polite' });
  const btns = steps.map((s, i) => {
    const b = h('button', { class: 'rt-obj', 'aria-label': `${i + 1}. ${s.name}` },
      h('b', { class: 'rt-n', text: String(i + 1) }),
      h('span', { class: 'rt-ico', html: ICON(s.icon) }),
      h('span', { class: 'rt-name', text: s.name }),
      h('i', { class: 'rt-check', html: ICON('check') }));
    b.addEventListener('click', (e) => { e.stopPropagation(); press(i); });
    return b;
  });
  const list = h('ol', { class: 'rt-list' }, ...steps.map((s, i) => h('li', { 'data-i': String(i) }, h('b', { text: String(i + 1) }), h('span', { text: s.name }))));
  f.body.append(scene, h('div', { class: 'rt-row', role: 'group', 'aria-label': '할 일' }, ...btns), h('div', { class: 'rt-foot' }, list, say));

  const paint = () => {
    btns.forEach((b, i) => {
      b.classList.toggle('is-now', i === next);
      b.classList.toggle('is-done', i < next);
      b.setAttribute('aria-current', i === next ? 'step' : 'false');
    });
    [...list.children].forEach((li, i) => { li.classList.toggle('is-done', i < next); li.classList.toggle('is-now', i === next); });
    // 불 켜기 전 · 불 끈 뒤에는 장면이 어두움
    const on = steps.findIndex((s) => s.icon === 'light');
    const off = steps.findIndex((s) => s.icon === 'light_off');
    scene.classList.toggle('is-dim', (on >= 0 && next <= on) || (off >= 0 && next > off));
  };
  paint();
  setTimeout(() => btns[0]?.focus({ preventScroll: true }), 80);

  async function press(i) {
    if (over || stopped()) return;
    if (i !== next) {
      mistakes += 1;
      audio.sfx('tap');
      btns[i].classList.remove('shake');
      void btns[i].offsetWidth;
      btns[i].classList.add('shake');
      say.textContent = SYS.wrong;
      tts.speak(SYS.wrong, 'sys');
      return;
    }
    audio.sfx(['light', 'light_off'].includes(steps[i].icon) ? 'tap' : steps[i].icon === 'door' ? 'door' : steps[i].icon === 'cup' ? 'clink' : steps[i].icon === 'water' ? 'water' : steps[i].icon === 'mop' ? 'sweep' : 'good');
    next += 1;
    say.textContent = steps[i].done;
    paint();
    tts.speak(steps[i].done, 'sys');
    if (next >= steps.length) {
      over = true;
      await sleep(dur(700));
      if (stopped()) return;
      say.textContent = SYS.done;
      audio.sfx('great');
      await tts.speak(SYS.done, 'sys');
      doneRes('done');
      return;
    }
    setTimeout(() => { if (!over) btns[next]?.focus({ preventScroll: true }); }, 60);
  }

  if (isDebug()) {
    window.__mgAuto = async () => {
      while (!over && !stopped()) {
        await sleep(90);
        if (!document.querySelector('#layer-modal .ov')) btns[next]?.click();
      }
      await doneP;
    };
    window.__mgBad = async () => { if (!over) btns[Math.min(steps.length - 1, next + 1)]?.click(); };
  }
  const offQuit = opts.quit ? bus.on('mg:quit', () => { over = true; doneRes('quit'); abortMinigame(); }) : null;
  f.onAbort(() => { over = true; doneRes('abort'); });

  const how = await doneP;
  offQuit?.();
  if (isDebug()) { delete window.__mgAuto; delete window.__mgBad; }
  f.close();
  const ms = performance.now() - t0;
  if (how === 'abort') return { ok: false, aborted: true, attempts: 0, mistakes, ms };
  if (how === 'quit') return { ok: false, quit: true, attempts: 1, mistakes, ms };
  await sleep(dur(150));
  return { ok: true, attempts: 1, mistakes, ms };
}
