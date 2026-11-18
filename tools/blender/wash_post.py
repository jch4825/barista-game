"""블렌더 설거지 한 컷(scene_bench.py … wash) → 게임 그림 assets/shots/wash_mug_* + assets/shots/wash.json (설거지 미니게임 js/game/minigames/wash.js)
- 배경판: wash_mug_plate.png(깨끗한 머그) → wash_mug_plate.webp
- 얼룩 단계 wash_mug_{rim|in}_l{1..5}.png · 헹굼 물줄기 wash_mug_rinse_{0|1}.png: 배경판과 같은 씨앗으로 머그 자리만 렌더한 그림.
  배경판과 달라진 곳만 남기고(투명 바탕), 그 곳만 잘라 → wash_mug_{…}.webp + 자리(판 픽셀)
- 거품 wash_mug_foam_{rim|in}_{1..3}.png · 수세미 wash_mug_sponge.png: 처음부터 투명 바탕 → 보이는 곳만 잘라
- 자리 정보 wash_mug.json(입이 닿는 곳 · 안쪽 가운데의 타원, 수도꼭지 · 물이 떨어지는 곳) → wash.json 의 mug
쓰는 법: python -X utf8 tools/blender/wash_post.py assets/_src/blender/wash assets/shots
"""
import json
import os
import sys

from PIL import Image, ImageChops, ImageFilter

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
with open(os.path.join(src, 'wash_mug.json'), encoding='utf-8') as fp:
    info = json.load(fp)

plate = Image.open(os.path.join(src, 'wash_mug_plate.png')).convert('RGB')
plate.save(os.path.join(out, 'wash_mug_plate.webp'), 'WEBP', quality=88, method=6)
W, H = plate.size


def diff_layer(name, rect):
    """배경판과 달라진 곳만 남긴 그림(투명 바탕): 작은 차이(잡음)는 버리고, 남긴 곳은 조금 넓혀 가장자리를 부드럽게"""
    x0, y0, x1, y1 = rect
    fr = Image.open(os.path.join(src, f'{name}.png')).convert('RGB').crop((x0, y0, x1, y1))
    pl = plate.crop((x0, y0, x1, y1))
    d = ImageChops.difference(fr, pl)
    r, g, b = d.split()
    m = ImageChops.lighter(ImageChops.lighter(r, g), b)
    m = m.point(lambda v: 0 if v < 7 else min(255, (v - 7) * 40))
    m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(2))
    im = fr.convert('RGBA')
    im.putalpha(m)
    bb = m.getbbox()
    if not bb:
        return None
    im = im.crop(bb)
    im.save(os.path.join(out, f'{name}.webp'), 'WEBP', quality=90, method=6)
    return [x0 + bb[0], y0 + bb[1], bb[2] - bb[0], bb[3] - bb[1]]


def alpha_layer(name):
    """투명 바탕 그림: 보이는 곳만 잘라"""
    im = Image.open(os.path.join(src, f'{name}.png')).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 3 else 0).getbbox()
    if not bb:
        return None
    im.crop(bb).save(os.path.join(out, f'{name}.webp'), 'WEBP', quality=90, method=6)
    return [bb[0], bb[1], bb[2] - bb[0], bb[3] - bb[1]]


mug = tuple(info['mugRect'])
rinse = tuple(info['rinseRect'])
meta = {k: info[k] for k in ('size', 'levels', 'rim', 'inside', 'bottom', 'mouth', 'spout', 'land', 'lever', 'tap') if k in info}
meta['plate'] = 'wash_mug_plate'
meta['stain'] = {zone: [None] + [diff_layer(f'wash_mug_{zone}_l{k}', mug) for k in range(1, info['levels'] + 1)] for zone in ('rim', 'in')}
meta['foam'] = {zone: [None] + [alpha_layer(f'wash_mug_foam_{zone}_{a}') for a in (1, 2, 3)] for zone in ('rim', 'in')}
meta['rinse'] = [diff_layer(f'wash_mug_rinse_{i}', rinse) for i in (0, 1)]
meta['sponge'] = alpha_layer('wash_mug_sponge')
path = os.path.join(out, 'wash.json')
allm = {}
if os.path.exists(path):
    with open(path, encoding='utf-8') as fp:
        allm = json.load(fp)
allm['mug'] = meta
with open(path, 'w', encoding='utf-8') as fp:
    json.dump(allm, fp, ensure_ascii=False, indent=1)
    fp.write('\n')
print('설거지 그림', json.dumps(meta, ensure_ascii=False)[:600])
