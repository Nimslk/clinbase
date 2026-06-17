import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | undefined>
}

export default function Pagination({ currentPage, totalPages, searchParams }: PaginationProps) {
  const buildUrl = (page: number) => {
    const p = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => { if (v && k !== 'page') p.set(k, v) })
    if (page > 1) p.set('page', String(page))
    const qs = p.toString()
    return `/library${qs ? `?${qs}` : ''}`
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2
  )

  return (
    <nav className="flex items-center justify-center gap-1.5">
      <Link
        href={buildUrl(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage <= 1
            ? 'pointer-events-none text-gray-200'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <ChevronLeft className="w-4 h-4" />
      </Link>

      {pages.map((p, i) => {
        const prev = pages[i - 1]
        return (
          <span key={p} className="flex items-center gap-1.5">
            {prev && p - prev > 1 && (
              <span className="text-gray-300 text-sm">…</span>
            )}
            <Link
              href={buildUrl(p)}
              className={cn(
                'w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors',
                p === currentPage
                  ? 'bg-medical-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {p}
            </Link>
          </span>
        )
      })}

      <Link
        href={buildUrl(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={cn(
          'p-2 rounded-lg transition-colors',
          currentPage >= totalPages
            ? 'pointer-events-none text-gray-200'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <ChevronRight className="w-4 h-4" />
      </Link>
    </nav>
  )
}
