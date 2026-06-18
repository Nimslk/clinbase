import { NextResponse } from 'next/server'
import { readMaterials, deleteMaterial, updateMaterial } from '@/lib/storage'
import { removeByMaterialId } from '@/lib/notifications'
import { getSession } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  const material = readMaterials().find((m) => m.id === params.id)
  if (!material) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(material)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const ok = deleteMaterial(params.id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Remove any notifications tied to this material
  removeByMaterialId(params.id)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body    = await request.json()
  const updated = updateMaterial(params.id, body)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  removeByMaterialId(params.id)
  return NextResponse.json(updated)
}
