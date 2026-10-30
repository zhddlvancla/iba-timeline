# timeline-dialog-images-no-lazy

> timeline-app — never use loading="lazy" on images inside the SyncDialog/map modal; it leaves them permanently unloaded

In `index.html`, the SyncDialog (분기점 열람) and map modal images (`.sync-art__img`, `.sync-source__img`, the MapTab `gMapUrl` img, and the track map-modal img) must use `loading="eager"`, NOT `loading="lazy"`.

**Why:** With `loading="lazy"`, none of the 자료(artifacts)/지도(map)/탐구(inquiry) images ever loaded — `img.complete=false`, `naturalWidth=0`, and the frame collapsed to height 0. The dialog mounts with an entrance animation and tab panes (inactive tabs hidden), which breaks the browser's lazy-load IntersectionObserver, so images in it never fetch. The files themselves were fine (server returned 200; a direct `new Image()` loaded to naturalWidth 1600). Switching all five `<img>` renderers to `loading="eager"` fixed it (verified: 전한 artifacts + 북위 inquiry images load on their own). Confirmed 2026-06-22.

**How to apply:** When adding any new image inside the dialog/modal, use `loading="eager"`. Each dialog only mounts when opened and shows ~2–4 images, so eager loading is cheap. See [tva-emblem](tva-emblem.md) for the same file.
