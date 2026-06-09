import { NextResponse, type NextRequest } from 'next/server';
import { verifyJwtToken } from '@/lib/auth/jwt';

export async function updateSession(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const user = token ? await verifyJwtToken(token) : null;
  const path = request.nextUrl.pathname;

  if (!user && path.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && path.startsWith('/dashboard')) {
    const role = user.role;

    if (path === '/dashboard') {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    if (role === 'admin') {
      return NextResponse.next();
    }

    if (path.startsWith('/dashboard/admin')) {
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    }

    if (role === 'brand' && path.startsWith('/dashboard/creator')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/brand';
      return NextResponse.redirect(url);
    }

    if (role === 'creator' && path.startsWith('/dashboard/brand')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/creator';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
