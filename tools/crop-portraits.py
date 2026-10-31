"""
캐릭터 시트에서 표정 초상 잘라내기
  python tools/crop-portraits.py
입력: assets/{id}_sheet.jpg (896x1200 캐릭터 설정화)
출력: assets/portraits/{id}_{face}.jpg (360x418, 폴라로이드 사진 비율 0.86)
시트의 가는 회색 안내선은 지우고, 작은 크롭은 약하게 선명하게 합니다.
최종 일러스트(투명 배경 스탠딩)가 생기면 이 단계 대신 그 파일을 쓰세요(스탠딩 얼굴 자리는 tools/face-boxes.py).
"""

import os
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, "assets")
OUT = os.path.join(BASE, "portraits")
W, H = 360, 418

BOXES = {
    "yeonwoo": {"normal": (76, 126, 300, 386), "nervous": (618, 92, 868, 382), "determined": (618, 458, 868, 748), "smile": (618, 825, 868, 1115)},
    "dohyun": {"normal": (64, 80, 290, 342), "smile": (598, 74, 862, 380), "teach": (598, 440, 861, 745), "glasses": (598, 804, 860, 1108)},
    "manager": {"normal": (614, 60, 872, 359), "strict": (678, 384, 834, 565), "think": (678, 598, 834, 779), "smile": (678, 824, 834, 1005), "front": (112, 60, 312, 292)},
}


def clean_lines(img):
    px = img.load()
    w, h = img.size
    for y in range(2, h - 2):
        for x in range(w):
            r, g, b = px[x, y]
            if max(r, g, b) - min(r, g, b) < 14 and 95 < max(r, g, b) < 232 and min(px[x, y - 2]) > 236 and min(px[x, y + 2]) > 236:
                px[x, y] = (255, 255, 255)
    for x in range(2, w - 2):
        for y in range(h):
            r, g, b = px[x, y]
            if max(r, g, b) - min(r, g, b) < 14 and 95 < max(r, g, b) < 232 and min(px[x - 2, y]) > 236 and min(px[x + 2, y]) > 236:
                px[x, y] = (255, 255, 255)
    return img


def main():
    os.makedirs(OUT, exist_ok=True)
    for ch, faces in BOXES.items():
        im = Image.open(os.path.join(BASE, f"{ch}_sheet.jpg")).convert("RGB")
        for name, box in faces.items():
            crop = clean_lines(im.crop(box)).resize((W, H), Image.LANCZOS)
            if (box[2] - box[0]) < 200:
                crop = crop.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
            crop.save(os.path.join(OUT, f"{ch}_{name}.jpg"), quality=92)
            print(f"{ch}_{name}.jpg")


if __name__ == "__main__":
    main()
