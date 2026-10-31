/**
 * 달력(옛 근무표): 계절마다 한 줄, 하루가 한 칸(봄 · 여름 · 가을 · 겨울 × 7일) + 이야기 뒤(엔딩 · 자유 영업 · 새 해)
 *  - 칸마다 그날의 첫 장소 그림, 날 번호와 제목, 상태(마침 · 오늘 · 이어 하기 · 잠김). 다음에 할 날은 '오늘'로 빛남
 *  - 이번 해의 엔딩을 본 뒤에는 모든 날이 열림. 자유 영업은 엔딩을 한 번 보면 열림(js/data/episodes/free.js)
 *  - 새 해(PRD 5.9 · Q-14): 단골과의 관계와 마친 날은 처음부터, 앨범 · 메뉴 도감 · 자유 영업은 남음(store.newYear)
 */

import { h } from '../core/dom.js';
import { store } from '../core/store.js';
import { nav } from '../core/nav.js';
import { ICON } from '../data/icons.js';
import { renderBg } from '../data/backgrounds.js';
import { photoHTML } from '../data/photos.js';
import { EPISODES, ACTS, getEpisode, ALL_OOPS, ENDING, FINALE } from '../data/episodes/index.js';
import { ov } from '../ui/overlays.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';
import { openScreen } from './screen.js';

const YEAR_NAME = ['', '첫 번째 해', '두 번째 해', '세 번째 해', '네 번째 해', '다섯 번째 해'];
export const yearName = (n) => YEAR_NAME[n] || `${n}번째 해`;

export function isUnlocked(id) {
  if (store.unlockedAll()) return true;
  const end = store.ending();
  if (end && (end.year || 1) === store.year()) return true; // 이번 해의 엔딩을 본 뒤에는 언제든 원하는 날로
  if (id === ENDING.id) return store.isDone(FINALE);
  const i = EPISODES.findIndex((e) => e.id === id);
  if (i <= 0) return true;
  return store.isDone(EPISODES[i - 1].id) || store.isDone(id);
}

function firstBg(ep) {
  const b = ep.script.find((x) => x.t === 'bg' && x.id !== 'black'); // 기억 장면의 검은 화면은 건너뜀
  return b ? renderBg(b.id, b.variant) : '';
}

function thumb(ep, open) {
  const got = ep.photo && store.photos().includes(ep.photo);
  if (got) return h('span', { class: 'hub-thumb is-photo' }, h('span', { class: 'hub-pol' }, h('span', { class: 'ph-in', html: photoHTML(ep.photo) })));
  return h('span', { class: `hub-thumb ${open ? '' : 'is-locked'}`, html: firstBg(ep) }, open ? null : h('i', { class: 'hub-lock', html: ICON('lock') }));
}

function epCard(ep, today = false) {
  const done = store.isDone(ep.id);
  const open = isUnlocked(ep.id);
  const cp = store.checkpoint();
  const resumable = cp && cp.ep === ep.id;
  const got = new Set(store.oopsList());
  const oops = ALL_OOPS.filter((o) => o.ep === ep.id);
  const oopsFound = oops.filter((o) => got.has(o.id)).length;
  return h('button', {
    class: `hub-ep ${done ? 'done' : ''} ${open ? '' : 'locked'} ${resumable ? 'resume' : ''} ${today ? 'is-today' : ''}`,
    disabled: !open,
    'aria-label': `${ep.label} ${ep.title}${done ? ', 마쳤어요' : today ? ', 오늘 할 날' : ''}${open ? '' : ', 아직 잠김'}`,
    onclick: async (e) => {
      e.stopPropagation();
      if (resumable) {
        const r = await ov.confirm({ text: `${ep.title}: 저장된 곳부터 이어서 할까요?`, yes: '이어하기', no: '처음부터' });
        nav.go('play', ep.id, { resume: r });
      } else {
        nav.go('play', ep.id);
      }
    },
  },
  thumb(ep, open),
  h('span', { class: 'hub-label', text: ep.label }),
  h('b', { class: 'hub-title', text: ep.title }),
  h('span', { class: 'hub-sched' }, ...(ep.schedule || []).map(([icon]) => h('i', { html: ICON(icon) }))),
  h('span', { class: 'hub-state' },
    open ? (done ? '✓ 마침' : resumable ? '▶ 이어 하기' : today ? '▶ 오늘' : '▶ 시작') : '🔒 앞날을 먼저 해요',
    oops.length ? h('small', { text: ` · 아차 ${oopsFound}/${oops.length}` }) : null));
}

/** 엔딩 칸: 마지막 이야기를 마치면 열림, 본 뒤에는 '다시 보기' */
function endCard() {
  const seen = Boolean(store.ending());
  const open = isUnlocked(ENDING.id);
  return h('button', {
    class: `hub-ep hub-end ${seen ? 'done' : ''} ${open ? '' : 'locked'}`,
    disabled: !open,
    'aria-label': `${ENDING.label} ${ENDING.title}${seen ? ', 봤어요' : ''}${open ? '' : ', 아직 잠김'}`,
    onclick: (e) => { e.stopPropagation(); nav.go('play', ENDING.id); },
  },
  h('span', { class: `hub-thumb ${open ? '' : 'is-locked'}`, html: renderBg('cafe_front', 'morning') }, open ? null : h('i', { class: 'hub-lock', html: ICON('lock') })),
  h('span', { class: 'hub-label', text: ENDING.label }),
  h('b', { class: 'hub-title', text: ENDING.title }),
  h('span', { class: 'hub-state', text: open ? (seen ? '✓ 다시 보기' : '▶ 보기') : '🔒 마지막 이야기를 마치면 열려요' }));
}

/** 엔딩을 본 뒤의 안내: 모든 이야기가 열렸어요(엔딩 뒤 알림과 같은 문장·같은 음성) */
function clearNote() {
  const n = ENDING.notice;
  const listen = h('button', {
    class: 'btn btn-small', 'aria-label': '읽어 주기',
    onclick: (e) => { e.stopPropagation(); audio.sfx('tap'); tts.speak(`${n.title}. ${n.body}`, 'sys', { force: true }); },
  }, h('i', { html: ICON('volume') }), h('span', { text: '듣기' }));
  return h('div', { class: 'hub-clear', role: 'note' },
    h('i', { class: 'hub-clear-ico', html: ICON('calendar') }),
    h('div', { class: 'hub-clear-text' }, h('b', { text: n.title }), h('p', {}, ...n.body.split(/(?<=[.!?])\s+/).map((s) => h('span', { text: s })))),
    listen);
}

/** 자유 영업 칸: 엔딩을 한 번 보면 열림. 다음 날 번호를 보여 줌 */
function freeCard() {
  const open = Boolean(store.ending());
  const f = store.free();
  const cp = store.checkpoint();
  const resumable = open && cp && cp.ep === 'free';
  return h('button', {
    class: `hub-ep hub-free ${open ? '' : 'locked'} ${resumable ? 'resume' : ''}`,
    disabled: !open,
    'aria-label': `자유 영업 ${f.day + 1}번째 날${open ? '' : ', 엔딩을 보면 열려요'}`,
    onclick: async (e) => {
      e.stopPropagation();
      if (resumable) {
        const r = await ov.confirm({ text: '자유 영업: 저장된 곳부터 이어서 할까요?', yes: '이어하기', no: '처음부터' });
        nav.go('play', 'free', { resume: r });
      } else nav.go('play', 'free');
    },
  },
  h('span', { class: `hub-thumb ${open ? '' : 'is-locked'}`, html: renderBg('hall', 'morning') }, open ? null : h('i', { class: 'hub-lock', html: ICON('lock') })),
  h('span', { class: 'hub-label', text: '자유 영업' }),
  h('b', { class: 'hub-title', text: `${f.day + 1}번째 날` }),
  h('span', { class: 'hub-state', text: open ? (resumable ? '▶ 이어 하기' : f.served ? `▶ 문 열기 · 지금까지 ${f.served}잔` : '▶ 문 열기') : '🔒 엔딩을 보면 열려요' }));
}

/** 새 해 칸: 이번 해의 엔딩을 본 뒤에 보임 */
function yearCard() {
  const next = store.year() + 1;
  return h('button', {
    class: 'hub-ep hub-year',
    'aria-label': `${yearName(next)} 시작하기`,
    onclick: async (e) => {
      e.stopPropagation();
      const ok = await ov.confirm({
        text: `${yearName(next)}를 시작할까요?`,
        detail: '같은 마을에서 봄부터 다시 일해요. 단골과의 관계와 마친 날은 처음부터 다시 쌓아요. 앨범 · 메뉴 도감 · 자유 영업은 그대로 남아요.',
        yes: '시작하기', no: '아니요',
      });
      if (!ok) return;
      store.newYear();
      audio.sfx('page');
      nav.go('title');
      nav.go('hub');
    },
  },
  h('span', { class: 'hub-thumb', html: renderBg('cafe_front', 'morning') }),
  h('span', { class: 'hub-label', text: yearName(next) }),
  h('b', { class: 'hub-title', text: '같은 마을에서 다시' }),
  h('span', { class: 'hub-state', text: '▶ 봄부터 다시' }));
}

export function showHub() {
  const scr = openScreen({ cls: 'scr-hub scr-cal', title: '달력', icon: 'calendar' });
  const end = store.ending();
  const seenThisYear = Boolean(end && (end.year || 1) === store.year());
  const today = EPISODES.find((e) => !store.isDone(e.id) && isUnlocked(e.id))?.id || null;
  const actEl = (a) => h('section', { class: `hub-act act-${a.n} cal-${a.season}` },
    h('div', { class: 'cal-head' }, h('h2', { text: a.title }), h('p', { text: a.sub })),
    h('div', { class: 'hub-eps cal7' }, ...a.ids.map((id) => epCard(getEpisode(id), id === today))));
  scr.body.append(h('div', { class: 'hub-acts cal-acts' },
    store.year() > 1 ? h('p', { class: 'cal-year', text: `${yearName(store.year())} · 단골과의 관계를 처음부터 다시 쌓는 중이에요` }) : null,
    ...ACTS.map(actEl),
    h('section', { class: `hub-act act-end ${seenThisYear ? 'is-clear' : ''}` },
      h('div', { class: 'cal-head' }, h('h2', { text: '이야기 뒤' }), h('p', { text: seenThisYear ? '엔딩은 언제든 다시 볼 수 있어요. 자유 영업으로 카페를 계속 열 수 있어요.' : '겨울 7일을 마치면 엔딩이 열려요.' })),
      h('div', { class: 'hub-eps cal-end' }, endCard(), freeCard(), seenThisYear ? yearCard() : null, seenThisYear ? clearNote() : null))));
  scr.body.querySelector('.is-today')?.scrollIntoView({ block: 'center' });
  return scr;
}
