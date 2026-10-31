/**
 * 게임 중 메뉴: 멈춤 · 지난 대화 · 되감기 목록
 */

import { h } from '../core/dom.js';
import { nav } from '../core/nav.js';
import { runner } from '../core/runner.js';
import { ICON } from '../data/icons.js';
import { dialogue } from '../ui/dialogue.js';
import { ov } from '../ui/overlays.js';
import { tts } from '../av/tts.js';
import { voiceOf } from '../data/characters.js';
import { bus } from '../core/bus.js';
import { openScreen } from './screen.js';

function bigBtn(icon, label, fn, cls = '') {
  return h('button', { class: `btn btn-big ${cls}`, onclick: (e) => { e.stopPropagation(); fn(); } }, h('i', { html: ICON(icon) }), h('span', { text: label }));
}

export function showPause() {
  const scr = openScreen({ cls: 'scr-pause', title: '잠깐 멈춤', icon: 'pause' });
  scr.body.append(
    h('div', { class: 'pause-grid' },
      bigBtn('play', '계속하기', () => scr.close(), 'btn-main'),
      bigBtn('pen', '저장하기', () => nav.go('saves', 'save')),
      bigBtn('resume', '불러오기', () => nav.go('saves', 'load')),
      bigBtn('book', '지난 대화', () => showBacklog()),
      bigBtn('rewind', '되감기', () => { scr.close(); showRewindList(); }),
      bigBtn('book', '수첩', () => nav.go('notebook')),
      bigBtn('settings', '설정', () => nav.go('settings')),
      bigBtn('coffee', '레시피 수첩', () => { scr.close(); bus.emit('hud:recipe'); }),
      bigBtn('calendar', '달력으로 나가기', async () => {
        if (await ov.confirm({ text: '달력으로 나갈까요? 지금까지 한 것은 저장돼요.', yes: '나가기', no: '계속하기' })) {
          scr.close();
          runner.abort();
          nav.go('hub');
        }
      }),
      bigBtn('home', '처음 화면으로', async () => {
        if (await ov.confirm({ text: '처음 화면으로 갈까요? 지금까지 한 것은 저장돼요.', yes: '처음 화면', no: '계속하기' })) {
          scr.close();
          runner.abort();
          nav.go('title');
        }
      })),
    h('p', { class: 'pause-note', text: '판단 장면마다 자동으로 저장돼요. [저장하기]로 원하는 장면을 6칸에 따로 저장할 수 있어요.' }));
}

export function showBacklog() {
  const scr = openScreen({ cls: 'scr-backlog', title: '지난 대화', icon: 'book' });
  const items = dialogue.history();
  if (!items.length) {
    scr.body.append(h('p', { class: 'nb-empty', text: '아직 대화가 없어요.' }));
    return;
  }
  const list = h('ol', { class: 'log-list' }, ...items.map((it) => h('li', { class: `log-${it.kind}` },
    it.label ? h('b', { text: it.label }) : h('b', { class: 'narr', text: '이야기' }),
    h('p', { text: it.text }),
    h('button', { class: 'log-listen', 'aria-label': '다시 듣기', html: ICON('volume'), onclick: (e) => { e.stopPropagation(); tts.speak(it.text, voiceOf(it.who, it.kind), { force: true }); } }))));
  scr.body.append(list);
  setTimeout(() => { scr.body.scrollTop = scr.body.scrollHeight; }, 50);
}

export function showRewindList() {
  const pts = runner.rewindPoints();
  if (!pts.length) {
    ov.toast('아직 되감을 곳이 없어요. 판단 장면을 지나면 생겨요.', 'rewind');
    return;
  }
  const scr = openScreen({ cls: 'scr-rewind', title: '어디로 되감을까요?', icon: 'rewind' });
  scr.body.append(
    h('p', { class: 'rw-lead', text: '회중시계를 돌려 그 장면 바로 앞으로 돌아가요. 다른 카드를 골라 볼 수도 있어요.' }),
    h('div', { class: 'rw-list' }, ...pts.map((p, i) => h('button', {
      class: 'rw-item',
      onclick: (e) => { e.stopPropagation(); scr.close(); runner.jumpTo(p); },
    }, h('i', { html: ICON(i === 0 ? 'rewind' : 'watch') }), h('b', { text: p.title }), h('small', { text: i === 0 ? '바로 앞 장면' : `${i + 1}번째 전 장면` })))));
}
