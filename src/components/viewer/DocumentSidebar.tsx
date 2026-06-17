'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Download, Heart, Star, MessageSquare,
  Eye, Share2, BookOpen, FileText, ChevronDown, ChevronUp
} from 'lucide-react'
import { type Material, CATEGORY_LABELS, formatFileSize } from '@/types'
import { formatNumber } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'

interface Props { material: Material }

const MOCK_COMMENTS = [
  { id: '1', author: 'Д-р Николаев П.', text: 'Отличное руководство! Очень структурировано и актуально.', date: '2024-03-10' },
  { id: '2', author: 'Ординатор Смирнова А.', text: 'Использую ежедневно на практике. Рекомендую коллегам.', date: '2024-03-08' },
]

export default function DocumentSidebar({ material }: Props) {
  const [tab, setTab] = useState<'info' | 'comments'>('info')
  const [userRating, setUserRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [expanded, setExpanded] = useState(false)

  return (
    <aside className="w-80 shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-hidden">
      {/* Back */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <Link href="/library" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </Link>
        <span className="text-sm font-medium text-gray-700 truncate">Назад в библиотеку</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['info', 'comments'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              tab === t
                ? 'border-medical-600 text-medical-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'info' ? 'Информация' : 'Комментарии'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'info' ? (
          <div className="p-5 space-y-5">
            <div>
              <h2 className="font-semibold text-gray-900 text-sm leading-snug mb-3">
                {material.title}
              </h2>
              <p className={`text-xs text-gray-500 leading-relaxed ${!expanded && 'line-clamp-3'}`}>
                {material.description}
              </p>
              {material.description.length > 150 && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="text-xs text-medical-600 hover:underline mt-1 flex items-center gap-1"
                >
                  {expanded ? <><ChevronUp className="w-3 h-3" />Свернуть</> : <><ChevronDown className="w-3 h-3" />Читать далее</>}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Eye className="w-4 h-4" />, value: formatNumber(material.viewCount), label: 'Просмотров' },
                { icon: <Download className="w-4 h-4" />, value: formatNumber(material.downloadCount), label: 'Скачиваний' },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className="flex justify-center text-medical-500 mb-1">{s.icon}</div>
                  <div className="text-lg font-bold text-gray-900">{s.value}</div>
                  <div className="text-xs text-gray-400">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Meta */}
            <div className="space-y-2.5 text-sm">
              {[
                { label: 'Автор', value: material.author },
                { label: 'Год', value: String(material.year) },
                { label: 'Страниц', value: material.pageCount ? String(material.pageCount) : '—' },
                { label: 'Размер', value: formatFileSize(material.fileSize) },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="font-medium text-gray-700 text-right max-w-[160px] truncate">{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Категория</span>
                <Badge>{CATEGORY_LABELS[material.category]}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Рейтинг</span>
                {material.avgRating
                  ? <StarRating rating={material.avgRating} size="md" />
                  : <span className="text-gray-400 text-xs">Нет оценок</span>
                }
              </div>
            </div>

            {/* Rate */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-medium text-gray-500 mb-2">Ваша оценка</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setUserRating(s)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${s <= userRating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5">
              <a
                href={material.fileUrl}
                download
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Скачать {material.fileType}
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFavorite((f) => !f)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-xl border transition-all ${
                    isFavorite
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-red-200 hover:text-red-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'В избранном' : 'Избранное'}
                </button>
                <button className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            {/* Add comment */}
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Оставьте комментарий..."
                rows={3}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 placeholder-gray-400 transition-all"
              />
              <button className="mt-2 w-full py-2 text-sm font-medium bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition-colors">
                Отправить
              </button>
            </div>

            {/* Comments list */}
            <div className="space-y-3">
              {MOCK_COMMENTS.map((c) => (
                <div key={c.id} className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 rounded-full bg-medical-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-medical-600">{c.author[0]}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{c.author}</p>
                      <p className="text-[10px] text-gray-400">{c.date}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
