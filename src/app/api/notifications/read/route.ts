import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { markRead, markAllRead } from '@/lib/notifications'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const token = cookies().get('medguide_token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const me = await verifyToken(token)
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  if (body.all) {
    markAllRead(me.role, me.userId)
  } else if (body.id) {
    markRead(body.id, me.userId)
  }

  return NextResponse.json({ success: true })
}
