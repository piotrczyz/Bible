<!-- IMPL-FIX-REPORT -->
# Fix round 1 — context/changes/google-sign-in/reviews/impl-review-inc-2.md

**Round**: 1

## F1 — Offline sync queue is not scoped to the signed-in account — FIX

`lib/reading-sync-queue.ts` namespaced the `localStorage` queue per signed-in
account instead of one global key shared by every account that ever signs in
on the browser:

- `QUEUE_STORAGE_KEY` → `QUEUE_STORAGE_KEY_PREFIX`; a new `storageKeyFor(uid)`
  helper returns `` `${QUEUE_STORAGE_KEY_PREFIX}:${uid}` ``.
- `enqueue`, `listPending`, `removePending` now take `uid: string` as their
  first argument and read/write that account's key only.

`components/reading-history-provider.tsx` passes `uid` through at every call
site:

- `refreshPendingOps` reads `listPending(uid)` (or clears to `[]` when
  signed out) and is keyed on `uid` as a `useCallback` dependency.
- `flushPending` reads/removes against `listPending(uid)` /
  `removePending(uid, …)`.
- `persistUpsert`/`persistDelete`/`persistClear` call `enqueue(uid, …)` and
  guard with `if (!uid) return` — defensive, since every existing call site
  already checks `uid` first, but it keeps the queue correctly scoped if
  that ever changes and lets TypeScript narrow `uid` from `string | null`.

With this, user A's offline-queued writes live at
`bible-reading-sync-queue:<A's uid>`. If A signs out before reconnecting and
B signs in on the same browser, `refreshPendingOps()`/`flushPending()` for
B's `uid` only ever touch `bible-reading-sync-queue:<B's uid>` — A's queued
ops are never read, flushed, or exposed to B. They stay queued under A's own
key until A signs back in on that same browser, exactly like the rest of the
account-scoped data (Firestore `users/{uid}/readingHistory`) already behaves.

No other findings in the report required a fix (F2 was `DISMISS`, cosmetic
only).

## Verification (rs-core §11)

This project has no test framework configured
(`context/foundation/tech-stack.md` `## Testing`: "No test framework
configured yet"), so there are no unit/e2e tests to add or to prove
red-before-green for; the fix is verified by re-running the increment's
Automated criteria (phases 3-5), all passing the same way the review
recorded them:

- `pnpm typecheck` → clean exit, no output (`tsc --noEmit`).
- `pnpm lint` → `eslint .` → 0 errors, 1 pre-existing warning in
  `hooks/use-wake-lock.ts` (same warning the review already noted, unrelated
  to this diff, unchanged by this fix).
- `pnpm build` → `next build` compiled and prerendered successfully
  (`✓ Compiled successfully`, `✓ Generating static pages using 15 workers
  (3/3)`), run with `NEXT_PUBLIC_FIREBASE_*` unset (same condition the
  review used to confirm the Phase 1 "no crash at import time" criterion).

No other file in the repo calls `enqueue`/`listPending`/`removePending`
besides `components/reading-history-provider.tsx` (checked via grep), so the
signature change has no other call sites to update and the clean typecheck
above is a complete check of the new `uid` parameter being threaded
correctly everywhere it is used.

Manual verification (code read, not run — no live Firebase project is
provisioned yet per Phase 1's own manual criterion, unchanged by this fix):
re-read `reading-history-provider.tsx:117-197` end to end — every
`listPending`/`enqueue`/`removePending` call now passes the `uid` already in
scope from `useAuth()`, and the sign-out branch of the subscribe effect
(`!uid` → `setPendingOps([])`) only clears in-memory state, never the
`localStorage` queue, so a signed-out device still has A's queue sitting
under A's own key, unreachable by any other account.
