'use client'

import { Button } from '@/components/ui/button'
import { IconOpenRouter, IconSpinner } from '@/components/ui/icons'
import { useOpenRouterAuth } from '@/app/openrouter-auth-provider'

export function SignInWithOpenRouterButton() {
  const { openRouterKey, codeChallenge, isLoading, signOut, signIn } =
    useOpenRouterAuth()

  return (
    <Button
      variant={openRouterKey ? 'outline' : 'default'}
      disabled={!codeChallenge || isLoading}
      onClick={openRouterKey ? signOut : signIn}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin" />
      ) : openRouterKey ? null : (
        <IconOpenRouter className="w-4 h-4 mr-2" />
      )}
      {isLoading
        ? 'Loading...'
        : openRouterKey
          ? 'Sign out'
          : 'Sign in with OpenRouter'}
    </Button>
  )
}
