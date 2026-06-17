'use client'
import { useState, useEffect, useRef } from 'react'
import { Search, X, ExternalLink, BookMarked, FlaskConical, Globe, Library, Microscope, BookOpen, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

const isCyrillic = (s: string) => /[а-яёА-ЯЁ]/.test(s)

async function translateToEnglish(text: string): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ru|en`,
      { signal: AbortSignal.timeout(3000) }
    )
    const json = await res.json()
    return json?.responseData?.translatedText ?? text
  } catch {
    return text
  }
}

const SOURCES = [
  {
    id:      'pubmed',
    name:    'PubMed',
    desc:    'Крупнейшая база биомедицинской литературы — 36 млн статей',
    icon:    <Microscope className="w-5 h-5" />,
    color:   'from-blue-500 to-blue-700',
    bg:      'bg-blue-50 border-blue-100',
    english: true,
    url:     (q: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(q)}`,
  },
  {
    id:      'uptodate',
    name:    'UpToDate',
    desc:    'Клинические рекомендации и руководства для врачей',
    icon:    <BookMarked className="w-5 h-5" />,
    color:   'from-green-500 to-green-700',
    bg:      'bg-green-50 border-green-100',
    english: true,
    url:     (q: string) => `https://www.uptodate.com/contents/search?search=${encodeURIComponent(q)}`,
  },
  {
    id:      'scholar',
    name:    'Google Scholar',
    desc:    'Научные статьи на русском и английском языках',
    icon:    <Globe className="w-5 h-5" />,
    color:   'from-red-500 to-red-600',
    bg:      'bg-red-50 border-red-100',
    english: true,
    url:     (q: string) => `https://scholar.google.com/scholar?hl=ru&q=${encodeURIComponent(q)}`,
  },
  {
    id:      'cochrane',
    name:    'Cochrane Library',
    desc:    'Систематические обзоры и метаанализы',
    icon:    <FlaskConical className="w-5 h-5" />,
    color:   'from-purple-500 to-purple-700',
    bg:      'bg-purple-50 border-purple-100',
    english: true,
    url:     (q: string) => `https://www.cochranelibrary.com/search?q=${encodeURIComponent(q)}`,
  },
  {
    id:      'cyberleninka',
    name:    'КиберЛенинка',
    desc:    'Российские научные статьи в открытом доступе',
    icon:    <Library className="w-5 h-5" />,
    color:   'from-cyan-500 to-cyan-700',
    bg:      'bg-cyan-50 border-cyan-100',
    english: false,
    url:     (q: string) => `https://cyberleninka.ru/search#q=${encodeURIComponent(q)}`,
  },
  {
    id:      'elibrary',
    name:    'eLibrary.ru',
    desc:    'Российский индекс научного цитирования (РИНЦ)',
    icon:    <BookOpen className="w-5 h-5" />,
    color:   'from-orange-500 to-orange-600',
    bg:      'bg-orange-50 border-orange-100',
    english: false,
    url:     (q: string) => `https://elibrary.ru/query_results.asp?query=${encodeURIComponent(q)}&show_option=0`,
  },
]

export default function MedSearch() {
  const [open, setOpen]           = useState(false)
  const [query, setQuery]         = useState('')
  const [translating, setTrans]   = useState(false)
  const [translated, setTranslated] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen((v) => !v) }
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQuery(''); setTranslated(null) }
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Auto-translate when query has Cyrillic and stops changing
  useEffect(() => {
    setTranslated(null)
    if (!query.trim() || !isCyrillic(query)) return
    const t = setTimeout(async () => {
      setTrans(true)
      const en = await translateToEnglish(query.trim())
      setTranslated(en !== query.trim() ? en : null)
      setTrans(false)
    }, 600)
    return () => clearTimeout(t)
  }, [query])

  const getUrl = async (source: typeof SOURCES[number]): Promise<string> => {
    if (!query.trim()) return source.url('medicine')
    if (source.english && isCyrillic(query)) {
      const en = translated ?? (await translateToEnglish(query.trim()))
      return source.url(en)
    }
    return source.url(query.trim())
  }

  const openSource = async (source: typeof SOURCES[number]) => {
    const url = await getUrl(source)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const searchAll = async () => {
    if (!query.trim()) return
    for (const s of SOURCES) {
      const url = await getUrl(s)
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        title="Поиск в медицинских базах (Ctrl+K)"
        className="relative p-2 rounded-xl text-gray-500 hover:bg-medical-50 hover:text-medical-600 transition-colors group"
      >
        <Search className="w-5 h-5" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-medical-500 rounded-full border-2 border-white group-hover:scale-110 transition-transform" />
      </button>

      {/* Floating panel — no dark overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4 pointer-events-none">
          <div
            ref={panelRef}
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden pointer-events-auto animate-slide-up"
            style={{ boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25)' }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-medical-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && query.trim() && searchAll()}
                placeholder="Введите запрос на русском или английском..."
                className="flex-1 text-base text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => { setQuery(''); setTranslated(null) }} className="text-gray-300 hover:text-gray-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Translation hint */}
            {(translating || translated) && (
              <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-700">
                <Languages className="w-3.5 h-3.5 shrink-0" />
                {translating
                  ? 'Перевожу запрос на английский...'
                  : `Перевод для EN-баз: «${translated}»`
                }
              </div>
            )}

            {/* Sources */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Медицинские базы данных</p>
                {query.trim() && (
                  <button
                    onClick={searchAll}
                    className="text-xs font-medium text-medical-600 hover:text-medical-700 bg-medical-50 hover:bg-medical-100 px-3 py-1 rounded-lg transition-colors"
                  >
                    Искать везде →
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SOURCES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => openSource(s)}
                    className={cn(
                      'flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 group',
                      s.bg
                    )}
                  >
                    <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-sm', s.color)}>
                      {s.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                        {s.english && isCyrillic(query) && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded font-medium">EN</span>
                        )}
                        <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                {query.trim()
                  ? isCyrillic(query)
                    ? 'Русский запрос — автоматически переведу для EN-баз'
                    : `Поиск: «${query}» — выберите базу или нажмите Enter`
                  : 'Введите запрос и выберите базу данных'}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">Ctrl</kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono">K</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
