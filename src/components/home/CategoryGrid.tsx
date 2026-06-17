'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CATEGORY_LABELS, CATEGORY_ICONS, type Category } from '@/types'

const CATEGORIES: { key: Category; color: string; bg: string }[] = [
  { key: 'THERAPY',        color: 'from-blue-500 to-blue-600',       bg: 'bg-blue-50' },
  { key: 'SURGERY',        color: 'from-slate-600 to-slate-700',     bg: 'bg-slate-50' },
  { key: 'CARDIOLOGY',     color: 'from-red-500 to-rose-600',        bg: 'bg-red-50' },
  { key: 'NEUROLOGY',      color: 'from-purple-500 to-purple-600',   bg: 'bg-purple-50' },
  { key: 'PEDIATRICS',     color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
  { key: 'GYNECOLOGY',     color: 'from-pink-500 to-pink-600',       bg: 'bg-pink-50' },
  { key: 'ANESTHESIOLOGY', color: 'from-amber-500 to-amber-600',     bg: 'bg-amber-50' },
  { key: 'PHARMACOLOGY',   color: 'from-teal-500 to-teal-600',       bg: 'bg-teal-50' },
  { key: 'OTHER',          color: 'from-indigo-500 to-indigo-600',   bg: 'bg-indigo-50' },
]

export default function CategoryGrid() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCounts)
      .catch(() => {})
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Специальности</h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Материалы систематизированы по медицинским специальностям для удобного поиска
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const count = counts[cat.key] ?? 0
          return (
            <Link
              key={cat.key}
              href={`/library?category=${cat.key}`}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 hover:shadow-lg hover:shadow-gray-100/80 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${cat.color} rounded-l-2xl`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                {CATEGORY_ICONS[cat.key]}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-medical-600 transition-colors">
                {CATEGORY_LABELS[cat.key]}
              </h3>
              <p className={`text-sm font-medium ${count === 0 ? 'text-gray-300' : 'text-gray-400'}`}>
                {count === 0 ? 'Нет материалов' : `${count} ${decline(count)}`}
              </p>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-medical-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function decline(n: number): string {
  const mod10  = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'материал'
  if ([2,3,4].includes(mod10) && ![12,13,14].includes(mod100)) return 'материала'
  return 'материалов'
}
