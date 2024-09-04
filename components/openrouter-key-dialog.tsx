'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { SignInWithOpenRouterButton } from '@/components/sign-in-with-openrouter-button'
import { useOpenRouterAuth } from '@/app/openrouter-auth-provider'

export function OpenRouterKeyDialog() {
  const { isDialogOpen, setIsDialogOpen } = useOpenRouterAuth()

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in with OpenRouter</DialogTitle>
          <DialogDescription>
            Please sign in with your OpenRouter account to use the chat
            functionality.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <SignInWithOpenRouterButton />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
