import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRouteConfig, hasRequiredRole } from './lib/rbac';
import type { UserRole } from '@/types/roles';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get JWT token — uses jose under the hood, fully Edge-compatible
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Get route configuration for the current path
  const routeConfig = getRouteConfig(pathname);

  // If no configuration found for the route, allow by default
  if (!routeConfig) {
    return NextResponse.next();
  }

  // Handle unauthenticated users
  if (!token) {
    if (routeConfig.roles || routeConfig.requireEmailVerification) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // Check email verification if required
  const isEmailVerified = !!token.emailVerified;
  const userRole = token.role as UserRole;

  if (routeConfig.requireEmailVerification && !isEmailVerified) {
    // Allow ADMINs to bypass email verification
    if (userRole === 'ADMIN') {
      return NextResponse.next();
    }
    // Allow access to verification-related routes
    if (pathname.startsWith('/auth/verification-notice')) {
      return NextResponse.next();
    }
    const verifyEmailUrl = new URL('/auth/verification-notice', req.url);
    verifyEmailUrl.searchParams.set('email', (token.email as string) || '');
    return NextResponse.redirect(verifyEmailUrl);
  }

  // Check role-based access
  if (routeConfig.roles && routeConfig.roles.length > 0) {
    if (!hasRequiredRole(userRole, routeConfig.roles)) {
      return NextResponse.rewrite(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (NextAuth endpoints must never be blocked)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
