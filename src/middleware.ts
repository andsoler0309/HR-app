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
  // 1. Run the next-intl middleware first
  const intlResponse = intlMiddleware(req);
  if (intlResponse) {
    // If next-intl middleware wants to redirect or respond,
    // return that response immediately.
    return intlResponse;
  }

  // If no response from intl middleware, proceed with your logic
  const url = req.nextUrl
  const { pathname } = url
  const segments = pathname.split('/').filter(Boolean)
  const supportedLocales = ['en', 'es']
  const defaultLocale = 'es'

  let locale = segments[0]

  // If no locale or unsupported locale, redirect to default locale
  if (!locale || !supportedLocales.includes(locale)) {
    const newUrl = new URL(`/${defaultLocale}${pathname}`, req.url)
    return NextResponse.redirect(newUrl)
  }

  // Create a response and pass it to the middleware client
  const res = NextResponse.next()
  
  // Create the Supabase middleware client
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthRoute = pathname.startsWith(`/${locale}/auth`)
  const isPortalRoute = pathname.startsWith(`/${locale}/portal`)
  const isRootLocale = pathname === `/${locale}`

  if (!session && !isAuthRoute && !isPortalRoute && !isRootLocale) {
    // Redirect to localized login
    return NextResponse.redirect(new URL(`/${locale}/auth/login`, req.url))
  }

  if (session && isAuthRoute) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard/employees`, req.url))
  }

  if (pathname === `/${locale}/dashboard`) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard/employees`, req.url))
  }

  // Check employee limit for free users on POST to /api/employees
  if (session && req.method === 'POST' && pathname.includes('/api/employees')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', session.user.id)
      .single()

    if (profile?.subscription_status === 'free') {
      const { count } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('company_id', session.user.id)

      if (count && count >= 1) {
        return new NextResponse(
          JSON.stringify({ 
            error: 'Free plan limited to 1 employee. Please upgrade to premium.' 
          }),
          { 
            status: 403,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
      }
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
