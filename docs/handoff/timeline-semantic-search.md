# timeline-semantic-search

> timeline-app 연관 기록 대조(검색창 Enter) — 브라우저 안 의미 검색, multilingual-e5-small Worker + search-index.js; 데이터 크게 바꾸면 색인 재생성

On 2026-10-09 the user wanted real AI in the search box, free. Of the two options offered they chose **A, semantic search in the browser**, over B, a Gemini free tier behind a proxy.

**How it works:**
- The search box (`.subnav__search`) still filters by keyword as you type. **Enter** opens `<SemanticPop/>` (`.sempop`) with up to 6 related records, each showing RO code, year, label and a 1–5 relevance bar.
- Clicking a result clears the query, turns its track on and calls `window.__tmbJumpToNode(id)`, which focuses the track and selects the node.
- The placeholder is 「검색 · ⏎ 연관 대조」. Longer text clips at 1280.

**Files** (all whitelisted in `.gitignore`):
- `semantic-worker.js`
  - A module Worker that imports `@huggingface/transformers@3.5.1` from jsdelivr and runs `Xenova/multilingual-e5-small` with dtype q8. The model is about 118MB, downloaded from Hugging Face once and kept in the browser cache.
  - Messages are processed **serially**. Concurrent runs hung the ONNX session.
- `semantic-search.js` provides `window.IBA_SEMANTIC`: `ensure` / `search` / `docText` / `buildIndex`, plus the `iba:semantic` event.
  - Scores are z-scores across all records, with a lexical boost (label match +1.5, label token +0.8, body token +0.4). Results need z ≥ 2.0.
- `search-index.js` holds the precomputed int8 vectors and an FNV hash of each record's text.
  - At runtime, records whose hash mismatches are re-embedded on the fly (~0.3 s each in the Worker).
  - After big data changes, rebuild it: run `await IBA_SEMANTIC.buildIndex()` in the console (about 90 s) and save the returned string as `search-index.js`.
  - After rebuilding, bump the default `IBA_SEARCH_INDEX_VER` in semantic-search.js (browser cache) and the script `?v=`. It was rebuilt on 2026-10-09 with 296 records after the 삼국 시대 nodes.
  - Saving trick used: a one-shot local python POST receiver on port 5599 ((old session scratchpad, gone) `recv_server.py`), run with run_in_background.

**Testing notes:**
- The browser pane often reports `visibilityState: hidden`. Then rAF and CSS animations stall and screenshots are stale, but Worker and timer code still runs, so verify through the DOM.
- At 1280×800 with a track focused, or in lecture mode, the subnav collapses (tl-tight), so the search box isn't visible. That is existing behaviour.
- The `__enter()` helper in `localStorage.__h` now fills the approval-code boxes (RS-26-20301-SIT) and submits them.

**Limits to remember:**
- Junk queries such as 「오늘 점심 메뉴」 still return weak matches.
- Results only point to existing records; nothing is generated, which fits the no-guessing rule.

Related: [timeline-history-data-rules](timeline-history-data-rules.md) [timeline-dendro-canon](timeline-dendro-canon.md) [timeline-ui-conventions](timeline-ui-conventions.md)
