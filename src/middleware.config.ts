import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that don't require authentication or email verification
const publicPaths = [
  '/',
  '/auth/signin',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/verification-notice',
  '/api/auth',
  '/_next',
  '/favicon.ico',
];

// Paths that require authentication but don't require email verification
const authOnlyPaths = [
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/signout',
  '/auth/error',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for public paths
  if (
    publicPaths.some(path => 
      pathname === path || 
      pathname.startsWith(`${path}/`) ||
      pathname.startsWith('/_next/static') ||
      pathname.startsWith('/_next/image') ||
      pathname.match(/\.[^/]+$/) // Skip static files
    )
  ) {
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
    const verificationUrl = new URL('/auth/verification-notice', request.url);
    verificationUrl.searchParams.set('email', session.email || '');
    return NextResponse.redirect(verificationUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
