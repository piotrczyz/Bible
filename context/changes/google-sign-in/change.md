---
change_id: google-sign-in
title: Users can sign in with Google to unlock reading history and AI search
status: implementing
created: 2026-10-18
updated: 2026-10-18
archived_at: null
---

## Notes

https://github.com/piotrczyz/Bible/issues/34

## Summary

Add optional sign-in with Google. The app stays usable without an account, but two features require sign-in: reading history and AI-powered verse search. The goals are to stop anonymous use of the paid AI search and to know who uses the app.

## Problem & context

- **Who / when / cost:** The AI verse search calls OpenAI through an open Cloud Function. Anyone can use it anonymously, so the non-profit project carries the full cost with no control over abuse, and there is no record of who uses the app.
- **Current system:** Next.js web app on Firebase Hosting with Firebase Cloud Functions, offline-first. No user accounts exist (CLAUDE.md lists "User accounts" and "Firebase sync for reading history" as deferred, and "Backend/Auth" as an open decision). Reading history (timeline) is stored locally on the device and works without sign-in. AI search is available to everyone.

## Scope

### In scope

1. A signed-out user opens the app; all reading features work as today.
2. The user taps AI search or reading history and sees an explanation screen with a "Sign in with Google" button.
3. After signing in, the user returns to exactly where they wanted to go and the feature works.
4. While signed in, every reading is recorded to the user's account and is visible on any device where they sign in.
5. In Settings the user sees their avatar, name and a "Sign out" button. After signing out, reading history disappears from that device's screen but stays on the account.

### Out of scope (non-goals)

- Sign-in on iOS/Android: Capacitor is not initialized yet; this increment is web only.
- Other sign-in methods (Apple, e-mail/password): Google only for now.
- Migrating existing local reading history to the account: accounts start empty.
- Per-account limit on AI searches: sign-in alone closes anonymous access; a limit can follow once real usage is visible.
- Admin panel with a user list: the Firebase console is enough for now.
- In-app account deletion: deferred, see Open questions.
- Syncing settings (theme, font size, Bible version) to the account: settings stay local.

## Access & roles

- **Signed-out user:** reads the Bible, uses all features except reading history and AI search.
- **Signed-in user (Google):** everything above, plus reading history stored on the account and AI search.
- No other roles. The project owner sees registered accounts in the Firebase console.

## Success criteria

- **Primary:** A signed-out user taps AI search, signs in with Google, lands back in AI search and gets results; their subsequent readings appear in the timeline on another device after signing in there.
- **Secondary:** The project owner can see in the Firebase console who signed up and when they last signed in.
- **Guardrails:** Reading the Bible without an account works exactly as today, including offline. The AI search endpoint cannot be used without a valid sign-in.

## Requirements

- FR-001: A user can sign in with Google. Priority: must-have. Change: new
- FR-002: A signed-out user who opens AI search or reading history sees an explanation and a "Sign in with Google" button instead of the feature. Priority: must-have. Change: new
- FR-003: After signing in from FR-002, the user returns to the feature they tried to open. Priority: must-have. Change: new
- FR-004: A signed-in user can use AI search; the AI search endpoint rejects any request without a valid signed-in user. Priority: must-have. Change: modified
- FR-005: A signed-in user's readings are stored on their account and shown in their timeline on any device where they sign in. Priority: must-have. Change: modified
  > Challenge: gating reading history behind sign-in was challenged (risk that regular readers see an empty timeline after the update). Client kept it as is.
- FR-006: A signed-in user's readings made offline are kept on the device and sent to the account once the connection returns. Priority: must-have. Change: new
- FR-007: A signed-in user sees their avatar, name and a "Sign out" button in Settings. Priority: must-have. Change: new
- FR-008: After sign-out, reading history is no longer shown on that device; it remains on the account. Priority: must-have. Change: new
- FR-009: Reading history recorded locally before this change stays on the device but is hidden and not used; it is not moved to the account. Priority: must-have. Change: modified
- FR-010: The project owner can see each account's name, e-mail, sign-up date and last sign-in date in the Firebase console. Priority: must-have. Change: new
- FR-011: A signed-out user can still read the Bible, change settings, versions and language, online and offline. Priority: must-have. Change: preserved

## Acceptance criteria

### AC-01: Sign in from a gated feature

- **Given** a signed-out user on any screen
- **When** they tap AI search, then "Sign in with Google", and complete Google sign-in
- **Then** they land back in AI search, can run a search and get results, and Settings shows their avatar and name

### AC-02: Reading history follows the account

- **Given** a user signed in on device A who reads several verses
- **When** they sign in with the same Google account on device B
- **Then** device B's timeline shows the readings from device A

### AC-03: Offline reading while signed in

- **Given** a signed-in user with no network connection
- **When** they read verses and later reconnect
- **Then** those readings appear in their account's timeline without any action from the user

### AC-04: Sign-out hides history

- **Given** a signed-in user with reading history
- **When** they tap "Sign out" in Settings
- **Then** the timeline is no longer visible on that device and opening it shows the sign-in explanation; signing in again shows the same history

### AC-05: AI endpoint rejects anonymous calls

- **Given** a request to the AI search endpoint without a valid signed-in user
- **When** the endpoint receives it
- **Then** it is rejected and no OpenAI call is made

### AC-06: Existing local history after the update

- **Given** a user who had local reading history before this change
- **When** they open the updated app, signed out or newly signed in
- **Then** the old local history is not shown and the account timeline starts empty

### AC-07: Sign-in cancelled or fails

- **Given** a signed-out user on the explanation screen
- **When** they cancel the Google sign-in or it fails
- **Then** they stay on the explanation screen with a clear message and the rest of the app works as before

## Business rule

Reading history and AI search are available only to a user signed in with Google; everything else stays open to anyone.

The user meets the rule when tapping either gated feature while signed out. A signed-in user's reading history belongs to their account, not to the device.

## Constraints & preserved behavior

- Offline-first architecture from CLAUDE.md must hold: reading works fully offline; signed-in users' history is queued locally and synced when online.
- Reading without an account (books, chapters, verses, versions, languages, theme, font size) must work exactly as today.
- Pre-existing local reading history must not be deleted, only hidden (FR-009).
- CLAUDE.md requires human approval for new dependencies and architecture decisions; the Backend/Auth choice listed there as deferred is decided by this issue's pattern (see Technical notes) and must be confirmed with the architect before implementation.
- All dependencies must be open source with permissive licenses (project rule).
- UI copy in English, Polish and Norwegian, as the rest of the app.

## Non-functional requirements

- Privacy: the account stores only the Google name, e-mail, avatar, sign-up and last sign-in dates, and the user's reading history. No other personal data.
- A user's reading history is readable only by that user.
- Web browsers supported by the app today.

## Open questions

1. **Account deletion:** not built in this increment. GDPR gives users the right to erasure, and App Store / Google Play require in-app account deletion for apps with sign-in. Must be addressed before the mobile release. Block: no.
2. **Legacy local history:** stays hidden on devices indefinitely (accepted risk: regular readers see an empty timeline after the update). Decide later whether to migrate or clean it up. Block: no.
3. **No acceptance criterion for translations (accepted gap):** the explanation screen and Settings account section must follow EN/PL/NO, but no AC verifies it. Consequence: the builder may ship English only. Block: no.
4. **Explanation screen copy not defined (accepted gap):** the builder writes the wording of the sign-in explanation. Consequence: copy needs review in the PR. Block: no.

## Technical notes from the client

- Implement Google sign-in the same way as in the Sauna booking repository (git@github.com:Rocksoft-IT/sauna-booking.git, see `context/changes/login-with-google`). Note: Sauna booking is Vue 3; reuse the approach, not the code. This repository is not accessible; reuse the general Firebase/Google OAuth pattern for this stack instead.

### Issue comments

(No non-bot human comments.)
