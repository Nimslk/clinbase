'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Edit2, Trash2, Eye, Plus, Filter, RefreshCw } from 'lucide-react'
import type { Material } from '@/types'
import { CATEGORY_LABELS, FILE_TYPE_COLORS, formatFileSize } from '@/types'
import { formatNumber } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default function AdminMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState<Set<string>>(new Set())
  const [deleting, setDeleting]   = useState<string | null>(null)

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/materials?perPage=100')
      const data = await res.json()
      setMaterials(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMaterials() }, [fetchMaterials])

  const filtered = materials.filter(
    (m) =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.author.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот материал?')) return
    setDeleting(id)
    try {
      await fetch(`/api/materials/${id}`, { method: 'DELETE' })
      setMaterials((prev) => prev.filter((m) => m.id !== id))
      setSelected((prev) => { const s = new Set(prev); s.delete(id); return s })
    } finally {
      setDeleting(null)
    }
  }

  const handleDeleteSelected = async () => {
    if (!confirm(`Удалить ${selected.size} материалов?`)) return
    for (const id of selected) {
      await fetch(`/api/materials/${id}`, { method: 'DELETE' })
    }
    setMaterials((prev) => prev.filter((m) => !selected.has(m.id)))
    setSelected(new Set())
  }

  const toggleSelect = (id: string) =>
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((m) => m.id)))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Материалы</h1>
          <p className="text-gray-500 mt-1">{materials.length} материалов в библиотеке</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMaterials} className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors" title="Обновить">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/admin/upload"
            className="flex items-center gap-2 px-4 py-2.5 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Добавить
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или автору..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:bg-white transition-colors"
          />
        </div>
        {selected.size > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
            <span className="text-sm text-gray-500">Выбрано: {selected.size}</span>
            <button onClick={handleDeleteSelected} className="text-sm text-red-500 hover:underline">
              Удалить выбранные
            </button>
            <button onClick={() => setSelected(new Set())} className="text-sm text-gray-400 hover:underline">
              Снять выделение
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />
            <p>Загрузка...</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-gray-300 text-medical-600"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Название</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Категория</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Тип</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)}
                      className="rounded border-gray-300 text-medical-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 line-clamp-1 group-hover:text-medical-700 transition-colors">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.author} • {m.year} • {formatFileSize(m.fileSize)}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge>{CATEGORY_LABELS[m.category]}</Badge>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${FILE_TYPE_COLORS[m.fileType]}`}>
                      {m.fileType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link href={`/document/${m.id}`}
                        className="p-1.5 text-gray-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors" title="Открыть">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(m.id)}
                        disabled={deleting === m.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>{materials.length === 0 ? 'Нет материалов. Загрузите первый файл.' : 'Ничего не найдено'}</p>
            {materials.length === 0 && (
              <Link href="/admin/upload" className="inline-block mt-4 text-sm text-medical-600 hover:underline">
                Загрузить материалы →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
