import { getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// No real Firebase project is provisioned yet (see .firebaserc), so the env
// vars above may be unset in dev/CI. Initializing with an empty config would
// throw at import time and break every page that imports this module
// (directly or via AuthProvider), so guard it: a warning instead of a crash.
const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app: FirebaseApp | undefined
let authInstance: Auth | undefined
let dbInstance: Firestore | undefined

if (hasFirebaseConfig) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  authInstance = getAuth(app)
  dbInstance = getFirestore(app)
} else if (typeof window !== "undefined") {
  console.warn(
    "Firebase config is missing (NEXT_PUBLIC_FIREBASE_* env vars not set); sign-in and account sync are disabled."
  )
}

export const auth = authInstance as Auth
export const db = dbInstance as Firestore
export const googleProvider = new GoogleAuthProvider()
export const isFirebaseConfigured = hasFirebaseConfig
