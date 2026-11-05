"""
Qwen3 TTS로 대사 음성 만들기(사용자 결정 2026-11-05 '새 ②', 검수 13.52 ~ 13.58)

  (Qwen3 를 돌리는 파이썬으로: node tools/run-qwen-voices.mjs [옵션] 이 찾아서 실행)
  python tools/voice/qwen_voices.py [--limit N] [--only 사람,…] [--keys key,…] [--out 폴더] [--force] [--dry]

방법(사람마다)
  1. 그 사람의 본보기 소리(tools/voice/qwen_cast.json 의 refFile · 그 소리가 읽은 문장 ref)를 Base 모델이 듣고,
  2. 줄마다 감정 메모(tools/voice/emotions.json 의 en)를 감정 지시로 함께 받아 읽음. 메모가 없으면 감정 지시 없이.
  3. 한 줄에 후보 둘(K)을 만들어, 글자 수에 맞는 길이인 것 가운데 본보기와 목소리 지문(Base 의 화자 인코더)이 가장 닮은 것을 고름.
  4. 지문이 0.98 밑이거나 길이가 어긋나면 다시: 감정 지시 앞에 그 사람의 목소리 설명(en)을 붙여(사장님이 흔들렸을 때 고친 방법),
     그래도 안 되면 씨앗을 바꿔 한 번 더. 끝까지 안 되면 가장 나은 것을 쓰고 '들어 볼 줄'로 표시.
입력: tools/voice/lines.json(npm run lines) · qwen_cast.json · emotions.json
출력: assets/voice/lines/{key}.ogg(Opus 40k, 게임과 같은 이름) · assets/voice/manifest.json
기록: tools/voice/qwen_made.json(줄마다 사람 · 닮음 · 빠르기 · 시도 · 표시 · 서명). 서명(본보기 · 문장 · 감정 지시)이 바뀐 줄만 다시 만듦.
     --out 을 주면 그 폴더에 lines/ · manifest.json · qwen_made.json 을 따로 씀(시험용, 게임 음성은 그대로).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODELS = Path(os.environ.get("QWEN_MODELS", r"C:\AI\qwen3-tts-models"))
BASE_MODEL = "Qwen3-TTS-12Hz-1.7B-Base"
LANG = "Korean"
K = 2            # 한 줄의 후보 수
BATCH = 8        # 한 번에 만드는 줄 수(후보까지 BATCH × K 개)
SIM_MIN = 0.98   # 본보기와 이만큼 닮지 않으면 다시
SR_OUT = 24000


def find_ffmpeg() -> str | None:
    for c in (os.environ.get("FFMPEG"), shutil.which("ffmpeg")):
        if c and Path(c).exists():
            return c
    return None


def syllables(text: str) -> int:
    return len(re.findall(r"[가-힣]", text))


def check(w, sr, text):
    """글자 수에 비해 말 길이가 알맞은지(덧붙인 말 · 잘린 말 막기)와 끝 침묵. → (ok, 1초에 몇 자, 말 끝 자리(초))"""
    import numpy as np
    hop = int(sr * 0.02)
    if len(w) < hop * 4:
        return False, 0.0, 0.0
    rms = np.sqrt(np.array([np.mean(w[i:i + hop] ** 2) for i in range(0, len(w) - hop, hop)]) + 1e-12)
    db = 20 * np.log10(rms + 1e-9)
    idx = np.where(db > max(db.max() - 35, -55))[0]
    if not len(idx):
        return False, 0.0, 0.0
    speech = (idx[-1] - idx[0]) * 0.02
    end = (idx[-1] + 1) * 0.02
    n = syllables(text)
    if n == 0:  # 한글이 없는 줄(…, ?!): 길이로는 못 봄
        return speech < 3.0, 0.0, end
    rate = n / speech if speech > 0 else 0.0
    lo, hi = (1.5, 10.0) if n <= 4 else (2.5, 8.5)
    tail = len(w) / sr - end
    return bool(lo <= rate <= hi and tail <= 1.5), round(float(rate), 2), end


def trim(w, sr, end):
    """말이 끝난 뒤 0.25초만 남기고 자름 · 너무 크면 줄임(찢어짐 막기)"""
    import numpy as np
    cut = min(len(w), int((end + 0.25) * sr))
    w = w[:cut]
    peak = float(np.max(np.abs(w))) if len(w) else 0.0
    if peak > 0.98:
        w = w * (0.98 / peak)
    return w


def sig_of(person, ref_file: Path, ref_text, emo_en, text):
    st = ref_file.stat()
    raw = f"{BASE_MODEL}|{person}|{ref_file.name}|{st.st_size}|{ref_text}|{emo_en}|{text}"
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:12]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="이번에 만들 최대 줄 수(시험용)")
    ap.add_argument("--only", default="", help="이 사람(qwen_cast.json 의 id)만, 쉼표로 여럿")
    ap.add_argument("--keys", default="", help="이 줄(lines.json 의 key)만, 쉼표로 여럿")
    ap.add_argument("--out", default="", help="결과를 따로 둘 폴더(시험용). 없으면 assets/voice")
    ap.add_argument("--force", action="store_true", help="이미 만든 줄도 다시")
    ap.add_argument("--dry", action="store_true", help="만들지 않고 몇 줄인지 · 걸릴 시간만")
    args = ap.parse_args()

    voice_dir = Path(args.out) if args.out else ROOT / "assets" / "voice"
    out_dir = voice_dir / "lines"
    manifest_path = voice_dir / "manifest.json"
    made_path = (voice_dir / "qwen_made.json") if args.out else ROOT / "tools" / "voice" / "qwen_made.json"

    lines = json.loads((ROOT / "tools" / "voice" / "lines.json").read_text(encoding="utf-8"))
    qcast = json.loads((ROOT / "tools" / "voice" / "qwen_cast.json").read_text(encoding="utf-8"))["people"]
    emotions = json.loads((ROOT / "tools" / "voice" / "emotions.json").read_text(encoding="utf-8"))["lines"]
    owner = {}
    for pid, p in qcast.items():
        owner[pid] = pid
        for c in p.get("covers", []):
            owner[c] = pid
    manifest = {"version": 1, "lines": {}}
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        manifest.setdefault("lines", {})
    made = json.loads(made_path.read_text(encoding="utf-8")) if made_path.exists() else {}

    # 대본에서 사라진 줄: 실제로 만들 때만 게임 음성 폴더에서 정리(--dry · --out 에서는 세기만)
    keys_now = {l["key"] for l in lines}
    stale = [k for k in manifest["lines"] if k not in keys_now] if not args.out else []

    only = {s.strip() for s in args.only.split(",") if s.strip()}
    want_keys = {s.strip() for s in args.keys.split(",") if s.strip()}
    skipped = {}
    todo = []
    for l in lines:
        pid = owner.get(l["voice"])
        if not pid:
            skipped[l["voice"]] = skipped.get(l["voice"], 0) + 1
            continue
        if only and pid not in only:
            continue
        if want_keys and l["key"] not in want_keys:
            continue
        p = qcast[pid]
        ref_file = ROOT / p["refFile"]
        emo = (emotions.get(l["key"]) or {}).get("en", "")
        sig = sig_of(pid, ref_file, p["ref"], emo, l["text"])
        rel = manifest["lines"].get(l["key"])
        if not args.force and rel and (voice_dir / rel).exists() and made.get(l["key"], {}).get("sig") == sig:
            continue
        todo.append({**l, "pid": pid, "emo": emo, "sig": sig})
    if skipped:
        print(f"목소리가 정해지지 않은 줄(건너뜀): {skipped}")
    if args.limit:
        todo = todo[: args.limit]
    secs = sum(syllables(t["text"]) for t in todo) / 4.5
    print(f"만들 줄: {len(todo)} / 전체 {len(lines)} · 소리 약 {secs / 60:.0f}분 · 만드는 데 약 {secs * K / 1.8 / 3600:.1f}시간(어림, 다시 만드는 줄 빼고)")
    if stale:
        print(f"대본에서 사라진 줄 {len(stale)}개{'(만들 때 정리함)' if args.dry else '를 정리해요.'}")
    if args.dry:
        return 0
    for k in stale:
        (voice_dir / manifest["lines"].pop(k)).unlink(missing_ok=True)
        made.pop(k, None)
    if stale:
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    if not todo:
        return 0

    import numpy as np
    import soundfile as sf
    import torch
    from qwen_tts import Qwen3TTSModel

    ffmpeg = find_ffmpeg()
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"모델을 불러와요: {MODELS / BASE_MODEL} · ffmpeg: {'있음' if ffmpeg else '없음(wav로 저장)'}", flush=True)
    base = Qwen3TTSModel.from_pretrained(str(MODELS / BASE_MODEL), device_map="cuda:0", dtype=torch.bfloat16, attn_implementation="sdpa")

    def emb(w, sr=SR_OUT):
        with torch.inference_mode():
            e = base.model.extract_speaker_embedding(audio=np.asarray(w, dtype=np.float32), sr=sr).float().cpu().numpy()
        return e / np.linalg.norm(e)

    def ins_ids(text):
        return base._tokenize_texts([base._build_instruct_text(text)])[0] if text else None

    anchors = {}

    def anchor(pid):
        if pid not in anchors:
            p = qcast[pid]
            ref_file = ROOT / p["refFile"]
            item = base.create_voice_clone_prompt(ref_audio=str(ref_file), ref_text=p["ref"])[0]
            w, sr = sf.read(str(ref_file))
            if w.ndim > 1:
                w = w.mean(axis=1)
            if sr != SR_OUT:
                import librosa
                w = librosa.resample(y=w.astype(np.float32), orig_sr=sr, target_sr=SR_OUT)
            anchors[pid] = (item, emb(w))
        return anchors[pid]

    def save():
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        made_path.write_text(json.dumps(made, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    def write_line(t, w, sr, info):
        wav = out_dir / f"{t['key']}.wav"
        sf.write(str(wav), w, sr)
        rel = f"lines/{wav.name}"
        if ffmpeg:
            ogg = wav.with_suffix(".ogg")
            r = subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-c:a", "libopus", "-b:a", "40k", str(ogg)], capture_output=True)
            if r.returncode == 0 and ogg.exists():
                wav.unlink(missing_ok=True)
                rel = f"lines/{ogg.name}"
        manifest["lines"][t["key"]] = rel
        made[t["key"]] = info

    # 사람마다 모아서, BATCH 줄씩(후보 K개씩) 한꺼번에
    by_person = {}
    for t in todo:
        by_person.setdefault(t["pid"], []).append(t)
    t0 = time.time()
    done_n, flagged = 0, 0
    for pid, items in by_person.items():
        item, a_emb = anchor(pid)
        desc = qcast[pid]["en"]
        for b0 in range(0, len(items), BATCH):
            batch = items[b0:b0 + BATCH]
            best = {t["key"]: None for t in batch}
            # 시도: 1 = 감정 지시(있으면) · 2 = 목소리 설명 + 감정 지시 · 3 = 씨앗을 바꿔 1과 같게
            for attempt in (1, 2, 3):
                need = [t for t in batch if best[t["key"]] is None or not best[t["key"]]["ok"] or best[t["key"]]["sim"] < SIM_MIN]
                if not need:
                    break
                texts, ins = [], []
                for t in need:
                    instr = t["emo"] if attempt != 2 else f"{desc} {t['emo']}".strip()
                    for _ in range(K):
                        texts.append(t["text"])
                        ins.append(ins_ids(instr))
                torch.manual_seed(int(t0) % 100000 + b0 * 7 + attempt * 101)
                try:
                    wavs, sr = base.generate_voice_clone(text=texts, language=[LANG] * len(texts), voice_clone_prompt=[item] * len(texts), instruct_ids=ins)
                except Exception as exc:  # noqa: BLE001
                    print(f"  ✗ {pid} 묶음 {b0} 시도 {attempt}: {exc}", flush=True)
                    torch.cuda.empty_cache()
                    continue
                for j, t in enumerate(need):
                    for c in range(K):
                        w = np.asarray(wavs[j * K + c], dtype=np.float32)
                        ok, rate, end = check(w, sr, t["text"])
                        sim = float(a_emb @ emb(w, sr))
                        cand = {"ok": ok, "sim": round(sim, 4), "rate": rate, "try": attempt, "w": w, "end": end}
                        cur = best[t["key"]]
                        if cur is None or (cand["ok"], cand["sim"]) > (cur["ok"], cur["sim"]):
                            best[t["key"]] = cand
            for t in batch:
                b = best[t["key"]]
                if b is None:
                    print(f"  ✗ {t['key']} ({pid}) 만들지 못함: {t['text'][:30]}", flush=True)
                    continue
                flag = []
                if not b["ok"]:
                    flag.append("길이")
                if b["sim"] < SIM_MIN:
                    flag.append("목소리")
                flagged += bool(flag)
                write_line(t, trim(b["w"], sr, b["end"]), sr, {
                    "who": pid, "sig": t["sig"], "sim": b["sim"], "rate": b["rate"], "try": b["try"],
                    "emo": bool(t["emo"]), "flag": "·".join(flag), "at": time.strftime("%Y-%m-%d %H:%M"),
                })
                done_n += 1
            save()
            el = time.time() - t0
            print(f"  {done_n}/{len(todo)} · {pid} · {el / 60:.1f}분 · 남은 예상 {el / done_n * (len(todo) - done_n) / 60:.0f}분 · 들어 볼 줄 {flagged}", flush=True)
    save()
    print(f"끝! 이번에 {done_n}줄 · 들어 볼 줄(목소리 · 길이 표시) {flagged} → {manifest_path}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
