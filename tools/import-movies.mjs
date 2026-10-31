/**
 * 크로마키(초록 배경) 영상 → 게임 영상
 *   node tools/import-movies.mjs              전체 (npm run movies)
 *   node tools/import-movies.mjs {ID}         일부만
 * 원본: assets/_src/movies/{ID}.mp4 (원래 이름은 assets/_src/SOURCES.md) · 배포에서 빠짐
 * 결과: assets/movies/{ID}.webm (VP9 + 투명, 소리 없음) · assets/movies/{ID}_end.png (마지막 장면, 움직임 줄이기·영상을 못 틀 때)
 * 초록 지우기 값은 아래 MOVIES 에서 맞춥니다. 지운 결과는 _check/{ID}.png(밝은 바탕 · 어두운 바탕, 1초마다 한 장)로 확인합니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FFPROBE = process.env.FFPROBE || 'ffprobe';
const SRC = path.join(root, 'assets', '_src', 'movies');
const OUT = path.join(root, 'assets', 'movies');
const CHECK = path.join(root, 'assets', '_src', '_check');

/**
 * crop: [너비, 높이, x, y] 원본에서 쓸 자리(인물이 없는 빈 곳은 잘라 내 파일을 줄임)
 * key: 초록 색 · similarity: 얼마나 비슷한 색까지 지울지 · blend: 가장자리를 얼마나 부드럽게
 * despill: 머리카락·옷 가장자리에 비친 초록을 덜어 냄(0~1) · start: 앞에서 잘라 낼 초(없으면 처음부터)
 * 직업 마1스톤의 표지 영상(title_intro)은 지웠습니다(2026-10-27). 새 영상을 넣을 때 참고할 그때 값:
 *   { crop: [840, 720, 440, 0], key: '0x16EB17', similarity: 0.17, blend: 0.06, despill: 0.7, crf: 32, start: 2 }
 */
const MOVIES = {};

function run(bin, args) {
  const r = spawnSync(bin, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.error) throw new Error(`${bin} 실행 실패: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`${bin} 오류:\n${(r.stderr || '').split('\n').slice(-6).join('\n')}`);
  return r.stdout || '';
}
const ff = (args) => run(FFMPEG, ['-hide_banner', '-nostdin', '-v', 'error', '-y', ...args]);

function seconds(file) {
  return Number(run(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).trim());
}
function frames(file) {
  const out = run(FFPROBE, ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', file]);
  return Number(out.trim());
}

const want = process.argv.slice(2);
const ids = want.length ? want : Object.keys(MOVIES);
if (!ids.length) { console.log('MOVIES 에 등록한 영상이 없어요(새 영상을 넣으면 이 파일의 MOVIES 에 등록).'); process.exit(0); }
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(CHECK, { recursive: true });

for (const id of ids) {
  const m = MOVIES[id];
  if (!m) { console.error(`  ✗ ${id}: MOVIES 에 없는 ID`); process.exitCode = 1; continue; }
  const src = ['mp4', 'mov', 'webm'].map((x) => path.join(SRC, `${id}.${x}`)).find((p) => fs.existsSync(p));
  if (!src) { console.error(`  ✗ ${id}: 원본이 없어요 (assets/_src/movies/${id}.mp4)`); process.exitCode = 1; continue; }
  const webm = path.join(OUT, `${id}.webm`);
  const png = path.join(OUT, `${id}_end.png`);
  const [w, hgt, x, y] = m.crop;
  const vf = [
    `crop=${w}:${hgt}:${x}:${y}`,
    'format=rgba',
    `chromakey=${m.key}:${m.similarity}:${m.blend}`,
    `despill=type=green:mix=${m.despill}:expand=0.1`,
    'format=yuva420p',
  ].join(',');
  // 소리는 넣지 않음(-an). VP9 은 투명(알파)을 담을 수 있고 Chromium·Electron 이 그대로 그려 줌
  const seek = m.start ? ['-ss', String(m.start)] : [];
  ff([...seek, '-i', src, '-an', '-vf', vf, '-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', String(m.crf), '-auto-alt-ref', '0', '-row-mt', '1', webm]);
  // 마지막 장면(투명 PNG): 알파를 읽으려면 libvpx-vp9 로 풀어야 함
  const n = frames(webm);
  ff(['-c:v', 'libvpx-vp9', '-i', webm, '-vf', `select=eq(n\\,${n - 1})`, '-fps_mode', 'vfr', '-frames:v', '1', png]);
  // 확인용: 1초마다 한 장, 위는 밝은 바탕 · 아래는 어두운 바탕
  const sec = Math.max(1, Math.round(seconds(webm)));
  const tw = 280;
  const th = Math.round(tw * hgt / w / 2) * 2;
  ff(['-c:v', 'libvpx-vp9', '-i', webm, '-filter_complex',
    `[0:v]fps=1,scale=${tw}:${th},format=rgba,split=2[a][b];` +
    `color=c=0xE8D2B0:s=${tw}x${th}:r=1:d=${sec}[l];color=c=0x2A2630:s=${tw}x${th}:r=1:d=${sec}[d];` +
    `[l][a]overlay=shortest=1,tile=${sec}x1[t1];[d][b]overlay=shortest=1,tile=${sec}x1[t2];[t1][t2]vstack`,
    '-frames:v', '1', path.join(CHECK, `${id}.png`)]);
  const kb = (f) => `${Math.round(fs.statSync(f).size / 1024)}KB`;
  console.log(`  ✓ ${id}: ${n}장 · ${id}.webm ${kb(webm)} · ${id}_end.png ${kb(png)}`);
}
