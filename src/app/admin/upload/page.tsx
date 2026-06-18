'use client'
import { useState, useRef, useCallback } from 'react'
import { Upload, File, X, Check, CloudUpload, AlertCircle, ArrowRight } from 'lucide-react'
import { CATEGORY_LABELS, type Category } from '@/types'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface FileItem {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
  materialId?: string
}

const ACCEPT = '.pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation'

export default function AdminUploadPage() {
  const [files, setFiles]     = useState<FileItem[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [form, setForm]       = useState({
    title: '', description: '', author: '',
    year: new Date().getFullYear(), category: '' as Category | '', tags: '',
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter((f) =>
      ['application/pdf',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ].includes(f.type)
    )
    if (!valid.length) return
    setFiles((prev) => [
      ...prev,
      ...valid.map((f) => ({
        id: crypto.randomUUID(), file: f,
        status: 'pending' as const, progress: 0,
      })),
    ])
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(Array.from(e.dataTransfer.files))
  }

  const uploadFile = async (item: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => f.id === item.id ? { ...f, status: 'uploading', progress: 10 } : f)
    )

    const fd = new FormData()
    fd.append('file',        item.file)
    fd.append('title',       form.title || item.file.name.replace(/\.[^.]+$/, ''))
    fd.append('description', form.description)
    fd.append('author',      form.author)
    fd.append('year',        String(form.year))
    fd.append('category',    form.category || 'OTHER')
    fd.append('tags',        form.tags)

    // Fake progress while uploading
    const timer = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id && f.progress < 85
            ? { ...f, progress: f.progress + 15 }
            : f
        )
      )
    }, 200)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      clearInterval(timer)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Ошибка загрузки')

      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: 'done', progress: 100, materialId: data.id }
            : f
        )
      )
    } catch (err) {
      clearInterval(timer)
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? { ...f, status: 'error', progress: 0, error: (err as Error).message }
            : f
        )
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const pending = files.filter((f) => f.status === 'pending')
    for (const item of pending) await uploadFile(item)
  }

  const remove = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id))

  const doneCount = files.filter((f) => f.status === 'done').length
  const allDone   = files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'error')

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Загрузка материалов</h1>
        <p className="text-gray-500 mt-1">Добавьте PDF, DOCX или PPTX файлы в библиотеку</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all select-none',
            dragOver
              ? 'border-medical-500 bg-medical-50 scale-[1.01]'
              : 'border-gray-200 hover:border-medical-400 hover:bg-gray-50/70'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
          />
          <CloudUpload className={cn('w-12 h-12 mx-auto mb-4 transition-colors', dragOver ? 'text-medical-500' : 'text-gray-300')} />
          <p className="text-base font-medium text-gray-700 mb-1">
            Перетащите файлы сюда или <span className="text-medical-600 underline">выберите на компьютере</span>
          </p>
          <p className="text-sm text-gray-400">PDF, DOCX, PPTX — до 100 МБ каждый</p>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {files.map((f) => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0">
                {/* Icon */}
                <div className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0',
                  f.file.name.endsWith('.pdf')  ? 'bg-red-100 text-red-600' :
                  f.file.name.endsWith('.docx') ? 'bg-blue-100 text-blue-600' :
                  'bg-orange-100 text-orange-600'
                )}>
                  {f.file.name.split('.').pop()?.toUpperCase()}
                </div>

                {/* Info + progress */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{f.file.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {f.status === 'uploading' && (
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-medical-500 rounded-full transition-all duration-300"
                          style={{ width: `${f.progress}%` }}
                        />
                      </div>
                    )}
                    {f.status === 'error' && (
                      <p className="text-xs text-red-500">{f.error}</p>
                    )}
                    {f.status !== 'uploading' && f.status !== 'error' && (
                      <span className="text-xs text-gray-400">
                        {(f.file.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="shrink-0">
                  {f.status === 'done' && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <Check className="w-4 h-4" /> Загружен
                    </span>
                  )}
                  {f.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  {f.status === 'uploading' && (
                    <span className="text-xs text-medical-600 font-medium">{f.progress}%</span>
                  )}
                  {f.status === 'pending' && (
                    <button type="button" onClick={() => remove(f.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Информация о материале</h2>
          <p className="text-xs text-gray-400 -mt-2">Заполните один раз — применится ко всем загружаемым файлам</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Название</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Оставьте пустым — возьмётся имя файла"
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Краткое описание содержания..."
                rows={3}
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Автор *</label>
              <input
                type="text"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                placeholder="ФИО автора или организация"
                required
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Год</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                min={2000}
                max={new Date().getFullYear()}
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Специальность *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                required
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all bg-white"
              >
                <option value="">Выберите специальность</option>
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Теги</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="Через запятую: кардиология, ЭКГ..."
                className="w-full px-3.5 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-medical-400 focus:ring-2 focus:ring-medical-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={files.length === 0 || files.every((f) => f.status !== 'pending')}
            className="flex items-center gap-2 px-6 py-2.5 bg-medical-600 text-white text-sm font-medium rounded-xl hover:bg-medical-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Загрузить {files.filter((f) => f.status === 'pending').length > 0
              ? `(${files.filter((f) => f.status === 'pending').length})`
              : ''}
          </button>

          <button
            type="button"
            onClick={() => { setFiles([]); setForm({ title: '', description: '', author: '', year: new Date().getFullYear(), category: '', tags: '' }) }}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Очистить
          </button>

          {allDone && doneCount > 0 && (
            <Link
              href="/library"
              className="flex items-center gap-2 ml-auto px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Перейти в библиотеку <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {doneCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
            <Check className="w-4 h-4 shrink-0" />
            {doneCount === 1
              ? 'Файл успешно загружен и добавлен в библиотеку!'
              : `${doneCount} файлов успешно загружено и добавлено в библиотеку!`}
          </div>
        )}
      </form>
    </div>
  )
}
