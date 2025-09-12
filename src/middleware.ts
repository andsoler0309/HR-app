// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {defineRouting} from 'next-intl/routing';
import createMiddleware from 'next-intl/middleware';

const routing = defineRouting({
  locales: ['en', 'es'],
  defaultLocale: 'es'
});

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  // Get pathname and handle locale logic first
  const { pathname } = req.nextUrl
  const segments = pathname.split('/').filter(Boolean)
  const supportedLocales = ['en', 'es']
  const defaultLocale = 'es'

  // Handle manifest specifically - redirect locale-prefixed manifest to root
  if (pathname.endsWith('/manifest.webmanifest')) {
    // Don't redirect if already at root
    if (pathname === '/manifest.webmanifest') {
      return NextResponse.next()
    }
    const newUrl = new URL('/manifest.webmanifest', req.url)
    return NextResponse.redirect(newUrl, 301)
  }

  let locale = segments[0]

  // If no locale or unsupported locale, redirect to default locale
  if (!locale || !supportedLocales.includes(locale)) {
    const newUrl = new URL(`/${defaultLocale}${pathname === '/' ? '' : pathname}`, req.url)
    return NextResponse.redirect(newUrl)
  }

  // Skip further processing for static files and API routes
  if (
    pathname.includes('/_next/') ||
    pathname.includes('/api/') ||
    pathname.includes('.') ||
    pathname.includes('/favicon') ||
    pathname.includes('/manifest') ||
    pathname.includes('/robots') ||
    pathname.includes('/sitemap') ||
    pathname === '/manifest.webmanifest'
  ) {
    return NextResponse.next()
  }

  // 1. Run the next-intl middleware for non-static requests
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    return intlResponse;
  }

  // Create a response and pass it to the middleware client
  const res = NextResponse.next()
  
  // Only create Supabase client for protected routes
  const isAuthRoute = pathname.startsWith(`/${locale}/auth`)
  const isPortalRoute = pathname.startsWith(`/${locale}/portal`)
  const isRootLocale = pathname === `/${locale}`
  const isDashboardRoute = pathname.startsWith(`/${locale}/dashboard`)

  // Skip auth check for non-protected routes
  if (isAuthRoute || isPortalRoute || isRootLocale) {
    return res
  }

  // Only check session for dashboard routes
  if (isDashboardRoute) {
    try {
      // Create the Supabase middleware client
      const supabase = createMiddlewareClient({ req, res })
      
      // Use getUser() for better security - it validates the JWT with the server
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        // Redirect to localized login
        return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
      }

    } catch (error) {
      console.error('Middleware auth error:', error)
      // En caso de error, redirigir a login
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff|woff2|ttf|eot)$).*)',
  ],
};
