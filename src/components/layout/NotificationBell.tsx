'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { Bell, UserPlus, BookOpen, Check, CheckCheck, X } from 'lucide-react'
import type { Notification } from '@/lib/notifications'
import { cn } from '@/lib/utils'

interface ApiResponse {
  notifications: Notification[]
  unread: number
  userId: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)   return 'только что'
  if (m < 60)  return `${m} мин назад`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h} ч назад`
  const d = Math.floor(h / 24)
  return `${d} д назад`
}

export default function NotificationBell() {
  const [open, setOpen]   = useState(false)
  const [data, setData]   = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      setData(await res.json())
    } catch {}
  }, [])

  // Poll unread count every 30s
  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30_000)
    return () => clearInterval(id)
  }, [fetchNotifs])

  // Reload when dropdown opens
  useEffect(() => { if (open) fetchNotifs() }, [open, fetchNotifs])

  // Close on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const markOne = async (id: string) => {
    await fetch('/api/notifications/read', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setData((prev) => prev ? {
      ...prev,
      notifications: prev.notifications.map((n) =>
        n.id === id ? { ...n, readBy: [...n.readBy, prev.userId] } : n
      ),
      unread: Math.max(0, prev.unread - 1),
    } : prev)
  }

  const markAll = async () => {
    setLoading(true)
    await fetch('/api/notifications/read', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setData((prev) => prev ? {
      ...prev,
      notifications: prev.notifications.map((n) => ({
        ...n, readBy: n.readBy.includes(prev.userId) ? n.readBy : [...n.readBy, prev.userId],
      })),
      unread: 0,
    } : prev)
    setLoading(false)
  }

  const unread = data?.unread ?? 0
  const userId = data?.userId ?? ''
  const notifs = data?.notifications ?? []

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative p-2 rounded-xl transition-colors',
          open ? 'bg-medical-50 text-medical-600' : 'text-gray-500 hover:bg-gray-100'
        )}
        title="Уведомления"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-medical-600" />
              <span className="font-semibold text-gray-900 text-sm">Уведомления</span>
              {unread > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-medical-600 hover:text-medical-700 px-2 py-1 rounded-lg hover:bg-medical-50 transition-colors"
                  title="Отметить все как прочитанные"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Все прочитано
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                <Bell className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">Нет уведомлений</p>
                <p className="text-xs text-gray-400 mt-1">Здесь будут появляться важные события</p>
              </div>
            ) : (
              notifs.map((n) => {
                const isUnread = !n.readBy.includes(userId)
                const isUser   = n.type === 'NEW_USER'

                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3.5 transition-colors group',
                      isUnread ? 'bg-medical-50/50 hover:bg-medical-50' : 'hover:bg-gray-50'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                      isUser ? 'bg-purple-100' : 'bg-blue-100'
                    )}>
                      {isUser
                        ? <UserPlus className="w-4 h-4 text-purple-600" />
                        : <BookOpen className="w-4 h-4 text-blue-600" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => { markOne(n.id); setOpen(false) }}
                          className="block"
                        >
                          <p className={cn('text-sm leading-snug', isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                        </Link>
                      ) : (
                        <>
                          <p className={cn('text-sm leading-snug', isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                        </>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>

                    {/* Unread dot + read btn */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      {isUnread && (
                        <span className="w-2 h-2 bg-medical-500 rounded-full mt-1.5" />
                      )}
                      {isUnread && (
                        <button
                          onClick={() => markOne(n.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-medical-500 transition-all rounded"
                          title="Отметить прочитанным"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
