import { NextResponse } from 'next/server'
import { readMaterials } from '@/lib/storage'
import { allUsers } from '@/lib/users'

export const runtime = 'nodejs'

export async function GET() {
  const materials = readMaterials()
  const users     = allUsers()

  const totalMaterials  = materials.length
  const totalUsers      = users.length
  const totalViews      = materials.reduce((s, m) => s + (m.viewCount ?? 0), 0)
  const totalDownloads  = materials.reduce((s, m) => s + (m.downloadCount ?? 0), 0)

  const byCategory = materials.reduce<Record<string, number>>((acc, m) => {
    acc[m.category] = (acc[m.category] ?? 0) + 1
    return acc
  }, {})

  const recentMaterials = [...materials]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const topMaterials = [...materials]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5)

  return NextResponse.json({
    totalMaterials,
    totalUsers,
    totalViews,
    totalDownloads,
    byCategory,
    recentMaterials,
    topMaterials,
  })
}
