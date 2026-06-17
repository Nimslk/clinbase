'use client'
import { useState, useEffect, useCallback } from 'react'
import { Search, Trash2, RefreshCw, Shield, UserCheck, User, UserPlus, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { Role } from '@/types'

interface UserRow {
  id:            string
  name:          string
  email:         string
  role:          Role
  createdAt:     string
  emailVerified: boolean
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN:  'Администратор',
  EDITOR: 'Редактор',
  USER:   'Пользователь',
}

const ROLE_COLORS: Record<Role, string> = {
  ADMIN:  'bg-purple-100 text-purple-700',
  EDITOR: 'bg-blue-100 text-blue-700',
  USER:   'bg-gray-100 text-gray-600',
}

const ROLE_ICONS: Record<Role, React.ReactNode> = {
  ADMIN:  <Shield className="w-3 h-3" />,
  EDITOR: <UserCheck className="w-3 h-3" />,
  USER:   <User className="w-3 h-3" />,
}

export default function AdminUsersPage() {
  const [users, setUsers]       = useState<UserRow[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [patching, setPatching] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/users')
      const data = await res.json()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Удалить пользователя «${name}»?`)) return
    setDeleting(id)
    try {
      await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  const handleRoleChange = async (id: string, role: Role) => {
    setPatching(id)
    try {
      const res  = await fetch(`/api/admin/users/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role }),
      })
      const updated = await res.json()
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: updated.role } : u)))
    } finally {
      setPatching(null)
    }
  }

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    ADMIN:  users.filter((u) => u.role === 'ADMIN').length,
    EDITOR: users.filter((u) => u.role === 'EDITOR').length,
    USER:   users.filter((u) => u.role === 'USER').length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-500 mt-1">
            {loading ? 'Загрузка...' : `${users.length} зарегистрированных пользователей`}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          title="Обновить"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {([['ADMIN', 'Администраторов', 'from-purple-500 to-purple-600'],
           ['EDITOR', 'Редакторов', 'from-blue-500 to-blue-600'],
           ['USER', 'Пользователей', 'from-gray-400 to-gray-500']] as const).map(([role, label, grad]) => (
          <div key={role} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white`}>
              {ROLE_ICONS[role]}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{loading ? '—' : counts[role]}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />
            <p>Загрузка пользователей...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-7 h-7 text-gray-300" />
            </div>
            {users.length === 0 ? (
              <>
                <p className="text-gray-500 font-medium mb-1">Пользователей пока нет</p>
                <p className="text-sm text-gray-400">Они появятся здесь после регистрации на сайте</p>
                <Link
                  href="/auth/register"
                  target="_blank"
                  className="inline-block mt-4 text-sm text-medical-600 hover:underline"
                >
                  Открыть страницу регистрации →
                </Link>
              </>
            ) : (
              <p className="text-gray-400">Ничего не найдено по запросу «{search}»</p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Пользователь</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Email</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Роль</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Верификация</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500 hidden lg:table-cell">Дата регистрации</th>
                <th className="px-5 py-3 text-center font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Name + avatar */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-white">
                          {u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400 md:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{u.email}</td>

                  {/* Role selector */}
                  <td className="px-5 py-3.5">
                    <div className="relative">
                      <select
                        value={u.role}
                        disabled={patching === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className={`appearance-none pl-7 pr-6 py-1 text-xs font-medium rounded-full border-0 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-medical-300 ${ROLE_COLORS[u.role]} ${patching === u.id ? 'opacity-50' : ''}`}
                      >
                        <option value="USER">Пользователь</option>
                        <option value="EDITOR">Редактор</option>
                        <option value="ADMIN">Администратор</option>
                      </select>
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        {ROLE_ICONS[u.role]}
                      </span>
                    </div>
                  </td>

                  {/* Email verified */}
                  <td className="px-5 py-3.5 text-center">
                    {u.emailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" /> Подтверждён
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <XCircle className="w-3 h-3" /> Не подтверждён
                      </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                    {new Date(u.createdAt).toLocaleDateString('ru-RU', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={deleting === u.id}
                      title="Удалить пользователя"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
