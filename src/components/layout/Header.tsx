'use client'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, LogOut, Settings, ChevronDown, Crown, Microscope, Users, Sun, Moon, Info } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useRouter } from 'next/navigation'
import NotificationBell from './NotificationBell'
import Logo, { LogoIcon } from '@/components/ui/Logo'

interface Me {
  userId:      string
  email:       string
  role:        string
  avatarEmoji?: string
  name?:       string
}

function roleLabel(role: string) {
  if (role === 'ADMIN')  return 'BOSS'
  if (role === 'EDITOR') return 'Редактор'
  return 'Пользователь'
}

export default function Header() {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [me, setMe]               = useState<Me | null | 'loading'>('loading')
  const [userMenu, setUserMenu]   = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const router  = useRouter()

  useEffect(() => {
    fetch('/api/auth/me').then((r) => r.json()).then(setMe).catch(() => setMe(null))
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setMe(null)
    setUserMenu(false)
    router.push('/')
    router.refresh()
  }

  const { theme, toggle: toggleTheme } = useTheme()
  const isLoggedIn = me && me !== 'loading'
  const isAdmin    = isLoggedIn && (me.role === 'ADMIN' || me.role === 'EDITOR')

  const UserAvatar = ({ size = 7 }: { size?: number }) => {
    const s = `w-${size} h-${size}`
    if (isLoggedIn && me !== 'loading' && me.avatarEmoji) {
      return (
        <div className={`${s} rounded-full bg-gray-100 flex items-center justify-center text-base leading-none`}>
          {me.avatarEmoji}
        </div>
      )
    }
    return (
      <div className={`${s} rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center`}>
        <span className="text-xs font-bold text-white">
          {isLoggedIn && me !== 'loading' ? (me.name?.[0] ?? me.email[0]).toUpperCase() : '?'}
        </span>
      </div>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="hidden sm:block"><Logo size="md" /></span>
            <span className="sm:hidden"><LogoIcon size={32} /></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-auto">
            <Link href="/library" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors">
              Библиотека
            </Link>

            <Link href="/articles" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors">
              <Microscope className="w-4 h-4" />
              Статьи
            </Link>

            <Link href="/about" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors">
              <Info className="w-4 h-4" />
              О проекте
            </Link>

{isLoggedIn && (
              <Link href="/community" className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-colors">
                <Users className="w-4 h-4" />
                Сообщество
              </Link>
            )}

            <button onClick={toggleTheme} title={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link href="/premium" title="Премиум"
              className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 hover:text-amber-600 transition-colors">
              <Crown className="w-5 h-5" />
            </Link>

            {isLoggedIn && <NotificationBell />}

            {me === 'loading' ? (
              <div className="w-24 h-8 bg-gray-100 animate-pulse rounded-xl ml-2" />
            ) : isLoggedIn ? (
              <div ref={dropRef} className="relative ml-2">
                <button
                  onClick={() => setUserMenu((v) => !v)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <UserAvatar size={7} />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {me.name ?? me.email.split('@')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenu ? 'rotate-180' : ''}`} />
                </button>

                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-gray-50 dark:border-slate-700 flex items-center gap-3">
                      <UserAvatar size={8} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{me.name ?? me.email.split('@')[0]}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{me.email}</p>
                        <p className={`text-[10px] font-bold mt-0.5 ${me.role === 'ADMIN' ? 'text-amber-600' : 'text-gray-400'}`}>
                          {roleLabel(me.role)}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Settings className="w-4 h-4 text-gray-400" />
                        Панель управления
                      </Link>
                    )}
                    <button onClick={logout}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-medical-600 hover:bg-medical-50 rounded-xl transition-colors border border-gray-200">
                  Войти
                </Link>
                <Link href="/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition-colors shadow-sm">
                  Регистрация
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile: theme + user + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            {isLoggedIn && <NotificationBell />}
            {isLoggedIn && (
              <button onClick={() => setUserMenu((v) => !v)} className="relative" ref={dropRef}>
                <UserAvatar size={8} />
                {userMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-xs font-semibold text-gray-900 truncate">{me !== 'loading' && (me.name ?? me.email)}</p>
                      <p className={`text-[10px] font-bold mt-0.5 ${me !== 'loading' && me.role === 'ADMIN' ? 'text-amber-600' : 'text-gray-400'}`}>
                        {me !== 'loading' && roleLabel(me.role)}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link href="/admin" onClick={() => setUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings className="w-4 h-4 text-gray-400" />Панель управления
                      </Link>
                    )}
                    <button onClick={logout}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left">
                      <LogOut className="w-4 h-4" />Выйти
                    </button>
                  </div>
                )}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-2">
          <Link href="/library" onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-gray-700 hover:text-medical-600 rounded-lg hover:bg-medical-50 transition-colors">
            Библиотека
          </Link>
          <Link href="/articles" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-medical-600 rounded-lg hover:bg-medical-50 transition-colors">
            <Microscope className="w-4 h-4" /> Статьи
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-medical-600 rounded-lg hover:bg-medical-50 transition-colors">
            <Info className="w-4 h-4" /> О проекте
          </Link>
          {isLoggedIn && (
            <Link href="/community" onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-medical-600 rounded-lg hover:bg-medical-50 transition-colors">
              <Users className="w-4 h-4" /> Сообщество
            </Link>
          )}
          <Link href="/premium" onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
            <Crown className="w-4 h-4" /> Премиум
          </Link>
          {!isLoggedIn && (
            <div className="flex gap-2 pt-1">
              <Link href="/auth/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                Войти
              </Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium bg-medical-600 text-white rounded-xl hover:bg-medical-700 transition-colors">
                Регистрация
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
