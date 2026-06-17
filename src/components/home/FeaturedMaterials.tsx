import Link from 'next/link'
import { ArrowRight, TrendingUp, Upload, BookOpen } from 'lucide-react'
import MaterialCard from '@/components/library/MaterialCard'
import { MOCK_MATERIALS } from '@/lib/mock-data'

export default function FeaturedMaterials() {
  const featured = MOCK_MATERIALS.slice(0, 4)

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-medical-600 text-sm font-semibold mb-1">
            <TrendingUp className="w-4 h-4" />
            Популярное
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Рекомендуемые материалы</h2>
        </div>
        <Link
          href="/library"
          className="flex items-center gap-1.5 text-sm font-medium text-medical-600 hover:text-medical-700 transition-colors"
        >
          Все материалы
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {featured.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-medical-50 rounded-2xl flex items-center justify-center mb-5">
            <BookOpen className="w-9 h-9 text-medical-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Библиотека пуста</h3>
          <p className="text-sm text-gray-400 max-w-xs mb-6">
            Загрузите первые материалы через панель администратора — они появятся здесь
          </p>
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Загрузить материалы
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((m) => (
            <MaterialCard key={m.id} material={m} />
          ))}
        </div>
      )}
    </section>
  )
}
