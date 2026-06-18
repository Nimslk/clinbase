import { NextResponse } from 'next/server'
import { addReply, deleteReply } from '@/lib/community'
import { getSession } from '@/lib/auth'
import { findById } from '@/lib/users'

export const runtime = 'nodejs'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Пустой ответ' }, { status: 400 })

  const user  = await findById(session.userId)
  const reply = addReply(params.id, {
    userId:      session.userId,
    userName:    user?.name ?? session.email.split('@')[0],
    avatarEmoji: user?.avatarEmoji ?? '👤',
    specialty:   user?.specialty,
    content:     content.trim().slice(0, 1000),
  })
  if (!reply) return NextResponse.json({ error: 'Пост не найден' }, { status: 404 })
  return NextResponse.json(reply, { status: 201 })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const { replyId } = await req.json()
  const isAdmin = session.role === 'ADMIN' || session.role === 'EDITOR'
  const ok = deleteReply(params.id, replyId, session.userId, isAdmin)
  if (!ok) return NextResponse.json({ error: 'Нет доступа' }, { status: 403 })
  return NextResponse.json({ success: true })
}
