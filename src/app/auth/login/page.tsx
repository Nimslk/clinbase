'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Logo, { LogoIcon } from '@/components/ui/Logo'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ошибка входа'); return }
      router.push(data.role === 'ADMIN' || data.role === 'EDITOR' ? '/admin' : '/')
      router.refresh()
    } catch {
      setError('Ошибка сети')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <LogoIcon size={52} />
            <div>
              <p className="text-xl font-bold text-gray-900">ClinBase</p>
              <p className="text-sm text-gray-500">Войдите в аккаунт</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Пароль</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-medical-600 text-white font-medium rounded-xl hover:bg-medical-700 disabled:opacity-60 transition-all shadow-sm mt-2">
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Нет аккаунта?{' '}
            <Link href="/auth/register" className="text-medical-600 font-medium hover:underline">
              Зарегистрироваться
            </Link>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-medical-600 transition-colors">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
