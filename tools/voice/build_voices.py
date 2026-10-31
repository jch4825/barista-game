"""
Supertonic 3 로컬 TTS로 대사 음성 만들기

  (Supertonic 가상환경 파이썬으로 실행)
  python tools/voice/build_voices.py [--limit N] [--force] [--only VOICE]

입력: tools/voice/lines.json (node tools/export-lines.mjs 로 생성)
배정: tools/voice/voice_cast.json
출력: assets/voice/lines/{key}.ogg (ffmpeg 가 있으면 Opus, 없으면 .wav)
목록: assets/voice/manifest.json  { "version": 1, "lines": { key: "lines/key.ogg" } }

이미 만든 줄은 건너뜁니다. 대사를 고치면 key 가 바뀌어 그 줄만 새로 만들어집니다.
"""

from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_TTS = Path(r"C:\AI\supertonic3-local-tts-20260520-r2\supertonic3-local-tts")
TTS_DIR = Path(os.environ.get("SUPERTONIC_DIR", DEFAULT_TTS))
sys.path.insert(0, str(TTS_DIR / "src"))


def find_ffmpeg() -> str | None:
    cand = [
        os.environ.get("FFMPEG"),
        shutil.which("ffmpeg"),
        str(TTS_DIR.parent / "supertonic3-desktop" / "resources" / "ffmpeg" / "ffmpeg.exe"),
    ]
    for c in cand:
        if c and Path(c).exists():
            return c
    return None


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="이번에 만들 최대 줄 수(시험용)")
    ap.add_argument("--force", action="store_true", help="이미 있는 줄도 다시 만들기")
    ap.add_argument("--only", default="", help="이 목소리 ID만 (예: yeonwoo)")
    args = ap.parse_args()

    try:
        from supertonic3_engine import Supertonic3Engine
    except Exception as exc:  # noqa: BLE001
        print(f"[오류] Supertonic 엔진을 불러오지 못했어요: {exc}")
        print(f"       SUPERTONIC_DIR 확인: {TTS_DIR}")
        return 2

    lines = json.loads((ROOT / "tools" / "voice" / "lines.json").read_text(encoding="utf-8"))
    cast = json.loads((ROOT / "tools" / "voice" / "voice_cast.json").read_text(encoding="utf-8"))
    voice_dir = ROOT / "assets" / "voice"
    out_dir = voice_dir / "lines"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = voice_dir / "manifest.json"
    manifest = {"version": 1, "lines": {}}
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
            manifest.setdefault("lines", {})
        except Exception:  # noqa: BLE001
            pass

    keys_now = {l["key"] for l in lines}
    stale = [k for k in manifest["lines"] if k not in keys_now]
    for k in stale:
        f = voice_dir / manifest["lines"].pop(k)
        if f.exists():
            f.unlink()
    if stale:
        print(f"대본에서 사라진 줄 {len(stale)}개를 정리했어요.")

    def done(l):
        rel = manifest["lines"].get(l["key"])
        return bool(rel) and (voice_dir / rel).exists()

    todo = [l for l in lines if (args.force or not done(l)) and (not args.only or l["voice"] == args.only)]
    if args.limit:
        todo = todo[: args.limit]
    if not todo:
        print("새로 만들 줄이 없어요. 모든 음성이 준비되어 있어요.")
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        return 0

    ffmpeg = find_ffmpeg()
    print(f"만들 줄: {len(todo)} / 전체 {len(lines)} · ffmpeg: {'있음' if ffmpeg else '없음(wav로 저장)'}")
    engine = Supertonic3Engine(output_dir=out_dir)
    total_step = int(cast.get("_total_step", 8))
    lang = cast.get("_lang", "ko")
    t0 = time.time()
    for i, l in enumerate(todo, 1):
        c = cast.get(l["voice"]) or cast.get("narr") or {"voice": "F2", "speed": 1.0}
        wav = out_dir / f"{l['key']}.wav"
        try:
            engine.synthesize_to_file(
                text=l["text"], output_path=wav, voice=c["voice"], lang=lang,
                speed=float(c.get("speed", 1.0)), total_step=total_step, silence_duration=0.15, verbose=False,
            )
        except Exception as exc:  # noqa: BLE001
            print(f"  ✗ {l['key']} ({l['voice']}): {exc}")
            continue
        rel = f"lines/{wav.name}"
        if ffmpeg:
            ogg = wav.with_suffix(".ogg")
            r = subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-c:a", "libopus", "-b:a", "40k", str(ogg)], capture_output=True)
            if r.returncode == 0 and ogg.exists():
                wav.unlink(missing_ok=True)
                rel = f"lines/{ogg.name}"
        manifest["lines"][l["key"]] = rel
        if i % 20 == 0 or i == len(todo):
            manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
            el = time.time() - t0
            print(f"  {i}/{len(todo)} 완료 · {el:.0f}초 · 남은 예상 {el / i * (len(todo) - i):.0f}초", flush=True)
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"끝! 음성 {len(manifest['lines'])}줄 준비됨 → assets/voice/manifest.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
