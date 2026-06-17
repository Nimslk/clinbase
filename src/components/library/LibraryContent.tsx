'use client'
import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, List, Upload, BookOpen } from 'lucide-react'
import Link from 'next/link'
import LibraryFilters from './LibraryFilters'
import MaterialCard from './MaterialCard'
import Pagination from './Pagination'
import type { Material } from '@/types'
import { cn } from '@/lib/utils'

const PER_PAGE = 9

interface ApiResult {
  data: Material[]
  total: number
  totalPages: number
}

interface Props {
  searchParams: Record<string, string | undefined>
}

export default function LibraryContent({ searchParams }: Props) {
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid')
  const [result, setResult]       = useState<ApiResult>({ data: [], total: 0, totalPages: 1 })
  const [loading, setLoading]     = useState(true)

  const page = Number(searchParams.page ?? 1)

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchParams.q)        params.set('q',        searchParams.q)
    if (searchParams.category) params.set('category', searchParams.category)
    if (searchParams.year)     params.set('year',     searchParams.year)
    if (searchParams.fileType) params.set('fileType', searchParams.fileType)
    params.set('page',    String(page))
    params.set('perPage', String(PER_PAGE))

    try {
      const res  = await fetch(`/api/materials?${params.toString()}`)
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ data: [], total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [searchParams, page])

  useEffect(() => { fetchMaterials() }, [fetchMaterials])

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <LibraryFilters />
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-sm text-gray-500">
            {loading ? (
              <span>Загрузка...</span>
            ) : result.total > 0 ? (
              <span>
                Найдено <strong className="text-gray-900">{result.total}</strong> материалов
                {searchParams.q && (
                  <span> по запросу «<strong className="text-medical-600">{searchParams.q}</strong>»</span>
                )}
              </span>
            ) : (
              <span>Ничего не найдено</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded-lg transition-colors', viewMode === 'grid' ? 'bg-medical-100 text-medical-600' : 'text-gray-400 hover:bg-gray-100')}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-lg transition-colors', viewMode === 'list' ? 'bg-medical-100 text-medical-600' : 'text-gray-400 hover:bg-gray-100')}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
              : 'flex flex-col gap-4'
          )}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && result.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
              <BookOpen className="w-9 h-9 text-gray-300" />
            </div>
            {result.total === 0 && !searchParams.q && !searchParams.category ? (
              <>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Библиотека пуста</h3>
                <p className="text-sm text-gray-400 max-w-xs mb-6">
                  Загрузите первые материалы через панель администратора
                </p>
                <Link
                  href="/admin/upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
                >
                  <Upload className="w-4 h-4" />
                  Загрузить материалы
                </Link>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Материалы не найдены</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Попробуйте изменить параметры поиска или сбросить фильтры
                </p>
              </>
            )}
          </div>
        )}

        {/* Grid */}
        {!loading && result.data.length > 0 && (
          <>
            <div className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
            )}>
              {result.data.map((m) => (
                <MaterialCard key={m.id} material={m} />
              ))}
            </div>

            {result.totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={result.totalPages}
                  searchParams={searchParams}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
