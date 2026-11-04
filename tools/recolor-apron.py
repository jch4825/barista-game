"""
장면 그림(CG)에서 지은의 남색 앞치마만 초록으로(2026-11-04 사용자 "앞치마만 초록색으로 바꿔줘봐", 검수 13.41)

  python tools/recolor-apron.py <원본 jpg> <결과 jpg> <이름>
    이름: POLY 의 장면(spring_name · haesun_two_cups). 다른 장면은 앞치마 둘레를 POLY 에 적어 더함

  - 앞치마를 둘러싼 다각형(BASE_W 너비의 원본 좌표, 2K 로 키운 그림이면 저절로 늘어남) 안에서, 남색(색상 196~222°, 가장자리는 부드럽게) 화소만 바꿈
    벽 타일(청록) · 해순 할머니의 남색 카디건처럼 다각형 밖이거나 색이 다른 것은 그대로
  - Lab 에서 밝기 · 채도의 결(주름 · 그늘)은 그대로 두고 색상만 초록(#25844A)으로. 남색보다 초록이 밝아 보이지 않게,
    첫 컵 CG(cg_spring_first_cup)의 초록 앞치마 밝기에 맞춰 밝기 1.32배 · 채도 1.45배
  - 남색 원본은 git 기록에 있음: cg_spring_name = 801837f, cg_haesun_two_cups = 1a76166
    (예: git show 801837f:assets/cg/cg_spring_name.jpg > 원본.jpg)
"""

import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

BASE_W = {'spring_name': 1376, 'haesun_two_cups': 2752}  # POLY 좌표를 적은 원본 너비
POLY = {
    # 봄 · 지은 씨(1376×768): 가슴받이 → 허리 → 등 뒤 끈 → 카운터 위까지. 오른쪽 벽 타일(x≈1075~)은 빼고
    'spring_name': [(916, 326), (977, 324), (982, 360), (992, 440), (1032, 446), (1073, 462), (1074, 560), (1072, 642),
                    (924, 642), (918, 560), (910, 470), (913, 400)],
    # 우유 두 잔(2752×1536): 뒷모습의 앞치마 치마(끈 · 리본 아래, 팔 옆 위쪽까지), 카운터 위로 보이는 곳. 오른쪽 벽 타일(y < 1286)은 빼고
    'haesun_two_cups': [(2045, 1236), (2150, 1198), (2290, 1198), (2400, 1290), (2560, 1286), (2628, 1298), (2640, 1536), (2036, 1536), (2040, 1300)],
}

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
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return L, a, b

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
    """a 에서 0, b 에서 1(사이는 부드럽게)"""
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)

def recolor(src, dst, name, L_GAIN=1.32, C_GAIN=1.45):
    im = Image.open(src).convert('RGB')
    W, H = im.size
    poly = Image.new('L', (W, H), 0)
    k = W / BASE_W[name]
    ImageDraw.Draw(poly).polygon([(x * k, y * k) for x, y in POLY[name]], fill=255)
    poly = np.asarray(poly.filter(ImageFilter.GaussianBlur(1.5)), dtype=np.float32) / 255
    f = np.asarray(im, dtype=np.float32) / 255
    h, s, v = hsv(f)
    # 남색 화소: 색상 196~222°(188 · 232 에서 0 으로), 채도 0.12 → 0.22, 아주 어두운 선은 빼고
    w_h = ramp(h, 188, 196) * (1 - ramp(h, 222, 232))
    w = poly * w_h * ramp(s, 0.12, 0.22) * ramp(v, 0.05, 0.10)
    L, a, b = to_lab(f)
    C = np.hypot(a, b)
    # 목표 색상각: #25844A
    tL, ta, tb = to_lab(np.array([[[0x25, 0x84, 0x4A]]], dtype=np.float32) / 255)
    ang = np.arctan2(tb, ta)[0, 0]
    L2 = np.clip(L * L_GAIN, 0, 100)
    C2 = C * C_GAIN
    out = from_lab(L2, C2 * np.cos(ang), C2 * np.sin(ang))
    res = f * (1 - w[..., None]) + out * w[..., None]
    Image.fromarray(np.clip(res * 255 + 0.5, 0, 255).astype(np.uint8)).save(dst, quality=90)
    print(name, 'changed px (w>0.5):', int((w > 0.5).sum()), 'target hue', round(float(np.degrees(ang)), 1))

if __name__ == '__main__':
    recolor(sys.argv[1], sys.argv[2], sys.argv[3])
