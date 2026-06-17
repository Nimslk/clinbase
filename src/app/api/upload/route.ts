import { NextResponse } from 'next/server'
import { addMaterial, saveFile } from '@/lib/storage'
import { createNotification } from '@/lib/notifications'
import { CATEGORY_LABELS } from '@/types'
import type { Category, FileType, Material } from '@/types'

export const runtime = 'nodejs'

const ALLOWED_TYPES: Record<string, FileType> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 })

    const fileType = ALLOWED_TYPES[file.type]
    if (!fileType) {
      return NextResponse.json(
        { error: 'Допустимые форматы: PDF, DOCX, PPTX' },
        { status: 400 }
      )
    }

    const title       = (formData.get('title')       as string) || file.name.replace(/\.[^.]+$/, '')
    const description = (formData.get('description') as string) || ''
    const author      = (formData.get('author')      as string) || 'Неизвестный автор'
    const year        = parseInt(formData.get('year') as string) || new Date().getFullYear()
    const category    = (formData.get('category')    as Category) || 'OTHER'
    const tagsRaw     = (formData.get('tags')        as string) || ''
    const tags        = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)

    const bytes   = await file.arrayBuffer()
    const buffer  = Buffer.from(bytes)
    const fileUrl = saveFile(buffer, file.name)

    const material: Material = {
      id:            crypto.randomUUID(),
      title,
      description,
      author,
      year,
      category,
      fileType,
      fileUrl,
      fileSize:      file.size,
      tags,
      isPublished:   true,
      viewCount:     0,
      downloadCount: 0,
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    }

    addMaterial(material)

    createNotification({
      type:       'NEW_MATERIAL',
      audience:   'USERS',
      title:      'Новый материал добавлен',
      body:       `«${title}» — ${CATEGORY_LABELS[category] ?? category} · ${author}`,
      link:       `/document/${material.id}`,
      materialId: material.id,
    })

    return NextResponse.json(material, { status: 201 })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Ошибка при загрузке файла' }, { status: 500 })
  }
}
