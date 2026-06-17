import { NextResponse } from 'next/server'
import { allUsers } from '@/lib/users'

export const runtime = 'nodejs'

export async function GET() {
  const users = allUsers()
  return NextResponse.json(users)
}
