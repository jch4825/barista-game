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
  5. 말 끝이 잘린 후보(마지막 소리가 아직 나는 채 끝남: 끝에서 '톡' 튐, 2026-11-06 사용자 검수 13.65)는 길이가 어긋난 것처럼 낮게 침.
     끝 소리가 반쯤에서 뚝 끊긴 후보(마지막 큰 소리가 30ms 안에 사라짐: '쌌다'의 '다'가 끊김, 2026-11-07 사용자 검수 13.68)도 같이 다시.
     고른 것은 말 끝 뒤 0.25초를 남기고 자르고, 파일 끝을 짧게 줄여(fade) 조용히 끝나게 함. 잘린 채 쓴 줄은 '끝' 표시.
     끝 검사는 50ms(검수 13.69: 40 · 50ms 줄도 끊겨 들림), 후보 가운데 끝이 100ms 에 가까운 것을 고름(목소리가 닮은 것이 먼저).
     ㄱ · ㄷ · ㅂ 소리 받침으로 끝나는 말('창밖' · '머그컵')은 원래 끝이 짧아 끝 검사를 하지 않음.
  6. 그래도 끝이 50ms 안에 사라지는 줄은 '끝 늘이기'(stretch_end): 마지막 글자가 잦아드는 부분만 높낮이 그대로 늘여 0.1초쯤에 걸쳐 잦아들게
     (사용자 2026-11-07 '끝 늘이기가 맞다'). 이미 만든 파일은 --stretch 로(모델 없이 몇 분).
  7. 그 사람의 평소 빠르기(기록의 1초에 몇 자, 가운데 값)보다 15% 넘게 느린 후보는 '느림'으로 낮게 침(끝 길이보다 먼저).
     끝이 천천히 잦아드는 후보만 고르니 문장 사이를 1초씩 쉬며 천천히 읽은 후보가 뽑혀, 안내 163줄이 느려졌음(검수 13.70 '새 배지').
     말 앞의 조용한 곳은 0.12초만 남김. 후보가 모두 느리면(목록처럼 끊어 읽는 줄: 마침표마다 1초씩 쉼) 0.95초 넘는 쉼의 조용한 가운데만
     잘라 0.6초(나레이션 0.8초)로 줄임(tighten_pauses, 소리 나는 곳은 그대로라 목소리가 바뀌지 않음).
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
K = 2            # 다시 만들 때 한 줄의 후보 수(첫 시도는 하나: 대부분 첫 시도에 통과함)
BATCH = 16       # 한 번에 만드는 줄 수
SYL_BUDGET = 640   # 한 묶음의 글자 수 합(후보마다 셈). 긴 줄은 이보다 덜 묶음(검수 13.69: 1024 로도 안내의 긴 줄을 다시 만들 때 메모리가 넘쳐 묶음 하나에 12분, 검수 13.70)
SIM_MIN = 0.975  # 본보기와 이만큼 닮지 않으면 다시(짧은 줄은 지문이 덜 정확해 0.97). 흔들린 사장님 줄은 0.96 ~ 0.97이었음
SR_OUT = 24000
TOKENS_PER_SEC = 12.5  # 12Hz 말소리 토큰


def sim_min(text: str) -> float:
    return 0.97 if syllables(text) <= 8 else SIM_MIN


def max_tokens(texts) -> int:
    """말이 끝나지 않는 후보가 묶음 전체를 붙잡지 않게: 가장 긴 줄을 1초에 2자로 읽는 길이 + 3초"""
    n = max(syllables(t) for t in texts)
    return int((n / 2.0 + 3.0) * TOKENS_PER_SEC)


def find_ffmpeg() -> str | None:
    for c in (os.environ.get("FFMPEG"), shutil.which("ffmpeg")):
        if c and Path(c).exists():
            return c
    return None


def syllables(text: str) -> int:
    return len(re.findall(r"[가-힣]", text))


CUT_DB = -55.0   # 파일 마지막 10ms 의 세기가 이보다 크면 '말 끝이 잘림'(소리가 나는 채 끝나 '톡' 튐, 검수 13.65)
FADE_S = 0.03    # 파일 끝을 줄이는 길이(잘린 끝도 튀지 않게)


def cut_end(w, sr) -> bool:
    """소리가 아직 나는 채 파일이 끝났는지(마지막 10ms RMS > CUT_DB)"""
    import numpy as np
    n = max(1, int(sr * 0.01))
    tail = w[-n:] if len(w) >= n else w
    return bool(20 * np.log10(float(np.sqrt(np.mean(tail ** 2) + 1e-12)) + 1e-9) > CUT_DB)


ABRUPT_MS = 50  # 말 끝이 이보다 빨리 사라지면 '끝 소리가 끊김'(마지막 '다' · '요'가 반쯤에서 뚝: 모델이 말을 다 하기 전에 멈춤, 검수 13.68. 처음 30 → 40 · 50ms 줄도 끊겨 들려 50, 검수 13.69)
LONG_MS = 100   # 후보 가운데 고를 때 끝이 이만큼 천천히 잦아드는 것까지 더 낫게 침(사용자 2026-11-07 '100ms', 검수 13.69)
PACE_MIN = 0.85  # 그 사람의 평소 빠르기(가운데 값)의 이만큼보다 느리면 '느림': 끝만 보고 고르니 문장 사이를 1초씩 쉬는 후보가 뽑혔음(검수 13.70)
LEAD_S = 0.12    # 말 앞의 조용한 곳은 이만큼만 남김(다시 만든 안내가 0.5초 늦게 말을 시작했음, 검수 13.70)


def pace_norm(pid: str, made: dict, text_of: dict) -> float:
    """그 사람의 평소 빠르기: 기록된 줄(9자 이상)의 1초에 몇 자, 가운데 값. 기록이 적으면 0(빠르기를 보지 않음)"""
    v = sorted(r["rate"] for k, r in made.items() if r.get("who") == pid and r.get("rate") and syllables(text_of.get(k, "")) > 8)
    return float(v[len(v) // 2]) if len(v) >= 10 else 0.0


PAUSE_MAX = 0.95  # 말 사이 쉼이 이보다 길면 줄임(다시 만들어도 느린 줄만: 모델이 마침표마다 1초씩 쉬었음, 검수 13.70)
PAUSE_KEEP = {"jieun": 0.8}  # 줄여서 남기는 쉼(초). 나레이션 · 속마음(지은의 목소리)은 원래 문장 사이를 길게 쉬어 0.8, 그 밖 0.6
PAUSE_KEEP_DEFAULT = 0.6


def tighten_pauses(w, sr, keep: float):
    """말 사이의 긴 쉼(PAUSE_MAX 초 넘게 조용한 곳)을 keep 초로: 조용한 곳의 가운데만 잘라내고 10ms 를 겹쳐 이음. → (소리, 줄인 ms)"""
    import numpy as np
    w = np.asarray(w, dtype=np.float32)
    h = max(1, int(sr * 0.01)); nf = len(w) // h
    if nf < 20:
        return w, 0
    db = 20 * np.log10(np.sqrt((w[: nf * h].reshape(nf, h) ** 2).mean(1)) + 1e-9)
    idx = np.where(db > max(float(db.max()) - 35, -50))[0]
    cuts = []
    for a, b in zip(idx[:-1], idx[1:]):
        quiet = (int(b) - int(a) - 1) * h
        if quiet > PAUSE_MAX * sr:
            s0 = (int(a) + 1) * h + int(keep * sr / 2)
            cuts.append((s0, s0 + quiet - int(keep * sr)))
    if not cuts:
        return w, 0
    xf = int(sr * 0.01); r = np.linspace(0, 1, xf, dtype=np.float32)
    removed = 0
    for s0, s1 in reversed(cuts):  # 뒤에서부터 잘라야 앞 자리가 그대로
        mix = w[s0:s0 + xf] * (1 - r) + w[s1:s1 + xf] * r
        w = np.concatenate([w[:s0], mix, w[s1 + xf:]])
        removed += s1 - s0
    return w, int(removed * 1000 / sr)


def pace_ok(rate: float, text: str, norm: float) -> bool:
    """짧은 말('덜컹!')은 원래 빠르기가 들쭉날쭉해 보지 않음"""
    return syllables(text) <= 8 or not norm or rate >= PACE_MIN * norm


def fall_ms(w, sr) -> int:
    """마지막 큰 소리(가장 큰 소리 -20 dB 위)에서 -40 dB 밑으로 떨어지기까지(ms). 자연스러운 끝은 60 ~ 120ms 에 걸쳐 잦아듦"""
    import numpy as np
    h = max(1, int(sr * 0.01))
    n = len(w) // h
    if n < 10:
        return 999
    db = 20 * np.log10(np.sqrt((np.asarray(w[: n * h], dtype=np.float32).reshape(n, h) ** 2).mean(1)) + 1e-9)
    pk = float(db.max())
    strong = np.where(db > pk - 20)[0]
    if not len(strong):
        return 999
    after = np.where(db[strong[-1]:] < pk - 40)[0]
    return int(after[0]) * 10 if len(after) else 999


STOP_JONG = {1, 2, 3, 9, 24, 7, 19, 20, 22, 23, 25, 27, 17, 18, 26, 14}  # 받침이 ㄱ · ㄷ · ㅂ 소리(컵 · 밖 · 컹 · 맛): 원래 끝이 짧게 닫힘


def closed_end(text: str) -> bool:
    """마지막 글자가 ㄱ · ㄷ · ㅂ 소리 받침으로 끝나는지('창밖' · '머그컵' · '덜컹!'): 이런 말은 끝이 빨리 닫히는 것이 자연스러워 끝 검사 · 끝 늘이기를 하지 않음(검수 13.69)"""
    hs = re.findall(r"[가-힣]", text)
    return bool(hs) and (ord(hs[-1]) - 0xAC00) % 28 in STOP_JONG


def fall_ok(fall: int, text: str) -> bool:
    return closed_end(text) or fall > ABRUPT_MS


STRETCH_AIM = 130  # 끝 늘이기: 잦아드는 부분을 (이 값 / 지금 걸리는 시간)배로 늘임(2.6배까지). 실제로는 0.1초쯤에 걸쳐 잦아듦(검수 13.69 시험 16줄: 가운데 110ms)


def _wsola(x, f, sr):
    """높낮이는 그대로 두고 길이만 f 배로(WSOLA: 20ms 조각을 겹쳐 잇되, 앞 조각과 가장 잘 이어지는 자리를 ±4ms 안에서 찾음)"""
    import numpy as np
    N = int(sr * 0.02); Hs = N // 4; Ha = Hs / f; tol = int(sr * 0.004)
    win = np.hanning(N).astype(np.float32)
    n_out = int(len(x) * f)
    y = np.zeros(n_out + N, np.float32); norm = np.zeros_like(y)
    xp = np.concatenate([np.zeros(tol, np.float32), x, np.zeros(N + tol, np.float32)])
    prev, k = 0, 0
    while k * Hs < n_out:
        nom = int(k * Ha) + tol
        pos = nom
        if k:
            ref = xp[prev + Hs: prev + Hs + N]
            if len(ref) < N:  # 소리 끝에서 앞 조각이 모자람(검수 13.69: 안내의 짧은 말에서 멈췄음)
                break
            best = -1e9
            for off in range(-tol, tol + 1, 2):
                c = xp[nom + off: nom + off + N]
                if len(c) < N:
                    break
                v = float(np.dot(ref, c))
                if v > best:
                    best, pos = v, nom + off
        seg = xp[pos: pos + N]
        if len(seg) < N:
            break
        y[k * Hs: k * Hs + N] += seg * win; norm[k * Hs: k * Hs + N] += win
        prev, k = pos, k + 1
    norm[norm < 1e-3] = 1.0
    return (y / norm)[:n_out]


def stretch_end(w, sr, text=""):
    """끝 늘이기(사용자 2026-11-07 '끝 늘이기가 맞다', 검수 13.69): 마지막 글자가 ABRUPT_MS 안에 사라지면, 마지막 큰 소리 30ms 앞부터 다 잦아든 뒤 20ms 까지만
    높낮이는 그대로 천천히 늘임(모델을 쓰지 않아 목소리 · 말투는 그대로, 줄은 0.11 ~ 0.16초 길어짐). → (소리, 늘였으면 늘인 뒤의 fall_ms 아니면 None)"""
    import numpy as np
    if closed_end(text):
        return w, None
    h = max(1, int(sr * 0.01)); n = len(w) // h
    if n < 10:
        return w, None
    db = 20 * np.log10(np.sqrt((np.asarray(w[: n * h], dtype=np.float32).reshape(n, h) ** 2).mean(1)) + 1e-9)
    pk = float(db.max()); strong = np.where(db > pk - 20)[0]
    if not len(strong):
        return w, None
    st = int(strong[-1]); after = np.where(db[st:] < pk - 40)[0]
    if not len(after) or int(after[0]) * 10 > ABRUPT_MS:
        return w, None
    f = min(2.6, STRETCH_AIM / max(int(after[0]) * 10, 20))
    a = max(0, (st - 3) * h); b = min(len(w), (st + int(after[0]) + 2) * h)
    w = np.asarray(w, dtype=np.float32)
    mid = _wsola(w[a:b], f, sr)
    xf = min(len(mid), int(sr * 0.005)); r = np.linspace(0, 1, xf, dtype=np.float32)
    mid[:xf] = mid[:xf] * r + w[a:a + xf] * (1 - r)  # 앞 이음매
    out = np.concatenate([w[:a], mid, w[b:]]).astype(np.float32)
    return out, fall_ms(out, sr)


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
    """말이 끝난 뒤 0.25초만 남기고 자름 · 너무 크면 줄임(찢어짐 막기) · 끝을 짧게 줄임(FADE_S, 소리가 나는 채 끝나도 튀지 않게)
    · 뒤에 조용한 0.15초를 붙임(파일이 말 끝에서 바로 끝나 다음 소리와 붙지 않게)"""
    import numpy as np
    cut = min(len(w), int((end + 0.25) * sr))
    w = np.array(w[:cut], dtype=np.float32)
    h = max(1, int(sr * 0.01)); nf = len(w) // h
    if nf > 10:  # 말 앞의 조용한 곳은 LEAD_S 만(약한 첫소리 'ㅅ' · 'ㅎ'이 잘리지 않게 가장 큰 소리 -45 dB 위부터 셈)
        db = 20 * np.log10(np.sqrt((w[: nf * h].reshape(nf, h) ** 2).mean(1)) + 1e-9)
        on = np.where(db > max(float(db.max()) - 45, -60))[0]
        a = max(0, int(on[0]) * h - int(sr * LEAD_S)) if len(on) else 0
        if a > 0:
            w = w[a:]
            m = min(len(w), int(sr * 0.005))
            w[:m] *= np.linspace(0, 1, m, dtype=np.float32)
    peak = float(np.max(np.abs(w))) if len(w) else 0.0
    if peak > 0.98:
        w = w * (0.98 / peak)
    n = min(len(w), int(sr * FADE_S))
    if n > 1:
        w[-n:] *= (0.5 + 0.5 * np.cos(np.linspace(0, np.pi, n))).astype(np.float32)
    return np.concatenate([w, np.zeros(int(sr * 0.15), dtype=np.float32)])


def stretch_existing(lines, owner, only, want_keys, manifest, made, voice_dir, manifest_path, made_path) -> int:
    """--stretch: 이미 만든 파일의 끝 늘이기. 옛 파일은 assets/_src/_check/voice_redo/stretch_old/ 에 남김. 한 번 늘인 줄(기록의 long)은 다시 늘이지 않음"""
    import numpy as np
    import soundfile as sf
    ffmpeg = find_ffmpeg()
    if not ffmpeg:
        print("ffmpeg 이 없어 끝 늘이기를 못 해요")
        return 1
    keep = ROOT / "assets" / "_src" / "_check" / "voice_redo" / "stretch_old"
    keep.mkdir(parents=True, exist_ok=True)
    n = seen = 0
    for l in lines:
        pid = owner.get(l["voice"])
        rel = manifest["lines"].get(l["key"])
        if not pid or not rel or (only and pid not in only) or (want_keys and l["key"] not in want_keys):
            continue
        rec = made.get(l["key"], {})
        if rec.get("long") or not (voice_dir / rel).exists():
            continue
        seen += 1
        w, sr = sf.read(str(voice_dir / rel))
        w = (w.mean(axis=1) if w.ndim > 1 else w).astype(np.float32)
        out, longer = stretch_end(w, sr, l["text"])
        if not longer:
            continue
        shutil.copyfile(voice_dir / rel, keep / Path(rel).name)
        wav = voice_dir / "lines" / f"{l['key']}.tmp.wav"
        sf.write(str(wav), out, sr)
        ogg = voice_dir / "lines" / f"{l['key']}.ogg"
        r = subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", str(wav), "-ac", "1", "-c:a", "libopus", "-b:a", "40k", str(ogg)], capture_output=True)
        wav.unlink(missing_ok=True)
        if r.returncode != 0:
            print(f"  ✗ {l['key']} 저장 못 함: {r.stderr[:120]}")
            continue
        manifest["lines"][l["key"]] = f"lines/{ogg.name}"
        rec = {**rec, "long": longer}
        if "끝" in rec.get("flag", ""):
            rec["flag"] = "·".join(x for x in rec["flag"].split("·") if x != "끝")
        made[l["key"]] = rec
        n += 1
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    made_path.write_text(json.dumps(made, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"끝 늘이기: 살펴본 줄 {seen} · 늘인 줄 {n} (옛 파일 → {keep})")
    return 0


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
    ap.add_argument("--flagged", action="store_true", help="'들어 볼 줄'(qwen_made.json 의 flag)만 다시: 후보를 --k 개씩, 지금 것보다 나을 때만 바꿈")
    ap.add_argument("--stretch", action="store_true", help="모델 없이: 이미 만든 파일 가운데 끝이 ABRUPT_MS 안에 사라지는 줄만 끝 늘이기(검수 13.69)")
    ap.add_argument("--k", type=int, default=0, help="모든 시도의 후보 수(기본: 첫 시도 1 · 다시 2, --flagged 면 4)")
    args = ap.parse_args()
    global K
    k_all = args.k or (4 if args.flagged else 0)
    if k_all:
        K = k_all

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
    if args.stretch:
        return stretch_existing(lines, owner, only, want_keys, manifest, made, voice_dir, manifest_path, made_path)
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
        if args.flagged and not made.get(l["key"], {}).get("flag"):
            continue
        p = qcast[pid]
        ref_file = ROOT / p["refFile"]
        emo = (emotions.get(l["key"]) or {}).get("en", "")
        sig = sig_of(pid, ref_file, p["ref"], emo, l["text"])
        rel = manifest["lines"].get(l["key"])
        if not args.force and not args.flagged and rel and (voice_dir / rel).exists() and made.get(l["key"], {}).get("sig") == sig:
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
    for items in by_person.values():  # 길이가 비슷한 줄끼리 묶어야 짧은 줄이 긴 줄을 기다리지 않음
        items.sort(key=lambda t: syllables(t["text"]))
    t0 = time.time()
    done_n, flagged = 0, 0
    text_of = {l["key"]: l["text"] for l in lines}
    for pid, items in by_person.items():
        item, a_emb = anchor(pid)
        norm = pace_norm(pid, made, text_of)  # 평소 빠르기(검수 13.70)
        desc = qcast[pid]["en"]
        first = {"ok": 0, "n": 0}  # 첫 시도(감정 지시만)로 통과한 수: 절반 밑이면 그 사람은 목소리 설명부터(사장님)
        # 한 번에 만드는 소리는 평소(16줄 × 후보 2)만큼까지: --flagged(후보 4)에서 16줄씩이면 그래픽카드 메모리가 모자랐음(검수 13.68)
        step = max(1, min(BATCH, BATCH * 2 // K))
        # 긴 줄은 덜 묶음: 묶음의 글자 수 합(후보 K개를 셈)이 SYL_BUDGET 을 넘지 않게. 안내의 50 ~ 160자 줄을 16줄씩 묶으니
        # 그래픽카드 메모리가 넘쳐 컴퓨터 메모리를 14GB 빌려 쓰며 묶음 하나에 12 ~ 15분이 걸렸음(검수 13.69, 짧은 줄은 1 ~ 2분)
        spans, b0 = [], 0
        while b0 < len(items):
            n, total = 0, 0
            while b0 + n < len(items) and n < step:
                s = syllables(items[b0 + n]["text"]) * K
                if n and total + s > SYL_BUDGET:
                    break
                total += s
                n += 1
            spans.append((b0, n))
            b0 += n
        for b0, n in spans:
            batch = items[b0:b0 + n]
            best = {t["key"]: None for t in batch}
            desc_first = first["n"] >= 8 and first["ok"] < first["n"] / 2
            # 시도: plain = 감정 지시(있으면) · desc = 목소리 설명 + 감정 지시 · 마지막은 씨앗을 바꿔 plain 으로
            styles = ("desc", "plain", "plain") if desc_first else ("plain", "desc", "plain")
            for attempt, style in enumerate(styles, 1):
                need = [t for t in batch if best[t["key"]] is None or not best[t["key"]]["ok"] or best[t["key"]]["sim"] < sim_min(t["text"])]
                if not need:
                    break
                kk = K if (k_all or attempt > 1) else 1
                texts, ins = [], []
                for t in need:
                    instr = t["emo"] if style == "plain" else f"{desc} {t['emo']}".strip()
                    for _ in range(kk):
                        texts.append(t["text"])
                        ins.append(ins_ids(instr))
                torch.manual_seed(int(t0) % 100000 + b0 * 7 + attempt * 101)
                try:
                    wavs, sr = base.generate_voice_clone(text=texts, language=[LANG] * len(texts), voice_clone_prompt=[item] * len(texts), instruct_ids=ins,
                                                         max_new_tokens=max_tokens(texts))
                except Exception as exc:  # noqa: BLE001
                    print(f"  ✗ {pid} 묶음 {b0} 시도 {attempt}: {exc}", flush=True)
                    torch.cuda.empty_cache()
                    continue
                for j, t in enumerate(need):
                    for c in range(kk):
                        w = np.asarray(wavs[j * kk + c], dtype=np.float32)
                        ok, rate, end = check(w, sr, t["text"])
                        cut = cut_end(w, sr)  # 말 끝이 잘린 후보는 길이가 어긋난 것처럼 낮게(검수 13.65)
                        fall = fall_ms(trim(w, sr, end), sr)  # 끝 소리가 반쯤에서 뚝 끊긴 후보도 다시(검수 13.68: 지은의 줄 절반이 그랬음). 파일에 들어갈 소리로 잼: 말 뒤 0.25초 밖의 잡음을 '긴 끝'으로 치지 않게(검수 13.69)
                        sim = float(a_emb @ emb(w, sr))
                        fine = fall_ok(fall, t["text"])  # ㄱ · ㄷ · ㅂ 받침으로 끝나는 말은 끝이 짧아도 괜찮음(검수 13.69)
                        pace = pace_ok(rate, t["text"], norm)
                        cand = {"ok": ok and not cut and fine and pace, "len_ok": ok, "cut": cut or not fine, "pace": pace, "fall": fall, "sim": round(sim, 4), "rate": rate, "try": attempt, "style": style, "w": w, "end": end}
                        cur = best[t["key"]]
                        # 목소리가 닮은 것이 끝 길이보다 먼저(아주 짧은 말이 흔들렸음, 검수 13.69). 빠르기도 끝 길이보다 먼저(검수 13.70: 끝이 긴 후보 = 천천히 쉬며 읽은 후보였음)
                        rank = lambda c: (c["ok"], c["sim"] >= sim_min(t["text"]), c["pace"], 0 if closed_end(t["text"]) else min(c["fall"], LONG_MS), c["sim"])
                        if cur is None or rank(cand) > rank(cur):
                            best[t["key"]] = cand
                    if attempt == 1:
                        b1 = best[t["key"]]
                        first["n"] += 1
                        first["ok"] += bool(b1 and b1["ok"] and b1["sim"] >= sim_min(t["text"]) and style == "plain")
            for t in batch:
                b = best[t["key"]]
                if b is None:
                    print(f"  ✗ {t['key']} ({pid}) 만들지 못함: {t['text'][:30]}", flush=True)
                    continue
                old = made.get(t["key"])
                old_ok = not any(x in old.get("flag", "") for x in ("길이", "끝", "느림")) if old else False  # 끝이 잘린 줄도 '나쁜 것'(검수 13.68)
                if args.flagged and old and old.get("sig") == t["sig"] and (old_ok, old.get("sim", 0)) >= (b["ok"], b["sim"]):
                    flagged += 1  # 다시 만든 것이 지금 것보다 낫지 않으면 지금 것을 그대로 둠
                    done_n += 1
                    continue
                out, longer = stretch_end(trim(b["w"], sr, b["end"]), sr, t["text"])  # 끝이 빨리 사라진 채 고른 줄은 끝 늘이기(검수 13.69)
                tight = 0
                if not b.get("pace", True):  # 후보가 모두 느림: 긴 쉼만 줄이고 다시 잼(검수 13.70)
                    out, tight = tighten_pauses(out, sr, PAUSE_KEEP.get(pid, PAUSE_KEEP_DEFAULT))
                    if tight:
                        _, b["rate"], _ = check(out, sr, t["text"])
                        b["pace"] = pace_ok(b["rate"], t["text"], norm)
                flag = []
                if b.get("cut") and not longer:
                    flag.append("끝")  # 후보가 모두 끝이 잘렸고 늘이지도 못함(소리가 나는 채 끝남 등): 끝을 줄여(trim) 튀지는 않지만 들어 볼 줄
                if not b.get("len_ok", b["ok"]):
                    flag.append("길이")  # 글자 수에 비해 말이 너무 길거나 짧음(끝 검사와 따로, 검수 13.69)
                if b["sim"] < sim_min(t["text"]):
                    flag.append("목소리")
                if not b.get("pace", True):
                    flag.append("느림")  # 후보가 모두 평소보다 15% 넘게 느림(검수 13.70)
                flagged += bool(flag)
                write_line(t, out, sr, {
                    "who": pid, "sig": t["sig"], "sim": b["sim"], "rate": b["rate"], "fall": b.get("fall"), **({"long": longer} if longer else {}), **({"tight": tight} if tight else {}), "try": b["try"], "style": b["style"],
                    "emo": bool(t["emo"]), "flag": "·".join(flag), "at": time.strftime("%Y-%m-%d %H:%M"),
                })
                done_n += 1
            save()
            del best
            torch.cuda.empty_cache()  # 묶음마다 빈 메모리를 돌려줌(쌓여서 컴퓨터 메모리로 넘치지 않게)
            el = time.time() - t0
            print(f"  {done_n}/{len(todo)} · {pid} · {el / 60:.1f}분 · 남은 예상 {el / done_n * (len(todo) - done_n) / 60:.0f}분 · 들어 볼 줄 {flagged}", flush=True)
    save()
    print(f"끝! 이번에 {done_n}줄 · 들어 볼 줄(목소리 · 길이 표시) {flagged} → {manifest_path}", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
