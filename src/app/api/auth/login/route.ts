import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'
import { findByEmail, verifyPassword } from '@/lib/users'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

// Hardcoded emergency admin — always works regardless of env vars
const EMERGENCY_ADMIN = {
  email:    'admin@clinbase.ru',
  password: 'ClinBase2026',
  userId:   'admin-emergency',
  name:     'Администратор',
  role:     'ADMIN' as const,
}

// Additional admins from env vars
const ENV_ADMINS = [
  ...(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD ? [{
    email:    process.env.ADMIN_EMAIL.toLowerCase(),
    password: process.env.ADMIN_PASSWORD,
    userId:   'admin-root',
    name:     process.env.ADMIN_NAME ?? 'Администратор',
    role:     'ADMIN' as const,
  }] : []),
  ...(process.env.ADMIN_EMAIL_2 && process.env.ADMIN_PASSWORD_2 ? [{
    email:    process.env.ADMIN_EMAIL_2.toLowerCase(),
    password: process.env.ADMIN_PASSWORD_2,
    userId:   'admin-root-2',
    name:     process.env.ADMIN_NAME_2 ?? 'Администратор 2',
    role:     'ADMIN' as const,
  }] : []),
]

const ALL_ADMINS = [EMERGENCY_ADMIN, ...ENV_ADMINS]

export async function POST(request: Request) {
  try {
    const body   = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
    }

    const { email, password } = parsed.data
    const emailLower = email.toLowerCase().trim()

    // Check all admins (hardcoded + env vars)
    const adminMatch = ALL_ADMINS.find(
      (a) => a.email === emailLower && a.password === password
    )
    if (adminMatch) {
      const token = await signToken({
        userId: adminMatch.userId,
        email:  emailLower,
        role:   adminMatch.role,
      })
      const res = NextResponse.json({
        success: true,
        role:    adminMatch.role,
        name:    adminMatch.name,
      })
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
    const user = await findByEmail(email)
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
