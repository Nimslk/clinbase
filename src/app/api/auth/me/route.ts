import { NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { findById } from '@/lib/users'
import { cookies } from 'next/headers'

export const runtime = 'nodejs'

export async function GET() {
  const token = cookies().get('medguide_token')?.value
  if (!token) return NextResponse.json(null)
  const payload = await verifyToken(token)
  if (!payload) return NextResponse.json(null)
  const user = await findById(payload.userId)
  return NextResponse.json({
    ...payload,
    name:          user?.name,
    emailVerified: user?.emailVerified ?? (payload.role === 'ADMIN'),
    avatarEmoji:   user?.avatarEmoji,
    specialty:     user?.specialty,
    studyYear:     user?.studyYear,
  })
}
