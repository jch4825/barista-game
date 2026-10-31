/**
 * 하루 끝: 오늘 만난 사람(단골의 반응을 글로 · 어긋났을 때 지은이 배운 점) · 오늘 만든 잔 · 오늘 배운 말 → 지은의 일기와 기분 고르기
 * 점수는 보이지 않습니다(원칙 1). 반응은 대응 직후의 연출과 같은 말(작은 끄덕임 · 미소 · 오래 바라봄)로만 남깁니다(docs/story.md 3장).
 * 옛 게임의 도장이 있는 에피소드면 도장도 함께 보여 줍니다.
 */

import { h, sleep, dur } from '../core/dom.js';
import { store } from '../core/store.js';
import { fill } from '../core/text.js';
import { ICON } from '../data/icons.js';
import { SKILLS, LEVELS, FEELINGS } from '../data/skills.js';
import { findTerm } from '../data/glossary.js';
import { PHOTOS, photoHTML } from '../data/photos.js';
import { ALL_OOPS, nextEpisode, ENDING } from '../data/episodes/index.js';
import { REGULARS } from '../data/regulars.js';
import { CHARS, faceHTML } from '../data/characters.js';
import { drinkName } from '../data/menu.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';
import { openScreen } from './screen.js';

/** 대응 직후 연출과 같은 말(runner.js REACT): 0 작은 끄덕임 · 1 미소 · 2 오래 바라봄 */
export const REACT_TEXT = { 2: '오래 바라봤어요', 1: '살짝 웃었어요', 0: '작게 고개를 끄덕였어요' };
export const metSpeech = (who, score) => `${REGULARS[who]?.name || ''}, ${REACT_TEXT[score] || REACT_TEXT[0]}.`;

/** 이번 판의 기록(store.log): 대응(같은 기회는 마지막 것) · 커피 만들기에서 드린 잔 */
function todayOf(ep, result) {
  const since = Date.now() - (result.ms || 0) - 3000;
  const logs = store.logs().filter((l) => l.ep === ep.id && (l.at || 0) >= since);
  const met = [];
  for (const l of logs) {
    if (l.type !== 'respond') continue;
    const i = met.findIndex((m) => m.id === l.id);
    if (i >= 0) met.splice(i, 1);
    met.push(l);
  }
  const cups = logs.filter((l) => l.type === 'mini' && Array.isArray(l.cups)).flatMap((l) => l.cups);
  return { met, cups };
}

/** 고른 대응 뒤 장면의 마지막 속마음(어긋났을 때 지은이 배운 점). 맞는 대응에는 없음 */
function lessonOf(l) {
  const c = REGULARS[l.who]?.touches?.[l.touch]?.choices.find((x) => x.id === l.choice);
  const th = (c?.after || []).filter((b) => b.t === 'think').pop();
  return th ? th.text : '';
}

function metView(met) {
  return h('section', { class: 'rs-met' }, h('h3', { text: '오늘 만난 사람' }), ...met.map((l) => {
    const r = REGULARS[l.who];
    const t = r?.touches?.[l.touch];
    const lesson = lessonOf(l);
    return h('div', { class: 'rs-met-row', style: { '--accent': CHARS[l.who]?.color || '#C9A45C' } },
      h('span', { class: 'rs-met-face', html: faceHTML(l.who, l.score === 2 ? 'smile' : 'normal') }),
      h('div', { class: 'rs-met-text' },
        h('b', { text: `${r?.name || l.who}${t?.title ? ` · ${t.title}` : ''}` }),
        h('p', { class: 'rs-met-react', text: REACT_TEXT[l.score] || REACT_TEXT[0] }),
        lesson ? h('p', { class: 'rs-met-lesson', text: `지은의 생각: ${lesson}` }) : null));
  }));
}

function cupsView(cups) {
  const count = new Map();
  for (const c of cups) {
    const name = drinkName(c.menu, c.temp);
    if (name) count.set(name, (count.get(name) || 0) + 1);
  }
  return h('section', { class: 'rs-cups' }, h('h3', { text: `오늘 만든 잔 · ${cups.length}잔` }),
    h('div', { class: 'rs-cup-list' }, ...[...count].map(([name, n]) => h('span', { class: 'chip', text: n > 1 ? `${name} ${n}잔` : name }))));
}

function waitBtn(btn) {
  return new Promise((r) => btn.addEventListener('click', (e) => { e.stopPropagation(); r(); }, { once: true }));
}

function feelingPicker(question) {
  const wrap = h('div', { class: 'rs-feel' }, h('p', { class: 'rs-q', text: question }));
  const row = h('div', { class: 'rs-feel-row' });
  wrap.append(row);
  const promise = new Promise((resolve) => {
    for (const f of FEELINGS) {
      row.append(h('button', { class: 'rs-feel-btn', 'aria-label': f.label, onclick: (e) => { e.stopPropagation(); audio.sfx('tap'); resolve(f.id); } },
        h('i', { html: ICON(f.icon) }), h('span', { text: f.label })));
    }
  });
  return { wrap, promise };
}

/**
 * 반환: 'next' | 'ending' | 'again'(자유 영업 다음 날) | 'hub' | 'title'
 * ending: 이야기의 마지막 에피소드를 처음 마쳤을 때 → [다음 이야기] 대신 [엔딩 보기]
 */
export async function showResult(ep, result, { ending = false, again = '' } = {}) {
  audio.bgm('celebrate');
  const scr = openScreen({ cls: 'scr-result', title: '하루 끝', icon: 'calendar', closable: false });
  const today = todayOf(ep, result);

  // 1) 도장
  const best = new Map();
  for (const st of result.stamps) best.set(st.skill, Math.max(best.get(st.skill) || 0, st.level));
  const stampWrap = h('div', { class: 'rs-stamps' });
  const got = new Set(store.oopsList());
  const epOops = ALL_OOPS.filter((o) => o.ep === ep.id);
  const nextBtn = h('button', { class: 'btn btn-big btn-main' }, h('i', { html: ICON('arrow_right') }), h('span', { text: '일기 쓰기' }));
  scr.body.append(
    h('h2', { class: 'rs-ep', text: `${ep.label} · ${ep.title}` }),
    stampWrap,
    today.met.length || today.cups.length ? h('div', { class: 'rs-today' }, today.met.length ? metView(today.met) : null, today.cups.length ? cupsView(today.cups) : null) : null,
    h('div', { class: 'rs-row' },
      result.photos.length ? h('figure', { class: 'rs-pol' }, h('div', { class: 'ph-in', html: photoHTML(result.photos[0]) }), h('figcaption', { text: PHOTOS[result.photos[0]]?.title || '' })) : null,
      h('div', { class: 'rs-side' },
        result.terms.length ? h('div', { class: 'rs-words' }, h('b', { text: '오늘 배운 말' }), ...result.terms.map((t) => h('span', { class: 'chip', text: findTerm(t)?.word || t }))) : null,
        epOops.length ? h('p', { class: 'rs-oops' }, h('i', { html: ICON('think') }), `아차 노트 ${epOops.filter((o) => got.has(o.id)).length} / ${epOops.length}`) : null)),
    nextBtn);

  const say = [`${ep.title}. 오늘 하루를 돌아봐요.`];
  if (today.met.length) say.push('오늘 만난 사람.', ...today.met.map((l) => metSpeech(l.who, l.score)));
  for (const [skill, lv] of best) {
    const sk = SKILLS[skill];
    stampWrap.append(h('div', { class: 'rs-stamp', style: { '--c': sk.color } },
      h('div', { class: 'rs-seal', html: ICON(sk.icon) }), h('b', { text: sk.name }),
      h('span', { class: 'rs-stars', text: `${'★'.repeat(lv)}${'☆'.repeat(3 - lv)}` }), h('small', { text: LEVELS[lv].short })));
    say.push(`${sk.name}, ${LEVELS[lv].name}.`);
  }
  if (!best.size && !today.met.length && !today.cups.length) stampWrap.append(h('p', { class: 'nb-empty', text: '오늘은 이야기를 함께 봤어요.' }));
  if (!best.size && (today.met.length || today.cups.length)) stampWrap.remove();
  [...stampWrap.children].forEach((c, i) => {
    c.style.animationDelay = `${i * 0.18}s`;
    setTimeout(() => audio.sfx('stamp'), dur(200 + i * 180));
  });
  tts.speakSeq(say, 'sys'); // 조각마다 미리 만든 음성 (tools/export-lines.mjs)
  nextBtn.focus({ preventScroll: true });
  await waitBtn(nextBtn);
  tts.stop();

  // 2) 일기 + 기분
  audio.bgm('warm');
  const diary = h('p', { class: 'rs-diary', text: fill(ep.diary || '') });
  scr.body.replaceChildren(h('h2', { class: 'rs-ep', text: '지은의 일기' }), h('div', { class: 'rs-paper' }, diary));
  tts.speak(ep.diary || '', 'jieun'); // 지은의 일기는 지은 목소리(tools/export-lines.mjs 와 같게)
  const fp1 = feelingPicker('지은은 오늘 어떤 기분이었을까요?');
  scr.body.append(fp1.wrap);
  setTimeout(() => fp1.wrap.querySelector('button')?.focus({ preventScroll: true }), 80);
  const f1 = await fp1.promise;
  tts.stop();
  fp1.wrap.replaceChildren(h('p', { class: 'rs-q', text: `지은의 기분: ${FEELINGS.find((f) => f.id === f1).label}` }));

  const fp2 = feelingPicker('나는 오늘 어땠나요? (고르지 않아도 돼요)');
  const skip = h('button', { class: 'btn btn-soft' }, h('span', { text: '건너뛰기' }));
  fp2.wrap.append(skip);
  scr.body.append(fp2.wrap);
  setTimeout(() => fp2.wrap.querySelector('button')?.focus({ preventScroll: true }), 80);
  tts.speak('나는 오늘 어땠나요?', 'sys');
  const f2 = await Promise.race([fp2.promise, waitBtn(skip).then(() => null)]);
  tts.stop();
  store.addDiary({ ep: ep.id, feeling: f1, myFeeling: f2 || null, ...(ep.free ? { day: ep.free } : {}) });
  if (f2) fp2.wrap.replaceChildren(h('p', { class: 'rs-q', text: `나의 기분: ${FEELINGS.find((f) => f.id === f2).label}` }));
  else fp2.wrap.remove();

  // 3) 다음
  const nx = nextEpisode(ep.id);
  return new Promise((resolve) => {
    const btns = h('div', { class: 'rs-btns' },
      ending ? h('button', { class: 'btn btn-big btn-main', onclick: (e) => { e.stopPropagation(); scr.close(); resolve('ending'); } }, h('i', { html: ICON('star') }), h('span', { text: '엔딩 보기' })) : null,
      nx ? h('button', { class: 'btn btn-big btn-main', onclick: (e) => { e.stopPropagation(); scr.close(); resolve('next'); } }, h('i', { html: ICON('play') }), h('span', { text: `다음 이야기: ${nx.title}` })) : null,
      again ? h('button', { class: 'btn btn-big btn-main', onclick: (e) => { e.stopPropagation(); scr.close(); resolve('again'); } }, h('i', { html: ICON('play') }), h('span', { text: again })) : null,
      h('button', { class: 'btn btn-big', onclick: (e) => { e.stopPropagation(); scr.close(); resolve('hub'); } }, h('i', { html: ICON('calendar') }), h('span', { text: '달력' })),
      h('button', { class: 'btn btn-soft', onclick: (e) => { e.stopPropagation(); scr.close(); resolve('title'); } }, h('i', { html: ICON('home') }), h('span', { text: '처음 화면' })));
    scr.body.append(btns);
    btns.querySelector('button').focus({ preventScroll: true });
    if (ending) tts.speak(ENDING.cue, 'sys');
  });
}
