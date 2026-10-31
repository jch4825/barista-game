/**
 * 화면 위에 뜨는 것들: 오늘의 일정표, 일정 완료 배너, 장소 자막, 칭찬 스냅, '잘했어요' 컷인, 크루 카드,
 * 완료 도장, 장 제목, 토스트, 문자 메시지, 행동 버튼, 말 사전 팝업, 아차! 카드, 되감기 효과, 확인 창, 오늘의 한 장,
 * 엔딩(사진 벽·크레디트, 연우의 마지막 메모)
 */

import { $, h, sleep, dur, announce } from '../core/dom.js';
import { ICON } from '../data/icons.js';
import { tts } from '../av/tts.js';
import { audio } from '../av/audio.js';
import { findTerm } from '../data/glossary.js';
import { store } from '../core/store.js';
import { fill, plain } from '../core/text.js';
import { portraitHTML, faceHTML, CHARS, hasStand, standURL, cardSpeech } from '../data/characters.js';
import { SKILLS } from '../data/skills.js';
import { img } from '../core/assets.js';
import { vfx, centerOf } from './vfx.js';
import { PHOTOS, PHOTO_ORDER, photoHTML } from '../data/photos.js';
import { input } from '../core/input.js';
import { bus } from '../core/bus.js';
import { artHTML, itemOf } from '../data/items.js';

const layer = () => $('#layer-overlay');
/** 확인 창·글자 입력 창은 전체 화면 창(#layer-screen)보다 위에 띄움 */
const modalLayer = () => $('#layer-modal') || layer();
const ORDINAL = ['첫 번째', '두 번째', '세 번째', '네 번째', '다섯 번째'];

/** 엔딩 크레디트: [제목, 이름들] (맨 끝에 '그리고 함께 일한 {player} 님'이 붙음) */
const CREDIT_ROLL = [
  ['카페 마일스톤', '정연우 · 강도현 · 박건우 · 한소라 · 오민재 · 유지호'],
  ['연우를 응원한 사람들', '엄마 · 김선영 선생님'],
  ['손님들', '봉순 할머니 · 서진 · 최 대리 · 루나 · 그리고 카페 마일스톤의 모든 손님'],
];

/** 장 제목 뒤의 이정표 엠블럼 (노란 기둥 + 메인 색 화살표 깃발) */
const EMBLEM = `<svg viewBox="0 0 520 520" aria-hidden="true">
  <circle cx="260" cy="260" r="250" fill="none" stroke="#FFD43B" stroke-width="5" stroke-dasharray="3 15" stroke-linecap="round"/>
  <circle cx="260" cy="260" r="224" fill="rgba(255,212,59,.07)" stroke="#FFD43B" stroke-width="4"/>
  <circle cx="260" cy="260" r="206" fill="none" stroke="#FFF7E8" stroke-width="2" opacity=".45"/>
  <rect x="140" y="140" width="240" height="240" fill="none" stroke="#FFF7E8" stroke-width="2" opacity=".35" transform="rotate(45 260 260)"/>
  <path d="M182 404 Q260 384 338 404" fill="none" stroke="#FFD43B" stroke-width="7" stroke-linecap="round"/>
  <rect x="245" y="138" width="30" height="264" rx="7" fill="#FFD43B" stroke="#17141C" stroke-width="6"/>
  <path d="M275 160 H366 L398 192 L366 224 H275Z" fill="#25844A" stroke="#17141C" stroke-width="6" stroke-linejoin="round"/>
  <path d="M245 246 H172 L144 274 L172 302 H245Z" fill="#FFF7E8" stroke="#17141C" stroke-width="6" stroke-linejoin="round"/>
  <circle cx="260" cy="132" r="13" fill="#FFD43B" stroke="#17141C" stroke-width="6"/>
</svg>`;

function mount(el, { scope = true, host = layer() } = {}) {
  host.append(el);
  if (scope) input.pushScope(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  return () => {
    if (scope) input.popScope(el);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(260));
  };
}

/**
 * 버튼 클릭까지 기다림. ms 를 주면 저절로 넘어가는데, voiceP(읽어 주기)를 주면
 * 그 목소리가 끝난 뒤에 넘어감(저절로 닫히는 창이 읽던 목소리를 끊지 않게)
 */
function waitButton(btn, ms = 0, voiceP = null) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    btn.addEventListener('click', (e) => { e.stopPropagation(); finish(); }, { once: true });
    if (ms) Promise.all([sleep(ms), voiceP && voiceP.then(() => sleep(300))]).then(finish);
  });
}

function bigBtn(label, icon = 'arrow_right', cls = '') {
  return h('button', { class: `btn btn-big ${cls}` }, h('i', { html: ICON(icon) }), h('span', { text: label }));
}

export const ov = {
  /* ---------- 오늘의 일정표 (에피소드 시작) ---------- */
  async schedule(ep) {
    const start = bigBtn('시작하기', 'play', 'btn-main');
    const items = (ep.schedule || []).map(([icon, label], i) => h('li', {},
      h('b', { text: String(i + 1) }), h('i', { html: ICON(icon) }), h('span', { text: label })));
    const el = h('section', { class: 'ov ov-schedule', role: 'dialog', 'aria-label': '오늘의 일정표' },
      h('div', { class: 'sch-card' },
        h('div', { class: 'sch-label', text: ep.label }),
        h('h1', { class: 'sch-title', text: ep.title }),
        ep.when ? h('p', { class: 'sch-when', text: ep.when }) : null,
        h('div', { class: 'sch-sub', text: '오늘의 일정표' }),
        h('ol', { class: 'sch-list' }, ...items),
        ep.goal ? h('p', { class: 'sch-goal' }, h('i', { html: ICON('star') }), h('span', { text: ep.goal })) : null,
        start));
    const close = mount(el);
    audio.sfx('page');
    start.focus({ preventScroll: true });
    tts.speak(`${ep.label}. ${ep.title}. 오늘 할 일. ${(ep.schedule || []).map(([, l], i) => `${i + 1}번, ${l}`).join('. ')}`, 'sys');
    await waitButton(start);
    tts.stop();
    audio.sfx('tap');
    close();
    await sleep(dur(200));
  },

  /* ---------- 장소·시간 자막 ---------- */
  place(time, text) {
    const el = h('div', { class: 'ov-place' }, time ? h('b', { text: time }) : null, h('span', { text: text }));
    const close = mount(el, { scope: false });
    announce(`${time || ''} ${text}`);
    setTimeout(close, 2800);
  },

  /* ---------- 칭찬 스냅 (폴라로이드) ---------- */
  async snap({ who = 'owner', face = 'smile', title = 'GOOD!', caption = '' }) {
    const calm = document.body.classList.contains('theme-calm');
    const go = h('button', { class: 'btn btn-small ov-next' }, '계속 ▶');
    const el = h('section', { class: `ov ov-snap ${calm ? 'calm' : ''}`, role: 'dialog', 'aria-label': title },
      h('div', { class: 'snap-pol' },
        h('div', { class: 'snap-photo', html: portraitHTML(who, face) }),
        h('div', { class: 'snap-cap', text: caption })),
      h('div', { class: 'snap-stamp', text: title }),
      go);
    el.addEventListener('click', () => go.click());
    const close = mount(el);
    audio.sfx('snap');
    setTimeout(() => audio.sfx('stamp'), dur(380));
    announce(`${title} ${caption}`);
    go.focus({ preventScroll: true });
    await waitButton(go, calm ? 1400 : 2200);
    close();
    await sleep(dur(150));
  },

  /* ---------- 에피소드 완료: 완료 영수증이 나오고 모서리에 도장 ----------
   * 붉은 바탕 + 가운데 원 + 퍼지거나 도는 빛살은 욱일기를 떠올리게 하므로 쓰지 않습니다(CLAUDE.md 2-8). */
  async finish({ title = '오늘의 마일스톤 완료!', sub = '' }) {
    const go = h('button', { class: 'btn btn-small ov-next' }, '계속 ▶');
    const seal = h('div', { class: 'fin-seal', 'aria-hidden': 'true' }, h('small', { text: 'MILESTONE' }), h('b', { text: '완료' }));
    const el = h('section', { class: 'ov ov-finish', role: 'dialog', 'aria-label': `${title} ${sub}` },
      h('div', { class: 'fin-receipt' },
        h('p', { class: 'fin-shop', text: '카페 마일스톤' }),
        h('p', { class: 'fin-kicker', text: '오늘의 마일스톤' }),
        h('h2', { class: 'fin-title', text: title }),
        sub ? h('p', { class: 'fin-sub', text: sub }) : null,
        h('div', { class: 'fin-code', 'aria-hidden': 'true' }),
        seal),
      go);
    el.addEventListener('click', () => go.click());
    const close = mount(el);
    audio.sfx('jingle_complete');
    vfx.confetti();
    setTimeout(() => {
      audio.sfx('stamp');
      const c = centerOf(seal);
      vfx.ink(c.x, c.y);
    }, dur(720));
    const voiceP = tts.speak(`${title} ${sub}`, 'sys');
    go.focus({ preventScroll: true });
    await waitButton(go, 4200, voiceP);
    tts.stop();
    close();
    await sleep(dur(200));
  },

  /* ---------- 큰 제목 (장 제목) ---------- */
  async big(text, sub = '') {
    const go = h('button', { class: 'btn btn-small ov-next' }, '계속 ▶');
    const el = h('section', { class: 'ov ov-big', role: 'dialog', 'aria-label': `${text} ${sub}` },
      h('div', { class: 'big-emblem', html: EMBLEM }),
      h('div', { class: 'big-plate' }, sub ? h('p', { class: 'big-sub', text: sub }) : null, h('h1', { text })),
      go);
    el.addEventListener('click', () => go.click());
    const close = mount(el);
    audio.sfx('whoosh');
    const voiceP = tts.speak(`${text}. ${sub}`, 'sys');
    go.focus({ preventScroll: true });
    await waitButton(go, 3200, voiceP);
    tts.stop();
    close();
    await sleep(dur(250));
  },

  /* ---------- 토스트 ---------- */
  toast(text, icon = 'sparkle') {
    const el = h('div', { class: 'ov-toast', role: 'status' }, h('i', { html: ICON(icon) }), h('span', { text }));
    const close = mount(el, { scope: false });
    announce(text);
    setTimeout(close, 2600);
  },

  /* ---------- 문자 메시지 ---------- */
  async phone({ from = 'mom', text = '' }) {
    const c = CHARS[from] || { name: from };
    const ok = bigBtn('확인', 'check');
    const el = h('section', { class: 'ov ov-phone', role: 'dialog', 'aria-label': `${c.name}의 문자` },
      h('div', { class: 'phone' },
        h('div', { class: 'phone-top' }, h('div', { class: 'phone-ava', html: portraitHTML(from, 'smile') }), h('b', { text: c.name })),
        h('div', { class: 'phone-body' }, h('p', { class: 'bubble', text: plain(text) })),
        ok));
    const close = mount(el);
    audio.sfx('phone');
    ok.focus({ preventScroll: true });
    announce(`${c.name}의 문자: ${plain(text)}`);
    tts.speak(text, c.voice || 'narr');
    await waitButton(ok);
    tts.stop();
    close();
    await sleep(dur(150));
  },

  /* ---------- 직접 하는 행동 (노크, 도장, 하이파이브…) ---------- */
  async act({ label, icon = 'hand', sfx = 'tap' }) {
    const b = h('button', { class: 'act-btn' }, h('i', { html: ICON(icon) }), h('span', { text: label }));
    const el = h('section', { class: 'ov ov-act', role: 'dialog', 'aria-label': label }, b);
    const close = mount(el);
    b.focus({ preventScroll: true });
    tts.speak(label, 'sys');
    await waitButton(b);
    tts.stop();
    audio.sfx(sfx);
    b.classList.add('done');
    await sleep(dur(350));
    close();
  },

  /* ---------- 말 사전 팝업 ---------- */
  async glossary(termId, { fromText = true } = {}) {
    const t = findTerm(termId);
    if (!t) return;
    const isNew = store.unlockTerm(t.id);
    const art = itemOf(t.item) ? t.item : t.icon; // 물건 낱말(트레이·귀마개·근로계약서…)은 소품 그림
    const close1 = bigBtn('알겠어요', 'check');
    const say = h('button', { class: 'btn btn-small', 'aria-label': '읽어 주기' }, h('i', { html: ICON('volume') }), h('span', { text: '듣기' }));
    const el = h('section', { class: 'ov ov-gloss', role: 'dialog', 'aria-label': `말 사전: ${t.word}` },
      h('div', { class: 'gloss-card' },
        h('div', { class: `gloss-ico ${itemOf(art) ? 'art' : ''}`, html: artHTML(art) }),
        h('div', { class: 'gloss-tag', text: isNew && fromText ? '말 사전에 새로 들어왔어요!' : '마일스톤 말 사전' }),
        h('h2', { text: t.word }),
        h('p', { class: 'gloss-easy', text: fill(t.easy) }),
        h('p', { class: 'gloss-ex', text: fill(t.ex) }),
        h('div', { class: 'gloss-btns' }, say, close1)));
    const close = mount(el);
    if (isNew) audio.sfx('jingle_unlock'); else audio.sfx('open');
    requestAnimationFrame(() => vfx.sparkleAt(el.querySelector('.gloss-ico'), { n: isNew ? 14 : 6, colors: ['#FFFFFF', '#BDF2EA', '#16A99A'] }));
    const read = () => tts.speak(`${t.word}. ${fill(t.easy)} 예를 들어, ${fill(t.ex)}`, 'sys', { force: true });
    say.addEventListener('click', (e) => { e.stopPropagation(); read(); });
    read();
    close1.focus({ preventScroll: true });
    await waitButton(close1);
    tts.stop();
    close();
  },

  /* ---------- 아차! 카드 (실패 결과) ---------- */
  /**
   * alt: 두 번째 버튼(예: '이대로 계속'). 있으면 고른 쪽을 돌려줌('rewind' | 'alt')
   * rewindLabel·hint: 근무판 사건처럼 되감는 곳이 다를 때
   */
  async oops({ title, lesson, icon = 'think', found = 0, total = 0, isNew = false, alt = '', rewindLabel = '되감기', hint = '이건 일어날 수도 있었던 일이에요. 시간을 되돌려 다시 골라 봐요.' }) {
    const back = bigBtn(rewindLabel, 'rewind', 'btn-rewind');
    const other = alt ? bigBtn(alt, 'arrow_right', 'btn-soft') : null;
    const el = h('section', { class: 'ov ov-oops', role: 'alertdialog', 'aria-label': `아차! ${title}` },
      h('div', { class: 'oops-card' },
        h('div', { class: 'oops-head' }, h('span', { class: 'oops-word', text: '아차!' }), h('i', { class: `oops-ico ${itemOf(icon) ? 'art' : ''}`, html: artHTML(icon) })),
        h('h2', { class: 'oops-title', text: title }),
        h('p', { class: 'oops-lesson', text: fill(lesson) }),
        h('p', { class: 'oops-note' },
          h('i', { html: ICON('book') }),
          h('span', { text: isNew ? `아차 노트에 새로 적었어요 (${found}/${total})` : `아차 노트 (${found}/${total})` })),
        h('p', { class: 'oops-hint', text: hint }),
        other ? h('div', { class: 'oops-btns' }, other, back) : back));
    const close = mount(el);
    audio.sfx('jingle_oops');
    back.focus({ preventScroll: true });
    announce(`아차! ${title}. ${plain(lesson)}`);
    tts.speak(`아차! ${title}. ${lesson}`, 'sys');
    const pickAlt = other ? new Promise((r) => other.addEventListener('click', (e) => { e.stopPropagation(); r('alt'); }, { once: true })) : null;
    const r = await Promise.race([waitButton(back).then(() => 'rewind'), pickAlt].filter(Boolean));
    tts.stop();
    close();
    return r;
  },

  /* ---------- 받은 물건 (정규 크루 배지·첫 급여명세서 등): 소품 그림 + 이름 + 반짝임 ----------
   * 읽어 주지 않습니다(앞뒤 대사가 말해 줌). 저절로 닫히고, [계속]으로 바로 넘길 수도 있음 */
  async got({ item, title = '', icon = 'star', sfx = 'good' }) {
    const go = h('button', { class: 'btn btn-small ov-next' }, '계속 ▶');
    const has = Boolean(itemOf(item));
    const el = h('section', { class: 'ov ov-got', role: 'dialog', 'aria-label': `받았어요: ${title}` },
      h('div', { class: 'got-card' },
        h('div', { class: 'got-tag', text: '받았어요!' }),
        h('div', { class: `got-art ${has ? 'art' : ''}`, html: has ? artHTML(item) : ICON(icon) }),
        title ? h('b', { class: 'got-title', text: title }) : null,
        go));
    const close = mount(el);
    audio.sfx(sfx);
    announce(`받았어요: ${title}`);
    requestAnimationFrame(() => vfx.sparkleAt(el.querySelector('.got-art'), { n: 16, colors: ['#FFD43B', '#FFFFFF', '#FFE9A8'] }));
    go.focus({ preventScroll: true });
    await waitButton(go, 2600);
    close();
    await sleep(dur(200));
  },

  /* ---------- 아침 브리핑: 오늘의 조건 카드 (v3 근무) ---------- */
  async briefing({ title = '오늘의 조건', day = '', cards = [], note = '' }) {
    const go = bigBtn('근무판 짜러 가기', 'calendar', 'btn-main');
    const el = h('section', { class: 'ov ov-brief', role: 'dialog', 'aria-label': `${day} ${title}` },
      h('div', { class: 'bf-card' },
        h('div', { class: 'bf-head' }, h('span', { class: 'bf-day', text: day }), h('h2', { text: title })),
        h('ul', { class: 'bf-list' }, ...cards.map(([icon, label, value]) => h('li', {}, h('i', { class: itemOf(icon) ? 'art' : '', html: artHTML(icon) }), h('small', { text: label }), h('b', { text: value })))),
        note ? h('p', { class: 'bf-note' }, h('i', { class: itemOf('memo') ? 'art' : '', html: artHTML('memo') }), h('span', { text: note })) : null,
        go));
    const close = mount(el);
    audio.sfx('page');
    go.focus({ preventScroll: true });
    announce(`${day} ${title}`);
    tts.speakSeq([`${day}. ${title}.`, ...cards.map(([, label, value]) => `${label}, ${value}.`), ...(note ? [note] : [])], 'sys');
    await waitButton(go);
    tts.stop();
    close();
    await sleep(dur(150));
  },

  /* ---------- 퇴근 정산 (v3 근무): 영수증 ---------- */
  async payout({ day = '', plan = 1, handle = 1, smiles = 0, guests = 0, waited = 0, hours = 4, hourly = 0, money = 0 }) {
    const stars = (n) => `${'★'.repeat(n)}${'☆'.repeat(3 - n)}`;
    const won = (n) => `${n.toLocaleString('ko-KR')}원`;
    const go = bigBtn('계속', 'arrow_right', 'btn-main');
    const row = (icon, label, value, sub = '') => h('li', {}, h('i', { html: ICON(icon) }), h('span', { text: label }), h('b', { text: value }), sub ? h('small', { text: sub }) : null);
    const el = h('section', { class: 'ov ov-pay', role: 'dialog', 'aria-label': '퇴근 정산' },
      h('div', { class: 'pay-receipt' },
        h('p', { class: 'pay-shop', text: '카페 마일스톤 · 퇴근 정산' }),
        h('p', { class: 'pay-day', text: day }),
        h('ul', { class: 'pay-list' },
          row('calendar', '계획', stars(plan), plan === 3 ? '계획 덕분에 문제가 없었어요' : '근무판을 바꾸면 더 좋아져요'),
          row('shield', '수습', stars(handle), handle === 3 ? '침착하게 해냈어요' : '되감아 다시 해냈어요'),
          row('smile', '웃으며 나간 손님', `${smiles} / ${guests}명`, waited ? `준비가 늦어 기다린 손님 ${waited}명` : ''),
          row('clock', '오늘 일한 시간', `${hours}시간`),
          row('coin', '오늘 번 돈', won(money), `시급 ${won(hourly)} × ${hours}시간`)),
        h('div', { class: 'pay-code', 'aria-hidden': 'true' }),
        go));
    const close = mount(el);
    audio.sfx('coin');
    setTimeout(() => audio.sfx('jingle_payday'), dur(400));
    go.focus({ preventScroll: true });
    announce(`퇴근 정산. 계획 별 ${plan}개, 수습 별 ${handle}개, 웃으며 나간 손님 ${smiles}명, 오늘 번 돈 ${won(money)}`);
    tts.speakSeq(['퇴근 정산.', `계획 별 ${plan}개.`, `수습 별 ${handle}개.`, `웃으며 나간 손님 ${smiles}명.`, `오늘 번 돈 ${won(money)}.`], 'sys');
    await waitButton(go);
    tts.stop();
    close();
    await sleep(dur(200));
  },

  /* ---------- 회중시계 되감기 효과 ---------- */
  async rewindFx() {
    const room = img.url('bg', 'rewind_room');
    const watch = itemOf('item_watch'); // 그림(초승달 장식 금 회중시계)이 있으면 그 그림이 거꾸로 흔들림
    const el = h('section', { class: `ov ov-rewind ${room ? 'has-room' : ''}`, 'aria-hidden': 'true', style: room ? { backgroundImage: `url('${room}')` } : {} },
      watch
        ? h('div', { class: 'rw-watch art', html: artHTML(watch) })
        : h('div', { class: 'rw-watch' },
          h('div', { class: 'rw-face' }, h('i', { class: 'rw-hand rw-h' }), h('i', { class: 'rw-hand rw-m' }), h('b', { class: 'rw-pin' }))),
      h('p', { class: 'rw-text', text: '⏪ 시간을 되돌리는 중…' }));
    const close = mount(el, { scope: false });
    audio.sfx('jingle_rewind');
    vfx.gears();
    announce('시간을 되돌렸어요.');
    await sleep(dur(1100));
    close();
    await sleep(dur(200));
  },

  /* ---------- 면접 돌아보기 (점수제 면접 끝: 합격·탈락 모두) ---------- */
  async review({ pass, ok, total, need, rows = [] }) {
    const title = pass ? '면접 돌아보기' : '탈락 엔딩';
    const sub = pass ? `알맞은 대답 ${ok} / ${total} · 합격이에요` : `알맞은 대답 ${ok} / ${total} · ${total}개 중 ${need}개를 맞히면 합격이에요`;
    const btn = bigBtn(pass ? '계속' : '면접 다시 보기', pass ? 'arrow_right' : 'rewind', pass ? 'btn-main' : 'btn-rewind');
    const say = (parts) => (e) => { e.stopPropagation(); audio.sfx('tap'); tts.speakSeq(parts, 'sys'); };
    const list = h('ol', { class: 'rv-list' }, ...rows.map((r) => h('li', { class: `rv-row ${r.ok ? 'ok' : 'ng'}` },
      h('i', { class: 'rv-mark', html: ICON(r.ok ? 'check' : 'close') }),
      h('div', { class: 'rv-text' },
        h('b', { class: 'rv-q', text: r.title }),
        h('p', { class: 'rv-mine', text: `내 대답: ${r.answer}` }),
        r.ok ? null : h('p', { class: 'rv-better', text: `이렇게 말해요: ${r.better}` }),
        r.ok || !r.oops ? null : h('p', { class: 'rv-why', text: fill(r.oops.lesson) })),
      r.ok ? null : h('button', { class: 'rv-say', 'aria-label': `${r.title} 읽어 주기`, html: ICON('volume'), onclick: say(['이렇게 말해요.', r.better, r.oops?.lesson || '']) }))));
    const el = h('section', { class: `ov ov-review ${pass ? 'pass' : 'fail'}`, role: 'dialog', 'aria-label': title },
      h('div', { class: 'rv-card' },
        h('div', { class: 'rv-head' }, h('span', { class: 'rv-tag', text: title }), h('p', { class: 'rv-sub', text: sub })),
        list, btn));
    const close = mount(el);
    audio.sfx(pass ? 'good' : 'jingle_oops');
    btn.focus({ preventScroll: true });
    announce(`${title}. ${sub}`);
    tts.speakSeq([pass ? '면접 돌아보기.' : '탈락 엔딩. 면접에서 떨어졌어요.', `알맞은 대답은 ${ok}개예요.`], 'sys');
    await waitButton(btn);
    tts.stop();
    close();
    await sleep(dur(150));
  },

  /* ---------- 확인 창 ---------- */
  /** say: 읽어 줄 말(기본은 text, '' 이면 읽지 않음) · detail: 화면에만 보이는 한 줄(학생 별명처럼 읽지 않을 것) */
  confirm({ text, yes = '예', no = '아니요', say = text, detail = '' }) {
    return new Promise((resolve) => {
      const y = bigBtn(yes, 'check', 'btn-main');
      const n = bigBtn(no, 'close');
      const el = h('section', { class: 'ov ov-confirm', role: 'alertdialog', 'aria-label': detail ? `${text} ${detail}` : text },
        h('div', { class: 'confirm-card' }, h('p', { text }), detail ? h('p', { class: 'confirm-detail', text: detail }) : null, h('div', { class: 'confirm-btns' }, n, y)));
      const close = mount(el, { host: modalLayer() });
      if (say) tts.speak(say, 'sys');
      n.focus({ preventScroll: true });
      let offEsc = null;
      const done = (v) => { offEsc?.(); tts.stop(); close(); resolve(v); };
      offEsc = bus.on('escape', () => done(false)); // Esc = 아니요 (아래 창이 닫히지 않게: screen.js)
      y.addEventListener('click', () => done(true), { once: true });
      n.addEventListener('click', () => done(false), { once: true });
    });
  },

  /* ---------- 글자 입력 창 (Electron 은 window.prompt 를 지원하지 않음) ---------- */
  prompt({ text, value = '', placeholder = '' }) {
    return new Promise((resolve) => {
      const inp = h('input', { class: 'pf-input', type: 'text', value, placeholder, 'aria-label': text, maxlength: '20' });
      const y = bigBtn('확인', 'check', 'btn-main');
      const n = bigBtn('취소', 'close');
      const el = h('section', { class: 'ov ov-confirm', role: 'dialog', 'aria-label': text },
        h('div', { class: 'confirm-card' }, h('p', { text }), inp, h('div', { class: 'confirm-btns' }, n, y)));
      const close = mount(el, { host: modalLayer() });
      setTimeout(() => inp.focus(), 50);
      let offEsc = null;
      const done = (v) => { offEsc?.(); close(); resolve(v); };
      offEsc = bus.on('escape', () => done(null));
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); y.click(); } });
      y.addEventListener('click', () => done(inp.value.trim() || null), { once: true });
      n.addEventListener('click', () => done(null), { once: true });
    });
  },

  /* ---------- 오늘의 한 장 ---------- */
  async photo(id) {
    const p = PHOTOS[id];
    if (!p) return;
    store.unlockPhoto(id);
    const go = h('button', { class: 'btn btn-small ov-next' }, '계속 ▶');
    const el = h('section', { class: 'ov ov-photo', role: 'dialog', 'aria-label': `오늘의 한 장: ${p.title}` },
      h('div', { class: 'ph-label', text: '오늘의 한 장' }),
      h('figure', { class: 'ph-pol' }, h('div', { class: 'ph-in', html: photoHTML(id) }), h('figcaption', { text: p.title })),
      go);
    el.addEventListener('click', () => go.click());
    const close = mount(el);
    audio.sfx('snap');
    const voiceP = tts.speak(`오늘의 한 장. ${p.title}`, 'sys');
    go.focus({ preventScroll: true });
    await waitButton(go, 3600, voiceP);
    tts.stop();
    close();
    await sleep(dur(150));
  },

  /* ---------- 엔딩: 사진 벽 + 크레디트 ----------
   * 모은 '오늘의 한 장'이 한 장씩 붙으며 제목을 읽어 줌(음성 파일: tools/export-lines.mjs 의 credits) →
   * 다 붙으면 사진 벽이 흐려지고 크레디트가 차례로 떠오름. 시간 제한 없음: [계속]을 누를 때까지, 언제 눌러도 넘어감 */
  async credits() {
    const got = new Set(store.photos());
    const ids = PHOTO_ORDER.filter((id) => got.has(id));
    const pols = ids.map((id, i) => h('figure', { class: 'cr-pol', style: { '--r': `${((i * 37) % 11) - 5}deg` } },
      h('div', { class: 'ph-in', html: photoHTML(id) }), h('figcaption', { text: PHOTOS[id].title })));
    const wall = h('div', { class: `cr-wall ${ids.length > 12 ? 'many' : ''}` }, ...pols);
    const you = `${fill('{player}')} 님`;
    const roll = h('div', { class: 'cr-roll' },
      h('h2', { text: '직업 마1스톤' }),
      ...CREDIT_ROLL.map(([head, names]) => h('div', { class: 'cr-sec' }, h('h3', { text: head }), h('p', { text: names }))),
      h('div', { class: 'cr-sec cr-you' }, h('h3', { text: '그리고 함께 일한 사람' }), h('p', { text: you })),
      h('p', { class: 'cr-thanks', text: '모르면 물어보기. 실수하면 말하기. 힘들면 쉬겠다고 말하기.' }));
    [...roll.children].forEach((c, i) => { c.style.transitionDelay = `${0.3 + i * 0.45}s`; });
    const go = h('button', { class: 'btn btn-small ov-next' }, '계속 ▶');
    const el = h('section', { class: 'ov ov-credits', role: 'dialog', 'aria-label': '사진 벽과 크레디트' }, wall, roll, go);
    const close = mount(el);
    go.focus({ preventScroll: true });
    let stopped = false;
    (async () => {
      await sleep(dur(600));
      for (const [i, fig] of pols.entries()) {
        if (stopped) return;
        fig.classList.add('on');
        const title = PHOTOS[ids[i]].title;
        announce(title);
        await Promise.all([sleep(dur(1000)), tts.speak(title, 'sys')]);
      }
      if (stopped) return;
      await sleep(dur(500));
      el.classList.add('roll-on');
      announce(`직업 마1스톤. ${CREDIT_ROLL.map(([hd, n]) => `${hd}: ${n}`).join('. ')}. 그리고 함께 일한 ${you}.`);
    })();
    await waitButton(go);
    stopped = true;
    tts.stop();
    close();
    await sleep(dur(300));
  },

  /* ---------- 연우의 마지막 메모 (엔딩) ----------
   * 노란 메모에 받는 사람 → 줄 → 추신 → 이름이 차례로 써짐. 받는 사람({player} 님에게)은 화면에만 쓰고,
   * 읽어 주기는 이름이 없는 speech 를 지은 목소리로(음성 파일: export-lines 의 letter) */
  async letter({ to = '', lines = [], ps = '', from = '지은', speech = '' }) {
    const go = h('button', { class: 'btn btn-small ov-next' }, '계속 ▶');
    const memoEl = h('div', { class: 'lt-memo' },
      h('i', { class: 'lt-tape', 'aria-hidden': 'true' }),
      to ? h('p', { class: 'lt-to', text: to }) : null,
      h('ol', { class: 'lt-lines' }, ...lines.map((l) => h('li', { text: l }))),
      ps ? h('p', { class: 'lt-ps', text: ps }) : null,
      h('p', { class: 'lt-from', text: `- ${from}` }));
    [...memoEl.querySelectorAll('.lt-to, .lt-lines li, .lt-ps, .lt-from')].forEach((c, i) => { c.style.animationDelay = `${0.6 + i * 0.4}s`; });
    const el = h('section', { class: 'ov ov-letter', role: 'dialog', 'aria-label': `${from}의 메모` }, memoEl, go);
    el.addEventListener('click', () => go.click());
    const close = mount(el);
    audio.sfx('page');
    setTimeout(() => vfx.sparkleAt(memoEl, { n: 18, colors: ['#FFD43B', '#FFFFFF', '#FFE9A8'] }), dur(500));
    announce(`${to} ${lines.join(' ')} ${ps} ${from}`);
    tts.speak(speech, 'jieun');
    go.focus({ preventScroll: true });
    await waitButton(go);
    tts.stop();
    close();
    await sleep(dur(250));
  },

  /* ---------- 매일 매일 카페 생활: 하루 끝 영수증 → [다음 날] / [근무표] ---------- */
  /** 돌려주는 값: 'next' | 'hub'. 읽어 주는 말은 고정 문장(DAILY_SAY), 숫자는 화면에만 */
  async dailyDone({ week = 1, dayName = '', money = 0, smiles = 0, weekMoney = 0, weekSmiles = 0, days = 0, weekEnd = false, say = '' }) {
    const nextB = bigBtn(weekEnd ? '다음 주 시작하기' : '다음 날 하기', 'arrow_right', 'btn-main');
    const hubB = bigBtn('근무표로', 'calendar');
    const row = (label, value) => h('li', {}, h('span', { text: label }), h('b', { text: value }));
    const won = (n) => `${Number(n || 0).toLocaleString('ko-KR')}원`;
    const el = h('section', { class: 'ov ov-daily', role: 'dialog', 'aria-label': `${week}주 차 ${dayName} 근무 끝` },
      h('div', { class: 'dd-card' },
        h('span', { class: 'dd-tag', text: '매일 매일 카페 생활' }),
        h('h2', { text: weekEnd ? `${week}주 차 끝!` : `${week}주 차 ${dayName} 끝!` }),
        h('ul', { class: 'dd-list' },
          row('오늘 번 돈', won(money)),
          row('웃으며 나간 손님', `${smiles}명`),
          weekEnd ? row('이번 주 번 돈', won(weekMoney)) : null,
          weekEnd ? row('이번 주 웃은 손님', `${weekSmiles}명`) : null,
          row('지금까지 일한 날', `${days}일`)),
        h('p', { class: 'dd-say', text: say }),
        h('div', { class: 'dd-btns' }, hubB, nextB)));
    const close = mount(el);
    audio.sfx(weekEnd ? 'jingle_complete' : 'good');
    if (weekEnd) vfx.confetti();
    nextB.focus({ preventScroll: true });
    tts.speak(say, 'sys');
    const pick = await new Promise((resolve) => {
      nextB.addEventListener('click', (e) => { e.stopPropagation(); resolve('next'); }, { once: true });
      hubB.addEventListener('click', (e) => { e.stopPropagation(); resolve('hub'); }, { once: true });
    });
    tts.stop();
    close();
    await sleep(dur(200));
    return pick;
  },

  /* ---------- 안내 카드 (튜토리얼, 엔딩 뒤 '모든 이야기가 열렸어요' 등): 한 문장에 한 줄 ---------- */
  async info({ title, body, icon = 'sparkle', button = '알겠어요' }) {
    const ok = bigBtn(button, 'check', 'btn-main');
    const lines = fill(body).split(/(?<=[.!?])\s+/).map((s) => h('span', { class: 'info-line', text: s }));
    const el = h('section', { class: 'ov ov-info', role: 'dialog', 'aria-label': title },
      h('div', { class: 'info-card' }, h('i', { class: 'info-ico', html: ICON(icon) }), h('h2', { text: title }), h('p', {}, ...lines), ok));
    const close = mount(el);
    audio.sfx('jingle_unlock');
    requestAnimationFrame(() => vfx.sparkleAt(el.querySelector('.info-ico'), { n: 12, colors: ['#FFD43B', '#FFFFFF', '#25844A'] }));
    ok.focus({ preventScroll: true });
    tts.speak(`${title}. ${body}`, 'sys');
    await waitButton(ok);
    tts.stop();
    close();
  },

  /* ---------- 성공 연출 (좋은 선택·커피를 다 만든 뒤, 2026-10-28 '바닷가 밤') ----------
   * 비스듬한 붓 띠가 휙 지나가고, 지은의 얼굴 액자와 큰 금색 글자가 한 자씩 쾅 들어온 뒤 오른쪽으로 빠짐(css/skin-sea.css 의 sc-*).
   * 빛살·해 문양 없음(조각은 띠와 같은 방향으로만 흐름). 차분 모드·움직임 줄이기는 움직임 없이 그대로 보였다 사라짐 */
  async cutin({ skill = null, level = 3, title = '' } = {}) {
    const sk = skill ? SKILLS[skill] : null;
    const b = document.body.classList;
    const still = b.contains('theme-calm') || b.contains('reduce-motion');
    const name = sk ? sk.name : (title || '좋은 선택');
    const stars = sk ? `${'★'.repeat(level)}${'☆'.repeat(3 - level)}` : '';
    const kicker = level === 3 ? '한 번에 해냈어요!' : '잘했어요!';
    const eyes = img.url('ui', level === 3 ? 'cutin_jieun_smile' : 'cutin_jieun_determined'); // 그림이 없으면 아래 지은 얼굴
    // 큰 글자는 한 자씩 들어옴. 읽기 프로그램은 묶음의 aria-label 을 읽음
    const letters = [...name].map((ch, i) => h('span', { class: 'sc-ch', style: { '--i': String(i) }, text: ch === ' ' ? ' ' : ch }));
    const el = h('section', { class: `ov ov-success ${still ? 'still' : ''}`, role: 'status', 'aria-label': `${kicker} ${name} ${stars}` },
      h('div', { class: 'sc-stage', 'aria-hidden': 'true' },
        h('span', { class: 'sc-echo', text: name }),
        h('i', { class: 'sc-slash sc-back' }),
        h('i', { class: 'sc-slash sc-gold' }),
        h('i', { class: 'sc-slash sc-gold2' }),
        ...[0, 1, 2, 3, 4, 5].map((k) => h('i', { class: 'sc-shard', style: { '--k': String(k) } })),
        h('div', { class: 'sc-face' }, eyes ? h('span', { class: 'sc-eyes', style: { backgroundImage: `url('${eyes}')` } }) : h('span', { class: 'sc-face-in', html: faceHTML('jieun', level === 3 ? 'smile' : 'determined') })),
        h('div', { class: 'sc-text' },
          h('span', { class: 'sc-kicker', text: kicker }),
          h('b', { class: 'sc-title', style: { '--len': String(letters.length) } }, ...letters),
          stars ? h('span', { class: 'sc-stars', text: stars }) : null)));
    const close = mount(el, { scope: false });
    announce(`${kicker} ${name}${stars ? `, 별 ${level}개` : ''}`);
    audio.sfx('whoosh');
    if (!still) setTimeout(() => audio.sfx(level === 3 ? 'great' : 'good'), dur(260));
    else audio.sfx(level === 3 ? 'great' : 'good');
    await new Promise((resolve) => {
      const t = setTimeout(resolve, still ? 1100 : 1750);
      el.addEventListener('click', () => { clearTimeout(t); resolve(); }, { once: true });
    });
    close();
    await sleep(dur(180));
  },

  /* ---------- 크루 카드 (처음 만난 크루·가족) ---------- */
  async crewCard(id) {
    const c = CHARS[id];
    if (!c?.card) return;
    const photo = hasStand(id)
      ? `<span class="cc-stand" style="background-image:url('${standURL(id, 'smile')}')"></span>`
      : portraitHTML(id, 'smile');
    const ok = bigBtn('알겠어요', 'check', 'btn-main');
    const say = h('button', { class: 'btn btn-small', 'aria-label': '읽어 주기' }, h('i', { html: ICON('volume') }), h('span', { text: '듣기' }));
    // 직업 마1스톤의 'MILESTONE 크루' 도장(+ 도장 소리·잉크 효과)은 뺌(2026-10-28, 디자인 '바닷가 밤')
    const el = h('section', { class: 'ov ov-crew', role: 'dialog', 'aria-label': `크루 카드: ${c.full || c.name}` },
      h('div', { class: 'cc-board', style: { '--accent': c.color || 'var(--main)' } },
        h('i', { class: 'cc-clip' }),
        h('div', { class: 'cc-paper' },
          h('div', { class: 'cc-head' },
            h('span', { class: 'cc-kicker', text: '처음 만났어요' }),
            h('b', { class: 'cc-name', text: c.full || c.name }),
            h('span', { class: 'cc-role', text: c.role || '' })),
          h('div', { class: 'cc-main' },
            h('figure', { class: 'cc-photo' }, h('div', { class: 'cc-photo-in', html: photo }), h('figcaption', { text: c.name })),
            h('ul', { class: 'cc-lines' }, ...c.card.lines.map((l) => h('li', { text: l })))),
          h('div', { class: 'cc-btns' }, say, ok))));
    const close = mount(el);
    audio.sfx('page');
    const read = () => tts.speak(cardSpeech(id), 'sys', { force: true });
    say.addEventListener('click', (e) => { e.stopPropagation(); read(); });
    read();
    announce(cardSpeech(id));
    ok.focus({ preventScroll: true });
    await waitButton(ok);
    tts.stop();
    close();
    await sleep(dur(200));
  },

  /* ---------- 오늘의 일정 n번 완료 ---------- */
  async check(n, item) {
    if (!item) return;
    const [icon, label] = item;
    const ord = ORDINAL[n - 1] || `${n}번째`;
    const stamp = h('span', { class: 'ck-stamp', text: '완료' });
    const el = h('section', { class: 'ov ov-check', role: 'status', 'aria-label': `${ord} 일정 끝. ${label}` },
      h('div', { class: 'ck-band' },
        h('b', { class: 'ck-num', text: String(n) }),
        h('i', { class: 'ck-ico', html: ICON(icon) }),
        h('div', { class: 'ck-text' }, h('small', { text: `오늘의 일정 ${n}번` }), h('b', { text: label })),
        stamp));
    const close = mount(el, { scope: false });
    announce(`${ord} 일정 끝. ${label}`);
    const voiceP = tts.speak(`${ord} 일정 끝! ${label}.`, 'sys');
    setTimeout(() => {
      audio.sfx('stamp');
      const p = centerOf(stamp);
      vfx.ink(p.x, p.y);
      vfx.burst('star', p.x, p.y, { n: 6, dist: [60, 140], size: [26, 40] });
    }, dur(380));
    await new Promise((resolve) => {
      const t = setTimeout(resolve, 15000); // 안전장치. 보통은 목소리가 끝나고 넘어감(목소리를 끊지 않게)
      Promise.all([sleep(1700), voiceP.then(() => sleep(300))]).then(() => { clearTimeout(t); resolve(); });
      el.addEventListener('click', () => { clearTimeout(t); resolve(); }, { once: true });
    });
    close();
    await sleep(dur(160));
  },

  clearAll() {
    layer().querySelectorAll('.ov, .ov-toast, .ov-place').forEach((el) => {
      input.popScope(el);
      el.remove();
    });
  },
};
