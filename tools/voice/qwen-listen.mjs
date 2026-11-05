/**
 * Qwen3 로 만든 음성을 귀로 들어 볼 화면(검수 13.58)
 *   node tools/voice/qwen-listen.mjs [--dir 음성 폴더] [--per N] [--all]
 * 음성 폴더(기본 assets/voice, 시험은 --dir assets/_src/_check/voice_qwen/run_test)의 qwen_made.json · manifest.json 을 읽어,
 * 사람마다 '들어 볼 줄'(목소리 · 길이 표시) 모두 + 감정이 큰 줄 몇 개(--per, 기본 6, --all 이면 모두)를 골라
 * assets/_src/_check/voice_qwen/listen2/(index.html · a/*.ogg)에 둡니다. claude.ai 비공개 페이지로 올리면
 * 줄마다 [다시 만들기]를 눌러 둘 수 있고(db 'redo/{key}'), Claude 가 읽어 그 줄만 다시 만듭니다(--keys).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const dir = path.resolve(root, arg('--dir', 'assets/voice'));
const per = Number(arg('--per', 6));
const all = process.argv.includes('--all');
const OUT = path.join(root, 'assets', '_src', '_check', 'voice_qwen', 'listen2');
const rd = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const made = rd(path.join(dir, fs.existsSync(path.join(dir, 'qwen_made.json')) ? 'qwen_made.json' : '../../tools/voice/qwen_made.json'));
const manifest = rd(path.join(dir, 'manifest.json')).lines;
const lines = Object.fromEntries(rd(path.join(root, 'tools', 'voice', 'lines.json')).map((l) => [l.key, l]));
const emo = rd(path.join(root, 'tools', 'voice', 'emotions.json')).lines;
const qcast = rd(path.join(root, 'tools', 'voice', 'qwen_cast.json')).people;
const KIND = { think: '속마음', narr: '나레이션' };

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'a'), { recursive: true });
const files = [];
const byWho = {};
for (const [key, m] of Object.entries(made)) if (manifest[key] && lines[key]) (byWho[m.who] ||= []).push({ key, ...m, ...lines[key] });
const order = Object.keys(qcast).filter((id) => byWho[id]);
const people = order.map((id) => {
  const arr = byWho[id];
  const flagged = arr.filter((x) => x.flag);
  // 감정이 큰 줄: 감정 메모가 있고 '평소 · 확인 · 한마디'가 아닌 것부터, 대본 순서를 고르게
  const strong = arr.filter((x) => !x.flag && emo[x.key] && !/평소|확인하듯|한마디|짧게$/.test(emo[x.key].ko));
  const rest = arr.filter((x) => !x.flag && !strong.includes(x));
  const pickEven = (a, n) => (a.length <= n ? a : Array.from({ length: n }, (_, i) => a[Math.floor((i * a.length) / n)]));
  const sample = all ? arr.filter((x) => !x.flag) : [...pickEven(strong, per), ...pickEven(rest, Math.max(0, per - strong.length))].slice(0, per);
  const rows = [...flagged, ...sample].map((x) => {
    const src = path.join(dir, manifest[x.key]);
    const rel = `a/${x.key}${path.extname(src)}`;
    fs.copyFileSync(src, path.join(OUT, rel));
    files.push(rel);
    return { key: x.key, text: x.text, kind: KIND[x.voice] || '', emo: emo[x.key]?.ko || '평소', sim: x.sim, flag: x.flag, try: x.try, src: rel };
  });
  return { id, name: qcast[id].name, n: arr.length, nflag: flagged.length, rows };
});
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const total = Object.values(byWho).reduce((n, a) => n + a.length, 0);
const nflag = Object.values(byWho).reduce((n, a) => n + a.filter((x) => x.flag).length, 0);
const html = `<title>바리스타3 음성 듣기 2</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@500;700&family=Noto+Sans+KR:wght@400;600&display=swap">
<style>
/* 게임의 디자인 언어 '바닷가 밤'(css/skin-sea.css): 짙은 바다색 판 + 가는 금색 테두리 + 금색 명조 제목, 긴 글은 밝은 종이. 한 가지 모습(밤)으로만.
   배치: 사람마다 판 하나, 그 안에 '들어 볼 줄' 먼저 · 감정이 큰 줄 */
:root {
  color-scheme: dark;
  --sea: #0E1B2A; --plate: #15283B; --plate-hi: #1F3A54; --gold: #D9B36A; --gold-dim: #9C8556;
  --parch: #F3EBDD; --ink: #2A2420; --ink-soft: #6B5E52; --main: #25844A; --text: #E9E4DA; --muted: #A9B3BF; --warn: #E0A35A; --warn-ink: #8A4B12;
  --font-title: 'Hahmlet', 'Noto Serif KR', 'Batang', serif; --font-body: 'Noto Sans KR', 'Pretendard', 'Malgun Gothic', system-ui, sans-serif;
}
body { background: var(--sea); color: var(--text); font-family: var(--font-body); font-size: 16px; line-height: 1.6; }
.wrap { max-width: 980px; margin: 0 auto; padding-block: 28px 72px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 22px; }
h1, h2 { font-family: var(--font-title); color: var(--gold); margin: 0; font-weight: 700; text-wrap: balance; }
h1 { font-size: clamp(26px, 5vw, 34px); }
h2 { font-size: 21px; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items: baseline; }
h2 small { font-family: var(--font-body); font-size: 13px; font-weight: 400; color: var(--muted); }
.lede { margin: 6px 0 0; color: var(--muted); max-width: 66ch; }
.sum { display: flex; flex-wrap: wrap; gap: 8px 18px; color: var(--muted); font-size: 14px; }
.sum b { color: var(--text); font-variant-numeric: tabular-nums; }
.save { font-size: 13px; color: var(--muted); }
.save.bad { color: var(--warn); }
.person { background: var(--plate); border: 1px solid var(--gold-dim); outline: 1px solid rgba(217,179,106,.22); outline-offset: -5px; border-radius: 14px; padding: 16px; display: grid; gap: 10px; }
.head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; }
ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
li { background: var(--parch); color: var(--ink); border-radius: 10px; padding: 10px 12px; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; border: 2px solid transparent; }
li.flag { border-color: var(--warn); }
li.redo { background: #F6E2CF; }
.say { margin: 0; font-weight: 600; min-width: 0; }
.meta { grid-column: 2 / 4; margin: 0; font-size: 13px; color: var(--ink-soft); }
.meta .f { color: var(--warn-ink); font-weight: 600; }
.tag { font-size: 12px; background: #E3D6BF; border-radius: 999px; padding: 0 7px; margin-right: 6px; }
button { font: inherit; cursor: pointer; }
.play, .seq, .redo-b { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 6px 12px; font-size: 14px; min-height: 36px; border: 1px solid transparent; }
.play { background: var(--main); color: #fff; width: 40px; justify-content: center; padding: 0; }
.play.playing { background: var(--gold); color: var(--ink); }
.seq { background: transparent; color: var(--gold); border-color: var(--gold-dim); }
.seq.playing { background: var(--gold); color: var(--ink); }
.redo-b { background: #fff; color: var(--ink); border-color: #CDBEA6; }
.redo-b[aria-pressed="true"] { background: var(--warn); border-color: var(--warn); }
.redo-b[aria-pressed="true"]::before { content: '✓ '; }
.ic { width: 0; height: 0; border-left: 9px solid currentColor; border-top: 6px solid transparent; border-bottom: 6px solid transparent; }
.playing .ic { width: 9px; height: 11px; border: 0; border-left: 3px solid currentColor; border-right: 3px solid currentColor; }
button:focus-visible { outline: 3px solid var(--gold); outline-offset: 2px; }
.num { font-variant-numeric: tabular-nums; }
.bar { position: sticky; bottom: 0; z-index: 2; background: var(--plate); border-top: 1px solid var(--gold-dim); margin: 0 -16px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: center; }
.bar .save { font-size: 14px; }
.bar button { background: transparent; color: var(--gold); border: 1px solid var(--gold-dim); border-radius: 999px; padding: 6px 14px; min-height: 36px; }
.bar button[disabled] { opacity: .45; cursor: default; }
#list { display: none; width: 100%; min-height: 9em; box-sizing: border-box; background: var(--parch); color: var(--ink); border-radius: 10px; border: 0; padding: 10px; font: 13px/1.5 var(--font-body); }
#list.on { display: block; }
@media (max-width: 600px) { li { grid-template-columns: auto minmax(0, 1fr); } .redo-b { grid-column: 1 / -1; justify-self: start; } .meta { grid-column: 1 / -1; } }
</style>
<div class="wrap">
  <header>
    <h1>바리스타3 음성 듣기</h1>
    <p class="lede">Qwen3로 만든 대사를 사람마다 몇 줄씩 들어 봅니다. 노란 테두리는 도구가 '들어 볼 줄'로 표시한 것(목소리가 덜 닮았거나 길이가 어긋남)이고, 나머지는 감정이 큰 줄입니다. 다르게 들리는 줄은 [다시 만들기]를 눌러 두세요.</p>
  </header>
  <div class="sum"><span>만든 줄 <b>${total.toLocaleString('en-US')}</b></span><span>들어 볼 줄 <b>${nflag}</b></span><span>이 화면의 줄 <b>${people.reduce((n, p) => n + p.rows.length, 0)}</b></span></div>
  ${people.map((p) => `
  <section class="person" aria-labelledby="h-${p.id}">
    <div class="head">
      <h2 id="h-${p.id}">${esc(p.name)}<small>${p.n}줄 만듦${p.nflag ? ` · 들어 볼 줄 ${p.nflag}` : ''}</small></h2>
      <button class="seq" type="button" data-seq="${p.id}"><span class="ic" aria-hidden="true"></span>이어 듣기</button>
    </div>
    <ol>${p.rows.map((r) => `
      <li class="${r.flag ? 'flag' : ''}" data-key="${r.key}" data-who="${p.id}">
        <button class="play" type="button" data-src="${r.src}" aria-label="듣기: ${esc(r.text.slice(0, 30))}"><span class="ic" aria-hidden="true"></span></button>
        <p class="say">${r.kind ? `<span class="tag">${r.kind}</span>` : ''}${esc(r.text)}</p>
        <button class="redo-b" type="button" aria-pressed="false" data-key="${r.key}">다시 만들기</button>
        <p class="meta">감정: ${esc(r.emo)} · 닮음 <span class="num">${r.sim.toFixed(3)}</span>${r.try > 1 ? ` · ${r.try}번째 시도` : ''}${r.flag ? ` · <span class="f">${esc(r.flag)} 확인</span>` : ''}</p>
      </li>`).join('')}
    </ol>
  </section>`).join('')}
  <div class="bar"><span>다시 만들 줄 <b id="cnt">0</b></span><span class="save" id="save" aria-live="polite">표시를 불러오는 중이에요.</span><button type="button" id="show" disabled>표시한 줄 모아 보기</button><button type="button" id="copy" hidden>복사하기</button><textarea id="list" readonly aria-label="다시 만들 줄 목록"></textarea></div>
</div>
<script>
(() => {
  const audio = new Audio();
  let cur = null, queue = [], seqBtn = null;
  const $ = (s) => document.querySelector(s);
  const stop = () => { audio.pause(); if (cur) cur.classList.remove('playing'); cur = null; };
  const endSeq = () => { queue = []; if (seqBtn) seqBtn.classList.remove('playing'); seqBtn = null; };
  const play = (b) => { stop(); cur = b; b.classList.add('playing'); audio.src = b.dataset.src; audio.play().catch(stop); };
  audio.addEventListener('ended', () => { if (cur) cur.classList.remove('playing'); cur = null; const n = queue.shift(); if (n) setTimeout(() => play(n), 400); else endSeq(); });
  // 표시는 이 브라우저에도 기억하고(localStorage, 다시 열어도 남음), 페이지 db 'redo/{key}'에 저장해 Claude 가 읽음.
  // db 가 늦게 오거나 저장이 안 되는 화면이어도 표시가 사라지지 않고, [표시한 줄 모아 보기]로 글로 옮길 수 있음.
  const LS = 'b3listen.redo';
  const redo = {};
  const pending = new Set();
  try { for (const k of JSON.parse(localStorage.getItem(LS) || '[]')) redo[k] = true; } catch (e) {}
  const keep = () => { try { localStorage.setItem(LS, JSON.stringify(Object.keys(redo))); } catch (e) {} };
  const say = (t, bad) => { $('#save').textContent = t; $('#save').classList.toggle('bad', !!bad); };
  const rowOf = (k) => document.querySelector('li[data-key="' + k + '"]');
  const marked = () => Object.keys(redo).filter((k) => rowOf(k));
  const listText = () => marked().map((k) => { const li = rowOf(k); return li.dataset.who + ' | ' + k + ' | ' + li.querySelector('.say').lastChild.textContent; }).join(String.fromCharCode(10));
  const paint = () => {
    document.querySelectorAll('li[data-key]').forEach((li) => { const on = !!redo[li.dataset.key]; li.classList.toggle('redo', on); li.querySelector('.redo-b').setAttribute('aria-pressed', String(on)); });
    const n = marked().length;
    $('#cnt').textContent = n; $('#show').disabled = n === 0;
    if ($('#list').classList.contains('on')) $('#list').value = listText();
  };
  let db = null, dbState = 'wait';
  const writing = {};
  const NOSAVE = '이 화면에서는 저장되지 않아요. [표시한 줄 모아 보기]를 복사해 대화창에 붙여 주세요.';
  const save = (key, who, on) => {
    keep();
    if (!db) { if (dbState === 'none') say(NOSAVE, true); return; }
    pending.add(key);
    const ref = db.collection('redo').doc(key);
    writing[key] = (writing[key] || Promise.resolve()).then(() => (on ? ref.set({ who, at: new Date().toISOString() }) : ref.delete()))
      .then(() => { pending.delete(key); say('저장했어요'); })
      .catch(() => { pending.delete(key); say('저장하지 못했어요. [표시한 줄 모아 보기]를 복사해 대화창에 붙여 주세요.', true); });
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('seq')) { const was = seqBtn === b; endSeq(); stop(); if (was) return; seqBtn = b; b.classList.add('playing'); queue = [...document.querySelectorAll('li[data-who="' + b.dataset.seq + '"] .play')]; play(queue.shift()); return; }
    if (b.classList.contains('play')) { endSeq(); if (cur === b) { stop(); return; } play(b); return; }
    if (b.classList.contains('redo-b')) { const k = b.dataset.key; if (redo[k]) delete redo[k]; else redo[k] = true; paint(); save(k, b.closest('li').dataset.who, !!redo[k]); return; }
    if (b.id === 'show') { const on = !$('#list').classList.contains('on'); $('#list').classList.toggle('on', on); $('#copy').hidden = !on; b.textContent = on ? '목록 닫기' : '표시한 줄 모아 보기'; paint(); return; }
    if (b.id === 'copy') {
      const t = $('#list'); t.select();
      const ok = () => say('복사했어요. 대화창에 붙여 주세요.');
      const old = () => { try { document.execCommand('copy'); ok(); } catch (e) { say('목록을 길게 눌러 복사해 주세요.', true); } };
      if (navigator.clipboard) navigator.clipboard.writeText(t.value).then(ok, old); else old();
    }
  });
  paint();
  (async () => {
    db = window.claude && window.claude.use ? await window.claude.use('db') : null;
    if (!db) { dbState = 'none'; say(marked().length ? NOSAVE : '이 화면에서는 표시가 이 브라우저에만 남아요. 다 고른 뒤 [표시한 줄 모아 보기]를 복사해 대화창에 붙여 주세요.', true); return; }
    dbState = 'ok';
    let first = true;
    db.collection('redo').onSnapshot((snap) => {
      const there = new Set(snap.docs.map((d) => d.id));
      if (first) {
        // 처음: 저장되기 전에 누른 표시(이 브라우저에만 있던 것)를 db 에 올리고, db 에 있는 것은 더함
        first = false;
        for (const k of Object.keys(redo)) if (!there.has(k) && rowOf(k)) save(k, rowOf(k).dataset.who, true);
        for (const k of there) redo[k] = true;
        if (!pending.size) say('표시하면 바로 저장돼요');
      } else {
        for (const k of Object.keys(redo)) if (!there.has(k) && !pending.has(k)) delete redo[k];
        for (const k of there) if (!pending.has(k)) redo[k] = true;
      }
      keep(); paint();
    }, () => say('저장된 표시를 불러오지 못했어요. [표시한 줄 모아 보기]를 복사해 대화창에 붙여 주세요.', true));
  })();
})();
</script>
`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, 'files.json'), JSON.stringify(files));
console.log(`듣기 화면: ${people.length}명 · ${files.length}줄 → ${path.relative(root, OUT)}/index.html (만든 줄 ${total} · 들어 볼 줄 ${nflag})`);
