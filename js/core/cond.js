/**
 * 조건부 비트(onlyIf)의 조건 검사
 *  - { flag: 'payPlan' } 선택 기억에 값이 있으면 · { flag: 'payPlan=gift' } 그 값이면 · notFlag 는 반대
 *  - { 이름: '>=4' } 선택 기억(숫자)의 비교: <, <=, >, >=, ==, !=
 *  - { trust: { haesun: '>=4' } } 단골 신뢰(선택 기억 'touch' 의 그 사람 점수 합, js/data/regulars.js)의 비교
 *  - { warmth: '>=16' } 마을 온기 = 단골 8명의 단계(1~3) 합(8~24, PRD 8.1). 금 씨의 말투 · 겨울 끝 장면의 깊이
 *  - { album: 'haesun' } 엔딩 앨범에 그 단골의 액자가 열렸는지(두 번째 해에도 남음)
 *  - { pick: 'jian.summer_anything=ask_color' } 그 대응 기회에서 고른 선택지(선택 기억 'picks'). '|' 로 여럿: 'a.b=x|y'
 *    끝을 '|' 로 비워 두면 '아직 고르지 않음'도 맞음: 'a.b=x|y|' (앞의 날을 건너뛰고 열었을 때의 기본 장면)
 *  - 배열이면 하나라도 맞으면 참
 */

import { REGULARS, TIER_MIN } from '../data/regulars.js';

const CMP = /^(<=|>=|==|!=|<|>)(-?\d+)$/;

function compare(x, rule) {
  const m = String(rule).match(CMP);
  if (!m) return false;
  const n = Number(m[2]);
  return { '<': x < n, '<=': x <= n, '>': x > n, '>=': x >= n, '==': x === n, '!=': x !== n }[m[1]];
}

/** 선택 기억 'touch'({ '사람.기회': 점수 })에서 그 사람의 신뢰(0~10). regulars.js trustOf 와 같은 셈 */
function trustSum(touchMap, who) {
  let sum = 0;
  for (const [k, v] of Object.entries(touchMap || {})) if (k.startsWith(`${who}.`)) sum += Number(v) || 0;
  return Math.min(10, sum);
}

/** 마을 온기: 단골마다 단계(1 · 2 · 3)의 합 */
export function warmthOf(touchMap) {
  return Object.keys(REGULARS).reduce((sum, who) => {
    const t = trustSum(touchMap, who);
    return sum + (t >= TIER_MIN[3] ? 3 : t >= TIER_MIN[2] ? 2 : 1);
  }, 0);
}

/** flag(이름) → 그 선택 기억의 값 · opts.album: 열린 액자 목록(store.album) */
export function checkCond(cond, flag, opts = {}) {
  if (Array.isArray(cond)) return cond.some((c) => checkCond(c, flag));
  for (const [k, v] of Object.entries(cond || {})) {
    if (k === 'flag' || k === 'notFlag') {
      const [name, want] = String(v).split('=');
      const x = flag(name);
      const hit = want === undefined ? Boolean(x) : String(x ?? '') === want;
      if (k === 'flag' ? !hit : hit) return false;
      continue;
    }
    if (k === 'trust') {
      for (const [who, rule] of Object.entries(v || {})) if (!compare(trustSum(flag('touch'), who), rule)) return false;
      continue;
    }
    if (k === 'warmth') {
      if (!compare(warmthOf(flag('touch')), v)) return false;
      continue;
    }
    if (k === 'album') {
      if (!(opts.album || {})[v]) return false;
      continue;
    }
    if (k === 'pick') {
      const [key, want = ''] = String(v).split('=');
      if (!want.split('|').includes(String((flag('picks') || {})[key] ?? ''))) return false;
      continue;
    }
    if (!compare(Number(flag(k) ?? 0), v)) return false;
  }
  return true;
}

/** 조건 문법 검사(검사기용): 틀린 곳의 설명 목록. regulars: 단골 id 목록(있으면 trust 의 이름도 검사) */
export function condErrors(cond, regulars = null) {
  const errs = [];
  const one = (c) => {
    if (!c || typeof c !== 'object') { errs.push('조건은 객체여야 함'); return; }
    for (const [k, v] of Object.entries(c)) {
      if (k === 'flag' || k === 'notFlag') { if (!String(v)) errs.push(`${k} 값이 비었음`); continue; }
      if (k === 'album') { if (regulars && !regulars.includes(v)) errs.push(`album: 없는 단골 ${v}`); continue; }
      if (k === 'pick') { if (!/^[a-z_]+\.[a-z0-9_]+=[a-z0-9_|]+$/.test(String(v))) errs.push(`pick 은 '사람.기회=선택지' 꼴: ${v}`); continue; }
      if (k === 'trust') {
        if (!v || typeof v !== 'object') { errs.push('trust 는 { 사람: \'>=4\' } 꼴이어야 함'); continue; }
        for (const [who, rule] of Object.entries(v)) {
          if (regulars && !regulars.includes(who)) errs.push(`trust: 없는 단골 ${who}`);
          if (!CMP.test(String(rule))) errs.push(`trust 비교 문법: ${who}: ${rule}`);
        }
        continue;
      }
      if (!CMP.test(String(v))) errs.push(`비교 문법: ${k}: ${v}`);
    }
  };
  if (Array.isArray(cond)) cond.forEach(one); else one(cond);
  return errs;
}
