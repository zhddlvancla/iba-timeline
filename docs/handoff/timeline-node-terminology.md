# timeline-node-terminology

> timeline-app 노드 명명 규칙 — 메인 노드 / 서브 노드 / 기간 노드(옛 주제 노드) / 위험 노드 정의

Node naming rules in timeline-app (`index.html`):

- **메인 노드 (Main node)**: has the '기록 열람 · VIEW RECORD' button (formerly 분기점 열람). It is `kind: 'turning'` and opens a detailed dossier (DB). Example: '로마'.
- **서브 노드 (Sub node)**: no 기록 열람. Its marker definition has `noSync: true`, usually with `kind: 'event'`. The right panel shows only the body text, with no dossier button. Example: '전국 시대'.
- **기간 노드 (Period node)** — renamed from 주제 노드 on 2026-10-20 (user: 「주제 노드라는 말은 없앤다」; never say 주제 노드 again): shown only as a bracket label over a span of years. Examples: '춘추·전국 시대', '위·진·남북조 시대', '로마의 평화(Pax Romana)', '로마: 군인 황제 시대', '교회 대분열 시대'. ('그리스 문화' was turned into a main node on 2026-10-20.)
  - It combines two pieces: ① the marker has `hidden: true` (no marker drawn on the track, `kind: 'event'`) ② a bracket entry (`startYear`/`endYear`/`label`/`targetId`) in the module-level `NODE_GROUPS`. `onClick` is generated automatically from `targetId`.
  - There is no `noSync`, so **기록 열람 is available** (it has a dossier like a main node). The DB entry must have `syncRatio`, otherwise the header shows NaN%.
  - The bracket renders below the track (+34); when the track is focused and the bracket falls inside a branch span it drops below the lowest branch lane (한국 삼국 → under 가야, 유럽 843~1500 → under 이탈리아).
- **위험 노드 (Risk node)**: a node LUMINA, the faction trying to distort history, is targeting. The event has a `risk: { by: 'LUMINA', level, note, evidence }` field. In the topbar's **대응반 접속** (`accessMode: 'response'`), its marker, label and leader switch from amber to red. The right panel shows a red '▲ 위험 노드' badge, the distortion note and the source evidence. Under **연구원 접속**, it looks the same as a normal node. `risk.kind` is the distortion type: '동북 공정' (고조선·고구려·발해), '식민 사관' (당파성론→숙종·환국, 정체성론→대동법, 타율성론→국권 피탈), '일본의 역사 왜곡' (독도→러·일 전쟁, 산미 증식 미화→‘문화 정치’, 강제 동원·위안부 부정→국가 총동원법). The source is the 한국사2 (동아출판) sections on 식민 사관 and 동아시아 역사 갈등.

Render logic: the `is-sync` class is added only when `!e.linkTo && !e.noSync`, so sub nodes never get `is-sync`. `tl-node--turn` is added only when `kind==='turning'`. `is-risk` is added only when response mode is on and `e.risk` exists. `hidden` nodes are dropped from the track render list, but `TIMELINE_DATA.events.find()` still finds them, so the right panel and dossier work normally.

**Why:** The user refers to nodes by these terms in future conversations.
