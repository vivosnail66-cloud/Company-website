import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { defaultLocale, isLocale } from '@/utilities/locale'
import { localeHeaderName } from '@/utilities/getRequestLocale'

const PUBLIC_FILE = /\.[^/]+$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/next') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]
  const locale = isLocale(firstSegment) ? firstSegment : defaultLocale
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(localeHeaderName, locale)

  if (!isLocale(firstSegment)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  const rewrittenURL = request.nextUrl.clone()
  const pathWithoutLocale = `/${segments.slice(1).join('/')}`
  rewrittenURL.pathname = pathWithoutLocale === '/' ? '/' : pathWithoutLocale

  return NextResponse.rewrite(rewrittenURL, {
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/((?!api|admin|_next|next|.*\\..*).*)'],
}
