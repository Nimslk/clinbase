import type { Metadata } from 'next'
import { BookOpen, Heart, Shield, Users } from 'lucide-react'
import { LogoIcon } from '@/components/ui/Logo'

export const metadata: Metadata = { title: 'О проекте' }

const VALUES = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Актуальность',
    text: 'Только проверенные издания. Никаких устаревших данных — только то, что работает сегодня.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Достоверность',
    text: 'Клинические руководства, учебники и методические пособия от ведущих медицинских учреждений.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Сообщество',
    text: 'Платформа для тех, кто учится, практикует и не останавливается — независимо от уровня.',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: 'Доступность',
    text: 'Доступ к качественным медицинским знаниям не должен быть привилегией. Он должен быть нормой.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-fade-in">

      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <LogoIcon size={64} />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
          О проекте
        </h1>
        <p className="text-xl text-medical-600 font-semibold">
          Медицина — это не просто профессия. Это обязательство.
        </p>
      </div>

      {/* Manifesto */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
        {/* Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-medical-500 via-blue-500 to-medical-400" />

        <div className="px-8 sm:px-12 py-10 space-y-6 text-gray-700 leading-relaxed text-[17px]">
          <p>
            Каждый день врачи принимают решения, от которых зависят жизни.
            И каждый из них когда-то начинал с книги.
          </p>

          <p>
            Мы создали это место <strong className="text-gray-900 font-semibold">для тех, кто учится, практикует и не останавливается.</strong>{' '}
            Для тех, кто знает: в медицине нельзя позволить себе работать по устаревшим данным.
            Для тех, кто ищет не просто информацию — а знание, которому можно доверять.
          </p>

          <div className="border-l-4 border-medical-400 pl-6 py-2 my-8">
            <p className="text-xl font-semibold text-gray-900 italic">
              Это библиотека нового поколения.
            </p>
          </div>

          <p>
            Здесь собраны актуальные учебники, клинические руководства, атласы и методические пособия —
            по всем специальностям, в одном месте. Без лишнего шума. Без устаревших изданий.
            Только то, что реально нужно в учёбе и на практике.
          </p>

          <p>
            Мы верим, что <strong className="text-gray-900 font-semibold">доступ к качественным медицинским знаниям не должен быть привилегией.</strong>{' '}
            Он должен быть нормой.
          </p>
        </div>

        {/* Call to action */}
        <div className="bg-gradient-to-r from-medical-600 to-blue-600 px-8 sm:px-12 py-8 text-center">
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-wide mb-2">
            Учись. Практикуй. Расти.
          </p>
          <p className="text-medical-100 text-base leading-relaxed max-w-xl mx-auto">
            Потому что за каждым диагнозом — человек.
            И он заслуживает лучшего врача, которым ты можешь стать.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Наши принципы</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {VALUES.map((v) => (
            <div key={v.title}
              className="bg-white rounded-2xl border border-gray-100 p-6 flex gap-4 hover:border-medical-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-medical-50 text-medical-600 flex items-center justify-center shrink-0">
                {v.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Universities */}
      <div className="bg-gray-900 rounded-3xl p-8 sm:p-10 text-center">
        <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-6">Совместный проект</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
          <div>
            <p className="text-2xl font-bold text-medical-400">СПбГПМУ</p>
            <p className="text-gray-500 text-sm mt-1 max-w-[220px] mx-auto">
              Санкт-Петербургский государственный педиатрический медицинский университет
            </p>
          </div>
          <div className="text-gray-700 text-3xl font-thin hidden sm:block">×</div>
          <div className="text-gray-700 text-3xl font-thin sm:hidden">×</div>
          <div>
            <p className="text-2xl font-bold text-medical-400">ТГМУ</p>
            <p className="text-gray-500 text-sm mt-1 max-w-[220px] mx-auto">
              Ташкентский государственный медицинский университет
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-800 text-sm text-gray-600">
          Основатель: <span className="text-gray-300 font-medium">Эркинов М. Л.</span>
        </div>
      </div>

    </div>
  )
}
