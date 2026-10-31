/**
 * 선생님 모드 '제작·저작권 정보'에 보일 자료 만들기 → assets/credits/credits.json
 *   node tools/export-credits.mjs        (npm run credits)
 *
 * 모으는 것
 *  - PRD: PRD.md 를 절마다 나눠 HTML 로
 *  - 요청 기록: Claude Code 대화 기록(~/.claude/projects/C--AI-game3/*.jsonl)에서 사용자가 쓴 요청만(LEAVE_OUT 의 대화는 뺌).
 *    기록 폴더가 없으면(다른 PC) 지난번에 만든 요청 기록을 그대로 둡니다. 폴더는 CLAUDE_LOG_DIR 로 바꿀 수 있습니다.
 *  - 작업 기록: 검수 문서(WORKLOG)를 절마다 나눠 HTML 로. 문서가 없으면 비워 둠(화면에 '작업 기록이 없어요')
 *  - 그림: assets/images.json(스탠딩·배경·효과) + 원래 파일 이름(assets/_src/SOURCES.md · assets/bg/SOURCES.md) + 프롬프트 복기(tools/credits/image_prompts.mjs)
 *  - 음악·효과음: tools/audio/audio_map.mjs(팩·작곡가·파일별 출처) · 음성: tools/voice/voice_cast.json
 * 대사·그림·소리를 바꾼 뒤 실행하면 최신으로 바뀝니다.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(root, 'assets', 'credits', 'credits.json');
const LOG_DIR = process.env.CLAUDE_LOG_DIR || path.join(os.homedir(), '.claude', 'projects', 'C--AI-game3');
const PRD = 'PRD.md';
const WORKLOG = 'docs/review.md'; // 새 게임의 검수 문서(아직 없음). 만들면 이 이름으로 두거나 여기를 고침
const imp = (rel) => import(pathToFileURL(path.join(root, rel)).href);
const { IMAGE_PROMPTS, NO_SOURCE_NOTE } = await imp('tools/credits/image_prompts.mjs');
const { AUDIO_MAP, PACKS } = await imp('tools/audio/audio_map.mjs');
const { CHARS } = await imp('js/data/characters.js');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const warn = [];

/* ---------------- 1. 요청 기록 ---------------- */
const kst = (iso) => {
  const d = new Date(new Date(iso).getTime() + 9 * 3600e3);
  return d.toISOString().slice(0, 16).replace('T', ' ');
};
function cleanText(t) {
  return t
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<pasted_content[^>]*>/g, '[붙여 넣은 글]\n')
    .replace(/<\/pasted_content[^>]*>/g, '\n[붙여 넣은 글 끝]')
    .replace(/[A-Za-z]:\\Users\\[^\\\s"']+/g, 'C:\\Users\\…')       // 사용자 폴더 이름 가리기
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '(메일 주소)')            // 메일 주소 가리기
    .trim();
}
const AUTO = /^작업 중에 사용량 한도에 도달했지만/;
const SKIP = /^(This session is being continued|<command-|<local-command|Caveat:|\[Request interrupted|<task-notification>)/;
/**
 * 요청 기록에서 빼는 대화: 같은 폴더에서 한 다른 프로그램 작업처럼 이 게임에 관한 요청이 아닌 것.
 *  sid = 대화 기록 파일 이름 앞 8자리 · from/to(UTC)가 있으면 그 사이의 요청만, 없으면 그 대화 전체 · why = 뺀 까닭
 *  예: { sid: '1234abcd', from: '2026-10-28T01:00:00Z', to: '2026-10-28T02:00:00Z', why: '다른 프로그램 작업' }
 * 새 게임(2026-10-27~)은 아직 뺀 대화가 없습니다(직업 마1스톤 때의 목록은 원본 C:\AI\game 에 있음).
 */
const LEAVE_OUT = [];
const leftOut = (r) => {
  const t = Date.parse(r.ts);
  return LEAVE_OUT.some((x) => x.sid === r.sid && (!x.from || t >= Date.parse(x.from)) && (!x.to || t <= Date.parse(x.to)));
};
let leftOutCount = 0;

async function readRequests() {
  if (!fs.existsSync(LOG_DIR)) return null;
  const files = fs.readdirSync(LOG_DIR).filter((f) => f.endsWith('.jsonl'));
  if (!files.length) return null;
  const items = [];
  for (const f of files) {
    const sid = f.slice(0, 8);
    const rl = readline.createInterface({ input: fs.createReadStream(path.join(LOG_DIR, f), 'utf8'), crlfDelay: Infinity });
    for await (const line of rl) {
      if (!line.includes('"user"') && !line.includes('queued_command')) continue;
      let o;
      try { o = JSON.parse(line); } catch { continue; }
      if (o.type === 'user' && !o.isMeta && !o.isCompactSummary) {
        const c = o.message?.content;
        let text = '';
        let images = 0;
        if (typeof c === 'string') text = c;
        else if (Array.isArray(c)) {
          if (c.some((p) => p.type === 'tool_result')) continue;
          images = c.filter((p) => p.type === 'image').length;
          text = c.filter((p) => p.type === 'text').map((p) => p.text || '').join('\n');
        }
        text = cleanText(text);
        if ((!text && !images) || SKIP.test(text)) continue;
        items.push({ sid, ts: o.timestamp, text, images, how: AUTO.test(text) ? 'auto' : 'prompt' });
      } else if (o.type === 'attachment' && o.attachment?.type === 'queued_command' && o.attachment?.origin?.kind === 'human') {
        // 그림을 붙인 중간 메시지는 글이 아니라 [글·그림 조각] 목록으로 남음
        const pr = o.attachment.prompt || '';
        const parts = Array.isArray(pr) ? pr : [];
        const text = cleanText(typeof pr === 'string' ? pr : parts.filter((p) => p.type === 'text').map((p) => p.text || '').join('\n'));
        const images = parts.filter((p) => p.type === 'image').length;
        if ((text || images) && !SKIP.test(text)) items.push({ sid, ts: o.attachment.timestamp || o.timestamp, text, images, how: 'midturn' });
      }
    }
  }
  items.sort((a, b) => a.ts.localeCompare(b.ts));
  const kept = items.filter((it) => !leftOut(it));
  leftOutCount = items.length - kept.length;
  const out = [];
  for (const it of kept) {
    const t = Date.parse(it.ts);
    const dup = out.slice(-6).find((p) => p.text === it.text && Math.abs(Date.parse(p.ts) - t) < 180e3);
    if (dup) { dup.images = Math.max(dup.images, it.images); continue; }
    out.push(it);
  }
  // 대화(세션) 번호: 처음 요청한 순서대로 1, 2, 3…
  const order = [...new Set(out.map((r) => r.sid))];
  return out.map((r, i) => ({ n: i + 1, at: kst(r.ts), talk: order.indexOf(r.sid) + 1, how: r.how, images: r.images, text: r.text }));
}

/* ---------------- 2. 작업 기록 (검수 문서 → HTML) ---------------- */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
}
function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const html = [];
  let list = null;
  let table = null;
  const closeList = () => { if (list) { html.push(`</${list}>`); list = null; } };
  const closeTable = () => {
    if (!table) return;
    const [head, , ...body] = table;
    const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    html.push(`<table><thead><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c).replace(/&lt;br&gt;/g, '<br>')}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
    table = null;
  };
  for (const raw of lines) {
    const l = raw.trimEnd();
    if (/^\s*\|/.test(l)) { closeList(); (table ||= []).push(l.trim()); continue; }
    closeTable();
    let m;
    if (!l.trim()) { closeList(); continue; }
    if ((m = l.match(/^(#{3,6})\s+(.*)/))) { closeList(); html.push(`<h4>${inline(m[2])}</h4>`); continue; }
    if (/^---+$/.test(l.trim())) { closeList(); html.push('<hr>'); continue; }
    if ((m = l.match(/^>\s?(.*)/))) { closeList(); html.push(`<blockquote>${inline(m[1])}</blockquote>`); continue; }
    if ((m = l.match(/^(\s*)[-*]\s+(.*)/))) {
      if (list !== 'ul') { closeList(); html.push('<ul>'); list = 'ul'; }
      html.push(`<li${m[1].length >= 2 ? ' class="sub"' : ''}>${inline(m[2])}</li>`);
      continue;
    }
    if ((m = l.match(/^(\s*)\d+\.\s+(.*)/))) {
      if (list !== 'ol') { closeList(); html.push('<ol>'); list = 'ol'; }
      html.push(`<li${m[1].length >= 2 ? ' class="sub"' : ''}>${inline(m[2])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inline(l.trim())}</p>`);
  }
  closeList();
  closeTable();
  return html.join('');
}
/** 마크다운 문서를 '## ' 절마다 나눠 HTML 로: 작업 기록(검수 문서)·PRD 탭이 같이 씀 */
function readDoc(rel, fallbackTitle) {
  const md = read(rel);
  const parts = md.split(/^## /m);
  const intro = parts.shift();
  const sections = parts.map((p) => {
    const nl = p.indexOf('\n');
    return { title: p.slice(0, nl).trim(), html: mdToHtml(p.slice(nl + 1)) };
  });
  const title = (intro.match(/^#\s+(.*)/m) || [])[1] || fallbackTitle;
  return { title, intro: mdToHtml(intro.replace(/^#\s+.*$/m, '')), sections };
}

/* ---------------- 3. 그림 ---------------- */
const images = JSON.parse(read('assets/images.json'));
/** SOURCES.md 표에서 원래 파일 이름(나중 줄이 앞 줄을 덮음: 업스케일링 교체) */
function readSources() {
  const map = {};
  const take = (text, prefix = '') => {
    for (const m of text.matchAll(/^\|\s*`([^`]+)`\s*\|\s*`([^`]+)`(.*)\|/gm)) {
      const key = prefix + m[1].replace(/\.(jpe?g|png|mp4)$/i, '');
      const name = m[2];
      const ts = name.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2}\./);
      const at = m[3].match(/(\d{4}-\d{2}-\d{2} \d{2}:\d{2})/); // 2026-10-29부터 Flow 파일 이름에 시각이 없어 표의 비고에 적음
      const entry = { flow: name, made: ts ? `${ts[1]}-${ts[2]}-${ts[3]} ${ts[4]}:${ts[5]}` : (at ? at[1] : '') };
      if (map[key]) { entry.first = map[key].first || map[key].flow; entry.firstMade = map[key].firstMade || map[key].made; }
      if (/업스케일링/.test(m[3])) entry.upscaled = true;
      map[key] = entry;
    }
  };
  take(read('assets/_src/SOURCES.md'));
  take(read('assets/bg/SOURCES.md'), 'bg/');
  return map;
}
const SRC = readSources();
// 그림 종류(assets/images.json). 새 종류의 그림(작업대 오브젝트 등)을 넣으면 여기와 image_prompts.mjs 에 더함
const KINDS = [['stand', '사람(스탠딩)'], ['bg', '배경'], ['cg', '장면 그림(CG)'], ['objects', '작업대 물건'], ['vfx', '효과(VFX)']];
const imageList = [];
for (const [kind, group] of KINDS) {
  for (const [id, file] of Object.entries(images[kind] || {})) {
    const p = IMAGE_PROMPTS[id];
    if (!p) warn.push(`프롬프트 복기 없음: ${kind}/${id}`);
    const src = SRC[`${kind}/${id}`] || SRC[`bg/${id}`] || (p?.sheet && SRC[`objects/${p.sheet}`]) || {}; // 작업대 물건은 잘라 낸 시트의 이름
    imageList.push({
      id, kind, group, title: p?.title || id,
      file: `assets/${file}`,
      tool: 'Google Flow', made: src.made || '', flow: src.flow || NO_SOURCE_NOTE, first: src.first || '', firstMade: src.firstMade || '', upscaled: Boolean(src.upscaled),
      from: p?.from || 'none', prompt: p?.prompt || '', neg: p?.neg || '', note: p?.note || '',
    });
  }
}
// 종류 안에서는 프롬프트 표의 순서(주요 인물 → 크루 → 손님)대로
const ORDER = Object.keys(IMAGE_PROMPTS);
const rank = (i) => {
  const n = ORDER.indexOf(i.id);
  return n < 0 ? 1e9 : n;
};
imageList.sort((a, b) => KINDS.findIndex((k) => k[0] === a.kind) - KINDS.findIndex((k) => k[0] === b.kind) || rank(a) - rank(b));
for (const who of ['yeonwoo', 'dohyun', 'manager']) {
  const p = IMAGE_PROMPTS[`sheet:${who}`];
  imageList.push({ id: `${who}_sheet`, kind: 'sheet', group: '설정화', title: p.title, file: `assets/${who}_sheet.jpg`, tool: 'Google Flow', made: '', flow: '직업 마1스톤 작업 전(1판)에 사용자가 만든 설정화', first: '', from: p.from, prompt: p.prompt, neg: p.neg, note: `${p.note ? `${p.note} · ` : ''}표정 초상(assets/portraits/${who}_*.jpg)을 여기서 잘라 씀(tools/crop-portraits.py)` });
}
// 손 기술의 한 컷(블렌더 3D 렌더, 생성 AI 아님): 배경판 + 단계 프레임 묶음을 한 줄로(tools/blender/scene_bench.py → shots_post.py)
const SHOT_TITLES = { extract: '샷 내리기', steam: '우유 데우기', pour_milk: '붓기(따뜻한 우유)', pour_latte: '붓기(라테 · 하트)', foam: '거품 내기', water: '물 붓기(아메리카노)', ice: '얼음 담기', water_glass: '찬물 붓기(아이스 아메리카노)', pour_glass_milk: '붓기(유리컵 · 찬 우유)', pour_glass_latte: '붓기(유리컵 · 아이스 라테)' };
const SHOT_NOTES = {
  extract: '오래된 2그룹 머신(스테인리스 + 초록 법랑), 왼쪽 그룹 아래 샷 잔, 왼쪽 앞에서 비스듬히 본 2944×800 장면. 잔이 차오르는 13단계 × 줄기 있음/없음(docs/recipes.md 6.2)',
  steam: '물받이 위 우유 담은 스팀 피처에 노즐을 넣고 집게 온도계를 꽂은 2944×800 장면. 바늘 25단계 × 김 있음/옅음, 다이얼의 초록 칸 = 알맞아요, 스팀을 켜면 우유가 돎(docs/recipes.md 6.3)',
  pour_milk: '받침 위 머그를 위에서 내려다보고 기운 피처로 붓는 2944×800 장면(배경판은 pour_plate). 빈 머그에 우유가 차는 17단계 × 줄기 있음/없음, 끝까지 부으면 받침에 넘침(docs/recipes.md 6.4)',
  pour_latte: '같은 장면에서 에스프레소에 우유: 17단계 × 줄기 있음/없음(끝 무렵 흰 거품 동그라미) + 바리스타 단계의 하트 4장(docs/recipes.md 6.4)',
  foam: '물받이 위 스팀 피처를 오른쪽 앞 위에서 내려다본 2944×800 장면. 우유가 부풀어 겉면이 오르는 13단계 × 스팀 켬(소용돌이)/끔, 매끈한 우유 → 고운 거품 → 굵은 방울(docs/recipes.md 6.5)',
  water: '받침 위 머그(에스프레소)에 기운 드립 주전자로 뜨거운 물을 붓는 2944×800 장면. 크레마가 흩어지며 차오르는 17단계 × 물줄기 있음/없음, 작업대에서는 저절로 차오름(docs/recipes.md 6.6)',
  ice: '밝은 컵받침 위 아이스 유리컵을 앞에서 조금 위로 본 2944×800 장면. 얼음 8개가 하나씩 쌓이는 9단계 × 떨어지는 얼음 있음/없음(docs/recipes.md 6.7)',
  water_glass: '같은 유리컵(얼음 + 에스프레소)에 왼쪽 피처로 찬물: 짙은 갈색이 차오르고 얼음이 떠오르는 17단계 × 물줄기 있음/없음(docs/recipes.md 6.7)',
  pour_glass_milk: '같은 유리컵(얼음만)에 피처로 찬 우유: 17단계 × 줄기 있음/없음, 배경판은 pour_glass_plate(docs/recipes.md 6.7)',
  pour_glass_latte: '같은 유리컵(얼음 + 에스프레소)에 찬 우유: 섞이며 밝은 갈색이 되는 17단계 × 줄기 있음/없음(docs/recipes.md 6.7)',
};
const SHOT_RUN = { pour_milk: 'pour', pour_latte: 'pour', pour_glass_milk: 'pour_glass', pour_glass_latte: 'pour_glass' }; // 한 번에 렌더하는 묶음(scene_bench.py 의 SHOTS)
const shotFiles = images.shots || {};
let shotMeta = {};
try { shotMeta = JSON.parse(read('assets/shots/shots.json')); } catch (e) { /* 컷이 아직 없음 */ }
for (const [sid, m] of Object.entries(shotMeta)) {
  const plate = m.plate || `${sid}_plate`;
  const frames = Object.keys(shotFiles).filter((k) => new RegExp(`^${sid}_[lsa]\\d+$`).test(k)).length;
  imageList.push({
    id: `shot_${sid}`, kind: 'shots', group: '작업대 장면(블렌더)', title: `${SHOT_TITLES[sid] || sid} 장면 · 배경판 + 단계 프레임 ${frames}장`,
    file: `assets/${shotFiles[plate] || Object.values(shotFiles)[0]}`,
    tool: 'Blender 5.2 (Cycles) · 이 저장소의 스크립트', made: '', flow: '블렌더로 렌더(생성 AI 아님): assets/_src/blender/bench_test.blend', first: '', firstMade: '', upscaled: false,
    from: 'blender',
    prompt: `blender --background --factory-startup --python tools/blender/scene_bench.py -- C:/AI/game3/assets/_src/blender shots ${SHOT_RUN[sid] || sid}\npython -X utf8 tools/blender/shots_post.py assets/_src/blender/shots assets/shots`,
    neg: '',
    note: SHOT_NOTES[sid] || '',
  });
}
const portraits = fs.readdirSync(path.join(root, 'assets', 'portraits')).filter((f) => f.endsWith('.jpg'));

/* ---------------- 4. 음악·효과음 ---------------- */
const srcList = (e) => [...new Set(e.layers ? e.layers.map((l) => l.src) : e.repeat ? [e.repeat.src] : [e.src])];
const packKey = (rel) => Object.keys(PACKS).find((k) => rel.startsWith(k));
const fileName = (rel) => rel.split('/').pop();
const packs = Object.entries(PACKS).map(([key, p]) => ({ key, ...p, used: AUDIO_MAP.filter((e) => srcList(e).some((s) => s.startsWith(key))).length }));
// 배경음악: 직업 마1스톤 곡은 모두 뺐고 새 곡을 넣을 자리. 쓰는 곳·곡 이름은 audio_map 의 bgm 줄에 use·track 으로 적음
const music = AUDIO_MAP.filter((e) => e.kind === 'bgm').map((e) => {
  const s = srcList(e)[0];
  const p = PACKS[packKey(s)] || {};
  return { id: e.id, use: e.use || e.id, track: e.track || fileName(s).replace(/\.\w+$/, ''), file: fileName(s), pack: p.name, composer: p.composer || p.author, composerNote: p.composerNote || '', license: p.license, ai: p.ai || '', note: e.note || '' };
});
const sounds = AUDIO_MAP.filter((e) => e.kind !== 'bgm').map((e) => ({
  id: `${e.kind}/${e.id}`, kind: e.kind,
  from: srcList(e).map((s) => ({ pack: PACKS[packKey(s)]?.name || s.split('/')[0], file: fileName(s) })),
  note: e.note || '',
}));

/* ---------------- 5. 음성 ---------------- */
// 목소리 ID → 보일 이름: 인물은 js/data/characters.js 의 이름, 인물이 아닌 목소리만 여기에
const VOICE_LABEL = { think: '속마음', narr: '서술', sys: '안내 목소리', customer: '손님(남자)', customer_f: '손님(여자)' };
const cast = JSON.parse(read('tools/voice/voice_cast.json'));
const voiceManifest = JSON.parse(read('assets/voice/manifest.json'));
const voices = {
  model: cast._model || 'supertonic-3',
  lines: Object.keys(voiceManifest.lines || {}).length,
  cast: Object.entries(cast).filter(([k]) => !k.startsWith('_')).map(([k, v]) => ({ who: VOICE_LABEL[k] || CHARS[k]?.name || k, voice: v.voice, speed: v.speed })),
};

/* ---------------- 쓰기 ---------------- */
const requests = await readRequests();
if (!requests) warn.push(`대화 기록 폴더가 없어 요청 기록은 지난번 것을 그대로 둠: ${LOG_DIR}`);
const hasWorklog = fs.existsSync(path.join(root, WORKLOG));
if (!hasWorklog) warn.push(`검수 문서가 없어 작업 기록은 비워 둠: ${WORKLOG}`);
const data = {
  updated: kst(new Date().toISOString()).slice(0, 10),
  prd: readDoc(PRD, '제품 요구사항 정의서(PRD)'),
  requests: requests || prev.requests || [],
  worklog: hasWorklog ? readDoc(WORKLOG, '검수 문서') : null,
  images: imageList,
  derived: { portraits: portraits.length },
  audio: { packs, music, sounds },
  voices,
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(data, null, 1)}\n`);
const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`제작·저작권 자료 → assets/credits/credits.json (${kb}KB)`);
console.log(`  PRD ${data.prd.sections.length}절 · 요청 ${data.requests.length}건${requests && leftOutCount ? `(뺀 것 ${leftOutCount}건)` : ''} · 작업 기록 ${data.worklog?.sections.length ?? 0}절 · 그림 ${imageList.length}장(+초상 ${portraits.length}) · 음악 ${music.length}곡 · 효과음·환경음 ${sounds.length}개 · 음성 ${voices.lines}줄`);
for (const w of warn) console.log(`  ! ${w}`);
