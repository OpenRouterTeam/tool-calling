import { codeChallengeMethod, openRouterBaseUrl } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { code, codeVerifier } = await req.json()

  if (!code || !codeVerifier) {
    console.error('Missing code or codeVerifier', code, codeVerifier)
    return NextResponse.json(
      { error: 'Missing code or codeVerifier' },
      { status: 400 }
    )
  }

  try {
    const response = await fetch(`${openRouterBaseUrl}/api/v1/auth/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier,
        code_challenge_method: codeChallengeMethod
      })
    })

    if (!response.ok) {
      throw new Error('Failed to fetch OpenRouter key')
    }

    const data = await response.json()

    if (!data.key) {
      throw new Error('No key received from OpenRouter')
    }

    return NextResponse.json({ key: data.key })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to authenticate with OpenRouter' },
      { status: 500 }
    )
  }
}
