/**
 * Supertonic 음성 생성 실행기
 *   node tools/run-voices.mjs [--limit N] [--force] [--only VOICE]
 * Supertonic 가상환경 파이썬(SUPERTONIC_PY 또는 기본 경로)으로 tools/voice/build_voices.py 를 실행합니다.
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  process.env.SUPERTONIC_PY,
  'C:\\AI\\supertonic3-local-tts-20260520-r2\\supertonic3-local-tts\\.venv-win\\Scripts\\python.exe',
  'python',
].filter(Boolean);
const py = candidates.find((p) => p === 'python' || fs.existsSync(p));
console.log(`파이썬: ${py}`);
const child = spawn(py, ['-X', 'utf8', path.join(root, 'tools', 'voice', 'build_voices.py'), ...process.argv.slice(2)], { stdio: 'inherit', cwd: root });
child.on('exit', (code) => process.exit(code ?? 0));
