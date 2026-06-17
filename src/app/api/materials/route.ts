import { NextResponse } from 'next/server'
import { readMaterials, filterMaterials } from '@/lib/storage'
import type { Category, FileType } from '@/types'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const materials = readMaterials()
  const result = filterMaterials(materials, {
    query:    searchParams.get('q')        ?? undefined,
    category: (searchParams.get('category') as Category) ?? undefined,
    year:     searchParams.get('year')     ? Number(searchParams.get('year')) : undefined,
    fileType: (searchParams.get('fileType') as FileType) ?? undefined,
    page:     searchParams.get('page')     ? Number(searchParams.get('page')) : 1,
    perPage:  searchParams.get('perPage')  ? Number(searchParams.get('perPage')) : 12,
  })

  return NextResponse.json(result)
}
