"""이미 만든 역사 국경 파일(history-*.js)에 geography_corrections를 적용한다.

원자료를 다시 내려받지 않고 현재 파일만 고칠 때 쓴다. 여러 번 실행해도 결과가 같다.
build_geography.py로 원자료부터 다시 만들면 같은 교정이 자동으로 적용된다.
"""

import base64
import gzip
import json
from pathlib import Path

import geography_corrections

ROOT = Path(__file__).resolve().parent.parent / 'assets' / 'geography'


def read_data(name):
    text = (ROOT / name).read_text(encoding='utf-8').split('=', 1)[1].strip().rstrip(';')
    data = json.loads(text)
    if isinstance(data, str):
        data = json.loads(gzip.decompress(base64.b64decode(data)))
    return data


def write_data(name, data, compress):
    contents = json.dumps(data, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n'
    if compress:
        packed = gzip.compress(contents.encode('utf-8'), mtime=0)
        contents = json.dumps(base64.b64encode(packed).decode('ascii'))
    (ROOT / name).write_text('document.currentScript.ibaMapData = ' + contents.rstrip('\n') + ';\n', encoding='utf-8')


def main(dry=False):
    manifest = read_data('manifest.js')
    chunks = manifest['historical']['chunks']
    order, seen = [], {}
    for chunk in chunks:
        for feature in read_data(chunk['file'])['features']:
            key = feature['properties']['id']
            if key not in seen:
                seen[key] = feature
                order.append(key)
    rows = geography_corrections.apply([seen[key] for key in order])
    if dry:
        return rows
    for chunk in chunks:
        part = [row for row in rows
                if row['properties']['start'] <= chunk['end'] and row['properties']['end'] >= chunk['start']]
        write_data(chunk['file'], {'type': 'FeatureCollection', 'features': part}, compress=True)
    print(f'{len(order)} features -> {len(rows)} features, {len(chunks)} chunk files')


if __name__ == '__main__':
    main()
