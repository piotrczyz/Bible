# Header tap navigation — Plan Brief
Full plan: `context/changes/header-tap-navigation/plan.md` · issue text: `change.md`

## Complexity
TRIVIAL — one-file, few-line change with an existing in-code pattern
(`app/page.tsx:178-183`) to mirror; no new state, contract, or dependency.
Skipped: rs-research (issue is spec-complete with explicit AC, and a quick
read of `app/page.tsx` fully resolved the shape), rs-frame (observation only,
no stated cause/fix and no scope in doubt) — skipped (Jev unavailable, dry
mode; decided Auto).

## Key decisions made
| Decision | Choice | Why | Source |
|---|---|---|---|
| Areas | A1 header title tap navigation (single area, builds on nothing) | Small, cohesive UI change confined to the header title's tap behavior | Orchestrator |
| Skip rs-research / rs-frame | Skip both | Jev `needs_research`/`needs_framing` returned `unavailable` (dry mode); issue has explicit AC and scope, confirmed against `app/page.tsx` directly | Auto |
| AC-01 (reader title → chapters) | No code change needed | Already implemented: `app/page.tsx:178-183` is a button calling `setView("chapters")` | Auto (code evidence) |
| AC-02 (chapters title → books) transition logic | Reuse existing `handleBack` (`app/page.tsx:120-126`) | `handleBack`'s chapters-branch already does "clear selected book, show books" — the exact target behavior; reusing it avoids duplicating the transition | Auto |
| Increment shape | One increment, one phase | TRIVIAL change; single file, no dependency to split on | Auto |
| User-visible | yes | Header title becomes tappable on the chapter grid screen — an end-user-visible behavior change | Auto |
