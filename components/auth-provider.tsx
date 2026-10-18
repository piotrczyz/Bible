"use client"

import * as React from "react"
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth"
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase"

export interface AuthUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOutUser: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

function toAuthUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    displayName: firebaseUser.displayName,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = React.useCallback(async () => {
    if (!isFirebaseConfigured) {
      setError("Sign-in is not configured yet.")
      return
    }

    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-in failed. Please try again."
      setError(message)
    }
  }, [])

  const signOutUser = React.useCallback(async () => {
    if (!isFirebaseConfigured) {
      return
    }

    try {
      await signOut(auth)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Sign-out failed. Please try again."
      setError(message)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, error, signInWithGoogle, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
