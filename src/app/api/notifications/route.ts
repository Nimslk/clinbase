import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getForRole, countUnread } from '@/lib/notifications'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const token = cookies().get('medguide_token')?.value
  if (!token) return NextResponse.json({ notifications: [], unread: 0 })

  const me = await verifyToken(token)
  if (!me) return NextResponse.json({ notifications: [], unread: 0 })

  const { searchParams } = new URL(request.url)
  const onlyCount = searchParams.get('count') === '1'

  if (onlyCount) {
    return NextResponse.json({ unread: countUnread(me.role, me.userId) })
  }

  const notifications = getForRole(me.role, me.userId).slice(0, 50)
  const unread        = notifications.filter((n) => !n.readBy.includes(me.userId)).length

  return NextResponse.json({ notifications, unread, userId: me.userId })
}
