"""지구본 전수 검사(2026-11-27)에 따른 도형 교정을 미리 계산해 tools/geography_geometry.json.gz로 저장한다.

shapely가 필요하다(pip install shapely). 결과 파일만 있으면 geography_corrections.apply()는 shapely 없이 동작한다.
assets/geography/history-*.js를 읽어 계산한다. 이 교정이 이미 들어간 파일에서 실행하면 빼낼 겹침이 없어 결과가 달라지므로,
다시 계산할 때는 먼저 `IBA_NO_GEOMETRY=1 python3 build_geography.py`로 도형 교정 전 파일을 만든 뒤 실행하고,
그다음 `python3 apply_geography_corrections.py`로 적용한다.

교정 내용 (docs/handoff/timeline-map-audit-2026-11-27.md)
- 한국사 교과서 서술에 맞춘 보정: 고구려 중심지(졸본·국내성), 초기 백제(한강 유역)·신라(경주)·대가야(고령),
  원 간섭기 고려(1260~1362), 왜란·호란 시기 조선 영역
- 개창 연도 보정: 원(1271~1293), 명(1368~1374)
- 원자료 오류 제거: 이란을 덮은 네덜란드령 동인도(1895~1897), 이스탄불의 나치 독일 조각,
  통일 이후 베를린의 프랑스 조각, 1949년 이후 한반도의 미국 조각
"""

import gzip
import json
import math
from pathlib import Path

from shapely.geometry import MultiPolygon, Point, Polygon, mapping, shape
from shapely.ops import unary_union
from shapely.validation import make_valid

import apply_geography_corrections as A

OUT = Path(__file__).resolve().parent / 'geography_geometry.json.gz'


def clean(geom):
    geom = make_valid(geom)
    if geom.geom_type == 'GeometryCollection':
        geom = unary_union([g for g in geom.geoms if g.geom_type in ('Polygon', 'MultiPolygon')])
    parts = [p for p in (geom.geoms if geom.geom_type == 'MultiPolygon' else [geom])
             if p.geom_type == 'Polygon' and p.area > 1e-4]
    return MultiPolygon(parts) if len(parts) > 1 else (parts[0] if parts else None)


def rounded(geom):
    def ring(coords):
        out = []
        for x, y in coords:
            point = [round(x, 4), round(y, 4)]
            if not out or out[-1] != point:
                out.append(point)
        return out
    polys = list(geom.geoms) if geom.geom_type == 'MultiPolygon' else [geom]
    coords = [[ring(p.exterior.coords)] + [ring(h.coords) for h in p.interiors] for p in polys]
    return {'type': 'Polygon', 'coordinates': coords[0]} if len(coords) == 1 else {'type': 'MultiPolygon', 'coordinates': coords}


def load():
    manifest = A.read_data('manifest.js')
    seen = {}
    for chunk in manifest['historical']['chunks']:
        for f in A.read_data(chunk['file'])['features']:
            seen.setdefault(f['properties']['id'], f)
    return list(seen.values())


FEATURES = load()
LAND = unary_union([make_valid(shape(f['geometry'])) for f in A.read_data('land.js')['features']])


def find(name, year):
    hits = [f for f in FEATURES if f['properties']['name'] == name and f['properties']['start'] <= year <= f['properties']['end']]
    assert len(hits) == 1, (name, year, len(hits))
    return hits[0]


def geom_of(name, year):
    return clean(shape(find(name, year)['geometry']))


def circle(lat, lng, r):
    return Point(lng, lat).buffer(r, 64)


ops = {}      # feature id -> [(start, end, fn)]
adds = []


def op(feature, a, b, fn):
    p = feature['properties']
    if p['end'] < a or p['start'] > b:
        return
    ops.setdefault(p['id'], []).append((max(a, p['start']), min(b, p['end']), fn))


def add(name, start, end, geom, template_year=None, label=None):
    if geom is None or geom.is_empty:
        return
    props = {'id': f'{name}:{start}:{end}', 'name': name, 'start': start, 'end': end}
    if template_year is not None:
        t = find(name, template_year)['properties']
        props.update({k: v for k, v in t.items() if k in ('wikidata',)})
    if label:
        props['labelKo'] = label
    props['area'] = round(geom.area * 12364)
    adds.append({'type': 'Feature', 'properties': props, 'geometry': rounded(geom)})


def carve(core, a, b, keep, union_into=()):
    """a~b년에 core와 겹치는 도형에서 core를 빼고, union_into 이름의 도형에는 core를 더한다."""
    for f in FEATURES:
        p = f['properties']
        if p['end'] < a or p['start'] > b or not f['geometry']:
            continue
        if p['name'] in union_into:
            op(f, a, b, lambda g, c=core: g.union(c))
            continue
        if p['name'] in keep:
            continue
        if shape(f['geometry']).buffer(0).intersection(core).area > 1e-3:
            op(f, a, b, lambda g, c=core: g.difference(c))


def drop_parts(names, a, b, box):
    x0, y0, x1, y1 = box
    def fn(g):
        parts = list(g.geoms) if g.geom_type == 'MultiPolygon' else [g]
        kept = [p for p in parts if not (x0 <= p.centroid.x <= x1 and y0 <= p.centroid.y <= y1)]
        return MultiPolygon(kept) if kept else Polygon()
    for f in FEATURES:
        if f['properties']['name'] in names:
            op(f, a, b, fn)


# 1. 고구려: 졸본(환런)·국내성(지안)을 건국부터 고구려 영역으로 (기원전 37~312)
goguryeo_core = Point(125.36, 41.27).union(Point(126.19, 41.13)).convex_hull.buffer(0.35, 64).intersection(LAND)
carve(goguryeo_core, -37, 312, keep=(), union_into=('Goguryeo',))
add('Goguryeo', -37, -37, geom_of('Goguryeo', -36).union(goguryeo_core), template_year=-36)
op(find('Goguryeo', 633), 633, 633, lambda g, r=geom_of('Goguryeo', 620): r)

# 2. 초기 백제(한강 유역, 기원전 18~346)·신라(경주, 기원전 57~377)
baekje_core = circle(37.52, 127.11, 0.4).intersection(geom_of('Baekje', 350))
carve(baekje_core, -18, 346, keep=('Baekje',))
add('Baekje', -18, 346, baekje_core, template_year=350)
silla_core = circle(35.84, 129.21, 0.35).intersection(geom_of('Silla', 400))
carve(silla_core, -57, 377, keep=('Silla',))
add('Silla', -57, 377, silla_core, template_year=400)

# 3. 대가야(고령): 562년 멸망까지 가야 영역
daegaya_core = circle(35.73, 128.26, 0.3).intersection(LAND)
carve(daegaya_core, 42, 562, keep=(), union_into=('Byeonhan',))

# 4. 원 간섭기 고려(1260~1362): 고려 왕조 존속
goryeo = geom_of('Goryeo', 1259)
carve(goryeo, 1260, 1362, keep=('Goryeo',))
add('Goryeo', 1260, 1362, goryeo, template_year=1259)

# 5. 왜란(1595~1599)·호란(1636~1639) 시기 조선 영역
for (a, b, ref) in ((1595, 1599, 1590), (1636, 1639, 1633)):
    joseon = geom_of('Joseon', ref)
    op(find('Joseon', a), a, b, lambda g, r=joseon: r)
    carve(joseon, a, b, keep=('Joseon',))

# 6. 원(1271~1293): 몽골 제국 가운데 원 영역 (1279년 전에는 남송 영역 제외)
yuan = geom_of('Yuan Dynasty', 1300).difference(goryeo)
for f in FEATURES:
    if f['properties']['name'] == 'Mongol Empire':
        op(f, 1271, 1293, lambda g, y=yuan: g.difference(y))
song = sorted((f for f in FEATURES if f['properties']['name'] == 'Southern Song'
               and f['properties']['start'] <= 1278 and f['properties']['end'] >= 1271),
              key=lambda f: f['properties']['start'])
cursor = 1271
for f in song:
    s, e = max(cursor, f['properties']['start']), min(1278, f['properties']['end'])
    add('Yuan Dynasty', s, e, clean(yuan.difference(make_valid(shape(f['geometry'])))), template_year=1300)
    cursor = e + 1
assert cursor == 1279, cursor
add('Yuan Dynasty', 1279, 1293, yuan, template_year=1300)

# 7. 명(1368~1374): 원 영역에서 명 영역 분리
ming = geom_of('Ming Dynasty', 1380)
for f in FEATURES:
    if f['properties']['name'] == 'Yuan Dynasty':
        op(f, 1368, 1374, lambda g, m=ming: g.difference(m))
add('Ming Dynasty', 1368, 1374, ming, template_year=1380)

# 8. 원자료 오류
drop_parts(('Dutch East Indies', '(Netherlands)'), 1895, 1897, (40, 20, 66, 42))
op(find('Qajar Dynasty', 1896), 1895, 1897, lambda g, q=geom_of('Qajar Dynasty', 1890): g.union(q))
drop_parts(('Nazi Germany', '(Nazi Germany)'), 1936, 1939, (28.5, 40.8, 29.5, 41.3))
drop_parts(('French Fifth Republic', '(French Fifth Republic)'), 1990, 2023, (13.0, 52.3, 13.8, 52.7))
drop_parts(('United States of America', '(United States of America)'), 1949, 1966, (124, 33, 131, 39.5))

# 기능별 연도 구간으로 나누어 최종 도형을 계산한다.
replace = []
byid = {f['properties']['id']: f for f in FEATURES}
for fid, items in ops.items():
    f = byid[fid]
    p = f['properties']
    cuts = sorted({p['start'], p['end'] + 1} | {a for a, _, _ in items} | {b + 1 for _, b, _ in items})
    for s, nxt in zip(cuts, cuts[1:]):
        e = nxt - 1
        fns = [fn for a, b, fn in items if a <= s and e <= b]
        if not fns:
            continue
        g = clean(shape(f['geometry']))
        for fn in fns:
            g = clean(fn(g)) if g is not None else None
        replace.append({'name': p['name'], 'start': s, 'end': e, 'within': [p['start'], p['end']],
                        'geometry': rounded(g) if g is not None else None})

data = {'replace': replace, 'add': adds}
OUT.write_bytes(gzip.compress(json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode(), mtime=0))
print(len(replace), 'replace', len(adds), 'add', OUT.stat().st_size, 'bytes')
