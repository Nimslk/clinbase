import { NextResponse } from 'next/server'
import { createUser } from '@/lib/users'
import { signToken } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'
import { z } from 'zod'

export const runtime = 'nodejs'

const schema = z.object({
  name:      z.string().min(2, 'Имя слишком короткое'),
  email:     z.string().email('Некорректный email'),
  password:  z.string().min(6, 'Пароль минимум 6 символов'),
  specialty: z.string().optional(),
  studyYear: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body   = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { name, email, password, specialty, studyYear } = parsed.data
    const user = await createUser(name, email, password, { specialty, studyYear })

    createNotification({
      type:     'NEW_USER',
      audience: 'ADMINS',
      title:    'Новый пользователь',
      body:     `${name} (${email})${specialty ? ` — ${specialty}` : ''} зарегистрировался на платформе`,
      link:     '/admin/users',
    })

    const token = await signToken({ userId: user.id, email: user.email, role: user.role })

    const res = NextResponse.json({ success: true, name: user.name, role: user.role, emailVerified: false })
    res.cookies.set('medguide_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })
    return res
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message ?? 'Ошибка регистрации' }, { status: 400 })
  }
}
