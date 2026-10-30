# timeline-node-standard

> timeline-app 노드 표준 구성 — 「크리스트교의 성립과 확산」(w-jesus)과 같은 메인 노드 + 기록(개요 요약·용어·연표, 탐구, 자료, 연결); 새 노드는 모두 이 구성

User rule (2026-10-02): every node uses the same composition as 「크리스트교의 성립과 확산」 (`w-jesus`).

**Node fields:**
- `kind: 'turning'` (main node with 기록 열람). Never `noSync`. No `alwaysLit` and no `kind: 'theme'`/`'event'` on record nodes.
  - On 2026-10-09 the user flagged the always-glowing 한국 선사 nodes as inconsistent. All prehistory nodes plus s-assyria and s-parthia were converted to plain `turning`.
- `track`, `year` (plus `yearLabel` when needed), `label`, `en`, `state`, `theme`, and a short `body`.

**`TIMELINE_DB[id]` record:**
- `fileRef`
- `overview: { summary, terms: [{label, def}], timeline: [{y|yl, label}] }`
  - The summary starts with `'이름 — …'`.
  - The node's own event label in the timeline starts with `'◆ '`, as in w-jesus.
- `notes: { sections: [] }` — the 정리 tab always exists. Content stays empty until the user supplies it; never invent it.
  - `window.hasNotes(db)` decides whether the record opens on 정리 or on 개요.
  - 2026-10-09: 부속 자료 (`db.annex`) is opened from the 「부속 자료 열람」 button in the record header, next to 기록 두께. It shows in a centred floating window (`<AnnexModal>`, ESC or backdrop closes it).
  - The 「연구원 기록」 (RESEARCH) tab is the last tab, after 연결. It shows a separate field, `db.research`, with the same entry shape (`<EntryList>`).
  - Both fields are still empty on every node; never invent entries.
- `sources: []`, `artifacts: []` — fill them when textbook images and 탐구 자료 are added.
- `linked: [existing ids]`

**Why:** the user wants every node to open a full record in the same shape.

**How to apply:**
- When creating nodes, always add the DB record. Write the overview strictly from textbook text.
- Check facts with the textbook text dump ((old session scratchpad, gone) `tb/*.txt` via pdftotext) and drop any term the textbook doesn't contain.
- Edit both index.html and timeline-content.js.
- After converting sub→main, re-run the label overlap sweep. Wait ≥1.8 s after a track focus, or you'll measure mid-transition.

Applied on 2026-10-02 to the 104 nodes added that day (eastasia 40 / west 42 / westasia 22).
- The Korea track was restructured on 2026-10-06 (see [timeline-history-data-rules](timeline-history-data-rules.md)).
- 2026-10-06: the legacy `w-ww1.legacy` / `w-russia.legacy` records were merged into `w-ww1` / `w-russia` (sources, map, artifacts, plus a few terms) and the legacy keys deleted. k-ganghwa-treaty, k-korean-empire, k-annexation and k-rok got records, so every main node now has one.

Related: [timeline-history-data-rules](timeline-history-data-rules.md) [timeline-node-terminology](timeline-node-terminology.md)
- 2026-10-10 개요 audit (user: 「개요 탭 교과서 근거로 점검·보강」):
  - All 52 textbook PDFs are dumped to (old session scratchpad, gone) `tb/*.txt`. `tbgrep.py` searches them, and `verify_ov.py` checks every overview's terms and years against them.
  - 33 thin overviews were rewritten from the textbook, and 4 records got the timeline they lacked.
  - Errors fixed:
    - 명 멸망: the 오삼계/산하이관 claim is not in the textbook.
    - 부여·옥저·동예: the claims about 12월 영고, 순장 and 공물 are not in the textbook.
    - 플라시: 프랑스·벵골 연합군.
    - 9·11: removed the 이라크 claim.
    - 사파비: '16세기 초'.
  - 7 Korean king overviews stay short because the textbook says little.
  - Terms in ancient world/East Asia records that are missing from tb come from the unconverted 세계사 연표 .numbers file or 미래엔 한국사 Ⅰ; they were left as is.
- Since 2026-10-10 the record tab order is 지도 → 정리 → 개요 → 자료 → 탐구 → 연결 → 연구원 기록.
- Since 2026-10-28 every record is a scanned document. 정리/개요 are shown as 요약/상세, but the data fields are unchanged (`notes`/`overview`). See [timeline-doc-mode](timeline-doc-mode.md).

**2026-10-10 additions:**
- **정리 items can nest.** An item is a string or `{ t, sub:[...] }`, and `**bold**` works inside notes. Arrange items by content (political/economic/unification sections) when the user pastes them; don't invent new ones.
- **STATE label.** The detail meta row uses `window.stateKindLabel(e)`, which gives DYNASTY/STATE/ERA/PERIOD/CIVILIZATION/RELIGION/REGION. The label is mapped from the `state` value; an optional per-node `stateKind` overrides it. Don't hard-code 왕조 for modern nodes.
- **Overview depth.** Every 개요 was enriched from textbook passages: Korea median ~490 characters, East Asia ~530, West/WestAsia ~620. Add with `s_add`/`t_add`/`l_add`. Don't use `**` in overview summaries, because the overview tab shows it literally.
- **Sub-node bodies.** Sub nodes (noSync) have no record, so `body` is their only text. Keep each body at 2–4 textbook-based sentences (~160–300 characters). The detail panel scrolls (`.detail__scroll`).
- After big data edits, rebuild the semantic search index ([timeline-semantic-search](timeline-semantic-search.md)).
- **Presidential inauguration sub nodes (2026-10-11):** `k-pres2/3/4/6/7/8/9/12`, labelled like '2대 대통령 이승만', placed by inauguration month.
  - Every president also has a sub node when a main 정부 node sits at the same time (user, 2026-10-11): 1대·5대·10대·11대·13대~20대 use the same year/month as the main node. The layout stacks the sub label above and routes its leader line around the main label. 21대 이재명 is `k-pres21` (2025.6).
- **Lecture-mode cloze:** in the 정리 tab, `**강조**` words render as `b.cloze`. In lecture mode they are blank and a click reveals them. Toggling lecture mode hides them again.
- **Modern-era images** live in `assets/w1/근현대/한국/`, which is whitelisted in .gitignore.
- **정리 item hierarchy:** headline items with details use `{t, sub}`. The screen marks them three ways:
  - ◆ thick bright bar for `li.has-sub`;
  - ▸ thin dark bar for standalone items;
  - · dashed rail for sub items.
  - Don't fake nesting with leading `  ·` text. When pasting flat notes, structure the hierarchy by content without changing the words.
- **2026-10-13 additions:**
  - `k-constitution` (제헌 헌법 공포) became a main node with a full record.
  - `w-cairo`, `w-yalta` and `w-potsdam` were added as main nodes on the west track (state 국제). Their 정리 notes come from the 8·15 광복 cell of the user's file.
  - Shared 자료 image: `assets/w1/근현대/국제/w-allied-conferences.webp`, cropped from 미래엔 세계사 4 p.194.
  - `k-founding-plan` was relabelled 「대한민국 임시 정부 건국 강령 발표」.
  - Year audit:
    - `k-dongye-sub` now sits in the 태조왕 era (yl 1세기 후반~2세기 초) per mainstream scholarship (한국민족문화대백과 「고구려」).
    - The 16–20대 president subs and government nodes got inauguration months (2/2/2/5/5).
- **Image sizing (2026-10-13):** an artifact or source can carry `span: true`. In the 자료 grid, or in an image-only 탐구 grid, it then fills both columns; use this for wide maps, mosaics and wide text panels.
  - `.sync-art--auto` images are capped at 560px high, so tall statues get letterboxed.
  - User-supplied images are upscaled with LANCZOS + unsharp mask (no AI upscaler is installed) when the long side is under 1600px, and saved as webp next to the node's asset folder.
  - When an image fits several nodes, it goes into each of them. Similar images that already exist from another textbook stay in place.
- **Medieval images** live in `assets/w1/중세/…`, which `.gitignore` whitelists via `!/assets/w1/중세/` (added 2026-10-13).
  - Since 2026-10-20 the medieval west track has nodes for these topics: 봉건제 → `w-feudal` (봉건 사회의 형성), 로마네스크·고딕 → `w-medieval-culture`, 비잔티움 → `w-byzantine` (copy also kept on 동서 교회 분열). 흑사병 images still go to 백년 전쟁.
- **Early-modern images** go in `assets/w1/근세/…` (whitelisted).
- **2026-10-14 node changes for images:**
  - Sub nodes e-sui, e-tang, e-nara and e-heian became main nodes with textbook records.
  - A new `w-renaissance` main node was added (1420, yl 14~16세기). When an image has no node to go into, a textbook topic gets a main node and record.
  - After any node change: rerun the overlap sweep and rebuild the search index.
- **2026-10-15 sub-node batch (user list, confirmed via change list):**
  - `s-ashoka` became a sub node; its record was merged into `s-magadha`.
  - `e-wang` (신) became a main node.
  - Added sub nodes:
    - 춘추 5패 at their hegemony years (e-5p-*).
    - 전국 7웅 at founding/-403 (e-7w-*).
    - Rulers 시황제, 광무제, 효문제, 문제, 양제, 쇼토쿠 태자, 당 고조/태종/고종, 고타마 싯다르타 탄생.
    - Events 진승·오광, 황건적, 고구려-수/당 (eastasia), 황소, 상좌부/대승, 카니슈카, 찬드라굽타 2세, 힌두교.
    - `*-fall` nodes from 상 to 당 and for ancient west/south Asia.
  - Ruler labels use `noMarker: true` (label only, like 고조) only when a main node sits at the same year on the same track.
  - India subs use `sub: 1` (India branch); Japan subs on eastasia also use `sub: 1`.
- **Ancient spacing:** `_yearLookup` now applies a minimum-gap correction to the ancient segment too (`SPACING_ANC` = 1.2 × average label width (1.1→1.2 on 2026-10-20 batch 5: the ancient segment is width-normalised by density, so adding nodes anywhere before 900 squeezes 북제/북주 at 550~557 again — first thing to try when an all-view ancient overlap appears), per 5-year cell; 0.8→1.0 on 2026-10-16 after the monarch batch, 1.0→1.1 on 2026-10-20 after the 남북조 dynasty subs). Dense ancient clusters no longer fall back to overlapping labels.

- **2026-10-16 monarch sub nodes (ids `k-m-*`, `e-m-*`, `s-m-*`, `w-m-*`, 137개):** the user wanted *only kings/monarchs that appear in a node's 정리(notes) tab or in the textbooks* — not names taken from 개요 text or outside knowledge (e.g. 왜 5왕 from 『송서』, 원 순제, 레오니다스 were removed). Shoguns, popes, regents, presidents are not 군주. Monarch year = reign start; founder whose main node sits at the same year gets `noMarker`. 한국사 textbook PDFs are not in the repo, so Korean kings are checked against the 정리 tab only.
- **2026-10-20:** 사마염·유유 subs removed; dynasty subs 촉 221·오 222, 남조 송 420·제 479·양 502·진(陳) 557, 북조 동위 534·서위 535·북제 550·북주 557 added (`e-shu`, `e-wu`, `e-nc-*`, `e-dongwei`, `e-xiwei`, `e-beiqi`, `e-beizhou`). 위 sub was skipped because the main node 「위(魏)」 (e-3kingdoms, 220) already exists — user chose to keep the main node as is.
- **2026-10-20 (2):** new main nodes `e-xiongnu` (흉노, -209 묵특 선우 즉위) and `w-macedonia` (마케도니아, -650 yl 7세기 BCE 무렵 — user asked for 건국 연도; textbook has none, mainstream = 페르디카스 1세 7세기). `w-greek-culture` is no longer a hidden NODE_GROUPS bracket: now a main node at -1000 with hideYear, stacked above 폴리스 성립 (west NODE_GROUPS is empty). Subs added: s-mahavira (noMarker on 자이나교), s-hegira, w-issus, w-gp-war1/2/3 (main 그리스·페르시아 전쟁 kept), w-solon -594, w-peisistratos -561, w-cleisthenes -508, w-pericles -461. Deleted 10 ancient monarch subs (메네스~솔로몬). `_yearLookup` now gives each track’s first ancient block a virtual left neighbour 100 years earlier so its cluster has half its width of room (fixed 3000 BCE west overlap after 메네스 was removed).
- **2026-10-20 (3) west ancient/medieval batch:** main `w-germanic`, `w-byzantine`, `w-frank`, `w-feudal` (481, hideYear, yl 9세기 후반 이후, stacked above 프랑크 왕국), `w-iconoclasm`, `w-norman`, `w-cluny`, `w-medieval-culture` (1100, yl 11~13세기 — user declined a bracket, wanted a plain main node), `w-roses`. Theme nodes (hidden + NODE_GROUPS.west): `w-pax-romana` (96~180) and `w-soldier-emperors` (235~284). 베르됭·카노사·아비뇽 were turned into subs on user request ("일단 서브 노드로만"); their records were folded into 프랑크 왕국 / 클뤼니 / 십자군 전쟁 and their linked refs remapped. ~30 subs (삼두 정치…에스파냐 왕국, 십자군 1~8차 `w-cr1..8`, 레콩키스타 722 yl 8~15세기). Layout rule changed: a main label stacked above a same-year **sub** keeps its year (subs never draw a year), fixing 로마 753 BCE.
- **2026-10-20 (4) 유럽 나라별 갈래:** `WEST_LANES` (index.html, next to SUB_OFFSET) — west track splits at 843 (베르됭) and merges at 1500. Lane order top→bottom: 영국(en) · 프랑스(fr) · **원줄기** · 독일(de) · 이탈리아(it) (user chose main in the middle). Nodes opt in with `lane: 'en'|'fr'|'de'|'it'`; only years 843–1499 move, and only while the west track is focused (same as other branches). Offsets ±w/±2w from `applySubScale` (w = 40~110 by box height). Lane name tags (▸ 영국 ENGLAND…) sit under each lane just right of 843 and are registered as label obstacles. 기간 노드 brackets inside 843–1500 drop below the 이탈리아 lane in west focus. Lane assignments: en 마그나카르타·와트 타일러·장미 전쟁·헨리 7세 / fr 서프랑크·프랑스 왕국·필리프 2세·필리프 4세·자크리 / de 동프랑크·독일 왕국·신성 로마 제국·하인리히 4·5세 / it 중프랑크·이탈리아 왕국. Pan-European nodes (십자군, 백년 전쟁, 교황권 등) stay on the main line.
- Same batch: main 도시의 성장과 장원의 해체(1050, yl 11~14세기), 교황권의 성장(1075, 11~13세기), 왕권 강화의 전개(1250, 13~15세기), 교황권의 쇠퇴(1300, 14~15세기); subs 유스티니아누스 황제 527, 카롤루스 마르텔 718, 카롤루스 대제 768, 동로마 제국 멸망 1453; 교회 대분열 → 기간 노드 「교회 대분열 시대」(1378~1417). 셀주크 튀르크 stays only on westasia (user).
- **2026-10-20 (5):** subs 투르·푸아티에 732, 라틴 제국 1204, 러시아 차르국 1547, 러시아 제국 1721 (west); 이슬람 세력의 인도 진출 711 yl 8세기 (India), 탈라스 751 (westasia + eastasia `e-talas`), 앙카라 1402, 셀림 1세 1512; 고려-거란 전쟁 993~1019, 전연의 맹약 1004, 정강의 변 1126~1127, 오고타이 칸 1229, 고려-몽골 전쟁 1231~1270, 몽골의 일본 원정 1274·1281 (Japan branch), 홍건적의 난 1351. Mains 서하(西夏) 1038, 촐라 왕국 870 yl 9세기 후반 (India). 기간 노드 5대 10국 시대 907~979 (`e-5dai`). 27 *-fall subs for every eastasia/westasia state lacking one, incl. 가마쿠라·무로마치·에도 막부 멸망 (user: 막부 yes, 흉노 no; eras like 5호 16국·정통 칼리프 and renamed states 몽골 제국→원, 후금→청 excluded). 종교 개혁 already existed (w-luther). 717 events.
- **2026-10-21 유럽 갈래 계속:** user asked why the west branches merge — 「각 나라의 역사 계속 가야 하는데」. `WEST_LANES.mergeYear = null` now: lanes run from 843 to the end of the track (never merge). Any period bracket on west after 843 drops below the 이탈리아 lane in west focus. Post-1500 national nodes moved onto lanes — en: 헨리 8세·엘리자베스 1세·무적함대 격파·찰스 1·2세·제임스 2세·명예혁명·메리와 윌리엄·조지 1세·산업 혁명; fr: 앙리 4세·루이 14세·루이 16세·프랑스 혁명·나폴레옹·루이 18세·샤를 10세·7월 혁명·루이 필리프·2월 혁명·나폴레옹 3세; de: 페르디난트 2세·베스트팔렌 조약·독일 제국·빌헬름 1·2세·베를린 장벽 붕괴·독일 통일; it: 르네상스·이탈리아 왕국(1861)·비토리오 에마누엘레 2세. Pan-European/other-country nodes (십자군, 백년 전쟁, 종교 개혁, 신항로, 에스파냐·러시아·미국, 세계 대전 등) stay on the main line.
- Branch line stroke is 1.5 (main trunk 2.5) for all branches (한국 삼국, 일본, 인도, 유럽) — user: 「분화되는 줄기들의 굵기를 더 얇게」.
- Same day subs: 크레시 1346 (main), 수장법 공포 1534 (en), 트리엔트 공의회 1545~1563 (main), 슈말칼덴 전쟁 1546 (de), 아우크스부르크 화의 1555 (de), 통일법 선포 1559 (en), 영국 국교회 확립 1559 (en), 위그노 전쟁 1562~1598 (fr), 30년 전쟁 1618~1648 (de). 베스트팔렌 조약 already existed as a main node (w-westphalia), moved to de.
- **2026-10-21 (2) 아메리카·러시아 갈래:** WEST_LANES now has 7 lines top→bottom: 아메리카(am) · 영국 · 프랑스 · 원줄기 · 독일 · 이탈리아 · 러시아(ru). Per-lane start years in `WEST_LANES.from` (am −3000 from 아메리카 문명, ru 1547 from 러시아 차르국; others 843). Offsets ±w/±2w/±3w; `applySubScale` sizes w so 3w up + max(3w, 2w+48) down fit the box (1280 box is 394px → w≈33; lecture 377px). Period brackets drop below the lowest lane that exists at that time (`westGroupLaneOff`; 교회 대분열 → under 이탈리아). Gotcha: a bare `return` followed by a newline before a template string returned undefined and erased every lane path — keep `return \`` on one line.
- Same batch: canossa/worms → de, avignon → fr; am lane: 아메리카 문명, 아스테카·잉카 문명(new mains 1325 yl 14세기 / 1438 yl 15세기), 아스테카·잉카 제국 멸망, 미국 혁명 (new main 1775) + subs, 아이티, 남북 전쟁, 대공황, 9·11; ru lane: 차르국, 표트르 대제, 러시아 제국, 예카테리나 2세, 니콜라이 2세, 러시아 혁명, 소련 해체, 우크라이나. Mains turned into subs (user chose): 바스쿠 다가마 인도 항로 개척, 마젤란 함대 세계 일주 성공(1522), 명예혁명, 독립 선언문 발표, 제1제정 — their records became/merged into 신항로 개척, 영국 혁명 (w-english-rev, 1642 yl 1642~1689), 미국 혁명 (w-american-rev), 나폴레옹 시대 (w-napoleonic, 1799 yl 1799~1815). 루이 14세 즉위 stays main. French Revolution subs use `month` (1789: 삼부회 5·국민 의회 6·바스티유 7). 「프랑스 제1제국」 merged into 「제1제정」 (user). 768 events.
- **2026-10-22 재정·군사 국가 / 명·청 batch:** mains → subs: 아스테카·잉카 제국 멸망 (records merged into w-aztec-civ / w-inca-civ), 베스트팔렌 조약 (record merged into 종교 개혁 w-luther), 루이 14세 즉위 → 「루이 14세」 sub (record became new main 재정·군사 국가의 성립 w-fiscal-military, 1560 yl 16세기). New west mains on the main line: 유럽 교역망의 확대 (w-trade-network 1511 yl 16세기), 17~18세기의 예술 (w-baroque-rococo 1700). New eastasia mains 명·청 시대 사회/경제/문화 (e-mq-*, 1480/1540/1590, yl 1368~1912). 낭트 칙령 폐지 → 「낭트 칙령 폐지(퐁텐블로 칙령)」. Dates not in the textbooks (mainstream): 구스타프 아돌프 1611, 요제프 2세 1765, 다카우지 1338, 요시미쓰 1368, 오닌의 난 1467, 노부나가 1568, 히데요시 1585 (관백), 금교령 1612, 이자성의 난 1630, 캬흐타 1727, 인클로저 yl 16세기. 헨리 8세·펠리페 2세 already existed. 793 events.
- **2026-10-22 (2) 근대 유럽 batch:** mains → subs: 7월 혁명·2월 혁명 (records merged into new main 프랑스의 자유주의 운동 w-fr-liberal, fr 1830 yl 1830~1871), 남북 전쟁 (→ 미국의 발전 w-us-dev, am 1803 yl 19세기), 아이티 독립 (→ merged into 빈 체제 record). 빈 회의 renamed 「빈 체제」 (w-vienna, 1815 yl 1815~1848). 산업 혁명 → 「제1차 산업 혁명」 (w-industrial, en) + new 제2차 산업 혁명 (w-industrial2, main line 1870 yl 19세기 후반). Other new mains: 과학 혁명 (1543 yl 16~17세기), 계몽 사상 (1750 yl 18세기), 영국의 자유주의 개혁 (en 1828), 독일의 통일 (de 1834~1871), 이탈리아의 통일 (it 1831~1870), 러시아의 발전 (ru 1825), 사회주의 (1848), 제국주의 (1880). 레판토 해전 + 빈 포위 공격(1529) also on 서아시아 track (s-lepanto, s-vienna-siege) since the user listed them with Ottoman context. 프로이센 왕국 already existed. Mainstream dates: 사르데냐 왕국 1720, 부르셴샤프트 1815, 브나로드 yl 1870년대, 7년 전쟁 1756~1763. 844 events.
- **2026-10-22 (3) 아시아 근대 batch:** existing mains turned into subs with records merged (user listed them as subs): 난징 조약 → 제1차 아편 전쟁 (e-opium renamed, yl 1840~1842); 무술변법 → new main 변법자강 운동 (e-bianfa); 신축조약 → 의화단 운동 (e-boxer); 청·일 전쟁 → 일본의 대외 팽창 (e-jp-expansion, Japan lane); 미·일 화친 조약 → 일본의 개항 (e-japan-open); 일본 제국 헌법 공포 → 자유 민권 운동 (e-jiyu-minken); 플라시 전투·인도 제국 → 인도의 민족 운동 (s-india-nat); 벵골 분할령 → 인도 국민 회의 record; 중화인민공화국 → 국공 내전 record; 튀르키예 공화국 → 오스만 제국의 민족 운동 (s-ottoman-nat). Other new mains: 중국의 개항, 제2차 아편 전쟁, 신문화 운동, 동남아시아의 민족 운동 (eastasia track), 와하브 운동, 이집트의 근대화 운동, 아프리카의 민족 운동 (westasia track — Africa has no track), 브라흐마 사마지 운동, 이란의 민족 운동. Already-existing mains kept their labels: 세포이의 항쟁, 청년 튀르크당 혁명, 이란 입헌 혁명. Broken links to deleted ancient nodes removed (script now strips any linked id that no longer exists). Overlap-check gotcha: `__attach` matched a label to the first node with the same title, so two nodes named 「러·일 전쟁 · 1904」 (korea + eastasia) gave a false 'unlinked'; the stored helper in localStorage now picks the nearest same-title node. 899 events.
- **2026-10-23 세계 대전·러시아 혁명 batch:** 제1차 세계 대전(w-ww1, 1914~1918)·제2차 세계 대전(w-ww2, 1939~1945)·러시아 혁명(w-russia, 1917~1922) are now 기간 노드 — the old main events were turned into hidden period targets (ids/records/links kept), and new subs 「제1차 세계 대전 발발」(w-ww1-start)·「제2차 세계 대전 발발」(w-ww2-start) mark the start (user: 「기존 메인 노드는 서브노드로 전환하고 발발을 넣을 것」). 파리 강화 회의 → sub, record merged into w-ww1. New mains on ru lane: 러시아력 2월 혁명, 러시아력 10월 혁명, 블라디미르 레닌 (1917), 이오시프 스탈린 (1924). Code: NODE_GROUPS entries accept `row: 1` (GROUP_ROW_H 24px lower) for overlapping periods (러시아 혁명 under 제1차 세계 대전); applySubScale now bounds the west lane unit w per bracket (it/ru lane + row); bracket lines are label obstacles too (groupRects returns label + line rect). Known/accepted: in the all-tracks view upper-track bracket lines (삼국 시대, 무단 통치 …) can pass through tall base-position labels of the next track — pre-existing. User typo 「프랑수국 비시 정권」 → 「프랑스국 비시 정권」; 「프랑스 군정청」 = German Militärverwaltung in Frankreich (1940~1944). 945 events.
- **2026-10-26 전간기 batch:** 제1차 국공 합작(record → new main 중국의 민족 운동 e-china-nat, 1927 yl 1919~1937, also absorbs 중일 전쟁 record), 중일 전쟁, 만주 사변(record → new main 전체주의의 등장 w-totalitarian, main line 1925 yl 1920~1930년대) turned into subs. New mains: 베트남의 민족 운동 (e-vietnam-nat 1925), 영국 치하 인도의 민족 운동 (s-india-nat2, India lane, yl 1919~1947 but placed at **1924** — in the all-tracks view a two-line main label on the track below crosses an upper track's bracket line (+34px), so westasia mains must avoid west bracket spans 1914~1922 / 1939~1945; korea brackets cover 1910~1945 so eastasia mains there always cross — accepted). 아프리카의 민족 운동·대공황 already existed (마지마지·줄루 전쟁 added to the africa record). Row brackets (`row: 1`) now drop only in their own track's focus (`groupYOf` checks focusedTrack); in the all-tracks view they stay on row 0 and use labelAtYear (러시아 혁명 1920.5). Spelling: 밸푸어 선언 (textbook), user wrote 벨푸어. 978 events. Scratchpad gets wiped between days: tb dumps are now named by textbook (3-4, 4-1, 4-2, m3, m4 .txt) and recv_server.py had to be rewritten (stdlib http.server, CORS, exits after one POST).
- **2026-10-26 (2) 제2차 세계 대전 batch:** 카이로·얄타·포츠담 회담, 국제 연합 창설(→ 「국제 연합」), 아시아·태평양 전쟁(→ 「태평양 전쟁」, yl 1941~1945), 샌프란시스코 강화 조약(→ 「샌프란시스코 강화 회의」) turned into subs; all six records merged into the 제2차 세계 대전 period record (w-ww2: 태평양 전쟁·전후 처리 회담·UN·전범 재판·강화 조약 paragraphs, timeline rebuilt, Korea-side links now point to w-ww2). 23 new subs (west lanes: 폴란드 침공/드레스덴/독일 항복/뉘른베르크 de, 영국 공습 en, 노르망디/파리 해방 fr, 이탈리아 항복 it, 소련 진격/스탈린그라드/소련 참전 ru, 샌프란시스코 회의 am; Japan lane: 진주만·미드웨이·도쿄 대공습·원폭 2·일본 항복·극동 군사 재판). User typo 「포트담」 = existing 포츠담 회담; 「독일 항복」 listed twice. 1001 events.
- **2026-10-26 (3) 냉전·현대 batch:** existing mains → subs: 쿠바 미사일 위기 (record → 냉전 w-coldwar), 소련 해체·베를린 장벽 붕괴·유럽 연합·9·11 테러 (→ new main 세계 질서의 재편 w-world-order, main line 1990 yl 1989 이후), 문화대혁명·톈안먼 사건 (→ new main 중국의 변화 e-china-change, 1960 yl 1949 이후); e-prc relabelled 「중화 인민 공화국」. 72 new subs (냉전 기구, 데탕트, 동유럽 민주화, 유럽 통합, 국제 경제 기구, 지역 협력체, 분쟁, 환경 협약, 감염병 등). 동남아시아의 민족 운동·중국의 민족 운동·아프리카의 민족 운동 were requested again as mains but already exist (e-sea-nat 1904, e-china-nat 1927, s-africa-nat 1896) — not duplicated; user asked 아프리카 twice now, so check whether they want a post-1945 decolonization main instead. 「전략 무기 제한 협정」 treated as the same item as 제1차 SALT (textbook: SALT 1972·1979). 1071 events. Session restarts wipe the scratchpad (scripts, tb dumps, recv_server.py).
- **2026-10-26 (4) 전체 보강 pass (user: 메인 개요·서브 RECORD 보강 + 이미지 검토, 단계별 올리기):** 이미지 점검 → 서브 본문(트랙별 커밋) → 메인 개요 순서로 진행. Sources: textbooks (비상·미래엔 세계사/동아시아 역사 기행/역사로 탐구하는 현대 세계) + iCloud 「세계사 연표(수능특강+천재교육)」 PDF/Numbers for world tracks, 「수능 한국사 연표 정리」 for korea (no Korean-history textbook PDFs exist). "Thin" main = summary < 300자 or terms < 3 or timeline < 3 (57 nodes, docMode nodes skipped because of {{원본|왜곡}} markers); sub bodies under ~100자 rewritten to 2~4 sentences of cause → event → result. The app already marks the record's own year in the inline timeline, so a '◆ ' label prefix goes on one key item only.
- **2026-10-28 미래엔 한국사 이미지 batch:** the source folder is iCloud `…/교과서/2015 한국사 미래엔/이미지/1~4`. Filenames are `[교과서이미지] 한국사_P<page>_<caption>.jpg` in NFD, so normalize to NFC before parsing.
  - This is the same textbook the K1/K4 placeholder refs cite.
  - 640 of the 724 images went into 135 main nodes, at `assets/w1/<era>/한국/미래엔/P###-<caption>.webp`. Era by page: <36 고대, <54 중세, <85 근세, else 근현대.
  - Images under 1600px were upscaled to 2000; images over 2400 were reduced to 2400.
  - Charts and statistics went to 탐구 as `kind '탐구 자료'`.
  - Skipped:
    - Duplicates of images already present.
    - Chapter-summary infographics (P80, P150, P226, P308) and timelines (P90, P109).
    - WWI (P156; there is no WWI main node).
    - Abe and Japan's pacifist constitution, Yasukuni, the territorial-dispute map, the Kim Il-sung statue, the blank brain template, 쓰개, and a few undated trilateral (Korea·China·Japan) items.
- **Image placement rules (user, 2026-10-28):**
  - Every image goes into each fitting main node **and** each fitting 기간 노드. Period nodes are hidden nodes that have records: k-era-samguk/mudan/munhwa/malsal/econ12/econ34, w-ww1, w-ww2, w-russia, w-pax-romana, w-soldier-emperors, w-great-schism, e-chunqiu-zhanguo, e-wei-jin-nbc, e-5dai, s-persia-culture.
  - **No duplicate images inside a node.** Before adding, skip any image whose dHash is within 30 of an image already in that node, and skip same-subject repeats.
  - Existing duplicates were removed (12 on 2026-10-28). Their files were moved to `_removed/`, which is excluded from git.
  - Helpers live in the (old session scratchpad, gone) `lib/tl.py` (put / remove_src / entries) and `lib/phash.py`. The scratchpad may be wiped.
- **1920s urban culture and 신여성 photos** were removed from 물산 장려 운동 and 근우회 on the user's request. They now sit in the k-era-munhwa period node.
- **2026-10-28 천재교육 세계사 batch:**
  - Source: iCloud `…/교과서/세계사 천재교육/I~VI/이미지`. The textbook PDFs are in the same folder.
  - 394 of 953 images went in, as `assets/w1/<era>/세계/천재/<unit>-<caption>-<i>.webp`.
  - Skipped: subject duplicates (about 45 are the same textbook images already in place), food photos, modern culture/environment (6-3, 6-4), and cartoon/blank-map/math cuts.
  - Southeast Asian Hindu-Buddhist sites went to s-gupta, because there is no SE Asia node.
- **2026-10-28 batch 3:**
  - Sources:
    - iCloud `교과서/한국사 천재교육/대단원1/이미지`, filenames `NN쪽 <caption>.jpg` in Ⅰ-n subfolders.
    - `시간선관리국/세계사/대단원1~4 이미지`: 미래엔 세계사, `미래엔_세계사_이미지_NN쪽_<caption>`. Many of these are already in the app.
  - Saved to `assets/w1/<era>/한국/천재/` and `…/세계/미래엔/`.
  - Originals over 2400px are capped at 2400 after conversion; some are 7000px+.
  - **Also check for src-less placeholders that a new image duplicates.** Fill or delete them instead of leaving both. 16 were removed in this batch (w-ww1, w-russia, w-french-rev, e-meiji …).

**요약 탭 반영 (2026-10-29, commit 0c75f12):** the user asked to put the content of the images placed in each main node into that node's 요약 tab (`notes.sections`), together with 2027 EBS 수능특강 세계사 screenshots used as the reference for terms.
- The rule: keep the existing content, append items to the matching section (`{t, sub}` style), add a section only where nothing fits, and update terms. Fill empty 요약 from the same record's 상세 (overview) text and the images.
- 166 main nodes were changed. Scratchpad `sum/apply.py` holds the ops `'+'` (append to the section whose head contains a string; `''` = the first section without a head), `'new'` and `'r'`; the per-track op files are `w/s/e/k1/k2.py`.
- Fixes made along the way:
  - 쿠빌라이 칸 1260~1294; 수 양제 604~618.
  - The 독일 통일 node wrongly cited 마치니; changed to 3월 혁명.
  - Terms: Pax Romana → 로마의 평화(팍스 로마나); 사산 조/아케메네스 조 → 왕조; BC → BCE; 난학(란가쿠); 애덤 스미스.
- The notes are not part of the semantic search index, so no index rebuild is needed.
- **2nd pass, 2026-10-29 (commit after 0c75f12):**
  - The user clarified that "정리본과 합치" means image and EBS content belongs *inside* their 정리본 structure, under the related item, not appended at the end. It also applies to 기간 nodes.
  - Tool: (old session scratchpad, gone) `sum/ed.py` loads notes as JSON and offers `after`/`before`/`subadd`/`move`/`rep`/`newsec`, then reserializes only the changed nodes. `pass2.py` holds the edits.
  - **The renderer supports only 2 levels.** Items in `sub` must be strings; `flat2` flattens deeper nesting.
  - EBS 08–12 fixes: 덩샤오핑; 헌법 제정(탄지마트·이란); GATT 1947; IMF; 이탈리아의 소말리아·리비아; 링컨 당선 1860; 디오클레티아누스 284~305; 초기 사회주의(생시몽·푸리에·오언).
- **3rd pass, 2026-10-29 — user rule: NEVER remove 정리본 content.** "내가 만든 정리본의 내용을 빼면 안된다 … 현재 내용에 보강하고 잘 정리".
  - Only add: put new items next to or below the related item, or append to the end of an original sentence (helper `app()` in `sum/pass3.py`). Do not reword the user's sentences.
  - Exceptions allowed: typo, year and term fixes.
  - Audit: every original string from commit 16cd53e must still appear in the same node. 44 differ only by those fixes or by inline insertions.
  - EBS 한국사 01–08 was merged into 45 Korean nodes, e.g. a new 조선 「중앙 정치 조직」 section and 갑오·을미개혁 의의와 한계.
  - No source labels such as "(EBS)" in on-screen text.
  - 4th pass (2026-10-29): EBS 한국사 08–15 → 63 Korean nodes (`sum/pass4.py`); 베트남 파병 1964~1973.
