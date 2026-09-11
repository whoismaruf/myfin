import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass public and static routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/onboarding') ||
    pathname === '/favicon.ico' ||
    pathname === '/onboarding' ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  // Check authentication session
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'myfin-fallback-secret-for-dev',
  });

  // If user is not authenticated and trying to access protected routes
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
