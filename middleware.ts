import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export const runtime = 'nodejs'; // Use Node.js runtime for crypto support

const publicPaths = ['/', '/auth/login', '/auth/callback', '/players'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public paths
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  // Check for auth token on protected routes
  const token = request.cookies.get('auth_token')?.value;
  const payload = token ? verifyJWT(token) : null;

  if (!payload) {
    // Redirect to login if trying to access protected route
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/rounds')) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
