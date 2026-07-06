import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const getRole = (token: string): string | null => {
  try {
    return JSON.parse(atob(token.split('.')[1])).role ?? null;
  } catch {
    return null;
  }
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === '/login';

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (token) {
    const role = getRole(token.value);
    if (role !== 'admin') {
      // Pages fully blocked for non-admins
      const adminOnlyPrefixes = ['/users', '/contracts/', '/clients/'];
      for (const prefix of adminOnlyPrefixes) {
        if (pathname.startsWith(prefix) && pathname.includes('/edit')) {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
      if (pathname.startsWith('/users')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
