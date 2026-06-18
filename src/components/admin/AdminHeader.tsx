'use client'
import { useState, useEffect, useRef } from 'react'
import { LogOut, Globe, ChevronDown } from 'lucide-react'
import NotificationBell from '@/components/layout/NotificationBell'

interface Me { userId: string; email: string; role: string; name?: string; avatarEmoji?: string }

function roleLabel(role: string) {
  if (role === 'ADMIN')  return 'BOSS'
  if (role === 'EDITOR') return 'Редактор'
  return 'Пользователь'
}

export default function AdminHeader() {
  const [me, setMe]     = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setMe).catch(() => {})
  }, [])

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
      <p className="text-sm font-medium text-gray-400 hidden sm:block">Центр управления</p>

      <div className="flex items-center gap-3 ml-auto">
        <NotificationBell />

        {me && (
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              {me.avatarEmoji ? (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-base leading-none">
                  {me.avatarEmoji}
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {(me.name ?? me.email)[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-900 leading-none">
                  {me.name ?? me.email.split('@')[0]}
                </p>
                <p className="text-[10px] font-bold text-amber-500 mt-0.5">{roleLabel(me.role)}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-1.5 z-50 animate-fade-in">
                <div className="px-4 py-2.5 border-b border-gray-50">
                  <p className="text-xs font-semibold text-gray-900 truncate">{me.name ?? me.email}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 truncate">{me.email}</p>
                  <p className="text-[10px] font-bold text-amber-500 mt-0.5">{roleLabel(me.role)}</p>
                </div>
                <a href="/"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Globe className="w-4 h-4 text-gray-400" />Вернуться на сайт
                </a>
                <a href="/api/auth/logout"
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
                  <LogOut className="w-4 h-4" />Выйти
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
