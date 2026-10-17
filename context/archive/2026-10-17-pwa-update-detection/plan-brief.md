# PWA update detection and refresh UX — Plan Brief
Full plan: `context/changes/pwa-update-detection/plan.md` · issue text: `change.md`

## What & why

The installed web PWA (iOS home screen today, but not iOS-specific) never
picks up a new deployment — the only fix users have is to delete and
re-add the app. This change makes it detect new versions reliably: load
them silently on a full launch, and prompt (never auto-reload) when a
version is detected while the app is already in use, including on return
from the background — without losing local user data or offline Bible
content, and without requiring network to keep using the app.

## Starting point

`components/pwa-register.tsx` already has a registration/update-detection
skeleton and a banner, but can't tell "full launch" from "already in use",
is mounted outside `LanguageProvider` so it can't be translated, and the
actual reason updates are never seen today is upstream of it: a hardcoded,
never-bumped `CACHE_VERSION` in `public/sw.js:5` plus a Firebase Hosting
header rule (`firebase.json:17-24`) that caches `/sw.js` itself for a year
as immutable. `public/sw.js:39` also force-activates every new worker
immediately (`self.skipWaiting()` unconditional on install), which would
undermine the "no reload mid-read" requirement once updates start being
detected. User data (reading history, settings, language) is already in
`localStorage`, untouched by any of this.

## Desired end state

A relaunch after a deploy just runs the new version. An update found while
the app is open shows a small translated "new version available" banner
that reloads only on tap. Offline Bible downloads and all local user data
are unaffected by either path, and the version check never blocks offline
use.

## Complexity

MEDIUM — touches the service worker's build/caching identity, an HTTP
header rule, the service worker's own activation lifecycle, and the
client-side detection/prompt logic, with several interacting decisions
(none of them schema, contract, or security-boundary changes) but no new
infrastructure and one deployable increment.

## Key decisions made

| Decision | Choice | Why | Source |
|---|---|---|---|
| rs-research / rs-frame | Skipped both | Issue is spec-complete (Scope + AC-01/02/03); `pwa-register.tsx`, `sw.js`, `layout.tsx`, `firebase.json` read in full explain current behavior and the fix; Jev (`needs_research` p=0.53, `needs_framing` p=0.13`) was asked but in dry mode (`unavailable`), so judged directly | Auto |
| Mode | Feature, not bug | Issue is labeled `rs-feature`/`quick`, not `rs-bug` | Issue |
| Root cause of "never updates" | `firebase.json:17-24`'s immutable 1-year `Cache-Control` also matches `/sw.js`, and `public/sw.js:5`'s `CACHE_VERSION` is never bumped per deploy — together the browser neither re-fetches nor sees different bytes for the service worker script | Auto (evidence) |
| Service worker versioning | Generate `public/sw.js` from a tracked `public/sw-template.js` at build/dev time via `scripts/generate-sw.mjs`, substituting a per-build id; wire into `build`/`dev` scripts directly (pnpm does not run `pre*` lifecycle hooks by default) | Auto |
| `/sw.js` HTTP caching | Add a `firebase.json` header rule overriding `Cache-Control` to `no-cache` for `/sw.js`, after the broad JS/CSS rule | Auto (evidence) |
| Offline Bible cache safety | Decouple `BIBLE_CACHE` from the per-build id (keep it a stable name); scope the `activate` cache cleanup to only the static app-shell family | Auto — bumping the shared `CACHE_VERSION` would otherwise delete offline Bible downloads on every deploy (AC-03 regression), evidence `public/sw.js:6-7,51-59` |
| Update activation safety | Remove the unconditional `self.skipWaiting()` on `install`; only skip waiting via the existing message-triggered path | Auto — otherwise a new worker could take control mid-session before the prompt/silent decision is made |
| Silent-vs-prompt rule | First update detected in a page's lifetime = silent; any later one (periodic check or background-return check) = prompt | Auto — no web platform signal distinguishes "fully closed and relaunched" from "kept running"; this is the closest available proxy and matches the issue's own wording |
| Background-return detection | `visibilitychange`-triggered `registration.update()` in addition to the existing hourly interval | Auto / Issue AC-02 |
| Platform scope (open question) | Implement with standard Service Worker / Page Visibility APIs, no iOS-only branching | Issue ("the builder will assume all platforms" if unanswered) |
| Repeat-prompt behavior (open question) | Banner has no dismiss control and simply stays until tapped; a later background-return check while it's already showing is a no-op | Auto — issue leaves it to the builder; simplest option, no new state |
| Banner wording (open question) | EN "A new version is available." / "Refresh"; PL "Dostępna jest nowa wersja." / "Odśwież"; NO "En ny versjon er tilgjengelig." / "Oppdater" | Auto — issue leaves it to the builder |
| `PWARegister` placement | Move inside `<LanguageProvider>` in `app/layout.tsx` (currently a sibling outside it, `:90`) | Auto (evidence) — needed so it can call `useLanguage()` |
| AC-03 data preservation | No change needed to `localStorage` usage (reading history, settings, language already live there, untouched by Cache Storage) | Auto (evidence) |
| Test strategy | No test runner configured (tech-stack.md Open Stack Question #1); automated checks use lint/typecheck/build/grep instead; plan does not depend on adding a runner | Auto |

## Scope

In: service worker build-time versioning, `/sw.js` HTTP caching, service
worker activation lifecycle, silent-vs-prompt client logic,
background-return detection, banner translation, moving `PWARegister`
inside `LanguageProvider`.

Out: native iOS/Android Capacitor builds, Bible content versioning/fetch
logic, migrating user data off `localStorage`, a dismiss/snooze control on
the banner.

## Architecture / Approach

Fix delivery first (make the service worker's own bytes change per build,
and stop the browser/CDN from hiding that change), then fix the app-level
behavior (the existing `pwa-register.tsx` skeleton gains a silent-vs-prompt
rule, a background-return trigger, and translations). Both land in one
increment, one PR — see `plan.md` Implementation Approach for why a
same-PR, two-phase cut fits this single-area change.

## Increments at a glance

| # | Delivers | Depends on | User-visible | Key risk |
|---|---|---|---|---|
| 1 | Reliable, silent-on-launch / prompted-in-use PWA updates | — | yes | Decoupling `BIBLE_CACHE` from the build id incorrectly could still regress offline Bible content; verified by an automated check (identical cache name across two generator runs) plus the manual end-to-end check |

## Phases at a glance

| Phase | Increment | Delivers | Key risk |
|---|---|---|---|
| 1 | 1 | Service worker bytes change per build, `/sw.js` isn't cached stale, Bible cache survives, new worker can't hijack control mid-session | Firebase header-rule precedence (later entry overriding the broad rule) — verified by an automated JSON check plus a manual header check on a preview |
| 2 | 1 | Silent update on full launch, translated tap-to-refresh prompt on background return/in-use | The silent-vs-prompt heuristic (first-check-only) is an approximation of "full launch" since no better web signal exists — covered by the manual end-to-end criterion |

Prerequisites: none (one area, builds on nothing).

## Open risks & assumptions

- No `decision-to-verify` guards: every decision above has a clear
  evidence-based recommendation and none needed an rs-advisor consult.
- The "first update this session = silent" heuristic could, in a rare race
  (app opened and backgrounded within milliseconds, before the first check
  resolves), show a prompt where a silent update was intended, or vice
  versa; this is a cosmetic edge case, not a data-safety one, and is called
  out in `plan.md` Implementation Approach rather than blocking the plan.
- Manual criteria require a real deployed preview and (for AC-01) an
  installed home-screen PWA relaunch; they cannot be automated without a
  configured end-to-end test runner (tech-stack.md Open Stack Question #1,
  not touched by this plan).

## Success criteria (summary)

Phase 1: lint/typecheck/build pass; the generator produces a different
`CACHE_VERSION` and the same `BIBLE_CACHE` name across two runs; no
leftover placeholder or unconditional `skipWaiting`; `firebase.json`
overrides `/sw.js` to `no-cache`. Phase 2: lint/typecheck pass; new
translation keys present in all three languages; `PWARegister` uses
translations and is mounted inside `LanguageProvider`; it registers both a
`visibilitychange` and a `controllerchange` listener. Both phases end in
one manual end-to-end check on a deployed preview covering AC-01, AC-02 and
AC-03.
