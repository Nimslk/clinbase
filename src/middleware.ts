import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect /admin routes (but not /admin/login itself)
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }

  const token = request.cookies.get('medguide_token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET ?? 'fallback-dev-secret'
    )
    const { payload } = await jwtVerify(token, secret)
    const role = (payload as { role?: string }).role
    if (role !== 'ADMIN' && role !== 'EDITOR') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
