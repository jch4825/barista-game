/**
 * 미니게임 공통 틀
 * 미니게임은 '규칙(로직)'과 '그림(뷰)'을 나눠 두었습니다. 픽셀 아트로 바꿀 때는 각 파일의 view 부분만 교체합니다.
 */

import { $, h, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { tts } from '../../av/tts.js';
import { input } from '../../core/input.js';
import { bus } from '../../core/bus.js';
import { ov } from '../../ui/overlays.js';

/**
 * 미니게임이 읽어 주는 문장 목록 (tools/export-lines.mjs 가 음성 파일로 미리 만듦)
 * 각 미니게임은 xxxLines(옵션) 으로 이 형식의 목록을 내보냅니다.
 */
export const line = {
  intro: (title, instruction, speech) => [{ t: 'sys', text: speech || `${title}. ${instruction}` }, { t: 'sys', text: instruction }],
  sys: (text) => ({ t: 'sys', text }),
  narr: (text) => ({ t: 'narr', text }),
  think: (text) => ({ t: 'think', text }),
  say: (who, text) => ({ t: 'say', who, text }),
  oops: (o) => ({ t: 'sys', text: `아차! ${o.title}. ${o.lesson}` }),
};

/** [그만하기]를 눌렀을 때 묻는 말 (음성 파일: tools/export-lines.mjs EXTRA) */
export const QUIT_ASK = '미니게임을 그만할까요? 남은 일은 지은이 알아서 해요.';

let active = null; // 지금 열린 미니게임 틀
let generation = 0; // 정리할 때마다 1씩 늘어남

/**
 * 계절에 따른 손맛 단계(2026-11-01 사용자: 충분히 연습한 뒤에 다시 빡빡한 타이밍을 주는 레벨 디자인).
 * 봄 · 여름 = 연습(박자 판정 띠 2배 굵게) · 가을 = 박자 띠는 원래대로, 띠가 차는 손 동작 1.5배 빠르게 · 겨울 = 2배.
 *  beatWin: 박자 판정 칸 배율(띠 굵기도 같은 배율) · speed: 띠가 차는 빠르기(누르고 떼기 · 기다렸다 누르기 · 원 그리기 꾹) · tray: 쟁반 흔들림이 차는 빠르기
 * 미니게임 옵션의 season(runner 가 그 날의 계절을 넣음, 자유 영업은 그 날의 계절). 없으면 연습 단계
 */
export const TIMING = {
  spring: { beatWin: 2, speed: 1, tray: 1 },
  summer: { beatWin: 2, speed: 1, tray: 1 },
  autumn: { beatWin: 1, speed: 1.5, tray: 1.3 },
  winter: { beatWin: 1, speed: 2, tray: 1.5 },
};
export function timingOf(opts = {}) { return TIMING[opts.season] || TIMING.spring; }

/**
 * 지금의 정리 번호. 미니게임이 시작할 때 받아 두고, 대사·잠깐 쉬기를 기다린 뒤 번호가 달라졌으면 그만둠
 * (정리된 뒤 늦게 끝난 기다림이 다음 장면에 손님 말·아차 카드를 띄우지 않게)
 */
export function abortGeneration() { return generation; }

/**
 * 지금 열린 미니게임을 정리(되감기·근무표로 나가기·[그만하기]):
 * 게임이 등록한 정리(onAbort: 실시간 고리 멈춤·방향키 풀기 등)를 부르고 틀을 닫음
 */
export function abortMinigame() {
  generation += 1;
  const a = active;
  document.body.classList.remove('mg-arcade');
  if (!a) return;
  active = null;
  for (const fn of a.aborts) { try { fn(); } catch (e) { console.error('[minigame abort]', e); } }
  a.close();
}

/**
 * speech: 처음에 읽어 줄 문장 (없으면 '제목. 설명')
 * quit: 머리글에 [그만하기](4장 근무판의 '직접 하기'처럼 안 해도 되는 미니게임). 누르면 확인 뒤 bus 'mg:quit'
 */
export function frame({ title, instruction, icon = 'star', cls = '', speech = '', quit = false }) {
  const say = h('button', { class: 'mg-say', 'aria-label': '설명 듣기', html: ICON('volume'), onclick: (e) => { e.stopPropagation(); tts.speak(instruction, 'sys', { force: true }); } });
  const quitBtn = quit ? h('button', {
    class: 'btn btn-soft mg-quit',
    onclick: async (e) => {
      e.stopPropagation();
      if (await ov.confirm({ text: QUIT_ASK, yes: '그만하기', no: '계속하기' })) bus.emit('mg:quit');
    },
  }, h('i', { html: ICON('close') }), h('span', { text: '그만하기' })) : null;
  const body = h('div', { class: 'mg-body' });
  const el = h('section', { class: `mg ${cls}`, role: 'group', 'aria-label': title },
    h('header', { class: 'mg-head' }, h('i', { class: 'mg-ico', html: ICON(icon) }), h('div', {}, h('h2', { text: title }), h('p', { text: instruction })), quitBtn, say),
    body);
  $('#layer-task').replaceChildren(el);
  document.body.classList.add('tasking', 'mg-open');
  // 화면 가득한 장면 미니게임(쟁반 · 둘러보기 · 순서대로): 앞 대사의 대화창이 아래 단추를 가리고 누름을 가로채지 않게 숨김(2026-10-31 사용자: [누르고 걷기]가 대화창 뒤)
  document.body.classList.toggle('mg-scene-open', cls.split(/\s+/).includes('mg-scene'));
  requestAnimationFrame(() => el.classList.add('is-in'));
  input.pushScope(el);
  tts.speak(speech || `${title}. ${instruction}`, 'sys');
  let closed = false;
  const api = {
    el,
    body,
    aborts: [],
    /** 도중에 정리될 때 부를 것(실시간 미니게임: 고리 멈춤·방향키 풀기·끝 약속 풀기) */
    onAbort(fn) { api.aborts.push(fn); },
    close() {
      if (closed) return;
      closed = true;
      if (active === api) active = null;
      tts.stop();
      input.popScope(el);
      document.body.classList.remove('tasking', 'mg-open', 'mg-scene-open');
      el.classList.add('is-out');
      setTimeout(() => el.remove(), dur(220));
    },
  };
  active = api;
  return api;
}

/** 버튼 하나 누르기를 기다림 */
export function waitClick(btn) {
  return new Promise((r) => btn.addEventListener('click', (e) => { e.stopPropagation(); r(); }, { once: true }));
}

export function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
}
