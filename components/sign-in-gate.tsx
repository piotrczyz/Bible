"use client"

import * as React from "react"
import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SignInGateProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSignedIn: () => void
  featureLabel: string
}

export function SignInGate({
  open,
  onOpenChange,
  onSignedIn,
  featureLabel,
}: SignInGateProps) {
  const { t } = useLanguage()
  const { user, error, signInWithGoogle } = useAuth()
  const [isSigningIn, setIsSigningIn] = React.useState(false)

  // If the user becomes signed in while the dialog is open (sign-in succeeded),
  // hand control back to the caller and close.
  React.useEffect(() => {
    if (open && user) {
      onSignedIn()
      onOpenChange(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user])

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.signInExplanationTitle}</DialogTitle>
          <DialogDescription>
            {t.signInExplanationBody.replace("{feature}", featureLabel)}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSigningIn}
          >
            {t.cancel}
          </Button>
          <Button onClick={handleSignIn} disabled={isSigningIn}>
            {t.signInWithGoogle}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
