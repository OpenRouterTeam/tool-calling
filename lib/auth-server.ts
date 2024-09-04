// Node.js compatible code challenge creation
import crypto from 'crypto'

function base64URLEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export function createChallenge(verifier: string): string {
  const hash = crypto.createHash('sha256').update(verifier).digest()
  return base64URLEncode(hash)
}

export function createCodeVerifier(): string {
  return base64URLEncode(crypto.randomBytes(64))
}

export const defaultCodeVerifier = createCodeVerifier()
export const defaultCodeChallenge = createChallenge(defaultCodeVerifier)
