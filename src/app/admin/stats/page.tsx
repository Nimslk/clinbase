'use client'
import { useEffect, useState, useCallback } from 'react'
import { BarChart3, Download, Eye, FileText, RefreshCw, Users } from 'lucide-react'
import { CATEGORY_LABELS, type Category, formatFileSize } from '@/types'
import { formatNumber } from '@/lib/utils'
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

export default function AdminStatsPage() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLast] = useState<Date | null>(null)

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

  const sortedCategories = stats
    ? Object.entries(stats.byCategory).sort(([, a], [, b]) => b - a)
    : []
  const maxCount = sortedCategories.length ? Math.max(...sortedCategories.map(([, v]) => v)) : 1

  const topDownloads = stats
    ? [...(stats.topMaterials ?? [])].sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
    : []

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Аналитика</h1>
          <p className="text-gray-500 mt-1">
            Реальные показатели платформы
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

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !stats ? (
          [0,1,2,3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 rounded-xl mb-3" />
              <div className="h-7 bg-gray-100 rounded w-14 mb-1" />
              <div className="h-4 bg-gray-100 rounded w-24" />
            </div>
          ))
        ) : stats && (
          [
            { icon: FileText, label: 'Всего материалов', value: stats.totalMaterials,  color: 'text-blue-600 bg-blue-50' },
            { icon: Users,    label: 'Пользователей',   value: stats.totalUsers,      color: 'text-emerald-600 bg-emerald-50' },
            { icon: Eye,      label: 'Просмотров',      value: stats.totalViews,      color: 'text-purple-600 bg-purple-50' },
            { icon: Download, label: 'Скачиваний',      value: stats.totalDownloads,  color: 'text-amber-600 bg-amber-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(s.value)}</p>
              <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By category */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-medical-500" />
            Материалы по специальностям
          </h2>
          {!sortedCategories.length ? (
            <p className="text-sm text-gray-400 py-8 text-center">Нет данных — загрузите первый материал</p>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-700">{CATEGORY_LABELS[cat as Category] ?? cat}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-medical-500 to-medical-400 rounded-full transition-all duration-700"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top downloads */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Download className="w-4 h-4 text-amber-500" />
            Топ скачиваний
          </h2>
          {!topDownloads.length ? (
            <p className="text-sm text-gray-400 py-8 text-center">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {topDownloads.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{CATEGORY_LABELS[m.category as Category] ?? m.category}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 shrink-0">
                    <Download className="w-3.5 h-3.5" />
                    {formatNumber(m.downloadCount ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top views */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Eye className="w-4 h-4 text-purple-500" />
            Топ просмотров
          </h2>
          {!stats?.topMaterials?.length ? (
            <p className="text-sm text-gray-400 py-8 text-center">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {stats.topMaterials.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-300 w-5 shrink-0">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.author} · {formatFileSize(m.fileSize)}</p>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-semibold text-blue-600 shrink-0">
                    <Eye className="w-3.5 h-3.5" />
                    {formatNumber(m.viewCount ?? 0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary card */}
        <div className="bg-gradient-to-br from-medical-500 to-medical-700 rounded-2xl p-6 text-white">
          <h2 className="font-semibold mb-4 opacity-90">Итоги платформы</h2>
          <div className="space-y-3">
            {stats && [
              { label: 'Материалов в базе',    val: `${stats.totalMaterials} файлов` },
              { label: 'Специальностей',       val: `${sortedCategories.length} из 9` },
              { label: 'Зарегистрировано',     val: `${stats.totalUsers} пользователей` },
              { label: 'Всего взаимодействий', val: formatNumber(stats.totalViews + stats.totalDownloads) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                <span className="text-sm opacity-80">{row.label}</span>
                <span className="text-sm font-semibold">{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
