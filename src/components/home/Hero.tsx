'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles } from 'lucide-react'

const SUGGESTIONS = ['Кардиология', 'Хирургия', 'Антибиотики', 'Неврология', 'Педиатрия', 'ЭКГ']

export default function Hero() {
  const [query, setQuery]         = useState('')
  const [totalMats, setTotalMats] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((counts: Record<string, number>) => {
        const total = Object.values(counts).reduce((a, b) => a + b, 0)
        setTotalMats(total)
      })
      .catch(() => setTotalMats(0))
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/library?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-medical-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-medical-100/60 dark:from-medical-900/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-medical-100/30 dark:bg-medical-900/10 rounded-full blur-2xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-1.5 bg-medical-100 text-medical-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Совместный проект СПбГПМУ × ТГМУ
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-6">
          Медицинские методички
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-medical-600 to-blue-500">
            в одном месте
          </span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Актуальные методические материалы: клинические рекомендации, руководства, учебные пособия — для врачей всех специальностей.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-medical-100/50 dark:shadow-none border border-gray-100 dark:border-slate-700 overflow-hidden transition-shadow focus-within:shadow-xl focus-within:shadow-medical-100/70">
            <Search className="absolute left-5 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по названию, автору, специальности..."
              className="flex-1 pl-14 pr-4 py-4 text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none"
            />
            <button type="submit"
              className="m-2 px-6 py-2.5 bg-medical-600 text-white font-medium rounded-xl text-sm hover:bg-medical-700 transition-colors shadow-sm shrink-0">
              Найти
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-gray-400">Популярное:</span>
          {SUGGESTIONS.map((s) => (
            <button key={s}
              onClick={() => router.push(`/library?q=${encodeURIComponent(s)}`)}
              className="text-sm px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-lg hover:border-medical-400 hover:text-medical-600 hover:bg-medical-50 transition-all">
              {s}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-gray-100 dark:border-slate-700">
          {[
            { value: totalMats === null ? '...' : String(totalMats), label: 'Материалов' },
            { value: '9',    label: 'Специальностей' },
            { value: '2',    label: 'Университета' },
            { value: '100%', label: 'Актуальность' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
