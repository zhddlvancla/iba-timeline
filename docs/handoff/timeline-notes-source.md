# timeline-notes-source

> 한국 줄기 정리 탭의 원본은 iCloud 넘버스 파일 「수능 한국사 연표 정리(2022 개정 작업).numbers」. 내용이 텍스트 상자에 있어 CSV로는 비고, AppleScript로 text items를 뽑아야 함

The 정리 (notes) tab for Korea nodes comes from the user's Numbers file:
비공개 iCloud 자료 폴더 안의 `넘버스/한국사/수능 한국사 연표 정리(2022 개정 작업).numbers`. 개인 폴더 경로는 공개 저장소에 기록하지 않는다.

- The file has 13 sheets, from 선사 to 민주주의.
- The content sits in **text boxes over an empty table**. A CSV export only gives the table headers.
- To extract it: open the document via AppleScript (`tell application "Numbers"`). For each sheet, read the `text items` (`object text`, `position`, `width`) and the table column widths. Then close the document with `saving no`.
  - Indentation is lost, so the heading/child hierarchy has to be judged by hand.
  - Many boxes are duplicated, so dedupe them.
- In the source, `[x]` means emphasis. Convert it to `**x**` in notes.

**Done 2026-10-11:**
- 131 Korea main nodes were filled. Notes format: `{ head, list:[str | {t, sub}] }`.
- Nodes that already had notes from the same file were left alone: the governments, the 1945–48 nodes, and 발해.
- Still empty: 관동 대지진 and 여수·순천 10·19 사건. The file has no content for them.

Related: [timeline-node-standard](timeline-node-standard.md)

**World tracks (2026-10-27):** 정리 for west/eastasia/westasia main + period nodes comes from `넘버스/세계사/세계사 연표(수능특강+천재교육)` (PDF + .numbers). Use `pdftotext -raw` of the PDF: topic blocks are complete there but titles sit apart from their content and the 고대 columns wrap mid-word. Prefer the Numbers text-box line when it is a longer version of the same line, because the PDF clips some line ends. 140 nodes were filled with the file's wording only, keeping its headings (一./I./1.). The 48 ancient nodes that already had notes were left alone. The file has no content for 구석기·신석기 (west and westasia), 촐라, 응우옌, 베트남 민주 공화국, 인도·파키스탄 분리 독립, 이스라엘, 오슬로, 시리아, or 우크라이나, so those stay empty.
