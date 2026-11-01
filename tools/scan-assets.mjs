/**
 * 에셋 목록 만들기
 *   node tools/scan-assets.mjs
 * 1) assets/audio/{sfx,amb}/ 의 파일 → assets/audio/manifest.json(비공개 서브모듈: 사서 쓰는 소리)
 *    assets/music/ 의 배경음악 → assets/music/manifest.json(공개: 저작자가 AI로 만든 곡, 2026-11-01)
 * 2) 그림 폴더(assets/stand, bg, cg, photos, sd, items, emotes, vfx, ui, objects, shots) + 영상(assets/movies) → assets/images.json
 * 파일 이름(확장자 뺀 것)이 곧 ID 입니다. 소리 ID 는 tools/audio/audio_map.mjs, 그림의 원래 이름은 assets/_src/SOURCES.md 참고.
 * 디스크에 있는 파일만 목록에 넣으므로, 지운 파일은 다시 실행하면 목록에서도 빠집니다(없는 종류는 빈 목록).
 * 음성 목록(assets/voice/manifest.json)이 없으면 빈 목록을 만듭니다.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const audioDir = path.join(root, 'assets', 'audio');
const EXT = ['.ogg', '.mp3', '.wav', '.m4a'];
const RANK = { '.ogg': 0, '.mp3': 1, '.m4a': 2, '.wav': 3 };

const musicDir = path.join(root, 'assets', 'music');
const manifest = { bgm: {}, sfx: {}, amb: {} };
for (const kind of Object.keys(manifest)) {
  const dir = kind === 'bgm' ? musicDir : path.join(audioDir, kind);
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) {
    const ext = path.extname(f).toLowerCase();
    if (!EXT.includes(ext)) continue;
    const id = path.basename(f, path.extname(f));
    const prev = manifest[kind][id];
    if (!prev || RANK[ext] < RANK[path.extname(prev)]) manifest[kind][id] = kind === 'bgm' ? f : `${kind}/${f}`;
  }
}
fs.writeFileSync(path.join(audioDir, 'manifest.json'), `${JSON.stringify({ sfx: manifest.sfx, amb: manifest.amb }, null, 2)}\n`);
fs.writeFileSync(path.join(musicDir, 'manifest.json'), `${JSON.stringify({ bgm: manifest.bgm }, null, 2)}\n`);
const count = (k) => Object.keys(manifest[k]).length;
console.log(`오디오 목록: BGM ${count('bgm')} · 효과음 ${count('sfx')} · 환경음 ${count('amb')} → assets/audio/manifest.json · assets/music/manifest.json`);

// 그림: 같은 ID가 여러 형식으로 있으면 png > webp > jpg 순서로 고름
const IMG_KINDS = ['stand', 'bg', 'cg', 'photos', 'sd', 'items', 'emotes', 'vfx', 'ui', 'objects', 'shots']; // shots: 손 기술의 한 컷(블렌더 장면 + 단계 프레임)
const IMG_EXT = { '.png': 0, '.webp': 1, '.jpg': 2, '.jpeg': 3 };
const images = {};
for (const kind of IMG_KINDS) {
  images[kind] = {};
  const dir = path.join(root, 'assets', kind);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    const ext = path.extname(f).toLowerCase();
    if (!(ext in IMG_EXT)) continue;
    const id = path.basename(f, path.extname(f));
    const prev = images[kind][id];
    if (!prev || IMG_EXT[ext] < IMG_EXT[path.extname(prev).toLowerCase()]) images[kind][id] = `${kind}/${f}`;
  }
}
// 영상(npm run movies): {ID}.webm(투명 VP9) + 마지막 장면 {ID}_end.png
images.movies = {};
const movieDir = path.join(root, 'assets', 'movies');
if (fs.existsSync(movieDir)) {
  for (const f of fs.readdirSync(movieDir)) {
    const ext = path.extname(f).toLowerCase();
    if (ext === '.webm' || ext === '.png') images.movies[path.basename(f, path.extname(f))] = `movies/${f}`;
  }
}
fs.writeFileSync(path.join(root, 'assets', 'images.json'), `${JSON.stringify(images, null, 2)}\n`);
console.log(`그림 목록: ${[...IMG_KINDS, 'movies'].map((k) => `${k} ${Object.keys(images[k]).length}`).join(' · ')} → assets/images.json`);

const voiceManifest = path.join(root, 'assets', 'voice', 'manifest.json');
if (!fs.existsSync(voiceManifest)) {
  fs.mkdirSync(path.dirname(voiceManifest), { recursive: true });
  fs.writeFileSync(voiceManifest, `${JSON.stringify({ version: 1, lines: {} }, null, 2)}\n`);
  console.log('음성 목록이 없어 빈 목록을 만들었어요 → assets/voice/manifest.json');
}
