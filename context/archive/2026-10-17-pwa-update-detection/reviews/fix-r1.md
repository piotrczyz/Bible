<!-- IMPL-FIX-REPORT -->
# Fix round 1 — PWA update detection and refresh UX

**Report**: context/changes/pwa-update-detection/reviews/impl-review-inc-1.md
**Round**: 1

## F1 — Silent-vs-prompt heuristic fails AC-02 in the common "return from background" case

**Decision**: FIX

**Fix applied** (`components/pwa-register.tsx`):
- Added `hasBeenHiddenRef`, a ref set to `true` inside the existing
  `visibilitychange` listener whenever `document.visibilityState === 'hidden'`.
- Changed the `statechange` branch condition from
  `!firstUpdateHandledRef.current` to
  `!firstUpdateHandledRef.current && !hasBeenHiddenRef.current`, so once the
  page has been hidden at least once, any later detected update goes through
  `promptForUpdate`, never `applySilently` — even if it is still the first
  update this page's lifetime has seen.
- Left the `registration.waiting` check right after `register()` unguarded
  by `hasBeenHiddenRef`, as the finding specified: it runs before any
  `hidden` transition can have occurred in that page's lifetime.

No test runner is configured in this repo
(`context/foundation/tech-stack.md` "No test framework configured yet"), so
there is no test suite to prove red-first in the usual sense. Evidence
instead:

**1. Logic trace proving the bug and the fix (red → green), reverted vs applied**

Ran a standalone reproduction of the decision logic for the exact scenario
F1 names — full launch, page backgrounded once, single deploy detected,
still the first update this page's lifetime has seen:

```
$ node -e '... decide({firstUpdateHandled:false, hasBeenHidden:true, usesHasBeenHidden:<bool>}) ...'
BEFORE FIX (bug): silent -> expected prompt, got silent
AFTER FIX: prompt -> expected prompt, got prompt
AC-01 full launch still silent: silent
```

With the old logic (`usesHasBeenHidden: false`, i.e. the fix reverted), the
background-return scenario resolves to `silent` — reproducing the bug F1
describes. With the fix applied, the same inputs resolve to `prompt`. A
third check with `hasBeenHidden: false` (full launch, never backgrounded)
still resolves to `silent`, confirming AC-01 (full force-close + relaunch)
is unaffected.

**2. Automated criteria re-run (phases 1 and 2, full set — comparable to the round-1 baseline)**

- `pnpm lint` — PASS (same 1 pre-existing warning in `hooks/use-wake-lock.ts`,
  unrelated to this change; no new warnings).
- `pnpm typecheck` — PASS (no output).
- `node scripts/generate-sw.mjs` — PASS: `CACHE_VERSION` changed per run
  (`mvcw92co`, then `mvcw99x2` via the build below), `BIBLE_CACHE` stayed
  `scripture-bibles-v1`.
- `public/sw.js` install handler — PASS: the only `self.skipWaiting()` is
  inside the `message` handler (`SKIP_WAITING`), not an unconditional call
  in `install`.
- `pnpm build` — PASS: completed successfully; `out/sw.js` exists with
  `CACHE_VERSION = 'mvcw99x2'`, no `__SW_BUILD_ID__` placeholder.
- `firebase.json` — PASS: header rule order unchanged
  (`**/*.@(js|css)` → `**/*.@(jpg|...)` → `/sw.js`).
- Translation keys — PASS: `updateAvailable` / `updateRefresh` present once
  each in `en`, `pl`, `no` blocks (`lib/translations.ts:37-38,188-189,339-340,490-491`).
- `components/pwa-register.tsx` — PASS: still uses `t.updateAvailable` /
  `t.updateRefresh`, no hardcoded English text; unchanged by this fix.
- `app/layout.tsx` — PASS: `<PWARegister />` unchanged, still inside
  `<LanguageProvider>`.
- `pwa-register.tsx` registers both `visibilitychange` and `controllerchange`
  listeners — PASS (now also sets `hasBeenHiddenRef` inside the
  `visibilitychange` listener).

No new failures versus the round-1 baseline; no full automated test suite
exists to compare against beyond the above.

**Decision**: FIXED (pending commit SHA, recorded below)

## F2 — No listener cleanup on unmount

**Decision**: ACCEPT (untouched, per the round-1 report).
