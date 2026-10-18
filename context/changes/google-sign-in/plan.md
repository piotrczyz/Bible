# Google Sign-In — Implementation Plan

## Overview

Add optional sign-in with Google (issue #34). The app stays fully usable,
including offline, without an account. Two features move behind sign-in:
reading history (now account-backed, with offline queuing and cross-device
sync) and AI-powered verse search (now rejected server-side for anonymous
requests). A shared auth core (Firebase Auth + a reusable sign-in explanation
screen + a Settings account section) is built once and reused by both gated
features.

## Current State Analysis

- Reading history is stored in plain `localStorage` behind
  `ReadingHistoryProvider`, not Dexie/IndexedDB despite CLAUDE.md's
  aspirational architecture (`components/reading-history-provider.tsx:9,53,77`).
  The `ReadingRecord` shape (`lib/reading-history.ts:10-23`) already matches
  CLAUDE.md's Firebase-compatible shape (`id`, `bookId`, `chapter`,
  `verses[]`, `versionId`, `timestamp`).
- A "reading" is recorded on verse tap in the reader
  (`components/verse-reader.tsx:78-80` → `toggleVerse`,
  `components/reading-history-provider.tsx:135-163`); the same tap also
  drives the "mark as read" visual highlight in the reader UI
  (`components/verse-reader.tsx:216-241`) — selection and persistence are
  currently one mechanism.
- The Timeline sheet renders from `useReadingHistory().records`
  (`components/timeline-sheet.tsx:30`), opened via its own `Sheet` +
  `SheetTrigger` (`timeline-sheet.tsx:32`), rendered in the header at
  `app/page.tsx:191`.
- AI search calls `/api/search` with a plain `fetch` POST
  (`components/ai-search.tsx:55-59`), rewritten by Firebase Hosting to the
  `search` Cloud Function (`firebase.json:5-9`). The function
  (`functions/src/index.ts:117-226`) has **no auth check at all** — only a
  method guard (405) and a non-empty `query` guard (400) before calling
  OpenAI. `firebase-admin` (`functions/package.json:17-23`) is already a
  dependency, so ID-token verification needs no new function dependency.
- There is **no Firebase client SDK, no Firestore config, and no
  online/offline detection** anywhere in the repo (confirmed by repo-wide
  grep). `.firebaserc` has a placeholder project id.
- `app/page.tsx` manages the visible screen with plain `React.useState`
  (`view`, `selectedBook`, `selectedChapter`, …, `page.tsx:21,34-38`), no
  router; only a `sessionStorage` stash exists, scoped to pull-to-refresh
  restore (`page.tsx:24,44-76`).
- Provider nesting today: `ThemeProvider → LanguageProvider →
  SettingsProvider → ReadingHistoryProvider` (`app/layout.tsx:75-83`).
- `components/settings-sheet.tsx` stacks sections `space-y-8` (Language,
  Bible Version, Theme, Font Size, Preview, About —
  `settings-sheet.tsx:51-171`); no `Avatar` primitive exists yet.
- `lib/translations.ts` defines one `Translations` interface that every
  per-language object (EN/PL/NO) must satisfy (`lib/translations.ts:1-100+`).
- CLAUDE.md lists `Backend/Auth: TBD — When user accounts are implemented`
  as a deferred decision; this issue's Technical notes name the Firebase +
  Google OAuth pattern explicitly, which this plan treats as that decision
  being made.
- No test runner is configured (`context/foundation/tech-stack.md`); its
  only `## Open Stack Questions` entry is the test runner, unrelated to
  this change.

## Desired End State

- A signed-out user reads the Bible exactly as today, online or offline
  (FR-011). Tapping AI search or the reading-history icon shows a dialog
  explaining sign-in is required, with a "Sign in with Google" button
  (FR-002). Completing sign-in returns the user to the feature they tapped,
  which now works (FR-003, AC-01).
- A signed-in user's readings write to their account; made offline, they
  queue on the device and reach the account once reconnected, with no user
  action (FR-005, FR-006, AC-02, AC-03). Signing in with the same account on
  another device shows the same timeline there (AC-02).
- Settings shows the signed-in user's avatar, name and a "Sign out" button
  (FR-007). After sign-out, the device's timeline is empty immediately,
  though the account's data is untouched; opening it shows the sign-in
  dialog again (FR-008, AC-04).
- Reading history recorded locally before this change is left on disk,
  never read, never migrated, never deleted (FR-009, AC-06).
- The AI search Cloud Function rejects any request without a valid Firebase
  ID token with no OpenAI call made (FR-004, AC-05).
- Cancelling or failing sign-in leaves the user on the explanation dialog
  with a message; nothing else breaks (AC-07).
- The Firebase console shows each account's name, e-mail, sign-up date and
  last sign-in date via Firebase Auth's own user records — no extra code
  needed (FR-010).

### Key discoveries

- `ReadingRecord` already matches the account-sync target shape —
  `lib/reading-history.ts:10-23`.
- Verse-tap "mark as read" and reading-history persistence are the same
  code path today — `reading-history-provider.tsx:135-163` — so they must
  be deliberately separated: the tap/highlight UI stays for everyone
  (FR-011), only the persistence backend and the Timeline *view* are gated.
- `firebase-admin` is already a function dependency — `admin.auth()` needs
  no new package — `functions/package.json:17-23`.
- No router exists; all view state is in-memory
  (`app/page.tsx:21,34-38`) — a redirect-based sign-in would need a fragile
  state stash, while a popup-based sign-in keeps the page mounted and needs
  none.
- Neither `timeline-sheet.tsx` nor `ai-search.tsx` trigger logic lives in
  `app/page.tsx` (both manage their own open/expand state), so gating each
  one touches only that component, keeping the AI-search and reading-history
  increments file-disjoint.

## What we're NOT doing

- iOS/Android sign-in (Capacitor not initialized; web only).
- Apple or e-mail/password sign-in — Google only.
- Migrating or deleting pre-existing local-only reading history.
- A per-account AI-search rate limit.
- An in-app admin/user-list panel (the Firebase console is enough).
- In-app account deletion (tracked as the issue's open question #1).
- Syncing settings (theme, font size, version, language) to the account.
- Building CLAUDE.md's full generic multi-store Sync Engine (retry ladder,
  `syncQueue`/`syncMetadata` stores, conflict resolution across entity
  types) — that is future, aspirational architecture; this plan builds only
  the narrow reading-history queue this issue asks for.
- Adopting Dexie/IndexedDB — nothing in the current code uses it even
  though CLAUDE.md describes it; introducing it is a separate decision.
- Provisioning the real Firebase project / OAuth consent screen / web
  config secrets — ops work for the architect, called out as a Manual
  criterion below, not something an implementer can do from the repo.

## Implementation Approach

Firebase Auth (Google provider) via `signInWithPopup`, not
`signInWithRedirect`: the app has no router and all navigation state is
in-memory (`app/page.tsx`), so a popup — which never navigates the page away
— lets "return to exactly where they wanted to go" be a plain in-memory
callback instead of a cross-navigation state stash. A small shared
`AuthProvider` (auth state, sign-in, sign-out) and a reusable `SignInGate`
dialog are built once in increment 1 and consumed, not modified, by
increments 2 and 3 — each wires the gate to its own trigger (Timeline,
AI search) so the two stay file-disjoint and can ship in parallel once
increment 1 lands.

Reading history keeps its existing local-only code path untouched for
signed-out users (preserving FR-011 to the letter and automatically
satisfying FR-009 — the legacy `localStorage` array is simply never read
again). For signed-in users, `ReadingHistoryProvider` gains a second,
Firestore-backed path: writes go to `users/{uid}/readingHistory/{recordId}`
(same id, same shape as today's `ReadingRecord`) when online, or to a new
small `localStorage`-backed pending queue when offline, flushed on the
browser's `online` event; reads come from a live Firestore listener. This
is deliberately narrower than CLAUDE.md's generic future Sync Engine
(single entity type, simple reconnect-triggered flush, no retry ladder) —
building the general engine is not what this issue asks for.

The AI-search Cloud Function gains one check, using the `firebase-admin`
dependency already present: verify the `Authorization: Bearer <idToken>`
header with `admin.auth().verifyIdToken()` before building the OpenAI
prompt; missing or invalid token → `401` with no OpenAI call. The client
attaches the current user's ID token to its existing `fetch` call.

## Increments

| # | Name | Phases | Depends on | User-visible | Status | PR |
|---|---|---|---|---|---|---|
| 1 | Google Sign-In & Auth Core | 1-2 | — | yes | pending | — |
| 2 | Reading History Account Sync | 3-5 | 1 | yes | pending | — |
| 3 | AI Search Sign-In Gate | 6-7 | 1 | yes | pending | — |

Increments 2 and 3 do not depend on each other and touch disjoint files
(reading-history / Timeline vs. AI search / the Cloud Function); both may
run in parallel once increment 1 is merged.

## Phase 1: Firebase client SDK and auth core

### Overview
Introduce the Firebase client SDK, a safe-to-build-without-config
initializer, and an `AuthProvider` exposing Google sign-in/sign-out — the
foundation every later phase consumes.

### Required changes

#### 1. Firebase client init
- **File**: `lib/firebase.ts` (new)
- **Goal**: One place that calls `initializeApp` (guarded with
  `getApps().length` so Fast Refresh/SSR doesn't double-init) from
  `NEXT_PUBLIC_FIREBASE_*` env vars, and exports `auth` (`getAuth`) and `db`
  (`getFirestore`). Reading the Bible must keep working even when these env
  vars are unset (no real Firebase project exists yet per `.firebaserc`) —
  guard initialization so a missing config logs a warning instead of
  throwing at import time.
- **Contract**: `export const auth: Auth`, `export const db: Firestore`,
  `export const googleProvider: GoogleAuthProvider`.

#### 2. Auth context
- **File**: `components/auth-provider.tsx` (new)
- **Goal**: Track the signed-in user via `onAuthStateChanged`; expose
  `signInWithGoogle()` (uses `signInWithPopup(auth, googleProvider)`, catches
  and surfaces `error` instead of throwing, e.g. on
  `auth/popup-closed-by-user`) and `signOutUser()`.
- **Contract**: `useAuth(): { user: { uid, displayName, email, photoURL } |
  null; loading: boolean; error: string | null; signInWithGoogle(): Promise<void>;
  signOutUser(): Promise<void> }`.

#### 3. Provider wiring
- **File**: `app/layout.tsx`
- **Goal**: Add `AuthProvider` to the nesting, inside `LanguageProvider`
  (needs translated copy) and wrapping `ReadingHistoryProvider` (which will
  read auth state in increment 2).
- **Contract**: `LanguageProvider → SettingsProvider → AuthProvider →
  ReadingHistoryProvider → {children}`.

#### 4. Dependency and docs
- **File**: `package.json`, `CLAUDE.md`
- **Goal**: Add `firebase` (Apache-2.0) to root dependencies. Document the
  new `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`,
  `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_APP_ID` env vars
  in CLAUDE.md's Environment Variables table, and move `Backend/Auth` out of
  "Deferred Decisions" into the Decision Log as "Firebase Auth (Google) —
  decided by issue #34".
- **Contract**: n/a (doc + manifest only).

### Success criteria
#### Automated
- `pnpm install` resolves with `firebase` added; `pnpm typecheck` passes.
- `pnpm build` succeeds with `NEXT_PUBLIC_FIREBASE_*` env vars unset (no
  crash at import time).
- `pnpm lint` passes.
#### Manual
- The architect provisions a real Firebase project (Google OAuth consent
  screen, web app config, Firestore enabled) and sets the
  `NEXT_PUBLIC_FIREBASE_*` secrets for preview/production — this plan
  cannot do this from the repo.

## Phase 2: Sign-in explanation gate and Settings account UI

### Overview
Build the reusable "you need to sign in" dialog both gated features will
use, and the Settings account section (FR-007).

### Required changes

#### 1. Sign-in gate component
- **File**: `components/sign-in-gate.tsx` (new)
- **Goal**: A `Dialog`-based (not `Sheet`, to read as a blocking
  interruption rather than auxiliary browsing chrome, unlike
  `SettingsSheet`/`TimelineSheet`) explanation screen with copy + a "Sign in
  with Google" button; shows `useAuth().error` inline on cancel/failure
  (AC-07) and keeps the dialog open.
- **Contract**: `<SignInGate open: boolean; onOpenChange(open): void;
  onSignedIn(): void; featureLabel: string />`. On successful sign-in it
  calls `onSignedIn()` then closes itself. Consumers own their own `open`
  boolean and call it instead of their normal "open feature" action whenever
  `useAuth().user` is `null`.

#### 2. Settings account section
- **File**: `components/settings-sheet.tsx`
- **Goal**: A new `space-y-3 border-t border-border pt-6` section, placed
  before "About", shown only when `useAuth().user` is set: avatar (small
  image with initials fallback — no new Radix dependency for a purely
  decorative element), display name, and a "Sign out" `Button` calling
  `signOutUser()`. Nothing is added to Settings when signed out (sign-in is
  reached only via the two gated features, per the issue's scope).
- **Contract**: n/a (presentational; reads `useAuth()`).

#### 3. Avatar primitive
- **File**: `components/ui/avatar.tsx` (new)
- **Goal**: Minimal `<Avatar src? name>` — renders the image when `src` is
  set, else the name's initials in a circular badge, matching the existing
  shadcn/ui visual style (no new npm dependency).
- **Contract**: `<Avatar src?: string; name: string; className?: string />`.

#### 4. Copy
- **File**: `lib/translations.ts`
- **Goal**: Add sign-in/sign-out/explanation keys to the `Translations`
  interface and fill them in the EN, PL and NO objects (the interface is
  shared by all three, so the build fails if any language is left
  incomplete — this makes the issue's "may ship English only" accepted gap
  moot in practice).
- **Contract**: new keys, e.g. `signInWithGoogle`, `signInExplanationTitle`,
  `signInExplanationBody`, `signOut`, `cancel`.

### Success criteria
#### Automated
- `pnpm typecheck`, `pnpm build`, `pnpm lint` pass.
#### Manual
- Signed-out: Settings shows no account section. After a real Google
  sign-in, Settings shows avatar, name and "Sign out"; clicking it returns
  Settings to the signed-out state (FR-007, FR-008).
- Cancelling the Google popup leaves the user on the dialog with a visible
  message, and the rest of the app (reading, settings) keeps working
  (AC-07).

## Phase 3: Firestore schema, security rules, and sync queue

### Overview
Add the Firestore collection, its security rules, and a small offline
pending-write queue — no UI wiring yet.

### Required changes

#### 1. Security rules
- **File**: `firestore.rules` (new), `firebase.json`
- **Goal**: `users/{uid}/readingHistory/{recordId}` (and the `users/{uid}`
  profile doc, if used) readable/writable only by `request.auth.uid == uid`;
  deny everything else by default. Register the rules file in
  `firebase.json`.
- **Contract**: `firebase.json` gains a `"firestore": {"rules":
  "firestore.rules"}` entry.

#### 2. Firestore mapping helpers
- **File**: `lib/reading-history.ts`
- **Goal**: Add `toFirestoreDoc(record: ReadingRecord)` /
  `fromFirestoreDoc(doc)` reusing the existing `ReadingRecord` shape
  (`lib/reading-history.ts:10-23`) — no shape change, just (de)serialization
  at the Firestore boundary.
- **Contract**: `toFirestoreDoc(record): Record<string, unknown>`,
  `fromFirestoreDoc(id, data): ReadingRecord`.

#### 3. Offline pending queue
- **File**: `lib/reading-sync-queue.ts` (new)
- **Goal**: A `localStorage`-backed queue of pending writes
  (`upsert`/`delete`/`clear`), mirroring the app's existing storage pattern
  (no Dexie). Not tied to Firestore directly — the provider (phase 4) drains
  it.
- **Contract**: `enqueue(op: PendingOp): void`, `listPending():
  PendingOp[]`, `removePending(ids: string[]): void`, where `PendingOp =
  { id: string; type: "upsert" | "delete" | "clear"; record?: ReadingRecord;
  recordId?: string }`.

### Success criteria
#### Automated
- `pnpm typecheck`, `pnpm build`, `pnpm lint` pass.
#### Manual
- The architect deploys `firestore.rules` to the real project and confirms
  in the Firebase console that a non-owner read/write to another uid's
  `readingHistory` is denied.

## Phase 4: Account-backed reading history provider

### Overview
Branch `ReadingHistoryProvider`'s storage backend on auth state: unchanged
local behavior when signed out, Firestore + the phase-3 queue when signed
in.

### Required changes

#### 1. Provider refactor
- **File**: `components/reading-history-provider.tsx`
- **Goal**: Read `useAuth()`. When `user` is `null`, behavior is byte-for-byte
  what it is today (local `localStorage`, same key, same `MAX_RECORDS`
  cap) — this is what makes FR-011 and FR-009 hold without extra code. When
  `user` is set: subscribe to `users/{uid}/readingHistory` ordered by
  `timestamp` desc, limited to 1000, via `onSnapshot`, merging in any
  not-yet-flushed queued records for optimistic UI; `createRecord` /
  `updateCurrentRecord` / `deleteRecord` / `clearHistory` write to Firestore
  when `navigator.onLine`, else call `enqueue()` (phase 3) and update local
  state optimistically regardless of connectivity. On sign-out, clear
  `records` from memory immediately (before any Firestore unsubscribe
  settles) so the Timeline is empty on the next read, per AC-04. The
  verse-tap "mark as read" selection state (`selectedVerses`) and its
  derivation of create-vs-update stay exactly as today — only the
  persistence call swaps backend.
- **Contract**: `useReadingHistory()`'s public shape is unchanged; no
  consumer (`verse-reader.tsx`, `timeline-sheet.tsx`) needs to change for
  this phase.

#### 2. Queue flush
- **File**: `components/reading-history-provider.tsx`
- **Goal**: On `window.addEventListener("online", …)` and once right after
  sign-in, drain `listPending()` (phase 3) to Firestore in order, calling
  `removePending()` per success; leave failed items queued for the next
  trigger.
- **Contract**: internal; no new exported API.

### Success criteria
#### Automated
- `pnpm typecheck`, `pnpm build`, `pnpm lint` pass.
#### Manual
- AC-02: signing in with the same Google account on a second
  browser/profile shows device A's readings in device B's timeline.
- AC-03: with the network disabled, tapping verses as a signed-in user, then
  reconnecting, makes those readings appear in Firestore and the timeline
  with no further user action.
- AC-04: signing out empties the on-device timeline immediately; signing
  back in restores the same account history.

## Phase 5: Gate the Timeline trigger

### Overview
Wire the Timeline's own open trigger through the phase-2 `SignInGate`.

### Required changes

#### 1. Timeline gating
- **File**: `components/timeline-sheet.tsx`
- **Goal**: When `useAuth().user` is `null`, tapping the trigger opens
  `SignInGate` (`featureLabel` = the translated "Reading history" string)
  instead of the `Sheet`; `onSignedIn` opens the `Sheet` as the original tap
  intended. When signed in, behavior is unchanged from today.
- **Contract**: internal component state only; no change to
  `components/timeline-sheet.tsx`'s external props.

### Success criteria
#### Automated
- `pnpm typecheck`, `pnpm build`, `pnpm lint` pass.
#### Manual
- FR-002/AC-01 (reading-history half): a signed-out tap on the
  reading-history icon shows the explanation dialog, not the timeline;
  completing sign-in opens the timeline directly.
- AC-06: a browser profile with pre-existing local-only history (written
  before this change) shows an empty account timeline after sign-in, and
  the old `localStorage` key is still present and untouched in DevTools.

## Phase 6: Cloud Function auth gate

### Overview
Reject AI-search requests without a valid Firebase ID token, before any
OpenAI call.

### Required changes

#### 1. Token verification
- **File**: `functions/src/index.ts`
- **Goal**: Ensure the Admin SDK is initialized (`admin.initializeApp()`,
  guarded against double-init); read the `Authorization: Bearer <idToken>`
  header; verify it with `admin.auth().verifyIdToken(idToken)` before the
  existing method/query-shape guards build the OpenAI prompt (lines
  117-226 today). Missing header, malformed header, or a token that fails
  verification → respond `401 {"error": "Unauthorized"}` and return without
  calling OpenAI.
- **Contract**: no change to the success response shape
  (`{results: SearchResult[]}`); new failure case `401 {"error":
  "Unauthorized"}` alongside the existing 400/405/500 cases.

### Success criteria
#### Automated
- `npm run build` (or the functions project's typecheck) passes inside
  `functions/`.
#### Manual
- AC-05: a request to `/api/search` with no `Authorization` header, or an
  invalid token, returns 401 and no OpenAI call is made (verified via the
  function's logs/emulator or a deployed preview).

## Phase 7: Client sends the ID token and gates the AI search trigger

### Overview
Attach the signed-in user's ID token to the existing search request, and
gate the AI search trigger the same way the Timeline was gated in phase 5.

### Required changes

#### 1. AI search gating and token
- **File**: `components/ai-search.tsx`
- **Goal**: When `useAuth().user` is `null`, the trigger that calls
  `handleExpand` opens `SignInGate` instead (`featureLabel` = the
  translated "AI search" string); `onSignedIn` calls `handleExpand()` so
  the user lands in AI search exactly as AC-01 describes. When signed in,
  `getIdToken()` is attached as `Authorization: Bearer <token>` on the
  existing `fetch("/api/search", …)` call (`ai-search.tsx:55-59`).
- **Contract**: `/api/search` request gains an `Authorization` header;
  request body is unchanged.

### Success criteria
#### Automated
- `pnpm typecheck`, `pnpm build`, `pnpm lint` pass.
#### Manual
- AC-01: a signed-out tap on AI search shows the explanation dialog;
  completing Google sign-in lands back in AI search and a search returns
  results.

## Testing Strategy

No unit/E2E runner is configured (`context/foundation/tech-stack.md`'s only
open stack question); this plan does not add one. Every phase's Automated
criteria are `pnpm`/`npm` typecheck, build and lint. Behavioral
verification against the acceptance criteria (sign-in round trip,
cross-device sync, offline queue, sign-out, token rejection) is Manual,
exercised against a real Firebase project the architect provisions
(Phase 1 Manual criterion).

## Migration Notes

No data migration. Pre-existing local `localStorage` reading-history
records are never read, moved, or deleted by this change (FR-009); every
account's Firestore history starts empty regardless of what is on the
device (AC-06). No rollback is needed because nothing destructive happens
to existing data.

## References

- `context/changes/google-sign-in/change.md` — issue #34 verbatim (FRs,
  ACs, scope, open questions).
- `context/changes/google-sign-in/research.md` — code citations grounding
  this plan.
- `components/reading-history-provider.tsx`, `lib/reading-history.ts`,
  `components/timeline-sheet.tsx`, `components/verse-reader.tsx`,
  `components/ai-search.tsx`, `functions/src/index.ts`,
  `functions/package.json`, `firebase.json`, `.firebaserc`,
  `app/layout.tsx`, `app/page.tsx`, `components/settings-sheet.tsx`,
  `lib/translations.ts`.

## Progress

### Phase 1: Firebase client SDK and auth core
#### Automated
- [ ] 1.1 `pnpm typecheck` passes with `firebase` added as a dependency
- [ ] 1.2 `pnpm build` succeeds with `NEXT_PUBLIC_FIREBASE_*` env vars unset
- [ ] 1.3 `pnpm lint` passes
#### Manual
- [ ] 1.4 Architect provisions the real Firebase project and sets the `NEXT_PUBLIC_FIREBASE_*` secrets

### Phase 2: Sign-in explanation gate and Settings account UI
#### Automated
- [ ] 2.1 `pnpm typecheck` passes
- [ ] 2.2 `pnpm build` passes
- [ ] 2.3 `pnpm lint` passes
#### Manual
- [ ] 2.4 Settings shows no account section signed-out, and avatar/name/Sign out signed-in; Sign out returns to signed-out state
- [ ] 2.5 Cancelling the Google popup leaves the user on the dialog with a message and the rest of the app keeps working

### Phase 3: Firestore schema, security rules, and sync queue
#### Automated
- [ ] 3.1 `pnpm typecheck` passes
- [ ] 3.2 `pnpm build` passes
- [ ] 3.3 `pnpm lint` passes
#### Manual
- [ ] 3.4 Deployed `firestore.rules` deny a non-owner read/write to another uid's `readingHistory`

### Phase 4: Account-backed reading history provider
#### Automated
- [ ] 4.1 `pnpm typecheck` passes
- [ ] 4.2 `pnpm build` passes
- [ ] 4.3 `pnpm lint` passes
#### Manual
- [ ] 4.4 Signing in with the same account on a second device/profile shows device A's readings
- [ ] 4.5 Readings made offline while signed in appear in the account timeline after reconnecting, with no user action
- [ ] 4.6 Signing out empties the on-device timeline immediately; signing back in restores the same history

### Phase 5: Gate the Timeline trigger
#### Automated
- [ ] 5.1 `pnpm typecheck` passes
- [ ] 5.2 `pnpm build` passes
- [ ] 5.3 `pnpm lint` passes
#### Manual
- [ ] 5.4 A signed-out tap on the reading-history icon shows the explanation dialog; sign-in opens the timeline directly
- [ ] 5.5 A profile with pre-existing local-only history shows an empty account timeline after sign-in, and the old `localStorage` key is untouched

### Phase 6: Cloud Function auth gate
#### Automated
- [ ] 6.1 The functions project's build/typecheck passes
#### Manual
- [ ] 6.2 A request to `/api/search` with no or an invalid `Authorization` header returns 401 and makes no OpenAI call

### Phase 7: Client sends the ID token and gates the AI search trigger
#### Automated
- [ ] 7.1 `pnpm typecheck` passes
- [ ] 7.2 `pnpm build` passes
- [ ] 7.3 `pnpm lint` passes
#### Manual
- [ ] 7.4 A signed-out tap on AI search shows the explanation dialog; sign-in lands back in AI search and a search returns results
