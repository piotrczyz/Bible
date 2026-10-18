<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Google Sign-In — Reading History Account Sync

**Plan**: context/changes/google-sign-in/plan.md   **Scope**: Increment 2 (phases 3-5)   **Date**: 2026-10-18
**Round**: 1   **Verdict**: NEEDS_ATTENTION   **Findings**: 2

## Verdicts
| Dimension | Verdict |
|---|---|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Scope & diff classification

Phases 3-5 planned files vs. the branch diff (`origin/main...HEAD`), code only:

| File | Plan | Diff | Classification |
|---|---|---|---|
| `firestore.rules` (new) | yes | yes | in plan AND diff |
| `firebase.json` | yes | yes | in plan AND diff |
| `lib/reading-history.ts` (`toFirestoreDoc`/`fromFirestoreDoc`) | yes | yes | in plan AND diff |
| `lib/reading-sync-queue.ts` (new) | yes | yes | in plan AND diff |
| `components/reading-history-provider.tsx` | yes | yes | in plan AND diff |
| `components/timeline-sheet.tsx` | yes | yes | in plan AND diff |

No files outside this list were touched; nothing planned is missing. No
out-of-plan-files guard needed.

## Adaptation judged

Plan phase 4 specified: direct Firestore write when `navigator.onLine`,
queue-and-flush only when offline. The implementer instead built one path:
every mutation is enqueued to `lib/reading-sync-queue.ts` and an immediate
flush is attempted regardless of connectivity (`reading-history-provider.tsx:160-182`).

Judged: **ACCEPT**. When online, `flushPending()` runs synchronously after
`enqueue()` within the same tick, so the user-observable latency and end
state are indistinguishable from a direct write; when offline it behaves
exactly as planned (stays queued until the `online` listener or the next
sign-in drains it, `reading-history-provider.tsx:219-226`). The merge logic
(`remoteMergedRecords`, lines 230-258) already has to reconcile queued ops
against the live snapshot either way, so collapsing two code paths into one
is a reasonable simplification, not a behavior change for any of AC-02/
AC-03/AC-04. It does not introduce F1 below — that gap exists in the
planned design too, since the plan never scoped the queue to the signed-in
account (see F1).

## Findings

### F1 — Offline sync queue is not scoped to the signed-in account; a second account on the same device can inherit the first account's queued reading records
- **Severity**: WARNING
- **Impact**: MEDIUM
- **Dimension**: Safety & Quality
- **Location**: `lib/reading-sync-queue.ts:13` (single global `QUEUE_STORAGE_KEY`, no owner field on `PendingOp`), `components/reading-history-provider.tsx:117-154,187-197` (`flushPending`/`refreshPendingOps` act on `listPending()` with no check that a queued op belongs to the current `uid`)
- **Detail**: `PendingOp` carries no owner id and `bible-reading-sync-queue` is one `localStorage` key shared by every account that ever signs in on that browser. Scenario: user A is signed in, goes offline, taps verses (ops enqueued), then signs out before reconnecting — `signOutUser()` (`components/auth-provider.tsx:78-88`) does not touch the queue, and the sign-out effect in the provider only clears in-memory `pendingOps`/`remoteRecords`, never the `localStorage` queue (`reading-history-provider.tsx:187-193`). If user B now signs in on the same browser (a shared/family device — a realistic case for this app), the `uid` effect fires `refreshPendingOps()` + `flushPending()` unconditionally for the new `uid`, and `flushPending` writes every still-queued op (user A's reading records) to `users/{B's uid}/readingHistory/...` (`reading-history-provider.tsx:195-197,121-154`). User A's reading activity is now permanently attributed to user B's account; there's no sign the record ever belonged to someone else. This isn't caught by the Firestore security rules (those correctly restrict reads/writes to `request.auth.uid == uid` — the write is legitimately made by B's authenticated session against B's own path) and isn't an acceptance criterion scenario, but it contradicts FR-005 ("readings are stored on their account") and the NFR that a user's history belongs to their own account.
- **Fix**: scope the queue to the signed-in account — either key `localStorage` per uid (`bible-reading-sync-queue:${uid}`) so a different account's sign-in never sees another account's pending ops, or add an `ownerUid` field to `PendingOp` and have `listPending()`/`flushPending()` filter to the current `uid`, dropping (not flushing) entries whose owner doesn't match.
- **Decision**: FIX — conservative, well-scoped change; no architecture or contract impact.

### F2 — `timeline-sheet.tsx`'s `Sheet` JSX is left under-indented after being wrapped in a `Fragment`
- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Pattern Consistency
- **Location**: `components/timeline-sheet.tsx:78-153` (diff hunk wrapping `<Sheet>…</Sheet>` in `<>…</>`)
- **Detail**: The new `<SignInGate>` sibling required wrapping the return value in a `Fragment`, but the `Sheet`'s existing children keep their original indentation level instead of being reindented one level in. Purely cosmetic — `pnpm lint` (ESLint, no Prettier formatting rule configured in this repo) passes clean.
- **Fix**: n/a — cosmetic only.
- **Decision**: DISMISS — no functional effect, no enforced formatting rule in this repo to violate.

## Success criteria verification

### Automated (phases 3-5)
| # | Criterion | Command | Result |
|---|---|---|---|
| 3.1/4.1/5.1 | `pnpm typecheck` passes | `pnpm typecheck` | PASS — `tsc --noEmit`, no errors |
| 3.2/4.2/5.2 | `pnpm build` passes | `pnpm build` | PASS — Next.js production build succeeded (Firebase env vars unset, no crash at import time) |
| 3.3/4.3/5.3 | `pnpm lint` passes | `pnpm lint` | PASS — 0 errors, 1 pre-existing warning in `hooks/use-wake-lock.ts` unrelated to this diff |

### Manual (all remain pending — no live Firebase project exists yet; `.firebaserc` is still a placeholder, per Phase 1's own Manual criterion)
- [ ] 3.4 Deployed `firestore.rules` deny a non-owner read/write — rules text read and is logically correct (`request.auth.uid == uid` scoping on `users/{uid}` and its `readingHistory` subcollection, deny-all fallback); cannot be exercised without a deployed project.
- [ ] 4.4 Cross-device timeline sync — code path (`onSnapshot` on `users/{uid}/readingHistory`) is present and consistent with the design; needs a real project + two sessions to confirm.
- [ ] 4.5 Offline queue flush on reconnect — code path present (`online` listener + post-sign-in flush); needs a real project to confirm end-to-end.
- [ ] 4.6 Sign-out empties the device timeline immediately, sign-in restores it — diff evidence supports this (the `uid` effect zeroes `remoteRecords`/`pendingOps` synchronously on sign-out, `records` falls back to `localRecords`, which is never the signed-in account's data); still needs an eyeball check on the preview.
- [ ] 5.4 Signed-out tap on the reading-history icon shows the explanation dialog; sign-in opens the timeline — diff evidence supports this (`handleOpenChange` in `timeline-sheet.tsx` routes to `SignInGate` when `!user`, `onSignedIn` opens the sheet); still needs an eyeball check.
- [ ] 5.5 A profile with pre-existing local-only history shows an empty account timeline after sign-in, old `localStorage` key untouched — diff evidence supports this (the legacy `STORAGE_KEY` path is read once at mount but never rendered or written to while `uid` is set); still needs an eyeball check.

No `- [x]` manual row claims verification without diff evidence (no "blind signing" found).

## Notes

- No `context/architecture/model.c4` exists in this repo, so the Architecture
  boundary gate (rs-arch-audit) does not apply; marked PASS by default.
- This is not a bug-mode change (`plan.md` carries no `**Mode**: bug`
  marker), so the regression-test gate does not apply.
- Increment 1's auth core (`auth-provider.tsx`, `sign-in-gate.tsx`) is
  unchanged by this diff and out of this review's scope; it is only read
  here as context for F1.
