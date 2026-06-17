import { NextResponse } from 'next/server'
import { getMockMaterials } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''

  if (query.length < 2) {
    return NextResponse.json({ data: [], total: 0 })
  }

  const result = getMockMaterials({ query, perPage: 5 })
  return NextResponse.json(result)
}
