---
change_id: pwa-update-detection
title: Installed PWA picks up new versions without reinstalling
status: impl_reviewed
created: 2026-10-17
updated: 2026-10-17
archived_at: null
---

## Notes

https://github.com/piotrczyz/Bible/issues/32

## Summary

When the app is installed as a PWA on iOS (added to the home screen), it never picks up new versions. The only way to get the latest release today is to remove the app and add it to the home screen again. Users should get new versions without reinstalling.

## Scope

### In scope

1. The app checks for a new version on every full launch and every time it returns from the background.
2. On a full launch, if a new version is available, the app loads it silently and the user starts on the latest version.
3. When a new version is detected while the app is in use (including on return from the background), the app shows a message along the lines of "A new version is available, refresh". It does not reload on its own in the middle of reading.
4. Tapping the message loads the new version immediately.

### Out of scope (non-goals)

- Native iOS/Android builds via Capacitor: this issue covers the installed PWA only.

## Acceptance criteria

### AC-01: Silent update on full launch

- **Given** the PWA is installed on an iPhone home screen and a new version has been deployed
- **When** the user fully closes the app (app switcher) and opens it again
- **Then** the app runs the new version without being reinstalled

### AC-02: Update prompt on return from background

- **Given** the PWA is open in the background and a new version has been deployed
- **When** the user returns to the app
- **Then** a "new version available, refresh" message appears, the current screen is not reloaded automatically, and tapping the message loads the new version

### AC-03: User data survives the update

- **Given** the user has reading history, settings, a last reading position and offline Bible versions
- **When** the app updates to a new version by either path above
- **Then** all of that data is unchanged and the app still works offline

## Constraints & preserved behavior

- Reading history, settings (theme, font size, language, Bible version), last reading position and downloaded offline Bible versions must survive every update unchanged.
- The app must keep working fully offline; the version check must not block use when there is no network.

## Open questions

- Should the same update behavior apply to the PWA on Android and desktop browsers, or iOS only? Consequence: the builder will assume all platforms.
- What happens if the user ignores or dismisses the update message: does it reappear on the next return from the background? Consequence: the builder will decide.
- Exact wording of the update message in English, Polish and Norwegian. Consequence: the builder will write it.

### Issue comments

**piotrczyz** (2026-10-17T20:49:26Z):
Czy da się to uruchomić?
