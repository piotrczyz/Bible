<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Google Sign-In — Implementation Plan

**Plan**: context/changes/google-sign-in/plan.md   **Scope**: Increment 1 (Phases 1-2)   **Date**: 2026-10-18
**Round**: 1   **Verdict**: APPROVED   **Findings**: 2

## Verdicts
| Dimension | Verdict |
|---|---|
| Plan Adherence | WARNING |
| Scope Discipline | PASS |
| Safety & Quality | WARNING |
| Architecture | PASS (no `context/architecture/` model exists; not applicable) |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Sign-in/sign-out error messages are never translated
- **Severity**: WARNING
- **Impact**: LOW
- **Dimension**: Safety & Quality
- **Location**: `components/auth-provider.tsx:48-53,62-67` (raw `err.message` / hardcoded English fallbacks `"Sign-in failed. Please try again."`, `"Sign-out failed. Please try again."`, `"Sign-in is not configured yet."`), surfaced verbatim by `components/sign-in-gate.tsx:48-52`.
- **Detail**: `AuthProvider` never imports `useLanguage`/`useTranslations`, so every error path shows either a raw Firebase SDK string (e.g. `"Firebase: Error (auth/popup-closed-by-user)."`) or a hardcoded English sentence, regardless of the active UI language. This contradicts the explicit constraint in `change.md:127` ("UI copy in English, Polish and Norwegian, as the rest of the app") and weakens AC-07's requirement for "a clear message" on cancel/failure — a raw SDK error code is not a clear message to an end user, and `lib/translations.ts` already has a precedent pattern for this (`errorTryAgain`). This is a narrower issue than the accepted gap in Open Question #3 (which concerns the static explanation/Settings copy — that copy *was* fully translated into EN/PL/NO by this diff, exceeding the accepted-gap risk); the dynamic error text was not covered by that waiver.
- **Fix**: Add 1-2 translation keys (e.g. `signInCancelled`, `signInFailed`, reusing the existing `cancel`-style three-language pattern) and map the known case (`auth/popup-closed-by-user` → no error, or a neutral "cancelled" string) plus a generic translated fallback for everything else, instead of passing `err.message` straight into state.
- **Decision**: FIX — unambiguous, one-line mapping change inside `components/auth-provider.tsx`; not a documentation file, so it goes through `rs-implement --from-review` rather than a review-round self-fix.

### F2 — Avatar built by reusing the existing shadcn/Radix primitive, not the plan's hand-rolled component
- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Plan Adherence
- **Location**: `components/settings-sheet.tsx:9,169-176` imports `Avatar`/`AvatarImage`/`AvatarFallback` from the pre-existing `components/ui/avatar.tsx` (added by the original v0.app scaffold, `git log` shows commit `dd41cb0`), not a new hand-rolled component as planned (Phase 2, item 3).
- **Detail**: The plan called for a new minimal `<Avatar src? name>` "no new npm dependency" component, reasoning that `@radix-ui/react-avatar` would be a new dependency. That dependency already existed in `package.json` before this change (`"@radix-ui/react-avatar": "1.1.2"`), so reusing the existing shadcn primitive adds no new dependency either, and is more consistent with the codebase's established pattern (every other primitive in `components/ui/` wraps a Radix component) than hand-rolling a one-off. This is a plan-vs-code DRIFT, but a strictly better outcome with no behavioral difference the acceptance criteria would notice.
- **Fix**: None needed.
- **Decision**: ACCEPT — reuses an existing, already-approved dependency and matches the project's own primitive-wrapping convention better than the originally planned hand-rolled component.

## Automated criteria (re-run in this review)
- `pnpm typecheck` → PASS (no output, clean exit)
- `pnpm lint` → PASS (0 errors; 1 pre-existing unrelated warning in `hooks/use-wake-lock.ts`)
- `pnpm build` → PASS, run with `NEXT_PUBLIC_FIREBASE_*` unset to confirm the Phase 1 "no crash at import time" criterion — compiled and prerendered successfully

## Scope check
- Diff file list matches the Phase 1-2 planned files exactly, plus `pnpm-lock.yaml` (expected from the new `firebase` dependency) and the plan/change/research/plan-brief docs. No out-of-plan files.
- `components/sign-in-gate.tsx` is correctly unused by any trigger yet (wired in increments 2/3, phases 5 and 7) — confirmed via repo-wide search.
- Provider nesting in `app/layout.tsx` matches the plan's contract exactly: `LanguageProvider → SettingsProvider → AuthProvider → ReadingHistoryProvider`.
- `lib/firebase.ts`'s guarded init (`isFirebaseConfigured`) is only ever dereferenced after the guard in `auth-provider.tsx` (`onAuthStateChanged`, `signInWithPopup`, `signOut` all gated), so the `as Auth`/`as Firestore` casts on a possibly-`undefined` value are safe in practice.
- `lib/translations.ts`: all 5 new keys present and filled for EN, PL and NO; the shared `Translations` interface makes an incomplete language a type error, so none of the issue's "may ship English only" accepted gap applies to the static copy.

## Manual criteria status
- 1.4 (Firebase project provisioning) and 2.4/2.5 (real sign-in/sign-out round trip, cancel flow) are correctly left unchecked — they need a live Firebase project the architect has not yet provisioned, per Phase 1's own manual criterion. Carried as `manual-pending`.
