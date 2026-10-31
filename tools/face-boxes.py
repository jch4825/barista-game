"""
스탠딩 그림에서 얼굴 자리를 재서 대화창 얼굴 아이콘·초상(머리와 어깨) 자르기 값을 만듭니다.
  python tools/face-boxes.py  →  js/data/faceboxes.js

머리 꼭대기에서부터 줄마다 그림 폭을 재다가, 어깨에서 폭이 확 넓어지는 곳을 머리 아래 끝으로 봅니다.
값은 CSS background-size(%) · background-position x(%) · y(%) 입니다(js/data/characters.js 의 faceHTML·portraitHTML 이 씀).
새 스탠딩 그림을 넣으면(npm run images 뒤) 이 도구를 다시 실행합니다.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STAND = ROOT / 'assets' / 'stand'
OUT = ROOT / 'js' / 'data' / 'faceboxes.js'


def head_box(path: Path):
    a = np.asarray(Image.open(path).convert('RGBA'))[:, :, 3] > 128
    H, W = a.shape
    rows = a.sum(1)
    top = int(np.argmax(rows > 4))
    widths = []
    bottom = top + int(H * 0.3)
    for y in range(top, top + int(H * 0.35)):
        xs = np.nonzero(a[y])[0]
        if not len(xs):
            continue
        w = xs[-1] - xs[0]
        widths.append(w)
        # 머리 아래: 머리 폭(지금까지의 중간값)보다 1.55배 넘게 넓어지면 어깨
        if len(widths) > 60 and w > 1.55 * float(np.median(widths[20:])):
            bottom = y
            break
    head = a[top:bottom]
    ys, xs = np.nonzero(head)
    cx = float(np.median(xs))
    return W, H, top, bottom, cx


def css_box(W, H, cx, cy, win):
    """그림의 (cx, cy)를 가운데로 win px 정사각 창을 보이게 하는 background 값"""
    size = W / win * 100
    dw = W / win            # 상자 폭을 1로 볼 때 그린 그림 폭
    dh = dw * H / W
    px = (cx / W * dw - 0.5) / (dw - 1) * 100
    py = (cy / H * dh - 0.5) / (dh - 1) * 100
    return [round(size), round(max(0, min(100, px)), 1), round(max(0, min(100, py)), 1)]


def main():
    face, portrait = {}, {}
    for f in sorted([*STAND.glob('*.png'), *STAND.glob('*.webp')]):   # 스탠딩은 WebP(2026-10-26)
        if '-blink' in f.stem or '-talk' in f.stem:
            continue
        W, H, top, bottom, cx = head_box(f)
        hh = bottom - top
        face[f.stem] = css_box(W, H, cx, top + hh * 0.56, hh * 1.05)          # 얼굴이 동그라미를 거의 채움
        portrait[f.stem] = css_box(W, H, cx, top + hh * 0.85, hh * 1.9)       # 머리와 어깨
    body = ('/**\n * 스탠딩 그림별 얼굴 아이콘·초상 자르기 값 (자동 생성: python tools/face-boxes.py)\n'
            ' * { 그림 이름: [background-size %, x %, y %] }\n */\n'
            f'export const FACE_BOX = {json.dumps(face, ensure_ascii=False, indent=1)};\n\n'
            f'export const PORTRAIT_BOX = {json.dumps(portrait, ensure_ascii=False, indent=1)};\n')
    OUT.write_text(body, encoding='utf-8')
    print(f'{len(face)}개 → {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
