import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import type { StoredUser } from '@/lib/users'

export const runtime = 'nodejs'

const FILE = path.join(process.cwd(), 'data', 'users.json')

function read(): StoredUser[] {
  if (!fs.existsSync(FILE)) return []
  try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')) } catch { return [] }
}
function write(users: StoredUser[]) {
  fs.writeFileSync(FILE, JSON.stringify(users, null, 2), 'utf-8')
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const users = read()
  const idx = users.findIndex((u) => u.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  users.splice(idx, 1)
  write(users)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body  = await request.json()
  const users = read()
  const idx   = users.findIndex((u) => u.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (body.role) users[idx].role = body.role
  if (body.name) users[idx].name = body.name
  write(users)
  const { passwordHash: _, ...safe } = users[idx]
  return NextResponse.json(safe)
}
