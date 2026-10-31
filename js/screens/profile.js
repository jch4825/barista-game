/**
 * 처음 시작: 이름 정하기 → 보기·듣기 빠른 설정 → 첫 이야기(EPISODES[0])
 */

import { h } from '../core/dom.js';
import { store } from '../core/store.js';
import { nav } from '../core/nav.js';
import { setTextContext } from '../core/text.js';
import { ICON } from '../data/icons.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { openScreen, segmented, row } from './screen.js';
import { applySettingsToBody } from './settings.js';
import { hideTitle } from './title.js';
import { EPISODES } from '../data/episodes/index.js';

// 본명 대신 별명(사용자 결정 2026-10-16: AI 기능을 쓰면 데이터가 나가는 것을 모두 막을 수는 없으니, 처음부터 별명을 쓰도록 안내)
// 읽어 주는 두 문장은 tools/export-lines.mjs 의 EXTRA 에도 있어야 음성 파일이 생깁니다
export const PROFILE_SAY = {
  lead: '안녕하세요! 게임에서 쓸 별명을 알려 주세요.',
  nick: '진짜 이름은 쓰지 말고, 나만의 별명을 써요.',
};

export function showProfileSetup() {
  const scr = openScreen({ cls: 'scr-profile', title: '처음 시작하기', icon: 'idcard' });
  const nameIn = h('input', { class: 'pf-input', type: 'text', maxlength: '12', placeholder: '예: 별빛, 민트, 연필', 'aria-label': '별명' });
  const next = h('button', { class: 'btn btn-big btn-main' }, h('i', { html: ICON('arrow_right') }), h('span', { text: '다음' }));
  const skip = h('button', { class: 'btn btn-soft' }, h('span', { text: '별명 없이 시작' }));
  scr.body.append(
    h('p', { class: 'pf-lead', text: PROFILE_SAY.lead }),
    h('p', { class: 'pf-nick' }, h('i', { html: ICON('shield') }), h('span', { text: PROFILE_SAY.nick })),
    h('p', { class: 'pf-note', text: '별명은 이 기기에만 저장돼요. 선생님이 기록을 볼 때 쓰여요.' }),
    nameIn,
    h('div', { class: 'pf-btns' }, skip, next));
  tts.speakSeq([PROFILE_SAY.lead, PROFILE_SAY.nick], 'sys', { force: true });
  setTimeout(() => nameIn.focus(), 100);
  nameIn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing) {
      e.preventDefault();
      next.click();
    }
  });

  const go = (name) => {
    const p = store.createProfile(name || '플레이어');
    setTextContext({ player: p.name });
    step2(scr);
  };
  next.addEventListener('click', (e) => { e.stopPropagation(); audio.unlock(); go(nameIn.value.trim()); });
  skip.addEventListener('click', (e) => { e.stopPropagation(); audio.unlock(); go(''); });
}

function step2(scr) {
  const s = store.settings();
  const set = (k) => (v) => { store.setSetting(k, v); applySettingsToBody(); };
  // 읽어 주기 빠르기 견본(음성 파일: tools/export-lines.mjs EXTRA). 지은의 목소리를 정하면 그 목소리로 바꿈
  const SAMPLE = '지은은 오늘 처음으로 바리스타 앞치마를 매요.';
  const sample = h('p', { class: 'set-sample', text: SAMPLE });
  const listen = h('button', { class: 'btn btn-soft', onclick: (e) => { e.stopPropagation(); tts.speak(SAMPLE, 'sys', { force: true }); } }, h('i', { html: ICON('volume') }), h('span', { text: '들어 보기' }));
  const start = h('button', { class: 'btn btn-big btn-main' }, h('i', { html: ICON('play') }), h('span', { text: '시작하기' }));
  scr.body.replaceChildren(
    h('p', { class: 'pf-lead', text: '보기 편하게 맞춰요. 나중에 [설정]에서 언제든 바꿀 수 있어요.' }),
    row('글자 크기', segmented([['normal', '보통'], ['large', '크게'], ['xlarge', '아주 크게']], s.textSize, set('textSize'))),
    sample,
    row('읽어 주기', h('div', { class: 'row-inline' }, segmented([['auto', '자동으로'], ['button', '버튼으로만'], ['off', '끄기']], s.voice, set('voice')), listen)),
    row('화면 스타일', segmented([['pop', '기본'], ['calm', '차분 모드']], s.theme, set('theme')), '차분 모드: 색과 움직임, 소리가 부드러워져요.'),
    h('div', { class: 'pf-btns' }, start));
  tts.speak('보기 편하게 맞춰요.', 'sys', { force: true });
  // 앞 화면의 Enter 키가 이 버튼까지 누르지 않도록 잠깐 뒤에 초점
  setTimeout(() => start.focus({ preventScroll: true }), 250);
  start.addEventListener('click', (e) => {
    e.stopPropagation();
    scr.close();
    hideTitle();
    nav.go('play', EPISODES[0].id); // 직업 마1스톤의 '프롤로그'는 지웠으므로 이야기 순서의 첫 편(2026-10-30 고침: 없는 편을 불러 빈 화면에서 멈췄음)
  });
}
