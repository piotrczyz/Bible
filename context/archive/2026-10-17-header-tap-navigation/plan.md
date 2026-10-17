# Header tap navigation — Implementation Plan

## Overview
Make the chapter grid's header title tappable so it navigates up to the book
list, mirroring the verse reader's header title, which already navigates up
to the chapter grid. This is the single remaining gap for upward navigation
by tapping the header title (issue #30).

## Current State Analysis
- `app/page.tsx` renders the whole app header (back button, title, action
  icons) for all three views (`books` / `chapters` / `reader`) in one place —
  there is no separate header component per screen.
- Reader view title is **already** a tappable button: `app/page.tsx:178-183`
  renders `<button onClick={() => setView("chapters")} className="text-lg
  font-semibold hover:underline underline-offset-4">{getBookName(selectedBook)}
  {selectedChapter}</button>`. AC-01 is already satisfied by existing code.
- Chapters view title is a plain, non-interactive heading:
  `app/page.tsx:168-170` — `<h1 className="text-lg font-semibold">
  {getBookName(selectedBook)}</h1>`. This is the AC-02 gap.
- `handleBack` (`app/page.tsx:120-126`) already implements the exact
  "chapters → books" transition the title tap must reproduce: `setView
  ("books")` followed by `setSelectedBook(null)`. Re-using this behavior
  keeps the title tap consistent with the existing back arrow and bottom-nav
  back button (`app/page.tsx:237-245`), which both call `handleBack`.
- Back arrow (`app/page.tsx:150-159`) and Android system back (not handled by
  this component; no change needed) are untouched by this plan.
- No test runner is configured (`package.json` has no `test` script); CI/dev
  checks are `npm run lint`, `npm run typecheck`, `npm run build`.

## Desired End State
Tapping the header title on the chapter grid screen clears the selected book
and returns to the book list — same visual treatment (`hover:underline
underline-offset-4`) as the reader title already has. The back arrow, the
bottom-nav back/home buttons, and Android system back keep behaving exactly
as today.

### Key discoveries
- Reader title tap-to-navigate already exists: `app/page.tsx:178-183`.
- `handleBack`'s chapters-branch (`app/page.tsx:122-125`) is the exact target
  behavior for the chapters title tap, so the new handler can reuse `handleBack`
  directly instead of duplicating its two statements.

## What we're NOT doing
- Not touching the back arrow, bottom-nav back/home buttons, or Android
  system back behavior (AC-03).
- Not changing book-list or chapter-grid layouts — only the header title gets
  a tap action.
- Not adding a tap action to the title on the book list screen (top level).
- Not adding current-chapter/current-book highlighting after navigating up.
- Not adding a visual "tappable" affordance beyond the existing hover-underline
  style already used by the reader title.

## Implementation Approach
Wrap the chapters-view header title in a `<button>` that calls `handleBack`
(the existing handler already does "clear selected book, go to books", which
is exactly AC-02's required behavior and keeps a single source of truth for
that transition). Match the reader title's existing classes
(`text-lg font-semibold hover:underline underline-offset-4`) for visual
consistency. This is a one-file, few-line change with an unambiguous existing
pattern to follow, so no alternative approach was considered.

## Increments
| # | Name | Phases | Depends on | User-visible | Status | PR |
|---|---|---|---|---|---|---|
| 1 | Chapter grid title opens book list | 1 | — | yes | pending | — |

## Phase 1: Chapter grid title opens book list
### Overview
Make the chapter grid's header title a button that navigates up to the book
list, reusing the existing `handleBack` transition.

### Required changes
#### 1. Chapters-view header title
- **File**: `app/page.tsx`
- **Goal**: Replace the static `<h1>` title shown when `view === "chapters"`
  (`app/page.tsx:168-170`) with a `<button>` that, on click, calls
  `handleBack` — reproducing the same "clear selected book, show book list"
  transition `handleBack` already performs for this view — styled identically
  to the reader title's tappable button (`hover:underline underline-offset-4`).
- **Contract**: No new props, state, or exported functions; `handleBack`'s
  signature and behavior are unchanged. The back arrow and bottom-nav buttons
  keep calling `handleBack` exactly as before.

### Success criteria
#### Automated
- `npm run typecheck` passes
- `npm run lint` passes
- `npm run build` succeeds
#### Manual
- On the chapter grid screen, tapping the header title shows the book list
  (AC-02)
- In the verse reader, tapping the header title still shows the chapter grid
  for the current book (AC-01, regression check on existing behavior)
- The header back arrow and the bottom-nav back/home buttons on the chapter
  grid and reader screens still work exactly as before (AC-03)

## Testing Strategy
No test runner is configured in this repo; verification is `typecheck` +
`lint` + `build` (Automated) plus a manual click-through for the three
acceptance criteria.

## Migration Notes
None — UI-only change, no data or schema impact.

## References
- Issue #30 (`context/changes/header-tap-navigation/change.md`)
- `app/page.tsx:120-126` (`handleBack`)
- `app/page.tsx:168-170` (chapters title, to change)
- `app/page.tsx:178-183` (reader title, existing pattern to match)

## Progress

### Phase 1: Chapter grid title opens book list
#### Automated
- [x] 1.1 npm run typecheck passes — 9dd997e
- [x] 1.2 npm run lint passes — 9dd997e
- [x] 1.3 npm run build succeeds — 9dd997e
#### Manual
- [ ] 1.4 On the chapter grid screen, tapping the header title shows the book list (AC-02)
- [ ] 1.5 In the verse reader, tapping the header title still shows the chapter grid for the current book (AC-01, regression check on existing behavior)
- [ ] 1.6 The header back arrow and the bottom-nav back/home buttons on the chapter grid and reader screens still work exactly as before (AC-03)
