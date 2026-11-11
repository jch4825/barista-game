/**
 * 음성 검수 페이지 만들기(검수 13.116): 다시 만든 음성을 원래 대사 줄로 묶어, 이야기 순서대로 한 줄씩 듣고 표시합니다.
 *   node tools/voice/review-page.mjs [--since 2026-11-09] [--base 31f8a1b] [--name 13115]
 *   --since: 기록(tools/voice/qwen_made.json)의 만든 날이 이날부터인 문장만
 *   --base : 문장을 나누기 전의 커밋. 그때의 tools/voice/lines.json 으로 원래 줄과 이야기 순서를 앎
 *   --name : 페이지 이름. 결과는 assets/_src/_check/voice_review_<name>/(index.html + data.js, git 에 넣지 않음)
 * 개발 서버(npm run web)에서 http://localhost:5175/assets/_src/_check/voice_review_<name>/ 로 엽니다.
 * 표시는 그 브라우저의 저장소(localStorage 'barista.voiceReview.<name>')에 남고, 페이지의 [표시한 줄 모아 보기]로 글로도 꺼낼 수 있습니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const imp = (p) => import(pathToFileURL(path.join(root, p)).href);
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : dflt; };
const SINCE = arg('since', '2026-11-09');
const BASE = arg('base', '31f8a1b');
const NAME = arg('name', '13115');
const OUT = path.join(root, 'assets', '_src', '_check', `voice_review_${NAME}`);

const { sentencesOf, speakable, hashKey } = await imp('js/core/text.js');
const { EPISODES, ENDING } = await imp('js/data/episodes/index.js');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const now = read('tools/voice/lines.json');
const made = read('tools/voice/qwen_made.json');
const manifest = read('assets/voice/manifest.json').lines;
const base = JSON.parse(execSync(`git -C "${root}" show ${BASE}:tools/voice/lines.json`, { encoding: 'utf8', maxBuffer: 1 << 28 }));

const nowByKey = new Map(now.map((l) => [l.key, l]));
const fresh = new Set(now.filter((l) => (made[l.key]?.at || '') >= SINCE && manifest[l.key]).map((l) => l.key));
const keyOf = (voice, text) => hashKey(`${voice}|${speakable(text).trim()}`);
const EP_LABEL = { ...Object.fromEntries([...EPISODES, ENDING].map((e) => [e.id, e.label])), free: '자유 영업' };
const WHO = { narr: '서술', think: '속마음', jieun: '지은', owner: '사장님', sys: '안내' };
const OLD_DIRS = ['assets/_src/_check/voice_redo/split_old', 'assets/_src/_check/voice_redo/ending_old'];
// 나눈 뒤에 대사를 고친 줄: 지금의 문장들(검수 13.115 '일곱 시')
const REWRITE = { '89ab68d9': ['내일도 문 열지.', '일곱 시 전에 열어야 이 동네 시작 시간에 맞출 수 있어.'] };

const part = (key, text) => {
  const r = made[key] || {};
  return { key, text, file: manifest[key], flag: r.flag || '', sim: r.sim ?? null, picked: Boolean(r.heard) };
};
const rows = [];
const covered = new Set();
for (const l of base) {
  const texts = REWRITE[l.key] || sentencesOf(l.text);
  const keptWhole = !REWRITE[l.key] && nowByKey.has(l.key); // 나누지 않은 줄(귀로 고른 통째 줄 등)은 그대로 한 파일
  const parts = !keptWhole && (texts.length > 1 || REWRITE[l.key])
    ? texts.map((t) => part(keyOf(l.voice, t), speakable(t).trim()))
    : [part(l.key, l.text)];
  if (!parts.some((p) => fresh.has(p.key))) continue;
  if (!parts.every((p) => p.file)) { console.warn('음성이 없는 문장이 있는 줄(뺌):', l.key, l.text.slice(0, 30)); continue; }
  parts.forEach((p) => covered.add(p.key));
  const old = OLD_DIRS.map((d) => `${d}/${l.key}.ogg`).find((f) => fs.existsSync(path.join(root, f)));
  rows.push({ id: l.key, ep: l.ep, epLabel: EP_LABEL[l.ep] || l.ep, who: WHO[l.voice] || l.voice, parts, ...(old ? { old } : {}) });
}
for (const k of fresh) { // 원래 줄을 찾지 못한 새 문장은 맨 뒤에 따로
  if (covered.has(k)) continue;
  const l = nowByKey.get(k);
  rows.push({ id: k, ep: l.ep, epLabel: EP_LABEL[l.ep] || l.ep, who: WHO[l.voice] || l.voice, parts: [part(k, l.text)] });
}

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'data.js'), `window.REVIEW = ${JSON.stringify({ name: NAME, since: SINCE, rows })};\n`);
fs.copyFileSync(path.join(root, 'tools', 'voice', 'review-page.html'), path.join(OUT, 'index.html'));
const n = rows.reduce((a, r) => a + r.parts.length, 0);
console.log(`검수 페이지: 줄 ${rows.length} · 문장 ${n}(새로 만든 문장 ${fresh.size}) → ${path.relative(root, OUT)}/index.html`);
console.log(`열기: http://localhost:5175/${path.relative(root, OUT).replace(/\\/g, '/')}/`);
