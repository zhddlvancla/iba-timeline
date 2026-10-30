#!/bin/sh
# 데이터 파일 문법 검사 + index.html 과 timeline-content.js 의 TIMELINE_DB 가 같은지 확인
cd "$(dirname "$0")/.." || exit 1
python3 tools/dump_db.py >/dev/null && echo "timeline-content.js 문법 OK"
python3 - <<'PY'
import re
a = open('timeline-content.js').read(); b = open('index.html').read()
def db(s):
    i = s.index('window.TIMELINE_DB = {'); return [l for l in s[i:].split('\n};', 1)[0].splitlines() if l.strip()]
print('TIMELINE_DB 두 파일 일치' if db(a) == db(b) else '!! TIMELINE_DB 가 두 파일에서 다릅니다')
PY
