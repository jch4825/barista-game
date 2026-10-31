"""블렌더 '동작마다 한 컷' 렌더 → 게임 그림 assets/shots/ (docs/recipes.md 6.1, Q-R9)
- 배경판: {컷}_plate.png → {컷}_plate.webp
- 프레임: {컷}_{l|s|a}{단계}.png(배경판과 같은 크기, 자리만 렌더. l = 줄기 없음, s = 줄기 있음, a = 라테아트)
  → 자리만 잘라 가장자리를 부드럽게(배경판과 이어지게) → {컷}_{l|s}{단계}.webp
- 자리·단계 수: {컷}.json → shots.json 에 모음(작업대 brew.js 가 읽음)
쓰는 법: python -X utf8 tools/blender/shots_post.py assets/_src/blender/shots assets/shots [컷,…(고친 것만)]
"""
import glob
import json
import os
import sys

from PIL import Image, ImageDraw

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
with open(meta_path, 'w', encoding='utf-8') as fp:
    json.dump(meta, fp, ensure_ascii=False, indent=2)
    fp.write('\n')
