"""
그림 원본 → 게임용 그림 (배경 지우기 · 자르기 · 크기 맞추기)

  python tools/import-images.py                    # assets/_src/ 의 원본을 모두 다시 만듦
  python tools/import-images.py yeonwoo_smile      # 일부만 (이름 = ID)
  npm run images                                   # 위 + 그림 목록 갱신(scan-assets)

원본 폴더(사용자가 만든 그림을 ID 이름으로 정리한 곳, 게임 배포에는 넣지 않음, 원래 이름은 assets/_src/SOURCES.md)
  assets/_src/stand/{인물}[-{의상}]_{표정}.jpg → assets/stand/….webp (품질 92: PNG 의 1/6 크기, 웹판에서 늦게 뜨지 않게 2026-10-26)
      흰색·단색·그라데이션 배경을 그림 바깥에서부터 지우고(굵은 테두리선을 벽으로 씀),
      머리부터 허벅지 위까지 잘라 900×1100 으로
  assets/_src/vfx/vfx_{종류}.jpg → assets/vfx/vfx_{종류}.png
      초록(#00FF00) 배경을 지우고(반투명 빛·김도 살림), 가운데 그림만 잘라 규격 크기 PNG로
  assets/_src/items/item_{물건}.jpg → assets/items/item_{물건}.png
      흰 배경을 그림 바깥에서부터 지우고, 물건만 정사각형으로 잘라 256×256 PNG로
  assets/_src/photos/{ID}.jpg → assets/photos/{ID}.jpg
      PHOTO_CROP 의 자리(가운데 x, 위, 아래)를 폴라로이드 비율로 잘라 620×720 JPG로 (자리를 적지 않은 사진은 건너뜀)

팔과 몸 사이·컵 손잡이 속처럼 배경이 갇힌 곳은 자동으로 지우지 않습니다(흰 셔츠·흰 컵과 구별할 수 없어서).
남는 곳이 보이면 POCKETS 에 그 안의 한 점(원본 좌표)을, 바퀴살 사이처럼 많으면 AREAS 에 범위를 적어 지웁니다.
  python tools/import-images.py --check 이름…   → assets/_src/_check/{이름}.png (어두운 바탕 + 남은 곳 분홍 번호, 좌표 출력)
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets' / '_src'
LUM = np.array([0.299, 0.587, 0.114], np.float32)

STAND_SIZE = (900, 1100)
STAND_WEBP = dict(quality=92, method=6, alpha_quality=100)   # 눈으로는 PNG 와 같고(PSNR 37~40dB, 알파는 그대로) 크기는 1/6
HEAD_MARGIN = 0.045   # 머리 위 여백(그림 높이 비율)
BODY_PART = 0.62      # 전신 키 가운데 머리부터 허벅지 위까지
# 바깥과 이어지지 않아 남는 배경(다리 사이, 팔과 허리 사이). 원본 좌표 한 점이면 그 덩어리를 지움.
# 찾는 법: 결과를 어두운 바탕에 얹어 보고, 남은 곳의 원본 좌표를 적음(색만으로는 흰 셔츠와 구별이 안 됨)
POCKETS: dict[str, list[tuple[int, int]]] = {
    'dohyun_normal': [(457, 947), (535, 506), (337, 597)],
    'dohyun_teach': [(555, 521)],
    'manager_normal': [(446, 925)],
    'manager_smile': [(450, 926), (352, 468)],
    'manager_strict': [(353, 506)],
    'manager_think': [(482, 953)],
    'yeonwoo_nervous': [(452, 941)],
    'yeonwoo_determined': [(552, 553)],
    'yeonwoo_surprised': [(531, 423)],
    'yeonwoo-interview_smile': [(454, 912)],
    'yeonwoo-interview_determined': [(471, 961), (552, 587), (535, 491)],
    'yeonwoo-interview_nervous': [(451, 911)],
    # 2026-10-30 지은(초록 앞치마 수정본) · 해순 할머니 (팔과 앞치마 사이 · 치마 아래 두 다리 사이), 2K 원본 좌표
    'jieun_normal': [(943, 1155), (990, 1384)],
    'jieun_smile': [(943, 1155), (990, 1384)],
    'jieun_nervous': [(948, 1144), (989, 1383)],
    'jieun_determined': [(959, 1223), (1011, 1447)],
    'jieun_surprised': [(955, 1121)],
    'jieun_sad': [(952, 1135)],
    'haesun_normal': [(850, 2468)],
    'haesun_smile': [(850, 2468)],
    'haesun_look': [(850, 2468)],
    # 2026-10-29 사장님 (팔과 몸 사이)
    'owner_normal': [(488, 550)],
    'owner_smile': [(488, 550)],
    'owner_think': [(488, 550)],
    'owner_strict': [(491, 595)],
    # 2026-10-12 손님·조연 (팔과 몸 사이, 가방 손잡이, 다리 사이)
    'daeri_angry': [(610, 400)],
    'daeri_normal': [(748, 301), (758, 442)],
    'auntie_normal': [(766, 484)],
    'customer-vest_normal': [(756, 325), (614, 428)],
    'customer-sporty_normal': [(763, 294), (690, 606)],
    'customer_normal': [(694, 612)],
    'customer-laptop_normal': [(697, 624)],
    'customer-coffee_normal': [(704, 622)],
    'seojin_normal': [(715, 566), (700, 593), (507, 528)],
    'hiker_normal': [(614, 137)],   # 2026-10-15 수정본: 머리 뒤로 올린 팔과 머리 사이
    # 직업 마1스톤 소품(item_*) 그림의 자리는 그림과 함께 지움(2026-10-27). 새 소품을 넣으면 같은 방식으로 적음
}
# 갇힌 곳이 많을 때 범위 안의 배경 후보를 모두 지움: ('circle', 가운데 x, y, 반지름) · ('rect', x0, y0, x1, y1) (원본 좌표)
AREAS: dict[str, list[tuple]] = {
    'seojin_normal': [('circle', 845, 565, 108), ('rect', 520, 500, 745, 618)],   # 휠체어 바퀴살 사이 · 발판 앞
}
# 앉은 사람처럼 전신 키로 재면 크기가 달라지는 그림: (배율, 가로 옮김 px). 서진은 휠체어에 앉아 있어 다른 사람과 머리 크기를 맞춤
STAND_FIT: dict[str, tuple[float, int]] = {'seojin_normal': (1.3, 60)}
# POCKETS·AREAS·STAND_FIT 좌표를 적을 때의 원본 너비. 원본을 더 큰 그림(업스케일링)으로 바꾸면 좌표를 그 비율로 늘려 씀
# 2026-10-12 손님·조연 23장은 1376px 원본으로 적었고, 2026-10-15 2752px 업스케일 원본으로 바뀜
COORD_W: dict[str, int] = {k: 1376 for k in (
    'customer-film_normal', 'customer-angry_normal', 'hiker_angry', 'grandma_normal', 'customer-laptop_normal', 'customer_normal',
    'customer-vest_normal', 'hiker_normal', 'daeri_normal', 'grandma-cardigan_normal', 'daeri_angry', 'student_normal',
    'customer-uniform_normal', 'customer-arms_normal', 'auntie_normal', 'customer-sporty_normal', 'seojin_normal',
    'customer-olive_normal', 'customer-coffee_normal', 'teacher_normal', 'customer-stripe_normal', 'customer-stripe2_normal', 'jiho_normal')}


def coord_k(stem: str, W: int) -> float:
    return W / COORD_W.get(stem, W)

ITEM_SIZE = 256
PHOTO_SIZE = (620, 720)
# 오늘의 한 장: 원본에서 쓸 자리 (가운데 x, 위 y, 아래 y). 너비는 620:720 비율. 생성 도구의 테두리·글자는 빼고 자름
# 예: 'latte': (674, 0, 768). 직업 마1스톤의 사진 8장은 지웠음(2026-10-27) → 새 사진 원본을 넣으면 여기에 적음
PHOTO_CROP: dict[str, tuple[int, int, int]] = {}

VFX_SIZE = {
    'sparkle': 128, 'star': 128, 'glow': 256, 'confetti': 256, 'ink': 256, 'steam': 256, 'bubble': 128, 'drop': 96,
    'splash': 256, 'puff': 256, 'flour': 256, 'ring': 512, 'gear': 256, 'heart': 128, 'paper': 128, 'speedlines': (1920, 360),
}


def load(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert('RGB')).astype(np.float32)


def bg_model(a: np.ndarray, band: np.ndarray) -> np.ndarray:
    """가장자리 색으로 배경을 2차 곡면으로 맞춤 (그라데이션 배경도 따라감)"""
    H, W, _ = a.shape
    yy, xx = np.mgrid[0:H, 0:W]
    x, y = xx[band] / W, yy[band] / H
    A = np.stack([np.ones_like(x), x, y, x * y, x * x, y * y], 1)
    X, Y = xx / W, yy / H
    B = np.stack([np.ones_like(X), X, Y, X * Y, X * X, Y * Y], -1)
    pred = np.zeros_like(a)
    for c in range(3):
        coef, *_ = np.linalg.lstsq(A, a[..., c][band], rcond=None)
        pred[..., c] = B @ coef
    return pred


def dilate(m: np.ndarray, r: int = 1) -> np.ndarray:
    out = m.copy()
    for _ in range(r):
        g = out.copy()
        g[1:] |= out[:-1]; g[:-1] |= out[1:]; g[:, 1:] |= out[:, :-1]; g[:, :-1] |= out[:, 1:]
        out = g
    return out


def flood(cand: np.ndarray, seed: np.ndarray) -> np.ndarray:
    """seed 에서 cand 안으로만 번지는 채우기 (상하좌우)"""
    m = seed & cand
    n = int(m.sum())
    while True:
        for _ in range(16):
            g = m.copy()
            g[1:] |= m[:-1]; g[:-1] |= m[1:]; g[:, 1:] |= m[:, :-1]; g[:, :-1] |= m[:, 1:]
            m = g & cand
        k = int(m.sum())
        if k == n:
            return m
        n = k


def unmix(a: np.ndarray, alpha: np.ndarray, bg: np.ndarray) -> np.ndarray:
    """반투명 픽셀에서 배경색을 걷어 내 본래 색을 되찾음: C = aF + (1-a)B → F"""
    al = np.maximum(alpha, 1e-3)[..., None]
    return np.clip((a - (1 - alpha)[..., None] * bg) / al, 0, 255)


def to_image(rgb: np.ndarray, alpha: np.ndarray) -> Image.Image:
    rgba = np.dstack([rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def resize_rgba(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """투명 가장자리가 어두워지지 않게 미리 곱한 알파(RGBa)로 줄이고 늘림"""
    return im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


def tile_x(im: Image.Image, overlap: float = 0.18) -> Image.Image:
    """가로로 이어 붙여도 이음매가 안 보이게: 오른쪽 끝 부분을 왼쪽 처음에 겹쳐 서서히 섞음.
    결과 폭 = 원래 폭 - 겹친 폭. 마지막 열 다음에 첫 열이 오면 원본에서 이웃한 열이 됨"""
    a = np.asarray(im.convert('RGBA')).astype(np.float32) / 255
    al = a[..., 3:4]
    pre = a[..., :3] * al                                     # 미리 곱한 색으로 섞어야 가장자리가 어두워지지 않음
    W = a.shape[1]
    o = max(1, int(W * overlap))
    t = np.linspace(0, 1, o, dtype=np.float32)[None, :, None]
    pre = np.concatenate([pre[:, :o] * t + pre[:, W - o:] * (1 - t), pre[:, o:W - o]], 1)
    al = np.concatenate([al[:, :o] * t + al[:, W - o:] * (1 - t), al[:, o:W - o]], 1)
    rgb = np.where(al > 1e-4, pre / np.maximum(al, 1e-4), 0)
    return to_image(rgb * 255, al[..., 0])


# ---------------------------------------------------------------- 바깥 배경 지우기 (스탠딩·소품)
def area_mask(shape: tuple, H: int, W: int) -> np.ndarray:
    yy, xx = np.mgrid[0:H, 0:W]
    if shape[0] == 'circle':
        _, cx, cy, r = shape
        return (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
    _, x0, y0, x1, y1 = shape
    return (xx >= x0) & (xx <= x1) & (yy >= y0) & (yy <= y1)


def cutout(a: np.ndarray, stem: str, band: np.ndarray):
    """흰색·단색 배경을 그림 바깥에서부터 지움 → (색, 투명도, 배경 모형, 남은 갇힌 배경 후보)"""
    H, W, _ = a.shape
    pred = bg_model(a, band)
    d = np.linalg.norm(a - pred, axis=2)
    lum = a @ LUM
    ink = dilate(lum < 120, 1)            # 테두리선을 1px 넓혀 틈을 막음
    cand = (d < 26) & ~ink
    seed = np.zeros_like(cand)
    seed[0, :] = seed[-1, :] = seed[:, 0] = seed[:, -1] = True
    bg = flood(cand, seed)
    left = cand & ~bg
    k = coord_k(stem, W)
    r = round(20 * k)
    for x0, y0 in POCKETS.get(stem, []):
        x, y = round(x0 * k), round(y0 * k)
        ys, xs = np.nonzero(left[max(0, y - r): y + r + 1, max(0, x - r): x + r + 1])  # 점 근처의 배경 후보
        if not len(xs):
            print(f'    (주의) {stem}: ({x},{y}) 근처에 지울 배경이 없어요')
            continue
        i = int(np.argmin((ys - min(y, r)) ** 2 + (xs - min(x, r)) ** 2))
        pt = np.zeros_like(cand)
        pt[max(0, y - r) + ys[i], max(0, x - r) + xs[i]] = True
        bg |= flood(left, pt)
    for shape in AREAS.get(stem, []):
        bg |= left & area_mask((shape[0], *[round(v * k) for v in shape[1:]]), H, W)

    # 가장자리 2px: 밝기로 투명도를 정하고 배경색을 걷어 냄(선 그림의 반쯤 섞인 픽셀)
    alpha = (~bg).astype(np.float32)
    edge = dilate(bg, 2) & ~bg
    lb = pred @ LUM
    ae = np.clip((lb - lum) / np.maximum(lb - 35, 1), 0, 1)
    alpha[edge] = ae[edge]
    rgb = np.where(edge[..., None], unmix(a, alpha, pred), a)
    return rgb, alpha, pred, left & ~bg


def edge_band(H: int, W: int, sides: bool = False) -> np.ndarray:
    """배경 색 표본: 스탠딩은 위쪽과 양옆 위 80%(발밑 그림자 빼고), 소품은 네 가장자리"""
    band = np.zeros((H, W), bool)
    if sides:
        band[:16, :] = band[-16:, :] = band[:, :16] = band[:, -16:] = True
        return band
    band[:24, :] = True
    band[: int(H * 0.8), :24] = True
    band[: int(H * 0.8), -24:] = True
    return band


# ---------------------------------------------------------------- 스탠딩
def stand(src: Path, dst: Path) -> str:
    a = load(src)
    H, W, _ = a.shape
    rgb, alpha, _, _ = cutout(a, src.stem, edge_band(H, W))

    # 머리 위 끝·머리 가운데·전신 키로 '머리~허벅지 위' 상자를 정함
    fig = alpha > 0.5
    rows = fig[:, int(W * 0.2): int(W * 0.8)].sum(1) >= 6
    top = int(np.argmax(rows))
    bottom = int(len(rows) - 1 - np.argmax(rows[::-1]))
    body = bottom - top
    head = fig[top: top + max(8, int(body * 0.1))]
    cx = float(np.nonzero(head)[1].mean())
    scale, dx = STAND_FIT.get(src.stem, (1.0, 0))
    dx *= coord_k(src.stem, W)
    ch = BODY_PART * body / (1 - HEAD_MARGIN) * scale
    cw = ch * STAND_SIZE[0] / STAND_SIZE[1]
    cx += dx
    x0, y0 = round(cx - cw / 2), round(top - HEAD_MARGIN * ch)
    box = (x0, y0, x0 + round(cw), y0 + round(ch))
    out = resize_rgba(to_image(rgb, alpha).crop(box), STAND_SIZE)
    out.save(dst, 'WEBP', **STAND_WEBP)
    dst.with_suffix('.png').unlink(missing_ok=True)   # 옛 PNG 가 남으면 목록(scan-assets)이 PNG 를 먼저 고름
    return f'머리 {top}px · 키 {body}px · 상자 {box}'


# ---------------------------------------------------------------- 소품
def item(src: Path, dst: Path) -> str:
    a = load(src)
    H, W, _ = a.shape
    rgb, alpha, _, _ = cutout(a, src.stem, edge_band(H, W, sides=True))
    ys, xs = np.nonzero(alpha > 0.5)
    if not len(xs):
        raise ValueError('물건을 찾지 못했어요(흰 배경인지 확인)')
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    side = max(x1 - x0, y1 - y0) * 1.06 + 6
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    box = (round(cx - side / 2), round(cy - side / 2), round(cx + side / 2), round(cy + side / 2))
    out = resize_rgba(to_image(rgb, alpha).crop(box), (ITEM_SIZE, ITEM_SIZE))
    out.save(dst, optimize=True)
    return f'물건 {x1 - x0}×{y1 - y0}px → {ITEM_SIZE}'


# ---------------------------------------------------------------- 오늘의 한 장
def photo(src: Path, dst: Path) -> str:
    im = Image.open(src).convert('RGB')
    W, H = im.size
    cx, y0, y1 = PHOTO_CROP[src.stem]
    w = (y1 - y0) * PHOTO_SIZE[0] / PHOTO_SIZE[1]
    x0 = min(max(0.0, cx - w / 2), W - w)
    box = (round(x0), y0, round(x0 + w), y1)
    if box[2] > W - 110 and box[3] > H - 110:                 # 생성 도구 표시(오른쪽 아래 반짝이)를 주변 색으로 메움
        import cv2  # noqa: PLC0415  (이때만 씀)
        arr = np.asarray(im).copy()
        mask = np.zeros((H, W), np.uint8)
        mask[H - 96: H - 8, W - 96: W - 8] = 255
        im = Image.fromarray(cv2.inpaint(arr, mask, 9, cv2.INPAINT_TELEA))
    im.crop(box).resize(PHOTO_SIZE, Image.LANCZOS).save(dst, quality=92, optimize=True)
    return f'자리 {box}'


# ---------------------------------------------------------------- 점검 (갇힌 배경 찾기)
def check(src: Path, kind: str) -> str:
    """어두운 바탕에 얹은 결과 + 남은 갇힌 배경(분홍, 번호) → assets/_src/_check/{이름}.png"""
    from scipy import ndimage  # noqa: PLC0415  (점검할 때만 씀)
    from PIL import ImageDraw  # noqa: PLC0415
    a = load(src)
    H, W, _ = a.shape
    rgb, alpha, _, left = cutout(a, src.stem, edge_band(H, W, sides=(kind == 'items')))
    lab, n = ndimage.label(left)
    regions = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        m = lab[sl] == i
        area = int(m.sum())
        if area < 150:
            continue
        ys, xs = np.nonzero(m)
        regions.append((sl[1].start + int(xs.mean()), sl[0].start + int(ys.mean()), area, i))
    dark = np.zeros_like(a)
    dark[...] = (42, 38, 48)
    show = rgb * alpha[..., None] + dark * (1 - alpha[..., None])
    for x, y, area, i in regions:
        show[lab == i] = (255, 0, 200)
    out = Image.fromarray(show.round().clip(0, 255).astype(np.uint8))
    dr = ImageDraw.Draw(out)
    for k, (x, y, area, _) in enumerate(regions):
        dr.text((x + 6, y - 6), str(k), fill=(255, 255, 0))
    folder = SRC / '_check'
    folder.mkdir(exist_ok=True)
    out.save(folder / f'{src.stem}.png')
    return '남은 곳 ' + (', '.join(f'#{k}({x},{y}) {area}px' for k, (x, y, area, _) in enumerate(regions)) or '없음')


# ---------------------------------------------------------------- VFX
def vfx(src: Path, dst: Path, kind: str) -> str:
    a = load(src)
    H, W, _ = a.shape
    size = VFX_SIZE.get(kind, 256)
    strip = isinstance(size, tuple)                           # 가로 띠(속도선): 그림이 좌우 끝까지 닿음
    corner = np.zeros((H, W), bool)
    corner[int(H * 0.82):, int(W * 0.9):] = True   # 생성 도구 표시가 있는 구석(그림 범위 계산에서 뺌)
    band = np.zeros((H, W), bool)
    band[:24, :] = band[-24:, :] = band[:, :24] = band[:, -24:] = True
    band &= ~corner
    if strip:                                                 # 띠는 좌우 끝에 흰 줄이 닿으므로, 가장자리 중 초록인 곳만 배경 표본으로
        band &= (a[..., 1] - np.maximum(a[..., 0], a[..., 2])) > 100
    pred = bg_model(a, band)
    k = a[..., 1] - np.maximum(a[..., 0], a[..., 2])          # 초록이 얼마나 강한지
    kb = pred[..., 1] - np.maximum(pred[..., 0], pred[..., 2])
    alpha = 1 - np.clip((k - 10) / np.maximum(kb - 10, 1), 0, 1)
    alpha[alpha < 0.1] = 0
    rgb = unmix(a, alpha, pred)
    soft = alpha < 0.95                                       # 가장자리 초록 번짐 줄이기
    mx = np.maximum(rgb[..., 0], rgb[..., 2])
    rgb[..., 1] = np.where(soft, np.minimum(rgb[..., 1], mx + 20), rgb[..., 1])

    # 그림 범위: 진한 부분(알파 0.25 넘음)의 99.6%가 들어가는 상자 → 바탕의 희미한 잡티에 끌려가지 않음
    m = (alpha > 0.25) & ~corner
    if not m.any():
        raise ValueError('그림을 찾지 못했어요(초록 배경인지 확인)')

    def span(s: np.ndarray) -> tuple[int, int]:
        c = np.cumsum(s) / s.sum()
        return int(np.searchsorted(c, 0.002)), int(np.searchsorted(c, 0.998))

    bx0, bx1 = span(m.sum(0))
    by0, by1 = span(m.sum(1))
    if strip:
        alpha[corner] = 0                                     # 생성 도구 표시 지우기
    im = to_image(rgb, alpha)
    if strip:
        # 가로 띠: 좌우 여백 없이 원본 끝에서 끝까지 쓰고, 이어 붙여도 이음매가 안 보이게 만든 뒤 규격 크기로.
        # (맞춰 넣기로 가운데 두면 좌우에 빈 곳이 생겨 컷인 띠 양 끝이 비어 보임)
        pad = round(0.04 * (by1 - by0))
        crop = im.crop((0, max(0, by0 - pad), W, min(H, by1 + 1 + pad)))
        out = resize_rgba(tile_x(crop), size)
    else:
        cx, cy = (bx0 + bx1) / 2, (by0 + by1) / 2
        side = max(bx1 - bx0, by1 - by0) * 1.12 + 4
        box = (round(cx - side / 2), round(cy - side / 2), round(cx + side / 2), round(cy + side / 2))
        out = resize_rgba(im.crop(box), (size, size))
    out.save(dst, optimize=True)
    return f'그림 {bx1 - bx0}×{by1 - by0}px → {size}'


def main() -> int:
    args = sys.argv[1:]
    checking = '--check' in args
    only = {a for a in args if not a.startswith('--')}
    jobs = []
    for kind, pattern in (('stand', '*'), ('vfx', 'vfx_*'), ('items', 'item_*'), ('photos', '*')):
        for f in sorted((SRC / kind).glob(f'{pattern}.jpg')) + sorted((SRC / kind).glob(f'{pattern}.png')):
            if kind == 'photos' and f.stem not in PHOTO_CROP:
                continue                                       # 자리를 정하지 않은 사진(예비 그림)은 건너뜀
            jobs.append((kind, f))
    ok = 0
    for kind, f in jobs:
        if only and f.stem not in only:
            continue
        out_dir = ROOT / 'assets' / kind
        out_dir.mkdir(parents=True, exist_ok=True)
        dst = out_dir / f'{f.stem}.{ {"photos": "jpg", "stand": "webp"}.get(kind, "png") }'
        try:
            if checking:
                if kind not in ('stand', 'items'):
                    continue
                info = check(f, kind)
            elif kind == 'stand':
                info = stand(f, dst)
            elif kind == 'items':
                info = item(f, dst)
            elif kind == 'photos':
                info = photo(f, dst)
            else:
                info = vfx(f, dst, f.stem.removeprefix('vfx_'))
            ok += 1
            print(f'  ✓ {kind}/{dst.name}  {info}')
        except Exception as ex:  # noqa: BLE001
            print(f'  ✗ {kind}/{f.name}: {ex}')
    if checking:
        print(f'점검 {ok}개 → assets/_src/_check/ (분홍 = 아직 남은 갇힌 배경, 번호 옆 좌표를 POCKETS 에)')
    else:
        print(f'끝! {ok}개 → assets/stand · vfx · items · photos (다음: node tools/scan-assets.mjs)')
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
