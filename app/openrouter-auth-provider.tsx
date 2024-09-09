'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useQueryState } from 'nuqs'
import { toast } from 'sonner'
import { useLocalStorage } from '@uidotdev/usehooks'
import { getCodeChallenge, getCodeVerifier } from '@/lib/auth'
import { codeChallengeMethod, getSiteURL, openRouterBaseUrl } from '@/lib/utils'

interface OpenRouterAuthContextType {
  openRouterKey: string | null
  isLoading: boolean
  codeChallenge: string
  isDialogOpen: boolean
  signIn: () => void
  signOut: () => void
  setIsDialogOpen: (isOpen: boolean) => void
}

const OpenRouterAuthContext = createContext<
  OpenRouterAuthContextType | undefined
>(undefined)

const oauthBaseUrl = `${openRouterBaseUrl}/auth`

export function OpenRouterAuthProvider({
  children
}: {
  children: React.ReactNode
}) {
  const [openRouterKey, setOpenRouterKey] = useLocalStorage<string | null>(
    'openRouterKey',
    null
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
  const [code, setCode] = useQueryState('code')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const hasRunEffect = useRef(false)

  const [callbackUrl, setCallbackUrl] = useState(getSiteURL())

  useEffect(() => {
    setCallbackUrl(globalThis.window.location.origin)
  }, [globalThis.window])

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
  }, [codeVerifier, codeChallenge, setCodeVerifier, setCodeChallenge])

  useEffect(() => {
    if (
      code &&
      codeVerifier &&
      !openRouterKey &&
      !isLoading &&
      !hasRunEffect.current
    ) {
      hasRunEffect.current = true
      setIsLoading(true)
      fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          codeVerifier
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch OpenRouter key')
          }
          return response.json()
        })
        .then(data => {
          if (data.key) {
            setOpenRouterKey(data.key)
            toast.success('Successfully authenticated with OpenRouter')
          }
        })
        .catch(error => {
          toast.error('Failed to authenticate with OpenRouter')
        })
        .finally(() => {
          setIsLoading(false)
          setCode(null)
          hasRunEffect.current = false
        })
    }
  }, [code, setCode, codeVerifier, setOpenRouterKey, openRouterKey, isLoading])

  const signIn = () => {
    const authUrl = new URL(oauthBaseUrl)
    const searchParams = new URLSearchParams({
      callback_url: callbackUrl,
      code_challenge: codeChallenge,
      code_challenge_method: codeChallengeMethod
    })
    authUrl.search = searchParams.toString()
    window.location.href = authUrl.toString()
  }

  const signOut = () => {
    setOpenRouterKey(null)
    toast.success('Signed out successfully')
  }

  return (
    <OpenRouterAuthContext.Provider
      value={{
        openRouterKey,
        isLoading,
        codeChallenge,
        isDialogOpen,
        signIn,
        signOut,
        setIsDialogOpen
      }}
    >
      {children}
    </OpenRouterAuthContext.Provider>
  )
}

export function useOpenRouterAuth() {
  const context = useContext(OpenRouterAuthContext)
  if (context === undefined) {
    throw new Error(
      'useOpenRouterAuth must be used within an OpenRouterAuthProvider'
    )
  }
  return context
}
