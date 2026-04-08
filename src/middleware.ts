import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Check for Supabase session cookie
  const cookieHeader = req.headers.get('cookie') || ''
  const hasSession = cookieHeader.includes('sb-chindatsyzvaieflwzlf-auth-token') ||
                     cookieHeader.includes('sb-access-token')

  const protectedRoutes = ['/dashboard', '/onboarding']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/login', '/auth/signup'],
}
