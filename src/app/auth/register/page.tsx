'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail, User, GraduationCap, BookOpen } from 'lucide-react'
import { LogoIcon } from '@/components/ui/Logo'

const SPECIALTIES = [
  { value: 'Студент',       label: '🎓 Студент медицинского вуза' },
  { value: 'Ординатор',     label: '🩺 Ординатор' },
  { value: 'Абитуриент',    label: '📝 Абитуриент' },
  { value: 'Врач',          label: '👨‍⚕️ Практикующий врач' },
  { value: 'Преподаватель', label: '📋 Преподаватель' },
  { value: 'Другое',        label: '👤 Другое' },
]

const STUDENT_YEARS  = ['1 курс','2 курс','3 курс','4 курс','5 курс','6 курс']
const ORDINATOR_YEARS = ['1 год','2 год','3 год']

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    specialty: '', studyYear: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Пароли не совпадают'); return }
    if (form.password.length < 6) { setError('Пароль минимум 6 символов'); return }
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:      form.name,
          email:     form.email,
          password:  form.password,
          specialty: form.specialty || undefined,
          studyYear: form.studyYear || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ошибка регистрации'); return }
      router.push('/')
      router.refresh()
    } catch {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2 : 3

  const strengthLabel = ['', 'Слабый', 'Средний', 'Надёжный'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'][strength]

  const needsYear = ['Студент', 'Ординатор'].includes(form.specialty)

  const inputCls = "w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <LogoIcon size={52} />
            <div>
              <p className="text-xl font-bold text-gray-900">ClinBase</p>
              <p className="text-sm text-gray-500">Создайте аккаунт</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Имя и фамилия</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={form.name} onChange={set('name')} required autoFocus
                  className={inputCls} placeholder="Иванов Иван" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={form.email} onChange={set('email')} required
                  className={inputCls} placeholder="your@email.com" />
              </div>
            </div>

            {/* Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Специальность / роль</label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select value={form.specialty} onChange={(e) => { set('specialty')(e); setForm((f) => ({ ...f, studyYear: '' })) }}
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all appearance-none bg-white text-gray-700">
                  <option value="">— Выберите —</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Study year — only for students/residents */}
            {needsYear && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Курс обучения</label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select value={form.studyYear} onChange={set('studyYear')}
                    className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all appearance-none bg-white text-gray-700">
                    <option value="">— Выберите —</option>
                    {(form.specialty === 'Ординатор' ? ORDINATOR_YEARS : STUDENT_YEARS).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} required
                  className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
                  placeholder="Минимум 6 символов" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                      style={{ width: `${(strength / 3) * 100}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${['','text-red-500','text-amber-500','text-emerald-600'][strength]}`}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Подтвердите пароль</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')} required
                  className={`w-full pl-10 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    form.confirm && form.confirm !== form.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-medical-400 focus:ring-medical-100'
                  }`}
                  placeholder="••••••••" />
              </div>
              {form.confirm && form.confirm !== form.password && (
                <p className="text-xs text-red-500 mt-1">Пароли не совпадают</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-medical-600 text-white font-medium rounded-xl hover:bg-medical-700 disabled:opacity-60 transition-all shadow-sm mt-2">
              {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="text-medical-600 font-medium hover:underline">
              Войти
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-medical-600 transition-colors">
              ← Вернуться на главную
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Регистрируясь, вы соглашаетесь с условиями использования платформы
        </p>
      </div>
    </div>
  )
}
