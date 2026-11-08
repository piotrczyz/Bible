<!-- IMPL-REVIEW-REPORT -->
# Implementation Review: Google Sign-In — Implementation Plan

**Plan**: context/changes/google-sign-in/plan.md   **Scope**: Increment 3 (Phases 6-7)   **Date**: 2026-10-18
**Round**: 1   **Verdict**: APPROVED   **Findings**: 1

## Verdicts
| Dimension | Verdict |
|---|---|
| Plan Adherence | PASS |
| Scope Discipline | PASS |
| Safety & Quality | PASS (F1, ACCEPT) |
| Architecture | PASS (no `context/architecture/` model exists; not applicable) |
| Pattern Consistency | PASS |
| Success Criteria | PASS |

## Findings

### F1 — Raw backend error string can surface untranslated on a 401
- **Severity**: OBSERVATION
- **Impact**: LOW
- **Dimension**: Safety & Quality
- **Location**: `components/ai-search.tsx:82-85` (`setError(data.error || t.aiSearchError)`), paired with `functions/src/index.ts:141,147,155` (`res.status(401).json({ error: "Unauthorized" })`).
- **Detail**: If a signed-in user's ID token fails to attach or has expired between opening AI search and submitting a query, the function now returns a 401 whose body (`"Unauthorized"`) is shown verbatim, in English, regardless of the active UI language — the explicit copy constraint in `change.md:127` ("UI copy in English, Polish and Norwegian"). This is not a new pattern introduced by this increment: `data.error` was already surfaced raw for the pre-existing 400/405/500 cases before this diff, so the gap is pre-existing and this increment only adds one more status code to it. In the normal flow this is effectively unreachable — `handleTriggerClick` only lets a user reach the search form once `useAuth().user` is already set, so the 401 path only fires in the rare case of a token expiring or failing to refresh mid-session, not for an anonymous tap.
- **Fix**: None required for this increment; if desired, a future pass could map `response.status === 401` to `t.aiSearchError` (or a dedicated translated string) instead of `data.error`.
- **Decision**: ACCEPT — pre-existing display pattern, LOW impact, effectively unreachable given the gating this increment adds.

## Automated criteria (run in this review)
- `npx tsc --noEmit` (root) → PASS, clean exit, no output.
- `npx eslint .` (root) → PASS, 0 errors, 1 pre-existing unrelated warning in `hooks/use-wake-lock.ts` (same warning noted in increment 1's review, untouched by this diff).
- `npm run build` (root, `next build` via Turbopack) → PASS, compiled and prerendered successfully.
- `npm run build` (`functions/`, `tsc`) → PASS, clean exit, no output.

## Scope check
- Diff against `origin/main...HEAD`: `components/ai-search.tsx`, `functions/src/index.ts`, `context/changes/google-sign-in/plan.md` — exactly the Phase 6 (`functions/src/index.ts`) and Phase 7 (`components/ai-search.tsx`) planned files, plus the plan's own Progress checkboxes. No out-of-plan files, no unplanned dependency changes.
- `functions/src/index.ts`: the new token check sits between the existing method guard (405) and the query-shape guard (400), exactly where the plan specified ("before the existing method/query-shape guards build the OpenAI prompt"); no OpenAI call is reachable without a verified token. `admin.initializeApp()` is guarded with `admin.apps.length === 0` per the plan's double-init guard; `firebase-admin` was already a dependency (`functions/package.json:18`), so no new dependency was added.
- `components/ai-search.tsx`: `SignInGate`'s contract (`open`, `onOpenChange`, `onSignedIn`, `featureLabel`) is consumed exactly as built in increment 1 (`components/sign-in-gate.tsx`), matching the same pattern already used and approved for Settings/the Timeline trigger design. `handleTriggerClick` gates the collapsed-state button; `onSignedIn={handleExpand}` lands the user back in AI search per AC-01; the ID token is attached via `auth.currentUser?.getIdToken()` only when present, preserving the existing unauthenticated-shape fallback without breaking the request body contract (unchanged, per the plan).
- Response contract unchanged on success (`{results: SearchResult[]}`); the only new failure case is `401 {"error": "Unauthorized"}`, matching the plan's contract exactly.
- Progress checkboxes 6.1, 7.1-7.3 are checked with the correct commit SHAs (`2c9105d`, `d43d38d`); manual rows 6.2 and 7.4 are left unchecked, matching the implementer's reported guards and verified here as still requiring a live Firebase project (Phase 1's own manual criterion) to exercise end-to-end.
- No `context/architecture/` model exists in this repo, so the architecture boundary gate is not applicable.

## Manual criteria (pending, diff evidence only)
- **6.2** — A request to `/api/search` with no/invalid `Authorization` returns 401 with no OpenAI call. Diff evidence: the token-verification block runs and returns before the OpenAI `fetch` is ever reached (`functions/src/index.ts:138-157` vs. the OpenAI call further down). Cannot be exercised end-to-end without a deployed/emulated function and a real Firebase project (Phase 1's manual criterion) — left pending for the human to confirm on the preview.
- **7.4** — A signed-out tap on AI search shows the explanation dialog; sign-in lands back in AI search with results. Diff evidence: `handleTriggerClick` → `SignInGate` → `onSignedIn={handleExpand}` wiring is in place and matches the approved Phase 2 contract. Requires a real Google sign-in against a provisioned Firebase project to verify end-to-end — left pending.

## Notes for the record
- This increment (3 of 3) is **not** the last increment to complete the overall change: increment 2 (Phases 3-5, Reading History Account Sync) is still `pending` per `## Increments`. Per rs-core §3, `change.md` status is left at `implementing` and is **not** advanced to `impl_reviewed` by this review.
