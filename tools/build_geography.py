"""Create IBA's map files from the official sources listed in assets/geography/ATTRIBUTION.md."""

import argparse
import gzip
import json
from pathlib import Path
from zipfile import ZipFile

from shapely.geometry import shape
from shapely.geometry.polygon import orient


def write_json(output, name, data):
    contents = json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    encoded = contents.encode('utf-8')
    if name.endswith('.gz'):
        encoded = gzip.compress(encoded, mtime=0)
    (output / name).write_bytes(encoded)


def feature(properties, geometry):
    return {'type': 'Feature', 'properties': properties, 'geometry': geometry}


def collection(features):
    return {'type': 'FeatureCollection', 'features': features}


def rounded_ring(ring, exterior):
    points = []
    for lon, lat in ring.coords:
        point = (round(lon, 4), round(lat, 4))
        if not points or point != points[-1]:
            points.append(point)
    if len(set(points)) >= 3:
        if points[0] != points[-1]:
            points.append(points[0])
        x, y = points[0]
        area = sum((a[0] - x) * (b[1] - y) - (b[0] - x) * (a[1] - y)
                   for a, b in zip(points, points[1:]))
        correct_winding = area < 0 if exterior else area > 0
        if correct_winding:
            return points
    # Retain precision when rounding would flatten or reverse a small ring.
    return list(ring.coords)


def historical_geometry(geometry):
    source = shape(geometry)
    polygons = list(source.geoms) if source.geom_type == 'MultiPolygon' else [source]
    largest = max(polygons, key=lambda polygon: polygon.area)
    kept = []
    for polygon in polygons:
        # Keep the main polygon of even the smallest polity. Drop tiny island fragments
        # from multi-part shapes to limit per-polygon WebGL work on mobile.
        if polygon is not largest and polygon.area < 0.005:
            continue
        simplified = polygon.simplify(0.055, preserve_topology=True)
        # Globe.gl's spherical calculations use clockwise exteriors and counterclockwise holes.
        clockwise = orient(simplified, sign=-1.0)
        kept.append([rounded_ring(clockwise.exterior, exterior=True),
                     *[rounded_ring(ring, exterior=False) for ring in clockwise.interiors]])
    if len(kept) == 1:
        return {'type': 'Polygon', 'coordinates': kept[0]}
    return {'type': 'MultiPolygon', 'coordinates': kept}


def historical_rows(source):
    # The tagged source file emits one complete GeoJSON Feature per line.
    with ZipFile(source) as archive, archive.open(archive.namelist()[0]) as rows:
        for row in rows:
            if not row.startswith(b'{ "type": "Feature"'):
                continue
            item = json.loads(row.strip().rstrip(b','))
            fields = item['properties']
            if fields['Type'] != 'POLITY':
                continue
            name = fields['Name']
            start, end = fields['FromYear'], fields['ToYear']
            props = {'id': f'{name}:{start}:{end}', 'name': name, 'start': start, 'end': end,
                     'wikidata': fields['Wikidata'], 'area': round(fields['Area'])}
            yield feature(props, historical_geometry(item['geometry']))


def year_chunks(min_year, max_year):
    steps = ((1200, 200), (1700, 50), (1800, 20), (max_year + 1, 10))
    start = min_year
    while start <= max_year:
        step = next(step for upper, step in steps if start < upper)
        end = min(start + step - 1, max_year)
        yield start, end
        start = end + 1


def build_historical(source, output):
    rows = list(historical_rows(source))
    min_year = min(row['properties']['start'] for row in rows)
    max_year = max(row['properties']['end'] for row in rows)
    chunks = []
    for start, end in year_chunks(min_year, max_year):
        chunk = [row for row in rows if row['properties']['start'] <= end and row['properties']['end'] >= start]
        name = f'history-{start}.geojson.gz'
        write_json(output, name, collection(chunk))
        chunks.append({'file': name, 'start': start, 'end': end})
    return {'minYear': min_year, 'maxYear': max_year, 'chunks': chunks}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Folder containing cliopatria.zip, countries.geojson and land.geojson')
    args = parser.parse_args()
    output = Path(__file__).resolve().parent.parent / 'assets' / 'geography'
    output.mkdir(parents=True, exist_ok=True)

    countries = json.loads((args.source / 'countries.geojson').read_text(encoding='utf-8'))['features']
    modern = []
    for item in countries:
        props = item['properties']
        modern.append(feature({
            'id': props['ADM0_A3'], 'name': props['NAME_EN'] or props['NAME'],
            'nameKo': props['NAME_KO'], 'wikidata': props['WIKIDATAID'],
            'iso2': props['ISO_A2_EH'], 'iso3': props['ISO_A3_EH'],
        }, item['geometry']))
    write_json(output, 'modern.geojson', collection(modern))

    land = json.loads((args.source / 'land.geojson').read_text(encoding='utf-8'))['features']
    write_json(output, 'land.geojson', collection([feature({}, item['geometry']) for item in land]))
    historical = build_historical(args.source / 'cliopatria.zip', output)
    write_json(output, 'manifest.json', {
        'historical': historical,
        'modern': {'file': 'modern.geojson'},
        'land': {'file': 'land.geojson'},
    })


if __name__ == '__main__':
    main()
