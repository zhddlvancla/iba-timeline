# timeline-ui-conventions

> timeline-app 공통 동작 규칙 — ESC는 맨 위 창 하나만 닫기(useEscLayer), 배경음악+앰비언트 자동 재생·음량은 REBOOT 아래, 1280·1500·1920 폭에서 글자 잘림/겹침 0

Rules the user set on 2026-09-23 for `ui_kits/timeline-app/index.html`:

- **ESC closes only the topmost window.** The user complained that ESC closed everything at once. Every modal or popup must register through `window.useEscLayer(active, close)`, which is a global stack captured on window and registered before React. Do not add raw `keydown` Escape listeners.
- **Background music and ambient sound both autoplay** when the 기록줄기 (timeline) screen starts (TopBar mount; changed 2026-09-24). A channel the user turns off is saved as `iba.aud.musOn/ambOn=false` in sessionStorage and does not autoplay again that session.
- **Sound stops only when the page closes.** On `pagehide`/`beforeunload` the AudioContext is suspended. This follows the user's 2026-09-27 rule: sound must stop when Claude or the site is closed.
- **Sound keeps playing across screens and tabs** (user 2026-10-08). REBOOT → portal no longer calls `stopAll`. Switching browser tabs or minimizing does not suspend audio. Re-entering the timeline does not restart music (TopBar checks `state().music`).
  - Music is scheduled 15s ahead with a 1s poll, so throttled background timers don't cut it. After a long stall it skips ahead rather than bursting.
  - `track()` keeps up to 2400 nodes, so `stopMus` can still stop pre-scheduled notes.
  - Lecture mode stops music on entry and restores it on exit (2026-10-10).
- The canvas-header era chip shows **only the era name** (고대/중세/근세/근대 태동기/근대/현대), not the 한국사 sub-label.
- The volume control sits **under the REBOOT button** at the top-right of the topbar (`.topbar__ctl`), not in the brand box.
- **No overlapping or broken text in either mode (연구원 / 대응반).** Verify at 1280×800, 1500×960 and 1920×1080. A `@media (max-width:1400px)` block tightens spacing and hides the operator face column. Switching modes must not change any box width.

- **Font floor (DENDRO P1-2, 2026-09-29):**
  - All text is at least 12px. Record body text is at least 16px. Node labels are 16px; sub-node labels are 14px.
  - When raising sizes, also update the label-layout estimates in the canvas code: `estWidth`/`estHeight` fs, `tickRects` char widths, `TICK_LABEL_BOTTOM`, and the group label `textW(…, 12)`.
- **Lecture mode (DENDRO P1-1):**
  - The `L` key (`e.code === 'KeyL'`) toggles `<html class="lecture">`, persisted in sessionStorage `iba.lecture`. It is ignored while typing.
  - It uses `zoom:1.4`. Every vw/vh size needs a `calc(… / var(--lz))` override.
  - Scanlines, vignette, glow and shadows are off. Greens are brighter.
  - Music and ambient stop via `stopAll` on entry. **On exit they come back** (user 2026-10-10, overriding P4-2): TopBar `onLecture(false)` restarts each channel unless the user had turned it off (`load('musOn'/'ambOn', true)`). The VESTIGIA V-BC broadcast cycle also pauses. Sound effects stay.
  - The seal is locked and a `강의 모드 · L` badge is shown.
  - Screens under 1800px also hide the operator HUD, brand text, BUREAU/CASE cells and footer hint.
  - Verify with getBoundingClientRect, not screenshots: the pane's device emulation paints root `zoom` wrongly.

**Why:** the app is projected in class, and projectors or laptops are often 1280 wide.

**How to apply:** after UI changes, sweep for text wraps, clipping and overlaps at those three widths in both modes.
- Use the DOM audit from 2026-10-09. It checks:
  - text wider than its box (scrollWidth > clientWidth, or the text range exceeds the element);
  - non-inline siblings overlapping;
  - ellipsis truncation.
- Run it on: base, audio panel, detail panel, every record tab, D2 doc tabs 00–12 and search, in both modes. Also run it on the pre-timeline screens.
- Fixes so far:
  - `.op-mrow .k` is a min-width, not a fixed width (the 노출 EXPOSED/탐지 DETECT overflow).
  - The side-meta title uses less letter-spacing at ≤1400px (대응반 상황실).
  - `.d2-redact`/`.rec-redact` use `word-break:break-all`, because long █ runs don't wrap under keep-all.

Related: [timeline-labels-always-visible](timeline-labels-always-visible.md)

**2026-10-09 additions (user requests):**
- **First notice:** `<Notice>` (view `'notice'`, sessionStorage `iba.notice`) appears once per tab before the portal. It is out-of-world text: an educational site built on a fictional setting, with IBA, codes and broadcasts invented and history real. REBOOT does not show it again.
  - The user asked for no box and no button: only centred text that fades in over 1.2 s, holds until about 6.2 s, then fades out over 1.1 s into the portal. A click or key starts the fade-out.
- **Portal 「단순 열람」:** a small link under 인증 enters with no code via `window.setGuestAgent()`. 접속자 데이터 then shows 등록 코드 「미등재 · 단순 열람」, 직급 열람자 and 명부 미등재.
- **Detail panel:** the big slot shows the node name (`.detail__year--name`, 40px, 32px when the name is over 9 characters). The 26px slot shows the year text, and its sub-line reads COMMON ERA · era.
- **Systab labels:** `[RS] RESEARCH` / `[DA-R] RESPONSE` (they were TEMPORAL/[T]). These aren't keyboard shortcuts.
- **Record tabs:** `.sync-tabs` is a container (`container-type`).
  - Labels never wrap.
  - Below 1160px the `FILE_REF` word is hidden; below 1090px (lecture mode at 1280) the English labels are hidden.
- **Mobile:** the meta viewport is `width=1440`, so phones and iPads lay out at 1440 wide and scale down. Phone landscape is about 0.5 scale: tiny but intact, with 0 label overlaps at 1440×665.
  - Timeline drag uses pointer events, so fingers work. `.tl-viewport` has `touch-action: pinch-zoom`.
  - Always include 1440 in audits; the 1401–1500 band has its own topbar-title rule.
- 2026-10-10: the era name next to ▸ RECORD STREAM (`.canvas__era`) is a button. It opens a menu of the 7 `TIMELINE_ERAS` and `goEra` pans there. A short era is centred; a long one is placed with its start near the left edge. ESC or an outside click closes the menu.

**2026-10-11 additions:**
- **Study mode (S key):** `<html class="study">` plus the `iba:study` event, persisted in sessionStorage `iba.study`.
  - On entry it stops background music, suppresses the V-BC broadcast chime (`emitBC`), and keeps ambient on.
  - On exit, music comes back according to the saved preference.
  - Lecture mode takes priority. While lecture mode is on, study mode doesn't touch audio.
  - A `학습 모드 · S` badge (`.footer__study`) shows at the right end of the footer.
- **정리 tab layout:** `NotesStructured` first renders a single half-width column to measure real heights. It then splits at a section boundary near the halfway point.
  - Splitting inside a section costs a penalty of max(180px, 15% of total). A section continued in the right column gets a `(이어서)` heading. If there is only one section, no heading is repeated and the right column is padded to line up.
  - It re-measures when the width changes. Below 752px it stays one column.
- **기록 항목 창(노드 클릭 시 뜨는 상세 패널, MemoryDetail)** closes on ESC (registered on the `IBA_ESC` stack, so a record dialog above it closes first) and on a click anywhere outside it — only when it is the top window; clicks on node markers/labels and timeline drags (>6px) don't close it (2026-10-16).
- Event field `hideYear: true` hides the year on the timeline label and places that label above the same-year node (used for 「이슬람 문화」 over 「이슬람교 성립」).

**2026-10-29 UI (commit 3313ff5):**
- No corner-bracket (꺽쇠) decorations on boxes. They are all hidden by a `display:none` override block at the end of the main `<style>`. Kept: the face reticle in the operator panel and the screen-corner frames on portal/landing.
- The minimap is a 3px line. (A tighter label/trunk gap was tried and reverted — the user meant some other "두 간격", still unclear.)
- No entry transition from the oath (briefing) to the timeline. The user asked for it to be removed.
- Access-mode switch: `.mode-glitch` + `is-mode-glitch`, a weaker version of the landing title 「제1보존서고 접근 주의」 glitch. Three random horizontal bands jump, 1–2px red/cyan RGB offset, 0.5s, colors swap at 60ms.
  - Rejected: flash/scan line/stamp, and the dim-lights → emergency-lamp version.
- Typewriter sfx (`key`/`carriageReturn`) follows the ambient toggle via `DENDRO_AUDIO.typing()`.
- **LUMINA is the enemy, never an operation name.** 「제3층」 means the bureau's own restoration layer (fiction that must be labelled), not distortion. Response-zone broadcasts talk about 왜곡/정정.
