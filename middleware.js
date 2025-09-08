import { NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/favicon.ico', '/api']

export function middleware (req) {
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) || pathname.startsWith('/_next') || pathname.startsWith('/static')
  if (isPublic) return NextResponse.next()

  const session = req.cookies.get('cosimo_session')?.value
  if (session === 'ok') return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('redirect', pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

