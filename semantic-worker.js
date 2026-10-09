/* ============================================================
 * 연관 기록 대조 — 의미 검색 작업자 (module Worker)
 *   브라우저 안에서만 도는 작은 다국어 문장 모델(multilingual-e5-small, 8비트)로 글을 수치(384차원)로 바꾼다.
 *   서버·키 없음. 모델 파일은 처음 한 번 Hugging Face에서 받아 브라우저 캐시에 둔다(약 118MB).
 *   화면 쪽(semantic-search.js)과 주고받는 메시지:
 *     → { type:'load' }                         ← { type:'progress', file, loaded, total } … { type:'ready' }
 *     → { type:'embed', id, texts:[…], kind:'query'|'passage' }   ← { type:'vectors', id, vectors:[Float32Array…] }
 *     ← { type:'error', id?, message }
 * ============================================================ */
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1';

const MODEL = 'Xenova/multilingual-e5-small';
env.allowLocalModels = false;
env.useBrowserCache = true;

let extractor = null;
let loading = null;

function load() {
  if (!loading) {
    loading = pipeline('feature-extraction', MODEL, {
      dtype: 'q8',
      progress_callback: (p) => {
        if (p.status === 'progress') self.postMessage({ type: 'progress', file: p.file, loaded: p.loaded, total: p.total });
      }
    }).then((x) => { extractor = x; self.postMessage({ type: 'ready' }); return x; },
            (e) => { loading = null; throw e; });
  }
  return loading;
}

async function handle(m) {
  try {
    if (m.type === 'load') { await load(); return; }
    if (m.type === 'embed') {
      await load();
      const prefix = m.kind === 'query' ? 'query: ' : 'passage: ';   // e5 모델 규칙
      const vectors = [];
      for (const t of m.texts) {   // 한 건씩 — 길이가 다른 글을 묶으면 채움 토큰 때문에 오히려 느리다
        const out = await extractor([prefix + t], { pooling: 'mean', normalize: true });
        vectors.push(new Float32Array(out.data));
      }
      self.postMessage({ type: 'vectors', id: m.id, vectors }, vectors.map((v) => v.buffer));
    }
  } catch (e) {
    self.postMessage({ type: 'error', id: m.id, message: String((e && e.message) || e) });
  }
}

/* 메시지는 한 줄로 세워 차례로 처리한다 — 모델 실행을 겹쳐 부르면 멈출 수 있다 */
let chain = Promise.resolve();
self.onmessage = (ev) => { const m = ev.data || {}; chain = chain.then(() => handle(m)); };
