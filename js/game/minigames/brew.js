/**
 * 미니게임: 커피 만들기 (바리스타 작업대) — PRD.md 6장 · M1 시험판(아메리카노 · 따뜻한 우유 · 라테)
 *
 * 흐름(손님 한 명마다): 주문 듣기 → 레시피 고르기(컵 → 바탕 → 더하기 0~2 → 온도) → 손 기술 → [드리기] → 손님 반응
 *  - 손님은 왼쪽 작은 창(얼굴·주문·반응)에 남고, 오른쪽은 작업대 클로즈업(PRD 6.2). 대화창은 가려 둠(body.brew-open)
 *  - 레시피가 틀려도 고른 대로 만들고, 드릴 때 손님이 차분히 말함("이건 제가 주문한 게 아니네요.") → [다시 만들기](실수로 셈)
 *  - 손 기술이 칸을 벗어나면 그 자리에서 학생이 고름(2026-10-31 사용자): [다시 하기](띠를 비우고 그 손 기술만 다시) / [이대로 하기]
 *  - [이대로 하기]로 드리면 손님이 그 잔의 결과로 말함("조금 연하네요.") → [다시 만들기] / [그대로 드리기]
 *  - 감점·실패 화면·무서운 소리 없음. [레시피 수첩](오픈북)은 언제든 열 수 있고, 열려 있는 동안 띠가 멈춤(arcade.blockedNow)
 * 손 기술(띠, docs/recipes.md 동작 A 누르고 떼기): [누르고 있기]를 누르는 동안만 띠가 차오르고, 손을 떼면 그 칸으로 정함.
 *  띠에 글자 칸(연해요 · 알맞아요 · 써요)이 있어 색만으로 알리지 않음. 끝까지 누르고 있으면 높은 칸(써요·넘쳐요)
 *  - 아주 짧게 누르면(HOLD_MIN 아래, 실수로 톡) 정하지 않고 띠를 처음으로("조금 더 꾹 누르고 있어요.")
 *  - 알맞아요 칸 가운데(36%)에서 떼면 '딱 좋아요!'(반짝임·소리만 다르고 음료와 손님 반응은 알맞아요와 같음, Q-R4 🙋).
 *    턴 방식은 가운데에 가장 가까운 눈금 하나에서 [멈추기]. [보기]로 한 것은 '딱 좋아요'가 아님
 *  - 자판: 버튼에 초점을 두고 스페이스·엔터를 누르고 있다가 뗌. 초점이 나가면 뗀 것으로 봄
 *  - 빠르기는 설정 '시간 제한'(arcade.pace): 보통 · 넉넉히(2배 천천히) · 두 번 눌러 고르기(1.5배)
 *  - 끄기·자동 스캔은 턴 방식: 누르고 있기 대신 [한 칸]씩 + [멈추기](오래 누르기가 어려운 학생)
 *  - [시작!]을 눌러야 움직임. 언제든 [보기]: 저절로 알맞게 해 줌(보기로 기록, 실수 아님)
 *  - 단계(opts.level): easy = 손 기술을 모두 보기로 · normal = 직접 · barista = 거품 내기까지 직접 + 라테아트(하트)
 * 옵션: { title, orders: [{ who, say, menu, cup?, thanks? }], level, quit, book?: [메뉴 id], pantry?: { cups, bases, adds, temps }, speech? }
 * 돌려줌: { ok, attempts(엔진 약속: 해 본 횟수, 되감기가 없어 늘 1), served(드린 잔), mistakes(레시피가 틀린 잔), remakes, kept, ms, made: [메뉴 id], watched(보기 수), skills, art, level, turn }
 *  - 도중에 정리되면(되감기·나가기) { ok: false, aborted: true, … } · [그만하기]면 { ok: false, quit: true, … }
 * 그림: 물건 그림(assets/objects, img.has('objects', id))이 있으면 쓰고, 없으면 아래 임시 그림(SVG). 작업대 배경은 bg/workbench_morning
 *  - 손 기술의 한 컷(Q-R9): assets/shots/ 에 그 손 기술의 배경판·프레임이 있으면 작업대 칸을 그 장면으로 채우고(shotView),
 *    띠 값에 맞는 단계의 프레임(줄기·김 있음/없음)을 겹침. 지금은 샷 내리기(extract: 잔이 참)·우유 데우기(steam: 온도계 바늘 + 김)·
 *    붓기(pour_milk 빈 머그에 우유 · pour_latte 에스프레소에 우유, 바리스타 단계에서 알맞으면 하트)·거품 내기(foam: 피처 속 우유가 부풀어 오름).
 *    만드는 법은 tools/blender/scene_bench.py(shots) → shots_post.py
 * 자동 플레이(?debug): window.__mgAuto(모두 알맞게, { miss: n } 이면 손 기술을 n 번 넘치게 → [다시 하기], keep: true 면 [이대로 하기])
 *  · window.__mgBad(레시피를 한 번 틀리게: 바탕 재료를 바꿈)
 * 데이터(메뉴·재료·손 기술·손님 반응)는 js/data/menu.js
 */

import { h, sleep, dur } from '../../core/dom.js';
import { ICON } from '../../data/icons.js';
import { audio } from '../../av/audio.js';
import { tts } from '../../av/tts.js';
import { img } from '../../core/assets.js';
import { input } from '../../core/input.js';
import { bus } from '../../core/bus.js';
import { store } from '../../core/store.js';
import { CHARS, faceHTML, voiceOf } from '../../data/characters.js';
import { vfx, centerOf } from '../../ui/vfx.js';
import { frame, line, abortGeneration, abortMinigame } from './frame.js';
import { pace, loop, isDebug } from './arcade.js';
import {
  LEVELS, CUPS, INGREDIENTS, TEMPS, HAND_SKILLS, RECIPES, LATTE_ART, STARTER_BOOK, PANTRY, STEP_NAMES, MAX_ADDS,
  orderTarget, findMenu, compareRecipe, prepSteps, recipeSpeech, orderProblems, skillInLevel, sameSet,
} from '../../data/menu.js';

const TITLE = '커피 만들기';
const HOWTO = '주문을 듣고 레시피대로 만들어요. 다 만들면 손님에게 드려요.';
const STEPS = 8;        // 턴 방식: 띠 한 칸 = 1/8 (알맞아요 칸에 두 칸이 들어감, menu.js 의 zone)
const RUN_MS = 4800;    // 실시간: 띠가 끝까지 가는 시간(보통). 알맞아요 칸(1/4)을 지나는 데 약 1.2초 · 넉넉히는 2배
const WATCH_MS = 2000;  // [보기]: 띠가 처음부터 끝까지 가는 빠르기(알맞아요 칸 가운데에서 멈춤)
const HOLD_MIN = 0.06;  // 실시간: 이보다 짧게 누르고 떼면 실수로 톡 누른 것으로 봄(보통 약 0.3초)

/** 단계마다 읽어 주는 말 */
const PROMPT = {
  cup: '카운터에서 알맞은 컵을 찾아 눌러요.',
  base: '컵에 넣을 재료를 찾아 눌러요.',
  adds: '더 넣을 재료가 있으면 눌러요. 다 넣었으면 [만들기 시작]을 눌러요.',
  temp: '온도를 바꾸려면 [따뜻하게]를 눌러요. 얼음을 눌러도 차갑게 돼요.',
  confirm: '레시피를 다 골랐어요. 이대로 만들까요?',
  serve: '다 만들었어요. 손님에게 드려요.',
  mild: '다시 만들어도 되고, 그대로 드려도 돼요.',
};
/** 손님 말 (주문마다 orders[].thanks, 메뉴마다 menu.js 의 thanks · artThanks) */
const SAY = {
  wrong: '이건 제가 주문한 게 아니네요.',
  wait: '네, 기다릴게요.',
  accept: '괜찮아요. 잘 마실게요.',
  thanks: '맛있어요. 고마워요.',
};
/** 레시피가 틀렸을 때 다시 볼 곳 */
const HINT = {
  cup: '컵을 다시 봐요.',
  base: '컵에 넣은 재료를 다시 봐요.',
  adds: '컵에 넣은 재료를 다시 봐요.',
  temp: '온도를 다시 봐요.',
  book: '레시피 수첩을 봐도 좋아요.',
};
const SYS = {
  book: '레시피 수첩이에요. 메뉴를 누르면 읽어 줘요.',
  watch: '잘 봐요. 알맞아요 칸에서 멈춰요.',
  turn: '[한 칸]을 누르면 띠가 한 칸 움직여요.',
  full: '재료는 세 가지까지 넣을 수 있어요.',
  art: '하트가 생겼어요!',
  done: '주문을 모두 만들었어요!',
  holdShort: '조금 더 꾹 누르고 있어요.',
  perfect: '딱 좋아요!',
  temp: '따뜻하게 할까요, 차갑게 할까요?',
  retry: '다시 해 볼까요? 이대로 해도 괜찮아요.',
  again: '좋아요. 다시 해 봐요.',
};

/** 옵션이 없을 때(자유 영업 시험·음성 목록) */
export const DEFAULT_ORDERS = [
  { who: 'customer', say: '아메리카노 한 잔 주세요.', menu: 'americano' },
  { who: 'grandma', say: '따뜻한 우유 한 잔 줄래요?', menu: 'warm_milk' },
  { who: 'student', say: '라테 한 잔 주세요.', menu: 'latte' },
];

const ordersOf = (opts) => (Array.isArray(opts.orders) && opts.orders.length ? opts.orders : DEFAULT_ORDERS);
const levelOf = (opts) => (LEVELS.includes(opts.level) ? opts.level : 'normal');
const speechOf = (opts) => opts.speech || `${opts.title || TITLE}. ${HOWTO}`;
const thanksOf = (o) => o.thanks || RECIPES[o.menu]?.thanks || SAY.thanks;
/** 손 기술 설명: 실시간은 누르고 떼기(howto), 턴 방식은 [한 칸]·[멈추기](howtoTurn) */
const howtoOf = (sk, turn) => (turn && sk.howtoTurn) || sk.howto;
const skillSpeech = (sk, turn = false) => `${sk.name}. ${howtoOf(sk, turn)}`;

/** 레시피 수첩의 메뉴: 정한 목록(없으면 처음 메뉴) + 주문에 나오는 메뉴 */
function bookOf(opts) {
  const ids = [...(opts.book || STARTER_BOOK), ...ordersOf(opts).map((o) => o.menu)];
  return [...new Set(ids)].filter((id) => RECIPES[id]);
}

/** 작업대에 놓을 것: 기본(또는 opts.pantry) + 주문을 만들 수 있게 주문 레시피에 든 것 */
function pantryOf(opts) {
  const src = { ...PANTRY, ...(opts.pantry || {}) };
  const p = { cups: [...src.cups], bases: [...src.bases], adds: [...src.adds], temps: [...src.temps] };
  const put = (list, id) => { if (!list.includes(id)) list.push(id); };
  for (const o of ordersOf(opts)) {
    const t = orderTarget(o);
    if (!t) continue;
    put(p.cups, t.cup);
    put(p.bases, t.base);
    t.adds.forEach((a) => put(p.adds, a));
    put(p.temps, t.temp);
  }
  p.cups = p.cups.filter((id) => CUPS[id]);
  p.bases = p.bases.filter((id) => INGREDIENTS[id]?.roles.includes('base'));
  p.adds = p.adds.filter((id) => INGREDIENTS[id]?.roles.includes('add'));
  p.temps = p.temps.filter((id) => TEMPS[id]);
  return p;
}

/** 읽어 주는 문장 목록 (tools/export-lines.mjs 가 mini('brew', 옵션) 비트마다 부름. 옵션 없이 부르면 기본 주문) */
export function brewLines(opts = {}) {
  const orders = ordersOf(opts);
  const level = levelOf(opts);
  const pantry = pantryOf(opts);
  const out = [line.sys(speechOf(opts)), line.sys(HOWTO)];
  for (const t of [...Object.values(PROMPT), ...Object.values(HINT), ...Object.values(SYS)]) out.push(line.sys(t));
  // 고를 때 읽어 주는 이름
  for (const id of pantry.cups) out.push(line.sys(CUPS[id].name));
  for (const id of new Set([...pantry.bases, ...pantry.adds])) out.push(line.sys(INGREDIENTS[id].name));
  for (const id of pantry.temps) out.push(line.sys(TEMPS[id].name));
  // 레시피 수첩
  for (const id of bookOf(opts)) out.push(line.sys(recipeSpeech(id)));
  // 손 기술: 시작 설명 · 안전 · 띠 글자, 손 기술 없이 넣는 재료
  for (const sk of Object.values(HAND_SKILLS)) {
    out.push(line.sys(skillSpeech(sk)), line.sys(skillSpeech(sk, true)));
    if (sk.safety) out.push(line.sys(sk.safety));
    for (const t of Object.values(sk.labels)) out.push(line.sys(t));
  }
  for (const ing of Object.values(INGREDIENTS)) for (const t of Object.values(ing.auto || {})) out.push(line.sys(t));
  for (const t of Object.values(TEMPS)) if (t.auto) out.push(line.sys(t.auto));
  // 손님 말: 주문 · 고마움 · 레시피가 틀렸을 때 · 다시 만들 때 · 그대로 받을 때 · 손 기술이 칸을 벗어났을 때
  for (const o of orders) {
    const r = RECIPES[o.menu];
    out.push(line.say(o.who, o.say), line.say(o.who, thanksOf(o)), line.say(o.who, SAY.wrong), line.say(o.who, SAY.wait), line.say(o.who, SAY.accept));
    if (!r) continue;
    if (level === 'barista' && r.artThanks) out.push(line.say(o.who, r.artThanks));
    for (const s of r.skills) if (skillInLevel(s, level)) for (const t of Object.values(HAND_SKILLS[s].react)) out.push(line.say(o.who, t));
  }
  const seen = new Set();
  return out.filter((l) => {
    const k = `${l.t}|${l.who || ''}|${l.text}`;
    if (!l.text || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** mini('brew', 옵션) 검사(시나리오 검사 도구용): 문제 글 목록, 없으면 빈 목록 */
export function brewProblems(opts = {}) {
  const errs = [];
  if (opts.level !== undefined && !LEVELS.includes(opts.level)) errs.push(`level 은 ${LEVELS.join(' · ')} 가운데 하나`);
  if (!Array.isArray(opts.orders) || !opts.orders.length) errs.push('orders(주문 목록)가 비어 있음');
  (opts.orders || []).forEach((o, i) => {
    for (const e of orderProblems(o)) errs.push(`orders[${i}] ${e}`);
    if (o.who && !CHARS[o.who]) errs.push(`orders[${i}] 없는 인물: ${o.who} (js/data/characters.js)`);
  });
  for (const id of opts.book || []) if (!RECIPES[id]) errs.push(`book: 없는 메뉴 ${id}`);
  const table = { cups: CUPS, bases: INGREDIENTS, adds: INGREDIENTS, temps: TEMPS };
  for (const [k, list] of Object.entries(opts.pantry || {})) {
    if (!table[k]) errs.push(`pantry: 모르는 칸 ${k} (cups · bases · adds · temps)`);
    else for (const id of list || []) if (!table[k][id]) errs.push(`pantry.${k}: 없는 것 ${id}`);
  }
  return errs;
}

/* ================================================================== */
/* 임시 그림 (SVG): 물건 그림(assets/objects)이 오면 저절로 바뀜              */
/* 같은 시점(앞에서 조금 위)·같은 빛(왼쪽 위)으로 그린 단순한 모양               */
/* ================================================================== */
let gidN = 0;
const gid = (p) => `bw${p}${(gidN += 1)}`; // 그림마다 다른 그라데이션 id(같은 id 가 여러 개면 지워진 그림을 따라가 깨짐)
const SHADOW = '<ellipse cx="60" cy="109" rx="34" ry="6" fill="#3B2A1A" opacity=".18"/>';
const svgBox = (vb, body) => `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${body}</svg>`;
const svg = (body) => svgBox('0 0 120 120', body);
const grad = (id, [a, b, c], vertical = false) => `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}"><stop offset="0" stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
const EYE = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 32q26-30 52 0-26 30-52 0z"/><circle cx="32" cy="32" r="9"/></svg>';

/** 두 색 섞기(#RRGGBB) */
function mix(a, b, t) {
  const p = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** 김(따뜻함): 물결선 n 개(0~3). 움직이지 않음 */
function steamLines(n, cx, top) {
  return [-13, 0, 13].slice(0, n).map((dx) => `<path d="M${cx + dx} ${top} q-5 -6 0 -11 t0 -11" fill="none" stroke="#A9A096" stroke-width="3" stroke-linecap="round" opacity=".7"/>`).join('');
}

function mugSVG({ color = null, level = 0.86, foam = null, foamSize = 0.9, art = null, steam = 0, spill = false, thick = false } = {}) {
  const g = gid('m');
  const c = gid('c');
  const body = thick ? ['#FFF6E6', '#EFDFC4', '#C9B28C'] : ['#FFFFFF', '#EEEAE3', '#C6BEB2'];
  const edge = thick ? '#977F5C' : '#8C8478';
  const y = 41 + (1 - level) * 20;
  const rx = 26 - (1 - level) * 3;
  const liquid = color ? `<g clip-path="url(#${c})">
    <ellipse cx="60" cy="${y}" rx="${rx}" ry="7.2" fill="${color}"/>
    ${foam ? `<ellipse cx="60" cy="${y}" rx="${Math.min(rx, (rx - 3) * foamSize)}" ry="${Math.min(7, 5.4 * foamSize)}" fill="${foam}"/>` : ''}
    ${art === 'heart' ? `<path d="M60 ${y + 4.4} C52 ${y}, 53 ${y - 5}, 60 ${y - 1.6} C67 ${y - 5}, 68 ${y}, 60 ${y + 4.4} Z" fill="#FFFDF8"/>` : ''}
  </g>` : '';
  return svg(`<defs>${grad(g, body)}<clipPath id="${c}"><ellipse cx="60" cy="40" rx="${thick ? 24 : 27}" ry="${thick ? 6.5 : 7.5}"/></clipPath></defs>
    ${spill ? `<ellipse cx="64" cy="108" rx="46" ry="7.5" fill="${color || '#C79A6B'}" opacity=".6"/>` : SHADOW}
    <path d="M86 52 C104 50 106 82 84 86" fill="none" stroke="${edge}" stroke-width="12" stroke-linecap="round"/>
    <path d="M86 52 C104 50 106 82 84 86" fill="none" stroke="url(#${g})" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 40 L33 96 Q34 106 60 106 Q86 106 87 96 L90 40 Z" fill="url(#${g})" stroke="${edge}" stroke-width="2.5"/>
    <ellipse cx="60" cy="40" rx="30" ry="9" fill="#FBF9F5" stroke="${edge}" stroke-width="2.5"/>
    <ellipse cx="60" cy="40" rx="${thick ? 24 : 27}" ry="${thick ? 6.5 : 7.5}" fill="#E4DCCF"/>
    ${liquid}
    <path d="M38 50 Q39 74 42 94" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    ${spill ? `<path d="M88 44 q3 10 0 22" stroke="${color || '#C79A6B'}" stroke-width="5" stroke-linecap="round" fill="none" opacity=".85"/>` : ''}
    ${steamLines(steam, 60, 28)}`);
}

function glassSVG({ color = null, level = 0.78, ice = false, foam = null } = {}) {
  const c = gid('g');
  const yl = 104 - level * 80;
  const cube = (x, y, r) => `<g transform="rotate(${r} ${x + 7} ${y + 7})"><rect x="${x}" y="${y}" width="15" height="15" rx="3" fill="rgba(255,255,255,.62)" stroke="#8DB9D0" stroke-width="2"/></g>`;
  return svg(`<defs><clipPath id="${c}"><path d="M37 18 L41 102 Q42 107 60 107 Q78 107 79 102 L83 18 Z"/></clipPath></defs>
    ${SHADOW}
    <g clip-path="url(#${c})">
      ${color ? `<rect x="30" y="${yl}" width="60" height="${110 - yl}" fill="${color}" opacity=".93"/>` : ''}
      ${color && foam ? `<rect x="30" y="${yl - 6}" width="60" height="8" fill="${foam}"/>` : ''}
      ${ice ? `${cube(44, yl - 6, -12)}${cube(60, yl - 2, 10)}${cube(50, yl + 12, 4)}` : ''}
    </g>
    <path d="M37 18 L41 102 Q42 107 60 107 Q78 107 79 102 L83 18" fill="rgba(214,236,248,.3)" stroke="#86A9BD" stroke-width="2.5"/>
    <ellipse cx="60" cy="18" rx="23" ry="5.5" fill="rgba(235,247,255,.55)" stroke="#86A9BD" stroke-width="2.5"/>
    <path d="M45 26 L48 96" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>`);
}

function paperSVG({ steam = 0 } = {}) {
  const g = gid('p');
  return svg(`<defs>${grad(g, ['#FFFFFF', '#F1EEE8', '#CFC8BC'])}</defs>${SHADOW}
    <path d="M36 34 L44 102 Q45 107 60 107 Q75 107 76 102 L84 34 Z" fill="url(#${g})" stroke="#9D958A" stroke-width="2.5"/>
    <path d="M38.6 56 L81.4 56 L79 82 L41 82 Z" fill="#C9A47A" stroke="#A88458" stroke-width="2"/>
    <rect x="32" y="27" width="56" height="9" rx="4" fill="#FAF9F6" stroke="#9D958A" stroke-width="2.5"/>
    <ellipse cx="60" cy="27" rx="25" ry="5" fill="#FFFFFF" stroke="#9D958A" stroke-width="2"/>
    <ellipse cx="69" cy="26" rx="4" ry="1.6" fill="#8C8478"/>
    <path d="M42 40 L47 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
    ${steamLines(steam, 60, 18)}`);
}

function shotSVG({ color = INGREDIENTS.espresso.color, level = 0.8 } = {}) {
  const g = gid('s');
  const c = gid('sc');
  const y = 63 + (1 - level) * 9;
  return svg(`<defs>${grad(g, ['#FFFFFF', '#EDE8E1', '#C5BCAF'])}<clipPath id="${c}"><ellipse cx="60" cy="62" rx="19" ry="5.5"/></clipPath></defs>
    <ellipse cx="60" cy="104" rx="30" ry="5" fill="#3B2A1A" opacity=".16"/>
    <path d="M78 70 C90 70 90 86 76 88" fill="none" stroke="#8C8478" stroke-width="9" stroke-linecap="round"/>
    <path d="M78 70 C90 70 90 86 76 88" fill="none" stroke="url(#${g})" stroke-width="5" stroke-linecap="round"/>
    <path d="M39 62 L43 92 Q44 100 60 100 Q76 100 77 92 L81 62 Z" fill="url(#${g})" stroke="#8C8478" stroke-width="2.5"/>
    <ellipse cx="60" cy="62" rx="21" ry="6.5" fill="#FBF9F5" stroke="#8C8478" stroke-width="2.5"/>
    <ellipse cx="60" cy="62" rx="19" ry="5.5" fill="#E4DCCF"/>
    ${color ? `<g clip-path="url(#${c})"><ellipse cx="60" cy="${y}" rx="19" ry="5.5" fill="${color}"/><ellipse cx="60" cy="${y}" rx="14" ry="3.6" fill="#B87A43"/></g>` : ''}
    <path d="M45 70 Q46 82 48 92" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`);
}

function bottleSVG() {
  const g = gid('b');
  return svg(`<defs>${grad(g, ['#FFFFFF', '#F4F1EA', '#D6D0C4'])}</defs>${SHADOW}
    <path d="M48 24 L72 24 L72 32 Q84 40 84 56 L84 100 Q84 106 78 106 L42 106 Q36 106 36 100 L36 56 Q36 40 48 32 Z" fill="url(#${g})" stroke="#98A3AD" stroke-width="2.5"/>
    <rect x="46" y="14" width="28" height="11" rx="3" fill="#3E7CB1" stroke="#2C5D86" stroke-width="2"/>
    <rect x="44" y="64" width="32" height="22" rx="4" fill="#E3EEF7" stroke="#B9CCDC" stroke-width="1.5"/>
    <path d="M42 58 L42 98" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>`);
}

function kettleSVG() {
  const g = gid('k');
  return svg(`<defs>${grad(g, ['#F4F7F9', '#C9D1D7', '#8D989F'])}</defs>${SHADOW}
    <path d="M38 96 C26 94 20 70 12 48" fill="none" stroke="#7C868D" stroke-width="8" stroke-linecap="round"/>
    <path d="M38 96 C26 94 20 70 12 48" fill="none" stroke="#DDE3E7" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M34 56 Q34 40 60 40 Q86 40 86 56 L88 98 Q88 106 80 106 L40 106 Q32 106 32 98 Z" fill="url(#${g})" stroke="#7C868D" stroke-width="2.5"/>
    <ellipse cx="60" cy="41" rx="20" ry="5" fill="#E8EDF0" stroke="#7C868D" stroke-width="2"/>
    <circle cx="60" cy="34" r="5" fill="#3A2E26"/>
    <path d="M86 52 C104 52 106 84 88 90" fill="none" stroke="#3A2E26" stroke-width="7" stroke-linecap="round"/>
    <path d="M42 56 Q42 80 44 98" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
}

function syrupSVG() {
  const g = gid('y');
  return svg(`<defs>${grad(g, ['#EBC072', '#C98A2E', '#8E5A17'])}</defs>${SHADOW}
    <path d="M42 46 Q42 40 48 38 L72 38 Q78 40 78 46 L78 100 Q78 106 72 106 L48 106 Q42 106 42 100 Z" fill="url(#${g})" stroke="#7A4E14" stroke-width="2.5"/>
    <rect x="52" y="27" width="16" height="12" rx="2" fill="#2F2A26"/>
    <rect x="56" y="13" width="8" height="15" rx="2" fill="#2F2A26"/>
    <path d="M58 15 L37 15 L37 21" fill="none" stroke="#2F2A26" stroke-width="5" stroke-linecap="round"/>
    <path d="M48 50 L48 96" stroke="#FCE7BF" stroke-width="4" stroke-linecap="round" opacity=".75"/>`);
}

function machineSVG({ active = false } = {}) {
  const g = gid('mc');
  return svgBox('0 0 160 120', `<defs>${grad(g, ['#F2F5F7', '#C7CFD5', '#8A949B'])}</defs>
    <ellipse cx="80" cy="112" rx="64" ry="6" fill="#3B2A1A" opacity=".18"/>
    <rect x="22" y="14" width="116" height="94" rx="10" fill="url(#${g})" stroke="#6F7980" stroke-width="2.5"/>
    <rect x="22" y="14" width="116" height="15" rx="7" fill="#B5BEC4" stroke="#6F7980" stroke-width="2"/>
    <rect x="34" y="37" width="40" height="11" rx="3" fill="#2E3438"/>
    <circle cx="96" cy="42" r="5" fill="#2E3438"/><circle cx="112" cy="42" r="5" fill="#2E3438"/>
    <rect x="56" y="56" width="36" height="12" rx="4" fill="#5E676D"/>
    <rect x="62" y="68" width="24" height="7" rx="2" fill="#3A4045"/>
    <path d="M86 71 L118 77" stroke="#7A5232" stroke-width="7" stroke-linecap="round"/>
    <rect x="30" y="94" width="100" height="10" rx="3" fill="#5E676D"/>
    <path d="M129 52 L133 86" stroke="#8A949B" stroke-width="4" stroke-linecap="round"/>
    ${active ? '<path d="M70 77 L70 93 M78 77 L78 93" stroke="#4A2C1B" stroke-width="3" stroke-linecap="round"/>' : ''}
    <path d="M30 22 L30 100" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/>`);
}

function pitcherSVG({ milk = false } = {}) {
  const g = gid('pt');
  return svg(`<defs>${grad(g, ['#F5F7F8', '#C5CDD3', '#87929A'])}</defs>${SHADOW}
    <path d="M84 50 C102 52 102 84 84 88" fill="none" stroke="#6F7980" stroke-width="8" stroke-linecap="round"/>
    <path d="M38 40 L26 32 L46 36 L74 36 L82 40 L86 98 Q86 106 78 106 L42 106 Q34 106 34 98 Z" fill="url(#${g})" stroke="#6F7980" stroke-width="2.5"/>
    <ellipse cx="58" cy="38" rx="23" ry="4.8" fill="${milk ? '#FFFDF8' : '#9BA6AD'}" stroke="#6F7980" stroke-width="2"/>
    <path d="M42 46 L44 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
}

function traySVG() {
  const g = gid('t');
  return svgBox('0 0 160 60', `<defs>${grad(g, ['#E8BE86', '#C08A52', '#9A6634'], true)}</defs>
    <path d="M12 16 L148 16 L156 44 L4 44 Z" fill="url(#${g})" stroke="#7A4E25" stroke-width="2.5"/>
    <path d="M18 20 L142 20" stroke="#F6DAB0" stroke-width="2" opacity=".75"/>`);
}

function hotSVG() {
  return svg(`${SHADOW}<path d="M38 98 L82 98" stroke="#B4532A" stroke-width="5" stroke-linecap="round"/>
    ${[44, 60, 76].map((x) => `<path d="M${x} 88 q-9 -10 0 -20 t0 -20 t0 -20" fill="none" stroke="#E07B45" stroke-width="6" stroke-linecap="round"/>`).join('')}`);
}

function icedSVG() {
  const cube = (x, y, r) => `<g transform="rotate(${r} ${x + 15} ${y + 15})"><rect x="${x}" y="${y}" width="30" height="30" rx="6" fill="#DDF2FC" stroke="#5F9CBE" stroke-width="2.5"/><path d="M${x + 7} ${y + 8} l9 0" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>`;
  return svg(`${SHADOW}${cube(28, 56, -10)}${cube(62, 48, 12)}${cube(45, 74, 4)}`);
}

/** 그림 ID → 임시 그림 (물건 그림 ID 와 같은 이름 + 시트에 없는 것: hot · iced) */
const ART = {
  cup_mug_empty: () => mugSVG(),
  cup_thick: () => mugSVG({ thick: true }),
  cup_paper: () => paperSVG(),
  cup_shot: () => shotSVG(),
  cup_glass_empty: () => glassSVG(),
  cup_glass_ice: () => glassSVG({ color: RECIPES.americano.color, level: 0.74, ice: true }),
  cup_mug_americano: () => mugSVG({ color: RECIPES.americano.color }),
  cup_mug_milk: () => mugSVG({ color: RECIPES.warm_milk.color, foam: RECIPES.warm_milk.foam, foamSize: 0.8 }),
  cup_mug_latte: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam }),
  cup_mug_heart: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam, art: 'heart' }),
  cup_mug_tulip: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam, art: 'heart' }),
  cup_mug_leaf: () => mugSVG({ color: RECIPES.latte.color, foam: RECIPES.latte.foam, art: 'heart' }),
  obj_machine: () => machineSVG(),
  obj_pitcher: () => pitcherSVG(),
  obj_pitcher_milk: () => pitcherSVG({ milk: true }),
  obj_milk_bottle: () => bottleSVG(),
  obj_kettle: () => kettleSVG(),
  obj_syrup: () => syrupSVG(),
  obj_tray: () => traySVG(),
  hot: () => hotSVG(),
  iced: () => icedSVG(),
  obj_ice_bucket: () => iceBucketSVG(),
  obj_recipe_book: () => bookSVG(),
};

/** 얼음 통(그림 파일 obj_ice_bucket 이 오기 전 임시) */
function iceBucketSVG() {
  const g = gid('ib');
  const cube = (x, y, r) => `<g transform="rotate(${r} ${x + 9} ${y + 9})"><rect x="${x}" y="${y}" width="18" height="18" rx="4" fill="#E8F6FD" stroke="#6FA7C6" stroke-width="2"/><path d="M${x + 4} ${y + 5} l6 0" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`;
  return svg(`<defs>${grad(g, ['#F4F7F9', '#C9D1D7', '#8D989F'])}</defs>${SHADOW}
    ${cube(36, 30, -12)}${cube(56, 26, 8)}${cube(70, 34, -4)}${cube(46, 38, 14)}
    <path d="M26 44 L94 44 L88 100 Q87 106 80 106 L40 106 Q33 106 32 100 Z" fill="url(#${g})" stroke="#6F7980" stroke-width="2.5"/>
    <ellipse cx="60" cy="44" rx="34" ry="7" fill="#DDE3E7" stroke="#6F7980" stroke-width="2.5"/>
    <path d="M30 56 L90 56" stroke="#8D989F" stroke-width="2"/>
    <path d="M38 52 L42 98" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>`);
}

/** 레시피 수첩(카운터 위 공책): 가죽 표지 + 책갈피 끈 */
function bookSVG() {
  const g = gid('bk');
  return svg(`<defs>${grad(g, ['#2E6E4C', '#1F5A3B', '#153F29'], true)}</defs>
    <ellipse cx="60" cy="104" rx="46" ry="6" fill="#3B2A1A" opacity=".2"/>
    <path d="M18 70 L64 54 L104 72 L58 92 Z" fill="#F6EEDC" stroke="#8E6C33" stroke-width="2"/>
    <path d="M14 76 L60 96 L60 102 L14 82 Z" fill="url(#${g})" stroke="#0F2E1E" stroke-width="2"/>
    <path d="M60 96 L106 76 L106 82 L60 102 Z" fill="#1A4A31" stroke="#0F2E1E" stroke-width="2"/>
    <path d="M14 76 L60 56 L106 76 L60 96 Z" fill="url(#${g})" stroke="#0F2E1E" stroke-width="2.4"/>
    <path d="M30 76 L60 63 L90 76 L60 89 Z" fill="none" stroke="#D4AE62" stroke-width="1.6" opacity=".9"/>
    <path d="M60 70 l4 4 -4 4 -4 -4 z" fill="#F0D9A2"/>
    <path d="M78 88 L80 104 L84 99 L88 102 L86 86" fill="#D4AE62"/>`);
}

/** 물건 그림 하나: 그림 파일이 있으면 <img>, 없으면 임시 그림. 꾸밈이라 읽어 주지 않음(이름은 글자로 따로) */
function objArt(id, cls = '') {
  const el = h('span', { class: `bw-art ${cls}`.trim(), 'data-art': id || '' });
  if (id && img.has('objects', id)) {
    el.classList.add('is-img');
    el.append(h('img', { src: img.url('objects', id), alt: '', draggable: 'false' }));
  } else {
    el.innerHTML = ART[id]?.() || `<span class="bw-pict">${ICON('cup')}</span>`;
  }
  return el;
}

const cupArtId = (id) => CUPS[id]?.obj || id;
/** 레시피 칸(컵·바탕·더하기·온도)의 그림과 이름 */
const artOf = (k, id, cls = '') => objArt(k === 'cup' ? cupArtId(id) : k === 'temp' ? id : INGREDIENTS[id]?.obj, cls);
const nameOf = (k, id) => (k === 'cup' ? CUPS[id]?.name : k === 'temp' ? TEMPS[id]?.name : INGREDIENTS[id]?.name) || id;

/*
 * 카운터의 물건 자리(카운터 그림 workbench_morning 의 16:9 판에 대한 %): [가운데 x, 아래 끝 bottom, 너비]
 * 크기는 실제 크기 비율(2026-10-31 사용자 의견 "크기를 제대로 반영하지 않아 중구난방"): 머그 높이 10cm = 판 높이의 9.6%를 잣대로,
 * 그림 파일의 가로·세로 비율에서 너비를 셈(머신 36cm · 주전자 17cm · 우유병 22cm · 시럽병 24cm · 종이컵 12cm · 유리컵 13cm).
 * bottom 은 물건 바닥(이름표는 그 아래에 매달림). 카운터 판은 그림 아래에서 12.3%(앞 끝) ~ 32.4%(벽과 만나는 뒤 끝)이고 손 띠가 아래 15%쯤을 가림.
 * 서 있는 물건은 모두 판 위 같은 줄(BACK 25%, 뒤 끝에서 판 깊이의 3분의 1쯤 앞)에, 컵은 왼쪽 나무판 · 우유 · 시럽 · 얼음은 오른쪽 나무판 위에.
 * 수첩은 앞줄(17.5%, 손 띠 바로 위), 받침은 조금 뒤(19.5%)에 넓게. 2026-10-31 사용자 "테이블보다 위쪽에 물건들이 다 놓여있네" ·
 * "컵 놓는 곳을 더 크게 하고 위치도 약간 올려야" · "에스프레소는 살짝 떠 있다"(머신 그림은 아래 빈칸이 다른 물건보다 커서 1.5% 내림)
 */
const BACK = 25;
const FRONT = 17.5;
const HOT_POS = {
  book: [6.2, FRONT, 9],
  mat: [40.5, 19.5, 13.5],
  espresso: [55.5, BACK - 1.5, 16.8],
  water: [71, BACK, 12.4],
  milk: [81, BACK, 5.4],
  syrup: [86, BACK, 4.9],
  iced: [92.5, BACK, 8.5],
};
const CUP_ROW = { x: 15, step: 5.6, bottom: BACK };
const CUP_W = { mug: 4.84, thick: 4.95, paper: 4.38, glass: 4.27, shot: 3.7 };
const BOARD_BOTTLES = [77, 98]; // 오른쪽 나무판(왼쪽 끝 · 오른쪽 끝 %)
/** 재료를 꺼내는 물건(수첩 · 넣은 것 칸의 그림은 menu.js 의 obj 그대로): 에스프레소는 머신, 물은 주전자 */
const HOT_ART = { espresso: 'obj_machine', milk: 'obj_milk_bottle', water: 'obj_kettle', syrup: 'obj_syrup', iced: 'obj_ice_bucket' };
const hotStyle = ([x, b, w]) => ({ left: `${x}%`, bottom: `${b}%`, width: `${w}%` });

/**
 * 음료 모양(임시 그림): 재료 → 색, 손 기술 결과 → 진하기·양·거품·김·넘침
 * soFar: 만드는 도중(지금까지 넣은 재료) · res.checks: 손 기술 결과
 */
function drinkSpec(made, res = {}, soFar = null) {
  const ings = soFar || new Set([made.base, ...made.adds]);
  const has = (x) => ings.has(x);
  const zone = (s) => res.checks?.find((c) => c.skill === s)?.zone || 'good';
  let color = null;
  if (has('espresso') && has('milk')) color = RECIPES.latte.color;
  else if (has('espresso') && has('water')) color = RECIPES.americano.color;
  else if (has('espresso')) color = INGREDIENTS.espresso.color;
  else if (has('milk')) color = INGREDIENTS.milk.color;
  else if (has('water')) color = INGREDIENTS.water.color;
  else if (has('syrup')) color = INGREDIENTS.syrup.color;
  if (color && has('espresso')) {
    if (zone('extract') === 'low') color = mix(color, '#E3C9A2', 0.38);
    if (zone('extract') === 'high') color = mix(color, '#140A04', 0.4);
  }
  if (color && has('syrup') && ings.size > 1) color = mix(color, INGREDIENTS.syrup.color, 0.2);
  let level = !color ? 0 : has('water') || has('milk') ? 0.86 : 0.42;
  if (has('milk') && zone('pour') === 'low') level = 0.58;
  const hot = made.temp === 'hot';
  const foam = has('milk') && hot ? (has('espresso') ? RECIPES.latte.foam : RECIPES.warm_milk.foam) : null;
  const foamSize = { low: 0.5, good: 0.9, high: 1.18 }[zone('foam')];
  const steam = !color || !hot ? 0 : has('milk') ? { low: 0, good: 2, high: 3 }[zone('steam')] : 2;
  return { cup: made.cup, color, level, foam, foamSize, art: res.art || null, ice: made.temp === 'iced', steam, spill: has('milk') && zone('pour') === 'high' };
}

function drinkSVG(s) {
  if (s.cup === 'glass') return glassSVG({ color: s.color, level: s.level, ice: s.ice, foam: s.foam });
  if (s.cup === 'paper') return paperSVG({ steam: s.steam });
  return mugSVG({ color: s.color, level: s.level, foam: s.foam, foamSize: s.foamSize, art: s.art, steam: s.steam, spill: s.spill, thick: s.cup === 'thick' });
}

/** 음료 그림: 다 만든 아는 메뉴는 그림 파일(있으면) + 김·넘침 표시, 아니면 임시 그림 */
function drinkArt(made, res = {}, soFar = null, cls = '') {
  const spec = drinkSpec(made, res, soFar);
  const menu = soFar ? null : findMenu(made);
  const r = menu ? RECIPES[menu] : null;
  const look = r ? (res.art && r.art?.[res.art]) || r.look?.[made.cup] : null;
  if (look && img.has('objects', look)) {
    const el = objArt(look, `bw-drink ${cls}`);
    if (spec.spill) el.append(h('i', { class: 'bw-spill', 'aria-hidden': 'true' }));
    if (spec.steam) el.append(h('i', { class: `bw-wisp n${spec.steam}`, 'aria-hidden': 'true' }));
    return el;
  }
  // 만드는 도중: 빈 컵이거나 컵 그림 파일이 있으면 그 컵(만드는 중의 그림은 시트에 없어 그림체를 섞지 않음)
  if (soFar && (!spec.color || img.has('objects', cupArtId(made.cup)))) return objArt(cupArtId(made.cup), `bw-drink ${cls}`);
  const el = h('span', { class: `bw-art bw-drink ${cls}`.trim(), 'data-art': 'drink' });
  el.innerHTML = drinkSVG(spec);
  return el;
}

/* ================================================================== */
/* 레시피 수첩: 작업대 안의 [레시피 수첩]과 위쪽 띠·멈춤의 [레시피]가 같은 칸을 씀  */
/* ================================================================== */
const bookPart = (k, art, name) => h('span', { class: 'bk-part' }, h('small', { text: k }), art, h('em', { text: name }));

/** 메뉴 한 줄(그림 · 컵 · 바탕 · 더하기 · 온도 · 손 기술). 누르면 읽어 줌 */
function bookRow(id, level) {
  const r = RECIPES[id];
  const skills = r.skills.filter((s) => skillInLevel(s, level));
  const b = h('button', { class: 'bk-row', 'aria-label': recipeSpeech(id) },
    h('span', { class: 'bk-pic' }, objArt(r.look?.mug || r.look?.[r.cup], 'bk-drink')),
    h('span', { class: 'bk-main' },
      h('b', { class: 'bk-name', text: r.name }),
      h('span', { class: 'bk-parts' },
        bookPart(STEP_NAMES.cup, artOf('cup', r.cup, 'small'), CUPS[r.cup].name),
        bookPart(STEP_NAMES.base, artOf('base', r.base, 'small'), INGREDIENTS[r.base].name),
        ...(r.adds.length ? r.adds.map((a) => bookPart(STEP_NAMES.adds, artOf('adds', a, 'small'), INGREDIENTS[a].name)) : [bookPart(STEP_NAMES.adds, h('span', { class: 'bw-art small bk-none', text: '−' }), '없음')]),
        bookPart(STEP_NAMES.temp, artOf('temp', r.temp, 'small'), TEMPS[r.temp].name)),
      h('span', { class: 'bk-skills' }, h('small', { text: '손 기술' }), ...skills.map((s) => h('em', { text: HAND_SKILLS[s].name })))));
  b.addEventListener('click', (e) => { e.stopPropagation(); audio.sfx('tap'); tts.speak(recipeSpeech(id), 'sys', { force: true }); });
  return b;
}

/** 수첩 한 장(두 쪽): rows = bookRow 들, close = [다 봤어요] 단추 */
function bookSheet(rows, close) {
  return h('section', { class: 'ov ov-brew-book', role: 'dialog', 'aria-label': '레시피 수첩' },
    h('div', { class: 'bk-card' },
      h('header', { class: 'bk-head' }, h('i', { class: 'bk-ico', html: ICON('book') }), h('div', {}, h('h2', { text: '레시피 수첩' }), h('p', { text: '메뉴를 누르면 읽어 줘요.' })), close),
      h('div', { class: 'bk-pages' }, ...rows)));
}

let looseBook = null; // 작업대 밖에서 연 수첩 { el, off }

/**
 * 위쪽 띠·멈춤 메뉴의 [레시피](2026-10-28, '숨 고르기' 대신): 이야기 어디서나 여는 레시피 수첩(읽기만, 보통 단계의 손 기술).
 * 작업대가 열려 있으면 작업대 안의 [레시피 수첩]을 눌러 그쪽 수첩을 엶(띠가 멈추도록)
 */
export function showRecipeBook() {
  const inBrew = document.querySelector('.mg-brew .bw-book-btn');
  if (inBrew) { if (!inBrew.disabled) inBrew.click(); return; }
  if (looseBook?.el.isConnected) return;
  looseBook?.off(); // 되감기·나가기(ov.clearAll)로 지워진 수첩의 뒷정리
  const focusBack = document.activeElement;
  const close = h('button', { class: 'btn btn-big btn-main bk-close' }, h('i', { html: ICON('check') }), h('span', { text: '다 봤어요' }));
  const el = bookSheet(STARTER_BOOK.filter((id) => RECIPES[id]).map((id) => bookRow(id, 'normal')), close);
  const done = () => {
    off();
    if (looseBook?.el === el) looseBook = null;
    if (!el.isConnected) return; // 이미 지워짐: 소리·초점 없이
    input.popScope(el);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(200));
    tts.stop();
    audio.sfx('close');
    if (focusBack?.isConnected) setTimeout(() => focusBack.focus({ preventScroll: true }), 40);
  };
  const off = bus.on('escape', done);
  looseBook = { el, off };
  close.addEventListener('click', (e) => { e.stopPropagation(); done(); });
  document.getElementById('layer-overlay').append(el);
  input.pushScope(el);
  requestAnimationFrame(() => el.classList.add('is-in'));
  audio.sfx('page');
  tts.speak(SYS.book, 'sys');
  setTimeout(() => { if (close.isConnected) close.focus({ preventScroll: true }); }, 40);
}

/* ================================================================== */
/* 미니게임                                                             */
/* ================================================================== */
/*
 * 동작마다 한 컷(Q-R9, docs/recipes.md 6.1): 블렌더로 미리 렌더한 장면(배경판) + 띠 값에 맞는 프레임(assets/shots/)
 * shots.json: { 손 기술 id: { size: [W, H], rect: [x, y, w, h](프레임 자리), levels(단계 수) } } · tools/blender/shots_post.py 가 만듦
 * 그림(images.json 'shots'): {id}_plate · {id}_l00…(줄기·김 없음) · {id}_s00…(있음: 누르는 동안 · [보기] · [한 칸] 직후). 컷이 없는 손 기술은 물건 그림으로
 */
const shotsP = typeof window === 'undefined' ? Promise.resolve({})
  : fetch('./assets/shots/shots.json', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : {})).catch(() => ({}));

export async function brew(opts = {}) {
  const t0 = performance.now();
  const gen = abortGeneration(); // 이 번호가 바뀌면 도중에 정리된 것: 남은 손님 말·버튼 없이 끝냄
  const stopped = () => abortGeneration() !== gen;
  const shots = await shotsP; // 보통 앱을 켤 때 이미 받아 둠
  if (stopped()) return { ok: false, aborted: true, attempts: 0, mistakes: 0, ms: 0 };
  const orders = ordersOf(opts);
  const level = levelOf(opts);
  const book = bookOf(opts);
  const pantry = pantryOf(opts);
  const title = opts.title || TITLE;
  const debug = isDebug();

  const f = frame({ title, instruction: HOWTO, icon: 'coffee', cls: 'mg-brew', speech: speechOf(opts), quit: Boolean(opts.quit) });
  document.body.classList.add('brew-open');

  /* ---- 기록 ---- */
  const R = { attempts: 0, mistakes: 0, remakes: 0, kept: 0, watched: 0, art: 0, made: [], skills: {} };
  const result = (extra = {}) => ({
    ok: !extra.aborted && !extra.quit,
    attempts: 1, served: R.attempts, mistakes: R.mistakes, remakes: R.remakes, kept: R.kept, // runner 의 별·선생님 화면의 되감기는 attempts 로 셈
    ms: performance.now() - t0, made: [...R.made], watched: R.watched, skills: R.skills, art: R.art,
    level, turn: pace().turn, ...extra,
  });

  /* ---- 도중 정리(되감기·나가기·[그만하기]) ---- */
  const STOP = Symbol('stop');
  let abortRes;
  const abortP = new Promise((r) => { abortRes = r; });
  /** 기다리기: 정리되면 STOP 을 던져 남은 일(손님 말·다음 장면)을 하지 않음 */
  const w = async (p) => {
    const r = await Promise.race([p, abortP]);
    if (r === STOP || stopped()) throw STOP;
    return r;
  };
  let over = false;
  let cleaned = false;
  let quitted = false;
  let curLoop = null;
  let talkNo = 0;
  let doneRes;
  const doneP = new Promise((r) => { doneRes = r; });
  const offQuit = opts.quit ? bus.on('mg:quit', () => { quitted = true; abortMinigame(); }) : null;

  /* ---- 화면: 손님 창 ---- */
  const btn = (icon, label, cls = '') => h('button', { class: `btn ${cls}`.trim() }, h('i', { html: icon.startsWith('<svg') ? icon : ICON(icon) }), h('span', { text: label }));
  const onTap = (el, fn) => el?.addEventListener('click', (e) => { e.stopPropagation(); fn(e); });
  const waitTap = (...els) => new Promise((resolve) => els.forEach((b, i) => b?.addEventListener('click', (e) => { e.stopPropagation(); resolve(i); }, { once: true })));
  const focusLater = (el) => setTimeout(() => { if (el?.isConnected && !el.disabled) el.focus({ preventScroll: true }); }, 40);

  const faceEl = h('div', { class: 'bw-face', 'aria-hidden': 'true' });
  const nameEl = h('p', { class: 'bw-name' });
  const orderText = h('p', { class: 'bw-order-text' });
  const relisten = btn('volume', '다시 듣기', 'btn-soft bw-relisten');
  const reactText = h('p', { class: 'bw-react-text' });
  const reactSay = h('button', { class: 'bw-ico-btn', 'aria-label': '손님 말 다시 듣기', html: ICON('volume') });
  const reactEl = h('div', { class: 'bw-react is-hidden', role: 'status' }, reactText, reactSay);
  const progress = h('div', { class: 'bw-progress', 'aria-hidden': 'true' });
  const progressText = h('p', { class: 'bw-progress-text' });
  // 레시피 수첩: 카운터 왼쪽 끝에 놓인 공책(누르면 열림). showRecipeBook() 이 .bw-book-btn 을 찾음
  const bookBtn = h('button', { class: 'bw-hot bw-book-btn', 'aria-label': '레시피 수첩 보기', style: hotStyle(HOT_POS.book) },
    objArt('obj_recipe_book'), h('span', { class: 'bw-hot-name', text: '레시피 수첩' }));
  const guest = h('aside', { class: 'bw-guest', 'aria-label': '손님' },
    faceEl,
    h('div', { class: 'bw-talk' },
      nameEl,
      h('div', { class: 'bw-order' }, orderText, relisten),
      reactEl,
      h('div', { class: 'bw-queue' }, progressText, progress)));

  /* ---- 화면: 카운터 한 장면(포인트 앤 클릭, 2026-10-31 사용자 의견) ----
   * set: 16:9 카운터 그림(workbench_morning)을 칸에 꽉 채우고, 그 위에 물건(누르는 단추)을 그림과 같은 자리에 놓음
   * mat: 가운데 받침(고른 컵 + 넣은 재료) · panel: 아래 '손' 띠(넣은 것 · 할 일 · 단추). 손 기술 때는 한 컷이 장면을 덮음 */
  const spots = { left: h('div', { class: 'bw-spot s-left' }), center: h('div', { class: 'bw-spot s-center' }), right: h('div', { class: 'bw-spot s-right' }) };
  const tube = h('div', { class: 'bw-tube is-hidden' }, h('i', { class: 'bw-tube-zone' }), h('i', { class: 'bw-tube-fill' }));
  const hots = h('div', { class: 'bw-hots', role: 'group', 'aria-label': '카운터의 물건' });
  const mat = h('div', { class: 'bw-mat', 'aria-hidden': 'true', style: hotStyle(HOT_POS.mat) });
  // 나무판(꾸밈): 컵 줄 아래 · 우유 · 시럽 · 얼음 아래. 물건이 같은 줄에 정돈되어 보이게
  const cupEnds = [CUP_ROW.x - 3.4, CUP_ROW.x + (pantry.cups.length - 1) * CUP_ROW.step + 3.4];
  const board = ([a, b]) => h('i', { class: 'bw-board', style: { left: `${a}%`, width: `${b - a}%`, bottom: `${BACK - 1.2}%` } }); // 물건 바닥이 판 윗면 가운데에
  const boards = h('div', { class: 'bw-boards', 'aria-hidden': 'true' }, board(cupEnds), pantry.temps.includes('iced') || pantry.adds.includes('syrup') ? board(BOARD_BOTTLES) : null);
  const set = h('div', { class: 'bw-set' }, boards, mat, hots, bookBtn);
  const scene = h('div', { class: 'bw-scene' }, set, spots.left, spots.center, tube, spots.right);
  const panel = h('div', { class: 'bw-panel' });
  const bench = h('section', { class: 'bw-bench', 'aria-label': '작업대' }, scene, guest, panel);
  if (img.has('bg', 'workbench_morning')) set.style.backgroundImage = `url('${img.url('bg', 'workbench_morning')}')`;
  f.body.append(bench);

  /* ---- 상태 ---- */
  let cur = null;          // 지금 손님(주문)
  let curIndex = 0;
  let phase = 'busy';      // recipe · gate · skill · serve · wrong · mild · good · busy (자동 플레이가 봄)
  const warmTemp = pantry.temps.includes('hot') ? 'hot' : pantry.temps[0];
  let made = { cup: null, base: null, adds: [], temp: warmTemp };
  let ings = [];           // 컵에 넣을 재료(누른 차례). 바탕·더하기는 arrange() 가 레시피에 맞춰 나눔
  let recipeDone = null;   // [만들기 시작] → 고른 레시피
  let armed = null;        // '두 번 눌러 고르기': 한 번 눌러 읽어 준 버튼
  let safetySaid = false;
  const ui = {};           // 자동 플레이가 누를 버튼

  /* ---- 읽어 주기: 여러 말을 차례로(새 말이 오면 앞의 차례는 그만) ---- */
  const sysV = (t) => [t, 'sys'];
  const guestV = (t) => [t, voiceOf(cur?.who, 'say')];
  let talking = Promise.resolve(); // 지금 읽는 한 문장
  async function talk(...parts) {
    const my = (talkNo += 1);
    for (const p of parts) {
      if (!p || !p[0]) continue;
      if (my !== talkNo || stopped() || over) return;
      talking = tts.speak(p[0], p[1]);
      await talking;
    }
  }
  /** 게임이 스스로 다음 단계로 넘어갈 때: 지금 읽는 한 문장(손 기술 결과 등)은 끝까지 듣고 시작. 학생이 누른 것에 답할 때는 talk(2026-10-31 고침: 결과 말이 다음 안내에 잘림) */
  async function talkAfter(...parts) {
    const my = (talkNo += 1);
    await talking;
    if (my !== talkNo || stopped() || over) return;
    await talk(...parts);
  }
  const sayBtn = (text, voice = 'sys') => {
    const b = h('button', { class: 'bw-ico-btn', 'aria-label': '다시 듣기', html: ICON('volume') });
    onTap(b, () => tts.speak(text, voice, { force: true }));
    return b;
  };
  /** 할 일 한 줄: 번호 · 글 · [다시 듣기](say: 읽어 줄 말, null 이면 버튼 없음) */
  const askRow = (badge, text, { say = text } = {}) => h('div', { class: 'bw-ask' },
    badge ? h('b', { class: 'bw-ask-n', text: badge }) : null,
    h('p', { class: 'bw-ask-t', text }),
    say ? sayBtn(say) : null);
  const setPanel = (...kids) => { panel.replaceChildren(...kids.filter(Boolean)); panel.dataset.kind = ''; };
  /** 결과를 읽을 시간(움직임 줄이기와 상관없이 그대로. dur() 는 애니메이션 시간에만) */
  const pauseMs = (ms) => sleep(robot ? Math.max(60, ms / 4) : ms);

  /* ---- 손님 창 ---- */
  function showGuest(face = 'normal') {
    const c = CHARS[cur.who];
    faceEl.innerHTML = c ? faceHTML(cur.who, face) : `<span class="bw-face-blank">${ICON('smile')}</span>`;
    faceEl.style.setProperty('--accent', c?.color || '#7D7D86');
    nameEl.textContent = c?.name || '손님';
  }
  function setReact(text) {
    reactText.textContent = text || '';
    reactEl.classList.toggle('is-hidden', !text);
  }
  function showProgress() {
    progressText.textContent = orders.length > 1 ? `손님 ${curIndex + 1} / ${orders.length}` : '손님';
    progress.replaceChildren(...orders.map((_, i) => h('i', { class: i < curIndex ? 'done' : i === curIndex ? 'now' : '', html: ICON('coffee') })));
  }
  onTap(relisten, () => tts.speak(cur.say, voiceOf(cur.who, 'say'), { force: true }));
  onTap(reactSay, () => tts.speak(reactText.textContent, voiceOf(cur.who, 'say'), { force: true }));

  /* ---- 레시피 수첩(오픈북): 열려 있는 동안 띠가 멈춤 ---- */
  let bookEl = null;
  let offEsc = null;
  let focusBack = null;
  function openBook() {
    if (bookEl || over) return;
    focusBack = document.activeElement;
    const close = btn('check', '다 봤어요', 'btn-big btn-main bk-close');
    bookEl = bookSheet(book.map((id) => bookRow(id, level)), close);
    document.getElementById('layer-overlay').append(bookEl);
    input.pushScope(bookEl);
    const el = bookEl;
    requestAnimationFrame(() => el.classList.add('is-in'));
    audio.sfx('page');
    tts.speak(SYS.book, 'sys');
    onTap(close, () => closeBook());
    offEsc = bus.on('escape', () => closeBook());
    focusLater(close);
  }
  function closeBook(silent = false) {
    if (!bookEl) return;
    const el = bookEl;
    bookEl = null;
    offEsc?.();
    offEsc = null;
    input.popScope(el);
    el.classList.remove('is-in');
    el.classList.add('is-out');
    setTimeout(() => el.remove(), dur(200));
    if (silent) return;
    tts.stop();
    audio.sfx('close');
    focusLater(focusBack?.isConnected ? focusBack : bookBtn);
  }
  onTap(bookBtn, openBook);

  /* ---- 작업대: 손 기술의 한 컷(있으면) ---- */
  /**
   * 배경판을 작업대 칸에 꽉 채우고(cover), 띠 값에 맞는 프레임을 그 자리에 겹침. 컷 그림이 없으면 null(물건 그림으로)
   * shots.json 의 plate: 다른 컷과 같은 배경판(붓기 두 가지) · art: 라테아트 프레임이 있는 단계
   */
  function shotView(id) {
    const m = shots[id];
    const plateId = m?.plate || `${id}_plate`;
    if (!m || !img.has('shots', plateId)) return null;
    const [W, H] = m.size;
    const [x, y, rw, rh] = m.rect;
    const nn = (k) => String(k).padStart(2, '0');
    const urls = { l: [], s: [], a: [] };
    for (let k = 0; k < m.levels; k++) {
      for (const kind of ['l', 's']) urls[kind].push(img.url('shots', `${id}_${kind}${nn(k)}`));
    }
    for (const k of m.art || []) urls.a[k] = img.url('shots', `${id}_a${nn(k)}`);
    const pct = (a, b) => `${(a / b) * 100}%`;
    const frameEl = h('img', { class: 'bw-shot-frame', alt: '', draggable: 'false', style: { left: pct(x, W), top: pct(y, H), width: pct(rw, W), height: pct(rh, H) } });
    const box = h('div', { class: 'bw-shot-box' }, h('img', { class: 'bw-shot-plate', src: img.url('shots', plateId), alt: '', draggable: 'false' }), frameEl);
    const el = h('div', { class: 'bw-shot', 'data-shot': id }, box);
    let keep = [...urls.l, ...urls.s, ...urls.a].filter(Boolean).map((u) => Object.assign(new Image(), { src: u })); // 바뀔 때 깜빡이지 않게 미리 받기
    const fit = () => { // 칸 크기가 조금 달라져도(아래 손 띠의 높이에 따라) 빈틈 없이
      const s = Math.max(el.clientWidth / W, el.clientHeight / H) || 1;
      box.style.width = `${W * s}px`;
      box.style.height = `${H * s}px`;
    };
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    let last = '';
    return {
      el,
      start() { fit(); ro?.observe(el); },
      /** v: 띠 값 0~1 · flow: 줄기(누르는 동안 · [보기]로 차는 동안 · [한 칸] 바로 뒤) · art: 라테아트(가장 가까운 단계의 그림) */
      set(v, flow, art = false) {
        const k = Math.max(0, Math.min(m.levels - 1, Math.round(v * (m.levels - 1))));
        const ka = art && m.art?.length ? m.art.reduce((b, a) => (Math.abs(a - k) < Math.abs(b - k) ? a : b), m.art[0]) : -1;
        const u = ka >= 0 ? urls.a[ka] : (flow ? urls.s : urls.l)[k];
        if (u && u !== last) {
          frameEl.src = u;
          last = u;
        }
      },
      stop() { ro?.disconnect(); keep = []; },
    };
  }

  /* ---- 작업대 물건 ---- */
  let curShot = null;
  let closeEl = null; // 손 기술의 확대 창(그 손 기술이 끝나도 다음 단계까지 남음)
  function closeUpOff() {
    if (!closeEl) return;
    closeEl.remove();
    closeEl = null;
    bench.classList.remove('is-close');
  }
  /** host: 한 컷을 넣을 곳(확대 창 안). keep: 확대 창을 그대로 둠(손 기술 안에서 부를 때) */
  function setScene({ left = null, center = null, right = null, mode = '', tubeFor = null, shot = null, host = null, keep = false } = {}) {
    if (!keep) closeUpOff();
    spots.left.replaceChildren(...[left].flat().filter(Boolean));
    spots.center.replaceChildren(...[center].flat().filter(Boolean));
    spots.right.replaceChildren(...[right].flat().filter(Boolean));
    if (curShot !== shot) {
      curShot?.stop();
      curShot?.el.remove();
      curShot = shot;
      if (shot) {
        (host || scene).append(shot.el);
        shot.start();
      }
    }
    scene.classList.toggle('is-shot', Boolean(shot) && !host);
    scene.dataset.mode = mode;
    tube.classList.toggle('is-hidden', !tubeFor);
    if (tubeFor) {
      const sk = HAND_SKILLS[tubeFor];
      tube.className = `bw-tube t-${tubeFor}`;
      tube.style.setProperty('--z0', sk.zone[0]);
      tube.style.setProperty('--z1', sk.zone[1]);
    }
  }
  /* ---- 레시피 고르기: 카운터의 물건을 눌러 담기(포인트 앤 클릭, 2026-10-31) ----
   * 컵을 누르면 가운데 받침에 놓이고(다른 컵이면 바꿈, 같은 컵이면 제자리로), 재료 물건을 누르면 컵에 넣을 것에 들어감(다시 누르면 뺌).
   * 얼음 통을 누르면 차갑게(다시 누르면 따뜻하게). 컵과 재료 하나가 있으면 [만들기 시작]. 차례는 자유롭고, 바탕·더하기는 arrange() 가 나눔 */
  const ingList = () => [...new Set([...pantry.bases, ...pantry.adds])];
  /** 넣은 재료(차례 상관없이)를 바탕·더하기로: 주문 레시피 → 다른 레시피 → 바탕이 될 수 있는 첫 재료 */
  function arrange() {
    const fits = (r) => (r && sameSet([r.base, ...r.adds], ings) ? r : null);
    const r = fits(orderTarget(cur)) || Object.values(RECIPES).map(fits).find(Boolean);
    if (r) {
      made.base = r.base;
      made.adds = [...r.adds];
      return;
    }
    made.base = ings.find((id) => INGREDIENTS[id].roles.includes('base')) || null;
    made.adds = ings.filter((id) => id !== made.base);
  }
  const ready = () => Boolean(made.cup && ings.length);
  const promptNow = () => (!made.cup ? PROMPT.cup : !ings.length ? PROMPT.base : PROMPT.adds);

  /** 물건 단추 하나: 그림 + 이름(늘 보임) + 고른 표시 */
  function hotBtn(key, art, name, pos, on, cls = '') {
    const b = h('button', {
      class: `bw-hot ${cls} ${on ? 'is-on' : ''}`.trim(), 'data-hot': key, style: hotStyle(pos),
      'aria-pressed': String(on), 'aria-label': `${name}${on ? ', 골랐어요' : ''}`,
    }, objArt(art), h('span', { class: 'bw-hot-name', text: name }), on ? h('i', { class: 'bw-hot-on', html: ICON('check') }) : null);
    return b;
  }

  function renderHots() {
    const map = new Map();
    const kids = [];
    pantry.cups.forEach((id, i) => {
      const onMat = made.cup === id;
      const b = hotBtn(`cup:${id}`, cupArtId(id), CUPS[id].name, [CUP_ROW.x + i * CUP_ROW.step, CUP_ROW.bottom, CUP_W[id] || 4.8], onMat, `is-cup${onMat ? ' is-away' : ''}`);
      onTap(b, () => press(b, CUPS[id].name, () => pickCup(id)));
      map.set(`cup:${id}`, b);
      kids.push(b);
    });
    for (const id of ingList()) {
      const pos = HOT_POS[id];
      if (!pos) continue;
      const on = ings.includes(id);
      const b = hotBtn(`ing:${id}`, HOT_ART[id] || INGREDIENTS[id].obj, INGREDIENTS[id].name, pos, on, id === 'espresso' ? 'is-machine' : '');
      onTap(b, () => press(b, INGREDIENTS[id].name, () => pickIng(id)));
      map.set(`ing:${id}`, b);
      kids.push(b);
    }
    if (pantry.temps.includes('iced')) {
      const on = made.temp === 'iced';
      const b = hotBtn('temp:iced', HOT_ART.iced, '얼음', HOT_POS.iced, on);
      onTap(b, () => press(b, '얼음', () => pickIce()));
      map.set('temp:iced', b);
      kids.push(b);
    }
    hots.replaceChildren(...kids);
    ui.hot = map;
    // 가운데 받침: 고른 컵 + 넣을 재료(작게)
    mat.replaceChildren(...[ // replaceChildren 은 null 을 글자 'null' 로 넣음
      made.cup ? Object.assign(objArt(cupArtId(made.cup), 'bw-mat-cup'), { style: `width: ${((CUP_W[made.cup] || 4.8) * 1.1 / HOT_POS.mat[2]) * 100}%` }) : h('span', { class: 'bw-mat-empty', text: '컵을 놓는 곳' }),
      ings.length || made.temp === 'iced' ? h('span', { class: 'bw-mat-ings' }, ...ings.map((id) => objArt(INGREDIENTS[id].obj, 'small')), made.temp === 'iced' ? objArt('iced', 'small') : null) : null,
    ].filter(Boolean));
  }

  /** 아래 '손' 띠: 할 일 · 넣은 것(누르면 뺌) · [처음부터 다시] · [만들기 시작]. hint: 손님이 다시 보라고 한 곳 · lock: 보기만 */
  function handRow({ hint = [], lock = false } = {}) {
    const chip = (label, art, onClick, isHint) => {
      const b = h('button', { class: `bw-chip ${isHint ? 'is-hint' : ''}`.trim(), disabled: lock, 'aria-label': `${label}${lock ? '' : ', 누르면 빼요'}` },
        art, h('em', { text: label }), isHint ? h('span', { class: 'bw-chip-hint', text: '다시 봐요' }) : null);
      if (!lock) onTap(b, onClick);
      return b;
    };
    const slots = [];
    slots.push(made.cup ? chip(CUPS[made.cup].name, objArt(cupArtId(made.cup), 'small'), () => pickCup(made.cup), hint.includes('cup'))
      : h('span', { class: `bw-chip is-empty ${hint.includes('cup') ? 'is-hint' : ''}`.trim() }, h('i', { html: ICON('cup') }), h('em', { text: '컵' })));
    const ingHint = hint.includes('base') || hint.includes('adds');
    for (const id of ings) slots.push(chip(INGREDIENTS[id].name, objArt(INGREDIENTS[id].obj, 'small'), () => pickIng(id), ingHint));
    if (!ings.length) slots.push(h('span', { class: `bw-chip is-empty ${ingHint ? 'is-hint' : ''}`.trim() }, h('i', { html: ICON('milk') }), h('em', { text: '재료' })));
    ui.tempChip = null;
    if (pantry.temps.length > 1) {
      // 온도: 누르면 따뜻하게 · 차갑게를 고르는 작은 창(openTemp)
      const t = made.temp;
      const isHint = hint.includes('temp');
      const b = h('button', {
        class: `bw-chip is-temp t-${t}${isHint ? ' is-hint' : ''}`, disabled: lock, 'aria-haspopup': 'dialog',
        'aria-label': `${TEMPS[t]?.name || ''}${lock ? '' : ', 누르면 온도를 골라요'}`,
      }, t === 'iced' ? objArt('iced', 'small') : h('i', { html: ICON(TEMPS[t]?.icon || 'coffee') }), h('em', { text: TEMPS[t]?.name || '' }),
      isHint ? h('span', { class: 'bw-chip-hint', text: '다시 봐요' }) : null);
      if (!lock) onTap(b, () => openTemp(b));
      ui.tempChip = b;
      slots.push(b);
    }
    return h('div', { class: 'bw-hand', role: 'group', 'aria-label': '컵에 넣을 것' }, ...slots);
  }

  function renderRecipe() {
    renderHots();
    const foot = [];
    if (made.cup || ings.length || made.temp !== warmTemp) {
      const reset = btn('repeat', '처음부터 다시', 'btn-soft bw-reset');
      onTap(reset, resetRecipe);
      ui.reset = reset;
      foot.push(reset);
    } else ui.reset = null;
    const go = btn('play', '만들기 시작', 'btn-big btn-main bw-make');
    go.disabled = !ready();
    onTap(go, () => {
      if (phase !== 'recipe' || !recipeDone || !ready()) return;
      audio.sfx('tap');
      arrange();
      const r = recipeDone;
      recipeDone = null;
      phase = 'busy';
      r({ ...made, adds: [...made.adds] });
    });
    ui.make = go;
    foot.push(go);
    setPanel(askRow('', promptNow()), handRow(), h('div', { class: 'bw-row' }, ...foot));
    panel.dataset.kind = 'hand';
  }

  /** '두 번 눌러 고르기' 설정이면 처음 누를 때 이름만 읽어 줌 */
  function press(b, label, fn) {
    if (phase !== 'recipe') return;
    if (store.settings().selectMode === 'two' && armed !== b) {
      armed?.classList.remove('is-armed');
      armed = b;
      b.classList.add('is-armed');
      audio.sfx('focus');
      talk(sysV(label));
      return;
    }
    armed?.classList.remove('is-armed');
    armed = null;
    fn();
  }

  /** 다시 그린 뒤 같은 물건에 초점(키보드·스캔이 자리를 잃지 않게) */
  function keepFocus(key) {
    renderRecipe();
    focusLater(ui.hot.get(key) || (ready() ? ui.make : null));
  }

  function pickCup(id) {
    if (phase !== 'recipe') return;
    const back = made.cup === id;
    made.cup = back ? null : id;
    audio.sfx(back ? 'tap' : 'clink');
    keepFocus(`cup:${id}`);
    if (!back) talk(sysV(CUPS[id].name), sysV(promptNow()));
  }

  function pickIng(id) {
    if (phase !== 'recipe') return;
    const i = ings.indexOf(id);
    if (i >= 0) {
      ings.splice(i, 1);
      audio.sfx('tap');
    } else if (ings.length >= 1 + MAX_ADDS) {
      audio.sfx('tap');
      talk(sysV(SYS.full));
      return;
    } else {
      ings.push(id);
      audio.sfx('pickup');
      talk(sysV(INGREDIENTS[id].name), ings.length === 1 && made.cup ? sysV(PROMPT.adds) : null);
    }
    keepFocus(`ing:${id}`);
  }

  function pickIce() {
    if (phase !== 'recipe') return;
    made.temp = made.temp === 'iced' ? warmTemp : 'iced';
    audio.sfx(made.temp === 'iced' ? 'ice' : 'tap');
    keepFocus('temp:iced');
    talk(sysV(TEMPS[made.temp].name));
  }

  /* ---- 온도 고르기 창(2026-10-31 사용자 "따뜻하게 버튼을 누르면 팝업이 뜨면서 따뜻하게와 차갑게를 고를 수 있게") ----
   * 손 띠의 온도 칩 바로 위에 뜸. 카운터의 얼음을 눌러도 차갑게(같은 값). 창 밖을 누르거나 Esc 면 바꾸지 않고 닫음 */
  let tempEl = null;
  let offTempEsc = null;
  function openTemp(anchor) {
    if (phase !== 'recipe' || tempEl || over) return;
    armed?.classList.remove('is-armed');
    armed = null;
    const opts = pantry.temps.map((t) => {
      const on = made.temp === t;
      const b = h('button', { class: `bw-temp-opt t-${t}${on ? ' is-on' : ''}`, 'aria-pressed': String(on), 'aria-label': `${TEMPS[t].name}${on ? ', 지금 골랐어요' : ''}` },
        t === 'iced' ? objArt('iced', 'small') : h('i', { html: ICON(TEMPS[t].icon || 'coffee') }),
        h('b', { text: TEMPS[t].name }),
        on ? h('i', { class: 'bw-temp-on', html: ICON('check') }) : null);
      onTap(b, () => chooseTemp(t));
      return b;
    });
    const pop = h('div', { class: 'bw-temp-pop' }, h('p', { text: SYS.temp }), h('div', { class: 'bw-temp-opts' }, ...opts));
    const el = h('section', { class: 'ov ov-brew-temp', role: 'dialog', 'aria-label': '온도 고르기' }, pop);
    el.addEventListener('click', (e) => { if (e.target === el) { e.stopPropagation(); closeTemp(); } });
    const layer = document.getElementById('layer-overlay');
    layer.append(el);
    // 칩 바로 위에(무대가 화면에 맞춰 줄어 있어 화면 좌표를 무대 좌표로 바꿈)
    const lr = layer.getBoundingClientRect();
    const ar = anchor.getBoundingClientRect();
    const k = lr.width / (layer.offsetWidth || lr.width) || 1;
    pop.style.left = `${(ar.left + ar.width / 2 - lr.left) / k}px`;
    pop.style.bottom = `${(lr.bottom - ar.top) / k + 18}px`;
    tempEl = el;
    ui.tempOpts = new Map(pantry.temps.map((t, i) => [t, opts[i]]));
    input.pushScope(el);
    requestAnimationFrame(() => el.classList.add('is-in'));
    offTempEsc = bus.on('escape', () => closeTemp());
    audio.sfx('open');
    talk(sysV(SYS.temp));
    focusLater(opts[pantry.temps.indexOf(made.temp)] || opts[0]);
  }
  function closeTemp(focus = true) {
    if (!tempEl) return;
    const el = tempEl;
    tempEl = null;
    ui.tempOpts = null;
    offTempEsc?.();
    offTempEsc = null;
    input.popScope(el);
    el.remove();
    if (focus) focusLater(ui.tempChip);
  }
  function chooseTemp(t) {
    if (phase !== 'recipe') return;
    closeTemp(false);
    const was = made.temp;
    made.temp = t;
    audio.sfx(t === 'iced' && was !== 'iced' ? 'ice' : 'tap');
    renderRecipe();
    focusLater(ui.tempChip);
    talk(sysV(TEMPS[t].name));
  }

  function pickRecipe(keep) {
    phase = 'recipe';
    armed = null;
    if (!keep) {
      made = { cup: null, base: null, adds: [], temp: warmTemp };
      ings = [];
    }
    setScene({ mode: 'recipe' });
    renderRecipe();
    focusLater(keep ? ui.make : ui.hot.values().next().value);
    return new Promise((r) => { recipeDone = r; });
  }

  function resetRecipe() {
    audio.sfx('tap');
    made = { cup: null, base: null, adds: [], temp: warmTemp };
    ings = [];
    renderRecipe();
    focusLater(ui.hot.values().next().value);
    talk(sysV(PROMPT.cup));
  }

  /* ---- 손 기술이 모자라거나 넘쳤을 때(2026-10-31 사용자 "더 화려하게 · 주인공의 시무룩한 표정 · 효과음도 더 극적이게") ----
   * 확대 창이 살짝 흔들리고, 큰 글자 도장(앗, 연해요!) + 시무룩한 지은(넘침 = 식은땀, 모자람 = 그늘 줄) + 튀는 방울(넘침) · 빠지는 김(모자람).
   * 효과음: 넘침 = 철퍽 → 깜짝 → 식은땀, 모자람 = 쪼그라듦 → 축 처짐. 장난스러운 과장이고 감점 · 실패 화면은 없음(원칙 2).
   * 움직임 줄이기 · 차분 모드: 흔들림 · 튀는 것 없이 도장과 얼굴만 그대로 보임 */
  const later = (ms, fn) => setTimeout(() => { if (!over && !stopped()) fn(); }, ms);
  let missNo = 0; // [다시 하기]를 빨리 누르면 늦게 오는 효과음을 내지 않음
  function missShow(view, sk, zone) {
    const high = zone === 'high';
    const kind = high ? 'm-high' : 'm-low';
    const no = ++missNo;
    const after = (ms, fn) => later(ms, () => { if (no === missNo) fn(); });
    closeEl?.classList.add('is-miss', kind);
    view.append(
      h('div', { class: `bw-miss-stamp ${kind}`, 'aria-hidden': 'true' }, h('i', { html: ICON(high ? 'caution' : 'think') }), h('b', { text: `앗, ${sk.labels[zone]}!` })),
      h('div', { class: `bw-miss-face ${kind}`, 'aria-hidden': 'true' },
        h('span', { class: 'bw-miss-pic', html: faceHTML('jieun', 'sad') }),
        h('i', { class: 'bw-miss-mark' })));
    const c = centerOf(view);
    if (high) {
      audio.sfx('spill');
      vfx.burst('drop', c.x, c.y + 60, { n: 16, dist: [140, 320], size: [22, 46], gravity: 180, spin: false });
      after(160, () => audio.sfx('miss_high'));
      after(800, () => audio.sfx('sweat'));
    } else {
      audio.sfx('miss_low');
      vfx.burst('puff', c.x, c.y + 30, { n: 7, dist: [40, 140], size: [60, 120], gravity: -60 });
      after(600, () => audio.sfx('miss_sulk'));
    }
  }
  function missClear(view) {
    missNo += 1;
    closeEl?.classList.remove('is-miss', 'm-high', 'm-low');
    view.querySelectorAll('.bw-miss-stamp, .bw-miss-face').forEach((el) => el.remove());
  }

  /* ---- 손 기술: 띠 ---- */
  function gate(sk, turn) {
    phase = 'gate';
    const go = btn('play', '시작!', 'btn-big btn-main mg-go');
    const see = btn(EYE, '보기', 'btn-big btn-soft bw-gate-watch');
    const wrap = h('div', { class: 'bw-gate', role: 'group', 'aria-label': `${sk.name} 시작` },
      h('div', { class: 'bw-gate-card' },
        h('h3', {}, h('i', { html: ICON(sk.icon) }), sk.name),
        h('p', { text: howtoOf(sk, turn) }),
        sk.safety ? h('p', { class: 'bw-safety' }, h('i', { html: ICON('caution') }), sk.safety) : null,
        turn ? h('p', { class: 'bw-turn-note', text: SYS.turn }) : null,
        h('div', { class: 'bw-row' }, see, go)));
    (closeEl || bench).append(wrap);
    ui.gateGo = go;
    ui.gateSee = see;
    talkAfter(sysV(skillSpeech(sk, turn)), sk.safety && !safetySaid ? sysV(sk.safety) : null, turn ? sysV(SYS.turn) : null);
    if (sk.safety) safetySaid = true;
    focusLater(go);
    return new Promise((resolve) => {
      const done = (how) => {
        audio.sfx('tap');
        tts.stop();
        phase = 'busy';
        wrap.classList.add('is-out');
        setTimeout(() => wrap.remove(), dur(200));
        resolve(how);
      };
      onTap(go, () => done('play'));
      onTap(see, () => done('watch'));
    });
  }

  async function runSkill(id, n, total, soFar, res) {
    const sk = HAND_SKILLS[id];
    const st = (R.skills[id] ||= { tries: 0, good: 0, low: 0, high: 0, watched: 0 });
    st.tries += 1;
    const { turn, k } = pace();
    const [z0, z1] = sk.zone;
    const center = (z0 + z1) / 2;
    const zoneOf = (p) => (p < z0 - 1e-6 ? 'low' : p > z1 + 1e-6 ? 'high' : 'good');
    // '딱 좋아요' 칸: 알맞아요 칸 가운데 36%(직접 했을 때만, 반짝임·소리만 다르고 음료는 알맞아요와 같음. 설계서 Q-R4)
    // 턴 방식은 가운데에 가장 가까운 눈금 하나(시간 대신 정확히 고르기. 8칸 눈금은 가운데 36% 안에 들지 않음)
    const sweetStep = Math.round(center * STEPS) / STEPS;
    const sweet = turn ? [sweetStep, sweetStep] : [center - (z1 - z0) * 0.18, center + (z1 - z0) * 0.18];
    const markHalf = turn ? 0.035 : 0; // 턴 방식 표시는 눈금 둘레만
    const sweetMark = { // 세로 띠: 알맞아요 칸 안의 아래 · 위 자리
      bottom: `${((sweet[0] - markHalf - z0) / (z1 - z0)) * 100}%`,
      top: `${((z1 - sweet[1] - markHalf) / (z1 - z0)) * 100}%`,
    };

    // 띠: 확대 창 오른쪽의 세로 띠(아래부터 낮음 · 알맞아요 · 높음, 2026-10-31 사용자 의견 "bar 가 따로 떨어져 어색") + 바늘. 턴 방식은 칸 눈금
    const needle = h('i', { class: 'bw-needle' });
    const gauge = h('div', {
      class: `bw-gauge g-${id}`, role: 'meter', 'aria-label': sk.name, 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0',
      style: { '--z0': String(z0), '--z1': String(z1), '--p': '0' },
    },
    h('span', { class: 'bw-seg low', style: { height: `${z0 * 100}%` } }, h('span', { text: sk.labels.low })),
    h('span', { class: 'bw-seg good', style: { height: `${(z1 - z0) * 100}%` } }, h('i', { class: 'bw-sweet', 'aria-hidden': 'true', style: sweetMark }), h('i', { html: ICON('check') }), h('span', { text: sk.labels.good })),
    h('span', { class: 'bw-seg high', style: { height: `${(1 - z1) * 100}%` } }, h('span', { text: sk.labels.high })),
    h('i', { class: 'bw-gauge-fill' }),
    turn ? h('span', { class: 'bw-ticks' }, ...Array.from({ length: STEPS - 1 }, (_, i) => h('i', { style: { bottom: `${((i + 1) / STEPS) * 100}%` } }))) : null,
    needle);
    const status = h('p', { class: 'bw-status', 'aria-live': 'polite' });
    // 실시간: [누르고 있기]를 누르는 동안만 차오르고, 손을 떼면 그 칸으로 정함(2026-10-28, 동작 A).
    // 턴 방식(시간 제한 끄기·자동 스캔): 지금처럼 [한 칸] + [멈추기]
    // 단추는 한 번 해 볼 때마다 새로 만듦([다시 하기] 때 앞의 손잡이가 남지 않게)
    const ctrl = h('div', { class: 'bw-ctrl' });
    let stepB;
    let stopB;
    let watchB;
    const makeCtrl = () => {
      stepB = turn ? btn('arrow_right', '한 칸', 'btn-big btn-soft bw-step') : null;
      stopB = turn ? btn('stop', '멈추기', 'btn-big btn-main bw-stop') : btn('hand', '누르고 있기', 'btn-big btn-main bw-hold');
      watchB = btn(EYE, '보기', 'btn-big btn-soft bw-watch');
      // [시작!] 전에는 누를 수 없게(스캔이 시작 창 아래 버튼을 돌지 않게)
      [stepB, stopB, watchB].forEach((b) => { if (b) b.disabled = true; });
      ctrl.replaceChildren(...[stepB, stopB, watchB].filter(Boolean));
    };
    makeCtrl();
    setPanel();
    const bookMini = h('button', { class: 'bw-ico-btn bw-close-book', 'aria-label': '레시피 수첩 보기', html: ICON('book') });
    onTap(bookMini, openBook);
    const view = h('div', { class: 'bw-close-view' });
    const card = h('section', { class: `bw-close c-${id}`, role: 'group', 'aria-label': sk.name },
      h('header', { class: 'bw-close-head' },
        total > 1 ? h('b', { class: 'bw-close-n', text: `${n}/${total}` }) : null,
        h('h3', { text: sk.name }),
        h('p', { text: howtoOf(sk, turn) }),
        sayBtn(skillSpeech(sk, turn)), bookMini),
      h('div', { class: 'bw-close-body' }, view, gauge),
      h('footer', { class: 'bw-close-foot' }, status, ctrl));
    closeUpOff();
    closeEl = card;
    bench.append(card);
    bench.classList.add('is-close');

    // 작업대: 그 손 기술의 한 컷(블렌더 장면 + 프레임)이 있으면 그것, 없으면 하는 일에 맞는 물건 + 옆의 눈금 통(띠와 같이 참). soFar = 이미 컵에 든 것
    // 붓기는 컵 안에 따라 둘: 빈 머그에 우유(따뜻한 우유) · 에스프레소에 우유(라테). 머그가 아니면(레시피를 다르게 골랐을 때) 물건 그림
    const shotId = id !== 'pour' ? id : made.cup === 'mug' ? (soFar.has('espresso') ? 'pour_latte' : 'pour_milk') : null;
    const shot = shotId ? shotView(shotId) : null;
    const cupNow = drinkArt(made, res, soFar, 'big');
    if (shot) setScene({ mode: id, shot, host: view, keep: true });
    else {
      // 한 컷이 없으면 확대 창 안에 하는 일에 맞는 물건(띠가 옆에 있어 눈금 통은 쓰지 않음)
      setScene({ mode: id, keep: true });
      const arts = id === 'extract' ? [objArt('obj_machine', 'machine is-on'), objArt('cup_shot', 'mid')]
        : id === 'pour' ? [objArt('obj_pitcher_milk', 'mid is-on tilt'), cupNow]
          : [objArt('obj_pitcher_milk', 'mid is-on'), cupNow];
      view.append(h('div', { class: 'bw-close-objs' }, ...arts));
    }

    let p = 0;
    let lastZone = null;
    let playing = false;
    let flow = false; // 한 컷의 줄기(물줄기·우유): 누르는 동안 · [보기]로 차는 동안 · [한 칸] 바로 뒤
    let flowTok = 0;
    const draw = () => {
      const v = p.toFixed(4);
      gauge.style.setProperty('--p', v);
      tube.style.setProperty('--p', v);
      shot?.set(p, flow);
      gauge.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      const z = zoneOf(p);
      if (z === lastZone) return;
      const first = lastZone === null;
      lastZone = z;
      gauge.dataset.zone = z;
      gauge.setAttribute('aria-valuetext', sk.labels[z]);
      status.textContent = `지금: ${sk.labels[z]}`;
      if (first || !playing) return;
      // 칸이 바뀔 때: 알맞아요 칸에 들어오면 작은 소리. 턴 방식은 칸 글자를 읽어 줌(실시간은 알맞아요만)
      if (z === 'good') audio.sfx('focus');
      if (turn || z === 'good') talk(sysV(sk.labels[z]));
    };
    draw();

    // 한 번 해 보기: [시작!](또는 [보기]) 뒤, 그리고 [다시 하기]를 누를 때마다
    const attempt = (how) => new Promise((resolve) => {
      phase = 'skill';
      if (turn || how === 'watch') audio.sfx(sk.sfx); // 실시간은 누르는 순간 소리
      focusLater(turn ? stepB : stopB);
      if (how === 'watch') talk(sysV(SYS.watch));
      let mode = how;
      let finished = false;
      let tick = 0;
      let holding = false; // 실시간: 누르고 있는 동안만 차오름
      playing = mode === 'play';
      const end = (zone, watched) => {
        if (finished) return;
        finished = true;
        playing = false;
        holding = false;
        flow = false;
        draw();
        stopB.classList.remove('is-holding');
        curLoop?.stop();
        curLoop = null;
        resolve({ zone, watched, perfect: !watched && zone === 'good' && p >= sweet[0] - 1e-6 && p <= sweet[1] + 1e-6 });
      };
      const setButtons = () => {
        stopB.disabled = mode !== 'play';
        if (stepB) stepB.disabled = mode !== 'play' || p >= 1;
        watchB.disabled = mode !== 'play';
      };
      // 누르기 → 차오름, 떼기 → 그 칸으로 정함. 아주 짧게 누르면(실수로 톡) 정하지 않고 처음부터
      const press = () => {
        if (turn || mode !== 'play' || finished || holding) return;
        holding = true;
        flow = true;
        draw();
        stopB.classList.add('is-holding');
        audio.sfx(sk.sfx);
      };
      const release = () => {
        if (!holding || finished) return;
        holding = false;
        flow = false;
        stopB.classList.remove('is-holding');
        if (p < HOLD_MIN) { p = 0; draw(); status.textContent = SYS.holdShort; talk(sysV(SYS.holdShort)); return; }
        end(zoneOf(p), false);
      };
      // 일부러 뗀 것이 아닌 끊김(터치 취소·초점이 나감·멈춤 창): 정하지 않고 그 자리에서 멈춤. 다시 누르면 이어서 참
      const pauseHold = () => {
        if (!holding || finished) return;
        holding = false;
        flow = false;
        draw();
        stopB.classList.remove('is-holding');
      };
      if (turn) {
        onTap(stopB, () => { if (mode === 'play') end(zoneOf(p), false); });
      } else {
        stopB.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); stopB.setPointerCapture?.(e.pointerId); press(); });
        stopB.addEventListener('pointerup', (e) => { e.stopPropagation(); release(); });
        stopB.addEventListener('pointercancel', pauseHold);
        stopB.addEventListener('lostpointercapture', pauseHold); // 떼기(pointerup) 뒤에도 오지만 그때는 이미 정해짐
        stopB.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) press(); } });
        stopB.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); release(); } });
        stopB.addEventListener('blur', pauseHold);
        stopB.addEventListener('click', (e) => e.stopPropagation()); // 정하는 것은 누르기·떼기만(클릭은 무시)
        stopB.addEventListener('contextmenu', (e) => e.preventDefault()); // 길게 누를 때 뜨는 메뉴 막기
      }
      onTap(stepB, () => {
        if (mode !== 'play' || p >= 1) return;
        p = Math.min(1, (Math.round(p * STEPS) + 1) / STEPS);
        audio.sfx('focus');
        flow = true; // 한 칸 움직인 동안만 줄기
        const tok = ++flowTok;
        setTimeout(() => { if (tok === flowTok && !finished) { flow = false; draw(); } }, 450); // 움직임이 아니라 알림이라 움직임 줄이기에도 그대로
        draw();
        setButtons();
      });
      onTap(watchB, () => {
        if (mode !== 'play') return;
        mode = 'watch';
        playing = false;
        holding = false;
        flow = false;
        stopB.classList.remove('is-holding');
        if (p > center) p = 0; // 지나쳤으면 처음부터 보여 줌
        talk(sysV(SYS.watch));
        setButtons();
        draw();
      });
      setButtons();
      curLoop = loop((dt) => {
        if (finished) return;
        if (mode === 'watch') {
          p = Math.min(center, p + dt / WATCH_MS);
          flow = p < center - 1e-6;
          draw();
          if (p >= center - 1e-6) end('good', true);
          return;
        }
        if (!turn && holding) {
          p = Math.min(1, p + dt / (RUN_MS * k));
          draw();
          if (p >= 1) { end('high', false); return; } // 끝까지 누르고 있으면 넘침(쓴 샷·뜨거운 우유·넘친 잔)
        }
        // 자동 플레이: 누르고 있다가 알맞아요 칸 가운데쯤에서 뗌(턴 방식은 [한 칸]으로 다가감). 일부러 넘치게 할 때(robotMiss)는 끝까지
        if (robot) {
          if (!turn) { if (!holding) press(); else if (!robotMiss && zoneOf(p) === 'good' && p >= center - 0.03) release(); return; }
          tick += dt;
          if (tick < 90) return;
          tick = 0;
          if (robotMiss ? p >= 1 : zoneOf(p) === 'good') stopB.click();
          else stepB?.click();
        }
      }, () => speed);
    });

    // 모자라거나 넘쳤을 때 학생이 스스로 고름(2026-10-31 사용자 "드리기 말고 다시 하기 버튼 · 스스로 리트라이를 선택하도록")
    // [다시 하기] = 띠를 비우고 이 손 기술만 다시(앞 단계는 그대로) · [이대로 하기] = 이 잔의 결과로 다음 단계(드리면 손님이 결과를 말함)
    const askRetry = () => {
      phase = 'retry';
      const again = btn('repeat', '다시 하기', 'btn-big btn-main bw-again');
      const goOn = btn('arrow_right', '이대로 하기', 'btn-big btn-soft bw-go-on');
      ui.retry = again;
      ui.goOn = goOn;
      ctrl.replaceChildren(again, goOn);
      focusLater(again);
      return waitTap(again, goOn).then((i) => {
        phase = 'busy';
        audio.sfx('tap');
        tts.stop();
        return i === 0;
      });
    };

    let how = 'watch';
    if (level !== 'easy') how = await w(gate(sk, turn));
    for (;;) {
      const { zone, watched, perfect } = await w(attempt(how));
      phase = 'busy';
      st[zone] += 1;
      if (perfect) st.perfect = (st.perfect || 0) + 1;
      if (watched) { st.watched += 1; R.watched += 1; }
      const art = id === 'pour' && zone === 'good' && level === 'barista' && sk.art && soFar.has('espresso') && made.temp === 'hot' ? sk.art : null;
      if (art) shot?.set(p, false, true); // 한 컷에서도 하트가 그려짐
      gauge.classList.add('is-done');
      [stepB, stopB, watchB].forEach((b) => { if (b) b.disabled = true; });
      status.replaceChildren(...[
        h('b', { class: `bw-verdict z-${zone}${perfect ? ' is-perfect' : ''}` }, zone === 'good' ? h('i', { html: ICON(perfect ? 'sparkle' : 'check') }) : null, perfect ? SYS.perfect : `${sk.labels[zone]}${zone === 'good' ? '!' : ''}`),
        watched ? h('em', { class: 'bw-watched', text: '보기로 했어요' }) : null,
        art ? h('b', { class: 'bw-verdict z-art' }, h('i', { html: ICON('heart') }), SYS.art) : null,
        zone !== 'good' ? h('span', { class: 'bw-retry-q', text: SYS.retry }) : null,
      ].filter(Boolean)); // replaceChildren 은 null 을 글자 'null' 로 넣음
      if (perfect) gauge.classList.add('is-perfect');
      if (zone === 'good') {
        audio.sfx(art ? 'heart' : perfect ? 'great' : 'good');
        talk(sysV(perfect ? SYS.perfect : sk.labels[zone]), art ? sysV(SYS.art) : null);
        return { skill: id, zone, watched, art };
      }
      missShow(view, sk, zone);
      talk(sysV(sk.labels[zone]), sysV(SYS.retry));
      if (!(await w(askRetry()))) return { skill: id, zone, watched, art: null };
      // 다시 하기: 띠 · 한 컷을 처음으로 되돌리고 바로 직접 해 봄(시작 창 없이, [보기]는 그대로 있음)
      missClear(view);
      st.tries += 1;
      p = 0;
      lastZone = null;
      gauge.classList.remove('is-done', 'is-perfect');
      makeCtrl();
      draw();
      talk(sysV(SYS.again));
      how = 'play';
    }
  }

  /** 손 기술 없이 넣는 것(물·시럽·얼음) */
  async function autoStep(id, soFar, res) {
    const text = id === 'ice' ? TEMPS.iced.auto : INGREDIENTS[id]?.auto?.[made.temp] || INGREDIENTS[id]?.auto?.hot || '';
    soFar.add(id);
    setPanel(askRow('', text));
    setScene({ left: objArt('obj_machine', 'machine'), center: drinkArt(made, res, soFar, 'big'), right: id === 'ice' ? objArt('iced', 'mid is-on') : objArt(INGREDIENTS[id]?.obj, 'mid is-on'), mode: 'auto' });
    audio.sfx(id === 'ice' ? 'ice' : id === 'syrup' ? 'stack' : 'pour');
    talkAfter(sysV(text));
    await w(pauseMs(1300));
  }

  /** 고른 레시피대로 만들기(틀린 레시피도 고른 대로) */
  async function makeDrink() {
    phase = 'busy';
    const steps = prepSteps(made, level);
    const res = { checks: [], art: null };
    const soFar = new Set(); // 컵에 이미 든 것(재료의 마지막 손 기술이 끝나면 들어감: 우유는 붓기 뒤)
    const skillSteps = steps.filter((s) => s.skill);
    let n = 0;
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (s.auto) { await autoStep(s.auto, soFar, res); continue; }
      n += 1;
      const ing = HAND_SKILLS[s.skill].of;
      const c = await runSkill(s.skill, n, skillSteps.length, soFar, res);
      res.checks.push(c);
      if (c.art) res.art = c.art;
      if (HAND_SKILLS[steps[i + 1]?.skill]?.of !== ing) soFar.add(ing);
      await w(pauseMs(c.zone === 'good' ? 1100 : 400)); // 모자람 · 넘침은 [이대로 하기]를 고르는 동안 연출을 이미 봄
    }
    return res;
  }

  /** 만든 것 보여 주기(드리기 전·반응 때) */
  function resultBox(res) {
    const menu = findMenu(made);
    return h('div', { class: 'bw-result' },
      h('p', { class: 'bw-made' }, h('span', { text: '만든 음료' }), h('b', { text: menu ? RECIPES[menu].name : '레시피에 없는 음료' })),
      res.checks.length || res.art ? h('ul', { class: 'bw-checks' },
        ...res.checks.map((c) => {
          const sk = HAND_SKILLS[c.skill];
          return h('li', { class: `z-${c.zone}` }, h('i', { html: ICON(c.zone === 'good' ? 'check' : 'think') }), h('span', { text: sk.name }), h('b', { text: sk.labels[c.zone] }), c.watched ? h('em', { text: '보기' }) : null);
        }),
        res.art ? h('li', { class: 'z-good z-art' }, h('i', { html: ICON('heart') }), h('span', { text: '라테아트' }), h('b', { text: LATTE_ART[res.art]?.name || '' })) : null) : null);
  }

  async function serve(res) {
    phase = 'serve';
    setScene({ center: h('div', { class: 'bw-served' }, drinkArt(made, res, null, 'big'), objArt('obj_tray', 'tray')), mode: 'serve' });
    const give = btn('tray', '드리기', 'btn-big btn-main bw-serve');
    ui.serve = give;
    setPanel(askRow('', PROMPT.serve), resultBox(res), h('div', { class: 'bw-row' }, give));
    talkAfter(sysV(PROMPT.serve));
    focusLater(give);
    await w(waitTap(give));
    phase = 'busy';
    audio.sfx('tray');
    R.attempts += 1;
  }

  /** 손님 반응 → 'next'(다음 손님) · 'fresh'(처음부터 다시) · 'keep'(같은 레시피로 다시) */
  async function react(target, res) {
    const diff = compareRecipe(made, target);
    const last = curIndex === orders.length - 1;
    if (diff.length) {
      // 레시피가 다름: 차분한 말 + 다시 볼 곳 → [다시 만들기]만(실수로 셈)
      R.mistakes += 1;
      showGuest('surprised');
      setReact(SAY.wrong);
      const again = btn('repeat', '다시 만들기', 'btn-big btn-main bw-remake');
      ui.remake = again;
      setPanel(askRow('', `${HINT[diff[0]]} ${HINT.book}`), handRow({ hint: diff, lock: true }), resultBox(res), h('div', { class: 'bw-row' }, again));
      phase = 'wrong';
      talk(guestV(SAY.wrong), sysV(HINT[diff[0]]), sysV(HINT.book));
      focusLater(again);
      await w(waitTap(again));
      phase = 'busy';
      R.remakes += 1;
      audio.sfx('tap');
      showGuest('normal');
      setReact(SAY.wait);
      return 'fresh';
    }
    const miss = res.checks.find((c) => c.zone !== 'good');
    let words;
    if (miss) {
      // 레시피는 맞고 손 기술이 칸을 벗어남: 그 잔의 결과로 말함 → [다시 만들기] / [그대로 드리기]
      words = HAND_SKILLS[miss.skill].react[miss.zone];
      showGuest('normal');
      setReact(words);
      const again = btn('repeat', '다시 만들기', 'btn-big btn-soft bw-remake');
      const keep = btn('greet', '그대로 드리기', 'btn-big btn-soft bw-keep');
      ui.remake = again;
      ui.keep = keep;
      setPanel(askRow('', PROMPT.mild), resultBox(res), h('div', { class: 'bw-row' }, again, keep));
      phase = 'mild';
      talk(guestV(words), sysV(PROMPT.mild));
      focusLater(again);
      const i = await w(waitTap(again, keep));
      phase = 'busy';
      audio.sfx('tap');
      if (i === 0) {
        R.remakes += 1;
        setReact(SAY.wait);
        return 'keep';
      }
      R.kept += 1;
      words = SAY.accept;
    } else {
      words = res.art && RECIPES[cur.menu]?.artThanks ? RECIPES[cur.menu].artThanks : thanksOf(cur);
      if (res.art) R.art += 1;
    }
    // 손님이 받음(알맞게 만들었거나 그대로 드림)
    R.made.push(cur.menu);
    showGuest('smile');
    setReact(words);
    audio.sfx(miss ? 'good' : 'great');
    const next = btn(last ? 'check' : 'arrow_right', last ? '다 했어요' : '다음 손님', 'btn-big btn-main bw-next');
    ui.next = next;
    setPanel(last ? askRow('', SYS.done, { say: null }) : null, resultBox(res), h('div', { class: 'bw-row' }, next));
    phase = 'good';
    talk(guestV(words), last ? sysV(SYS.done) : null);
    focusLater(next);
    await w(waitTap(next));
    phase = 'busy';
    audio.sfx('tap');
    return 'next';
  }

  /* ---- 자동 플레이(?debug) ---- */
  let robot = null;   // null · 'auto' · 'bad'
  let speed = 1;
  let badLeft = 0;    // 남은 '틀리게 고르기'
  let robotMiss = 0;  // 남은 '손 기술을 일부러 넘치게'(__mgAuto({ miss }))
  let robotKeep = false; // 넘친 뒤 [다시 하기] 대신 [이대로 하기](__mgAuto({ keep: true }))
  let driving = false;
  const clickIf = (b) => { if (b?.isConnected && !b.disabled) b.click(); };
  function robotTarget() {
    const t = orderTarget(cur);
    if (!badLeft) return t;
    const other = t.base === 'espresso' ? 'milk' : 'espresso'; // 자연스러운 실수: 바탕 재료를 바꿈(라테 → 따뜻한 우유처럼)
    return { ...t, base: other, adds: t.adds.filter((a) => a !== other) };
  }
  function robotAct() {
    const t = robotTarget();
    switch (phase) {
      case 'recipe': {
        // 카운터 물건: 컵 → 재료(넘치거나 빠진 것) → 얼음 → [만들기 시작]
        if (made.cup !== t.cup) { clickIf(ui.hot?.get(`cup:${t.cup}`)); return; }
        const want = [t.base, ...t.adds];
        const extra = ings.find((x) => !want.includes(x));
        const miss = want.find((x) => !ings.includes(x));
        if (extra || miss) { clickIf(ui.hot?.get(`ing:${extra || miss}`)); return; }
        if (made.temp !== t.temp) { clickIf(tempEl ? ui.tempOpts?.get(t.temp) : ui.tempChip); return; } // 온도 창으로 고름
        arrange();
        if (!compareRecipe(made, t).length && badLeft) badLeft = 0;
        clickIf(ui.make);
        return;
      }
      case 'gate': clickIf(ui.gateGo); return;
      case 'retry': { // 일부러 넘친 뒤: [다시 하기](keep 이면 [이대로 하기] → 손님 반응에서 [다시 만들기])
        const b = robotKeep ? ui.goOn : ui.retry;
        if (b?.isConnected && !b.disabled) { robotMiss = Math.max(0, robotMiss - 1); b.click(); }
        return;
      }
      case 'serve': clickIf(ui.serve); return;
      case 'wrong': if (robot === 'auto') clickIf(ui.remake); return;
      case 'mild': clickIf(ui.remake); return; // 알맞게 다시 만듦
      case 'good': clickIf(ui.next); return;
      default:
    }
  }
  async function drive() {
    if (driving) return;
    driving = true;
    try {
      while (robot && !over && !stopped()) {
        await sleep(70);
        if (!robot || over || stopped()) break;
        if (bookEl) { closeBook(); continue; }
        if (document.querySelector('#layer-modal .ov, #layer-screen .scr')) continue;
        robotAct();
      }
    } finally { driving = false; }
  }
  if (debug) {
    window.__mgBad = async () => {
      if (over) return;
      badLeft = 1;
      robot = 'bad';
      speed = 3;
      drive();
      while (!over && !stopped() && !(phase === 'wrong' && !badLeft)) await sleep(60); // 손님이 '주문한 게 아니네요' 할 때까지
      if (robot === 'bad') robot = null;
    };
    window.__mgAuto = async ({ miss = 0, keep = false } = {}) => {
      if (over) return;
      badLeft = 0;
      robotMiss = miss;
      robotKeep = keep;
      robot = 'auto';
      speed = 3;
      drive();
      await doneP;
    };
  }

  /* ---- 정리 ---- */
  function cleanup() {
    if (cleaned) return;
    cleaned = true;
    over = true;
    robot = null;
    curLoop?.stop();
    curLoop = null;
    curShot?.stop();
    curShot = null;
    closeTemp(false);
    closeBook(true);
    offQuit?.();
    talkNo += 1;
    document.body.classList.remove('brew-open');
    if (debug) { delete window.__mgAuto; delete window.__mgBad; }
    doneRes();
  }
  f.onAbort(() => { abortRes(STOP); cleanup(); });

  /* ---- 손님마다 ---- */
  try {
    for (let i = 0; i < orders.length; i++) {
      cur = orders[i];
      curIndex = i;
      const target = orderTarget(cur);
      if (!target) { console.warn('[brew] 없는 메뉴', cur.menu); continue; }
      f.el.querySelector('.mg-head h2').textContent = orders.length > 1 ? `${title} (${i + 1}/${orders.length})` : title;
      showGuest('normal');
      orderText.textContent = cur.say;
      setReact('');
      showProgress();
      let pending = pickRecipe(false);
      // 처음 손님은 소개 말 다음에 주문(틀이 읽던 소개를 처음부터 이어서), 다음 손님은 바로 주문
      talk(i === 0 ? sysV(speechOf(opts)) : null, guestV(cur.say), sysV(PROMPT.cup));
      for (;;) {
        await w(pending);
        const res = await makeDrink();
        await serve(res);
        const how = await react(target, res);
        if (how === 'next') break;
        // 다시 만들기: 레시피가 틀렸으면 처음부터, 손 기술만 벗어났으면 같은 레시피로(고친 것만 다시 고를 수 있음)
        const keep = how === 'keep';
        pending = pickRecipe(keep);
        talk(guestV(SAY.wait), sysV(keep ? PROMPT.confirm : PROMPT.cup));
      }
    }
    phase = 'done';
    cleanup();
    f.close();
    await sleep(dur(150));
    return result();
  } catch (e) {
    cleanup();
    f.close(); // 정리(abortMinigame)로 이미 닫혔으면 그대로
    if (e !== STOP) throw e;
    return result(quitted ? { quit: true } : { aborted: true });
  }
}
