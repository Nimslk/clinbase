'use client'
import { useState } from 'react'
import { Save, Eye, EyeOff, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({
    siteName: 'ClinBase',
    siteDesc: 'Клиническая база медицинских материалов',
    contactEmail: 'admin@clinbase.ru',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    allowRegistration: true,
    requireApproval: false,
    maxFileSize: '100',
  })

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-500 mt-1">Конфигурация платформы</p>
      </div>

      {/* General */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Общие настройки</h2>
        {[
          { label: 'Название платформы', key: 'siteName', type: 'text' },
          { label: 'Описание', key: 'siteDesc', type: 'text' },
          { label: 'Email для связи', key: 'contactEmail', type: 'email' },
          { label: 'Макс. размер файла (МБ)', key: 'maxFileSize', type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form] as string}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
            />
          </div>
        ))}

        <div className="space-y-3 pt-2">
          {[
            { label: 'Разрешить регистрацию пользователей', key: 'allowRegistration' },
            { label: 'Требовать подтверждение администратора', key: 'requireApproval' },
          ].map(({ label, key }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setForm({ ...form, [key]: !form[key as keyof typeof form] })}
                className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                  form[key as keyof typeof form] ? 'bg-medical-500' : 'bg-gray-200'
                }`}
                style={{ height: 22 }}
              >
                <div
                  className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                    form[key as keyof typeof form] ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                  style={{ width: 18, height: 18 }}
                />
              </div>
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-medical-600" />
          <h2 className="font-semibold text-gray-900">Безопасность</h2>
        </div>

        {[
          { label: 'Текущий пароль', key: 'currentPassword' },
          { label: 'Новый пароль', key: 'newPassword' },
          { label: 'Подтвердите пароль', key: 'confirmPassword' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl pr-10 focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 transition-colors shadow-sm"
        onClick={() => alert('Настройки сохранены!')}
      >
        <Save className="w-4 h-4" />
        Сохранить настройки
      </button>
    </div>
  )
}
