'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, Users, BarChart3,
  Upload, Settings, LogOut, ChevronRight
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin',           icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/admin/materials', icon: FileText,         label: 'Материалы' },
  { href: '/admin/upload',    icon: Upload,           label: 'Загрузка' },
  { href: '/admin/users',     icon: Users,            label: 'Пользователи' },
  { href: '/admin/stats',     icon: BarChart3,        label: 'Статистика' },
  { href: '/admin/settings',  icon: Settings,         label: 'Настройки' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="block">
          <Logo size="sm" />
          <p className="text-[10px] text-gray-400 mt-1 ml-0.5">Admin Panel</p>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-medical-50 text-medical-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4.5 h-4.5 shrink-0', active ? 'text-medical-600' : 'text-gray-400 group-hover:text-gray-600')} style={{ width: 18, height: 18 }} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-medical-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <a href="/api/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-medical-600 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">АД</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Администратор</p>
            <p className="text-xs text-red-400 mt-0.5">Выйти</p>
          </div>
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors shrink-0" />
        </a>
      </div>
    </aside>
  )
}
