/**
 * 설정 화면 (학생 프로필마다 따로 저장)
 */

import { h } from '../core/dom.js';
import { store } from '../core/store.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { openScreen, segmented, row } from './screen.js';
import { ICON } from '../data/icons.js';
import { ov } from '../ui/overlays.js';
import { tutor } from '../ui/tutor.js';

export function applySettingsToBody(s = store.settings()) {
  const b = document.body;
  b.classList.remove('ts-normal', 'ts-large', 'ts-xlarge', 'theme-pop', 'theme-calm');
  b.classList.add(`ts-${s.textSize}`, `theme-${s.theme}`);
  b.classList.toggle('contrast', Boolean(s.contrast));
  const reduce = s.motion === 'reduced';
  b.classList.toggle('reduce-motion', reduce);
}

export function showSettings() {
  const locked = store.settingsLocked();
  const scr = openScreen({ cls: 'scr-settings', title: '설정', icon: 'settings' });
  const s = store.settings();
  const set = (k) => (v) => { store.setSetting(k, v); applySettingsToBody(); };
  const vol = (k) => segmented([[0, '끄기'], [0.35, '작게'], [0.6, '보통'], [0.85, '크게']], nearest(s[k], [0, 0.35, 0.6, 0.85]), set(k), { disabled: locked });

  const sample = h('p', { class: 'set-sample', text: '지은은 오늘도 레시피를 보고, 순서대로 만들어요.' });
  if (locked) scr.body.append(h('p', { class: 'set-locked', text: '선생님이 설정을 잠가 두었어요. 바꾸려면 선생님께 말씀드려요.' }));
  scr.body.append(
    h('h2', { text: '보기' }),
    row('글자 크기', segmented([['normal', '보통'], ['large', '크게'], ['xlarge', '아주 크게']], s.textSize, set('textSize'), { disabled: locked })),
    sample,
    row('글자 나오는 속도', segmented([['slow', '느리게'], ['normal', '보통'], ['fast', '빠르게'], ['instant', '바로']], s.textSpeed, set('textSpeed'), { disabled: locked })),
    row('화면 스타일', segmented([['pop', '기본'], ['calm', '차분 모드']], s.theme, set('theme'), { disabled: locked }), '차분 모드: 색과 움직임, 소리가 부드러워져요.'),
    row('고대비', segmented([[false, '끄기'], [true, '켜기']], s.contrast, set('contrast'), { disabled: locked }), '글자와 배경을 더 또렷하게 해요.'),
    row('움직임', segmented([['full', '보통'], ['reduced', '줄이기']], s.motion, set('motion'), { disabled: locked }), '흔들림과 번쩍임을 줄여요.'),

    h('h2', { text: '듣기' }),
    row('읽어 주기', segmented([['auto', '자동으로', 'volume'], ['button', '버튼으로만'], ['off', '끄기']], s.voice, set('voice'), { disabled: locked })),
    row('말 빠르기', segmented([['slow', '느리게'], ['normal', '보통'], ['fast', '빠르게']], s.voiceRate, (v) => { set('voiceRate')(v); tts.speak('이 빠르기로 읽어 줄게요.', 'sys', { force: true }); }, { disabled: locked })),
    row('카드 읽어 주기', segmented([[true, '켜기'], [false, '끄기']], s.readCards, set('readCards'), { disabled: locked }), '끄기: 카드의 소리 아이콘을 누를 때만 읽어요. 켜기: 키보드·스위치로 카드를 옮길 때도 읽어요.'),
    row('전체 소리', vol('volMaster')),
    row('음악', vol('volBgm')),
    row('효과음', vol('volSfx')),

    h('h2', { text: '진행' }),
    row('자동 넘김', segmented([['off', '끄기'], ['slow', '천천히'], ['normal', '보통']], s.auto, set('auto'), { disabled: locked }), '끄면 내가 누를 때만 다음 대사로 넘어가요.'),
    row('카드 고르기', segmented([['one', '한 번 눌러 고르기'], ['two', '두 번 눌러 고르기']], s.selectMode, set('selectMode'), { disabled: locked }), '두 번: 처음 누르면 읽어 주고, 한 번 더 누르면 골라요.'),
    row('되감은 뒤 도움', segmented([['many', '많이'], ['some', '보통'], ['self', '스스로']], s.help, set('help'), { disabled: locked }), '실패하고 되감은 뒤 메모 강조와 카드 반짝임을 얼마나 줄지 정해요.'),
    row('시간 제한', segmented([['normal', '보통'], ['slow', '넉넉히'], ['off', '끄기']], s.timer || 'normal', set('timer'), { disabled: locked }), '급한 장면(손님이 기다리거나 바닥이 젖었을 때 등)에 줄어드는 막대가 나와요. 넉넉히는 2배, 자동 스캔을 켜면 시간 제한이 없어요.'),
    // 재미 개편(2026-11-01): 손 기술의 띠는 도움 표시(Q-38) · 손맛이 오르면 알맞아요 칸이 넓어짐(Q-41)
    row('손 기술 도움 띠', segmented([[false, '숨기기'], [true, '보이기']], s.helpBar === true, set('helpBar'), { disabled: locked }), '커피 만들기의 손 기술에 띠를 보여 줘요. 숨기면 잔이 알맞게 차오를 때 반짝이고 소리가 나요. 턴 방식과 「도움 많이」에서는 늘 보여요.'),
    row('손맛이 오르면 쉬워지기', segmented([[true, '켜기'], [false, '끄기']], s.growHelp !== false, set('growHelp'), { disabled: locked }), '지은의 손맛이 오를수록 알맞아요 칸이 조금씩 넓어져요.'),
    row('처음 보는 버튼 알려 주기', h('div', { class: 'set-tut' },
      segmented([[true, '켜기'], [false, '끄기']], s.tutorial !== false, set('tutorial'), { disabled: locked }),
      h('button', {
        class: 'btn btn-soft', disabled: locked,
        onclick: (e) => { e.stopPropagation(); tutor.reset(); audio.sfx('tap'); ov.toast('처음 보는 버튼을 다시 알려 줄게요', 'sparkle'); },
      }, h('i', { html: ICON('rewind') }), h('span', { text: '처음부터 다시' }))),
    '처음 나오는 버튼에 무지개 테두리와 손가락이 나와요. 한 번 누르면 다음부터는 안 나와요.'),

    h('h2', { text: '스위치 사용' }),
    row('자동 스캔', segmented([[false, '끄기'], [true, '켜기']], s.scan, set('scan'), { disabled: locked }), '버튼을 차례로 비춰 주고, 스위치(스페이스/엔터)를 누르면 골라요.'),
    row('스캔 속도', segmented([[2.6, '느리게'], [1.8, '보통'], [1.2, '빠르게']], nearest(s.scanSpeed, [2.6, 1.8, 1.2]), set('scanSpeed'), { disabled: locked })),
    h('p', { class: 'set-foot', text: store.storageOK ? '설정은 이 기기에 자동으로 저장돼요.' : '이 기기에서는 저장이 막혀 있어서, 창을 닫으면 설정이 사라져요.' }),
  );
  audio.sfx('page');
  return scr;
}

function nearest(v, list) {
  return list.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a), list[0]);
}
