"""이미지 중복 판정용 dHash (16×16 = 256비트). 같은 노드 안에서 거리 30 이하면 같은 이미지로 본다.
거리 34~40 은 다른 이미지가 걸리는 경우가 있었다(비파형동검 ↔ 월정사 34). Pillow 필요.

    from phash import dhash, dist
    if dist(dhash(a), dhash(b)) <= 30: ...
"""
import json, os
from PIL import Image

CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.hash_cache.json')
_c = json.load(open(CACHE)) if os.path.exists(CACHE) else {}


def dhash(path, n=16):
    key = os.path.abspath(path)
    if key in _c: return _c[key]
    im = Image.open(path).convert('L').resize((n + 1, n), Image.LANCZOS)
    px = list(im.getdata()); bits = 0
    for y in range(n):
        for x in range(n):
            bits = (bits << 1) | (px[y * (n + 1) + x] > px[y * (n + 1) + x + 1])
    _c[key] = h = '%0*x' % (n * n // 4, bits)
    return h


def dist(a, b): return bin(int(a, 16) ^ int(b, 16)).count('1')


def save(): json.dump(_c, open(CACHE, 'w'))
