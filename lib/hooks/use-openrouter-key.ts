import { getCodeChallenge, getCodeVerifier } from '@/lib/auth'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useState } from 'react'

export function useOpenRouterKey() {
  const [openRouterKey, setOpenRouterKey] = useLocalStorage<string>(
    'openRouterKey',
    ''
  )
  const [codeVerifier, setCodeVerifier] = useLocalStorage<string>(
    'codeVerifier',
    ''
  )
  const [codeChallenge, setCodeChallenge] = useLocalStorage<string>(
    'codeChallenge',
    ''
  )

  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useLocalStorage<boolean>(
    'isDialogOpen',
    false
  )

  useEffect(() => {
    async function initializeValues() {
      const verifier = await getCodeVerifier()
      const challenge = await getCodeChallenge()
      setCodeVerifier(verifier)
      setCodeChallenge(challenge)
    }
    if (!codeVerifier || !codeChallenge) {
      initializeValues()
    }
  }, [codeVerifier, codeChallenge])

  return {
    openRouterKey,
    setOpenRouterKey,
    codeChallenge,
    codeVerifier,
    isLoading,
    setIsLoading,
    isDialogOpen,
    setIsDialogOpen
  }
}
