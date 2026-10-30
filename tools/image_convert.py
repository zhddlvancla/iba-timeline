"""교과서 이미지 → 앱용 webp. 긴 변 1600 미만이면 LANCZOS로 2000까지 키우고 언샤프 마스크, 2400 초과면 2400으로 줄인다. q88.
파일명은 macOS(iCloud)에서 NFD로 오므로 NFC로 바꿔서 쓴다.

    python3 tools/image_convert.py 원본.jpg assets/w1/고대/한국/천재/캡션-1.webp
"""
import sys, unicodedata
from PIL import Image, ImageFilter


def convert(src, dst):
    im = Image.open(src); im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    w, h = im.size; long = max(w, h)
    if long < 1600:
        r = 2000 / long; im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
    elif long > 2400:
        r = 2400 / long; im = im.resize((round(w * r), round(h * r)), Image.LANCZOS)
    im.save(unicodedata.normalize('NFC', dst), 'WEBP', quality=88, method=6)


if __name__ == '__main__':
    convert(sys.argv[1], sys.argv[2])
