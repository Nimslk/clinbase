import Link from 'next/link'
import { MapPin, Send } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const CATEGORY_LINKS = [
  { label: 'Терапия',        href: '/library?category=THERAPY' },
  { label: 'Хирургия',       href: '/library?category=SURGERY' },
  { label: 'Кардиология',    href: '/library?category=CARDIOLOGY' },
  { label: 'Неврология',     href: '/library?category=NEUROLOGY' },
  { label: 'Педиатрия',      href: '/library?category=PEDIATRICS' },
  { label: 'Гинекология',    href: '/library?category=GYNECOLOGY' },
  { label: 'Фармакология',   href: '/library?category=PHARMACOLOGY' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand + about */}
          <div>
            <div className="mb-4">
              <Logo size="md" dark />
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Профессиональная библиотека медицинских методических материалов для врачей, ординаторов и студентов.
            </p>

            {/* Collaboration badge */}
            <div className="bg-gray-800 rounded-xl p-3.5 text-xs leading-relaxed space-y-1.5">
              <p className="text-gray-300 font-semibold">Совместный проект:</p>
              <p className="text-medical-400 font-medium">СПбГПМУ</p>
              <p className="text-gray-500 text-[11px]">Санкт-Петербургский государственный педиатрический медицинский университет</p>
              <div className="border-t border-gray-700 my-2" />
              <p className="text-medical-400 font-medium">ТГМУ</p>
              <p className="text-gray-500 text-[11px]">Ташкентский государственный медицинский университет</p>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Специальности</h3>
            <ul className="space-y-2.5">
              {CATEGORY_LINKS.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-sm hover:text-white transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Навигация</h3>
            <ul className="space-y-2.5">
              {[
                { href: '/about',     label: 'О проекте' },
                { href: '/library',   label: 'Библиотека' },
                { href: '/community', label: 'Сообщество' },
                { href: '/articles',  label: 'Статьи' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-white font-semibold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-medical-400 shrink-0 mt-0.5" />
                <span>Санкт-Петербург, Россия</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Send className="w-4 h-4 text-medical-400 shrink-0" />
                <a
                  href="https://t.me/Drcvs7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @Drcvs7
                </a>
              </li>
            </ul>

            {/* Designer credit */}
            <div className="mt-6 pt-5 border-t border-gray-800">
              <p className="text-xs text-gray-500">Основатель</p>
              <p className="text-sm text-gray-300 font-medium mt-1">Эркинов М. Л.</p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-center sm:text-left">
            <span>© {new Date().getFullYear()} ClinBase.</span>
            <span className="ml-1 text-gray-600">Совместный проект студентов СПбГПМУ и ТГМУ.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs hover:text-white transition-colors">Политика конфиденциальности</Link>
            <Link href="#" className="text-xs hover:text-white transition-colors">Условия использования</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
