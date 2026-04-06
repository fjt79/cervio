import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { pathname, searchParams } = req.nextUrl

  const nativeToken = searchParams.get('native_token')
  if (nativeToken) {
    const { error } = await supabase.auth.setSession({
      access_token: nativeToken,
      refresh_token: searchParams.get('native_refresh') || '',
    })
    if (!error) {
      const cleanUrl = new URL(pathname, req.url)
      const response = NextResponse.redirect(cleanUrl, { status: 302 })
      res.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          response.headers.append(key, value)
        }
      })
      return response
    }
  }

  const { data: { session } } = await supabase.auth.getSession()

  const protectedRoutes = ['/dashboard', '/onboarding']
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth/login', '/auth/signup'],
}
