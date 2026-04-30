import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek apakah pengunjung punya tiket masuk (token)
  const token = request.cookies.get('auth_token')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';

  // Jika tidak punya token dan mencoba masuk ke halaman selain login, tendang ke /login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah punya token tapi mencoba buka /login, tendang ke Dashboard (/)
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Daftarkan halaman mana saja yang dijaga oleh satpam ini
export const config = {
  matcher: ['/', '/inventory', '/import', '/login'],
};
