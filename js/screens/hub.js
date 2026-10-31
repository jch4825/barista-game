/**
 * 근무표: 막마다 에피소드 + 엔딩 고르기 (새 게임에서는 계절 달력으로 바꿀 예정, PRD.md 10장)
 * 카드마다 썸네일: 마친 에피소드는 그날 받은 사진, 아직이면 그날의 첫 장소 배경
 * 엔딩을 본 학생은 모든 이야기가 늘 열리고, 엔딩 칸 옆에 그 안내가 보입니다(듣기 버튼으로 읽어 줌).
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

export function isUnlocked(id) {
  if (store.unlockedAll() || store.ending()) return true; // 엔딩을 본 뒤에는 언제든 원하는 이야기로
  if (id === ENDING.id) return store.isDone(FINALE);
  const i = EPISODES.findIndex((e) => e.id === id);
  if (i <= 0) return true;
  return store.isDone(EPISODES[i - 1].id) || store.isDone(id);
}

function firstBg(ep) {
  const b = ep.script.find((x) => x.t === 'bg');
  return b ? renderBg(b.id, b.variant) : '';
}

function thumb(ep, open) {
  const got = ep.photo && store.photos().includes(ep.photo);
  if (got) return h('span', { class: 'hub-thumb is-photo' }, h('span', { class: 'hub-pol' }, h('span', { class: 'ph-in', html: photoHTML(ep.photo) })));
  return h('span', { class: `hub-thumb ${open ? '' : 'is-locked'}`, html: firstBg(ep) }, open ? null : h('i', { class: 'hub-lock', html: ICON('lock') }));
}

function epCard(ep) {
  const done = store.isDone(ep.id);
  const open = isUnlocked(ep.id);
  const cp = store.checkpoint();
  const resumable = cp && cp.ep === ep.id;
  const got = new Set(store.oopsList());
  const oops = ALL_OOPS.filter((o) => o.ep === ep.id);
  const oopsFound = oops.filter((o) => got.has(o.id)).length;
  return h('button', {
    class: `hub-ep ${done ? 'done' : ''} ${open ? '' : 'locked'} ${resumable ? 'resume' : ''}`,
    disabled: !open,
    'aria-label': `${ep.label} ${ep.title}${done ? ', 완료' : ''}${open ? '' : ', 아직 잠김'}`,
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
    open ? (done ? '✓ 완료' : resumable ? '▶ 이어하기' : '▶ 시작') : '🔒 앞 이야기를 먼저 해요',
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

export function showHub() {
  const scr = openScreen({ cls: 'scr-hub', title: '근무표', icon: 'calendar' });
  const seen = Boolean(store.ending());
  const actEl = (a) => h('section', { class: `hub-act act-${a.n}` },
    h('h2', { text: a.title }), h('p', { text: a.sub }),
    h('div', { class: 'hub-eps' }, ...a.ids.map((id) => epCard(getEpisode(id)))));
  scr.body.append(h('div', { class: 'hub-acts' },
    ...ACTS.map(actEl),
    h('section', { class: `hub-act act-end ${seen ? 'is-clear' : ''}` },
      h('h2', { text: ENDING.label }), h('p', { text: seen ? '언제든 다시 볼 수 있어요' : '마지막 이야기를 마치면 볼 수 있어요' }),
      h('div', { class: 'hub-eps' }, endCard(), seen ? clearNote() : null))));
  return scr;
}
