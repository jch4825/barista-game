/**
 * 대사 텍스트 도우미
 *  - {player}, {wage} 같은 치환
 *  - {{낱말}} / {{표시|사전id}} : 말 사전 링크
 *  - **강조** : 형광펜 강조
 *  - 한국어 조사 처리
 */

import { CONFIG, currentWage } from '../config.js';

const ctx = { player: '플레이어' };

export function setTextContext(values) {
  Object.assign(ctx, values);
}

export function won(n) {
  return `${Math.round(n).toLocaleString('ko-KR')}원`;
}

function vars() {
  const w = currentWage();
  const P = CONFIG.PAYSLIP;
  const gross = (P.workDays * CONFIG.JOB.hoursPerDay + P.weeklyHolidayHours) * w.hourly;
  const net = gross - Math.round((gross * P.exampleDeductionRate) / 10) * 10;
  return {
    player: ctx.player || '플레이어',
    wage: won(w.hourly),
    wageYear: `${w.year}년`,
    netPay: won(net),
    start: CONFIG.JOB.start,
    end: CONFIG.JOB.end,
    breakTime: CONFIG.JOB.breakTime,
    payday: CONFIG.JOB.payday,
  };
}

/** {player}, {wage} 등 치환. {player|이/가} 처럼 조사도 붙일 수 있음 */
export function fill(str) {
  if (!str) return '';
  const v = vars();
  return String(str).replace(/\{(\w+)(?:\|([^}]+))?\}/g, (m, key, j) => {
    if (!(key in v)) return m;
    return j ? `${v[key]}${josaOnly(v[key], j)}` : v[key];
  });
}

/** 받침 유무 */
export function hasBatchim(word) {
  const s = String(word).trim();
  const ch = s.charCodeAt(s.length - 1);
  if (ch < 0xac00 || ch > 0xd7a3) {
    // 숫자·영문: 대략적 규칙
    return /[013678LMNlmn]$/.test(s);
  }
  return (ch - 0xac00) % 28 !== 0;
}

/** josaOnly('연우', '이/가') -> '가' */
export function josaOnly(word, pair) {
  const [a, b] = pair.split('/');
  if (pair === '으로/로') {
    const s = String(word).trim();
    const ch = s.charCodeAt(s.length - 1);
    const jong = ch >= 0xac00 && ch <= 0xd7a3 ? (ch - 0xac00) % 28 : 0;
    return jong === 0 || jong === 8 ? '로' : '으로';
  }
  return hasBatchim(word) ? a : b;
}

export function josa(word, pair) {
  return `${word}${josaOnly(word, pair)}`;
}

const RICH = /\{\{([^}]+)\}\}|\*\*([^*]+)\*\*/g;

/** 텍스트를 [{type:'text'|'term'|'em', v, id?}] 로 나눔 */
export function parse(str) {
  const out = [];
  let last = 0;
  const s = String(str);
  for (const m of s.matchAll(RICH)) {
    if (m.index > last) out.push({ type: 'text', v: s.slice(last, m.index) });
    if (m[1] !== undefined) {
      const [shown, id] = m[1].split('|');
      out.push({ type: 'term', v: shown, id: (id || shown).trim() });
    } else {
      out.push({ type: 'em', v: m[2] });
    }
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ type: 'text', v: s.slice(last) });
  return out;
}

/** 표시 없이 읽을 문장 (TTS·기록용) */
export function plain(str) {
  return String(fill(str)).replace(RICH, (m, t, e) => (t !== undefined ? t.split('|')[0] : e));
}

/**
 * 음성 파일 키: FNV-1a 32bit (UTF-8). tools/export-lines.mjs 와 같은 함수를 씁니다.
 * key = hashKey(`${voiceId}|${speakable(text)}`)
 */
export function hashKey(str) {
  const bytes = new TextEncoder().encode(str);
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/* ---------- 숫자를 소리 나는 대로 (음성 엔진마다 숫자 읽기가 달라서 한글로 바꿔 넘깁니다) ---------- */
const SINO = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const NATIVE_ONES = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
const NATIVE_TENS = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];

function sino4(n) {
  return String(n).padStart(4, '0').split('').map(Number)
    .map((d, i) => (d ? `${d === 1 && i < 3 ? '' : SINO[d]}${['천', '백', '십', ''][i]}` : ''))
    .join('');
}

/** 한자어 수: 10320 → '만 삼백이십' (번호·분·원·일·년 등) */
export function sinoNum(n) {
  let v = Math.floor(Number(n));
  if (!v) return '영';
  const parts = [];
  for (const unit of ['', '만', '억', '조']) {
    const c = v % 10000;
    if (c) parts.unshift(`${c === 1 && unit === '만' ? '' : sino4(c)}${unit}`);
    v = Math.floor(v / 10000);
    if (!v) break;
  }
  return parts.join(' ');
}

/** 고유어 수(세는 말 앞): 1 → '한', 4 → '네', 20 → '스무' (99까지) */
export function nativeNum(n) {
  const v = Number(n);
  if (v === 20) return '스무';
  if (v < 1 || v > 99) return sinoNum(v);
  return `${NATIVE_TENS[Math.floor(v / 10)]}${NATIVE_ONES[v % 10]}`;
}

const digitByDigit = (s) => [...s].map((d) => (d === '0' ? '공' : SINO[d])).join('');

/**
 * 시각·시간·개수는 고유어(한 시, 네 시간, 두 개), 번호·분·돈·날짜는 한자어(일 번, 삼십 분, 만 삼백이십 원).
 * 0으로 시작하는 번호는 한 자리씩(해솔07 → 해솔공칠).
 */
function sayNumbers(s) {
  return s
    .replace(/DAY\s*(\d+)/gi, '$1일 차')
    .replace(/(\d),(?=\d{3})/g, '$1')
    .replace(/(^|\s)[-−]\s?(?=\d)/g, '$1')
    .replace(/\s?\+\s?/g, ' 더하기 ')
    .replace(/\s?×\s?/g, ' 곱하기 ')
    .replace(/(\d+)\s?\/\s?(\d+)/g, (m, a, b) => `${sinoNum(b)}분의 ${sinoNum(a)}`)
    .replace(/(\d+)\.(\d+)/g, (m, a, b) => `${sinoNum(a)} 점 ${digitByDigit(b)}`)
    .replace(/(\d+)\s?%/g, (m, a) => `${sinoNum(a)} 퍼센트`)
    .replace(/(\d+)\s?시간/g, (m, a) => `${Number(a) <= 24 ? nativeNum(a) : sinoNum(a)} 시간`)
    .replace(/(\d+)\s?시(?![작즌험])/g, (m, a) => `${Number(a) <= 12 ? nativeNum(a) : sinoNum(a)} 시`)
    .replace(/(\d+)\s?번째/g, (m, a) => `${a === '1' ? '첫' : nativeNum(a)} 번째`)
    .replace(/(\d+)\s?(개(?!월)|명|잔|가지|살|마리|군데|달(?!러))/g, (m, a, c) => `${nativeNum(a)} ${c}`)
    .replace(/(?<!\d)0\d+/g, digitByDigit)
    .replace(/\d+/g, sinoNum);
}

/** 읽어 주기에 맞게 시간·숫자 등을 소리 나는 대로 */
export function speakable(str) {
  const s = plain(str)
    .replace(/(\d{1,2}):(\d{2})/g, (m, hh, mm) => {
      const H = Number(hh);
      const head = H > 12 ? `오후 ${H - 12}시` : H === 12 ? '낮 12시' : `${H}시`;
      return `${head}${mm === '00' ? '' : ` ${Number(mm)}분`}`;
    })
    .replace(/(시|분|일|요일)\s*~\s*/g, '$1부터 ')
    .replace(/~/g, '')
    .replace(/OPEN/g, '오픈') // 영어 글자는 음성 엔진이 '오피언'처럼 읽음 → 한국어 발음으로
    .replace(/[★☆▶▼✓·]/g, ' ');
  return sayNumbers(s);
}
