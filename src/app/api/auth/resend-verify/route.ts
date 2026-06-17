import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { findByEmail, refreshVerificationToken } from '@/lib/users'
import { sendVerificationEmail } from '@/lib/email'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const session = await getSession(request)
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })

  const user = findByEmail(session.email)
  if (!user) return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
  if (user.emailVerified) return NextResponse.json({ error: 'Email уже подтверждён' }, { status: 400 })

  const token = refreshVerificationToken(user.email)
  if (!token) return NextResponse.json({ error: 'Не удалось создать токен' }, { status: 500 })

  try {
    await sendVerificationEmail(user.email, user.name, token)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Не удалось отправить письмо. Проверьте настройки SMTP.' }, { status: 500 })
  }
}
