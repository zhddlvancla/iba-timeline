#!/bin/sh
# 데이터 문법 검사 + 두 파일의 시대 구분 / TIMELINE_DATA / TIMELINE_DB 일치 검사
set -eu
cd "$(dirname "$0")/.."
python3 tools/dump_db.py >/dev/null
echo "timeline-content.js 문법 OK"
python3 - <<'CHECK'
from pathlib import Path
import sys

sources = [Path(name).read_text(encoding='utf-8')
           for name in ('timeline-content.js', 'index.html')]

def assignment(source, name):
    array = name == 'TIMELINE_ERAS'
    marker = 'window.' + name + (' = [' if array else ' = {')
    start = source.index(marker)
    closing = '\n];' if array else '\n};'
    end = source.index(closing, start) + len(closing)
    return [line for line in source[start:end].splitlines() if line.strip()]

failed = False
for name in ('TIMELINE_ERAS', 'TIMELINE_DATA', 'TIMELINE_DB'):
    try:
        same = assignment(sources[0], name) == assignment(sources[1], name)
    except ValueError:
        same = False
    print(name + (' 두 파일 일치' if same else ' 두 파일 불일치 또는 선언 누락'))
    failed |= not same
sys.exit(1 if failed else 0)
CHECK
