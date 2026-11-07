"""
지은의 스탠딩에서 초록 앞치마만 산 앞치마 색으로(2026-11-08 사용자 '추천 순서', 검수 13.91)

  python -X utf8 tools/recolor-stand-apron.py            # 앞치마 넷 × 표정 여섯 → assets/stand/jieun-{앞치마}_{표정}.webp
  python -X utf8 tools/recolor-stand-apron.py --check    # 확인용 한 장(표정 여섯 × 앞치마 다섯) → assets/_src/_check/apron_stand.jpg

  - 새 AI 그림 없이 지금 스탠딩(assets/stand/jieun_{표정}.webp, 배경이 지워진 RGBA)에서 만듦. 지은의 그림이 바뀌면 다시 돌림
  - 초록 화소(색상 125~165°, 가장자리는 부드럽게)만 Lab 에서 바꿈: 주름 · 그늘(밝기 차이)과 채도의 결은 그대로, 바탕 색만 앞치마 색
    셔츠(크림) · 머리끈(노랑) · 가죽 끈(갈색) · 피부 · 머리카락은 색상이 달라 그대로
  - 앞치마 색은 꾸미기 시트의 앞치마 그림(assets/objects/apron_*.webp)에서 고른 색. 줄무늬는 그림처럼 바다색 + 크림색 세로 줄(줄 너비는 앞치마 너비에 맞춤)
  - 게임은 characters.js 의 standKey 가 입은 앞치마(store 의 grow.apron)로 jieun-{색} 그림을 고름(없으면 초록 그대로)
"""

import sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
STAND = ROOT / 'assets' / 'stand'
FACES = ['normal', 'smile', 'sad', 'determined', 'nervous', 'surprised']
WEBP = dict(quality=92, method=6, alpha_quality=100)  # import-images.py 의 STAND_WEBP 와 같게

# 앞치마 색(sRGB): 꾸미기 시트의 앞치마 그림 가운데 값을 스탠딩의 초록(49,123,78) 밝기에 맞춤
APRONS = {
    'navy': (40, 58, 92),
    'brown': (140, 96, 62),    # 가죽 끈(짙은 갈색)과 갈리게 조금 밝은 커피 빛
    'coral': (214, 108, 92),
    'stripe': (62, 106, 136),   # 줄무늬의 바다색(줄은 CREAM)
}
CREAM = (238, 230, 208)
STRIPE_PERIOD = 0.095   # 줄 한 쌍(바다색 + 크림색)의 너비 = 앞치마 너비의 9.5%(앞치마 그림처럼 열 줄쯤)
STRIPE_CREAM = 0.42     # 그 가운데 크림색 줄의 몫


def srgb_to_lin(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(c):
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


M = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
Minv = np.linalg.inv(M)
WHITE = np.array([0.95047, 1.0, 1.08883])


def to_lab(rgb):
    xyz = srgb_to_lin(rgb) @ M.T / WHITE
    e = 216 / 24389; k = 24389 / 27
    f = np.where(xyz > e, np.cbrt(xyz), (k * xyz + 16) / 116)
    return 116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])


def from_lab(L, a, b):
    fy = (L + 16) / 116; fx = fy + a / 500; fz = fy - b / 200
    e = 6 / 29
    inv = lambda t: np.where(t > e, t ** 3, 3 * e * e * (t - 4 / 29))
    xyz = np.stack([inv(fx), inv(fy), inv(fz)], -1) * WHITE
    return lin_to_srgb(xyz @ Minv.T)


def hsv(f):
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    mx = f.max(-1); mn = f.min(-1); d = mx - mn
    h = np.zeros_like(mx); m = d > 1e-6
    rm = m & (mx == r); gm = m & (mx == g) & ~rm; bm = m & ~rm & ~gm
    h[rm] = (60 * ((g - b)[rm] / d[rm]) + 360) % 360
    h[gm] = 60 * ((b - r)[gm] / d[gm]) + 120
    h[bm] = 60 * ((r - g)[bm] / d[bm]) + 240
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    return h, s, mx


def ramp(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


def lab1(rgb):
    L, a, b = to_lab(np.array(rgb, dtype=np.float64).reshape(1, 3) / 255)
    return float(L[0]), float(a[0]), float(b[0])


def recolor(im, name):
    arr = np.asarray(im.convert('RGBA'), dtype=np.float64) / 255
    rgb, alpha = arr[..., :3], arr[..., 3]
    h, s, v = hsv(rgb)
    # 초록 화소의 몫(0 ~ 1): 색상 125~165°(105 · 185 에서 0), 채도 0.18 → 0.32, 아주 어두운 먹선(v < 0.08)은 빼고
    w = ramp(h, 105, 125) * (1 - ramp(h, 165, 185)) * ramp(s, 0.18, 0.32) * ramp(v, 0.06, 0.14) * (alpha > 0.01)
    L, A, B = to_lab(rgb)
    sel = w > 0.5
    Lref, Aref, Bref = np.median(L[sel]), np.median(A[sel]), np.median(B[sel])
    Cref = np.hypot(Aref, Bref)
    dL = L - Lref
    cr = np.clip(np.hypot(A, B) / max(Cref, 1e-6), 0, 1.25)   # 채도의 결(먹선 쪽은 옅게)
    if name == 'stripe':
        ys, xs = np.where(sel)
        x0, x1 = np.percentile(xs, 1), np.percentile(xs, 99)
        period = (x1 - x0) * STRIPE_PERIOD
        X = np.arange(arr.shape[1])[None, :].repeat(arr.shape[0], 0)
        ph = ((X - (x0 + x1) / 2) / period + STRIPE_CREAM / 2) % 1.0    # 가운데에 크림색 줄
        aa = 1.0 / period                                                # 한 화소만큼 부드럽게
        cream = ramp(ph, 0, aa) * (1 - ramp(ph, STRIPE_CREAM - aa, STRIPE_CREAM))
        Lb, Ab, Bb = lab1(APRONS['stripe']); Lc, Ac, Bc = lab1(CREAM)
        Lt = Lb + (Lc - Lb) * cream; At = Ab + (Ac - Ab) * cream; Bt = Bb + (Bc - Bb) * cream
        k = 1.0 - 0.25 * cream      # 크림색 줄에서는 그늘을 조금 옅게(흰 천이 너무 어두워지지 않게)
    else:
        Lt, At, Bt = lab1(APRONS[name])
        k = 1.0
    nL = np.clip(Lt + dL * k, 0, 100)
    nA = At * cr
    nB = Bt * cr
    out = from_lab(nL, nA, nB)
    mixed = rgb * (1 - w[..., None]) + out * w[..., None]
    res = np.concatenate([mixed, alpha[..., None]], -1)
    return Image.fromarray(np.round(res * 255).astype(np.uint8), 'RGBA')


def main():
    check = '--check' in sys.argv
    tiles = []
    for face in FACES:
        src = STAND / f'jieun_{face}.webp'
        im = Image.open(src).convert('RGBA')
        row = [im]
        for name in APRONS:
            out = recolor(im, name)
            row.append(out)
            if not check:
                dst = STAND / f'jieun-{name}_{face}.webp'
                out.save(dst, 'WEBP', **WEBP)
                print('저장', dst.relative_to(ROOT))
        tiles.append(row)
    if check:
        tw, th = 300, 367
        sheet = Image.new('RGB', (tw * (len(APRONS) + 1), th * len(FACES)), (250, 250, 250))
        for r, row in enumerate(tiles):
            for c, t in enumerate(row):
                sm = t.resize((tw, th), Image.LANCZOS)
                sheet.paste(sm, (c * tw, r * th), sm)
        dst = ROOT / 'assets' / '_src' / '_check' / 'apron_stand.jpg'
        dst.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(dst, quality=88)
        print('확인용', dst)


if __name__ == '__main__':
    main()
