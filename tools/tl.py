"""TIMELINE_DB 레코드를 소스 텍스트에서 직접 고치는 도우미 (index.html · timeline-content.js 두 파일에 똑같이 적용).

    from tl import FILES, read, write, put, remove_src, srcs
    for f in FILES:
        txt = read(f)
        txt = put(txt, 'k-goryeo', 'artifacts', [(src, caption, ref, span)])
        write(f, txt)
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = ['timeline-content.js', 'index.html']


def read(f): return open(os.path.join(ROOT, f), encoding='utf-8').read()
def write(f, txt): open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(txt)


def rec_bounds(txt, node):
    """'  'id': {' 레코드의 [시작, 끝) — TIMELINE_DB 안에서만 찾는다"""
    s = txt.index("\n  '%s': {" % node, txt.index('TIMELINE_DB = {'))
    m = re.compile(r"\n  '[a-z0-9-]+': \{|\n\};").search(txt, s + 5)
    return s, m.start()


def match_close(txt, j, o='[', c=']'):
    """j 위치의 여는 괄호에 맞는 닫는 괄호 위치 (문자열·// 주석 인식)"""
    d = 0; k = j; q = None
    while True:
        ch = txt[k]
        if q:
            if ch == '\\': k += 2; continue
            if ch == q: q = None
        elif ch in "'\"`": q = ch
        elif ch == '/' and txt[k + 1] == '/': k = txt.index('\n', k); continue
        elif ch == o: d += 1
        elif ch == c:
            d -= 1
            if d == 0: return k
        k += 1


def _q(s): return s.replace('\\', '\\\\').replace("'", "\\'")


def fmt_a(src, cap, ref='', span=False):
    s = "      { slot: 'auto', src: '%s',%s\n        caption: '%s'" % (_q(src), " span: true," if span else "", _q(cap))
    return s + (",\n        ref: '%s' }" % _q(ref) if ref else " }")


def fmt_s(src, cap, gloss='', span=False):
    s = "      { kind: '탐구 자료', title: '%s',\n        src: '%s'" % (_q(cap), _q(src))
    return s + (",\n        gloss: '%s' }" % _q(gloss) if gloss else " }")


def put(txt, node, key, items):
    """artifacts / sources 배열 끝에 항목 추가 (배열이 없으면 만든다). items = [(src, caption, ref, span)]"""
    fmt = fmt_a if key == 'artifacts' else fmt_s
    s, e = rec_bounds(txt, node); seg = txt[s:e]
    m = re.search(r"\n    %s: \[" % key, seg)
    body = ',\n'.join(fmt(*x) for x in items)
    if not m:
        k = seg.rfind('\n  }')
        return txt[:s] + seg[:k].rstrip().rstrip(',') + ",\n    %s: [\n%s\n    ]" % (key, body) + seg[k:] + txt[e:]
    j = s + m.end() - 1; k = match_close(txt, j)
    if txt[j + 1:k].strip() == '':
        return txt[:j + 1] + '\n' + body + '\n    ' + txt[k:]
    pre = txt[j + 1:k].rstrip()
    if not pre.endswith(','): pre += ','
    return txt[:j + 1] + pre + '\n' + body + '\n    ' + txt[k:]


def entries(txt, node, key):
    """레코드의 key 배열 안 최상위 {..} 들 → [(start, end, text)]"""
    s, e = rec_bounds(txt, node); seg = txt[s:e]
    m = re.search(r"\n    %s: \[" % key, seg)
    if not m: return []
    j = s + m.end() - 1; k = match_close(txt, j); out = []; p = j + 1
    while True:
        b = txt.find('{', p, k)
        if b < 0: break
        c = match_close(txt, b, '{', '}'); out.append((b, c + 1, txt[b:c + 1])); p = c + 1
    return out


def remove_src(txt, node, src, key=None):
    for kk in ([key] if key else ['artifacts', 'sources']):
        for b, c, t in entries(txt, node, kk):
            if "src: '%s'" % src in t:
                ls = txt.rfind('\n', 0, b); end = c
                if txt[end:end + 1] == ',': end += 1
                return txt[:ls] + txt[end:], True
    return txt, False


def srcs(txt, node):
    out = []
    for kk in ['artifacts', 'sources']:
        for b, c, t in entries(txt, node, kk):
            m = re.search(r"src: '([^']+)'", t)
            cap = re.search(r"(?:caption|title): '([^']*)'", t)
            out.append((kk, m.group(1) if m else None, cap.group(1) if cap else ''))
    return out
