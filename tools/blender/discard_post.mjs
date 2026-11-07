/**
 * 잔 버리기 영상: 블렌더 렌더 장면(assets/_src/blender/discard/{종류}/f0000.png …) → assets/_src/movies/discard_{종류}.mp4
 *   node tools/blender/discard_post.mjs [mug,glass,paper,plastic]   → 그다음 npm run movies(게임 영상 webm + 마지막 장면)
 *   node tools/blender/discard_post.mjs move [glass_plastic,mug_paper] → 옮겨 담기 영상(…/blender/move/{이름} → assets/_src/movies/move_{이름}.mp4, 검수 13.79)
 * 렌더: blender --background --factory-startup --python tools/blender/scene_bench.py -- C:/AI/game3/assets/_src/blender discard
 * 2026-11-06 사용자 "블랜더로 만들어서 넣어야 해. flow 영상으로 만들면 안된다"(검수 13.67). 렌더 장면 PNG 는 git 에 넣지 않음(.gitignore)
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const FPS = 24; // scene_bench.py 의 DISCARD_FPS
const MOVE = process.argv[2] === 'move'; // 옮겨 담기 영상(scene_bench.py … move)
const SRC = path.join(root, 'assets', '_src', 'blender', MOVE ? 'move' : 'discard');
const PRE = MOVE ? 'move' : 'discard';
const OUT = path.join(root, 'assets', '_src', 'movies');

const kinds = ((MOVE ? process.argv[3] : process.argv[2]) || (MOVE ? 'glass_plastic,mug_paper' : 'mug,glass,paper,plastic')).split(',');
fs.mkdirSync(OUT, { recursive: true });
let bad = 0;
for (const k of kinds) {
  const dir = path.join(SRC, k);
  const n = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /^f\d{4}\.png$/.test(f)).length : 0;
  if (!n) { console.error(`  ✗ ${k}: 렌더 장면이 없어요(${path.relative(root, dir)})`); bad += 1; continue; }
  const mp4 = path.join(OUT, `${PRE}_${k}.mp4`);
  const r = spawnSync(FFMPEG, ['-hide_banner', '-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(dir, 'f%04d.png'),
    '-an', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', mp4], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(`  ✗ ${k}: ${(r.stderr || '').trim().split('\n').slice(-3).join(' ')}`); bad += 1; continue; }
  console.log(`  ✓ ${PRE}_${k}.mp4: ${n}장 · ${(n / FPS).toFixed(1)}초 · ${Math.round(fs.statSync(mp4).size / 1024)}KB`);
}
process.exitCode = bad ? 1 : 0;
