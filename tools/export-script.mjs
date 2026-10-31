/**
 * 읽기용 대본 내보내기
 *   node tools/export-script.mjs  →  scenarios/README.md, scenarios/{id}.md
 * 원본은 js/data/episodes/*.js 입니다(목록은 index.js 의 EPISODES + ENDING). 이 파일들은 검수·인쇄·수업 자료용으로 자동 생성됩니다(직접 고치지 마세요).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const { CHARS, speakerLabel } = await imp('js/data/characters.js');
const { SKILLS, STANDARDS } = await imp('js/data/skills.js');
const { plain, fill } = await imp('js/core/text.js');
const { CONFIG } = await imp('js/config.js');
const { CGS } = await imp('js/data/cg.js');
const { EPISODES, ENDING } = await imp('js/data/episodes/index.js'); // 읽으면 판단 카드의 화면 순서(decide.order)도 정해짐
const { REGULARS, KINDS } = await imp('js/data/regulars.js');

const OUT = path.join(root, 'scenarios');
const BG_NAME = { home: '방', living: '거실', bus_stop: '버스 정류장', cafe_front: '카페 앞', counter: '홀·카운터', office: '사무실', staff: '직원 공간', kitchen: '주방', tea: '휴게 공간', school: '교실' };
/** 조건 { flag: 'payPlan=gift' } → '선택 기억 `payPlan` = gift' · { trust: { haesun: '>=4' } } → '해순 할머니의 신뢰 >=4' (js/core/cond.js) */
const flagText = (v, not) => { const [f, val] = String(v).split('='); return val === undefined ? `선택 기억 \`${f}\` ${not ? '없음' : '있음'}` : `선택 기억 \`${f}\` ${not ? '≠' : '='} ${val}`; };
const trustText = (v) => Object.entries(v || {}).map(([who, rule]) => `${CHARS[who]?.name || who}의 신뢰 ${rule}`).join(', ');
const condText = (c) => (Array.isArray(c) ? c.map(condText).join(' 또는 ') : Object.entries(c || {}).map(([k, v]) => (k === 'flag' ? flagText(v) : k === 'notFlag' ? flagText(v, true) : k === 'trust' ? trustText(v) : `선택 기억 \`${k}\` ${v}`)).join(', '));
const name = (who) => CHARS[who]?.name || who;
const t = (s) => plain(fill(s || ''));
const skill = (k) => (k && SKILLS[k] ? ` · 스킬: ${SKILLS[k].name}` : '');
const SEASON = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' };
// 대응 점수 → 반응 연출(runner.js REACT). 점수는 학생 화면에 나오지 않음
const SCORE = { 2: '✅ 맞음(+2) → 오래 바라봄', 1: '🙂 무난(+1) → 미소', 0: '· 어긋남(0) → 작은 끄덕임' };
let curSched = [];

function lines(list, depth = 0) {
  const out = [];
  const pad = '  '.repeat(depth);
  let lastIf = null;
  for (const b of list || []) {
    // 조건부 장면(onlyIf 묶음): 묶음 처음에 한 번 표시
    const group = b.ifGroup || (b.if ? JSON.stringify(b.if) : null);
    if (b.if && group !== lastIf) out.push('', `${pad}#### 🔀 선택에 따라: ${condText(b.if)}일 때만`);
    lastIf = b.if ? group : null;
    switch (b.t) {
      case 'bg': out.push(`${pad}*[배경: ${BG_NAME[b.id] || b.id}${b.variant ? ` · ${b.variant}` : ''}]*`); break;
      case 'place': out.push(`${pad}**📍 ${b.time ? `${b.time} · ` : ''}${b.text}**`); break;
      case 'big': out.push(`${pad}## ${b.text}${b.sub ? ` — ${b.sub}` : ''}`); break;
      case 'say': out.push(`${pad}**${name(b.who)}**: ${t(b.text)}`); break;
      case 'narr': out.push(`${pad}${t(b.text)}`); break;
      case 'think': out.push(`${pad}**${speakerLabel(null, 'think')}**: *${t(b.text)}*`); break;
      case 'sys': out.push(`${pad}> 안내: ${t(b.text)}`); break;
      case 'guide': out.push(`${pad}> 버튼 안내(${b.key}, 처음 한 번): ${t(b.text)}`); break;
      case 'got': out.push(`${pad}> [받았어요] ${t(b.title || b.item)}`); break;
      case 'phone': out.push(`${pad}📱 **${name(b.from)}의 문자**: ${t(b.text)}`); break;
      case 'memo': out.push(`${pad}📌 **메모 「${b.title}」**: ${b.items.map(([, x], i) => `${i + 1}. ${x}`).join(' / ')}`); break;
      case 'act': out.push(`${pad}👆 *(플레이어 행동: ${t(b.label)})*`); break;
      case 'breathe': out.push(`${pad}🫧 *(숨 고르기 ${b.cycles}번${b.note ? `: ${b.note}` : ''})*`); break;
      case 'photo': out.push(`${pad}📷 *(오늘의 한 장: ${b.id})*`); break;
      case 'snap': out.push(`${pad}📸 *칭찬 스냅 「${b.title}」 ${b.caption || ''}*`); break;
      case 'term': out.push(`${pad}📖 *(말 사전에 추가: ${b.id})*`); break;
      case 'check': out.push(`${pad}✅ **오늘의 일정 ${b.n}번 완료**: ${curSched[b.n - 1]?.[1] || ''}`); break;
      case 'meet': out.push(`${pad}🪪 *(인물 카드: ${CHARS[b.who]?.full || name(b.who)} · ${CHARS[b.who]?.role || ''})*`); break;
      case 'cg': out.push(`${pad}🖼 *(${b.id ? `이벤트 CG: ${CGS[b.id]?.title || b.id}` : '이벤트 CG 끝'})*`); break;
      case 'emote': out.push(`${pad}*(${name(b.who)} 머리 위에 이모트: ${b.kind})*`); break;
      case 'earplugs': out.push(`${pad}🎧 *(귀마개 ${b.on ? '끼기: 장면 속 소리가 먹먹해짐' : '빼기'})*`); break;
      case 'fx': if (b.name === 'overload') out.push(`${pad}*(${b.on ? '소리 과부하 효과 시작' : '과부하 효과 끝'})*`); break;
      case 'finish': out.push(`${pad}🏁 **${b.title}** — ${b.sub}`); break;
      case 'credits': out.push(`${pad}🎞 *(사진 벽에 모은 '오늘의 한 장'이 한 장씩 붙으며 제목을 읽어 줌 → 크레디트)*`); break;
      case 'letter': out.push(`${pad}💌 **마지막 메모** (${t(b.to)}): ${b.lines.map((x, i) => `${i + 1}. ${t(x)}`).join(' / ')}${b.ps ? ` — ${t(b.ps)}` : ''} — ${b.from}`); break;
      case 'branch':
        out.push(`${pad}🔀 *선택 기억 \`${b.flag}\` 에 따라:*`);
        for (const [k, l] of Object.entries(b.cases)) {
          if (!l.length) continue;
          out.push(`${pad}- **${k === '_' ? '그 밖' : k}**:`);
          out.push(...lines(l, depth + 1));
        }
        break;
      case 'choose':
        out.push('', `${pad}### 🔀 선택: ${b.title || t(b.q)} (정답 없음${b.flag ? ` · 기억: \`${b.flag}\`` : ''})`);
        if (b.q) out.push(`${pad}질문: ${t(b.q)}`);
        b.options.forEach((o, i) => {
          out.push(`${pad}${i + 1}) ${t(o.label)}`);
          if (o.then) out.push(...lines(o.then, depth + 1));
        });
        out.push('');
        break;
      case 'decide':
        out.push('', `${pad}### ⚖️ 판단: ${b.title || t(b.q)}${skill(b.skill)}`);
        if (b.q) out.push(`${pad}질문: ${t(b.q)}`);
        if (b.timer) {
          const as = b.timer.as ? b.choices.find((c) => !c.ok && c.icon === b.timer.as) : null;
          out.push(`${pad}⏱ **시간 제한 ${b.timer.sec || 15}초** · ${b.timer.label} · 시간이 다 되면: ${as ? `「${t(as.label)}」와 같은 결과` : '따로 쓴 결과 장면'} (설정 넉넉히 2배·끄기, 실패하면 1.5배, 두 번 넘으면 막대 없이)`);
          if (b.timer.fail) { out.push(`${pad}  - 시간이 다 됐을 때:`); out.push(...lines(b.timer.fail, depth + 2)); }
          if (b.timer.oops) out.push(`${pad}  - **아차! ${b.timer.oops.title}** — ${t(b.timer.oops.lesson)} → ⏪ 되감기`);
        }
        (b.order || b.choices.map((_, i) => i)).map((j) => b.choices[j]).forEach((c, i) => { // 화면에 보이는 순서
          out.push(`${pad}- ${c.ok ? '✅' : '❌'} **${i + 1}) ${t(c.label)}**`);
          if (c.ok && typeof c.praise === 'string') out.push(`${pad}  - 칭찬: ${t(c.praise)}`);
          if (c.ok && Array.isArray(c.praise)) out.push(...lines(c.praise, depth + 1));
          if (!c.ok) {
            if (c.fail) { out.push(`${pad}  - 결과 장면:`); out.push(...lines(c.fail, depth + 2)); }
            if (c.oops) out.push(`${pad}  - **아차! ${c.oops.title}** — ${t(c.oops.lesson)} → ⏪ 되감기`);
          }
        });
        out.push('');
        break;
      case 'respond': {
        const r = REGULARS[b.who];
        const tc = r?.touches?.[b.touch];
        if (!tc) { out.push(`${pad}*(없는 대응 기회: ${b.who}.${b.touch})*`); break; }
        out.push('', `${pad}### ☕ 한 잔의 마음: ${r.name} · ${tc.title} (${SEASON[tc.season] || tc.season} · ${tc.nth}번째 기회 · 맞는 대응: ${KINDS[r.wants]})`);
        out.push(...lines(tc.scene, depth));
        out.push(`${pad}- 💡 힌트 두 번 ([힌트 다시 보기]로 다시 볼 수 있음):`);
        out.push(...lines(tc.hints, depth + 1));
        if (tc.q) out.push(`${pad}질문(${speakerLabel(null, 'think')}): ${t(tc.q)}`);
        out.push(`${pad}*(선택지는 볼 때마다 순서를 섞음 · 되감기 없음)*`);
        for (const c of tc.choices) {
          out.push(`${pad}- ${SCORE[c.score] || c.score} · ${KINDS[c.kind] || c.kind} · **${t(c.label)}**`);
          out.push(...lines(c.after, depth + 1));
        }
        out.push(`${pad}- 이유: ${t(tc.why)}`, '');
        break;
      }
      case 'mini':
        out.push('', `${pad}### 🎮 미니게임: ${b.title ? `${t(b.title)} (${b.name})` : b.name}${skill(b.skill)}`);
        if (b.oops) out.push(`${pad}- 실패하면: **아차! ${b.oops.title}** — ${t(b.oops.lesson)}`);
        if (b.timer) out.push(`${pad}- ⏱ **시간 제한**${b.timer.sec ? ` ${b.timer.sec}초` : ''} · ${b.timer.label} · 시간이 다 되면: ${b.timer.say ? `"${t(b.timer.say)}" → ` : ''}${b.timer.oops ? `**아차! ${b.timer.oops.title}** — ${t(b.timer.oops.lesson)}` : '미니게임이 정한 결과'}`);
        out.push('');
        break;
      default: break;
    }
  }
  return out;
}

fs.mkdirSync(OUT, { recursive: true });
const written = new Set(['README.md']);
const index = [`# ${CONFIG.TITLE} 대본 (자동 생성)`, '', '> 원본: `js/data/episodes/*.js` · 생성: `npm run export` · 이 폴더의 파일은 직접 고치지 마세요.', '', '| 에피소드 | 제목 | 때 | 판단 | 대응 | 아차 |', '| :--- | :--- | :--- | :--- | :--- | :--- |'];
for (const ep of [...EPISODES, ENDING]) {
  curSched = ep.schedule || [];
  const decides = ep.script.filter((b) => b.t === 'decide').length;
  const responds = ep.script.filter((b) => b.t === 'respond').length;
  const oops = JSON.stringify(ep.script).match(/"oops":\{"id"/g)?.length || 0;
  const meta = ep === ENDING
    ? [ // 엔딩: 마지막 에피소드(FINALE)를 처음 마친 뒤(결과 화면의 [엔딩 보기]) · 근무표에서 다시 보기
      `- **때**: ${ep.when || '-'}`,
      '- **나오는 때**: 마지막 에피소드를 처음 마치면 결과 화면 뒤에 · 근무표의 엔딩 칸에서 언제든 다시 보기',
      ep.cue ? `- **결과 화면 안내**: ${ep.cue}` : null,
      ep.notice ? `- **엔딩 뒤 알림**: ${ep.notice.title} — ${ep.notice.body} (근무표에도 늘 보임)` : null,
    ]
    : [
      `- **때**: ${ep.when}`,
      `- **오늘의 목표**: ${ep.goal}`,
      `- **오늘의 일정표**: ${curSched.map(([, l], i) => `${i + 1}) ${l}`).join('  ') || '(없음)'}`,
      `- **연계 성취기준**: ${(ep.standards || []).map((c) => `${c} ${STANDARDS[c] || ''}`).join(' / ') || '(없음)'}`,
      `- **일기**: ${ep.diary}`,
    ];
  const body = [
    `# ${ep.label} · ${ep.title}`,
    '',
    ...meta.filter(Boolean),
    '',
    '---',
    '',
    ...lines(ep.script),
  ].join('\n');
  fs.writeFileSync(path.join(OUT, `${ep.id}.md`), `${body}\n`);
  written.add(`${ep.id}.md`);
  index.push(`| [${ep.label}](${ep.id}.md) | ${ep.title} | ${ep.when || '-'} | ${decides} | ${responds} | ${oops} |`);
}
fs.writeFileSync(path.join(OUT, 'README.md'), `${index.join('\n')}\n`);
// 목록에서 빠진 에피소드의 지난 대본은 지움(이 폴더는 모두 자동 생성물)
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.md') && !written.has(f)) fs.rmSync(path.join(OUT, f));
console.log(`대본 ${written.size - 1}편을 scenarios/ 에 내보냈어요.`);
