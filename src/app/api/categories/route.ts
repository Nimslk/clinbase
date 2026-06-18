import { NextResponse } from 'next/server'
import { readMaterials } from '@/lib/storage'
import type { Category } from '@/types'

export const runtime = 'nodejs'

export async function GET() {
  const materials = await readMaterials()

  const counts: Record<string, number> = {}
  for (const m of materials) {
    counts[m.category] = (counts[m.category] ?? 0) + 1
  }

  return NextResponse.json(counts)
}
