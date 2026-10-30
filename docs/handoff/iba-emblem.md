# iba-emblem

> IBA 국제기록보존기구 인장(대외판·관리국 내부판·세로 락업) — timeline-app의 모든 휘장은 iba-emblem.js 생성기로 그린다

2026-09-15, the organization was renamed from IBCA 국제연대관리기구 to **IBA 국제기록보존기구** (International Bureau of Archives). The old gold TVA/IBCA crest was retired.

- The finalized seal source is `ui_kits/timeline-app/assets/w1/iba_emblem_final2.html`. Its reference colour was #BA7517, single colour. Since 2026-09-17 the app runs a deep-green palette (it was amber), and the seal in the app is #24804e (main green #2fae5e on a near-black background #040806; 2026-09-17). Grid dividers and the centre-circle fill take the background colour, so pass it in as a variable rather than hardcoding it.
- The generator is `ui_kits/timeline-app/iba-emblem.js`. It exposes `window.IBA_EMBLEM.internal / public / lockupV({color,bg})`, which return inner SVG markup. The React wrapper is `IbaSeal` (`window.IbaSeal`, `kind`/`bg`/`color`).
- 대외판 (`public`) has no text and no hourglass. It is used on the portal screen, as the vertical lockup.
- 관리국 내부판 (`internal`) carries the lettering and the hourglass. It is used in the topbar left of the IBA mark (54px), inside the loader rings, on the left of the 규정 (briefing) screen (250px), and as the blurred landing background. Its text can't be read at 32px or below, and it must not be used in external documents or as a favicon.
- The vertical lockup (`lockupV`) shows IBA, International Bureau of Archives and 국제기록보존기구. It is used on the portal screen (포털 우회 로그인), with red/cyan ghost copies for the glitch.
- 2026-10-09 fix: the 내부판 top lettering (Georgia 21) measured 514px against a 484px semicircle path, so textPath dropped the first I and the last S (the user saw it as a typo). The top path now extends 20° below horizontal and letter-spacing went from 1.6 to 0.6, so the text fits the semicircle (482px). The original asset `iba_emblem_final2.html` has the same clipping — don't copy its spec back.

Related: [timeline-node-terminology](timeline-node-terminology.md)
