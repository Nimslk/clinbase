'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, ExternalLink, BookOpen, Users, Calendar, X, Languages, ChevronLeft, ChevronRight, Microscope, Loader2 } from 'lucide-react'

interface Article {
  id:      string
  title:   string
  authors: string
  journal: string
  year:    string
  doi:     string | null
  pmid:    string
  url:     string
}

interface SearchResult {
  articles:   Article[]
  total:      number
  query:      string
  translated: string | null
}

const PER_PAGE = 10

export default function ArticlesPage() {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<SearchResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [page, setPage]           = useState(1)
  const [error, setError]         = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const doSearch = useCallback(async (q: string, p = 1) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/search/articles?q=${encodeURIComponent(q)}&page=${p}&perPage=${PER_PAGE}`)
      const data = await res.json()
      if (!res.ok) throw new Error('Ошибка запроса')
      setResults(data)
      setPage(p)
    } catch {
      setError('Не удалось получить результаты. Проверьте интернет-соединение.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query, 1)
  }

  const totalPages = results ? Math.ceil(results.total / PER_PAGE) : 0

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero search bar */}
      <div className="bg-gradient-to-br from-medical-600 to-medical-800 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-sm mb-5 border border-white/20">
            <Microscope className="w-4 h-4" />
            Поиск в PubMed — 36 млн статей
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Поиск научных статей
          </h1>
          <p className="text-white/70 mb-8 text-base">
            Введите запрос на русском или английском — мы автоматически переведём
          </p>

          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Например: инфаркт миокарда, diabetes mellitus, COVID-19..."
                autoFocus
                className="w-full pl-12 pr-32 py-4 text-gray-900 text-base rounded-2xl border-0 shadow-xl outline-none focus:ring-2 focus:ring-white/40 transition-all"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setResults(null) }}
                  className="absolute right-[108px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-medical-600 hover:bg-medical-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Найти'}
              </button>
            </div>
          </form>

          {/* Quick queries */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Кардиология', 'Онкология', 'Neoplasms', 'Hypertension', 'Pediatrics'].map((q) => (
              <button key={q}
                onClick={() => { setQuery(q); doSearch(q, 1) }}
                className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results area */}
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Translation notice */}
        {results?.translated && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-sm px-4 py-2.5 rounded-xl mb-5">
            <Languages className="w-4 h-4 shrink-0" />
            Запрос переведён на английский: <strong className="ml-1">«{results.translated}»</strong>
          </div>
        )}

        {/* Stats */}
        {results && !loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              Найдено <span className="font-semibold text-gray-900">{results.total.toLocaleString('ru-RU')}</span> статей
              {results.query && <> по запросу <span className="font-medium">«{results.query}»</span></>}
            </p>
            <p className="text-xs text-gray-400">Источник: PubMed / NCBI</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            ⚠ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Articles list */}
        {!loading && results?.articles.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Ничего не найдено</p>
            <p className="text-sm text-gray-400 mt-1">Попробуйте другой запрос</p>
          </div>
        )}

        {!loading && results && results.articles.length > 0 && (
          <div className="space-y-4">
            {results.articles.map((a, i) => (
              <article key={a.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-bold text-gray-200 shrink-0 mt-0.5 w-5">
                    {(page - 1) * PER_PAGE + i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a href={a.url} target="_blank" rel="noopener noreferrer"
                       className="block text-base font-semibold text-gray-900 group-hover:text-medical-600 transition-colors leading-snug mb-2"
                       dangerouslySetInnerHTML={{ __html: a.title }} />

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                      {a.authors && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {a.authors}
                        </span>
                      )}
                      {a.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {a.year}
                        </span>
                      )}
                      {a.journal && (
                        <span className="flex items-center gap-1 italic">
                          <BookOpen className="w-3 h-3" /> {a.journal}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <a href={a.url} target="_blank" rel="noopener noreferrer"
                         className="inline-flex items-center gap-1.5 text-xs font-medium text-medical-600 hover:text-medical-700 bg-medical-50 hover:bg-medical-100 px-3 py-1.5 rounded-lg transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Открыть в PubMed
                      </a>
                      {a.doi && (
                        <a href={`https://doi.org/${a.doi}`} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                          DOI: {a.doi}
                        </a>
                      )}
                      <span className="text-xs text-gray-300">PMID: {a.pmid}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => doSearch(query, page - 1)}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Назад
            </button>
            <span className="text-sm text-gray-500">
              Страница {page} из {Math.min(totalPages, 100)}
            </span>
            <button
              onClick={() => doSearch(query, page + 1)}
              disabled={page >= Math.min(totalPages, 100)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Вперёд <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {!loading && !results && (
          <div className="text-center py-20 text-gray-300">
            <Microscope className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-base">Введите запрос для поиска статей</p>
            <p className="text-sm text-gray-300 mt-1">Поиск работает по базе PubMed — крупнейшей медицинской библиотеке</p>
          </div>
        )}
      </div>
    </div>
  )
}
