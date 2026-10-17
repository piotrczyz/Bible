<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: PWA update detection and refresh UX — Implementation Plan

**Plan**: context/changes/pwa-update-detection/plan.md   **Scope**: full plan (Phases 1-2, Increment 1)   **Date**: 2026-10-17
**Round**: 2   **Verdict**: APPROVED   **Findings**: 2

## Verdicts
| Dimension | Verdict |
|---|---|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | PASS |
| Architecture | PASS (no `context/architecture/model.c4` in this repo; gate not applicable) |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Silent-vs-prompt heuristic fails AC-02 in the common "return from background" case
- **Severity**: CRITICAL
- **Impact**: LOW
- **Dimension**: Success Criteria (also a Plan Adherence flaw — the plan itself proposes this heuristic)
- **Location**: `components/pwa-register.tsx:11,50-68`
- **Detail**: The silent/prompt decision is driven purely by `firstUpdateHandledRef`: "is this the first update detected in this page's *lifetime*". It does not track whether the page has ever gone to the background and come back. AC-02's own `Given` clause describes exactly that case: "the PWA is open in the background ... the user returns to the app". The `visibilitychange` listener (lines 77-81) exists precisely because, in the real target scenario, the page is **not** reloaded when the user returns — the same JS context (and therefore the same `firstUpdateHandledRef`) survives the background/foreground cycle (if the page *were* reloaded on every return, the dedicated visibility check would be unnecessary — the ordinary registration path would already re-run). Consequently, the realistic sequence "app launched → backgrounded → one deploy happens → user returns" hits `registration.update()` from the `visibilitychange` handler, finds the new worker, reaches `installed`, and — because this is still the *first* update this page has ever seen — takes the `applySilently` branch (`pwa-register.tsx:61-62`) and reloads immediately without ever showing the banner. This is not the narrow "milliseconds race" the plan-brief's "Open risks & assumptions" calls out; it is the default path for a single deploy during an open session, i.e. the exact scenario AC-02 specifies. In practice, the prompt only ever appears when a *second* deploy lands within the same continuously-running session — which will rarely happen — so AC-02 is not reliably delivered.
  Full force-close + relaunch (AC-01) is unaffected: that always starts a brand-new page lifetime with no prior background cycle, so the heuristic correctly stays silent there.
- **Fix**: Add a ref that records whether the page has ever transitioned to `hidden` (set it inside the existing `visibilitychange` listener). Only take the silent branch when `!firstUpdateHandledRef.current && !hasBeenHiddenRef.current`; once the page has been hidden at least once, any later detected update — including the very first one — goes through `promptForUpdate`, never `applySilently`. The `registration.waiting` check right after `register()` (lines 50-52) does not need the same guard: it runs before any `hidden` transition can have occurred in that page's lifetime.
- **Decision**: FIXED (5e52bec) — see `reviews/fix-r1.md`

### F2 — No listener cleanup on unmount (pre-existing pattern, not a regression)
- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Pattern Consistency
- **Location**: `components/pwa-register.tsx:22-28,71-81`
- **Detail**: `controllerchange`, the hourly `setInterval`, and the new `visibilitychange` listener are never removed in an effect cleanup. `PWARegister` is mounted once for the app's lifetime (`app/layout.tsx:88`), so this has no practical effect, and the pre-existing code had the same shape (unremoved `setInterval`). Not introduced by this change.
- **Fix**: n/a — noted for awareness only.
- **Decision**: ACCEPT — matches the existing pattern in this file; `PWARegister` is a root-level singleton that never unmounts in practice.

## Automated criteria run (Round 1)

- `pnpm lint` — PASS (1 pre-existing warning in `hooks/use-wake-lock.ts`, unrelated to this change).
- `pnpm typecheck` — PASS (no output).
- `node scripts/generate-sw.mjs` run twice, 1s apart — PASS: `CACHE_VERSION` differed (`mvcw4ffe` → `mvcw4g84`), `BIBLE_CACHE` identical (`scripture-bibles-v1`) both times, no `__SW_BUILD_ID__` left in either output.
- `public/sw.js` install handler — PASS: no unconditional `self.skipWaiting()` inside `install`.
- `pnpm build` — PASS: completed successfully; `out/sw.js` exists with a fresh `CACHE_VERSION` (`mvcw4mrr`) and no `__SW_BUILD_ID__` placeholder.
- `firebase.json` — PASS: valid JSON; header rules in order `**/*.@(js|css)` (index 0) → `**/*.@(jpg|...)` (index 1) → `/sw.js` with `Cache-Control: no-cache` (index 2), so the specific rule is positioned after the broad JS/CSS rule and wins on merge.
- Translation keys — PASS: `updateAvailable` / `updateRefresh` present once each in the `en`, `pl`, `no` blocks (`lib/translations.ts:37-38,188-189,339-340,490-491`).
- `components/pwa-register.tsx` — PASS: uses `useLanguage()`, no hardcoded English banner text (`t.updateAvailable` / `t.updateRefresh`).
- `app/layout.tsx` — PASS: `<PWARegister />` is between the `<LanguageProvider>` opening tag (line 81) and its closing tag (line 89).
- `pwa-register.tsx` registers both `visibilitychange` and `controllerchange` listeners — PASS (lines 22, 77).

## Manual criteria

- 1.8 (deployed preview serves `/sw.js` with `Cache-Control: no-cache`) — pending, needs a live deploy.
- 2.7 (full end-to-end update flow on a deployed, installed PWA) — pending, needs a live deploy. With F1 fixed, the "return from background" half of this check should now behave per AC-02; still needs real-browser confirmation on a preview.

## Notes

- `pnpm-workspace.yaml` is present untracked in the worktree (pnpm build-approval prompt artifact); it is not part of this change's diff and was not committed, so it is not a review finding.
- `public/sw.js` is correctly removed from git tracking and gitignored; only `public/sw-template.js` is tracked.
- No `context/architecture/model.c4` exists in this repo, so the architecture boundary gate does not apply.

## Round 2

Re-review of fix commit `5e52bec` (`fix(pwa-update-detection): address review findings (r1)`) plus the decision-record commit `4b08c53`.

- **F1** — confirmed fixed. `components/pwa-register.tsx:18,68,85-86` now adds `hasBeenHiddenRef`, set `true` inside the existing `visibilitychange` listener on `document.visibilityState === 'hidden'`, and gates the silent branch on `!firstUpdateHandledRef.current && !hasBeenHiddenRef.current`. This is exactly the fix the finding asked for: once the page has been hidden at least once, any later detected update — including the first one this page's lifetime has seen — now goes through `promptForUpdate` instead of `applySilently`, which resolves the AC-02 gap (the realistic "launch → background → one deploy → return" sequence now prompts instead of silently reloading). The `registration.waiting` fast-path right after `register()` was correctly left unguarded, as recommended (no `hidden` transition can have happened yet at that point). No test runner exists in this repo, so the implementer's evidence is a standalone logic-trace reproduction (`fix-r1.md`) showing the pre-fix inputs resolve to `silent` and the post-fix inputs resolve to `prompt` for the exact F1 scenario, plus confirmation AC-01 (full launch, never hidden) still resolves to `silent` — reasonable substitute evidence given the no-test-infrastructure constraint recorded in `tech-stack.md`.
- **F2** — untouched by the fix commit (diff is limited to the `hasBeenHiddenRef` addition and its one call site), as expected; stays `ACCEPT` per round 1.
- **Regression sweep** — the fix commit touches only `components/pwa-register.tsx` (an increment-owned file) and the review record; no other `ACCEPT`/`DISMISS` finding's code was touched.
- **Re-run** (plus the build, per the re-review rule): `pnpm lint` — PASS, same single pre-existing warning in `hooks/use-wake-lock.ts`, no new warnings. `pnpm typecheck` — PASS, clean. `pnpm build` — PASS, completed successfully; `out/sw.js` regenerated with a fresh `CACHE_VERSION` and no `__SW_BUILD_ID__` placeholder. `fix-r1.md` already carries a full baseline-comparable re-run of every Phase 1/2 automated criterion with no new failures, so the full suite was not repeated here.
- **Verdict**: all findings resolved or accepted, all automated criteria pass, the build is not skipped → **APPROVED**. Manual criteria 1.8 and 2.7 remain pending a live preview (`manual-pending` guard), unaffected by the verdict.
