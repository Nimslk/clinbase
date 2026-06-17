import type { Metadata } from 'next'
import { Crown, Sparkles, Zap, Shield, BookOpen, HeartHandshake } from 'lucide-react'

export const metadata: Metadata = { title: 'Премиум — ClinBase' }

const TEASERS = [
  { icon: Zap,            title: 'Мгновенный доступ',    desc: 'Все материалы без ограничений и ожидания одобрения' },
  { icon: Shield,         title: 'Эксклюзивный контент', desc: 'Клинические разборы и кейсы от ведущих специалистов' },
  { icon: BookOpen,       title: 'Офлайн-библиотека',    desc: 'Скачивайте любые материалы для работы без интернета' },
  { icon: HeartHandshake, title: 'Личный куратор',       desc: 'Персональный подбор материалов по вашей специализации' },
  { icon: Sparkles,       title: 'AI-ассистент',         desc: 'Умный помощник для анализа клинических рекомендаций' },
  { icon: Crown,          title: 'Приоритет поддержки',  desc: 'Ответ от команды в течение часа по любому вопросу' },
]

export default function PremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-medical-50/30 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-400/20 to-yellow-300/20 border border-amber-300/40 rounded-full text-amber-700 text-sm font-medium mb-8">
          <Crown className="w-4 h-4 fill-amber-500 text-amber-500" />
          Скоро что-то грандиозное
        </div>

        {/* Heading */}
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
          ClinBase{' '}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
            Premium
          </span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-4">
          Мы работаем над премиум-подпиской, которая изменит то, как врачи, ординаторы и студенты работают с медицинскими знаниями.
        </p>

        <p className="text-base text-gray-400 max-w-xl mx-auto mb-6">
          Раньше всех узнаете о запуске — подпишитесь на наш Telegram-канал
        </p>

        <a
          href="https://t.me/+Ibu8NJx9BMU2YTFi"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#229ED9] hover:bg-[#1a8fc4] text-white text-sm font-semibold rounded-xl transition-colors shadow-md mb-16"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 1 0 24 12 12 12 0 0 0 11.944 0ZM18.852 8.22l-2.06 9.71c-.154.69-.563.858-1.14.534l-3.145-2.316-1.518 1.46c-.168.168-.309.309-.634.309l.226-3.2 5.828-5.265c.253-.224-.057-.35-.391-.126L6.055 14.655 3.02 13.73c-.679-.213-.692-.679.143-1.005l14.686-5.663c.565-.206 1.059.129.904.998l-.9.16z"/>
          </svg>
          Подписаться на канал
        </a>

        {/* Feature teasers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left mb-16">
          {TEASERS.map((t) => (
            <div
              key={t.title}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <t.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{t.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA card */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl blur-xl opacity-30 scale-105" />
          <div className="relative bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl px-10 py-8 text-white shadow-xl">
            <Crown className="w-10 h-10 mx-auto mb-3 fill-white/30 text-white" />
            <p className="text-2xl font-bold mb-2">В разработке</p>
            <p className="text-white/80 text-sm max-w-xs mx-auto">
              Наша команда создаёт нечто особенное. Следите за новостями.
            </p>
          </div>
        </div>

        {/* Back */}
        <div className="mt-12">
          <a href="/" className="text-sm text-gray-400 hover:text-medical-600 transition-colors">
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  )
}
