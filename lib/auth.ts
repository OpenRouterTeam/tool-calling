// Browser-compatible code challenge creation
function base64URLEncode(buffer: ArrayBuffer): string {
  return btoa(
    String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer)))
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function createChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64URLEncode(hash)
}

// Browser-compatible code verifier creation
export function createCodeVerifier(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return base64URLEncode(array.buffer)
}

let codeVerifier: string | null = null
let codeChallenge: string | null = null

export async function getCodeVerifier(): Promise<string> {
  if (!codeVerifier) {
    codeVerifier = createCodeVerifier()
  }
  return codeVerifier
}

export async function getCodeChallenge(): Promise<string> {
  if (!codeChallenge) {
    codeChallenge = await createChallenge(await getCodeVerifier())
  }
  return codeChallenge
}
