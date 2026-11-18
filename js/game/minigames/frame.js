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
import { store } from '../../core/store.js';

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
/** 학생마다 길(선생님 화면 · store.path): 쉬운 길은 박자 칸 넓게 · 쟁반이 덜 흔들림, 깊은 길은 박자 칸 좁게 · 띠 · 쟁반이 조금 빠르게. 쉬운 길의 느린 띠는 시간 제한 넉넉히(timer.js) */
const PATH_TIMING = { easy: { beatWin: 1.3, speed: 1, tray: 0.8 }, deep: { beatWin: 0.85, speed: 1.15, tray: 1.15 } };
export function timingOf(opts = {}) {
  const t = TIMING[opts.season] || TIMING.spring;
  const p = PATH_TIMING[store.path()] || { beatWin: 1, speed: 1, tray: 1 };
  // 계절 단계(봄 · 여름 연습 → 가을 · 겨울)가 따로 있는 띠 · 쟁반은 주마다 조금만 더(weekSpeed 의 반), 나머지 놀이는 week
  const w2 = weekSpeed(opts, WEEK_STEP / 2);
  return { beatWin: t.beatWin * p.beatWin, speed: t.speed * p.speed * w2, tray: t.tray * p.tray * w2, beat: w2, week: weekSpeed(opts) };
}

/**
 * 주가 바뀔수록 살짝 빨라짐(2026-11-18 사용자 "주가 바뀔 수록 속도가 살짝 씩 빨라진다.(원이 작아지는 속도, 눌러지는 속도 등)").
 * 한 주 = 이야기의 한 계절(7일: 봄 0 · 여름 1 · 가을 2 · 겨울 3, 두 번째 해부터는 +4) · 자유 영업은 7일 묶음(그 날의 week, free.js).
 * 한 주에 WEEK_STEP(6%)씩, WEEK_MAX 주까지(약 1.4배). 쉬운 길은 절반만. 턴 방식은 시간이 가지 않아 상관없음
 * 쓰는 곳: 버스 손잡이의 원이 줄어드는 빠르기 · 풍경 · 몰림의 주문 · 갈매기 · 설거지 수세미 · 쟁반 걸음, 커피 만들기의 띠 · 박자는 그 반(계절 단계와 겹쳐서)
 */
export const WEEK_STEP = 0.06;
export const WEEK_MAX = 7;
const SEASON_WEEK = { spring: 0, summer: 1, autumn: 2, winter: 3 };
export function weekOf(opts = {}) {
  if (Number.isFinite(opts.week)) return Math.max(0, opts.week);
  if (!(opts.season in SEASON_WEEK)) return 0;
  return SEASON_WEEK[opts.season] + 4 * Math.max(0, (store.year?.() || 1) - 1);
}
export function weekSpeed(opts = {}, per = WEEK_STEP) {
  const step = store.path() === 'easy' ? per / 2 : per;
  return 1 + step * Math.min(WEEK_MAX, weekOf(opts));
}

/**
 * 숙련자 템포(2026-11-18 사용자 "숙련자 템포를 넣는다."): 같은 놀이를 FAMILIAR_AT 번 넘게 끝까지 했으면
 * 처음 설명을 소리 내어 읽지 않고(글은 그대로, [설명 듣기]로 다시 들음) [시작!] 창이 곧 저절로 시작(화면을 누르면 바로).
 * 커피 만들기의 손 기술은 그 손 기술을 FAMILIAR_AT 번 넘게 했으면 설명을 읽지 않고 카드 밖을 누르면 바로 시작.
 * 설정 '익숙한 놀이'(tempo: quick 기본 · full 늘 처음처럼), 쉬운 길(선생님이 정함)은 늘 처음처럼
 */
export const FAMILIAR_AT = 3;
export function tempoQuick() { return store.settings().tempo !== 'full' && store.path() !== 'easy'; }
export function playedCount(kind) { return store.logs().filter((l) => l.type === 'mini' && l.name === kind && !l.quit).length; }
export function isFamiliar(kind) { return Boolean(kind) && tempoQuick() && playedCount(kind) >= FAMILIAR_AT; }
/**
 * 처음 설명을 소리 내어 읽지 않음(2026-11-18 사용자 "첫 1주 이후에는 미니게임 시작버튼 누르고 어떻게 해라는 설명이 TTS로 나올 필요가 없어.
 * 보통 2~3일만 되어도 그 소리 다 듣지 않고 넘긴다."): 첫 주(봄)가 지나면(여름부터 · 봄 7일을 마친 뒤 · 두 번째 해 · 자유 영업),
 * 첫 주에도 그 놀이를 FAMILIAR_AT 번 넘게 했으면. 글은 그대로 보이고 [설명 듣기]로 다시 들음. 설정 '늘 처음처럼' · 쉬운 길은 늘 읽음
 */
export function quietIntro(kind, opts = {}) {
  if (!tempoQuick()) return false;
  return weekOf(opts) >= 1 || store.everDone?.('spring_7') || (Boolean(kind) && playedCount(kind) >= FAMILIAR_AT);
}

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
export function frame({ title, instruction, icon = 'star', cls = '', speech = '', quit = false, kind = '', opts = {} }) {
  const familiar = isFamiliar(kind); // 숙련자 템포: 익숙한 놀이는 [시작!]이 곧 저절로
  const quiet = familiar || quietIntro(kind, opts); // 첫 주가 지나면 처음 설명을 읽지 않음(글은 그대로)
  const say = h('button', { class: 'mg-say', 'aria-label': '설명 듣기', html: ICON('volume'), onclick: (e) => { e.stopPropagation(); tts.speak(instruction, 'sys', { force: true }); } });
  // [그만하기] 물음: 미니게임이 그사이 끝나면 함께 닫고, 늦게 '그만하기'를 눌러도 다음 미니게임을 그만두지 않음(검수 13.39 29번)
  let quitAsk = null;
  const quitBtn = quit ? h('button', {
    class: 'btn btn-soft mg-quit',
    onclick: async (e) => {
      e.stopPropagation();
      quitAsk = ov.confirm({ text: QUIT_ASK, yes: '그만하기', no: '계속하기' });
      const yes = await quitAsk;
      quitAsk = null;
      if (yes && !closed) bus.emit('mg:quit');
    },
  }, h('i', { html: ICON('close') }), h('span', { text: '그만하기' })) : null;
  const body = h('div', { class: 'mg-body' });
  const el = h('section', { class: `mg ${cls}${familiar ? ' is-familiar' : ''}`, role: 'group', 'aria-label': title },
    h('header', { class: 'mg-head' }, h('i', { class: 'mg-ico', html: ICON(icon) }), h('div', {}, h('h2', { text: title }), h('p', { text: instruction })), quitBtn, say),
    body);
  $('#layer-task').replaceChildren(el);
  document.body.classList.add('tasking', 'mg-open');
  // 화면 가득한 장면 미니게임(쟁반 · 둘러보기 · 순서대로): 앞 대사의 대화창이 아래 단추를 가리고 누름을 가로채지 않게 숨김(2026-10-31 사용자: [누르고 걷기]가 대화창 뒤)
  document.body.classList.toggle('mg-scene-open', cls.split(/\s+/).includes('mg-scene'));
  requestAnimationFrame(() => el.classList.add('is-in'));
  input.pushScope(el);
  const told = quiet ? Promise.resolve() : tts.speak(speech || `${title}. ${instruction}`, 'sys'); // 다 읽거나 끊기면 풀림
  let closed = false;
  const api = {
    el,
    body,
    /** 처음 설명(제목. 할 일)을 다 읽었을 때: 시작 말 · 단추 밖 시작은 이 뒤에(설명이 끊기지 않게, 검수 13.39 15번) */
    told,
    /** 숙련자 템포(익숙한 놀이): [시작!] 창이 곧 저절로 시작 */
    familiar,
    /** 처음 설명을 읽지 않았음(첫 주가 지남 · 익숙한 놀이) */
    quiet,
    aborts: [],
    /** 도중에 정리될 때 부를 것(실시간 미니게임: 고리 멈춤·방향키 풀기·끝 약속 풀기) */
    onAbort(fn) { api.aborts.push(fn); },
    close() {
      if (closed) return;
      closed = true;
      quitAsk?.cancel();
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
