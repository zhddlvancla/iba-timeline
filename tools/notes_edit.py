"""요약 탭(notes.sections) 편집기 — 사용자의 정리본은 절대 빼지 않고, 관련 항목 옆·아래에 보강만 한다.

notes 를 JSON 으로 읽어 고친 뒤, 바뀐 노드만 원래 서식대로 두 파일(index.html, timeline-content.js)에 다시 쓴다.
항목은 문자열 또는 {t, sub:[문자열...]} — 화면은 2단계까지만 그린다(sub 안에 dict 가 들어가면 write() 가 펴 준다).

    import sys; sys.path.insert(0, 'tools')
    from notes_edit import *
    app('k-goryeo', '삼사: **회계**', ' (화폐와 곡식의 출납)')      # 원문 끝에 덧붙이기
    subadd('k-goryeo', '**음서**', ['새 세부 항목'])                 # 항목 아래에 세부 항목
    after('k-goryeo', '상서성: 6부를 통한 집행', ['중추원: 군사 기밀, 왕명 출납'])
    add('k-goryeo', '군사 제도', ['섹션 끝에 추가'])                  # head 에 이 글자가 든 섹션 ('' = head 없는 첫 섹션)
    newsec('k-goryeo', '문화', ['새 섹션'], after_head='사상 — 무신')
    rep('w-rome-rep', '빈민 양상', '빈민 양산')                       # 오타·연도·용어 수정에만 쓴다
    write()
항목 인자로 ('머리', ['세부', ...]) 튜플을 주면 {t, sub} 로 들어간다.
"""
import copy, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tl import FILES, read, write as _write, rec_bounds, match_close
from dump_db import load

DB = load()['db']
CH = {}


def N(node):
    if node not in CH:
        CH[node] = copy.deepcopy(DB[node].get('notes') or {'sections': []})
        CH[node].setdefault('sections', [])
    return CH[node]


def T(x): return x if isinstance(x, str) else x['t']


def conv(x):
    if isinstance(x, str): return x
    t, sub = x; return {'t': t, 'sub': [conv(s) for s in sub]}


def sec(node, h):
    for s in N(node)['sections']:
        if h == '' and 'head' not in s: return s
        if h and h in s.get('head', ''): return s
    raise KeyError((node, 'section', h))


def where(node, txt, h=None):
    for s in N(node)['sections']:
        if h and h not in s.get('head', ''): continue
        L = s['list']
        for i, x in enumerate(L):
            if txt in T(x): return L, i
            if isinstance(x, dict):
                for j, y in enumerate(x.get('sub', [])):
                    if txt in T(y): return x['sub'], j
    raise KeyError((node, 'item', txt))


def add(node, h, items): sec(node, h)['list'].extend(conv(i) for i in items)
def after(node, txt, items, h=None): L, i = where(node, txt, h); L[i + 1:i + 1] = [conv(x) for x in items]
def before(node, txt, items, h=None): L, i = where(node, txt, h); L[i:i] = [conv(x) for x in items]


def subadd(node, txt, items, h=None):
    L, i = where(node, txt, h); x = L[i]
    if isinstance(x, str): L[i] = {'t': x, 'sub': []}; x = L[i]
    x.setdefault('sub', []).extend(conv(s) for s in items)


def app(node, txt, extra, h=None):
    L, i = where(node, txt, h); x = L[i]
    if isinstance(x, str): L[i] = x + extra
    else: x['t'] = x['t'] + extra


def newsec(node, head, items, after_head=None):
    S = N(node)['sections']; s = {'head': head, 'list': [conv(i) for i in items]}
    if after_head is None: S.append(s)
    else: S.insert([i for i, z in enumerate(S) if after_head in z.get('head', '')][0] + 1, s)


def rep(node, old, new):
    hit = [0]
    def w(x):
        if isinstance(x, str):
            if old in x: hit[0] += 1; return x.replace(old, new)
            return x
        if isinstance(x, list): return [w(y) for y in x]
        if isinstance(x, dict): return {k: w(v) for k, v in x.items()}
        return x
    CH[node] = w(N(node)); assert hit[0], (node, 'rep', old)


# ── 직렬화 ──
def _q(s): return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"
def _item(x): return _q(x) if isinstance(x, str) else "{ t: %s, sub: [%s] }" % (_q(x['t']), ', '.join(_item(s) for s in x.get('sub', [])))


def _ser(notes, comment):
    secs = notes.get('sections', [])
    if not secs: return "notes: { sections: [] }"
    out = ["notes: {" + comment, "      sections: ["]
    for i, s in enumerate(secs):
        h = ("{ head: %s, list: [" % _q(s['head'])) if 'head' in s else "{ list: ["
        lines = [' ' * 10 + _item(x) for x in s.get('list', [])]
        out.append(' ' * 8 + h + ('\n' + ',\n'.join(lines) if lines else ''))
        out.append(' ' * 8 + "] }" + (',' if i < len(secs) - 1 else ''))
    out += ["      ]", "    }"]
    return '\n'.join(out)


def _bounds(txt, node):
    s, e = rec_bounds(txt, node)
    m = re.search(r"\n    notes: \{", txt[s:e])
    if not m:   # notes 가 없으면 레코드 맨 앞에 빈 notes 를 만든다
        j = txt.index('{', s + 3); txt = txt[:j + 1] + "\n    notes: { sections: [] }," + txt[j + 1:]
        return _bounds(txt, node)
    b = s + m.start() + 5; c = match_close(txt, s + m.end() - 1, '{', '}')
    return txt, b, c + 1


def _flat2(notes):
    for s in notes['sections']:
        for x in s.get('list', []):
            if isinstance(x, dict) and x.get('sub'):
                out = []
                for y in x['sub']:
                    if isinstance(y, dict): out.append(y['t']); out.extend(y.get('sub', []))
                    else: out.append(y)
                x['sub'] = out


def write():
    for notes in CH.values(): _flat2(notes)
    for f in FILES:
        txt = read(f)
        for node, notes in CH.items():
            txt, b, c = _bounds(txt, node)
            m = re.match(r"notes: \{(\s*//[^\n]*)", txt[b:])
            cm = m.group(1) if m else ''
            txt = txt[:b] + _ser(notes, cm) + txt[c:]
        _write(f, txt)
    print('wrote notes of', len(CH), 'nodes')
