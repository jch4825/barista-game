/**
 * 선생님 모드 (PIN 보호)
 *  - 학생 관리, 진행·스킬·판단 기록(되감기 횟수), 아차 탐색, 기분 기록, 면접 답변
 *  - 인쇄용 보고서, CSV 저장, 모든 이야기 열기, 설정 잠금
 *  - 제작·저작권 정보(제작 및 데이터 투명성, 요청 기록, 그림 프롬프트, 음악 저작권): credits.js
 *  - 기록 파일: 학생 한 명 · 학급 전체(이 기기의 모든 학생) 저장, 여러 파일 한꺼번에 불러오기(records.js, 2026-10-17)
 *  기록은 이 기기에만 있습니다. 내보내기는 선생님이 직접 할 때만 파일로 만들어집니다.
 */

import { h } from '../core/dom.js';
import { store } from '../core/store.js';
import { ICON } from '../data/icons.js';
import { SKILLS, SKILL_ORDER, LEVELS, STANDARDS, FEELINGS } from '../data/skills.js';
import { EPISODES, ALL_OOPS, getEpisode } from '../data/episodes/index.js';
import { REGULARS, KINDS, regularReport, touchOf } from '../data/regulars.js';
import { HAND_SKILLS, LEVEL_NAMES } from '../data/menu.js';
import { CONFIG, isElectron } from '../config.js';
import { tts } from '../av/tts.js';
import { ov } from '../ui/overlays.js';
import { openScreen, segmented, row } from './screen.js';
import { showCredits } from './credits.js';
import { saveRecordFile, loadRecordFiles } from './records.js';

function pinPad() {
  return new Promise((resolve) => {
    const scr = openScreen({ cls: 'scr-pin', title: '선생님 모드', icon: 'lock' });
    let val = '';
    const disp = h('div', { class: 'pin-disp', 'aria-live': 'polite' });
    const msg = h('p', { class: 'pin-msg', text: '선생님 번호 4자리를 눌러 주세요.' });
    const upd = () => { disp.textContent = '●'.repeat(val.length) + '○'.repeat(4 - val.length); };
    const press = (k) => {
      if (k === 'del') val = val.slice(0, -1);
      else if (val.length < 4) val += k;
      upd();
      if (val.length === 4) {
        if (store.checkPin(val)) { scr.close(); resolve(true); } else { msg.textContent = '번호가 달라요. 다시 눌러 주세요.'; val = ''; upd(); disp.classList.add('shake'); setTimeout(() => disp.classList.remove('shake'), 400); }
      }
    };
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0'];
    scr.body.append(msg, disp, h('div', { class: 'pin-grid' }, ...keys.map((k) => h('button', { class: 'pin-key', onclick: (e) => { e.stopPropagation(); press(k); } }, k === 'del' ? '지우기' : k))),
      h('p', { class: 'pin-hint', text: `처음 번호는 ${CONFIG.DEFAULT_TEACHER_PIN} 이에요. 선생님 모드에서 바꿀 수 있어요.` }));
    upd();
  });
}

function fmtMs(ms) {
  const m = Math.round((ms || 0) / 60000);
  return m < 60 ? `${m}분` : `${Math.floor(m / 60)}시간 ${m % 60}분`;
}

function fmtDate(t) {
  if (!t) return '-';
  const d = new Date(t);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 미니게임 기록의 비고: 실수 + (커피 만들기) 다시 만들기 · 보기 · 손 기술마다 알맞음/해 본 수(딱 좋아요 수) · 단계 · 턴 방식. 커피 솜씨는 단골 신뢰와 따로(원칙 7) */
function miniExtra(l) {
  if (l.quit) return '그만하기';
  const parts = [`실수 ${l.mistakes ?? 0}`];
  if (l.served) parts.push(`드린 잔 ${l.served}`);
  if (l.remakes) parts.push(`다시 만들기 ${l.remakes}`);
  if (l.watched) parts.push(`보기 ${l.watched}`);
  for (const [id, st] of Object.entries(l.skills || {})) parts.push(`${HAND_SKILLS[id]?.name || id} 알맞음 ${st.good}/${st.tries}${st.perfect ? `(딱 좋아요 ${st.perfect})` : ''}`);
  if (l.art) parts.push(`라테아트 ${l.art}`);
  if (l.stage) parts.push(`단계 ${LEVEL_NAMES[l.stage] || l.stage}`);
  if (l.turn) parts.push('턴 방식');
  return parts.join(' · ');
}

function decisionRows(p) {
  return p.log.filter((l) => ['decide', 'ask', 'mini'].includes(l.type)).map((l) => ({
    ep: getEpisode(l.ep)?.label || l.ep,
    what: l.type === 'mini' ? `미니게임: ${l.title || l.name}` : (l.q || l.id),
    skill: l.skill ? SKILLS[l.skill]?.name : '',
    rewinds: l.type === 'mini' ? (l.attempts || 1) - 1 : (l.rewinds || 0),
    extra: l.type === 'mini' ? miniExtra(l) : l.type === 'ask' ? `대답: ${l.mode === 'chips' ? '골라서' : l.mode === 'type' ? '글자' : '말'}` : (l.helps ? `도와주세요 ${l.helps}` : ''),
    level: l.level,
    at: l.at,
    tried: (l.tried || []).join(' / '),
  }));
}

/* 한 잔의 마음(단골 대응, js/data/regulars.js): 점수는 학생 화면에 나오지 않고 여기에서만 봄 */
const SCORE_TEXT = { 2: '맞음', 1: '무난', 0: '어긋남' };
const TIER_TEXT = { 1: '평소', 2: '행동이 변함', 3: '비밀 장면' };
const kindsText = (kinds) => Object.entries(kinds).filter(([, n]) => n).map(([k, n]) => `${KINDS[k]} ${n}`).join(' · ') || '-';

function respondRows(p) {
  return p.log.filter((l) => l.type === 'respond').map((l) => ({
    ep: getEpisode(l.ep)?.label || l.ep,
    who: REGULARS[l.who]?.name || l.who,
    what: touchOf(l.who, l.touch)?.title || l.touch,
    chosen: l.chosen || l.choice,
    kind: KINDS[l.kind] || l.kind || '',
    score: SCORE_TEXT[l.score] ?? '',
    replays: l.replays || 0,
    at: l.at,
  }));
}

function report(p) {
  const st = p.stamps || {};
  const done = EPISODES.filter((e) => p.progress.done[e.id]);
  const rows = decisionRows(p);
  const regs = regularReport(p.flags?.touch, p.log);
  const resp = respondRows(p);
  const got = new Set(p.oops || []);
  const fl = Object.fromEntries(FEELINGS.map((f) => [f.id, f.label]));
  const std = new Set(SKILL_ORDER.flatMap((k) => SKILLS[k].std));

  return h('div', { class: 'tc-report' },
    h('h2', { text: `${p.name} 학생 기록` }),
    h('p', { class: 'tc-meta', text: `완료한 이야기 ${done.length} / ${EPISODES.length} · 플레이 시간 ${fmtMs(p.playMs)} · 마지막 활동 ${fmtDate(p.updatedAt)}` }),
    h('h3', { text: '스킬별 도장 (별 = 가장 좋은 기록)' }),
    h('table', { class: 'tc-table' },
      h('thead', {}, h('tr', {}, ...['스킬', '별', '단계', '횟수', '연계 성취기준'].map((t) => h('th', { text: t })))),
      h('tbody', {}, ...SKILL_ORDER.map((k) => {
        const s = st[k];
        return h('tr', {}, h('td', { text: SKILLS[k].name }), h('td', { text: s ? '★'.repeat(s.best) + '☆'.repeat(3 - s.best) : '-' }),
          h('td', { text: s ? LEVELS[s.best].short : '-' }), h('td', { text: s ? String(s.count) : '0' }), h('td', { text: SKILLS[k].std.join(' ') }));
      }))),
    h('h3', { text: '판단 기록 (되감기 = 다시 시도한 횟수)' }),
    rows.length
      ? h('table', { class: 'tc-table small' },
        h('thead', {}, h('tr', {}, ...['이야기', '장면', '스킬', '되감기', '별', '해 본 다른 길', '비고'].map((t) => h('th', { text: t })))),
        h('tbody', {}, ...rows.map((r) => h('tr', {}, h('td', { text: r.ep }), h('td', { text: r.what }), h('td', { text: r.skill }), h('td', { text: String(r.rewinds) }),
          h('td', { text: r.level ? '★'.repeat(r.level) : '' }), h('td', { text: r.tried }), h('td', { text: r.extra })))))
      : h('p', { text: '아직 기록이 없어요.' }),
    h('h3', { text: '단골과의 관계 (숨은 신뢰: 학생 화면에는 나오지 않아요)' }),
    h('table', { class: 'tc-table' },
      h('thead', {}, h('tr', {}, ...['단골', '맞는 대응', '신뢰', '단계', '해 본 기회', '맞음 · 무난 · 어긋남', '고른 대응'].map((t) => h('th', { text: t })))),
      h('tbody', {}, ...regs.map((r) => h('tr', {}, h('td', { text: r.name }), h('td', { text: KINDS[r.wants] }), h('td', { text: `${r.trust} / 10` }), h('td', { text: TIER_TEXT[r.tier] }),
        h('td', { text: `${r.done} / ${r.total}` }), h('td', { text: `${r.best} · ${r.ok} · ${r.miss}` }), h('td', { text: kindsText(r.kinds) }))))),
    resp.length
      ? h('table', { class: 'tc-table small' },
        h('thead', {}, h('tr', {}, ...['이야기', '단골', '장면', '고른 대응', '결과', '힌트 다시 보기'].map((t) => h('th', { text: t })))),
        h('tbody', {}, ...resp.map((r) => h('tr', {}, h('td', { text: r.ep }), h('td', { text: r.who }), h('td', { text: r.what }), h('td', { text: r.chosen }),
          h('td', { text: `${r.score} · ${r.kind}` }), h('td', { text: String(r.replays) })))))
      : null,
    h('h3', { text: `아차 노트 (실패 결과 탐색) ${ALL_OOPS.filter((o) => got.has(o.id)).length} / ${ALL_OOPS.length}` }),
    h('ul', { class: 'tc-oops' }, ...ALL_OOPS.filter((o) => got.has(o.id)).map((o) => h('li', { text: `[${getEpisode(o.ep)?.label || o.ep}] ${o.title}` }))),
    h('h3', { text: '기분 기록' }),
    h('ul', { class: 'tc-feel' }, ...(p.diary || []).map((d) => h('li', { text: `${getEpisode(d.ep)?.label || d.ep}: 지은 ${fl[d.feeling] || '-'} / 학생 ${fl[d.myFeeling] || '고르지 않음'}` }))),
    (p.interview || []).length ? h('h3', { text: '면접 답변 (저장 허용 시)' }) : null,
    (p.interview || []).length ? h('ul', { class: 'tc-iv' }, ...p.interview.map((iv) => h('li', { text: `${iv.q} → ${iv.answer} (${iv.mode})` }))) : null,
    h('h3', { text: '연계 성취기준 (2022 개정 특수교육 기본교육과정 고등학교 진로와 직업)' }),
    h('ul', { class: 'tc-std' }, ...[...std].sort().map((c) => h('li', { text: `${c} ${STANDARDS[c] || ''}` }))));
}

function toCSV(p) {
  const head = ['학생', '시각', '이야기', '장면', '스킬', '되감기', '별', '해 본 다른 길', '비고'];
  const lines = [head];
  const rows = [
    ...decisionRows(p).map((r) => [r.at, [p.name, fmtDate(r.at), r.ep, r.what, r.skill, r.rewinds, r.level || '', r.tried, r.extra]]),
    // 단골 대응: 스킬 칸은 '한 잔의 마음', 되감기·별은 없음, 비고에 고른 대응과 결과
    ...respondRows(p).map((r) => [r.at, [p.name, fmtDate(r.at), r.ep, `${r.who} · ${r.what}`, '한 잔의 마음', '', '', '', `고른 대응: ${r.chosen} (${r.score} · ${r.kind}${r.replays ? ` · 힌트 다시 보기 ${r.replays}` : ''})`]]),
  ].sort((a, b) => (a[0] || 0) - (b[0] || 0));
  for (const [, r] of rows) lines.push(r);
  return `﻿${lines.map((l) => l.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n')}`;
}

function download(name, text) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

function printReport(p) {
  const area = h('div', { class: 'print-area' }, report(p));
  document.body.append(area);
  document.body.classList.add('printing');
  setTimeout(() => {
    window.print();
    setTimeout(() => { area.remove(); document.body.classList.remove('printing'); }, 500);
  }, 100);
}

function dashboard() {
  const scr = openScreen({ cls: 'scr-teacher', title: '선생님 모드', icon: 'teacher' });
  const side = h('aside', { class: 'tc-side' });
  const main = h('div', { class: 'tc-main' });
  let selId = store.active()?.id || store.profiles()[0]?.id || null;

  const renderSide = () => {
    side.replaceChildren(
      h('h3', { text: '학생' }),
      ...store.profiles().map((p) => h('button', { class: `tc-stu ${p.id === selId ? 'on' : ''}`, onclick: (e) => { e.stopPropagation(); selId = p.id; renderAll(); } },
        h('b', { text: p.name }), h('small', { text: `완료 ${EPISODES.filter((e) => p.progress.done[e.id]).length}/${EPISODES.length}` }))),
      h('button', {
        class: 'btn btn-soft',
        onclick: async (e) => {
          e.stopPropagation();
          const name = await ov.prompt({ text: '새 학생의 별명을 써 주세요. 본명 대신 별명을 권해요.', placeholder: '예: 별빛' });
          if (name) { const cur = store.active()?.id; const p = store.createProfile(name); selId = p.id; if (cur) store.selectProfile(cur); renderAll(); }
        },
      }, h('i', { html: ICON('star') }), h('span', { text: '학생 추가' })),
      h('p', { class: 'tc-side-note', text: '본명 대신 별명을 권해요. 누구의 별명인지는 선생님 명부에 따로 적어 두세요.' }),
      h('h3', { text: '기록 파일' }),
      h('div', { class: 'tc-file-btns' },
        h('button', {
          class: 'btn btn-soft',
          onclick: (e) => {
            e.stopPropagation();
            if (!saveRecordFile()) ov.toast('저장할 학생이 없어요', 'idcard');
          },
        }, h('i', { html: ICON('file_save') }), h('span', { text: '학급 전체 저장' })),
        h('button', {
          class: 'btn btn-soft',
          onclick: async (e) => {
            e.stopPropagation();
            const r = await loadRecordFiles({ multiple: true });
            if (!r) return;
            if (!store.profile(selId)) selId = r.ids[0];
            renderAll();
          },
        }, h('i', { html: ICON('file_load') }), h('span', { text: '기록 파일 불러오기' }))),
      h('p', {
        class: 'tc-side-note',
        text: isElectron()
          ? '기록은 이 컴퓨터에만 있어요. 다른 컴퓨터로 옮기거나 보관할 때 파일로 저장하세요. 같은 학생은 두 기록을 합쳐요.'
          : '웹판은 기록이 이 브라우저에만 남아요. 수업이 끝나면 파일로 저장해 USB나 학교 드라이브에 두세요. 같은 학생은 두 기록을 합쳐요.',
      }),
      h('h3', { text: '전체 설정' }),
      h('button', {
        class: 'btn btn-soft',
        onclick: async (e) => {
          e.stopPropagation();
          const pin = await ov.prompt({ text: '새 선생님 번호 (숫자 4자리)', placeholder: '0000' });
          if (pin && /^\d{4}$/.test(pin)) { store.setPin(pin); ov.toast('선생님 번호를 바꿨어요', 'lock'); }
          else if (pin) ov.toast('숫자 4자리로 써 주세요', 'lock');
        },
      }, h('i', { html: ICON('lock') }), h('span', { text: '번호 바꾸기' })),
      h('h3', { text: '프로그램 정보' }),
      h('button', { class: 'btn btn-soft', onclick: (e) => { e.stopPropagation(); showCredits(); } },
        h('i', { html: ICON('contract') }), h('span', { text: '제작·저작권 정보' })));
  };

  const renderMain = () => {
    const p = store.profile(selId);
    if (!p) { main.replaceChildren(h('p', { text: '학생이 없어요. [학생 추가]를 눌러 주세요.' })); return; }
    const active = store.active()?.id === p.id;

    main.replaceChildren(
      h('div', { class: 'tc-actions' },
        h('button', { class: 'btn btn-main', onclick: (e) => { e.stopPropagation(); printReport(p); } }, h('i', { html: ICON('note') }), h('span', { text: '보고서 인쇄' })),
        h('button', { class: 'btn', onclick: (e) => { e.stopPropagation(); download(`바리스타_${p.name}_${new Date().toISOString().slice(0, 10)}.csv`, toCSV(p)); } }, h('i', { html: ICON('checklist') }), h('span', { text: 'CSV로 저장' })),
        h('button', { class: 'btn', onclick: (e) => { e.stopPropagation(); saveRecordFile([p.id]); } }, h('i', { html: ICON('file_save') }), h('span', { text: '기록 파일로 저장' })),
        h('button', { class: 'btn', onclick: (e) => { e.stopPropagation(); store.selectProfile(p.id); ov.toast(`${p.name} 학생으로 바꿨어요`, 'idcard'); renderAll(); } }, h('i', { html: ICON('idcard') }), h('span', { text: active ? '지금 하는 학생' : '이 학생으로 하기' }))),
      row('모든 이야기 열기', segmented([[false, '순서대로'], [true, '모두 열기']], Boolean(p.progress.unlockedAll), (v) => store.setUnlockedAll(p.id, v)), '수업에서 원하는 에피소드로 바로 갈 수 있어요.'),
      row('설정 잠그기', segmented([[false, '학생이 바꿀 수 있음'], [true, '잠금']], Boolean(p.settingsLocked), (v) => store.setSettingsLocked(p.id, v))),
      report(p),
      h('p', { class: 'tc-note', text: `음성 파일 ${tts.fileCount()}줄 준비됨 (없는 줄은 브라우저 음성으로 읽어요). 기록은 이 기기에만 저장돼요.` }),
      h('div', { class: 'tc-danger' },
        h('button', { class: 'btn btn-soft', onclick: async (e) => { e.stopPropagation(); if (await ov.confirm({ text: `${p.name} 학생의 진행 기록을 모두 지울까요? 되돌릴 수 없어요.`, yes: '지우기', no: '취소' })) { store.resetProgress(p.id); renderAll(); } } }, h('span', { text: '진행 기록 지우기' })),
        h('button', { class: 'btn btn-soft', onclick: async (e) => { e.stopPropagation(); if (await ov.confirm({ text: `${p.name} 학생을 목록에서 지울까요? 되돌릴 수 없어요.`, yes: '지우기', no: '취소' })) { store.deleteProfile(p.id); selId = store.profiles()[0]?.id || null; renderAll(); } } }, h('span', { text: '학생 지우기' }))));
  };

  const renderAll = () => { renderSide(); renderMain(); };
  scr.body.append(h('div', { class: 'tc-wrap' }, side, main));
  renderAll();
  return scr;
}

export async function showTeacher() {
  const ok = await pinPad();
  if (ok) dashboard();
}
