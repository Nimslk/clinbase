import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { findByEmail, verifyPassword } from '@/lib/users'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

// Admin credentials — env vars override defaults
const ADMINS = [
  {
    email:    (process.env.ADMIN_EMAIL    ?? 'admin@clinbase.ru').toLowerCase(),
    password:  process.env.ADMIN_PASSWORD ?? 'Admin2026!',
    userId:   'admin-root',
    name:     process.env.ADMIN_NAME      ?? 'Администратор',
  },
  ...(process.env.ADMIN_EMAIL_2 && process.env.ADMIN_PASSWORD_2 ? [{
    email:    process.env.ADMIN_EMAIL_2.toLowerCase(),
    password: process.env.ADMIN_PASSWORD_2,
    userId:   'admin-root-2',
    name:     process.env.ADMIN_NAME_2 ?? 'Администратор 2',
  }] : []),
]

export async function POST(request: Request) {
  try {
    const body   = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
    }

    const { email, password } = parsed.data
    const emailLower = email.toLowerCase()

    // Check hardcoded admins first
    const adminMatch = ADMINS.find(
      (a) => a.email === emailLower && a.password === password
    )
    if (adminMatch) {
      const token = await signToken({ userId: adminMatch.userId, email: emailLower, role: 'ADMIN' })
      const res = NextResponse.json({ success: true, role: 'ADMIN', name: adminMatch.name })
      res.cookies.set('medguide_token', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge:   60 * 60 * 24 * 7,
        path:     '/',
      })
      return res
    }

    // Check registered users
    const user = findByEmail(email)
    if (!user || !(await verifyPassword(user, password))) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role })
    const res = NextResponse.json({ success: true, role: user.role, name: user.name })
    res.cookies.set('medguide_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
