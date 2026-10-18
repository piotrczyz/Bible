<!-- preview-link -->

**What this delivers:** AI-powered verse search is now only available to people who sign in with Google. A signed-out tap on AI search shows a short explanation with a "Sign in with Google" button; after signing in, the person lands straight back in search. The search service itself now rejects any request that is not from a signed-in user, so it can no longer be used anonymously.

**Please check on the preview:**
- Tap AI search while signed out: you should see the sign-in explanation, not the search box.
- Sign in with Google from that screen: you should land back in AI search and get results for a query.

**Status:** Not ready to merge yet: the Firebase project (Google sign-in, Firestore) still needs to be provisioned before sign-in can be tested on the preview; this part works once that is in place.
