# timeline-labels-always-visible

> timeline-app 노드 이름은 항상 전부 보여야 한다 — 겹침 해결을 "숨기고 호버 시 표시"로 하면 안 된다

Timeline node labels must always be visible. Resolving overlaps by hiding a label and revealing it on hover or selection (the old `is-crowded` approach) was rejected.

**Why:** The app is projected in class, so students have to be able to read every node name without anyone hovering over it.

**How to apply:** When labels collide, keep all of them readable. Use rearrangement such as stacking, horizontal displacement or leader lines, or other layout changes. Never use opacity 0 or hover-only reveal.

**Leader rule (user, 2026-10-08):** labels stay as close to their marker as possible. Any label that is not sitting directly above its marker must be linked by a line. The `positioned` layout in index.html has three link modes:
- **band:** a horizontal channel 10/13.5px above the line, then up.
- **trunk:** used when the same track has 3 or more nodes in the same year. A vertical trunk rises from the marker with branches to labels on either side. Labels after the first in that year drop their year badge.
- **elbow:** a channel, then a column in a nearby gap, then a branch. It is the last resort.

If a placement fails, the nodes that failed are placed first and the layout is retried.

**Spacing:** the year scale (`_yearLookup`) enforces `SPACING_K`: neighbouring nodes in a track are at least 1.1 × the average of their label widths apart, and same-year nodes count as one block. This is so labels still fit in one row when another track is focused.

**2026-11-06 지부 선택 시 빈 구간 조정.** 네 지부 전체 보기에서는 공통 연도 축을 쓰고, 지부를 선택하면 해당 줄기의 긴 공백을 줄인다. 노드·주요 눈금·기간 괄호·갈래 기준점을 잇는 구간은 기본 배율에서 480px를 기준으로 조정한다. 같은 자리에 있는 이름표 묶음은 60% 배율에서 필요한 여유까지 확보한다.

줄기의 전체 노드로 축을 계산하므로 검색어를 입력해도 간격은 유지된다. 노드·눈금·괄호·갈래와 화면의 연대 표시는 같은 축을 사용한다. 지부를 바꿀 때는 화면 중앙의 연대를 유지하고, 새 노드로 이동할 때는 선택한 노드를 우선한다.

**Verification:** use the sweep that checks overlaps, clipping and unlinked labels.
- Run each sweep in the background and poll it; the JS tool times out after 45s.

**Tight height (fixed 2026-10-08):** when focusing a track leaves too little height for 4 lanes (1280×800, lecture mode), TimelineCanvas adds `html.tl-tight`.
- Normal mode collapses the subnav to only the 관내 방송 strip. Lecture mode hides the subnav entirely.
- It applies only when the needed height (`needMin`, lanes at the minimum gap) exceeds the uncollapsed height + 24px. The collapsed gain is subtracted to avoid flip-flopping.
- With no track focused, 1280×800 stays expanded.

**Performance:** the placement search filters obstacles locally with `around(lo, hi)` and tries the elbow only when band and trunk both fail. An unfiltered version froze the tab on resize.

Related: [timeline-node-terminology](timeline-node-terminology.md) [timeline-ui-conventions](timeline-ui-conventions.md)

**2026-10-09 lane layout (user request):**
- Focusing a track now draws **only that track**: `layoutLanes` returns `[focusedTrack]` and `events` filters out other tracks. The old red glitch on other tracks is gone.
  - The focused line is centred, counting its sub lanes plus, for Korea, the lowered 삼국 시대 bracket.
  - You switch tracks from the 지역국 panel, or by clicking the focused sticky label to unfocus.
- Unfocused, the 4 lanes get head = gap − 24, with a minimum of 108; the 1920s Korea cluster needs about 103. The bottom pad is 66.
  - Before, head was always 128 and the bottom pad 50, which pushed 서아시아·인도 against the bottom edge.
  - Results: 1500×900 at 108/215/323/430; 1280×800 at 108…348 (gap 80).
- 0 overlaps, clips and unlinked labels in all of these:
  - 1280 and 1920, each with no focus and all 4 focuses
  - 1500 with no focus
  - lecture mode at 1920
  - 1440×665
