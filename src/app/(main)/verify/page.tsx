'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react'
import { LogoIcon } from '@/components/ui/Logo'
import { Suspense } from 'react'

function VerifyContent() {
  const params   = useSearchParams()
  const token    = params.get('token') ?? ''
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [resending, setResend] = useState(false)
  const [resent, setResent]   = useState(false)

  useEffect(() => {
    if (!token) { setStatus('error'); setMessage('Ссылка недействительна'); return }
    fetch(`/api/auth/verify?token=${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStatus('success')
        else { setStatus('error'); setMessage(d.error ?? 'Ошибка верификации') }
      })
      .catch(() => { setStatus('error'); setMessage('Ошибка сети') })
  }, [token])

  const resend = async () => {
    setResend(true)
    try {
      const res  = await fetch('/api/auth/resend-verify', { method: 'POST' })
      const data = await res.json()
      if (res.ok) setResent(true)
      else setMessage(data.error ?? 'Ошибка отправки')
    } finally {
      setResend(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="inline-flex flex-col items-center gap-3 mb-8">
          <LogoIcon size={52} />
          <p className="text-xl font-bold text-gray-900">ClinBase</p>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="w-14 h-14 text-medical-500 mx-auto mb-4 animate-spin" />
              <p className="text-lg font-semibold text-gray-900 mb-1">Проверяем ссылку...</p>
              <p className="text-sm text-gray-500">Подождите секунду</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email подтверждён!</h1>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Ваш профиль успешно верифицирован. Теперь у вас полный доступ к платформе ClinBase.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center w-full py-3 bg-medical-600 text-white font-medium rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
              >
                Перейти на главную
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">Ссылка не работает</h1>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>

              {resent ? (
                <div className="flex items-center gap-2 justify-center text-emerald-600 text-sm font-medium bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                  <CheckCircle className="w-4 h-4" />
                  Письмо отправлено! Проверьте почту.
                </div>
              ) : (
                <button
                  onClick={resend}
                  disabled={resending}
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-medical-600 text-white font-medium rounded-xl hover:bg-medical-700 disabled:opacity-60 transition-colors shadow-sm mb-3"
                >
                  {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {resending ? 'Отправляем...' : 'Отправить новое письмо'}
                </button>
              )}

              <Link href="/" className="block text-sm text-gray-400 hover:text-medical-600 transition-colors mt-3">
                ← На главную
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
