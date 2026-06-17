'use client'
import Link from 'next/link'
import { Eye, Download, Heart, FileText, BookOpen, Presentation } from 'lucide-react'
import { type Material, CATEGORY_LABELS, FILE_TYPE_COLORS, formatFileSize } from '@/types'
import { cn, formatNumber } from '@/lib/utils'
import StarRating from '@/components/ui/StarRating'
import Badge from '@/components/ui/Badge'

interface MaterialCardProps {
  material: Material
  onFavorite?: (id: string) => void
}

const FILE_ICONS: Record<string, React.ReactNode> = {
  PDF:  <FileText className="w-5 h-5" />,
  DOCX: <BookOpen className="w-5 h-5" />,
  PPTX: <Presentation className="w-5 h-5" />,
}

export default function MaterialCard({ material, onFavorite }: MaterialCardProps) {
  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-medical-200 hover:shadow-xl hover:shadow-medical-50/60 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-medical-400 to-blue-400" />

      <div className="flex flex-col flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold', FILE_TYPE_COLORS[material.fileType])}>
            {FILE_ICONS[material.fileType]}
            {material.fileType}
          </div>

          <button
            onClick={() => onFavorite?.(material.id)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              material.isFavorite
                ? 'text-red-500 bg-red-50 hover:bg-red-100'
                : 'text-gray-300 hover:text-red-400 hover:bg-red-50'
            )}
            title={material.isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Heart className={cn('w-4 h-4', material.isFavorite && 'fill-current')} />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-medical-700 transition-colors">
          {material.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-4 flex-1">
          {material.description}
        </p>

        {/* Meta */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium text-gray-700 truncate">{material.author}</span>
            <span className="text-gray-300">•</span>
            <span>{material.year}</span>
          </div>

          <div className="flex items-center justify-between">
            <Badge>{CATEGORY_LABELS[material.category]}</Badge>
            <span className="text-xs text-gray-400">{formatFileSize(material.fileSize)}</span>
          </div>

          <div className="flex items-center justify-between">
            {material.avgRating ? (
              <StarRating rating={material.avgRating} />
            ) : (
              <span className="text-xs text-gray-400">Нет оценок</span>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{formatNumber(material.viewCount)}</span>
              <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{formatNumber(material.downloadCount)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/document/${material.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            Открыть
          </Link>
          <a
            href={material.fileUrl}
            download
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <Download className="w-3.5 h-3.5" />
            Скачать
          </a>
        </div>
      </div>
    </div>
  )
}
