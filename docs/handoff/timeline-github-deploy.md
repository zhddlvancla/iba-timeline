# timeline-github-deploy

> timeline-app GitHub 공개 배포 — 새 이력 저장소(iba-timeline, 공개, Pages), 화이트리스트 .gitignore, 옛 1.8GB 이력은 ~/timeline-app-git-backup

On 2026-10-08 the user chose a **public** GitHub repo named `iba-timeline`, served through GitHub Pages.

**Repo setup:**
- `~/ui_kits/timeline-app` was re-initialized with fresh history. The first commit is f346709.
- The old history is kept at `~/timeline-app-git-backup`. It is 1.8GB because it contains textbook PDFs; never push it.
- `.gitignore` is a whitelist. Only `index.html`, `timeline-content.js`, `audio-engine.js`, `iba-emblem.js`, `.nojekyll`, `assets/w1/고대/` and `assets/w1/기관/` go up.
  - Textbooks, `vestigia-voic`, `_removed`, `_pre_upscale_backup` and 5 unused textbook-scan images are excluded.
- A new top-level file or asset folder must be un-ignored in `.gitignore`, or it won't publish.
- The local git identity is `IBA timeline <iba-timeline@local>`, so the user's gmail is never exposed on a public repo.

**Push is the user's job.** The user does the remote add and the push, then Settings → Pages (`main`, `/`).

**Before each push:** check that every asset path referenced in the code exists exactly, case-sensitive and NFC. Pages is case-sensitive; macOS is not.

**Why:** a public repo must not carry textbook originals. Pages fails on path case mismatches that work locally.

Related: [timeline-textbook-sources](timeline-textbook-sources.md) [timeline-history-data-rules](timeline-history-data-rules.md)
