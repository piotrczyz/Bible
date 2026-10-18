<!-- IMPL-FIX-REPORT -->
# Fix round 1 — context/changes/google-sign-in/reviews/impl-review-inc-1.md

**Round**: 1

## F1 — Sign-in/sign-out error messages are never translated — FIX

Added four translation keys (`signInNotConfigured`, `signInCancelled`,
`signInFailed`, `signOutFailed`) to `Translations` in `lib/translations.ts`,
filled for `en`, `pl` and `no` (same pattern as the existing `cancel`/
`errorTryAgain` keys). `components/auth-provider.tsx` now:
- imports `useLanguage` and reads `t` from it,
- the "not configured" guard in `signInWithGoogle` sets `t.signInNotConfigured`
  instead of the hardcoded English sentence,
- the `signInWithPopup` catch checks `err instanceof FirebaseError && err.code
  === "auth/popup-closed-by-user"` → `t.signInCancelled`, else →
  `t.signInFailed` (no more raw `err.message` surfaced to the user),
- the `signOut` catch sets `t.signOutFailed` instead of raw `err.message`.

This keeps AC-07 / the Phase 2 manual criterion ("cancelling the Google popup
leaves the user on the dialog with a visible message") satisfied while making
the message respect the active UI language, and removes the raw Firebase SDK
error strings the finding flagged.

No other findings in the report required a fix (F2 was `ACCEPT`).

## Verification (rs-core §11)

This project has no test framework configured (`context/foundation/tech-stack.md`
`## Testing`: "No test framework configured yet"), so there are no unit/e2e
tests to add or to prove red-before-green for; the fix is verified by
re-running the increment's Automated criteria, all of which passed the same
way the review recorded them:

- `pnpm typecheck` → clean exit, no output (tsc --noEmit).
- `pnpm lint` → `0 errors; 1 pre-existing unrelated warning in
  hooks/use-wake-lock.ts` (same warning the review already noted — unchanged
  by this fix).
- `pnpm build`, run with `NEXT_PUBLIC_FIREBASE_*` unset (same condition the
  review used to confirm the Phase 1 "no crash at import time" criterion) →
  compiled and prerendered successfully (`✓ Compiled successfully`, `✓
  Generating static pages using 15 workers (3/3)`).

Manual verification (code read, not run — no live Firebase project is
provisioned yet per Phase 1's own manual criterion): `AuthProvider` sits
inside `LanguageProvider` in `app/layout.tsx`'s provider nesting
(`LanguageProvider → SettingsProvider → AuthProvider → ReadingHistoryProvider`),
so `useLanguage()` is available wherever `AuthProvider` renders; `t` is a
plain object (`Translations`), so `t.signInCancelled` etc. resolve to a
string, never `undefined`, because the shared `Translations` interface makes
an incomplete language a type error (confirmed by the clean `pnpm typecheck`
above, which would fail if any of the 4 new keys were missing from `pl` or
`no`).
