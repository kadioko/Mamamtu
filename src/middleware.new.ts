import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const publicPaths = ['/', '/auth/signin', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/auth/verification-notice', '/api/auth', '/_next', '/favicon.ico'];
const authOnlyPaths = ['/api/auth/session', '/api/auth/csrf', '/api/auth/signout', '/auth/error'];
const protectedPaths = ['/dashboard', '/app', '/patients', '/appointments'];
const adminPaths = ['/admin', '/api/admin', '/settings'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths and static files
  if (publicPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`) ||
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    /\.(?:svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  )) {
    return NextResponse.next();
  }

  // Get the session token
  const session = await getToken({ req: request });
  
  // Redirect to sign-in if not authenticated
  if (!session) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(signInUrl);
  }

  // Check if the path requires email verification
  const requiresVerification = ![
    ...publicPaths,
    ...authOnlyPaths,
    '/auth/verification-notice',
  ].some(path => pathname === path || pathname.startsWith(`${path}/`));

  // Redirect to verification notice if email is not verified
  if (requiresVerification && !session.emailVerified) {
    if (pathname.startsWith('/auth/verification-notice')) {
      return NextResponse.next();
    }
    const verificationUrl = new URL('/auth/verification-notice', request.url);
    verificationUrl.searchParams.set('email', session.email || '');
    return NextResponse.redirect(verificationUrl);
  }

  // Check admin access
  const isAdminRoute = adminPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  if (isAdminRoute && session.role !== 'ADMIN') {
    return NextResponse.rewrite(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
