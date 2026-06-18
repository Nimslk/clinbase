import fs from 'fs'
import path from 'path'
import { put, list } from '@vercel/blob'
import { dataPath } from './data-path'
import type { Material } from '@/types'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN
const MATERIALS_KEY = 'data/materials.json'

// Cache the blob URL within a warm instance
let _materialsUrl: string | undefined

async function getMaterialsBlobUrl(): Promise<string | undefined> {
  if (_materialsUrl) return _materialsUrl
  try {
    const { blobs } = await list({ prefix: MATERIALS_KEY })
    _materialsUrl = blobs[0]?.url
    return _materialsUrl
  } catch {
    return undefined
  }
}

export async function readMaterials(): Promise<Material[]> {
  if (!BLOB_TOKEN) {
    const file = dataPath('materials.json')
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')) as Material[] } catch { return [] }
  }
  try {
    const url = await getMaterialsBlobUrl()
    if (!url) return []
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function writeMaterials(materials: Material[]): Promise<void> {
  if (!BLOB_TOKEN) {
    fs.writeFileSync(dataPath('materials.json'), JSON.stringify(materials, null, 2), 'utf-8')
    return
  }
  const { url } = await put(MATERIALS_KEY, JSON.stringify(materials), {
    access: 'public',
    addRandomSuffix: false,
  })
  _materialsUrl = url
}

export async function addMaterial(material: Material): Promise<Material> {
  const all = await readMaterials()
  all.unshift(material)
  await writeMaterials(all)
  return material
}

export async function deleteMaterial(id: string): Promise<boolean> {
  const all = await readMaterials()
  const item = all.find((m) => m.id === id)
  if (!item) return false
  await writeMaterials(all.filter((m) => m.id !== id))
  return true
}

export async function updateMaterial(id: string, patch: Partial<Material>): Promise<Material | null> {
  const all = await readMaterials()
  const idx = all.findIndex((m) => m.id === id)
  if (idx === -1) return null
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
  await writeMaterials(all)
  return all[idx]
}

export async function saveFile(buffer: Buffer, filename: string): Promise<string> {
  const safe   = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
  const unique = `${Date.now()}_${safe}`

  if (BLOB_TOKEN) {
    const { url } = await put(`uploads/${unique}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
    })
    return url
  }

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
