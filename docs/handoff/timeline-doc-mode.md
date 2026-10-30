# timeline-doc-mode

> timeline-app 기록 열람 "스캔 문서" 연출(db.docMode) — 탭 지도·요약·상세·자료·탐구, 위험 노드는 {{원본|왜곡}} 찾아 정정 + 대응반 전용 LUMINA 보고 탭, 검은 막대=LUMINA 접근 흔적

On 2026-09-22 the user asked to restyle 기록 열람 (SyncDialog) as scanned paper documents, first on 발해 (`k-balhae`, also a 위험 노드).

**2026-10-28: applied to EVERY record.** The user asked: 「모든 메인 노드를 발해 노드와 같이 변경 … 정리→요약, 개요→상세, 각 탭의 미감과 구성도 변경」.
- `db.docMode` no longer gates anything. Any node with a TIMELINE_DB record renders `DocView`.
- Tabs for every record: 지도 01 · 요약 02 · 상세 03 · 자료 04 · 탐구 05 · 연결 06 · 연구원 기록 07.
  - 연결 was kept as a doc-styled 관련 기록 대조표. If the user wants 발해's original 5 tabs, it can be dropped.
- The 부속 자료 열람 button shows on every record, including 발해.
- The old CRT tab components (NotesTab/OverviewTab/SourcesTab/MapTab/ArtifactsTab/LinkedTab/ResearchTab) were deleted. `EntryList` remains only for AnnexModal.
- Doc numbers come from `docBase()`: `db.docNo`, or else `KR|EA|EU|WA-<yearCode>-<2 letters>`.
- 요약 supports `{t,sub}` items and `**cloze**` (highlighter style; blanks in 강의 모드), laid out in CSS columns.
- src-less artifacts/sources show as 「도판 결락」 plates (`DocVoid`).
- Sources render as 사료 blocks: quote, 해설, gallery.
- Doc breakpoints are `@container` rules on `.docx-desk`, so lecture mode stacks when the desk is ≤1000px.
- LUMINA/`{{}}` mechanics switch on only when the record has distortions (`docCountRedactions>0`). The LUMINA tab appears only if `db.lumina` exists.

- Opt-in: `TIMELINE_DB[id].docMode = true` (+ `docNo`). Tabs are 지도·요약·상세·자료·탐구.
  - 요약 shows the former 정리 content (`notes`); 상세 shows the former 개요 content (`overview`). The 연결 tab is dropped.
  - Code lives in `DocView` / `DocText` / `DocPlate` in index.html, with CSS prefix `.docx-*`.
- Layout rules (2026-09-23):
  - Header: doc kind on the left, the node name large and centred, seal and stamp on the right. The page is not tilted and fills the full width.
  - Landscape images put their text below; portrait images put it beside.
  - 요약 uses 2 columns. 상세 has a lead box, then 핵심 개념 | vertical 연표. 지도: clicking the map opens a large modal.
- **Risk-node mechanic (user feedback 2026-09-26):** risk nodes must not simply hide text. They carry distorted content based on the node, and 대응반 finds and fixes it.
  - Data syntax is `{{원본|왜곡}}`, used **only in 지도·요약·상세** (user 2026-09-27). 연구원 접속 shows the original. 대응반 접속 shows the distortion in red text; clicking it strikes it through and writes the original beside it (정정 — never erase). Clicking a normal sentence shows "원본과 일치".
  - Distortions must be the real claims of the risk kind (e.g. 동북공정: 말갈인 건국, 당의 지방 정권, 발해군왕, 홀한주 도독부). Originals stay textbook-accurate.
  - **Images inside risk nodes get no black treatment** — no ink over images (`inquiry.redact` was removed). Black appears only as `████` unreadable fields in the LUMINA report. The black-bar sweep on doc open was removed — don't re-add it.
  - **자료·탐구 are sealed in 대응반 mode.** Tabs are LUMINA · 지도 · 요약 · 상세. When every distortion is fixed (원본 복원), the 자료 and 탐구 tabs appear with a short RGB-split glitch (`sync-tab--unlock`) and a transition sfx. 연구원 mode always shows all 5 tabs. Fixes reset when the dialog closes.
  - **LUMINA 왜곡 보고 tab** is the first tab, left of 지도, styled red (`sync-tab--risk`). It appears only in 대응반 mode and is the default tab there. Data is `db.lumina`, and its 정정 현황 table lists 04/05 as 열람 봉인 → 봉인 해제.
- 발해 has 6 fixes (지도 1, 요약 3, 상세 2). Images come from 동아출판 한국사1 p.23, in `assets/w1/고대/한국/`.

**How to apply:** when extending to other risk nodes, write `{{원본|왜곡}}` pairs plus a `lumina` block, and keep the originals identical to textbook wording.

Related: [timeline-node-terminology](timeline-node-terminology.md)
