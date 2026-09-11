import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Bypass public and static routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/onboarding') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Check authentication session
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || 'myfin-fallback-secret-for-dev',
  });

  // Check onboarding status for first-run redirect
  let isOnboarded = true;
  try {
    const statusUrl = new URL('/api/onboarding/status', req.nextUrl.origin);
    const statusRes = await fetch(statusUrl.toString(), { cache: 'no-store' });
    if (statusRes.ok) {
      const data = await statusRes.json();
      isOnboarded = Boolean(data.isOnboarded);
    }
  } catch (e) {
    console.error('Middleware status check error:', e);
  }

  // If system is fresh (not onboarded yet)
  if (!isOnboarded) {
    if (pathname === '/onboarding') {
      return NextResponse.next();
    }
    // Redirect all requests (including / and /login) to /onboarding
    return NextResponse.redirect(new URL('/onboarding', req.url));
  }

  // If system is already onboarded:
  // Prevent any access to /onboarding
  if (pathname === '/onboarding') {
    return NextResponse.redirect(new URL(token ? '/' : '/login', req.url));
  }

  // If user is authenticated and navigating to /login, redirect to /
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // If user is NOT authenticated and trying to access protected routes
  if (!token) {
    if (pathname === '/login') {
      return NextResponse.next();
    }
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
