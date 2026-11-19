/**
 * 직업 ε바리스타3 - 진입점 (엔진은 직업 마1스톤 v2에서 가져옴)
 * 화면 연결(nav), HUD 버튼, 에피소드 실행 흐름을 묶습니다.
 */

import { CONFIG } from './config.js';
import { initScale } from './core/scale.js';
import { input } from './core/input.js';
import { store } from './core/store.js';
import { bus } from './core/bus.js';
import { nav } from './core/nav.js';
import { runner } from './core/runner.js';
import { setTextContext } from './core/text.js';
import { audio } from './av/audio.js';
import { tts } from './av/tts.js';
import { img } from './core/assets.js';
import { stage } from './ui/stage.js';
import { vfx } from './ui/vfx.js';
import { memo } from './ui/memo.js';
import { hud } from './ui/hud.js';
import { dialogue } from './ui/dialogue.js';
import { showRecipeBook } from './game/minigames/brew.js';
import { tutor } from './ui/tutor.js';
import { preloadEpisode, warmAll } from './ui/loading.js';
import { getEpisode, nextEpisode, ENDING, FINALE } from './data/episodes/index.js';
import { freeDay } from './data/episodes/free.js';
import { ov } from './ui/overlays.js';
import { showTitle, hideTitle } from './screens/title.js';
import { showProfileSetup } from './screens/profile.js';
import { showHub } from './screens/hub.js';
import { showResult, todayOf } from './screens/result.js';
import { showNotebook } from './screens/notebook.js';
import { showSettings, applySettingsToBody } from './screens/settings.js';
import { showTeacher } from './screens/teacher.js';
import { showPause, showBacklog, showRewindList } from './screens/menus.js';
import { closeAllScreens } from './screens/screen.js';
import * as grow from './core/grow.js';
import { showSaves } from './screens/saves.js';

let playing = false;
let playTok = 0; // 이야기 도중 저장 칸을 불러오면 새 이야기가 먼저 시작되고, 끝난 옛 이야기가 뒤늦게 돌아옴

/** resume: 자동 저장(이어하기)부터 · save: 세이브 슬롯에서 불러온 저장 데이터 */
async function playEpisode(id, { resume = false, save = null } = {}) {
  // 자유 영업: 다음 날 번호로 그날을 만듦(같은 날은 늘 같은 하루, js/data/episodes/free.js)
  // 자유 영업: 엔딩 전(봄 7일 뒤 일찍 연 것, 재미 개편 Q-47)은 만난 단골 · 마친 계절만(처음부터 다시 하기 전에 마친 계절도)
  // 이어 하기 · 저장 칸은 저장한 그날(free)을 다시 만듦. 다음 날 번호로 만들면 비트 번호가 다른 날과 어긋남(검수 13.39 7번)
  const from = save || (resume ? store.checkpoint() : null);
  // 저장한 날의 단골 · 계절(early)이 있으면 그대로: 저장한 뒤 단골을 더 만나거나 계절을 마쳐도 같은 하루로
  const early = from?.ep === 'free' && from.early ? from.early : !store.ending() ? {
    regs: [...new Set(store.logs().filter((l) => l.type === 'respond').map((l) => l.who))],
    seasons: ['spring', 'summer', 'autumn', 'winter'].filter((x) => store.everDone(`${x}_7`)),
  } : {};
  const day = from?.ep === 'free' && from.free ? from.free : store.free().day + 1;
  const ep = id === 'free' ? freeDay(day, { album: store.album(), ...early }) : getEpisode(id);
  if (!ep) { console.warn(`없는 이야기: ${id}`); nav.go('hub'); return; } // 빈 화면에 멈추지 않게 근무표로
  if (runner.isRunning()) runner.abort();
  closeAllScreens();
  hideTitle();
  audio.unlock();
  const tok = ++playTok;
  playing = false; // 앞 이야기(저장 칸 불러오기로 그만둔 것)의 playing 도 끔
  grow.markDay(); // 하루 끝 화면의 '오늘 오른 능력치'(지은의 성장)
  await preloadEpisode(ep); // 출근 중 화면: 그날 그림을 미리 받기(웹판)
  // 출근 중 화면 동안은 멈춤(Esc) · 되감기(R)를 열지 않음(playing 은 이야기가 시작될 때 켬). 그사이 처음 화면으로 나갔거나 다른 이야기를 열었으면 그만
  if (tok !== playTok) return;
  playing = true;
  const result = await runner.play(ep, { resume: from });
  if (tok !== playTok) return; // 그사이 시작된 새 이야기의 playing(Esc 멈춤 · R 되감기)을 끄지 않게(검수 13.39 9번)
  playing = false;
  if (result.status !== 'ended') return;
  if (ep.id === ENDING.id) { await afterEnding(); return; }
  if (ep.id === 'free') { await afterFreeDay(ep, result); return; }
  store.markDone(ep.id);
  hud.hide();
  dialogue.hide();
  // 이야기의 마지막 에피소드를 처음 마치면(해마다) 결과 화면 뒤에 엔딩(본 뒤에 다시 하면 엔딩은 달력에서)
  const end = store.ending();
  const endingNext = ep.id === FINALE && !(end && end.after === FINALE && (end.year || 1) === store.year());
  const next = await showResult(ep, result, { ending: endingNext });
  if (next === 'ending') nav.go('play', ENDING.id);
  else if (next === 'next' && nextEpisode(ep.id)) nav.go('play', nextEpisode(ep.id).id);
  else if (next === 'hub') { nav.go('title'); nav.go('hub'); }
  else nav.go('title');
}

/** 자유 영업 하루가 끝나면: 날 번호를 올리고 하루 끝 화면 → [다음 날 열기] · 달력 · 처음 화면 */
async function afterFreeDay(ep, result) {
  // 마친 날의 자동 저장은 지움(이야기의 markDone 과 같음). 남겨 두면 다음 날 [이어하기]가 그날의 '마감'부터 시작함(검수 13.39 4번)
  if (store.checkpoint()?.ep === 'free') store.clearCheckpoint();
  const f = store.free();
  const served = todayOf(ep, result).cups.length; // 하루 끝 화면과 같은 셈(되감아 다시 한 작업대는 마지막 것만)
  store.setFree({ ...f, day: Math.max(f.day, ep.free || 0), served: (f.served || 0) + served, best: Math.max(f.best || 0, served) });
  hud.hide();
  dialogue.hide();
  const next = await showResult(ep, result, { again: '다음 날 열기' });
  if (next === 'again') nav.go('play', 'free');
  else if (next === 'hub') { nav.go('title'); nav.go('hub'); }
  else nav.go('title');
}

/** 엔딩이 끝나면: 본 것으로 기록 → (처음이면) 모든 이야기가 열렸다는 알림 → 달력 */
async function afterEnding() {
  const first = !store.ending();
  store.markEnding(FINALE);
  hud.hide();
  dialogue.hide();
  if (first) await ov.info({ title: ENDING.notice.title, body: ENDING.notice.body, icon: 'calendar', button: '달력 보기' });
  nav.go('title');
  nav.go('hub');
}

function bindHud() {
  bus.on('hud:rewind', () => showRewindList());
  bus.on('hud:memo', () => memo.toggle());
  bus.on('hud:notebook', () => showNotebook());
  // [레시피](2026-10-28, '숨 고르기' 대신): 어디서나 레시피 수첩. 작업대가 열려 있으면 작업대 안의 수첩
  bus.on('hud:recipe', () => showRecipeBook());
  bus.on('hud:settings', () => showSettings());
  bus.on('hud:pause', () => showPause());
  bus.on('hud:backlog', () => showBacklog());
  bus.on('escape', () => {
    if (playing && !document.querySelector('#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov')) showPause();
  });
  document.addEventListener('keydown', (e) => {
    if (!playing) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return; // Ctrl+R(새로고침) 등 브라우저 단축키는 그대로
    const tag = (document.activeElement?.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    // 연출 · 확인 창(#layer-overlay .ov: 되감기 연출 · 아차 · 받았어요 …)이 떠 있는 동안도 열지 않음(Esc 멈춤과 같은 기준)
    if ((e.key === 'Backspace' || e.key === 'r' || e.key === 'R') && !document.querySelector('#layer-screen .scr, #layer-modal .ov, #layer-overlay .ov')) {
      e.preventDefault();
      showRewindList();
    }
  });
}

function unlockOnFirstGesture() {
  const go = () => {
    audio.unlock();
    window.removeEventListener('pointerdown', go, true);
    window.removeEventListener('keydown', go, true);
  };
  window.addEventListener('pointerdown', go, true);
  window.addEventListener('keydown', go, true);
}

async function boot() {
  document.title = CONFIG.TITLE;
  initScale();
  stage.init();
  vfx.init();
  memo.init();
  hud.init();
  dialogue.init();
  input.init();
  applySettingsToBody();
  setTextContext({ player: store.active()?.name || '플레이어' });
  bus.on('profile', (p) => {
    applySettingsToBody();
    setTextContext({ player: p?.name || '플레이어' });
  });
  bus.on('settings', () => applySettingsToBody());
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && store.hasProfile() && store.settings().motion === 'full' && !store.active().settings.motionChosen) {
    store.setSettings({ motion: 'reduced', motionChosen: true });
  }

  await Promise.all([audio.init(), tts.init(), img.init()]);
  tutor.init(); // 그림 목록(손가락 그림)을 읽은 뒤

  // 처음 화면: 출근 중 화면(그림 받기)을 기다리던 이야기도 그만둠(playTok)
  nav.register('title', () => { playTok += 1; playing = false; if (runner.isRunning()) runner.abort(); closeAllScreens(); showTitle(); });
  nav.register('newProfile', showProfileSetup);
  nav.register('hub', showHub);
  nav.register('play', playEpisode);
  nav.register('notebook', showNotebook);
  nav.register('settings', showSettings);
  nav.register('teacher', showTeacher);
  nav.register('saves', (mode) => showSaves(mode));

  bindHud();
  unlockOnFirstGesture();
  // 자동 플레이 테스트(tools/autoplay.js)용 디버그 훅: 주소에 ?debug 가 있을 때만
  if (new URLSearchParams(location.search).has('debug')) window.__jm = { runner, store, nav, getEpisode, img, stage, vfx, tutor };
  nav.go('title');
  document.getElementById('boot')?.remove();
  // 모든 그림을 뒤에서 미리 받기(표지 그림·영상이 먼저 뜬 뒤): 이어 할 이야기가 있으면 그 그림부터(2026-10-26)
  const cp = store.checkpoint();
  setTimeout(() => warmAll(cp ? getEpisode(cp.ep) : null), 800);
}

boot().catch((e) => {
  console.error(e);
  const b = document.getElementById('boot');
  if (b) b.textContent = `시작하지 못했어요: ${e.message}`;
});
