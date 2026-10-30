# timeline-history-data-rules

> timeline-app 역사 데이터 규칙 — 연도·내용은 교과서 파일 기준, 교과서에 없으면 한국 사학계 주류 검색, BCE/CE 표기(BC·AD·NC 금지), 화면 출처 표기 안 함, yearLabel/yl

User rules for timeline-app history data, set 2026-09-29 during DENDRO P0:

1. **All years and content follow the textbook files added to the project.**
   - World and East Asia: `assets/w1/교과서` (미래엔 세계사 1, 비상 세계사, and the 동아시아 역사 기행 texts).
   - Korea: 동아출판 22개정 한국사1/2 in ~/Downloads.
   - Never guess. Remove years the textbooks don't support, and replace conflicting ones with the textbook value, even when a more precise real date exists. Example: the textbook's 기원전 1500년경 Babylon conquest beats the precise 1595.
2. **If the textbook has no year, search and use the mainstream view of Korean historiography (한국 사학계 주류).** The user set this on 2026-09-29.
   - Korean history: 한국민족문화대백과사전 (encykorea.aks.ac.kr) and 국사편찬위원회 우리역사넷 (contents.history.go.kr).
     - 부여: 2세기 BCE경.
     - 옥저·동예: 2세기 BCE경. 신편한국사 says 임둔 was absorbed into 위만조선 in the early 2nd century BCE.
     - 삼한: 2세기 BCE 말.
   - Where scholarly dates disagree (e.g. 카니슈카's reign), show only the textbook's century and no exact years.
3. **Negative years show as BCE, positive years as CE** in every UI string.
   - Use `window.fmtYear` / `eventYearText` / `tlYearText`. Never print a signed number like `-3100 CE`.
   - No `BC.`/`AD`/`6C` in data text. Write `BCE 27`, `CE 14`, `6세기`.
   - A CE century label still carries CE (e.g. '4세기 CE경').
4. **Content audits must not modify the 정리 tab (`notes`).** The user set this on 2026-09-29. Edit only the other fields: body, overview, map, sources, artifacts, inquiry, and lumina.
   - Year fixes already made in notes stay, because they are textbook-based.
   - Standard terms follow the textbook:
     - 올멕 (not 올메카), 아소카왕, 윈강, 조몬, 크리스트교, 비잔티움, 9품중정제(구품관인법), 일리아스, 아피우스 가도, 반량전, 브라만.
5. **No sources are shown on screen.** Don't add textbook names or page refs to UI text; FILE_REF data may stay in the data.

6. **Structure rule for the 동아시아 and 서아시아·인도 tracks (user, 2026-10-02):**
   - In 중세 and 근세 (before 1637), create nodes only for 국가·왕조. Japan gets its 막부 nodes, and 센고쿠 시대 is a main node.
   - Events from those eras go into the body of their state's node, not into separate nodes.
   - From 근대 태동기 (1637) to 현대, events are separate nodes.
   - 유럽·미주 has event nodes in every era.
   - 104 nodes were added that day: eastasia 40, west 42, westasia 22. Main nodes have no DB, so they show 「편입 대기」.
   - Ids must not collide with existing ones: `e-jin` is already 서진, so 금 is `e-jin-jurchen`. Check uniqueness against the whole events list.

7. **Korea track structure (user, 2026-10-04/06):**
   - Before 1850, nodes are only 국가 (고조선 … 고려 [label 고려] · 조선 [label 조선]). The 선사 era nodes stay.
   - Events go into the state's body ("주요 사건: …") and into the record's overview timeline.
   - 1850~1948: event nodes. These are main: 흥선 대원군 집권, 임술 농민 봉기, 신미양요, 임오군란, 갑신정변, 갑오개혁, 동학 농민 운동, 아관 파천, 을사늑약, 국채 보상 운동, 신간회 결성, 광주 학생 항일 운동. The rest stay sub nodes.
   - After 대한민국 정부 수립 (`k-rok` kept), there are president-era main nodes `k-gov-*`: 이승만, 장면 내각, 박정희 (1963), 최규하, 전두환, 노태우, 김영삼, 김대중, 노무현, 이명박, 박근혜, 문재인, 윤석열 (2022).
   - Coverage stops at the textbook's 윤석열 취임 (user chose this). Events go into each government node. 5·18 goes into 전두환 정부 (user chose this).
   - 조선 now carries the merged 식민 사관 risk (from the 대동법 and 숙종 nodes) and the merged 임진왜란 and 훈민정음 records.
8. **Korea 일제 강점기 (user, 2026-10-08):**
   - Three 시대 묶음 (NODE_GROUPS korea, like 위·진·남북조): 무단 통치 1910~1919, ‘문화 정치’ 1920~1929, 민족 말살 정책 1930~1945.
     - The user said 문화 통치 / 민족 말살 통치, but agreed to the textbook terms (동아 교사용 notes that '문화 통치' became ‘문화 정치’ in the curriculum).
     - Each bracket opens a hidden node with a record: `k-era-mudan`, `k-era-munhwa`, `k-era-malsal`.
   - Main node `k-provisional` 대한민국 임시 정부 (1919).
   - Every 1910~1945 event that has a textbook explanation is a main node with a record (35 new ones, e.g. 회사령, 토지 조사 사업, 산미 증식 계획, 국민 대표 회의, 암태도 소작 쟁의, 관동 대학살, 조선어 학회 사건).
   - 국가 총동원법 and 한국광복군 창설 became main nodes.
   - The old sub node ‘문화 정치’·산미 증식 계획 (`k-munhwa`) was removed; its risk moved to `k-sanmi`.
   - The Kanto node label is 「관동 대지진」 (user's choice, 2026-10-08).

9. **Korea 삼국 시대 (user, 2026-10-09):**
   - The 4 갈래 now start at the 신라 node (BRANCH_YEAR −57). 고구려 −37, 백제 −18 and 가야 42 sit on their lanes. The hourglass and lane captions were removed.
   - 25 **focusOnly** main nodes (`focusOnly: true`) show only when the Korea track is focused. They have records. Kings are placed at the start of their reign, with yearLabel showing the reign (e.g. '391~412 CE') taken from the textbook appendix 왕 계보표.
     - 고구려 lane (sub 0): 태조왕 … 장수왕, 고구려-수 전쟁 598~614, 고구려-당 전쟁 645, 고구려 멸망 668.
     - 백제 lane (sub 1): 고이왕 … 성왕, 백제 멸망 660.
     - 신라, main line: 내물왕, 지증왕, 법흥왕, 진흥왕, 나당 전쟁 670~676.
     - 가야 lane (sub 3): 전기 가야 연맹 '2~4세기 CE', 후기 가야 연맹 '5세기 후반 CE'.
   - New sub nodes (always visible): 위만 집권 ('2세기 BCE 무렵') and 고조선 멸망 (−108).
   - A NODE_GROUPS bracket 'kr-samguk' 삼국 시대 runs −57~675 and opens hidden node `k-era-samguk`. Under Korea focus it is drawn below the 가야 lane (`groupYOf`).
   - Labels follow the textbook, as the user chose: 위만 집권 (not 위만 조선), 내물왕 (not 내물마립간), 나당 전쟁, 광개토 대왕.
   - Non-textbook facts taken from encykorea / 우리역사넷: 미천왕's 낙랑 축출 313, 고구려-수 전쟁 598~614, 문주왕's 웅진 천도, the 가야 연맹 periods.
   - 2026-10-10: two 가야 lane sub nodes were added (noSync, sub 3, focusOnly): 금관가야 병합 532 and 대가야 정복 562. The user cancelled separate 금관가야/대가야 nodes and a 가야 멸망 node.
   - Sub-lane spacing scales with box height (`applySubScale`): Korea u 40~110, Japan/India 70~150.
   - focusOnly nodes are included in the ancient density scale; without them the 475~523 cluster overlapped.

10. **Korea 고려·조선 (user, 2026-10-10):**
    - Main nodes are focusOnly (Korea focus only), as the user chose. Kings use the reign from the textbook appendix as yearLabel.
      - 고려 (12): 태조 918~943, 광종, 성종, 고려-거란 전쟁 993~1019, 여진의 침략 '12세기', 이자겸의 난, 묘청의 서경 천도 운동, 무신 정변, 고려-몽골 전쟁 1231~1270, 원 간섭기 1270~1356, 공민왕, 고려의 쇠퇴 '14세기 후반'. Ids are `k-gr-*`.
      - 조선 (20): 태조 … 성종, 훈구와 사림의 대립 '15세기 후반', 4 사화, 임진왜란, 정유재란, 광해군, 정묘·병자호란, 예송 '1659·1674', 환국 '1674~1720', 영조, 정조, 세도 정치 시기 1800~1863. Ids are `k-js-*`.
      - 갑자사화, 을사사화 and the 예송 years are not in the textbook; they come from encykorea.
    - Sub nodes, always visible: 옥저 멸망 '1세기 후반' (textbook), 동예 복속 '2세기 후반' (the user chose the 복속 label), 부여 멸망 494 (encykorea), 발해 멸망 926, 신라 멸망 935, 고려 멸망 1392.
    - 고구려 멸망 and 백제 멸망 became sub nodes (noSync, focusOnly, on their lanes). Their records were deleted and removed from linked lists.
    - The 조선 record still holds the merged 임진왜란/훈민정음 content and the 식민 사관 risk; this was left as is.
    - Clicking a group bracket label again now closes the detail panel. Node markers and labels already toggled.
    - Gotcha: the Python preview server lets the browser cache index.html. Before testing, run `fetch('/', {cache:'reload'})` and then reload; otherwise you test stale code.

Implementation notes:
- Nodes whose `year` is only a placement value carry `yearLabel` (e.g. '약 70만 년 전 ~', '2세기 BCE경', '220~589 CE'). The UI shows the label, and `year` only sets the X position.
- Overview timeline entries may use `yl` (a display string) instead of `y`.
- Call numbers use `eventYearCode`:
  - PH for prehistory; B3000 / B20C for BCE years and centuries.
  - C4C for a CE century; 0698 for a CE year.
- A full audit is done as of 2026-09-29:
  - All 164 node display years.
  - Body years in all 75 DB records (939 mentions).
  - Also fixed: 인더스 쇠퇴 1800경, 아리아인 철제 농기구 at 1000경, 시황제 221, 디오클레티아누스 284~305, 헤브라이 분열 930.
  - Non-year content claims are not yet fully audited.

**Why:** the app is used for teaching, and historical accuracy is the top priority (DENDRO_fix_instructions.md §0).

**How to apply:**
- Before editing data, show a change list and get confirmation. The user has pre-approved the search rule above, so it doesn't need re-asking.
- Check years against the actual PDF pages.
- Edit both index.html and timeline-content.js (syntax-check the .js with macOS `jsc`).

Related: [timeline-textbook-sources](timeline-textbook-sources.md) [timeline-node-terminology](timeline-node-terminology.md)

11. **Korea 광복~6·25 (user, 2026-10-10):**
    - New main nodes, always visible: 조선 건국 준비 위원회, 모스크바 3국 외상 회의, 제1·2차 미·소 공동 위원회, 좌우 합작 운동, 유엔 총회, 유엔 소총회, 제주 4·3 사건, 남북 협상, 5·10 총선거, 여수·순천 10·19 사건, 6·25 전쟁 (`k-625`, map copied from 이승만 정부).
    - Sub nodes: 이승만의 정읍 발언, 김구의 삼천만 동포에게 읍고함, 제헌 헌법 공포. 대한민국 정부 수립 already existed as `k-rok`.
    - 모스크바·미소공위 1·2·유엔 총회·소총회 are also on the 유럽·미주 track (`w-moscow`, `w-jointcomm1/2`, `w-un-ga`, `w-un-little`) with a duplicate record.
    - The user wrote "UN 총회", "6.25", "5.10"; labels use the textbook forms 유엔, 6·25, 5·10.
    - **`month` field:** `posYear(e)` spreads same-year nodes by month inside the year (x position, cluster key, min-spacing in `_yearLookup`). The displayed year stays the integer `year`. Without it, 9 nodes at 1948 stacked and clipped.

12. **Korea 현대 sub nodes (user, 2026-10-10):**
    - 42 noSync subs, always visible, each with a `month`:
      - 제1~9차 개헌; 민주화 사건 (3·15 … 6·29 선언); 남북 관계 (7·4 … 6·15); 경제 (새마을, 경부 고속 도로, 전태일, 석유 파동 1·2, 우루과이 라운드 타결 1993, 외환 위기 1997.12).
    - Labels use the textbook forms: 12·12 군사 반란, 부·마 민주 항쟁, 한·일 협정, YH 사건, 6·29 선언, 경부 고속 도로, 남북한 유엔 동시 가입.
    - Group brackets `kr-econ12` (1962~1971) and `kr-econ34` (1972~1981) open the hidden records `k-era-econ12` and `k-era-econ34`.
    - `_yearLookup` min-spacing now works on month cells (`incM`/`cumM`). Year cells over-stretched the axis: 현대 had grown to 32k px; it is now about 12k px.
- The era menu shows `sub` (고려, 조선 전기 …) only when a track is focused.
