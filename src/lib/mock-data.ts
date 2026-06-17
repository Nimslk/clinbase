import type { Material } from '@/types'

export const MOCK_MATERIALS: Material[] = []

export function getMockMaterials(filters?: {
  query?: string
  category?: string
  year?: number
  fileType?: string
  page?: number
  perPage?: number
}): { data: Material[]; total: number } {
  let filtered = [...MOCK_MATERIALS]

  if (filters?.query) {
    const q = filters.query.toLowerCase()
    filtered = filtered.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  if (filters?.category) {
    filtered = filtered.filter((m) => m.category === filters.category)
  }

  if (filters?.year) {
    filtered = filtered.filter((m) => m.year === filters.year)
  }

  if (filters?.fileType) {
    filtered = filtered.filter((m) => m.fileType === filters.fileType)
  }

  const total = filtered.length
  const page = filters?.page ?? 1
  const perPage = filters?.perPage ?? 12
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage)

  return { data, total }
}

export function getMockMaterial(id: string): Material | undefined {
  return MOCK_MATERIALS.find((m) => m.id === id)
}

export const MOCK_STATS = {
  totalMaterials:  MOCK_MATERIALS.length,
  totalUsers:      0,
  totalDownloads:  0,
  totalViews:      0,
}
