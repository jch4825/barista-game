"""
작업대 물건 그림 시트 → 게임용 물건 그림 (초록 배경 지우기 · 물건마다 자르기)

  python tools/import-objects.py            # assets/_src/objects/sheet_*.jpg → assets/objects/{id}.webp
  python tools/import-objects.py --check    # 결과를 어두운·밝은 바탕에 얹어 보기 → assets/_src/_check/objects_{시트}.png
                                            # (게임 그림은 만들지 않음. 남은 초록·반투명 정도를 숫자로도 보여 줌)
  npm run objects                           # 위(--check 없이) + 그림 목록 갱신(scan-assets)
  (시험용) --src 폴더 --out 폴더 로 시트를 읽을 곳·만들 곳을 바꿀 수 있음

시트(docs/image_requests.md 2장): 정사각형, 보이지 않는 4칸 × 3줄, 칸마다 물건 하나, 평평한 크로마키 초록(#00B140) 바탕
  sheet_tools: obj_machine obj_grinder obj_portafilter obj_portafilter_full / obj_tamper obj_pitcher obj_pitcher_milk obj_milk_bottle /
               obj_kettle obj_dripper obj_syrup (빈 칸)
  sheet_cups : cup_mug_empty cup_mug_americano cup_mug_milk cup_mug_latte(라테아트 없음) / cup_mug_heart cup_thick cup_glass_empty cup_glass_ice /
               cup_paper cup_shot obj_tray (빈 칸)
  (튤립·나뭇잎 라테아트 cup_mug_tulip · cup_mug_leaf 는 자유 영업 시트에서. 그때까지 임시 그림)
  마지막 칸(오른쪽 아래)은 비워 둠: Flow 가 붙이는 표시가 물건을 가리지 않게. 그 칸에 있는 것은 버림

하는 일
  1) 바탕색: 시트 가장자리와 칸 사이 줄의 초록으로 2차 곡면을 맞춤(조금 고르지 않은 초록도 따라감)
  2) 투명도: 초록 정도(G - max(R, B))로 정함. 바깥 배경과 이어진 초록 + 그 테두리만 반투명으로 지우고,
     물건 안쪽(바깥과 안 이어진 곳)은 아주 초록일 때만 지움(머그 손잡이 구멍·유리 너머). 금속에 비친 약한 초록은 지우지 않음
  3) 초록 번짐 걷기(despill): 반투명 테두리는 바탕색을 걷어 낸 뒤 G 를 max(R, B) 근처로,
     안쪽은 초록빛 반사만 누름(커피 갈색·흰 도자기·회색 금속은 그대로). 초록색 물건(녹차 라테 등)을 넣는 시트는 SPILL 값을 낮춰야 함
  4) 물건 찾기: 불투명 덩어리를 찾아 가운데가 놓인 칸의 물건으로 묶음(물건이 칸 줄을 조금 넘어도 됨). 아주 작은 조각은 버림
  5) 물건만 남기고 작게 여백을 둬 자름 → 투명 배경 WebP(긴 쪽 최대 MAX_SIDE)
시트가 아직 없으면 알려 주고 그대로 끝남(오류 아님).
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / 'assets' / '_src' / 'objects'
OUT = ROOT / 'assets' / 'objects'
CHECK = ROOT / 'assets' / '_src' / '_check'
EXTS = ('.jpg', '.jpeg', '.png', '.webp')

COLS, ROWS = 4, 3
# 칸 순서(왼쪽 위부터 줄마다). None = 빈 칸
SHEETS: dict[str, list[str | None]] = {
    'sheet_tools': [
        'obj_machine', 'obj_grinder', 'obj_portafilter', 'obj_portafilter_full',
        'obj_tamper', 'obj_pitcher', 'obj_pitcher_milk', 'obj_milk_bottle',
        'obj_kettle', 'obj_dripper', 'obj_syrup', None,
    ],
    'sheet_cups': [
        'cup_mug_empty', 'cup_mug_americano', 'cup_mug_milk', 'cup_mug_latte',
        'cup_mug_heart', 'cup_thick', 'cup_glass_empty', 'cup_glass_ice',
        'cup_paper', 'cup_shot', 'obj_tray', None,
    ],
}

KEY = np.array([0x00, 0xB1, 0x40], np.float32)  # 요청서의 초록. 실제 바탕색은 시트에서 다시 잼(표본이 모자랄 때만 이 값)
KEY_LO = 12        # 초록 정도가 이보다 작으면 물건(불투명)
HOLE = 0.4         # 물건 안쪽은 초록 정도가 바탕의 이 비율을 넘을 때만 지움(손잡이 구멍·유리 너머). 금속 반사(약한 초록)는 이보다 낮음
EDGE_PX = 3        # 바깥 배경과 맞닿은 테두리(반투명으로 계산하는 두께)
SPILL_EDGE = 4     # 테두리·반투명 픽셀의 G 상한: max(R, B) + 이 값
SPILL_IN = 6       # 안쪽 픽셀의 G 상한: max(R, B) + 이 값(초록빛 반사만 누름. 흰색·회색·갈색은 G 가 이보다 작아 그대로)
MIN_AREA = 0.0004  # 시트 넓이에 대한 비율: 이보다 작은 덩어리는 잡티
MARGIN = 0.03      # 자를 때 여백: 물건 긴 쪽의 비율(최소 6px)
MAX_SIDE = 768     # 게임용 그림 긴 쪽 최대(px). 화면에서 가장 크게 나와도 300px 안팎
WEBP = dict(quality=92, method=6, alpha_quality=100)  # 스탠딩과 같은 설정(tools/import-images.py)
DARK = (42, 38, 48)
LIGHT = (244, 239, 230)

try:
    from scipy import ndimage  # 덩어리 찾기(빠름). 없으면 느린 방법으로
except ImportError:  # pragma: no cover
    ndimage = None


def say(text: str) -> None:
    """Windows 콘솔(cp949)에서 못 쓰는 글자가 있어도 멈추지 않게"""
    enc = sys.stdout.encoding or 'utf-8'
    print(text.encode(enc, errors='replace').decode(enc, errors='replace'))


def load(path: Path) -> np.ndarray:
    return np.asarray(Image.open(path).convert('RGB')).astype(np.float32)


def greenness(a: np.ndarray) -> np.ndarray:
    return a[..., 1] - np.maximum(a[..., 0], a[..., 2])


def dilate(m: np.ndarray, r: int = 1) -> np.ndarray:
    out = m.copy()
    for _ in range(r):
        g = out.copy()
        g[1:] |= out[:-1]; g[:-1] |= out[1:]; g[:, 1:] |= out[:, :-1]; g[:, :-1] |= out[:, 1:]
        out = g
    return out


def bg_model(a: np.ndarray, band: np.ndarray) -> np.ndarray:
    """표본 자리의 색으로 바탕을 2차 곡면으로 맞춤 (tools/import-images.py 와 같은 방법)"""
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


def unmix(a: np.ndarray, alpha: np.ndarray, bg: np.ndarray) -> np.ndarray:
    """반투명 픽셀에서 바탕색을 걷어 내 본래 색을 되찾음: C = aF + (1-a)B → F"""
    al = np.maximum(alpha, 1e-3)[..., None]
    return np.clip((a - (1 - alpha)[..., None] * bg) / al, 0, 255)


def label(mask: np.ndarray, diag: bool = False) -> tuple[np.ndarray, int]:
    """이어진 덩어리 번호 매기기"""
    if ndimage is not None:
        st = np.ones((3, 3), bool) if diag else None
        return ndimage.label(mask, structure=st)
    # scipy 가 없을 때: 줄마다 이어 붙이는 단순한 방법(느림, 상하좌우만)
    H, W = mask.shape
    lab = np.zeros((H, W), np.int32)
    n = 0
    parent = [0]

    def find(i: int) -> int:
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i

    for y in range(H):
        row = mask[y]
        for x in np.nonzero(row)[0]:
            up = lab[y - 1, x] if y else 0
            left = lab[y, x - 1] if x else 0
            if up and left:
                a, b = find(up), find(left)
                lab[y, x] = min(a, b)
                parent[max(a, b)] = min(a, b)
            elif up or left:
                lab[y, x] = up or left
            else:
                n += 1
                parent.append(n)
                lab[y, x] = n
    roots = np.array([find(i) for i in range(n + 1)], np.int32)
    lab = roots[lab]
    uniq = np.unique(lab[lab > 0])
    remap = np.zeros(n + 1, np.int32)
    remap[uniq] = np.arange(1, len(uniq) + 1)
    return remap[lab], len(uniq)


def to_image(rgb: np.ndarray, alpha: np.ndarray) -> Image.Image:
    rgba = np.dstack([rgb, alpha * 255]).round().clip(0, 255).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA')


def resize_rgba(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """투명 가장자리가 어두워지지 않게 미리 곱한 알파(RGBa)로 줄임"""
    return im.convert('RGBa').resize(size, Image.LANCZOS).convert('RGBA')


# ---------------------------------------------------------------- 초록 지우기 (시트 한 장)
def key_sheet(a: np.ndarray):
    """→ (색, 투명도, 바탕 모형, 칸 크기)"""
    H, W, _ = a.shape
    cw, ch = W / COLS, H / ROWS
    k = greenness(a)
    # 바탕 표본: 가장자리 + 칸 사이 줄 가운데, 그중 초록인 곳만(물건이 줄을 넘어온 곳은 빼고)
    band = np.zeros((H, W), bool)
    e = max(8, round(min(H, W) * 0.012))
    band[:e, :] = band[-e:, :] = band[:, :e] = band[:, -e:] = True
    for i in range(1, COLS):
        x = round(i * cw)
        band[:, max(0, x - e // 2): x + e // 2] = True
    for j in range(1, ROWS):
        y = round(j * ch)
        band[max(0, y - e // 2): y + e // 2, :] = True
    band &= k > 40
    if band.sum() > 500:
        pred = bg_model(a, band)
    else:
        pred = np.broadcast_to(KEY, a.shape).astype(np.float32).copy()
    kb = np.maximum(greenness(pred), KEY_LO + 1)

    alpha_key = 1 - np.clip((k - KEY_LO) / (kb - KEY_LO), 0, 1)
    # 바깥 배경: 초록 후보 가운데 가장자리·칸 줄과 이어진 덩어리
    cand = alpha_key < 0.5
    lab, n = label(cand)
    seed = np.unique(lab[band & cand])
    seed = seed[seed > 0]
    bg = np.isin(lab, seed) if len(seed) else np.zeros_like(cand)
    hole = ~bg & (k > HOLE * kb)  # 물건 안쪽의 아주 초록인 곳: 손잡이 구멍·유리 너머
    clear = bg | hole
    edge = dilate(clear, EDGE_PX) & ~clear  # 바깥 배경·구멍과 맞닿은 테두리
    soft = clear | edge
    alpha = np.ones((H, W), np.float32)
    alpha[soft] = alpha_key[soft]
    alpha[alpha < 0.06] = 0

    rgb = a.copy()
    rgb[soft] = unmix(a, alpha, pred)[soft]
    mx = np.maximum(rgb[..., 0], rgb[..., 2])
    lim = np.where(soft | (alpha < 0.999), mx + SPILL_EDGE, mx + SPILL_IN)
    rgb[..., 1] = np.minimum(rgb[..., 1], lim)
    return rgb, alpha, pred, (cw, ch)


def split_objects(rgb: np.ndarray, alpha: np.ndarray, cell: tuple[float, float], ids: list[str | None]):
    """불투명 덩어리를 칸(가운데 위치)마다 묶어 물건별로 자름 → {id: (Image, 정보)}"""
    H, W = alpha.shape
    cw, ch = cell
    solid = alpha > 0.5
    lab, n = label(solid, diag=True)
    if not n:
        return {}, []
    idx = np.arange(1, n + 1)
    area = np.bincount(lab.ravel(), minlength=n + 1)[1:]
    yy, xx = np.nonzero(lab)
    labs = lab[yy, xx]
    cx = np.bincount(labs, weights=xx, minlength=n + 1)[1:] / np.maximum(area, 1)
    cy = np.bincount(labs, weights=yy, minlength=n + 1)[1:] / np.maximum(area, 1)
    keep = area >= MIN_AREA * H * W
    owner: dict[int, list[int]] = {}
    for i, ok, x, y in zip(idx, keep, cx, cy):
        if not ok:
            continue
        c = min(COLS - 1, int(x // cw)) + COLS * min(ROWS - 1, int(y // ch))
        owner.setdefault(c, []).append(int(i))
    # 넓은 물건(쟁반)의 가운데가 같은 줄 옆의 빈 칸(None)으로 넘어간 경우: 물건을 못 찾은 칸이 그 빈 칸의 가장 큰 덩어리를 가져옴
    for c, oid in enumerate(ids):
        if oid is None or owner.get(c):
            continue
        for nb in (c + 1, c - 1):
            if 0 <= nb < len(ids) and nb // COLS == c // COLS and ids[nb] is None and owner.get(nb):
                owner[c] = [max(owner.pop(nb), key=lambda i: area[i - 1])]
                break

    out: dict[str, tuple[Image.Image, str]] = {}
    empty: list[str] = []
    for c, oid in enumerate(ids):
        if oid is None:
            continue
        mine = owner.get(c, [])
        if not mine:
            empty.append(oid)
            continue
        own = np.isin(lab, mine)
        ys, xs = np.nonzero(own)
        y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
        side = max(x1 - x0, y1 - y0)
        pad = max(6, round(side * MARGIN)) + EDGE_PX + 2
        box = (max(0, x0 - pad), max(0, y0 - pad), min(W, x1 + pad + 1), min(H, y1 + pad + 1))
        sl = (slice(box[1], box[3]), slice(box[0], box[2]))
        # 이 물건과 그 테두리만 남김(옆 칸 물건 조각·잡티는 투명)
        mask = dilate(own[sl], EDGE_PX + 2)
        al = alpha[sl] * mask
        im = to_image(rgb[sl], al)
        w, h = im.size
        if max(w, h) > MAX_SIDE:
            s = MAX_SIDE / max(w, h)
            im = resize_rgba(im, (max(1, round(w * s)), max(1, round(h * s))))
        semi = float(((al > 0.05) & (al < 0.95)).sum()) / max(1, int((al > 0.05).sum()))
        g = greenness(rgb[sl])
        left_green = int(((al > 0.5) & (g > 20)).sum())
        out[oid] = (im, f'{im.size[0]}x{im.size[1]}px · 반투명 {semi * 100:.1f}% · 초록 남음 {left_green}px')
    return out, empty


def preview(sheet: str, objs: dict[str, tuple[Image.Image, str]], ids: list[str | None], folder: Path) -> Path:
    """칸마다 [어두운 바탕 | 밝은 바탕] 두 장 + 이름 → {folder}/objects_{sheet}.png"""
    T = 230
    cw, ch = T * 2 + 30, T + 50
    sheet_im = Image.new('RGB', (cw * COLS, ch * ROWS), (255, 255, 255))
    dr = ImageDraw.Draw(sheet_im)
    for c, oid in enumerate(ids):
        x, y = (c % COLS) * cw, (c // COLS) * ch
        for j, color in enumerate((DARK, LIGHT)):
            tile = Image.new('RGB', (T, T), color)
            if oid in objs:
                im = objs[oid][0]
                s = min((T - 16) / im.size[0], (T - 16) / im.size[1])
                th = resize_rgba(im, (max(1, round(im.size[0] * s)), max(1, round(im.size[1] * s))))
                tile.paste(th, ((T - th.size[0]) // 2, (T - th.size[1]) // 2), th)
            sheet_im.paste(tile, (x + 10 + j * (T + 10), y + 10))
        dr.text((x + 12, y + T + 18), oid or '(빈 칸)', fill=(20, 20, 20))
    folder.mkdir(parents=True, exist_ok=True)
    dst = folder / f'objects_{sheet}.png'
    sheet_im.save(dst)
    return dst


def rel(p: Path) -> str:
    """보여 줄 경로: 프로젝트 안이면 프로젝트 기준(슬래시)"""
    return (p.relative_to(ROOT) if p.is_relative_to(ROOT) else p).as_posix()


def find_sheet(src: Path, name: str) -> Path | None:
    for ext in EXTS:
        p = src / f'{name}{ext}'
        if p.exists():
            return p
    return None


def main() -> int:
    args = sys.argv[1:]
    checking = '--check' in args
    src, out, check_dir = SRC, OUT, CHECK
    if '--src' in args:
        src = Path(args[args.index('--src') + 1]).resolve()
    if '--out' in args:
        out = Path(args[args.index('--out') + 1]).resolve()
        check_dir = out / '_check'
    found = {name: find_sheet(src, name) for name in SHEETS}
    if not any(found.values()):
        say('아직 물건 시트가 없어요. 그림이 오면 아래 이름으로 넣고 다시 실행해 주세요(docs/image_requests.md 2장).')
        for name in SHEETS:
            say(f'  {rel(src)}/{name}.jpg')
        say('그때까지 게임은 임시 그림으로 돌아가요.')
        return 0
    failed = 0
    made = 0
    for name, path in found.items():
        ids = SHEETS[name]
        if not path:
            say(f'- {name}: 아직 없어요(건너뜀)')
            continue
        try:
            a = load(path)
            H, W, _ = a.shape
            if abs(W - H) > max(W, H) * 0.02:
                say(f'  (주의) {path.name}: 정사각형이 아니에요({W}x{H}). 4칸 x 3줄로 나눠 봅니다.')
            rgb, alpha, _, cell = key_sheet(a)
            objs, empty = split_objects(rgb, alpha, cell, ids)
        except Exception as ex:  # noqa: BLE001
            failed += 1
            say(f'! {name}: {ex}')
            continue
        say(f'- {name} ({path.name}, {W}x{H})')
        for oid in [i for i in ids if i]:
            if oid in objs:
                say(f'    {oid}: {objs[oid][1]}')
        for oid in empty:
            say(f'    (주의) {oid}: 그 칸에서 물건을 찾지 못했어요')
        if checking:
            dst = preview(name, objs, ids, check_dir)
            say(f'  점검 그림 → {rel(dst)}')
            continue
        out.mkdir(parents=True, exist_ok=True)
        for oid, (im, _) in objs.items():
            dst = out / f'{oid}.webp'
            im.save(dst, 'WEBP', **WEBP)
            dst.with_suffix('.png').unlink(missing_ok=True)  # 옛 PNG 가 남으면 목록(scan-assets)이 PNG 를 먼저 고름
            made += 1
    if checking:
        say('점검 끝: 어두운 바탕에서 초록 테두리, 밝은 바탕에서 구멍·빠진 곳을 봐요.')
    else:
        say(f'끝! 물건 {made}개 → {rel(out)} (다음: node tools/scan-assets.mjs)')
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
