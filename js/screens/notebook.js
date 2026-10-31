/**
 * 마일스톤 수첩: 도장 · 함께 일하는 사람 · 말 사전 · 사진첩 · 아차 노트 · 일기
 *  - 함께 일하는 사람: 왼쪽 목록 · 가운데 종이 카드 · 오른쪽 큰 그림 (크루 카드를 본 사람만 열림)
 *  - 사진첩: 왼쪽 목록 + 오른쪽 큰 인화 (오늘의 한 장 + 본 이벤트 CG)
 */

import { h } from '../core/dom.js';
import { store } from '../core/store.js';
import { fill } from '../core/text.js';
import { ICON } from '../data/icons.js';
import { SKILLS, SKILL_ORDER, LEVELS, FEELINGS } from '../data/skills.js';
import { GLOSSARY } from '../data/glossary.js';
import { PHOTOS, PHOTO_ORDER, photoHTML } from '../data/photos.js';
import { CHARS, CARD_IDS, faceHTML, portraitHTML, hasStand, standURL, cardSpeech } from '../data/characters.js';
import { CGS, CG_IDS } from '../data/cg.js';
import { img } from '../core/assets.js';
import { EPISODES, ALL_OOPS, getEpisode } from '../data/episodes/index.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { ov } from '../ui/overlays.js';
import { openScreen } from './screen.js';

const TABS = [
  ['stamps', '도장', 'stamp'],
  ['people', '함께 일하는 사람', 'team'],
  ['words', '말 사전', 'book'],
  ['photos', '사진첩', 'photo'],
  ['oops', '아차 노트', 'think'],
  ['diary', '일기', 'note'],
];

function stampsView() {
  const st = store.stamps();
  const total = SKILL_ORDER.reduce((a, k) => a + (st[k]?.best || 0), 0);
  return h('div', {},
    h('p', { class: 'nb-sum', text: `모은 별 ${total} / ${SKILL_ORDER.length * 3}` }),
    h('div', { class: 'nb-stamps' }, ...SKILL_ORDER.map((k) => {
      const sk = SKILLS[k];
      const best = st[k]?.best || 0;
      return h('div', { class: `nb-stamp ${best ? 'got' : ''}`, style: { '--c': sk.color } },
        h('div', { class: 'nb-seal', html: ICON(sk.icon) }),
        h('b', { text: sk.name }),
        h('span', { class: 'nb-stars', text: best ? `${'★'.repeat(best)}${'☆'.repeat(3 - best)}` : '☆☆☆' }),
        h('small', { text: best ? LEVELS[best].name : sk.desc }));
    })));
}

function wordsView() {
  const got = new Set(store.terms());
  return h('div', { class: 'nb-words' }, ...GLOSSARY.map((g) => {
    const on = got.has(g.id);
    return h('button', {
      class: `nb-word ${on ? 'got' : ''}`, disabled: !on, 'aria-label': on ? g.word : '아직 모르는 낱말',
      onclick: (e) => { e.stopPropagation(); ov.glossary(g.id, { fromText: false }); },
    }, h('i', { html: ICON(on ? g.icon : 'lock') }), h('span', { text: on ? g.word : '???' }));
  }));
}

/** 왼쪽 목록 + 오른쪽 크게 보기 (목록 단추를 누르면 오른쪽이 바뀜) */
function listDetail(cls, items, render) {
  const detail = h('div', { class: 'nb-detail' });
  const list = h('div', { class: 'nb-list', role: 'listbox' });
  const show = (i) => {
    list.querySelectorAll('.nb-li').forEach((b, k) => { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', String(k === i)); });
    detail.replaceChildren(render(items[i]));
  };
  items.forEach((it, i) => list.append(h('button', {
    class: `nb-li ${it.on ? '' : 'locked'}`, role: 'option', disabled: !it.on,
    'aria-label': it.on ? it.label : '아직 열리지 않았어요',
    onclick: (e) => { e.stopPropagation(); audio.sfx('page'); show(i); },
  }, h('span', { class: 'nb-li-ico', html: it.on ? it.icon : ICON('lock') }), h('span', { class: 'nb-li-text' }, h('b', { text: it.on ? it.label : '???' }), it.sub && it.on ? h('small', { text: it.sub }) : null))));
  const first = items.findIndex((it) => it.on);
  if (first >= 0) show(first);
  else detail.append(h('p', { class: 'nb-empty', text: '아직 아무것도 없어요. 이야기를 하면 하나씩 열려요.' }));
  return h('div', { class: `nb-split ${cls}` }, list, detail);
}

/** 크루 카드를 처음 보여 주는 에피소드 (meet 비트가 있는 곳) */
const MEET_EP = (() => {
  const map = {};
  const walk = (ep, list) => (Array.isArray(list) ? list : []).forEach((b) => {
    if (b.t === 'meet' && !map[b.who]) map[b.who] = ep.id;
    if (b.t === 'branch') Object.values(b.cases || {}).forEach((l) => walk(ep, l));
    (b.choices || []).forEach((c) => { walk(ep, c.praise); walk(ep, c.fail); });
    (b.options || []).forEach((o) => walk(ep, o.then));
  });
  EPISODES.forEach((ep) => walk(ep, ep.script));
  return map;
})();

function peopleView() {
  const met = new Set(store.metList());
  const items = CARD_IDS.map((id) => {
    const c = CHARS[id];
    const on = met.has(id) || (MEET_EP[id] && store.isDone(MEET_EP[id]));
    return { id, on, label: c.full || c.name, sub: c.role, icon: `<span class="nb-face">${faceHTML(id, 'smile')}</span>` };
  });
  return listDetail('nb-people', items, ({ id }) => {
    const c = CHARS[id];
    const big = hasStand(id)
      ? h('div', { class: 'nb-stand', style: { backgroundImage: `url('${standURL(id, 'smile')}')` } })
      : h('figure', { class: 'nb-bigpol' }, h('div', { class: 'pol-photo', html: portraitHTML(id, 'smile') }), h('figcaption', { text: c.name }));
    return h('div', { class: 'nb-person', style: { '--accent': c.color || 'var(--main)' } },
      h('div', { class: 'nb-card' },
        h('div', { class: 'nb-card-head' }, h('b', { text: c.full || c.name }), h('span', { text: c.role || '' })),
        h('ul', { class: 'nb-card-lines' }, ...c.card.lines.map((l) => h('li', { text: l }))),
        h('button', { class: 'btn btn-small', 'aria-label': '읽어 주기', onclick: (e) => { e.stopPropagation(); tts.speak(cardSpeech(id), 'sys', { force: true }); } }, h('i', { html: ICON('volume') }), h('span', { text: '듣기' }))),
      big);
  });
}

function photosView() {
  const got = new Set(store.photos());
  const items = PHOTO_ORDER.map((id) => ({ kind: 'photo', id, on: got.has(id), label: PHOTOS[id].title, sub: getEpisode(PHOTOS[id].ep)?.label || '', icon: ICON('photo') }))
    .concat(CG_IDS.filter((id) => got.has(`cg_${id}`) && img.has('cg', `cg_${id}`)).map((id) => ({ kind: 'cg', id, on: true, label: CGS[id].title, sub: `${getEpisode(CGS[id].ep)?.label || ''} · 명장면`, icon: ICON('sparkle') })));
  const n = items.filter((it) => it.on && it.kind === 'photo').length;
  return h('div', {},
    h('p', { class: 'nb-sum', text: `오늘의 한 장 ${n} / ${PHOTO_ORDER.length}` }),
    listDetail('nb-album', items, (it) => (it.kind === 'cg'
      ? h('figure', { class: 'nb-print cg' }, h('img', { src: img.url('cg', `cg_${it.id}`), alt: '' }), h('figcaption', { text: it.label }))
      : h('figure', { class: 'nb-print' }, h('div', { class: 'ph-in', html: photoHTML(it.id) }), h('figcaption', { text: it.label })))));
}

function oopsView() {
  const got = new Set(store.oopsList());
  const found = ALL_OOPS.filter((o) => got.has(o.id)).length;
  return h('div', {},
    h('p', { class: 'nb-sum', text: `발견한 아차! ${found} / ${ALL_OOPS.length} · 일부러 다른 길을 골라 보는 것도 배움이에요.` }),
    ...EPISODES.map((ep) => {
      const list = ALL_OOPS.filter((o) => o.ep === ep.id);
      if (!list.length) return null;
      return h('section', { class: 'nb-oops-ep' },
        h('h3', { text: `${ep.label} · ${ep.title}` }),
        h('div', { class: 'nb-oops' }, ...list.map((o) => {
          const on = got.has(o.id);
          return h('div', { class: `nb-oops-card ${on ? 'got' : ''}` },
            h('i', { html: ICON(on ? o.icon || 'think' : 'lock') }),
            h('b', { text: on ? o.title : '아직 모르는 아차!' }),
            on ? h('p', { text: fill(o.lesson) }) : null,
            on ? h('button', { class: 'nb-say', 'aria-label': '읽어 주기', html: ICON('volume'), onclick: (e) => { e.stopPropagation(); tts.speak(`아차! ${o.title}. ${o.lesson}`, 'sys', { force: true }); } }) : null);
        })));
    }));
}

function diaryView() {
  const p = store.active();
  const list = (p?.diary || []).slice().reverse();
  if (!list.length) return h('p', { class: 'nb-empty', text: '아직 일기가 없어요. 에피소드를 마치면 지은의 일기가 생겨요.' });
  const fl = Object.fromEntries(FEELINGS.map((f) => [f.id, f]));
  return h('div', { class: 'nb-diary' }, ...list.map((d) => {
    const ep = getEpisode(d.ep);
    return h('article', { class: 'nb-diary-item' },
      h('h3', { text: ep ? `${ep.label} · ${ep.title}` : d.ep }),
      h('p', { class: 'nb-diary-text', text: ep?.diary || '' }),
      h('p', { class: 'nb-feel' },
        d.feeling ? h('span', {}, h('i', { html: ICON(fl[d.feeling]?.icon || 'f_okay') }), `지은: ${fl[d.feeling]?.label || ''}`) : null,
        d.myFeeling ? h('span', {}, h('i', { html: ICON(fl[d.myFeeling]?.icon || 'f_okay') }), `나: ${fl[d.myFeeling]?.label || ''}`) : null));
  }));
}

const VIEWS = { stamps: stampsView, people: peopleView, words: wordsView, photos: photosView, oops: oopsView, diary: diaryView };

export function showNotebook(tab = 'stamps') {
  const scr = openScreen({ cls: 'scr-notebook', title: '마일스톤 수첩', icon: 'book' });
  const content = h('div', { class: 'nb-content' });
  const tabs = h('div', { class: 'nb-tabs', role: 'tablist' });
  const select = (id) => {
    tabs.querySelectorAll('button').forEach((b) => {
      const on = b.dataset.tab === id;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    content.replaceChildren(VIEWS[id]());
    audio.sfx('page');
  };
  for (const [id, label, icon] of TABS) {
    tabs.append(h('button', { class: 'nb-tab', role: 'tab', 'data-tab': id, onclick: (e) => { e.stopPropagation(); select(id); } }, h('i', { html: ICON(icon) }), h('span', { text: label })));
  }
  scr.body.append(tabs, content);
  select(tab);
  return scr;
}
