/**
 * 저장하기 · 불러오기 (세이브 슬롯) — 기초 틀: AGY 설계안(2026-10-11)
 *  - 학생(프로필)마다 수동 저장 6칸 + 자동 저장 1칸(판단 장면마다 덮어씀, 불러오기만 됨)
 *  - 저장: 게임 중 [멈춤] 메뉴. 진행 중인 장면이 시작된 순간을 저장합니다(면접 중이면 면접 처음, runner.captureSave)
 *  - 불러오기: 처음 화면·[멈춤] 메뉴. 칸을 고르면 확인 창 → 그 장면부터 다시 시작
 *  - 덮어쓰기·불러오기·지우기는 늘 확인을 받습니다. 모든 조작은 버튼(키보드·스캔)
 *  - 아래 '기록 파일' 줄: 이 학생의 기록 전체를 파일로 저장 · 파일 불러오기(records.js, 2026-10-17).
 *    불러오기는 이야기 밖(처음 화면 → 불러오기)에서만: 이야기 도중에 선택 기억이 바뀌지 않게
 */

import { h } from '../core/dom.js';
import { store } from '../core/store.js';
import { nav } from '../core/nav.js';
import { runner } from '../core/runner.js';
import { ICON } from '../data/icons.js';
import { renderBg } from '../data/backgrounds.js';
import { getEpisode } from '../data/episodes/index.js';
import { ov } from '../ui/overlays.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { openScreen, closeAllScreens } from './screen.js';
import { saveRecordFile, loadRecordFiles } from './records.js';

/** 읽어 주는 문장 (tools/export-lines.mjs 가 음성 파일로 미리 만듦) */
export const SAVE_SAY = {
  save: '저장할 칸을 골라요.',
  load: '불러올 칸을 골라요.',
  loadAsk: '이 장면부터 다시 할까요? 지금 하던 곳은 자동 저장만 남아요.',
  loadAskTitle: '이 장면부터 할까요?',
  cannotSave: '이야기를 하는 중에만 저장할 수 있어요.',
  full: '저장 공간이 모자라 저장하지 못했어요. 선생님께 알려 주세요.',
  overwrite: (n) => `${n}번 칸에 덮어쓸까요? 전에 저장한 것은 지워져요.`,
  saved: (n) => `${n}번 칸에 저장했어요.`,
  del: (n) => `${n}번 칸을 지울까요?`,
};

export function saveLines() {
  const out = Object.values(SAVE_SAY).filter((v) => typeof v === 'string');
  for (let n = 1; n <= store.SLOT_COUNT; n++) out.push(SAVE_SAY.overwrite(n), SAVE_SAY.saved(n), SAVE_SAY.del(n));
  return out;
}

const two = (n) => String(n).padStart(2, '0');
function when(ms) {
  if (!ms) return '';
  const d = new Date(ms);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${two(d.getHours())}:${two(d.getMinutes())}`;
}

/** 저장 데이터 → 카드에 보일 정보 */
function info(data) {
  const ep = getEpisode(data.ep);
  const snap = data.snapshot || {};
  const line = data.line ? `${data.line.label ? `${data.line.label}: ` : ''}${data.line.text}` : '';
  return {
    ep,
    title: ep ? `${ep.label} · ${ep.title}` : data.ep,
    where: [snap.place, snap.time].filter(Boolean).join(' · '),
    line: line.length > 44 ? `${line.slice(0, 43)}…` : line,
    bg: snap.stage?.bg ? renderBg(snap.stage.bg, snap.stage.variant) : '',
    date: when(data.savedAt),
    note: data.note || '',
  };
}

function card({ label, data, mode, empty, onPick, onDelete, fresh = false, auto = false }) {
  const i = data ? info(data) : null;
  const main = h('button', {
    class: `sv-main ${empty ? 'empty' : ''}`,
    disabled: Boolean(empty && mode === 'load'),
    'aria-label': empty
      ? `${label}, 빈 칸${mode === 'save' ? '. 여기에 저장하기' : ''}`
      : `${label}, ${i.title}, ${i.where}, ${i.date}에 저장${mode === 'save' ? '. 덮어쓰기' : '. 불러오기'}`,
    onclick: (e) => { e.stopPropagation(); onPick(); },
  },
  h('span', { class: `sv-thumb ${i?.bg ? '' : 'blank'}`, html: i?.bg || ICON(mode === 'save' ? 'pen' : 'resume') }, h('b', { class: 'sv-no', text: label })),
  empty
    ? h('span', { class: 'sv-text' }, h('b', { class: 'sv-title', text: mode === 'save' ? '+ 여기에 저장하기' : '빈 칸' }), h('small', { text: auto ? '판단 장면을 지나면 자동으로 저장돼요' : '아직 저장한 것이 없어요' }))
    : h('span', { class: 'sv-text' },
      h('b', { class: 'sv-title', text: i.title }),
      i.where ? h('span', { class: 'sv-where' }, h('i', { html: ICON('home') }), h('span', { text: i.where })) : null,
      i.line ? h('span', { class: 'sv-line', text: i.line }) : null,
      h('small', { class: 'sv-date', text: [i.date, i.note].filter(Boolean).join(' · ') })));
  const del = !empty && onDelete
    ? h('button', { class: 'sv-del', 'aria-label': `${label} 지우기`, title: '지우기', html: ICON('close'), onclick: (e) => { e.stopPropagation(); onDelete(); } })
    : null;
  return h('div', { class: `sv-card ${auto ? 'auto' : ''} ${fresh ? 'fresh' : ''}` }, main, del);
}

/**
 * mode: 'save' | 'load'
 * 저장은 이야기를 하는 중(runner 실행 중)에만 됩니다.
 */
export function showSaves(mode = 'load') {
  const running = runner.isRunning();
  const canSave = mode === 'save' && running;
  let reload = false; // 기록 파일을 불러왔으면 닫을 때 처음 화면을 새로 그림(이어하기·학생 이름이 바뀔 수 있음)
  const scr = openScreen({
    cls: `scr-saves mode-${mode}`, title: mode === 'save' ? '저장하기' : '불러오기', icon: mode === 'save' ? 'pen' : 'resume',
    onClose: () => { if (reload && !runner.isRunning()) nav.go('title'); },
  });
  const grid = h('div', { class: 'sv-grid', role: 'list' });
  const head = h('p', { class: 'sv-lead', text: mode === 'save' ? '지금 장면을 저장할 칸을 골라요. 불러오면 이 장면이 처음부터 다시 나와요.' : '불러올 칸을 골라요. 그 장면부터 다시 해요.' });
  const fileBtn = (icon, label, fn) => h('button', { class: 'btn', onclick: (e) => { e.stopPropagation(); fn(); } }, h('i', { html: ICON(icon) }), h('span', { text: label }));
  const fileBar = h('div', { class: 'sv-file' },
    h('p', { class: 'sv-file-note' },
      h('b', { text: '기록 파일' }),
      h('span', { text: running ? '다른 컴퓨터에서 이어 하려면 파일로 저장해요.' : '다른 컴퓨터에서 하던 기록을 불러오거나, 파일로 저장해 보관해요.' })),
    h('div', { class: 'sv-file-btns' },
      fileBtn('file_save', '기록 파일로 저장', () => { const p = store.active(); if (p) saveRecordFile([p.id]); }),
      running ? null : fileBtn('file_load', '기록 파일 불러오기', async () => {
        const r = await loadRecordFiles();
        if (!r) return;
        reload = true;
        // 한 학생의 파일이면 그 학생으로(공용 컴퓨터에서 자기 기록을 불러온 경우)
        if (r.ids.length === 1 && store.active()?.id !== r.ids[0]) store.selectProfile(r.ids[0]);
        render();
      })));
  scr.body.append(head, grid, fileBar);
  let fresh = 0;

  async function pick(n) {
    const data = store.slot(n);
    if (mode === 'save') {
      if (!canSave) { audio.sfx('hint'); tts.speak(SAVE_SAY.cannotSave, 'sys', { force: true }); return; }
      if (data && !(await ov.confirm({ text: SAVE_SAY.overwrite(n), yes: '덮어쓰기', no: '그만두기' }))) return;
      const save = runner.captureSave();
      if (!save) { audio.sfx('hint'); tts.speak(SAVE_SAY.cannotSave, 'sys', { force: true }); return; }
      if (!store.writeSlot(n, save)) { audio.sfx('hint'); ov.toast(SAVE_SAY.full, 'caution'); tts.speak(SAVE_SAY.full, 'sys', { force: true }); return; }
      audio.sfx('stamp');
      ov.toast(SAVE_SAY.saved(n), 'check');
      tts.speak(SAVE_SAY.saved(n), 'sys', { force: true });
      fresh = n;
      render();
      return;
    }
    if (data) await load(data);
  }

  async function load(data) {
    const running = runner.isRunning();
    if (!(await ov.confirm({ text: running ? SAVE_SAY.loadAsk : SAVE_SAY.loadAskTitle, yes: '불러오기', no: '그만두기' }))) return;
    if (!getEpisode(data.ep)) return;
    reload = false;
    closeAllScreens();
    if (running) runner.abort();
    nav.go('play', data.ep, { save: data });
  }

  async function remove(n) {
    if (!(await ov.confirm({ text: SAVE_SAY.del(n), yes: '지우기', no: '그만두기' }))) return;
    store.deleteSlot(n);
    audio.sfx('close');
    render();
  }

  function render() {
    const cards = [];
    if (mode === 'load') {
      const cp = store.checkpoint();
      cards.push(card({ label: '자동', data: cp, mode, empty: !cp, auto: true, onPick: () => cp && load(cp) }));
    }
    store.saveSlots().forEach((data, i) => {
      const n = i + 1;
      cards.push(card({ label: `${n}번`, data, mode, empty: !data, fresh: fresh === n, onPick: () => pick(n), onDelete: () => remove(n) }));
    });
    grid.replaceChildren(...cards);
    if (fresh) grid.querySelector('.sv-card.fresh .sv-main')?.focus({ preventScroll: true });
  }

  render();
  if (mode === 'save' && !canSave) head.textContent = SAVE_SAY.cannotSave;
  tts.speak(mode === 'save' ? SAVE_SAY.save : SAVE_SAY.load, 'sys');
  return scr;
}

/** 처음 화면에 [불러오기]를 보일지: 저장한 칸이나 자동 저장이 하나라도 있으면 */
export function hasSaves() {
  return Boolean(store.checkpoint()) || store.saveSlots().some(Boolean);
}
