/**
 * 수첩: 단골 · 메뉴 도감 · 장면 앨범 · 말 사전 · 일기 (옛 게임의 도장 · 크루 카드 · 아차 노트는 데이터가 생기면 다시 보임)
 *  - 단골: 만난 단골(대응을 한 번 한 사람)만 열림. 늘 마시는 것은 한 번 맞게 낸 뒤에 적힘(store 'usuals'),
 *    들은 이야기(앨범 액자)는 그 장면을 본 뒤에만. 신뢰 점수는 보이지 않음(원칙 1)
 *  - 메뉴 도감: 만들어 본 메뉴(store.book, 해가 바뀌어도 남음)와 아직 안 만든 메뉴
 *  - 장면 앨범: 본 이벤트 CG(그림이 없으면 임시 그림) · 오늘의 한 장
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
import { REGULARS } from '../data/regulars.js';
import { RECIPES, TEMPS, HAND_SKILLS, ODD_DRINKS, ODD_ANY } from '../data/menu.js';
import * as grow from '../core/grow.js';
import { josa } from '../core/text.js';
import { usualOf } from '../data/eyes.js';
import { freeDay } from '../data/episodes/free.js';
import { cgPlaceholder } from '../ui/cg-placeholder.js';
import { img } from '../core/assets.js';
import { EPISODES, ALL_OOPS, getEpisode } from '../data/episodes/index.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { ov } from '../ui/overlays.js';
import { openScreen } from './screen.js';

const TABS = [
  ['regulars', '단골', 'team'],
  ['grow', '나의 성장', 'star'],
  ['menu', '메뉴 도감', 'coffee'],
  ['photos', '장면 앨범', 'photo'],
  ['words', '말 사전', 'book'],
  ['diary', '일기', 'note'],
];

/** 단골: 대응을 한 번이라도 한 사람(기록 'respond')만 열림 */
function regularsView() {
  const met = new Set(store.logs().filter((l) => l.type === 'respond').map((l) => l.who));
  const usuals = store.flag('usuals') || {};
  const album = store.album();
  const first = {};
  for (const l of store.logs()) if (l.type === 'respond' && !first[l.who]) first[l.who] = getEpisode(l.ep)?.label || '';
  const items = Object.keys(REGULARS).map((id) => ({
    id, on: met.has(id), label: REGULARS[id].name, sub: first[id] ? `${first[id]}에 처음 만남` : '',
    icon: `<span class="nb-face">${faceHTML(id, 'smile')}</span>`,
  }));
  const n = items.filter((it) => it.on).length;
  return h('div', {},
    h('p', { class: 'nb-sum', text: `만난 단골 ${n} / ${items.length}` }),
    listDetail('nb-people nb-regulars', items, ({ id }) => {
      const r = REGULARS[id];
      // 기억 카드(재미 개편 6.5): 대응마다 '오늘 알게 된 것'. 고른 대응과 관계없이 늘 받음(점수는 보이지 않음)
      const cards = store.grow().cards;
      const known = Object.entries(r.touches || {}).filter(([tid, t]) => t.card && cards.includes(`${id}.${tid}`)).map(([, t]) => `기억 카드: ${t.card}`);
      const lines = [
        usuals[id] ? `늘 마시는 것: ${usualOf(id)}` : '늘 마시는 것: 아직 몰라요. "늘 먹던 거"를 한 번 맞게 내면 적혀요.',
        ...known,
        album[id] ? `들은 이야기: ${r.album.title}. ${r.album.line}` : null,
      ].filter(Boolean);
      return h('div', { class: 'nb-person', style: { '--accent': CHARS[id]?.color || 'var(--main)' } },
        h('div', { class: 'nb-card' },
          h('div', { class: 'nb-card-head' }, h('b', { text: r.name }), h('span', { text: first[id] ? `${first[id]}에 처음 만남` : '' })),
          h('ul', { class: 'nb-card-lines' }, ...lines.map((l) => h('li', { text: l }))),
          h('button', { class: 'btn btn-small', 'aria-label': '읽어 주기', onclick: (e) => { e.stopPropagation(); tts.speak(`${r.name}. ${lines.join(' ')}`, 'sys', { force: true }); } }, h('i', { html: ICON('volume') }), h('span', { text: '듣기' }))),
        hasStand(id) ? h('div', { class: 'nb-stand', style: { backgroundImage: `url('${standURL(id, 'smile')}')` } })
          : h('figure', { class: 'nb-bigpol' }, h('div', { class: 'pol-photo', html: portraitHTML(id, 'smile') }), h('figcaption', { text: r.name })));
    }));
}

/** 메뉴 도감: 만들어 본 메뉴는 이름 · 온도 · 만드는 순서, 아직이면 ??? */
function menuView() {
  const made = new Set(store.book());
  const gold = new Set(store.grow().perfect); // 완벽한 한 잔(손 동작을 모두 '딱 좋아요'로 직접) → 금빛 별
  const ids = Object.keys(RECIPES);
  return h('div', {},
    h('p', { class: 'nb-sum', text: `만들어 본 메뉴 ${ids.filter((id) => made.has(id)).length} / ${ids.length} · 금빛 별 ${ids.filter((id) => gold.has(id)).length}` }),
    h('div', { class: 'nb-menu' }, ...ids.map((id) => {
      const r = RECIPES[id];
      const on = made.has(id);
      return h('div', { class: `nb-menu-card ${on ? 'got' : ''} ${gold.has(id) ? 'is-gold' : ''}`.trim() },
        h('i', { class: 'nb-menu-dot', style: { '--c': r.color || '#B08A5A' } }),
        gold.has(id) ? h('i', { class: 'nb-menu-star', 'aria-label': '완벽한 한 잔', html: ICON('star') }) : null,
        h('b', { text: on ? r.name : '???' }),
        on ? h('small', { text: r.temps.map((t) => TEMPS[t]?.name || t).join(' · ') }) : h('small', { text: '아직 만들어 보지 않았어요' }));
    })));
}

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
    .concat(CG_IDS.filter((id) => got.has(`cg_${id}`)).map((id) => ({ kind: 'cg', id, on: true, label: CGS[id].title, sub: `${getEpisode(CGS[id].ep)?.label || (CGS[id].ep === 'ending' ? '엔딩' : '')} · 장면`, icon: ICON('sparkle') })));
  const n = items.filter((it) => it.kind === 'cg').length;
  return h('div', {},
    h('p', { class: 'nb-sum', text: `본 장면 ${n} / ${CG_IDS.length}` }),
    listDetail('nb-album', items, (it) => (it.kind === 'cg'
      ? h('figure', { class: 'nb-print cg' }, img.has('cg', `cg_${it.id}`) ? h('img', { src: img.url('cg', `cg_${it.id}`), alt: '' }) : h('div', { class: 'nb-cg-ph' }, h('div', { class: 'en-cg-mini nb-cg-mini' }, cgPlaceholder(it.id))), h('figcaption', { text: it.label }))
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
    const ep = d.ep === 'free' ? freeDay(d.day || 1) : getEpisode(d.ep);
    return h('article', { class: 'nb-diary-item' },
      h('h3', { text: ep ? `${ep.label} · ${ep.title}` : d.ep }),
      h('p', { class: 'nb-diary-text', text: ep?.diary || '' }),
      h('p', { class: 'nb-feel' },
        d.feeling ? h('span', {}, h('i', { html: ICON(fl[d.feeling]?.icon || 'f_okay') }), `지은: ${fl[d.feeling]?.label || ''}`) : null,
        d.myFeeling ? h('span', {}, h('i', { html: ICON(fl[d.myFeeling]?.icon || 'f_okay') }), `나: ${fl[d.myFeeling]?.label || ''}`) : null));
  }));
}

/**
 * 나의 성장(재미 개편 6장): 단계 · 능력치 넷 · 익숙해진 손 기술 · 모은 돈과 가게 꾸미기 · 엉뚱한 잔 도감.
 * 지은 자신의 기록이라 보임(단골 신뢰는 숨김, 원칙 1). 오르기만 하고 다른 학생과 견주지 않음(원칙 14)
 */
function growView() {
  const wrap = h('div', { class: 'nb-grow' });
  const draw = () => {
    const g = store.grow();
    const st = grow.stats(g);
    const rk = grow.rank();
    const apron = grow.apronOf(g.apron);
    const head = h('div', { class: 'gr-head' },
      h('div', { class: 'gr-rank' }, h('i', { html: ICON('badge') }), h('b', { text: rk.name })),
      h('div', { class: 'gr-apron', style: { '--c': apron.color } }, h('i', { html: ICON('apron') }), h('span', { text: apron.name })),
      h('div', { class: 'gr-money' }, h('i', { html: ICON('coin') }), h('b', { text: `모은 돈 ${grow.won(g.money)}` }), h('small', { text: `지금까지 번 돈 ${grow.won(g.earned)}` })));
    const stats = h('section', { class: 'gr-stats' }, h('h3', { text: '능력치' }), ...grow.STATS.map((s) => {
      const v = st[s.id];
      const say = `${s.name} ${v.level}단계. ${s.how} ${s.effect}`;
      return h('div', { class: 'gr-stat' },
        h('i', { class: 'gr-stat-ico', html: ICON(s.icon) }),
        h('div', { class: 'gr-stat-main' },
          h('p', { class: 'gr-stat-name' }, h('b', { text: s.name }), h('span', { text: `${v.level}단계` }), v.next ? h('small', { text: `다음 단계까지 ${v.next}` }) : h('small', { text: '가장 높은 단계' })),
          h('span', { class: 'gr-pips', 'aria-hidden': 'true' }, ...Array.from({ length: grow.MAX_LEVEL }, (_, i) => h('i', { class: i < v.level ? 'on' : '' }))),
          h('p', { class: 'gr-stat-how', text: `${s.how} ${s.effect}` })),
        h('button', { class: 'nb-say', 'aria-label': `${s.name} 읽어 주기`, html: ICON('volume'), onclick: (e) => { e.stopPropagation(); tts.speak(say, 'sys', { force: true }); } }));
    }));
    const skills = Object.entries(HAND_SKILLS).filter(([id]) => g.skills[id]);
    const hand = h('section', { class: 'gr-skills' }, h('h3', { text: `익숙해진 손 기술 ${skills.filter(([id]) => g.skills[id] >= grow.MASTER_AT).length}` }),
      skills.length ? h('div', { class: 'gr-skill-list' }, ...skills.map(([id, sk]) => {
        const n = g.skills[id];
        const done = n >= grow.MASTER_AT;
        return h('span', { class: `gr-skill ${done ? 'is-done' : ''}`.trim() }, h('i', { html: ICON(done ? 'sparkle' : sk.icon || 'hand') }), h('b', { text: sk.name }), h('small', { text: done ? '익숙해짐 · [맡기기] 가능' : `${n} / ${grow.MASTER_AT}번` }));
      })) : h('p', { class: 'nb-empty', text: '커피를 만들면 손 기술이 하나씩 쌓여요. 열 번 하면 익숙해져요.' }));
    const shop = h('section', { class: 'gr-shop' }, h('h3', { text: '가게 꾸미기 · 앞치마' }),
      h('p', { class: 'gr-shop-note', text: '일해서 모은 돈으로 사요. 꾸미기는 처음 화면의 카페 앞에 놓여요.' }),
      h('div', { class: 'gr-shop-list' }, ...[grow.APRON_BASIC, ...grow.SHOP].map((it) => {
        const owned = grow.owns(it.id);
        const wearing = it.kind === 'apron' && g.apron === it.id;
        let act;
        if (it.kind === 'apron' && owned) {
          act = h('button', { class: `btn btn-small ${wearing ? 'btn-main' : 'btn-soft'}`, disabled: wearing, onclick: (e) => { e.stopPropagation(); audio.sfx('towel'); grow.wearApron(it.id); draw(); } }, h('span', { text: wearing ? '입고 있어요' : '입기' }));
        } else if (owned) act = h('span', { class: 'gr-owned', text: '가게에 있어요' });
        else {
          act = h('button', {
            class: 'btn btn-small btn-main', disabled: g.money < it.price,
            onclick: async (e) => {
              e.stopPropagation();
              const ok = await ov.confirm({ text: `${josa(it.name, '을/를')} ${grow.won(it.price)}에 살까요?`, detail: `모은 돈 ${grow.won(g.money)} → ${grow.won(g.money - it.price)}`, yes: '사기', no: '그만두기' });
              if (!ok || !grow.buy(it.id)) return;
              audio.sfx('coin');
              ov.toast(`${josa(it.name, '을/를')} 샀어요!`, it.kind === 'apron' ? 'apron' : 'sparkle');
              draw();
            },
          }, h('i', { html: ICON('coin') }), h('span', { text: g.money < it.price ? `${grow.won(it.price)} · 돈이 모자라요` : `${grow.won(it.price)}에 사기` }));
        }
        return h('div', { class: `gr-item ${owned ? 'is-owned' : ''}`.trim(), style: it.color ? { '--c': it.color } : {} },
          h('i', { class: 'gr-item-ico', html: ICON(it.kind === 'apron' ? 'apron' : it.icon) }),
          h('div', {}, h('b', { text: it.name }), h('small', { text: it.desc })), act);
      })));
    const found = new Set(g.odd);
    const odds = [...ODD_DRINKS, ODD_ANY];
    const odd = h('section', { class: 'gr-odd' }, h('h3', { text: `엉뚱한 잔 도감 ${odds.filter((o) => found.has(o.id)).length} / ${odds.length}` }),
      h('p', { class: 'gr-shop-note', text: '레시피에 없는 잔을 만들면 사장님께 맛보일 수 있어요.' }),
      h('div', { class: 'gr-odd-list' }, ...odds.map((o) => (found.has(o.id)
        ? h('div', { class: 'gr-odd-card got' }, h('b', { text: o.name }), h('p', { text: `사장님: ${o.say}` }))
        : h('div', { class: 'gr-odd-card' }, h('i', { html: ICON('lock') }), h('b', { text: '???' }))))));
    wrap.replaceChildren(head, stats, hand, shop, odd);
  };
  draw();
  return wrap;
}

const VIEWS = { grow: growView, regulars: regularsView, menu: menuView, stamps: stampsView, people: peopleView, words: wordsView, photos: photosView, oops: oopsView, diary: diaryView };

export function showNotebook(tab = 'regulars') {
  if (!TABS.some(([id]) => id === tab)) tab = 'regulars';
  const scr = openScreen({ cls: 'scr-notebook', title: '수첩', icon: 'book' });
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
