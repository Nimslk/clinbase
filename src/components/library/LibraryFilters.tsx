'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Filter, X } from 'lucide-react'
import { CATEGORY_LABELS, type Category } from '@/types'

export default function LibraryFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const p = new URLSearchParams(params.toString())
      if (value) p.set(key, value)
      else        p.delete(key)
      p.delete('page')
      router.push(`/library?${p.toString()}`)
    },
    [params, router]
  )

  const clearAll = () => {
    const q = params.get('q')
    router.push(q ? `/library?q=${encodeURIComponent(q)}` : '/library')
  }

  const hasFilters = params.has('category')

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <Filter className="w-4 h-4 text-medical-600" />
          Фильтры
        </div>
        {hasFilters && (
          <button onClick={clearAll}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <X className="w-3.5 h-3.5" />
            Сбросить
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Специальность</h4>
        <div className="space-y-1.5">
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={params.get('category') === cat}
                onChange={() => updateFilter('category', params.get('category') === cat ? null : cat)}
                className="w-3.5 h-3.5 text-medical-600 border-gray-300 focus:ring-medical-500"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                {CATEGORY_LABELS[cat]}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
