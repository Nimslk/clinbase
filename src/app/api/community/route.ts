import { NextResponse } from 'next/server'
import { getPosts, createPost } from '@/lib/community'
import { getSession } from '@/lib/auth'
import { findById } from '@/lib/users'

export const runtime = 'nodejs'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  return NextResponse.json(getPosts())
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })

  const { content, category } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Напишите что-нибудь' }, { status: 400 })

  const user = findById(session.userId)
  const post = createPost({
    userId:      session.userId,
    userName:    user?.name ?? session.email.split('@')[0],
    avatarEmoji: user?.avatarEmoji ?? '👤',
    specialty:   user?.specialty,
    category:    category ?? 'other',
    content:     content.trim().slice(0, 2000),
  })
  return NextResponse.json(post, { status: 201 })
}
