import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  if ((!token || !role) && !pathname.startsWith('/login')) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_name');
    return response;
  }

  if (role === 'kasir') {
    const restrictedPaths = ['/products', '/inventory'];
    const isRestricted =
      pathname === '/' ||
      restrictedPaths.some((path) => pathname.startsWith(path));

    if (isRestricted) {
      return NextResponse.redirect(new URL('/invoices', request.url));
    }
  }

  if (token && role && pathname.startsWith('/login')) {
    const redirectUrl = role === 'kasir' ? '/invoices' : '/';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/products/:path*',
    '/inventory/:path*',
    '/invoices/:path*',
    '/import/:path*',
    '/login',
  ],
};
