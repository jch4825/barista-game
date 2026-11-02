"""블렌더 '동작마다 한 컷' 렌더 → 게임 그림 assets/shots/ (docs/recipes.md 6.1, Q-R9)
- 배경판: {컷}_plate.png → {컷}_plate.webp
- 프레임: {컷}_{l|s|a}{단계}.png(배경판과 같은 크기, 자리만 렌더. l = 줄기 없음, s = 줄기 있음, a = 라테아트)
  → 자리만 잘라 가장자리를 부드럽게(배경판과 이어지게) → {컷}_{l|s}{단계}.webp
- 자리·단계 수: {컷}.json → shots.json 에 모음(작업대 brew.js 가 읽음)
쓰는 법: python -X utf8 tools/blender/shots_post.py assets/_src/blender/shots assets/shots [컷,…(고친 것만)] [--extras(끌어 다루기 그림만)]
- 끌어 다루기(조작법 '드래그 활용', docs/recipes.md 6.11): {배경판}_tilt.json · {컷}_tilt.json · {컷}_drag.json → shots.json 의 tilt · drag
"""
import glob
import json
import os
import sys

from PIL import Image, ImageDraw

EXTRAS = '--extras' in sys.argv  # 끌어 다루기 그림만(원래 프레임은 다시 바꾸지 않음)
sys.argv = [a for a in sys.argv if a != '--extras']
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
meta_path = os.path.join(out, 'shots.json')
meta = {}
if os.path.exists(meta_path):
    with open(meta_path, encoding='utf-8') as fp:
        meta = json.load(fp)
FEATHER = 18  # 가장자리 부드럽게(px)


def feather(size, f):
    w, h = size
    m = Image.new('L', size, 255)
    d = ImageDraw.Draw(m)
    for i in range(f):
        d.rectangle([i, i, w - 1 - i, h - 1 - i], outline=round(255 * (i + 1) / (f + 1)))
    return m


done_plates = set()
only = set(sys.argv[3].split(',')) if len(sys.argv) > 3 else None  # 고친 컷만(예: pour_latte)
for jf in sorted(glob.glob(os.path.join(src, '*.json'))):
    shot = os.path.splitext(os.path.basename(jf))[0]
    if shot.endswith(('_tilt', '_drag')) or EXTRAS:  # 끌어 다루기(아래)
        continue
    if only and shot not in only:
        continue
    with open(jf, encoding='utf-8') as fp:
        info = json.load(fp)
    x, y, w, h = info['rect']
    plate_id = info.get('plate', f'{shot}_plate')  # 붓기 두 가지는 배경판 하나(pour_plate)를 함께 씀
    if plate_id not in done_plates:
        plate = Image.open(os.path.join(src, f'{plate_id}.png')).convert('RGB')
        plate.save(os.path.join(out, f'{plate_id}.webp'), 'WEBP', quality=88, method=6)
        done_plates.add(plate_id)
    mask = feather((w, h), FEATHER)
    frames = [(kind, k) for kind in ('l', 's') for k in range(info['levels'])] + [('a', k) for k in info.get('art', [])]  # a = 라테아트
    for kind, k in frames:
        im = Image.open(os.path.join(src, f'{shot}_{kind}{k:02d}.png')).convert('RGB').crop((x, y, x + w, y + h)).convert('RGBA')
        im.putalpha(mask)
        im.save(os.path.join(out, f'{shot}_{kind}{k:02d}.webp'), 'WEBP', quality=90, method=6)
    meta[shot] = {k: info[k] for k in ('size', 'rect', 'levels', 'plate', 'art') if k in info}
    print(shot, '배경판', plate_id, '프레임', len(frames), '자리', info['rect'])


# ---- 끌어 다루기(조작법 '드래그 활용', scene_bench.py … tilt · drag_ice)
def alpha_box(paths, rect):
    """투명 바탕 그림들의 보이는 곳을 모두 감싸는 상자(rect 안에서)"""
    x, y, w, h = rect
    boxes = [Image.open(p).getchannel('A').crop((x, y, x + w, y + h)).getbbox() for p in paths]
    boxes = [b for b in boxes if b]
    return [x + min(b[0] for b in boxes), y + min(b[1] for b in boxes), max(b[2] for b in boxes) - min(b[0] for b in boxes),
            max(b[3] for b in boxes) - min(b[1] for b in boxes)]


def edge_mask(size, f, soft):
    """가장자리 부드럽게(soft: 왼 · 위 · 오른 · 아래 중 부드럽게 할 쪽, 프레임 테두리와 겹치는 쪽은 그대로)"""
    w, h = size
    m = Image.new('L', size, 255)
    px = m.load()
    for yy in range(h):
        for xx in range(w):
            d = min([v for v, s in zip((xx, yy, w - 1 - xx, h - 1 - yy), soft) if s] or [f])
            if d < f:
                px[xx, yy] = round(255 * (d + 1) / (f + 1))
    return m


# 덜 기운 그릇: {배경판}_bare(그릇 없는 배경판) + {배경판}_v{i}(덜 기운 그릇, 보이는 곳만 잘라 투명 바탕)
tilt_plates = {}
for jf in sorted(glob.glob(os.path.join(src, '*_plate_tilt.json'))):
    plate_id = os.path.basename(jf)[:-len('_tilt.json')]
    with open(jf, encoding='utf-8') as fp:
        info = json.load(fp)
    n = len(info['angles'])
    vs = [os.path.join(src, f'{plate_id}_v{i}.png') for i in range(n)]
    if not all(os.path.exists(p) for p in vs + [os.path.join(src, f'{plate_id}_bare.png')]):
        continue
    Image.open(os.path.join(src, f'{plate_id}_bare.png')).convert('RGB').save(os.path.join(out, f'{plate_id}_bare.webp'), 'WEBP', quality=88, method=6)
    vx, vy, vw, vh = alpha_box(vs, info['rect'])
    for i, p in enumerate(vs):
        Image.open(p).convert('RGBA').crop((vx, vy, vx + vw, vy + vh)).save(os.path.join(out, f'{plate_id}_v{i}.webp'), 'WEBP', quality=90, method=6)
    tilt_plates[plate_id] = {'vessel': [vx, vy, vw, vh], 'n': n, 'angles': info['angles'], 'pour': info['pour']}
    print(plate_id, '덜 기운 그릇', n, '자리', [vx, vy, vw, vh])

# 그릇 없는 조각: {컷}_p{단계}(프레임 안에서 굳은 그릇이 보이는 곳만) → shots.json 의 tilt
for jf in sorted(glob.glob(os.path.join(src, '*_tilt.json'))):
    shot = os.path.basename(jf)[:-len('_tilt.json')]
    if shot.endswith('_plate') or shot not in meta or (only and shot not in only):
        continue
    with open(jf, encoding='utf-8') as fp:
        info = json.load(fp)
    tp = tilt_plates.get(info['plate'])
    if not tp or 'patch' not in info:
        continue
    x, y, w, h = info['patch']
    fx, fy, fw, fh = info['frame']
    mask = edge_mask((w, h), 10, (x > fx, y > fy, x + w < fx + fw, y + h < fy + fh))
    for k in range(info['levels']):
        im = Image.open(os.path.join(src, f'{shot}_p{k:02d}.png')).convert('RGB').crop((x, y, x + w, y + h)).convert('RGBA')
        im.putalpha(mask)
        im.save(os.path.join(out, f'{shot}_p{k:02d}.webp'), 'WEBP', quality=90, method=6)
    meta[shot]['tilt'] = {'patch': info['patch'], 'vessel': tp['vessel'], 'n': tp['n']}
    print(shot, '그릇 없는 조각', info['levels'], '자리', info['patch'])

# 얼음 옮기기: {컷}_drag_plate(얼음 통이 있는 배경판) + {컷}_scoop(얼음 뜬 국자) → shots.json 의 drag
for jf in sorted(glob.glob(os.path.join(src, '*_drag.json'))):
    shot = os.path.basename(jf)[:-len('_drag.json')]
    if shot not in meta or (only and shot not in only):
        continue
    with open(jf, encoding='utf-8') as fp:
        info = json.load(fp)
    Image.open(os.path.join(src, f'{info["plate"]}.png')).convert('RGB').save(os.path.join(out, f'{info["plate"]}.webp'), 'WEBP', quality=88, method=6)
    sp = os.path.join(src, f'{shot}_scoop.png')
    sx, sy, sw, sh = alpha_box([sp], info['scoop'])
    Image.open(sp).convert('RGBA').crop((sx, sy, sx + sw, sy + sh)).save(os.path.join(out, f'{shot}_scoop.webp'), 'WEBP', quality=90, method=6)
    meta[shot]['drag'] = {'plate': info['plate'], 'scoop': [sx, sy, sw, sh], 'grip': info['grip'], 'bucket': info['bucket'], 'mouth': info['mouth']}
    print(shot, '얼음 옮기기', meta[shot]['drag'])
with open(meta_path, 'w', encoding='utf-8') as fp:
    json.dump(meta, fp, ensure_ascii=False, indent=2)
    fp.write('\n')
