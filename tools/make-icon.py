"""앱 아이콘 만들기 (2026-11-08 사용자 "앱 아이콘은 커피컵으로 만들자")
   python -X utf8 tools/make-icon.py → assets/icon.png(창, 512) · build/icon.ico(설치 파일, 16 ~ 256)
   게임의 라테 머그 그림(assets/objects/cup_mug_heart.webp)을 디자인 언어 '바닷가 밤'의 판(짙은 바다색 + 금색 이중 테두리) 위에 얹음.
   32 이하는 테두리 없이 머그를 크게 그림: 작업 표시줄에서 줄어들어도 컵으로 보이게. 글자 · 빛살은 넣지 않음. """
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
MUG = ROOT / 'assets' / 'objects' / 'cup_mug_heart.webp'
PNG = ROOT / 'assets' / 'icon.png'
ICO = ROOT / 'build' / 'icon.ico'
TOP, BOTTOM = (31, 58, 84), (14, 27, 42)   # --plate-hi → --sea
GOLD, GOLD_DIM = (217, 179, 106), (156, 133, 86)
SS = 4                                     # 모서리를 매끄럽게 그리는 배율
SIZES = [256, 128, 64, 48, 32, 24, 16]


def plate(size: int, border: bool) -> Image.Image:
    n = size * SS
    grad = Image.new('RGB', (1, n))
    for y in range(n):
        t = y / (n - 1)
        grad.putpixel((0, y), tuple(round(a + (b - a) * t) for a, b in zip(TOP, BOTTOM)))
    bg = grad.resize((n, n)).convert('RGBA')
    radius = round(n * 0.2)
    mask = Image.new('L', (n, n), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, n - 1, n - 1), radius, fill=255)
    if border:
        d = ImageDraw.Draw(bg)
        w = max(SS, round(n * 0.014))
        d.rounded_rectangle((0, 0, n - 1, n - 1), radius, outline=GOLD, width=w)
        inset = round(n * 0.05)
        d.rounded_rectangle((inset, inset, n - 1 - inset, n - 1 - inset), radius - inset, outline=GOLD_DIM, width=max(SS // 2, w // 2))
    bg.putalpha(mask)
    return bg.resize((size, size), Image.LANCZOS)


def icon(size: int) -> Image.Image:
    small = size <= 32
    base = plate(size, border=not small)
    mug = Image.open(MUG).convert('RGBA')
    mug = mug.crop(mug.getbbox())
    h = round(size * (0.82 if small else 0.66))
    w = round(mug.width * h / mug.height)
    if w > size * 0.9:
        w = round(size * 0.9)
        h = round(mug.height * w / mug.width)
    mug = mug.resize((w, h), Image.LANCZOS)
    base.alpha_composite(mug, ((size - w) // 2, (size - h) // 2))
    return base


def main() -> None:
    icon(512).save(PNG)
    ICO.parent.mkdir(parents=True, exist_ok=True)
    frames = [icon(s) for s in SIZES]
    frames[0].save(ICO, format='ICO', sizes=[(s, s) for s in SIZES], append_images=frames[1:])
    print(f'아이콘 → {PNG.relative_to(ROOT)} · {ICO.relative_to(ROOT)} ({", ".join(map(str, SIZES))})')


if __name__ == '__main__':
    main()
