import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/database.types'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase isn't configured in this environment (common on new Vercel projects),
    // middleware must never hard-fail — just proceed without auth enforcement.
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next()

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<NextResponse['cookies']['set']>[2] }>) {
          // In the Edge runtime, mutating `request.cookies` can throw. Only write cookies to the response.
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // refreshing the auth token
  let user: unknown = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    // If Supabase is unreachable/misconfigured, fail open instead of 500'ing the whole site.
    return supabaseResponse
  }

  // Protected routes logic
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based protection for dashboards.
  // (We keep the UI redirects server-side so users can't just hit admin routes directly.)
  if (user && request.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (user as any).id)
        .single()

      const role =
        ((profile as any)?.role as string | undefined) ??
        (((user as any)?.user_metadata?.role as string | undefined) ? String((user as any).user_metadata.role) : undefined)
      const path = request.nextUrl.pathname

      // Canonical entrypoint: /dashboard always redirects to the user's real role dashboard.
      if (path === '/dashboard') {
        const url = request.nextUrl.clone()
        url.pathname = role ? `/dashboard/${role}` : '/dashboard/creator'
        return NextResponse.redirect(url)
      }

      if (role === 'admin') {
        // Admins can access all dashboards.
        return supabaseResponse
      }

      if (path.startsWith('/dashboard/admin')) {
        const url = request.nextUrl.clone()
        url.pathname = role ? `/dashboard/${role}` : '/dashboard/creator'
        return NextResponse.redirect(url)
      }

      if (role === 'brand' && path.startsWith('/dashboard/creator')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/brand'
        return NextResponse.redirect(url)
      }

      if (role === 'creator' && path.startsWith('/dashboard/brand')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/creator'
        return NextResponse.redirect(url)
      }
    } catch {
      // If role lookup fails, fail open (session protection above still applies).
    }
  }

  return supabaseResponse
}

export async function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
