# PWA update detection and refresh UX — Implementation Plan

## Overview

The installed web PWA never reliably picks up a newly deployed version: users
have to delete and re-add it to the home screen. This change makes the app
detect a new deployment on every full launch (loading it silently) and on
every return from the background while in use (showing a non-intrusive
"new version available" prompt that reloads only on tap), without losing any
locally stored user data or offline Bible content, and without blocking
offline use.

## Current State Analysis

- `components/pwa-register.tsx` already registers `/sw.js`, listens for
  `updatefound`/`statechange`, and shows a hardcoded-English banner — but it
  cannot distinguish "full launch" from "already in use", so every detected
  update goes through the same path, and it sits outside `LanguageProvider`
  (`app/layout.tsx:90`, closed at `:89`) so it cannot use translations.
- `public/sw.js:5` hardcodes `CACHE_VERSION = 'v2'`, never bumped per deploy,
  so the service worker's own script bytes are identical across deploys.
  Browsers only detect a SW update by byte-comparing the registered script;
  with identical bytes, no update is ever detected — the root cause of the
  issue.
- `firebase.json:17-24` applies `Cache-Control: public, max-age=31536000,
  immutable` to `**/*.@(js|css)`, which also matches `/sw.js`. Even if the
  deployed `sw.js` bytes did change, the browser (and any CDN) would keep
  serving the year-old cached copy and never re-fetch it to notice.
- `public/sw.js:39` calls `self.skipWaiting()` unconditionally on `install`,
  and `activate` calls `self.clients.claim()`. Combined, a new worker takes
  control mid-session — before the user is ever shown a prompt — which would
  make the "does not reload mid-read" requirement unreliable once the two
  bugs above are fixed and updates start being detected.
- `public/sw.js:6-7` derives both `STATIC_CACHE` and `BIBLE_CACHE` from the
  same `CACHE_VERSION`, and `activate` (`:51-59`) deletes any cache not
  matching the current `STATIC_CACHE`/`BIBLE_CACHE` name. Bumping
  `CACHE_VERSION` per build (needed to fix the root cause) would therefore
  delete every previously downloaded offline Bible version on each deploy —
  a direct AC-03 regression — unless the two caches are decoupled.
- User data already lives outside any of this: reading history
  (`components/reading-history-provider.tsx:53,77`), settings
  (`components/settings-provider.tsx:27-46`) and language
  (`components/language-provider.tsx:28-36`) are all in `localStorage`,
  untouched by Cache Storage or SW updates.
- No test runner is configured (`context/foundation/tech-stack.md` Open
  Stack Questions #1); this plan does not depend on adding one — its
  automated checks use plain lint/typecheck/build/grep commands.

## Desired End State

- A full launch (app fully closed, then reopened) ends up running the
  latest deployed version with no visible prompt.
- An update detected while the app is open — including right after
  returning from the background — shows a small "a new version is
  available" banner (EN/PL/NO) that only reloads when tapped; the current
  screen is never reloaded on its own.
- Reading history, settings, last reading position and downloaded offline
  Bible versions are byte-for-byte unchanged across either update path, and
  the app keeps working fully offline when the version check has no network.

### Key discoveries

- `public/sw.js:5-7` — one hardcoded `CACHE_VERSION` drives both the static
  app-shell cache and the Bible content cache; bumping it unconditionally
  would wipe offline Bible downloads on every deploy.
- `firebase.json:17-24` — the immutable 1-year `Cache-Control` glob also
  matches `/sw.js`, which is the actual reason new deployments are never
  picked up today, independent of the update-detection logic in the app.
- `app/layout.tsx:81-90` — `<PWARegister />` is mounted as a sibling of
  `<ThemeProvider>`, outside `<LanguageProvider>`, so it has no access to
  `useLanguage()` today.
- `public/sw.js:39,142` — `self.skipWaiting()` already exists as a
  message-triggered path (`:142`, for the "tap to update" flow) but is also
  called unconditionally on install (`:39`), which defeats the intended
  silent/prompt distinction once updates are actually detected.

## What we're NOT doing

- No native iOS/Android Capacitor build changes — this is the installed web
  PWA only (per the issue's explicit non-goal).
- No change to how Bible content itself is fetched or versioned — only to
  how the app shell/service worker is cache-busted and activated.
- No migration to IndexedDB/Dexie for user data — out of scope for this
  issue; current `localStorage` persistence already satisfies AC-03.
- No dismiss ("X") control on the update banner, and no "remind me later"
  logic — the banner simply stays until tapped (see plan-brief Key decisions).
- No platform-specific branching (iOS vs Android vs desktop) — the fix uses
  standard Service Worker / Page Visibility APIs that behave the same
  everywhere a browser implements them.

## Implementation Approach

Fix the delivery problem first (service worker bytes change per build, and
are never served stale by Firebase Hosting or the browser's HTTP cache),
then fix the app-level behavior (the lifecycle already has the right shape
in `pwa-register.tsx`, it just needs a silent-vs-prompt rule, a
background-return trigger, and translation support). The two fixes are
independent enough to fit this issue's single area in two increments-free
phases of one increment (one area, no dependency, no need for a separate
API-before-UI slice here: both phases land together in one deployable PR).

The silent-vs-prompt rule is inherently approximate because no web platform
signal distinguishes "the OS fully killed the app and relaunched it" from
"it kept running": the best available proxy is "the very first update
detected in this page's lifetime" (full launch) versus "any later one in
the same session" (periodic check or a background-return check) — which
matches the issue's own wording ("on full launch ... silently" vs "while in
use ... prompt").

## Increments

| # | Name | Phases | Depends on | User-visible | Status | PR |
|---|---|---|---|---|---|---|
| 1 | PWA update detection and refresh UX | 1-2 | — | yes | pending | — |

## Critical Implementation Details

### Service worker build identity

- `public/sw-template.js` (new, tracked) replaces today's `public/sw.js`
  content, with `const CACHE_VERSION = '__SW_BUILD_ID__';` as a placeholder.
- `scripts/generate-sw.mjs` (new) reads `public/sw-template.js`, replaces
  `__SW_BUILD_ID__` with a fresh id (`Date.now().toString(36)` is enough —
  uniqueness per build is all that matters, not its format), and writes the
  result to `public/sw.js`, which is gitignored (it is now a build output,
  like `/out/`).
- `package.json`'s `dev` and `build` scripts run the generator before
  `next dev` / `next build` directly in the script string (pnpm does not run
  `pre`/`post` npm lifecycle hooks by default, so a `prebuild` script would
  silently never run).

### Cache naming

- `STATIC_CACHE` keeps using the per-build id (so the app shell is
  correctly busted every deploy).
- `BIBLE_CACHE` gets a stable name independent of the build id (e.g.
  `scripture-bibles-v1`, bumped only if the Bible cache's own format ever
  changes) so offline Bible downloads are never deleted by an app-shell
  deploy.
- The `activate` cleanup only deletes caches whose name matches the static
  app-shell family and is not the current `STATIC_CACHE` — it must not touch
  `BIBLE_CACHE` at all.

### Update lifecycle

- `self.skipWaiting()` is removed from the `install` handler; the worker
  only activates when explicitly told to via the existing `SKIP_WAITING`
  message handler (`public/sw-template.js`, carried over from today's
  `:140-143`).
- The client tracks whether it has already handled one update this page
  lifetime. The first one found (either `registration.waiting` already
  present right after registration, or the first `updatefound` →
  `installed` transition) is applied silently: post `SKIP_WAITING` to that
  worker. Every later one found in the same session shows the banner
  instead and stores the specific waiting worker to message when tapped.
- A single `navigator.serviceWorker.addEventListener('controllerchange', …)`
  (guarded against firing more than once) performs the actual
  `window.location.reload()` for both the silent path and the "tap to
  update" path, so there is exactly one reload mechanism.
- `document.addEventListener('visibilitychange', …)` calls
  `registration.update().catch(() => {})` when the page becomes visible
  again, in addition to the existing hourly `setInterval`, so a return from
  background triggers an immediate check; both this check and the interval
  always count as "later" (prompt), never "first" (silent).

## Phase 1: Fix delivery so a new service worker is actually detected and activated safely

### Overview

Makes the browser able to see a new service worker on every deploy, stop a
CDN/browser cache from hiding it, and make sure the new worker cannot take
over mid-session or wipe offline Bible content.

### Required changes

#### 1. Service worker build identity
- **File**: `public/sw-template.js` (new; replaces today's `public/sw.js`
  as the tracked source), `scripts/generate-sw.mjs` (new), `.gitignore`
  (add the now-generated `public/sw.js`)
- **Goal**: give the service worker's own script bytes a value that changes
  on every build, which is what the browser's update algorithm compares.
- **Contract**: `public/sw-template.js` contains `__SW_BUILD_ID__` in place
  of the old hardcoded `CACHE_VERSION`; `scripts/generate-sw.mjs` performs a
  literal string substitution and writes `public/sw.js`; no other behavior
  of the service worker's template changes in this step beyond what's
  listed below.

#### 2. Cache naming and cleanup
- **File**: `public/sw-template.js`
- **Goal**: let the app-shell cache bust per build without ever touching the
  offline Bible cache.
- **Contract**: `STATIC_CACHE` includes the build id; `BIBLE_CACHE` is a
  fixed name independent of the build id; the `activate` handler's cache
  cleanup matches only the static app-shell cache family, never
  `BIBLE_CACHE`.

#### 3. Update lifecycle safety
- **File**: `public/sw-template.js`
- **Goal**: stop the new worker from activating before the app has decided
  whether to apply it silently or prompt the user.
- **Contract**: remove the unconditional `self.skipWaiting()` call from the
  `install` handler; the worker only skips waiting in response to the
  existing `{ type: 'SKIP_WAITING' }` message.

#### 4. Build wiring
- **File**: `package.json`
- **Goal**: guarantee `public/sw.js` exists with a fresh build id before
  `next dev` or `next build` ever serves it.
- **Contract**: `dev` and `build` scripts run `node scripts/generate-sw.mjs`
  before invoking `next dev` / `next build`, in the script string itself
  (not a `pre*` lifecycle hook).

#### 5. HTTP caching of the service worker script
- **File**: `firebase.json`
- **Goal**: stop the browser/CDN from serving a year-old cached `/sw.js`
  that hides a real deploy.
- **Contract**: add a header rule for `/sw.js` (and the project's own
  `sw.js`-path, not `_next` or other hashed assets) setting
  `Cache-Control: no-cache`, listed after the existing broad
  `**/*.@(js|css)` rule so it overrides it for that one path (Firebase
  Hosting merges matching header rules per key, later entries winning).

### Success criteria

#### Automated
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- Running `node scripts/generate-sw.mjs` twice (with a tick in between)
  produces two different `CACHE_VERSION` values in `public/sw.js`, and
  neither run leaves the literal `__SW_BUILD_ID__` placeholder in the
  output.
- The two runs above produce an identical `BIBLE_CACHE` name both times
  (proving it is independent of the build id).
- `public/sw.js` (after generation) contains no unconditional
  `self.skipWaiting()` call inside the `install` handler.
- `pnpm build` completes successfully and `out/sw.js` exists and contains
  no `__SW_BUILD_ID__` placeholder.
- `firebase.json` is valid JSON and contains a header rule whose `source`
  matches `/sw.js` with `Cache-Control: no-cache`, positioned after the
  broad `**/*.@(js|css)` rule.

#### Manual
- On a deployed preview, confirm the `/sw.js` HTTP response has
  `Cache-Control: no-cache` (not the year-long immutable value).

## Phase 2: Silent update on full launch, prompted update while in use

### Overview

Wires the fixed service worker lifecycle into the app's UI: silent refresh
on a fresh launch, a translated non-intrusive prompt on return-from-background
or any later in-session detection, and no disruption to the currently open
screen.

### Required changes

#### 1. Translations
- **File**: `lib/translations.ts`
- **Goal**: the update banner's text is translated like the rest of the UI.
- **Contract**: add two keys to `Translations` (e.g. `updateAvailable`,
  `updateRefresh`) with EN/PL/NO values ("A new version is available." /
  "Refresh"; "Dostępna jest nowa wersja." / "Odśwież"; "En ny versjon er
  tilgjengelig." / "Oppdater"), next to the existing PWA-related keys.

#### 2. Mount PWARegister where it can use translations
- **File**: `app/layout.tsx`
- **Goal**: let the update banner read `t.updateAvailable` / `t.updateRefresh`.
- **Contract**: move `<PWARegister />` to inside `<LanguageProvider>`
  (alongside `<PWAInstallPrompt />`), instead of its current place outside
  both `<LanguageProvider>` and `<ThemeProvider>`.

#### 3. Silent-vs-prompt update logic
- **File**: `components/pwa-register.tsx`
- **Goal**: implement the full-launch-silent / in-use-prompt rule described
  under Critical Implementation Details, replacing today's single-path
  `updatefound` handling.
- **Contract**: 
  - Track, per page lifetime, whether the first detected update has already
    been handled (ref, not state — must not trigger a re-render).
  - Immediately after registration, if `registration.waiting` already
    exists and the page already has a controller, treat that as the first
    (silent) update.
  - On `updatefound` → the installing worker reaching `installed` while a
    controller exists: first time this session → post `SKIP_WAITING`
    silently; every later time → store the worker and show the banner
    (`t.updateAvailable` / `t.updateRefresh`), without touching the current
    screen.
  - A single `controllerchange` listener (guarded to run once) performs
    `window.location.reload()` for both the silent and the tap-to-update
    paths; the tap handler only posts `SKIP_WAITING` to the stored waiting
    worker and otherwise does nothing (no direct reload call).
  - A `visibilitychange` listener calls `registration.update()` (swallowing
    any error, so a missing network never blocks the UI) whenever the page
    becomes visible again, in addition to the existing hourly check.

### Success criteria

#### Automated
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `lib/translations.ts` contains the new keys in the English, Polish and
  Norwegian translation blocks (one occurrence of each key per language).
- `components/pwa-register.tsx` calls `useLanguage()` and contains no
  hardcoded English banner text.
- `app/layout.tsx` has `<PWARegister` positioned after the
  `<LanguageProvider>` opening tag and before its closing tag.
- `components/pwa-register.tsx` registers both a `visibilitychange` and a
  `controllerchange` listener.

#### Manual
- On a deployed preview installed as a home-screen PWA: deploy a build,
  fully close and reopen the app — it runs the new version with no visible
  prompt. Then, with the app open, deploy another build, switch away and
  back (or toggle the tab's visibility) — the "new version available"
  banner appears without reloading the current screen, and tapping it
  reloads to the new version. After both updates, confirm reading history,
  settings, last reading position and downloaded offline Bible content are
  unchanged, and that the app still works with the network disabled.

## Testing Strategy

No test framework is configured in this repository (tech-stack.md Open
Stack Questions #1). Automated checks in both phases use `pnpm lint`,
`pnpm typecheck`, `pnpm build`, and direct invocation of
`scripts/generate-sw.mjs` with grep-based assertions on its output — all
runnable without a test runner. End-to-end verification of the update
flows and data preservation is Manual, on a deployed preview, since it
needs a real browser's Service Worker/Cache Storage implementation and
(for AC-01) an installed-PWA relaunch.

## Migration Notes

No schema or data migration. `localStorage` keys are untouched; the only
storage-shape change is renaming/decoupling the Cache Storage bucket names
in `public/sw-template.js` (Phase 1, item 2), which only affects the app
shell cache (freely rebuildable from network) and explicitly preserves the
existing Bible cache name family so already-downloaded offline content is
not invalidated.

## References

- Issue #32 — `context/changes/pwa-update-detection/change.md`
- `components/pwa-register.tsx`, `public/sw.js`, `app/layout.tsx`,
  `firebase.json`, `lib/translations.ts`, `components/language-provider.tsx`,
  `components/settings-provider.tsx`, `components/reading-history-provider.tsx`
- `context/foundation/tech-stack.md`

## Progress

### Phase 1: Fix delivery so a new service worker is actually detected and activated safely
#### Automated
- [x] 1.1 pnpm lint passes — 55afcd8
- [x] 1.2 pnpm typecheck passes — 55afcd8
- [x] 1.3 Running the generator twice produces two different CACHE_VERSION values with no leftover placeholder — 55afcd8
- [x] 1.4 Both generator runs produce an identical BIBLE_CACHE name — 55afcd8
- [x] 1.5 Generated public/sw.js has no unconditional self.skipWaiting() in the install handler — 55afcd8
- [x] 1.6 pnpm build completes and out/sw.js exists with no placeholder left — 55afcd8
- [x] 1.7 firebase.json is valid JSON and overrides Cache-Control to no-cache for /sw.js after the broad JS/CSS rule — 55afcd8
#### Manual
- [ ] 1.8 Deployed preview serves /sw.js with Cache-Control: no-cache

### Phase 2: Silent update on full launch, prompted update while in use
#### Automated
- [x] 2.1 pnpm lint passes — dd6bd31
- [x] 2.2 pnpm typecheck passes — dd6bd31
- [x] 2.3 New translation keys present in English, Polish and Norwegian blocks — dd6bd31
- [x] 2.4 pwa-register.tsx uses useLanguage() and has no hardcoded English banner text — dd6bd31
- [x] 2.5 PWARegister is mounted inside LanguageProvider in app/layout.tsx — dd6bd31
- [x] 2.6 pwa-register.tsx registers visibilitychange and controllerchange listeners — dd6bd31
#### Manual
- [ ] 2.7 Full launch loads a new deploy silently; return-from-background shows the tap-to-refresh banner without disrupting the screen; reading history, settings, last position and offline Bible content survive both, and the app still works offline
