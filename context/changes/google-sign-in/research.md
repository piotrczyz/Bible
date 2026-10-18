---
date: 2026-10-18
researcher: rs-planner
git_commit: 6bd182193414155d91d8d353156937a62fa0ad58
branch: autofix/koda-issue-34-da372b21
repository: piotrczyz/bible
topic: "How reading history, AI search, providers, and Firebase config work today, to plan Google Sign-In gating, account-based reading history sync, and AI search auth gating"
tags: [research, codebase, auth, firebase, reading-history, ai-search]
status: complete
last_updated: 2026-10-18
last_updated_by: rs-planner
---

# Research: Google Sign-In, reading-history sync, AI search gating

**Date**: 2026-10-18 **Researcher**: rs-planner **Git Commit**: 6bd182193414155d91d8d353156937a62fa0ad58 **Branch**: autofix/koda-issue-34-da372b21 **Repository**: piotrczyz/bible

## Research Question

Issue #34 is a spec-complete feature issue (FRs, ACs, scope already given in
`change.md`). The scope is clear; what is NOT clear without reading the code is
*how* to wire sign-in, reading-history sync and the AI-search gate into the
existing structure — there is currently zero Firebase client SDK, zero
Firestore config, and zero network-detection code in the repo, despite
CLAUDE.md describing all three as part of the target architecture. Covered:
reading-history storage/recording/display, AI search client+server flow,
provider composition and view/navigation state, and prior decisions /
dependency licensing.

## Summary

- Reading history today is **plain `localStorage`** behind a React context
  (`ReadingHistoryProvider`), not Dexie/IndexedDB — contrary to CLAUDE.md's
  aspirational architecture. The `ReadingRecord` shape already matches
  CLAUDE.md's described shape exactly, which is good news for an account-sync
  design (no schema change needed, just a new storage backend + a queue).
- AI search calls a plain Cloud Function (`onRequest`, v2 SDK) over HTTP
  (`/api/search` rewritten by Firebase Hosting), with **no auth check at all**
  today — `cors: true`, no ID-token verification. `firebase-admin` is already
  a function dependency, so `admin.auth().verifyIdToken()` is available
  without adding a new function dependency.
- There is **no Firebase client SDK, no Firestore config, and no
  online/offline detection code anywhere in the repo.** `.firebaserc` even
  has a placeholder project id. All three must be introduced from scratch.
- `app/page.tsx` manages which screen is shown with plain `useState` (no
  router, partial `sessionStorage` restore for pull-to-refresh only) — "return
  to exactly where the user wanted to go" after an OAuth redirect needs its
  own small stash/restore mechanism, not existing deep-linking.
- No Open Stack Question blocks this (`tech-stack.md`'s only open axis is the
  unit/E2E test runner, unrelated). The `firebase` client package is
  Apache-2.0, satisfying CLAUDE.md's permissive-license rule.

## Detailed Findings

### Reading history (storage, recording, display)

- Storage: `localStorage`, not Dexie/IndexedDB. Reads at
  `components/reading-history-provider.tsx:53`
  (`localStorage.getItem(STORAGE_KEY)`), writes at
  `components/reading-history-provider.tsx:77`
  (`localStorage.setItem(STORAGE_KEY, ...)`), clear at
  `components/reading-history-provider.tsx:223`. Key constant at
  `components/reading-history-provider.tsx:9`
  (`"bible-reading-history"`). State lives in `useState`
  (`components/reading-history-provider.tsx:40`).
- `ReadingRecord` shape: `lib/reading-history.ts:10-23` — `{ id, bookId,
  chapter, verses: number[], versionId, timestamp }`, matching CLAUDE.md's
  documented shape exactly. `id` via `generateId()`
  (`lib/reading-history.ts:29-39`, `crypto.randomUUID()` with fallback).
  `timestamp` is `new Date().toISOString()` (`lib/reading-history.ts:56`).
- Recording trigger: verse tap in the reader.
  `components/verse-reader.tsx:78-80` `handleVerseClick` →
  `toggleVerse(verseNumber)` →
  `components/reading-history-provider.tsx:135-163`: first verse selected
  calls `createRecord` (line 149, logic at 111-132, via
  `createReadingRecord` in `lib/reading-history.ts:44-58`); subsequent
  toggles call `updateCurrentRecord` (provider lines 84-97, invoked at 147).
  Deselecting all verses deletes the record (lines 151-159). "Select all"
  (`selectAllVerses`, lines 166-178, wired from
  `components/verse-reader.tsx:87/281-290`) and `clearSelection` (lines
  181-193) follow the same pattern. Chapter/book/version context is set
  separately (`reading-history-provider.tsx:100-108`, called from
  `verse-reader.tsx:50-52`).
- Display: `components/timeline-sheet.tsx:30` consumes `useReadingHistory()`
  (context defined at `reading-history-provider.tsx:249-255`), destructuring
  `records`, `deleteRecord`, `clearHistory`, `isLoading`; grouped via
  `groupRecordsByDate` (`timeline-sheet.tsx:34-36`,
  `lib/reading-history.ts:63-75`), rendered via `TimelineItem`
  (`timeline-sheet.tsx:146-201`). Sheet opened with local `useState` and a
  shadcn `Sheet`/`SheetTrigger` (`timeline-sheet.tsx:32`, trigger rendered
  in header at `page.tsx:191`), closed in `handleItemClick`
  (`timeline-sheet.tsx:44-49`).
- `MAX_RECORDS = 1000` at `reading-history-provider.tsx:10`, enforced in
  `createRecord` (lines 122-125, slice after prepend). Not enforced in
  `updateCurrentRecord` (only mutates existing records — not an issue).
- No network/online-offline detection anywhere (`navigator.onLine`,
  `@capacitor/network`, `Network.` — zero code hits repo-wide). No
  Dexie/IndexedDB or async storage abstraction exists; a sync queue has
  nothing to build on and must be new.

### AI search (client + Cloud Function)

- Client call: `components/ai-search.tsx:55-59` — plain `fetch("/api/search",
  { method: "POST", headers: {"Content-Type": "application/json"}, body:
  JSON.stringify({ query }) })`. `firebase.json:5-9` rewrites hosting path
  `/api/search` to the `search` function (no direct `*.cloudfunctions.net`
  URL client-side).
- No existing auth/API-key/CORS restriction: `functions/src/index.ts:117-130`
  only checks HTTP method (405 guard, lines 127-130) and that `query` is a
  non-empty string (lines 135-138). `cors: true` (line 120) is permissive,
  not restrictive. No ID-token verification, no API key header check.
- End-to-end (`functions/src/index.ts:117-226`): request body `{query:
  string}` (line 133); builds a system prompt listing all 66 books (lines
  77-95); calls OpenAI `chat/completions` with `gpt-4o-mini` using the
  `OPENAI_API_KEY` secret (`defineSecret`, lines 1-5, 140, 151-163); parses
  and validates the model's JSON array response (lines 189-218); returns
  `{results: SearchResult[]}` (line 220); errors return `{error: string}`
  with 400/405/500/upstream status.
- `functions/package.json:17-23`: `firebase-admin: ^13.0.0`,
  `firebase-functions: ^6.3.0` already present — `admin.auth()` (ID-token
  verification) is available with **no new function dependency**.
- Function style: v2 SDK — `onRequest` from `"firebase-functions/v2/https"`
  (`functions/src/index.ts:1`), secret via `firebase-functions/params`
  `defineSecret` (lines 2, 5). Raw HTTP (`onRequest`), not `onCall`.
- No Firestore config anywhere: `firebase.json` has only `hosting` and
  `functions` keys, no `firestore` key; no `firestore.rules` /
  `firestore.indexes.json` files exist.
- No Firebase client SDK anywhere in the web app: zero matches for
  `firebase/app`, `initializeApp`, `getAuth`, `getFirestore`, `firebase/auth`
  repo-wide (excluding `functions/`). Root `package.json` has no `firebase`,
  `firebase-admin`, `@firebase/auth`, or `googleapis` dependency at all.
- `.firebaserc` still has the placeholder project id
  `"YOUR_FIREBASE_PROJECT_ID"` — no real Firebase project wired at the
  config level yet; this is a deploy-config concern the human/CI owns, not
  something the plan can "fix" in code.

### Providers, navigation, and UI structure

- Provider nesting today: `app/layout.tsx:75-83` — `ThemeProvider` (75) →
  `LanguageProvider` (81) → `SettingsProvider` (82) →
  `ReadingHistoryProvider` (83) → `{children}` (84); `PWAInstallPrompt` /
  `PWARegister` are siblings inside `LanguageProvider` (87-88). An
  `AuthProvider` needs `t` (translations) for copy, so it sits inside
  `LanguageProvider`, and should wrap `ReadingHistoryProvider` since reading
  history becomes auth-gated: `LanguageProvider → SettingsProvider →
  AuthProvider → ReadingHistoryProvider → {children}`.
- View/navigation state: plain `React.useState` in `app/page.tsx`, no
  router. `view: "books" | "chapters" | "reader"` (`page.tsx:21,34`); plus
  `selectedBook`, `selectedChapter`, `initialVerse`, `filter` (35-38).
  Transitions via handlers (`handleSelectBook` 78, `handleSelectChapter` 83,
  `handleNavigateFromSearch` 107, `handleBack` 117). State is only
  transiently persisted to `sessionStorage` under `NAV_STATE_KEY` for
  pull-to-refresh restore (lines 24, 44-76) — not general deep-linking.
  "Return to exactly where they wanted to go" after the OAuth redirect needs
  its own stash (e.g., `sessionStorage`: which gated action was requested,
  plus enough view state to resume it) saved before redirecting to Google
  and restored after sign-in completes.
- AI search overlay: self-contained in `components/ai-search.tsx`, internal
  `isExpanded` state (line 24), `handleExpand` (33-36) /`handleClose`
  (38-43). Parent renders it inside a `<div className="hidden">` wrapper
  (`page.tsx:188-190`) — it manages its own visibility/overlay rendering.
- Timeline sheet: shadcn `Sheet` with controlled `open` state
  (`timeline-sheet.tsx:32`), trigger rendered in header (`page.tsx:191`).
- `components/settings-sheet.tsx`: one `Sheet` (line 37) with sections
  stacked `space-y-8`: Language (51-68), Bible Version (71-101), Theme
  (104-126), Font Size (129-146), Preview (149-160), About (163-171,
  `border-t border-border pt-6`). An avatar/name/sign-out block fits as its
  own `space-y-3 border-t border-border pt-6` section, placed before "About"
  (164). Existing primitives: `Select*` (16-24), `Slider` (25), plain
  `Button` (8); no `Avatar` shadcn primitive exists yet — must be added
  (standard shadcn/ui copy-paste component, consistent with the project's
  existing `components/ui/` pattern).
- `lib/translations.ts`: `Language` union (line 1), `LanguageInfo` (3-7),
  `LANGUAGES` array of the 3 locales (9-13), one flat `Translations`
  interface (15-100+) with sections incl. Settings, Timeline, AI Search
  (87-93); per-language objects implement `Translations` and are consumed
  via `getTranslation(language)` (`components/language-provider.tsx:4,46`).
  New auth copy keys go into the interface plus the EN/PL/NO objects.
- Modal primitives already in `components/ui/`: `dialog.tsx`, `sheet.tsx`,
  `alert-dialog.tsx`, `drawer.tsx`. Both `SettingsSheet` and `TimelineSheet`
  use `Sheet` (slide-in panel, consistent mobile-first pattern). A
  "sign-in explanation" screen that *interrupts* an attempted action (AI
  search tap, timeline tap) reads more naturally as a `Dialog` (centered,
  blocking) — keeps the existing `Sheet` pattern reserved for
  settings/timeline browsing, not blocking gates. Recorded as a plan
  decision, not an open question.

### Firebase config, prior decisions, dependencies

- No prior auth/login/Firebase-client change exists in `context/changes/**`
  or `context/archive/**` other than this issue's own `change.md`
  (`context/changes/google-sign-in/change.md:1-148`), which echoes the issue
  verbatim and flags Backend/Auth as deferred pending architect
  confirmation via this issue's pattern.
- `context/foundation/tech-stack.md:52-53` — the only `## Open Stack
  Questions` entry is the unit/E2E test runner; nothing blocks an
  auth/Firestore decision.
- CLAUDE.md "Deferred Decisions": `Backend/Auth | TBD | When user accounts
  are implemented` — this issue is exactly that trigger.
- License rule (CLAUDE.md): MIT / Apache 2.0 / BSD / ISC only, free for
  non-commercial use. The `firebase` client SDK is Apache-2.0 — compatible.
- `functions/package.json` already has `firebase-admin` and
  `firebase-functions`; root `package.json` has neither `firebase` nor
  `dexie` despite CLAUDE.md listing Dexie as "Decided" (a doc/code gap —
  Dexie is not actually used anywhere; the reading-history store is plain
  `localStorage`). No `lib/firebase.ts` or any client init file exists.

## Code References

- `components/reading-history-provider.tsx:9,40,53,77,84-97,100-108,
  111-132,135-163,166-178,181-193,223,249-255`
- `lib/reading-history.ts:10-23,29-39,44-58,63-75`
- `components/timeline-sheet.tsx:30,32,34-36,44-49,94-113,146-201`
- `components/verse-reader.tsx:50-52,78-80,87,221,281-290`
- `components/ai-search.tsx:24,33-43,55-59`
- `functions/src/index.ts:1-5,77-95,117-226`
- `functions/package.json:17-23`
- `firebase.json:1-49` (hosting rewrite 5-9; only `hosting`/`functions` keys)
- `.firebaserc` (placeholder project id)
- `app/layout.tsx:75-90`
- `app/page.tsx:21,24,34-38,44-76,78,83,107,117,188-191`
- `components/settings-sheet.tsx:8,16-25,37,45-47,51-171`
- `lib/translations.ts:1-100+`
- `context/foundation/tech-stack.md:52-53`
- `context/changes/google-sign-in/change.md:1-148`

## Architecture Insights

- The app's offline-first pattern today is lightweight and ad hoc
  (`localStorage` + React context), not the Dexie-based architecture
  CLAUDE.md describes — the plan should build the account-sync queue as its
  own small mechanism (a `localStorage`-backed pending-queue is consistent
  with the existing pattern) rather than assume Dexie exists.
- View/navigation is local component state with no router; any "return to
  the feature" mechanism after an external OAuth redirect must be built as
  an explicit stash/restore around that state, not derived from a URL.
- All three new subsystems this change needs (Firebase client SDK + Auth,
  Firestore, Capacitor-less online/offline detection) are introduced from a
  clean slate — there is no existing partial implementation to reconcile
  with, which simplifies the design (no migration of an existing auth or
  sync mechanism) but means each needs its own first-time setup (Firebase
  config, security rules, a `use-online-status` hook using
  `navigator.onLine` + `window` events, since `@capacitor/network` does not
  apply to the web-only scope of this change).

## Historical Context (from prior changes)

- No prior change touched auth, Firestore, or sync. `context/changes/google-sign-in/change.md`
  is this issue's own freshly created identity file, not prior art.

## Related Research

- None — first research document for this change.

## Open Questions

- None block planning. The Dialog-vs-Sheet choice for the gate screen and
  the exact AuthProvider position relative to ReadingHistoryProvider are
  resolved above as plan decisions (Auto, grounded in the citations above),
  not left open for a human.
