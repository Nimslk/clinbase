import { NextResponse } from 'next/server'
import { verifyEmailToken } from '@/lib/users'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token') ?? ''
  if (!token) {
    return NextResponse.json({ error: 'Токен не указан' }, { status: 400 })
  }
  const result = verifyEmailToken(token)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true })
}
