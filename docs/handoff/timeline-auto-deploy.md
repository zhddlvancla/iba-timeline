# timeline-auto-deploy

> timeline-app 자동 올리기 — 점검까지 끝난 작업은 묻지 않고 커밋 후 GitHub(main)에 push; 사이트 https://zhddlvancla.github.io/iba-timeline/

User decision (2026-10-08): **auto deploy**.

After a timeline-app task is finished and verified (overlap sweep, console errors, data check), commit and `git push` to `origin main` without asking. GitHub Pages then updates https://zhddlvancla.github.io/iba-timeline/ within 1–2 minutes.

**Why:** the user wants the site to follow local work without an extra step.

**How to apply:**
- Push only verified work. Never push a half-done or broken state.
- After a push, mention it in one line.
- The push credentials are stored in the macOS keychain, and the remote URL includes the username. If a push asks for a password, tell the user rather than retrying.
- Make sure any new files or asset folders are un-ignored in `.gitignore` first.

Related: [timeline-github-deploy](timeline-github-deploy.md)
