---
change_id: header-tap-navigation
title: Add upward navigation by tapping the header title
status: archived
created: 2026-10-17
updated: 2026-10-17
archived_at: 2026-10-17T20:45:10Z
---

## Notes

https://github.com/piotrczyz/bible/issues/30 (URL not verified via gh; issue text supplied by orchestrator)

## Summary

Add upward navigation by tapping the header title. Tapping the title in the verse reader opens chapter selection for the current book; tapping the title on chapter selection opens book selection. The existing back arrow stays for now and keeps its current behavior.

## Scope

### In scope

1. User is reading a chapter (e.g. header shows "Ewangelia Łukasza 6") and taps the title.
2. App shows the chapter grid for that book (Ewangelia Łukasza).
3. User taps the title on the chapter grid screen.
4. App shows the book list.

### Out of scope (non-goals)

- Removing the back arrow: kept for now, may be revisited later.
- Changes to the book list or chapter grid layouts: only the header title gets a tap action.
- Changes to Android system back behavior: it keeps working as today.

## Acceptance criteria

### AC-01: Reader title opens chapter selection

- **Given** the user is in the verse reader for Luke 6
- **When** they tap the header title "Ewangelia Łukasza 6"
- **Then** the chapter grid for the Gospel of Luke is shown

### AC-02: Chapter grid title opens book selection

- **Given** the user is on the chapter grid for the Gospel of Luke
- **When** they tap the header title
- **Then** the book list is shown

### AC-03: Back arrow and Android back unchanged

- **Given** the user is in the verse reader or on the chapter grid
- **When** they tap the header back arrow or use the Android system back action
- **Then** the app navigates back exactly as it does today

## Constraints & preserved behavior

- Header back arrow stays visible and behaves as today.
- Android system back navigation behaves as today.

## Open questions

- iOS edge-swipe back gesture: not discussed; builder leaves it as is.
- History and settings icons in the header: assumed unchanged, not explicitly confirmed.
- Highlighting the current chapter on the chapter grid (and the current book on the book list) after navigating up: not requested; builder will not add it.
- Title on the book list screen: assumed to have no tap action (top level).
- Visual hint that the title is tappable: not specified.
