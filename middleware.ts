import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Jika token ATAU role hilang, berarti sesi korup. Tendang ke /login dan bersihkan sisa cookie!
  if ((!token || !role) && !pathname.startsWith('/login')) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    response.cookies.delete('user_role');
    response.cookies.delete('user_name');
    return response;
  }

  // 2. Jika Kasir iseng buka URL terlarang, tendang ke /invoices
  if (role === 'kasir') {
    const restrictedPaths = ['/products', '/inventory'];
    const isRestricted =
      pathname === '/' ||
      restrictedPaths.some((path) => pathname.startsWith(path));

    if (isRestricted) {
      return NextResponse.redirect(new URL('/invoices', request.url));
    }
  }

  // 3. Jika SUDAH login lengkap dan mencoba buka /login, kembalikan ke dashboard/invoices
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
