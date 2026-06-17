import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { AuthPayload } from '@/types'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fallback-dev-secret'
)
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d'
const COOKIE_NAME = 'medguide_token'

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AuthPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<AuthPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function setSession(payload: AuthPayload): Promise<void> {
  const token = await signToken(payload)
  const cookieStore = cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = cookies()
  cookieStore.delete(COOKIE_NAME)
}

export function getTokenFromHeader(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) return null
  return auth.slice(7)
}
