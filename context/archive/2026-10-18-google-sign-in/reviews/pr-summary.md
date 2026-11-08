<!-- preview-link -->

**What this delivers:**
- Reading history now follows a signed-in user's Google account instead of
  staying on one device: readings made on one phone or browser show up on
  another once the user signs in there, and readings made while offline are
  saved automatically once the connection comes back. Signing out clears
  the reading history from that device's screen (it stays safe on the
  account).
- AI-powered verse search is now only available to people who sign in with
  Google. A signed-out tap on AI search shows a short explanation with a
  "Sign in with Google" button; after signing in, the person lands straight
  back in search. The search service itself now rejects any request that is
  not from a signed-in user, so it can no longer be used anonymously.

**Please check on the preview:**
- Read a few verses while signed in, then open the app signed in with the
  same Google account on another device or browser and confirm the same
  history shows up there
- Turn off your connection, read a few verses, turn the connection back on,
  and confirm those readings appear in your history without doing anything
  else
- Sign out and confirm your reading history disappears from that device,
  then sign back in and confirm it is still there
- Tap the reading-history icon while signed out and confirm you see the
  sign-in screen instead of your history, and that signing in takes you
  straight into the timeline
- Tap AI search while signed out: you should see the sign-in explanation,
  not the search box
- Sign in with Google from that screen: you should land back in AI search
  and get results for a query

**Status:** Reading History Account Sync is merged. AI Search Sign-In Gate
is reviewed and approved, and still needs the Firebase project (Google
sign-in, Firestore) provisioned before sign-in can be tested on the
preview; it merges once that is in place.
