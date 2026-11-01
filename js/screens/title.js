/**
 * 타이틀 화면 + 학생(프로필) 고르기
 */

import { $, h } from '../core/dom.js';
import { img } from '../core/assets.js';
import { store } from '../core/store.js';
import { nav } from '../core/nav.js';
import { input } from '../core/input.js';
import { ICON } from '../data/icons.js';
import { renderBg } from '../data/backgrounds.js';
import { getEpisode, EPISODES, ENDING, FINALE } from '../data/episodes/index.js';
import { audio } from '../av/audio.js';
import { tts } from '../av/tts.js';
import { hud } from '../ui/hud.js';
import { dialogue } from '../ui/dialogue.js';
import { memo } from '../ui/memo.js';
import { stage } from '../ui/stage.js';
import { openScreen } from './screen.js';
import { CONFIG } from '../config.js';
import { hasSaves } from './saves.js';
import { loadRecordFiles } from './records.js';
import { AI_NOTICE } from '../data/credits.js';
import { ov } from '../ui/overlays.js';
import * as grow from '../core/grow.js';

let titleEl = null;
// 표지 영상(assets/movies/title_intro): 앱을 켜고 처음 본 표지에서만 끝까지 틀고, 그 뒤로는 마지막 장면. 영상이 없으면 그림만
let introPlayed = false;
const TITLE_SAY = () => [CONFIG.TITLE_SAY, CONFIG.TAGLINE.join(' ')];

/** 큰 제목: 앞의 ε 자리에 진짜 3을 좌우로 뒤집어 그림(함렛에 ε가 없고, 뒤의 3과 꼭 같은 모양이 되게). 화면 읽기는 TITLE_SAY */
function titleMark() {
  const [head, tail] = CONFIG.TITLE.split('ε');
  return h('h1', { class: 'tt-title' },
    h('span', { class: 'sr-only', text: CONFIG.TITLE_SAY }),
    h('span', { 'aria-hidden': 'true' }, head, h('span', { class: 'tt-flip3', text: '3' }), tail));
}

/**
 * 오른쪽의 크로마키 영상(소리 없음 · 누를 수 없는 장식). 오프닝 음악은 bgm/title(showTitle 이 틂)
 * 표지는 팬시해야 하므로 움직임 줄이기의 예외입니다(사용자 결정 2026-10-16). 영상을 못 틀면 마지막 장면 그림
 * 설치용 앱(Electron)은 누르지 않아도 소리가 나서 영상과 오프닝 음악이 함께 시작합니다(main.js autoplayPolicy).
 * 웹 브라우저는 첫 누름 전에는 소리를 막아서, 음악은 첫 누름 때 나옵니다(audio.unlock). 시작 버튼은 두지 않음(사용자 의견)
 */
function titleMovie() {
  const src = img.url('movies', 'title_intro');
  const end = img.url('movies', 'title_intro_end');
  if (!src && !end) return null;
  const box = h('div', { class: 'tt-movie', 'aria-hidden': 'true' });
  const still = () => {
    if (end) box.replaceChildren(h('img', { src: end, alt: '', draggable: 'false' }));
    else box.remove();
  };
  if (!src || introPlayed) { still(); return box; }
  const v = h('video', { muted: true, playsinline: true, preload: 'auto', disablepictureinpicture: true, tabindex: '-1' });
  v.muted = true;
  v.defaultMuted = true;
  v.addEventListener('error', still);
  v.addEventListener('playing', () => box.classList.add('is-on'), { once: true });
  v.src = src;
  box.append(v);
  // 화면에 붙은 뒤에 틀기. 영상 재생이 막히면(드묾) 마지막 장면으로
  const begin = () => {
    introPlayed = true;
    requestAnimationFrame(() => { if (v.isConnected) v.play()?.catch(() => { if (v.isConnected) still(); }); });
  };
  begin();
  return box;
}

function menuBtn(icon, label, sub, onClick, cls = '') {
  return h('button', { class: `tt-btn ${cls}`, onclick: (e) => { e.stopPropagation(); audio.unlock(); audio.sfx('tap'); onClick(); } },
    h('i', { html: ICON(icon) }), h('span', { class: 'tt-btn-text' }, h('b', { text: label }), sub ? h('small', { text: sub }) : null));
}

export function hideTitle() {
  if (titleEl) {
    input.popScope(titleEl);
    // 표지를 떠나면 영상을 멈추고 풀어 둠(뒤에서 계속 풀지 않게)
    const v = titleEl.querySelector('.tt-movie video');
    if (v) { v.pause(); v.removeAttribute('src'); v.load(); }
    titleEl.remove();
    titleEl = null;
  }
}

/** 가게 꾸미기(지은의 성장 · 재미 개편 Q-42): 산 것이 카페 앞 그림 위 제자리에. 그림이 오기 전에는 임시 표시(아이콘) */
function decoLayer() {
  const owned = grow.SHOP.filter((it) => it.kind === 'deco' && grow.owns(it.id));
  if (!owned.length) return null;
  return h('div', { class: 'tt-deco', 'aria-label': `가게 꾸미기: ${owned.map((it) => it.name).join(', ')}` },
    ...owned.map((it) => h('span', { class: `tt-deco-item d-${it.id}`, title: it.name, style: { left: `${it.spot[0]}%`, top: `${it.spot[1]}%` }, html: ICON(it.icon) })));
}

export function showTitle() {
  hideTitle();
  hud.hide();
  dialogue.hide();
  memo.clear();
  stage.clear();
  audio.bgm('title');
  audio.ambience(null);

  const p = store.active();
  const cp = store.checkpoint();
  const cpEp = cp ? getEpisode(cp.ep) : null;
  const firstUndone = EPISODES.find((e) => !store.isDone(e.id));
  // 마지막 이야기를 마쳤는데 엔딩을 아직 못 봤으면 엔딩부터 · 엔딩을 본 뒤에는 근무표에서 골라 하기
  const endingWaits = p && !firstUndone && store.isDone(FINALE) && !store.ending();
  const cleared = p && !firstUndone && Boolean(store.ending());

  const menu = h('nav', { class: 'tt-menu', 'aria-label': '처음 화면 메뉴' });
  if (p && cpEp) {
    menu.append(menuBtn('play', '이어하기', `${cpEp.label} · ${cpEp.title}`, () => nav.go('play', cpEp.id, { resume: true }), 'primary'));
    // 이어 하기가 있을 때만: 봄 1일부터 다시(2026-11-01 사용자). 묻고 나서 이번 해를 처음부터(store.restartYear)
    menu.append(menuBtn('repeat', '처음부터', `${EPISODES[0].label} · ${EPISODES[0].title}부터 다시`, restartFromTop));
  } else if (p && firstUndone) {
    const done = EPISODES.some((e) => store.isDone(e.id));
    menu.append(menuBtn('play', done ? '다음 이야기' : '시작하기', `${firstUndone.label} · ${firstUndone.title}`, () => nav.go('play', firstUndone.id), 'primary'));
  } else if (endingWaits) {
    menu.append(menuBtn('star', '엔딩 보기', `${ENDING.label} · ${ENDING.title}`, () => nav.go('play', ENDING.id), 'primary'));
  } else if (cleared) {
    menu.append(menuBtn('calendar', '달력', ENDING.notice.title, () => nav.go('hub'), 'primary'));
  } else if (!p) {
    menu.append(menuBtn('play', '처음 시작하기', '이름을 정하고 시작해요', () => nav.go('newProfile'), 'primary'));
    // 이 기기에 학생이 없을 때(새 컴퓨터·복원된 학교 PC·웹판): 다른 컴퓨터에서 하던 기록 파일로 이어 하기
    menu.append(menuBtn('file_load', '기록 파일로 이어 하기', '다른 컴퓨터에서 하던 기록이 있으면', () => loadFromFile()));
  }
  if (p) {
    // 불러오기는 늘 보임(저장한 것이 없으면 빈 칸 목록)
    menu.append(menuBtn('resume', '불러오기', hasSaves() ? '저장한 장면부터 하기' : '아직 저장한 장면이 없어요', () => nav.go('saves', 'load')));
  }
  if (p) {
    // 엔딩을 본 뒤에는 근무표가 맨 위 큰 버튼이므로 여기서는 빼요
    if (!(cleared && !cpEp)) menu.append(menuBtn('calendar', '달력', store.ending() ? '원하는 날 골라 하기' : '이야기 골라 하기', () => nav.go('hub')));
    menu.append(
      menuBtn('book', '수첩', '단골 · 메뉴 도감 · 장면 앨범', () => nav.go('notebook')),
      menuBtn('settings', '설정', '글자 · 소리 · 읽어 주기', () => nav.go('settings')),
    );
  }
  menu.append(menuBtn('teacher', '선생님 모드', '기록 보기 · 학생 관리', () => nav.go('teacher')));

  const who = p
    ? h('button', { class: 'tt-who', onclick: (e) => { e.stopPropagation(); showProfilePicker(); } }, h('i', { html: ICON('idcard') }), h('span', { text: `${p.name} 님` }), h('small', { text: '학생 바꾸기' }))
    : null;

  // 오른쪽은 영상 자리 · 왼쪽 한 줄에 제목 → 메뉴(두 칸) → 학생 이름과 안내
  titleEl = h('section', { class: 'title-screen', role: 'main', 'aria-label': `${CONFIG.TITLE_SAY} 처음 화면` },
    h('div', { class: 'tt-bg', html: renderBg('title_cafe', 'dusk') }),
    decoLayer(),
    h('div', { class: 'tt-shade' }),
    titleMovie(),
    // 생성형 AI 사용 알림(AI 기본법 제31조 취지, 사용자 결정 2026-10-16). 자세한 내용은 선생님 모드 → 제작·저작권 정보
    h('p', { class: 'tt-ai', role: 'note' }, h('i', { html: ICON('sparkle') }), h('span', { text: AI_NOTICE })),
    h('div', { class: 'tt-side' },
      h('div', { class: 'tt-logo' },
        h('div', { class: 'tt-badge', text: CONFIG.BADGE }),
        titleMark(),
        h('p', { class: 'tt-tag' }, h('b', { text: CONFIG.TAGLINE[0] }), h('span', { text: CONFIG.TAGLINE[1] }))),
      menu,
      h('div', { class: 'tt-bottom' },
        who,
        h('p', { class: 'tt-foot', text: `v${CONFIG.VERSION} · 화면을 누르거나 Space 키로 대사를 넘겨요` }))));
  $('#layer-screen').append(titleEl);
  input.pushScope(titleEl);
  setTimeout(() => input.focusFirst(menu), 80);
  tts.speakSeq(TITLE_SAY(), 'sys');
}

/** 처음부터: 묻고 나서 이번 해를 봄 1일부터(마친 날만 다시, 단골과의 관계 · 저장한 장면 · 앨범 · 메뉴 도감 · 기록은 남음) */
async function restartFromTop() {
  const ok = await ov.confirm({
    text: '처음부터 다시 할까요?',
    detail: `${EPISODES[0].label}부터 다시 시작해요. 단골과의 관계 · 저장한 장면 · 앨범 · 메뉴 도감은 그대로 남아요.`,
    yes: '처음부터', no: '아니요',
  });
  if (!ok) return;
  store.restartYear();
  nav.go('play', EPISODES[0].id);
}

/** 기록 파일 불러오기 → 한 학생이면 그 학생으로, 여럿이면 '누가 할까요?' (records.js) */
async function loadFromFile(scr = null) {
  const r = await loadRecordFiles({ multiple: true });
  if (!r) return;
  if (r.ids.length === 1) store.selectProfile(r.ids[0]);
  scr?.close();
  nav.go('title');
  if (r.ids.length > 1) showProfilePicker();
}

export function showProfilePicker() {
  const scr = openScreen({ cls: 'scr-profiles', title: '누가 할까요?', icon: 'idcard' });
  const list = h('div', { class: 'pf-list' }, ...store.profiles().map((p) => h('button', {
    class: `pf-card ${store.active()?.id === p.id ? 'on' : ''}`,
    onclick: (e) => { e.stopPropagation(); store.selectProfile(p.id); scr.close(); nav.go('title'); },
  }, h('i', { html: ICON('idcard') }), h('b', { text: p.name }), h('small', { text: `완료 ${EPISODES.filter((e) => p.progress.done[e.id]).length} / ${EPISODES.length}` }))));
  const add = h('button', { class: 'btn btn-big', onclick: (e) => { e.stopPropagation(); scr.close(); nav.go('newProfile'); } }, h('i', { html: ICON('star') }), h('span', { text: '새로 시작하는 사람' }));
  const file = h('button', { class: 'btn btn-big', onclick: (e) => { e.stopPropagation(); loadFromFile(scr); } }, h('i', { html: ICON('file_load') }), h('span', { text: '기록 파일 불러오기' }));
  scr.body.append(list, h('div', { class: 'pf-more' }, add, file));
}
