/**
 * 선생님 모드 → 제작·저작권 정보 (제작 및 데이터 투명성, 저작권)
 *  - 고정 글: js/data/credits.js
 *  - 바뀌는 자료: assets/credits/credits.json (npm run credits 가 PRD 최종본·대화 기록·검수 문서·그림·소리 목록으로 만듦)
 *  학생에게 읽어 주지 않는 선생님용 화면이라 음성은 없습니다.
 */

import { h } from '../core/dom.js';
import { ICON } from '../data/icons.js';
import { ov } from '../ui/overlays.js';
import { openScreen } from './screen.js';
import {
  CREDITS_TABS, OVERVIEW, PRD_INTRO, REQUESTS_INTRO, WORKLOG_INTRO, IMAGES_INTRO, IMAGES_EXTRA, MUSIC_INTRO, TOOLS_TEXT, DATA_TEXT, COPYRIGHT_TEXT,
  PROMPT_FROM, REQUEST_HOW,
} from '../data/credits.js';

let cache = null;
async function loadData() {
  if (cache) return cache;
  try {
    const res = await fetch('./assets/credits/credits.json', { cache: 'no-store' });
    if (res.ok) cache = await res.json();
  } catch (e) {
    cache = null;
  }
  return cache;
}

const stop = (fn) => (e) => { e.stopPropagation(); fn(e); };

function table(head, rows, cls = '') {
  return h('table', { class: `tc-table tp-table ${cls}` },
    h('thead', {}, h('tr', {}, ...head.map((t) => h('th', { text: t })))),
    h('tbody', {}, ...rows.map((r) => h('tr', {}, ...r.map((c) => (c instanceof Node ? h('td', {}, c) : h('td', { text: String(c ?? '') })))))));
}

/** ['h'|'p'|'ul'|'table'|'note'|'warn'|'quote', …] → 요소 */
function blocks(list) {
  return list.map(([t, a, b]) => {
    if (t === 'h') return h('h3', { class: 'tp-h', text: a });
    if (t === 'p') return h('p', { class: 'tp-p', text: a });
    if (t === 'ul') return h('ul', { class: 'tp-ul' }, ...a.map((x) => h('li', { text: x })));
    if (t === 'table') return table(a, b);
    if (t === 'note') return h('p', { class: 'tp-note', text: a });
    if (t === 'warn') return h('p', { class: 'tp-warn', text: a });
    if (t === 'quote') return h('blockquote', { class: 'tp-quote' }, h('p', { text: a }), h('cite', { text: b }));
    return null;
  });
}

/** 접었다 펴는 칸(버튼 + 내용) */
function fold(title, body, open = false) {
  const box = h('div', { class: `tp-fold-body ${open ? '' : 'hide'}` }, body);
  const btn = h('button', { class: 'tp-fold', 'aria-expanded': String(open) },
    h('i', { html: ICON('arrow_right') }), h('span', { text: title }));
  btn.addEventListener('click', stop(() => {
    const on = box.classList.toggle('hide') === false;
    btn.setAttribute('aria-expanded', String(on));
  }));
  return h('section', { class: 'tp-foldset' }, btn, box);
}

/** 절마다 접었다 펴는 문서(PRD·작업 기록). withIntro: 첫 절 앞의 글(문서 정보 표)도 보이기 */
function docTab(w, intro, empty, withIntro = false) {
  if (!w) return [h('p', { class: 'nb-empty', text: empty })];
  const folds = w.sections.map((s) => fold(s.title, h('div', { class: 'tp-md', html: s.html })));
  const all = h('button', { class: 'btn btn-soft', onclick: stop(() => {
    const open = folds.some((f) => f.querySelector('.tp-fold-body.hide'));
    for (const f of folds) {
      f.querySelector('.tp-fold-body').classList.toggle('hide', !open);
      f.querySelector('.tp-fold').setAttribute('aria-expanded', String(open));
    }
  }) }, h('i', { html: ICON('checklist') }), h('span', { text: '모두 펴기 / 접기' }));
  return [
    ...blocks(intro), h('div', { class: 'tp-tools' }, all), h('h3', { class: 'tp-h', text: w.title }),
    withIntro && w.intro ? h('div', { class: 'tp-md', html: w.intro }) : null,
    ...folds,
  ];
}

const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
const dayLabel = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일 (${WEEK[new Date(y, m - 1, d).getDay()]})`;
};

/* ---------------- 탭마다 ---------------- */
const TAB = {
  overview(d) {
    return [
      ...blocks(OVERVIEW(d)),
      h('p', { class: 'tp-updated', text: d ? `자료를 만든 날: ${d.updated} (npm run credits)` : '자료 파일(assets/credits/credits.json)을 읽지 못했어요. npm run credits 를 실행해 주세요.' }),
    ];
  },

  requests(d) {
    const all = d?.requests || [];
    const list = h('div', { class: 'tp-reqs' });
    const count = h('p', { class: 'tp-count', 'aria-live': 'polite' });
    const search = h('input', { class: 'tc-in tp-search', type: 'search', placeholder: '찾을 낱말 (예: 미니게임)', 'aria-label': '요청 기록에서 찾기' });
    const render = () => {
      const q = search.value.trim().toLowerCase();
      const shown = q ? all.filter((r) => r.text.toLowerCase().includes(q)) : all;
      count.textContent = q ? `${all.length}건 중 ${shown.length}건` : `모두 ${all.length}건 (대화 ${new Set(all.map((r) => r.talk)).size}개)`;
      const days = [];
      for (const r of shown) {
        const day = r.at.slice(0, 10);
        if (!days.length || days[days.length - 1][0] !== day) days.push([day, []]);
        days[days.length - 1][1].push(r);
      }
      list.replaceChildren(...days.map(([day, rs]) => h('section', { class: 'tp-day' },
        h('h3', { class: 'tp-day-h', text: `${dayLabel(day)} · ${rs.length}건` }),
        ...rs.map((r) => h('article', { class: `tp-req ${r.how}` },
          h('div', { class: 'tp-req-meta' },
            h('b', { text: `#${r.n}` }), h('span', { text: r.at.slice(11) }), h('span', { text: `대화 ${r.talk}` }),
            REQUEST_HOW[r.how] ? h('em', { text: REQUEST_HOW[r.how] }) : null,
            r.images ? h('em', { class: 'img', text: `그림 첨부 ${r.images}장` }) : null),
          h('p', { class: 'tp-req-text', text: r.text }))))));
      if (!shown.length) list.replaceChildren(h('p', { class: 'nb-empty', text: all.length ? '찾는 낱말이 든 요청이 없어요.' : '요청 기록이 없어요.' }));
    };
    search.addEventListener('input', render);
    render();
    return [...blocks(REQUESTS_INTRO), h('div', { class: 'tp-tools' }, search, count), list];
  },

  prd(d) { return docTab(d?.prd, PRD_INTRO, 'PRD 자료가 없어요. npm run credits 를 실행해 주세요.', true); },

  worklog(d) { return docTab(d?.worklog, WORKLOG_INTRO, '작업 기록이 없어요.'); },

  images(d) {
    const all = d?.images || [];
    const groups = ['전체', ...new Set(all.map((i) => i.group))];
    let cur = '전체';
    const grid = h('div', { class: 'tp-grid' });
    const bar = h('div', { class: 'tp-filter', role: 'group', 'aria-label': '그림 종류' });
    const card = (i) => {
      const copy = h('button', { class: 'btn btn-soft tp-copy', onclick: stop(async () => {
        const text = i.neg ? `${i.prompt}\n\nAvoid: ${i.neg}` : i.prompt;
        try { await navigator.clipboard.writeText(text); ov.toast('프롬프트를 복사했어요', 'note'); } catch (e) { ov.toast('복사하지 못했어요. 글을 끌어서 골라 주세요', 'note'); }
      }) }, h('i', { html: ICON('note') }), h('span', { text: '프롬프트 복사' }));
      const made = i.firstMade && i.upscaled ? `${i.firstMade} (2K 업스케일링 ${i.made})` : i.firstMade ? `${i.firstMade} (다시 만듦 ${i.made})` : i.made;
      return h('article', { class: `tp-card k-${i.kind}` },
        h('div', { class: 'tp-thumb' }, h('img', { src: `./${i.file}`, alt: i.title, loading: 'lazy', draggable: 'false' })),
        h('div', { class: 'tp-card-body' },
          h('h4', { text: i.title }),
          h('p', { class: 'tp-meta' }, h('code', { text: i.id }), h('span', { class: `tp-from f-${i.from}`, text: PROMPT_FROM[i.from] || i.from })),
          h('dl', { class: 'tp-dl' },
            h('dt', { text: '도구' }), h('dd', { text: i.tool }),
            made ? h('dt', { text: '만든 때' }) : null, made ? h('dd', { text: made }) : null,
            h('dt', { text: '원래 이름' }), h('dd', { text: i.first && i.first !== i.flow ? `${i.flow}\n(처음: ${i.first})` : i.flow })),
          h('pre', { class: 'tp-prompt', text: i.prompt || '(기록 없음)' }),
          i.neg ? h('pre', { class: 'tp-prompt neg', text: `피할 것(Avoid): ${i.neg}` }) : null,
          i.note ? h('p', { class: 'tp-note', text: i.note }) : null,
          i.prompt ? copy : null));
    };
    const render = () => {
      bar.replaceChildren(...groups.map((g) => h('button', {
        class: `seg-btn ${g === cur ? 'on' : ''}`, 'aria-pressed': String(g === cur),
        onclick: stop(() => { cur = g; render(); }),
      }, h('span', { text: `${g} ${g === '전체' ? all.length : all.filter((i) => i.group === g).length}` }))));
      grid.replaceChildren(...all.filter((i) => cur === '전체' || i.group === cur).map(card));
    };
    render();
    return [...blocks(IMAGES_INTRO), bar, grid, ...blocks(IMAGES_EXTRA(d))];
  },

  music(d) {
    const a = d?.audio;
    if (!a) return [h('p', { class: 'nb-empty', text: '소리 자료가 없어요.' })];
    const warnPacks = a.packs.filter((p) => /확인 필요/.test(p.ai || ''));
    const warn = warnPacks.map((p) => {
      const files = [...a.music.filter((m) => m.pack === p.name).map((m) => `bgm/${m.id}`), ...a.sounds.filter((s) => s.from.some((f) => f.pack === p.name)).map((s) => s.id)];
      return h('p', { class: 'tp-warn', text: `${p.name}(${p.author}): ${p.ai}. 이 팩에서 쓰는 소리 ${files.length}개: ${files.join(', ')}` });
    });
    return [
      ...blocks(MUSIC_INTRO),
      h('h3', { class: 'tp-h', text: `배경음악 ${a.music.length}곡` }),
      table(['게임에서 쓰는 곳', '곡 이름', '작곡가', '팩', '라이선스'], a.music.map((m) => [m.use, m.track, m.composer, m.pack, m.license])),
      ...[...new Set(a.music.map((m) => m.composerNote).filter(Boolean))].map((t) => h('p', { class: 'tp-note', text: t })),
      ...warn,
      h('h3', { class: 'tp-h', text: '사운드 팩' }),
      table(['팩', '만든 곳', '라이선스', '구매', '쓰는 소리', 'AI 관련 조건(판매 페이지)'], a.packs.map((p) => [p.name, p.author, p.license, p.bundle || '-', `${p.used}개`, p.ai || '-'])),
      fold(`효과음·환경음 ${a.sounds.length}개 (파일별 출처)`, table(['게임 파일', '원본(팩 · 파일)', '고른 이유·가공'], a.sounds.map((s) => [s.id, s.from.map((f) => `${f.pack} · ${f.file}`).join('\n'), s.note]), 'small')),
      h('p', { class: 'tp-note', text: '아직 소리 파일이 없는 몇 가지 효과음(버스, 스팀 등)은 게임이 직접 합성한 소리로 냅니다. 자세한 표: assets/audio/CREDITS.md' }),
    ];
  },

  tools(d) {
    return [
      ...blocks(TOOLS_TEXT(d)),
      h('h3', { class: 'tp-h', text: '인물별 목소리' }),
      table(['인물', '목소리', '빠르기'], (d?.voices?.cast || []).map((v) => [v.who, `Supertonic ${v.voice}`, `${v.speed}배`]), 'small'),
    ];
  },

  data() { return blocks(DATA_TEXT); },
  copyright() { return blocks(COPYRIGHT_TEXT); },
};

function printPane(pane, title) {
  const area = h('div', { class: 'print-area tp-print' }, h('h2', { text: `직업 마1스톤 · ${title}` }), pane.cloneNode(true));
  for (const b of area.querySelectorAll('.tp-fold-body.hide')) b.classList.remove('hide');
  for (const b of area.querySelectorAll('button, input')) b.remove();
  document.body.append(area);
  document.body.classList.add('printing');
  setTimeout(() => {
    window.print();
    setTimeout(() => { area.remove(); document.body.classList.remove('printing'); }, 500);
  }, 100);
}

export async function showCredits() {
  const scr = openScreen({ cls: 'scr-credits', title: '제작·저작권 정보', icon: 'contract' });
  const tabs = h('div', { class: 'nb-tabs tp-tabs', role: 'tablist' });
  const pane = h('div', { class: 'tp-pane', role: 'tabpanel' });
  scr.body.append(tabs, pane);
  pane.append(h('p', { class: 'nb-empty', text: '자료를 불러오는 중이에요…' }));
  const data = await loadData();
  let cur = 'overview';
  const select = (id) => {
    cur = id;
    for (const b of tabs.querySelectorAll('.nb-tab')) {
      const on = b.dataset.tab === id;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    }
    pane.replaceChildren(...TAB[id](data).filter(Boolean));
    scr.body.scrollTop = 0;
  };
  for (const [id, label, icon] of CREDITS_TABS) {
    tabs.append(h('button', { class: 'nb-tab', role: 'tab', 'data-tab': id, onclick: stop(() => select(id)) }, h('i', { html: ICON(icon) }), h('span', { text: label })));
  }
  tabs.append(h('button', { class: 'nb-tab tp-print-btn', onclick: stop(() => printPane(pane, CREDITS_TABS.find((t) => t[0] === cur)[1])) }, h('i', { html: ICON('note') }), h('span', { text: '이 탭 인쇄' })));
  select('overview');
  return scr;
}
