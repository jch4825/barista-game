"""블렌더 물건 렌더(투명 PNG, 그림자 받이 포함) → 게임 규격.
- 물건 가까이의 그림자는 남기고, 멀리 퍼진 옅은 그림자(주변광)는 점점 지움
- 알파 둘레로 자르고, 정한 비율 캔버스에 아래 맞춤(object-position: center bottom)으로 놓고, 가장자리를 부드럽게
쓰는 법: python -X utf8 sprites_post.py <렌더 폴더> <출력 폴더>
"""
import os
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
# 게임 칸: 머신은 4:3(.bw-art.machine), 나머지는 1:1
SPEC = {
    'obj_machine': (4 / 3, (1200, 900)),
    'cup_mug_americano': (1.0, (768, 768)),
    'obj_pitcher_milk': (1.0, (768, 768)),
    'cup_shot': (1.0, (768, 768)),
    'obj_tamper': (1.0, (768, 768)),
}


def tame_shadow(im):
    a = im.getchannel('A')
    solid = a.point(lambda v: 255 if v > 170 else 0)
    bb = solid.getbbox() or (0, 0, *im.size)
    size = max(bb[2] - bb[0], bb[3] - bb[1])
    near = solid.filter(ImageFilter.GaussianBlur(radius=max(4, size * 0.05))).point(lambda v: min(255, v * 4))
    keep = ImageChops.multiply(a, solid)  # 물건 자체(불투명한 곳)는 그대로
    a2 = ImageChops.lighter(ImageChops.multiply(a, near), keep)
    im.putalpha(a2)
    return im


def edge_fade(im, frac=0.025):
    """위·왼쪽·오른쪽 끝만 부드럽게(아래는 물건이 닿는 바닥이라 그대로)"""
    w, h = im.size
    f = max(2, round(min(w, h) * frac))
    mask = Image.new('L', (w, h), 255)
    d = ImageDraw.Draw(mask)
    for i in range(f):
        v = round(255 * i / f)
        d.line([(i, i), (w - 1 - i, i)], fill=v)
        d.line([(i, i), (i, h - 1)], fill=v)
        d.line([(w - 1 - i, i), (w - 1 - i, h - 1)], fill=v)
    im.putalpha(ImageChops.multiply(im.getchannel('A'), mask))
    return im


for name, (aspect, size) in SPEC.items():
    p = os.path.join(src, f'{name}.png')
    if not os.path.exists(p):
        print('없음', name)
        continue
    im = tame_shadow(Image.open(p).convert('RGBA'))
    box = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    im = im.crop(box)
    w, h = im.size
    cw, ch = w * 1.08, h * 1.05
    if cw / ch > aspect:
        ch = cw / aspect
    else:
        cw = ch * aspect
    canvas = Image.new('RGBA', (round(cw), round(ch)), (0, 0, 0, 0))
    canvas.paste(im, (round((cw - w) / 2), round(ch - h)))
    canvas = edge_fade(canvas.resize(size, Image.LANCZOS), 0.015)
    canvas.save(os.path.join(out, f'{name}.webp'), 'WEBP', quality=92, method=6)
    print(name, box, '→', canvas.size)
