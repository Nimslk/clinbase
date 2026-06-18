import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'
import { dataPath } from './data-path'
import type { Material } from '@/types'

export function readMaterials(): Material[] {
  const file = dataPath('materials.json')
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')) as Material[] } catch { return [] }
}

export function writeMaterials(materials: Material[]) {
  fs.writeFileSync(dataPath('materials.json'), JSON.stringify(materials, null, 2), 'utf-8')
}

export function addMaterial(material: Material) {
  const all = readMaterials()
  all.unshift(material)
  writeMaterials(all)
  return material
}

export function deleteMaterial(id: string): boolean {
  const all = readMaterials()
  const item = all.find((m) => m.id === id)
  if (!item) return false
  writeMaterials(all.filter((m) => m.id !== id))
  return true
}

export function updateMaterial(id: string, patch: Partial<Material>): Material | null {
  const all = readMaterials()
  const idx = all.findIndex((m) => m.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  writeMaterials(all)
  return all[idx]
}

export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  const safe   = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const unique = `${Date.now()}_${safe}`

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { url } = await put(`uploads/${unique}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
    })
    return url
  }

  // Local dev: write to public/uploads
  const dir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, unique), buffer)
  return `/uploads/${unique}`
}

export function filterMaterials(
  materials: Material[],
  filters: {
    query?:    string
    category?: string
    year?:     number
    fileType?: string
    page?:     number
    perPage?:  number
  }
) {
  let result = [...materials]
  if (filters.query) {
    const q = filters.query.toLowerCase()
    result = result.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }
  if (filters.category) result = result.filter((m) => m.category === filters.category)
  if (filters.year)     result = result.filter((m) => m.year === filters.year)
  if (filters.fileType) result = result.filter((m) => m.fileType === filters.fileType)

  const total   = result.length
  const page    = filters.page    ?? 1
  const perPage = filters.perPage ?? 12
  const data    = result.slice((page - 1) * perPage, page * perPage)
  return { data, total, page, perPage, totalPages: Math.ceil(total / perPage) }
}
