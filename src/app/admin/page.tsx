'use client'
import { useEffect, useState, useCallback } from 'react'
import { TrendingUp, FileText, Users, Download, Eye, ArrowUpRight, RefreshCw, Upload, BarChart3, Settings, MessageSquare } from 'lucide-react'
import { CATEGORY_LABELS, formatFileSize } from '@/types'
import { formatNumber } from '@/lib/utils'
import Link from 'next/link'
import type { Material } from '@/types'

interface Stats {
  totalMaterials:  number
  totalUsers:      number
  totalViews:      number
  totalDownloads:  number
  byCategory:      Record<string, number>
  recentMaterials: Material[]
  topMaterials:    Material[]
}

export default function AdminDashboard() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [loading, setLoading]   = useState(true)
  const [lastUpdated, setLast]  = useState<Date | null>(null)

  const load = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/stats', { cache: 'no-store' })
      const data = await res.json()
      setStats(data)
      setLast(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 15_000)
    return () => clearInterval(id)
  }, [load])

  const STAT_CARDS = stats ? [
    { icon: FileText, label: 'Материалов',    value: stats.totalMaterials,  color: 'from-blue-500 to-blue-600',       hint: 'загружено на платформу', href: '/admin/materials' },
    { icon: Users,    label: 'Пользователей', value: stats.totalUsers,      color: 'from-emerald-500 to-emerald-600', hint: 'зарегистрировано',       href: '/admin/users' },
    { icon: Eye,      label: 'Просмотров',    value: stats.totalViews,      color: 'from-purple-500 to-purple-600',   hint: 'всего за всё время',    href: '/admin/stats' },
    { icon: Download, label: 'Скачиваний',    value: stats.totalDownloads,  color: 'from-amber-500 to-amber-600',     hint: 'всего за всё время',    href: '/admin/stats' },
  ] : []

  const QUICK_ACTIONS = [
    { icon: Upload,       label: 'Загрузить файл',    href: '/admin/upload',    color: 'bg-medical-600 hover:bg-medical-700 text-white' },
    { icon: Users,        label: 'Пользователи',      href: '/admin/users',     color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
    { icon: BarChart3,    label: 'Аналитика',         href: '/admin/stats',     color: 'bg-purple-600 hover:bg-purple-700 text-white' },
    { icon: Settings,     label: 'Настройки',         href: '/admin/settings',  color: 'bg-gray-600 hover:bg-gray-700 text-white' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Центр управления</h1>
          <p className="text-gray-500 mt-1">
            Обзор активности платформы
            {lastUpdated && (
              <span className="ml-2 text-xs text-gray-400">
                · обновлено {lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-medical-600 hover:bg-medical-50 rounded-xl transition-colors border border-gray-200"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {/* Stat cards */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0,1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-4" />
              <div className="h-8 bg-gray-100 rounded w-16 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STAT_CARDS.map((s) => (
              <Link key={s.label} href={s.href} className="bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden group hover:shadow-md hover:border-medical-200 hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-5 rounded-full -translate-y-8 translate-x-8 group-hover:opacity-10 transition-opacity`} />
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-4`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(s.value)}</p>
                <p className="text-sm font-medium text-gray-700 mt-0.5">{s.label}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  {s.hint}
                </p>
                <ArrowUpRight className="absolute top-4 right-4 w-3.5 h-3.5 text-gray-300 group-hover:text-medical-400 transition-colors" />
              </Link>
            ))}
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((a) => (
              <Link key={a.label} href={a.href}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm ${a.color}`}>
                <a.icon className="w-4 h-4 shrink-0" />
                {a.label}
              </Link>
            ))}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top materials */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Топ материалов</h2>
            <Link href="/admin/materials" className="text-xs text-medical-600 hover:underline flex items-center gap-1">
              Все <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {!stats?.topMaterials?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">Нет материалов</p>
          ) : (
            <div className="space-y-3">
              {stats.topMaterials.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 group">
                  <span className="text-sm font-bold text-gray-300 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-medical-600 transition-colors">
                      {m.title}
                    </p>
                    <p className="text-xs text-gray-400">{CATEGORY_LABELS[m.category]}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-700">{formatNumber(m.viewCount ?? 0)}</p>
                    <p className="text-xs text-gray-400">просм.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent uploads */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Последние загрузки</h2>
            <Link href="/admin/upload" className="text-xs text-medical-600 hover:underline flex items-center gap-1">
              Добавить <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {!stats?.recentMaterials?.length ? (
            <p className="text-sm text-gray-400 py-6 text-center">Ещё ничего не загружено</p>
          ) : (
            <div className="space-y-3">
              {stats.recentMaterials.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{m.fileType}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(m.fileSize)} · {m.year}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${m.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {m.isPublished ? 'Опубл.' : 'Черновик'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-5">Материалы по специальностям</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {Object.entries(stats.byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, count]) => (
                  <div key={cat} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-lg font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
