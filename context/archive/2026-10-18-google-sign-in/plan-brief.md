# Google Sign-In — Plan Brief
Full plan: `context/changes/google-sign-in/plan.md` · research:
`context/changes/google-sign-in/research.md` · issue text: `change.md`

Research run (touches several modules and introduces Firebase client
auth/Firestore/offline-sync, none of which exist in the codebase yet —
see research.md). Framing skipped: the issue is already a spec-complete
rs-feature document (FRs, ACs, explicit scope/out-of-scope), so there is no
cause-vs-observation or scope ambiguity to resolve. Jev (`jev-decide.py`)
was unavailable (dry mode, no `OPENROUTER_API_KEY`); both calls returned
`unavailable`, so both decisions were made directly per rs-core §1.

## What & why

Stop anonymous use of the paid AI-search Cloud Function and start knowing
who uses the app, by adding optional Google sign-in. Reading history moves
to the signed-in account (synced across devices, queued offline); AI search
is rejected server-side for anyone not signed in. The rest of the app stays
exactly as it is today, including fully offline.

## Starting point

No Firebase client SDK, no Firestore, no auth, and no online/offline
detection exist anywhere in the repo (`functions/` only has
`firebase-admin`/`firebase-functions` server-side). Reading history is
`localStorage` behind `ReadingHistoryProvider`; AI search is an open,
unauthenticated Cloud Function. See `research.md` for full citations.

## Desired end state

Signed-out: everything works as today. Signed-in: reading history lives on
the account, syncs across devices and offline queues; AI search works and
its Cloud Function rejects anonymous calls; Settings shows avatar/name/Sign
out. Pre-existing local-only history is left untouched and invisible.

## Complexity

HIGH — three new subsystems from a clean slate (Firebase Auth, Firestore
with per-user security rules, an offline sync queue), a security-boundary
change to a public Cloud Function, and UI changes across three components
plus three-language copy. No existing partial implementation to reconcile
with, which simplifies design but means first-time setup for all three.

## Key decisions made

| Decision | Choice | Why | Source |
|---|---|---|---|
| Needs research? | Yes | New Firebase client/Firestore/sync subsystems not in the codebase; several modules touched | Auto (Jev unavailable) |
| Needs framing? | No | Issue is spec-complete (FRs/ACs/scope); no cause-vs-observation or scope ambiguity | Auto (Jev unavailable) |
| Areas → increments | A1 Auth core, A2 Reading-history sync (depends on A1), A3 AI-search gate (depends on A1, independent of A2) | Matches the orchestrator's own split; A2/A3 each wire their own gate trigger so they stay file-disjoint | Orchestrator |
| Auth provider & library | Firebase Auth, Google provider, `firebase` client SDK (Apache-2.0) | Issue's Technical notes name the Firebase/Google OAuth pattern explicitly; this is the trigger CLAUDE.md's "Backend/Auth: TBD" deferred row names | Issue |
| Sign-in interaction | `signInWithPopup`, not redirect | App has no router; all view state is in-memory (`app/page.tsx:21,34-38`) — popup needs no cross-navigation state stash to "return to exactly where they wanted to go" | Auto |
| Firestore data model | `users/{uid}/readingHistory/{recordId}` reusing the existing `ReadingRecord` shape | Shape already matches CLAUDE.md's Firebase-compatible design (`lib/reading-history.ts:10-23`) — no schema change needed | Auto |
| FR-010 (console shows signup/last-sign-in) | No extra code — Firebase Auth's built-in user metadata + Google profile fields already provide this | Firebase platform behavior | Auto |
| Firestore security | `request.auth.uid == uid` on `users/{uid}/**`, deny otherwise | NFR: history readable only by its owner | Auto |
| Offline queue | New small `localStorage`-backed pending queue, not Dexie | Nothing in the repo actually uses Dexie/IndexedDB despite CLAUDE.md's aspiration; matches the app's existing storage pattern | Auto / Research |
| Scope of the sync queue | Narrow (reading-history only, simple reconnect-triggered flush) — not CLAUDE.md's full generic Sync Engine (retry ladder, multi-entity queue) | That engine doesn't exist in code; building it is not what this issue asks for | Auto |
| Verse-tap "mark as read" UI | Left unchanged for everyone; only the Timeline view and its persistence backend are gated | FR-011 preserves reading as today; the tap/highlight is one code path with persistence today (`reading-history-provider.tsx:135-163`) and must be deliberately split | Auto |
| Legacy local history | Left on disk, never read/migrated/deleted | FR-009, AC-06 — gating the Timeline view is sufficient, no migration code needed | Auto |
| Gate screen UI | `Dialog` (blocking), not `Sheet` | Keeps `Sheet` reserved for the existing Settings/Timeline browsing pattern; a sign-in requirement reads as an interruption | Auto / Research |
| Avatar UI | Hand-rolled image+initials component, not `@radix-ui/react-avatar` | Avoids a new dependency for a purely decorative element | Auto |
| Settings sign-in entry point | None added inside Settings when signed out; sign-in is reached only via the two gated features | Issue's Scope section names exactly those two entry points | Issue |
| Cloud Function auth | `admin.auth().verifyIdToken()`, no new function dependency | `firebase-admin` is already a `functions/` dependency | Auto / Research |

No Consult rounds were needed: every decision had direct evidence from the
issue or the code.

## Scope

In: Google sign-in; the explanation gate for AI search and reading history;
Settings avatar/name/sign-out; account-backed reading history with offline
queuing and cross-device display; Cloud Function auth rejection. Out: see
plan.md `## What we're NOT doing` (iOS/Android, non-Google providers,
legacy-history migration, per-account rate limits, admin panel, in-app
account deletion, settings sync, the generic Sync Engine, Dexie).

## Architecture / Approach

See plan.md `## Implementation Approach`.

## Increments at a glance

| # | Delivers | Depends on | User-visible | Key risk |
|---|---|---|---|---|
| 1 | Firebase Auth core, sign-in gate, Settings account UI | — | yes | No real Firebase project exists yet (`.firebaserc` placeholder) — provisioning it is a Manual, architect-only step that blocks any live verification |
| 2 | Account-backed reading history, offline queue, Timeline gate | 1 | yes | Cross-device/offline ACs (AC-02, AC-03) can only be verified manually against a real project; no test runner exists to automate them |
| 3 | AI search Cloud Function auth gate + client token + trigger gate | 1 | yes | CORS `cors: true` must still accept the new `Authorization` header — flagged for manual verification in Phase 6 |

## Phases at a glance

| Phase | Increment | Delivers | Key risk |
|---|---|---|---|
| 1 | 1 | Firebase client init + `AuthProvider` | Build must not crash with Firebase env vars unset |
| 2 | 1 | `SignInGate` dialog + Settings account section + Avatar | Three-language copy forced complete by the shared `Translations` interface |
| 3 | 2 | Firestore rules + sync-queue utility | Rules must be deployed manually to verify |
| 4 | 2 | `ReadingHistoryProvider` dual backend | Must preserve signed-out behavior byte-for-byte |
| 5 | 2 | Gate the Timeline trigger | Must not touch `app/page.tsx` (shared with increment 3) |
| 6 | 3 | Cloud Function token verification | No OpenAI call must occur before verification succeeds |
| 7 | 3 | Client token + AI search trigger gate | Must not touch `app/page.tsx` (shared with increment 2) |

Prerequisites: none beyond what's in Phase 1 (Manual: real Firebase project
and `NEXT_PUBLIC_FIREBASE_*` secrets, provisioned by the architect).

## Open risks & assumptions

- No `decision-to-verify` guards were raised — every decision above had
  direct evidence.
- The real Firebase project does not exist yet (`.firebaserc` placeholder);
  every cross-device/offline/security-rule Manual criterion depends on the
  architect provisioning it and setting the `NEXT_PUBLIC_FIREBASE_*` /
  deploy secrets. This is called out as a Manual criterion in Phase 1 and
  carried as an assumption through every later phase's Manual criteria.
- No test runner exists (`tech-stack.md`'s only Open Stack Question); all
  automated success criteria are typecheck/build/lint, and acceptance
  criteria are verified manually against a real project.

## Success criteria (summary)

AC-01 (sign-in round trip into AI search), AC-02 (cross-device timeline),
AC-03 (offline queue flush), AC-04 (sign-out hides history), AC-05 (endpoint
rejects anonymous calls), AC-06 (legacy history stays hidden), AC-07
(cancel/fail stays on the gate) — mapped to Manual criteria per phase in
plan.md `## Progress`. FR-010 requires no new code (satisfied by Firebase
Auth's own console records).
