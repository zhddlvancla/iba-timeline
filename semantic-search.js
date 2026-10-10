/* ============================================================
 * 연관 기록 대조 — 의미 검색 (브라우저 안에서만 동작, 서버·키 없음)
 *   검색창에서 Enter를 누르면 질문과 뜻이 가까운 기록을 찾는다. 글을 지어내지 않고 이미 있는 기록만 고른다.
 *   - 문장 모델은 semantic-worker.js(Worker)에서 돈다. 처음 한 번 약 118MB를 받아 브라우저 캐시에 둔다.
 *   - 기록 쪽 수치는 search-index.js에 미리 계산해 둔다(빌드: 콘솔에서 IBA_SEMANTIC.buildIndex()).
 *     기록 글이 바뀌어 지문(hash)이 어긋나면 그 기록만 그 자리에서 다시 계산한다.
 *
 *   IBA_SEMANTIC.state            'idle' | 'loading' | 'indexing' | 'ready' | 'error'
 *   IBA_SEMANTIC.progress         0~1 (모델 받기)
 *   IBA_SEMANTIC.ensure()         → Promise  모델·색인 준비
 *   IBA_SEMANTIC.search(q, k)     → Promise<[{ id, score, level }]>  level 1~5 (연관도)
 *   'iba:semantic' 이벤트로 상태를 알린다 (detail = { state, progress, error })
 * ============================================================ */
(function () {
  var MODEL = 'Xenova/multilingual-e5-small';
  var DIM = 384;
  var S = { state: 'idle', progress: 0, error: null };
  var worker = null, ready = null, seq = 0, pending = {};
  var vecs = null;   // { id: Float32Array }

  function emit() {
    window.dispatchEvent(new CustomEvent('iba:semantic', { detail: { state: S.state, progress: S.progress, error: S.error } }));
  }
  function set(state, extra) {
    S.state = state;
    if (extra) for (var k in extra) S[k] = extra[k];
    emit();
  }

  /* 기록 한 건을 문장 하나로 — 이름 · 국가 · 분야 · 본문 · 개요 요약 · 용어 (빌드와 실행이 같은 함수를 쓴다) */
  function strip(s) {
    return String(s || '').replace(/\{\{([^|}]*)\|[^}]*\}\}/g, '$1').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  }
  function docText(e) {
    var d = (window.TIMELINE_DB || {})[e.id], o = d && d.overview;
    var parts = [e.label, e.state, e.theme, e.body, o && o.summary, o && o.terms && o.terms.map(function (t) { return t.label; }).join(', ')];
    return strip(parts.filter(Boolean).join(' · ')).slice(0, 500);
  }
  function hash(s) {   // FNV-1a 32비트
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  function events() { return (window.TIMELINE_DATA && window.TIMELINE_DATA.events) || []; }

  function startWorker() {
    if (worker) return worker;
    worker = new Worker('semantic-worker.js?v=20261009a', { type: 'module' });
    var files = {};
    worker.onmessage = function (ev) {
      var m = ev.data || {};
      if (m.type === 'progress') {
        files[m.file] = [m.loaded || 0, m.total || 0];
        var L = 0, T = 0;   // 설정·사전 같은 작은 파일이 먼저 100%가 되어 막대가 튀지 않게 큰 파일(5MB 넘는 것)만 센다
        for (var f in files) if (files[f][1] > 5e6) { L += files[f][0]; T += files[f][1]; }
        S.progress = T ? L / T : 0;
        if (S.state === 'loading' || S.state === 'indexing') emit();
      } else if (m.type === 'ready') {   // 모델 받기 끝 (캐시에서 읽으면 progress 없이 바로 온다)
        S.progress = 1;
        if (S.state !== 'ready') emit();
      } else if (m.type === 'vectors' || m.type === 'error') {
        var p = pending[m.id];
        if (p) { delete pending[m.id]; m.type === 'vectors' ? p.ok(m.vectors) : p.fail(new Error(m.message)); }
        else if (m.type === 'error') { fail(m.message); }
      }
    };
    worker.onerror = function (e) { fail((e && e.message) || 'worker'); };
    return worker;
  }
  function fail(msg) {
    var all = pending; pending = {};
    for (var k in all) all[k].fail(new Error(msg));
    ready = null;
    if (worker) { worker.terminate(); worker = null; }
    set('error', { error: String(msg) });
  }
  function embed(texts, kind) {
    startWorker();
    var id = 'e' + (++seq);
    return new Promise(function (ok, fail) {
      pending[id] = { ok: ok, fail: fail };
      worker.postMessage({ type: 'embed', id: id, kind: kind, texts: texts });
    });
  }

  /* search-index.js — 처음 쓸 때만 불러온다 */
  function loadIndexScript() {
    if (window.IBA_SEARCH_INDEX) return Promise.resolve(window.IBA_SEARCH_INDEX);
    return new Promise(function (ok) {
      var s = document.createElement('script');
      s.src = 'search-index.js?v=' + (window.IBA_SEARCH_INDEX_VER || '20261010e');   // 색인을 다시 만들면 이 값도 바꾼다(브라우저 캐시)
      s.onload = function () { ok(window.IBA_SEARCH_INDEX || null); };
      s.onerror = function () { ok(null); };   // 없으면 전부 그 자리에서 계산
      document.head.appendChild(s);
    });
  }
  function decodeIndex(ix) {
    var out = {};
    if (!ix || ix.model !== MODEL || ix.dim !== DIM) return out;
    var bin = atob(ix.data), n = ix.ids.length;
    for (var i = 0; i < n; i++) {
      var v = new Float32Array(DIM), sc = ix.scales[i] / 127, base = i * DIM;
      for (var j = 0; j < DIM; j++) { var b = bin.charCodeAt(base + j); v[j] = (b > 127 ? b - 256 : b) * sc; }
      out[ix.ids[i]] = { h: ix.hashes[i], v: v };
    }
    return out;
  }

  function ensure() {
    if (ready) return ready;
    set('loading', { progress: 0, error: null });
    startWorker();
    worker.postMessage({ type: 'load' });
    ready = loadIndexScript().then(function (ix) {
      var pre = decodeIndex(ix);
      var evs = events(), todo = [], v = {};
      evs.forEach(function (e) {
        var t = docText(e), h = hash(t), p = pre[e.id];
        if (p && p.h === h) v[e.id] = p.v; else todo.push({ id: e.id, t: t });
      });
      if (!todo.length) return v;
      if (todo.length > 12) set('indexing');
      return embed(todo.map(function (x) { return x.t; }), 'passage').then(function (out) {
        todo.forEach(function (x, i) { v[x.id] = out[i]; });
        return v;
      });
    }).then(function (v) {
      vecs = v;
      // 모델이 준비될 때까지(첫 embed가 끝나야) 기다린다 — 질문 하나를 미리 돌려 둔다
      return embed(['기록'], 'query');
    }).then(function () {
      set('ready', { progress: 1 });
    }, function (e) {
      fail((e && e.message) || e);
      throw e;
    });
    return ready;
  }

  /* 연관도 — 전체 기록 점수 분포에서 얼마나 튀는지(z)로 본다. 이름·본문에 검색어가 그대로 있으면 가산 */
  function search(q, k) {
    q = String(q || '').trim();
    k = k || 6;
    if (!q) return Promise.resolve([]);
    return ensure().then(function () { return embed([q], 'query'); }).then(function (out) {
      var qv = out[0], evs = events(), rows = [], sum = 0, sum2 = 0;
      var ql = q.toLowerCase(), toks = ql.split(/\s+/).filter(function (t) { return t.length >= 2; });
      evs.forEach(function (e) {
        var v = vecs[e.id]; if (!v) return;
        var s = 0; for (var j = 0; j < DIM; j++) s += v[j] * qv[j];
        rows.push({ e: e, s: s }); sum += s; sum2 += s * s;
      });
      var n = rows.length || 1, mean = sum / n, sd = Math.sqrt(Math.max(1e-9, sum2 / n - mean * mean));
      rows.forEach(function (r) {
        var z = (r.s - mean) / sd;
        var label = String(r.e.label || '').toLowerCase(), body = String(r.e.body || '').toLowerCase();
        if (label.indexOf(ql) >= 0) z += 1.5;
        else if (toks.some(function (t) { return label.indexOf(t) >= 0; })) z += 0.8;
        else if (toks.some(function (t) { return body.indexOf(t) >= 0; })) z += 0.4;
        r.z = z;
      });
      rows.sort(function (a, b) { return b.z - a.z; });
      return rows.filter(function (r) { return r.z >= 2.0; }).slice(0, k).map(function (r) {
        return { id: r.e.id, score: r.s, z: r.z, level: Math.max(1, Math.min(5, Math.round((r.z - 1.6) / 0.5))) };
      });
    });
  }

  /* 개발용 — 지금 데이터로 search-index.js 내용을 만들어 문자열로 돌려준다 */
  function buildIndex() {
    var evs = events(), texts = evs.map(docText);
    return embed(texts, 'passage').then(function (out) {
      var bytes = new Uint8Array(evs.length * DIM), scales = [];
      out.forEach(function (v, i) {
        var mx = 0; for (var j = 0; j < DIM; j++) mx = Math.max(mx, Math.abs(v[j]));
        scales.push(+mx.toFixed(6));
        for (var j2 = 0; j2 < DIM; j2++) bytes[i * DIM + j2] = Math.round(v[j2] / mx * 127) & 255;
      });
      var bin = ''; for (var b = 0; b < bytes.length; b += 8192) bin += String.fromCharCode.apply(null, bytes.subarray(b, b + 8192));
      var ix = { model: MODEL, dim: DIM, built: new Date().toISOString().slice(0, 10),
                 ids: evs.map(function (e) { return e.id; }), hashes: texts.map(hash), scales: scales, data: btoa(bin) };
      return '/* 연관 기록 대조 색인 — semantic-search.js의 IBA_SEMANTIC.buildIndex()로 만든 파일. 손으로 고치지 않는다.\n' +
             '   기록 글이 바뀌어도 해당 기록만 실행 중에 다시 계산되므로 동작은 하지만, 데이터를 크게 고친 뒤에는 다시 만든다. */\n' +
             'window.IBA_SEARCH_INDEX = ' + JSON.stringify(ix) + ';\n';
    });
  }

  window.IBA_SEMANTIC = {
    get state() { return S.state; },
    get progress() { return S.progress; },
    get error() { return S.error; },
    ensure: ensure, search: search, docText: docText, buildIndex: buildIndex
  };
})();
