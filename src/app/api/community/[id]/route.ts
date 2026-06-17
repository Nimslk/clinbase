import { NextResponse } from 'next/server'
import { deletePost, toggleLike } from '@/lib/community'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  const isAdmin = session.role === 'ADMIN' || session.role === 'EDITOR'
  const ok = deletePost(params.id, session.userId, isAdmin)
  if (!ok) return NextResponse.json({ error: 'Не найдено или нет доступа' }, { status: 403 })
  return NextResponse.json({ success: true })
}

export async function PATCH(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  const post = toggleLike(params.id, session.userId)
  if (!post) return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
  return NextResponse.json(post)
}
