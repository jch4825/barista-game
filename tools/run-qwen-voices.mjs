/**
 * Qwen3 TTS 음성 생성 실행기(검수 13.58)
 *   node tools/run-qwen-voices.mjs [--limit N] [--only 사람,…] [--keys key,…] [--out 폴더] [--force] [--dry]
 * Qwen3 를 돌리는 파이썬(QWEN_PY 또는 기본 경로: 영어 음성 프로그램 Voice Generator-Local 의 가상환경, 고치지 않음)으로
 * tools/voice/qwen_voices.py 를 실행합니다. 모델 폴더는 QWEN_MODELS(기본 C:\AI\qwen3-tts-models).
 * 이 컴퓨터에서만 돌아갑니다(모델 · 그래픽카드).
 */

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  process.env.QWEN_PY,
  'C:\\AI\\Voice Generator-Local\\.venv\\Scripts\\python.exe',
].filter(Boolean);
const py = candidates.find((p) => fs.existsSync(p));
if (!py) {
  console.error('Qwen3 를 돌릴 파이썬을 찾지 못했어요. QWEN_PY 에 qwen-tts 가 깔린 파이썬 경로를 적어 주세요.');
  process.exit(2);
}
console.log(`파이썬: ${py}`);
const child = spawn(py, ['-X', 'utf8', path.join(root, 'tools', 'voice', 'qwen_voices.py'), ...process.argv.slice(2)], {
  stdio: 'inherit', cwd: root, env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
});
child.on('exit', (code) => process.exit(code ?? 0));
