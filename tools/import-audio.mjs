/**
 * 사운드 팩에서 게임 소리 만들기
 *   node tools/import-audio.mjs            전체 → assets/audio/{bgm,sfx,amb}/{ID}.ogg + assets/audio/CREDITS.md
 *   node tools/import-audio.mjs bell tap   일부만
 *   node tools/import-audio.mjs --credits  소리는 그대로 두고 CREDITS.md 만 다시 씀(팩 정보를 고쳤을 때)
 * 대응표: tools/audio/audio_map.mjs · 원본 폴더: 환경 변수 SOUND_SRC (기본 C:\AI\sound effect assets)
 * 원본 파일은 프로젝트에 복사하지 않습니다. 잘라 내고 음량을 맞춘 Opus(.ogg)만 저장합니다.
 * 끝나면 `node tools/scan-assets.mjs`(npm run assets)로 목록을 갱신합니다. `npm run audio`는 둘을 이어서 실행합니다.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = process.env.SOUND_SRC || 'C:\\AI\\sound effect assets';
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FFPROBE || 'ffprobe';
const { AUDIO_MAP, PACKS, MISSING } = await import(pathToFileURL(path.join(root, 'tools', 'audio', 'audio_map.mjs')).href);
const BITRATE = { bgm: '96k', amb: '64k', sfx: '64k' };
const SR = 48000;
const ST = `aresample=${SR},aformat=sample_fmts=fltp:channel_layouts=stereo`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jobms-audio-'));

function run(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`${bin} 실행 실패: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`${bin} 오류:\n${(r.stderr || '').split('\n').slice(-6).join('\n')}`);
  return r.stderr || '';
}
const ff = (args) => run(FFMPEG, ['-hide_banner', '-nostdin', '-y', ...args]);
function duration(file) {
  const r = spawnSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return Number(r.stdout.trim());
}
function srcPath(rel) {
  // 사용자가 직접 만든 곡처럼 프로젝트 안(assets/_src/audio/, 배포에서 빠짐)에 둔 원본은 그 자리에서(2026-10-26)
  // 저작자가 AI 음악 모델(Suno 등)로 만든 배경음악(BGM/)도 그 자리에서(2026-11-01)
  const p = rel.startsWith('assets/_src/') || rel.startsWith('BGM/') ? path.join(root, rel) : path.join(SRC, rel);
  if (!fs.existsSync(p)) throw new Error(`원본이 없어요: ${rel}`);
  return p;
}

/** 입력 + 겹치기/반복 → 한 줄기 [mx] */
function graph(e) {
  const inputs = [];
  const parts = [];
  const labels = [];
  const branch = (i, o = {}) => {
    let c = `[${i}:a]${ST}`;
    if (o.trim) c += `,atrim=${o.trim[0]}:${o.trim[1]},asetpts=PTS-STARTPTS`;
    if (o.rate) c += `,asetrate=${Math.round(SR * o.rate)},aresample=${SR}`;
    if (o.gain) c += `,volume=${o.gain}dB`;
    if (o.at) c += `,adelay=${Math.round(o.at * 1000)}:all=1`;
    return c;
  };
  if (e.layers) {
    e.layers.forEach((l, i) => {
      if (l.loopInput) inputs.push('-stream_loop', String(l.loopInput));
      inputs.push('-i', srcPath(l.src));
      parts.push(`${branch(i, l)}[l${i}]`);
      labels.push(`[l${i}]`);
    });
  } else if (e.repeat) {
    const r = e.repeat;
    inputs.push('-i', srcPath(r.src));
    const outs = Array.from({ length: r.times }, (_, k) => `[r${k}]`).join('');
    parts.push(`${branch(0, { trim: r.trim, rate: r.rate })},asplit=${r.times}${outs}`);
    for (let k = 0; k < r.times; k++) {
      const g = (r.gains || [0])[k % (r.gains || [0]).length];
      parts.push(`[r${k}]volume=${g}dB,adelay=${Math.round(k * r.every * 1000)}:all=1[l${k}]`);
      labels.push(`[l${k}]`);
    }
  } else {
    if (e.loopInput) inputs.push('-stream_loop', String(e.loopInput));
    inputs.push('-i', srcPath(e.src));
    parts.push(`${branch(0)}[l0]`);
    labels.push('[l0]');
  }
  if (e.brownNoise) {
    const b = e.brownNoise;
    const idx = inputs.filter((a) => a === '-i').length;
    inputs.push('-f', 'lavfi', '-t', String(b.seconds), '-i', `anoisesrc=color=brown:amplitude=0.5:sample_rate=${SR}`);
    parts.push(`[${idx}:a]${ST},lowpass=f=${b.lowpass || 400},volume=${b.gain}dB[ln]`);
    labels.push('[ln]');
  }
  parts.push(labels.length > 1 ? `${labels.join('')}amix=inputs=${labels.length}:normalize=0:duration=longest[mx]` : `${labels[0]}anull[mx]`);

  // 다듬기: (효과음) 앞 무음 → 자르기 → 뒤 무음 → 필터 → 페이드 인
  const sfx = e.kind === 'sfx' && !e.keepSilence;
  let c = '[mx]';
  const add = (f) => { c += (c === '[mx]' ? '' : ',') + f; };
  if (sfx) add('silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.004:detection=peak');
  if (e.trim) add(`atrim=${e.trim[0]}:${e.trim[1]},asetpts=PTS-STARTPTS`);
  if (sfx) add('areverse,silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.03:detection=peak,areverse');
  if (e.highpass) add(`highpass=f=${e.highpass}`);
  if (e.lowpass) add(`lowpass=f=${e.lowpass}`);
  if (e.fadeIn) add(`afade=t=in:d=${e.fadeIn}`);
  add(ST);
  parts.push(`${c}[out]`);
  return { inputs, filter: parts.join(';') };
}

/** 이음매 없는 반복: 끝 X초를 처음 X초에 겹쳐(크로스페이드) 길이 D-X 짜리 루프로 */
function makeLoop(inWav, outWav, X) {
  const D = duration(inWav);
  const L = D - X;
  ff(['-i', inWav, '-filter_complex',
    `[0:a]asplit=3[a][b][c];[a]atrim=0:${X},asetpts=PTS-STARTPTS,afade=t=in:d=${X}:curve=qsin[h];`
    + `[b]atrim=${L}:${D},asetpts=PTS-STARTPTS,afade=t=out:d=${X}:curve=qsin[t];[h][t]amix=inputs=2:normalize=0[x];`
    + `[c]atrim=${X}:${L},asetpts=PTS-STARTPTS[m];[x][m]concat=n=2:v=0:a=1[o]`,
    '-map', '[o]', '-c:a', 'pcm_f32le', outWav]);
}

function measure(file, target) {
  if (target.lufs !== undefined) {
    const err = ff(['-i', file, '-af', 'loudnorm=print_format=json', '-f', 'null', '-']);
    const j = JSON.parse(err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1));
    const I = Number(j.input_i);
    const TP = Number(j.input_tp);
    let g = target.lufs - I;
    if (TP + g > -1) g = -1 - TP; // 소리가 깨지지 않게
    return { gain: g, info: `${I.toFixed(1)} LUFS → ${target.lufs}` };
  }
  const err = ff(['-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
  const max = Number((err.match(/max_volume:\s*(-?[\d.]+) dB/) || [])[1]);
  return { gain: target.peak - max, info: `최고 ${max.toFixed(1)} → ${target.peak} dBFS` };
}

function build(e) {
  const outDir = path.join(root, 'assets', 'audio', e.kind);
  fs.mkdirSync(outDir, { recursive: true });
  const t1 = path.join(tmp, `${e.kind}_${e.id}_1.wav`);
  const { inputs, filter } = graph(e);
  ff([...inputs, '-filter_complex', filter, '-map', '[out]', '-c:a', 'pcm_f32le', t1]);
  let work = t1;
  if (e.loop) {
    const t2 = path.join(tmp, `${e.kind}_${e.id}_2.wav`);
    makeLoop(t1, t2, e.loop);
    work = t2;
  }
  const D = duration(work);
  const { gain, info } = measure(work, e.target || { peak: -6 });
  const fade = e.fadeOut || (e.kind === 'sfx' ? 0.015 : 0);
  const af = [`volume=${gain.toFixed(2)}dB`];
  if (fade) af.push(`afade=t=out:st=${Math.max(0, D - fade).toFixed(3)}:d=${fade}`);
  const out = path.join(outDir, `${e.id}.ogg`);
  for (const f of fs.readdirSync(outDir)) if (path.parse(f).name === e.id && f !== `${e.id}.ogg`) fs.unlinkSync(path.join(outDir, f));
  ff(['-i', work, '-af', af.join(','), '-c:a', 'libopus', '-b:a', e.bitrate || BITRATE[e.kind], '-vbr', 'on', '-ar', String(SR), out]);
  return { D, info, kb: Math.round(fs.statSync(out).size / 1024) };
}

function sources(e) {
  const list = e.layers ? e.layers.map((l) => l.src) : e.repeat ? [e.repeat.src] : [e.src];
  return [...new Set(list)];
}
function packOf(rel) {
  const k = Object.keys(PACKS).find((p) => rel.startsWith(p));
  return k ? PACKS[k].name : rel.split('/')[0];
}

function writeCredits() {
  const rows = AUDIO_MAP.map((e) => {
    const src = sources(e).map((s) => `${e.pack ? PACKS[e.pack].name : packOf(s)} · \`${s.split('/').pop()}\``).join('<br>');
    return `| \`${e.kind}/${e.id}.ogg\` | ${src} | ${e.note || ''} |`;
  });
  const packs = Object.values(PACKS).map((p) => `| ${p.name} | ${p.author} | ${p.license} | ${p.bundle || ''} | ${p.ai || ''} |`);
  // 배경음악은 새 게임에 맞춰 모두 새로 넣음(직업 마1스톤 곡·「The Carousel Turn」은 2026-10-27 뺌). 2026-11-01부터 저작자가 AI 음악 모델 Suno로 만든 곡
  const noBgm = AUDIO_MAP.some((e) => e.kind === 'bgm')
    ? '\n- 배경음악은 이 제품의 저작자가 AI 음악 모델 Suno로 만든 곡입니다(2026-11-01). 끝의 무음만 잘라 음량을 맞춘 Opus(.ogg)로 넣었습니다.'
    : '\n- 배경음악은 새 게임에 맞춰 모두 새로 넣습니다(직업 마1스톤의 곡은 쓰지 않음). 지금은 배경음악 파일이 없습니다.';
  const md = `# 음악·효과음 출처와 라이선스

> \`tools/import-audio.mjs\`가 만든 파일입니다. 직접 고치지 말고 \`tools/audio/audio_map.mjs\`를 고친 뒤 \`npm run audio\`를 실행하세요.

## 라이선스
- 아래 사운드 팩은 사용자가 **Humble Bundle의 GameDev Market 묶음으로 구매한 라이선스(GameDev Market Pro)**로 씁니다. 게임에 넣어 쓸 수 있고(상업적 사용 가능), **원본 파일을 다른 사람이 그대로 내려받을 수 있게 배포하면 안 됩니다.**
- 그래서 원본(WAV)은 프로젝트에 넣지 않고, 게임에 필요한 부분만 잘라 음량을 맞춘 Opus(.ogg)로 바꿔 넣었습니다.${noBgm}
- 웹 버전을 공개 서버에 올리거나 저장소를 공개하면 이 .ogg 파일도 주소로 받을 수 있습니다. 공개 배포 전에 라이선스 조건을 다시 확인하세요.

| 팩 | 만든 곳(작곡가) | 라이선스 | 구매 | AI 관련 조건(판매 페이지) |
| :--- | :--- | :--- | :--- | :--- |
${packs.join('\n')}

## 파일별 출처 (${AUDIO_MAP.length}개)
| 게임 파일 | 원본 | 고른 이유·가공 |
| :--- | :--- | :--- |
${rows.join('\n')}

## 아직 합성음으로 재생되는 ID
- 효과음: ${MISSING.sfx.map((x) => `\`${x}\``).join(', ') || '없음'}
- 환경음: ${MISSING.amb.map((x) => `\`${x}\``).join(', ') || '없음'}
`;
  fs.writeFileSync(path.join(root, 'assets', 'audio', 'CREDITS.md'), md);
}

if (process.argv.includes('--credits')) {
  writeCredits();
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('CREDITS.md 만 다시 썼어요 → assets/audio/CREDITS.md');
  process.exit(0);
}
const only = process.argv.slice(2);
const todo = only.length ? AUDIO_MAP.filter((e) => only.includes(e.id)) : AUDIO_MAP;
if (!fs.existsSync(SRC)) {
  console.error(`[오류] 사운드 팩 폴더가 없어요: ${SRC}\n       SOUND_SRC 환경 변수로 위치를 알려 주세요.`);
  process.exit(2);
}
let ok = 0;
for (const e of todo) {
  try {
    const r = build(e);
    ok += 1;
    console.log(`  ✓ ${e.kind}/${e.id}.ogg  ${r.D.toFixed(2)}초 · ${r.info} · ${r.kb}KB`);
  } catch (ex) {
    console.log(`  ✗ ${e.kind}/${e.id}: ${ex.message}`);
  }
}
writeCredits();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`끝! ${ok}/${todo.length}개 → assets/audio/ (출처: assets/audio/CREDITS.md)`);
if (ok < todo.length) process.exitCode = 1;
