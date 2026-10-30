"""timeline-content.js 를 실행해 TIMELINE_DB / TIMELINE_DATA / NODE_GROUPS 를 JSON으로 읽는다.
node 가 있으면 node, 없으면 macOS jsc 를 쓴다.

    python3 tools/dump_db.py            # 요약 출력
    python3 tools/dump_db.py out.json   # 전체를 JSON 파일로 저장
    from dump_db import load            # 다른 스크립트에서 dict 로 받기
"""
import json, os, shutil, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, 'timeline-content.js')
JSC = '/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc'
EXPR = "JSON.stringify({db:window.TIMELINE_DB,ev:window.TIMELINE_DATA.events,groups:window.NODE_GROUPS||null})"


def load(path=CONTENT):
    if shutil.which('node'):
        code = "global.window={};require(%s);process.stdout.write(%s)" % (json.dumps(os.path.abspath(path)), EXPR)
        out = subprocess.run(['node', '-e', code], capture_output=True, text=True, check=True).stdout
    elif os.path.exists(JSC):
        out = subprocess.run([JSC, '-e', 'var window={};', path, '-e', 'print(%s)' % EXPR],
                             capture_output=True, text=True, check=True).stdout
    else:
        sys.exit('node 또는 jsc 가 필요합니다')
    return json.loads(out)


if __name__ == '__main__':
    d = load()
    if len(sys.argv) > 1:
        json.dump(d, open(sys.argv[1], 'w'), ensure_ascii=False)
    print('records', len(d['db']), '· events', len(d['ev']))
