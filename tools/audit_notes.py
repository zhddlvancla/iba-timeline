"""사용자 정리본 보존 감사 — 기준 커밋의 notes 문장이 지금도 같은 노드 안에 그대로 들어 있는지 확인한다.
(문장 끝에 덧붙이거나 오타·연도·용어를 고친 경우만 '달라짐'으로 나와야 정상)

    python3 tools/audit_notes.py            # 기준: 16cd53e (요약 탭 보강 작업 직전)
    python3 tools/audit_notes.py <commit>
"""
import os, subprocess, sys, tempfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dump_db import load, ROOT

ref = sys.argv[1] if len(sys.argv) > 1 else '16cd53e'
old_src = subprocess.run(['git', '-C', ROOT, 'show', ref + ':timeline-content.js'], capture_output=True, text=True, check=True).stdout
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as t: t.write(old_src)
old = load(t.name)['db']; cur = load()['db']; os.unlink(t.name)


def strs(n):
    out = []
    for s in (n or {}).get('sections', []):
        if 'head' in s: out.append(s['head'])
        for x in s.get('list', []):
            if isinstance(x, str): out.append(x)
            else: out.append(x['t']); out.extend(x.get('sub', []))
    return out


miss = [(k, t) for k, r in old.items() for t in strs(r.get('notes'))
        if t not in '\n'.join(strs((cur.get(k) or {}).get('notes')))]
print('원문 그대로가 아닌 문장:', len(miss))
for k, t in miss: print(' ', k, '|', t[:110])
