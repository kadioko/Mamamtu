import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRouteConfig, hasRequiredRole } from './lib/rbac';
import type { UserRole } from '@/types/roles';

// Paths that should be excluded from middleware processing
const EXCLUDED_PATHS = [
  '/_next',
  '/favicon.ico',
  '/public',
  '/api/health',
  /\..*$/, // Files with extensions
];

// Middleware function to handle authentication and authorization
export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth?.token || null;
    
    // Skip middleware for excluded paths
    if (EXCLUDED_PATHS.some(pattern => 
      typeof pattern === 'string' 
        ? pathname.startsWith(pattern) 
        : pattern.test(pathname)
    )) {
      return NextResponse.next();
    }

    // Get route configuration for the current path
    const routeConfig = getRouteConfig(pathname);
    
    // If no configuration found for the route, allow by default (relaxed for demo)
    if (!routeConfig) {
      return NextResponse.next();
    }

    // Handle unauthenticated users
    if (!token) {
      // If route requires authentication, redirect to sign-in
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
      // Demo: allow ADMINs to bypass email verification
      if (userRole === 'ADMIN') {
        return NextResponse.next();
      }
      // Allow access to verification-related routes
      if (pathname.startsWith('/auth/verification-notice')) {
        return NextResponse.next();
      }
      
      // Redirect to verification notice
      const verifyEmailUrl = new URL('/auth/verification-notice', req.url);
      verifyEmailUrl.searchParams.set('email', token.email || '');
      return NextResponse.redirect(verifyEmailUrl);
    }

    // Check role-based access
    if (routeConfig.roles && routeConfig.roles.length > 0) {
      if (!hasRequiredRole(userRole, routeConfig.roles)) {
        console.warn(`User with role ${userRole} attempted to access ${pathname} which requires roles: ${routeConfig.roles.join(', ')}`);
        return NextResponse.rewrite(new URL('/unauthorized', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: () => {
        // Always allow the request to proceed to our RBAC checks below.
        // Access control is enforced by getRouteConfig/hasRequiredRole.
        return true;
      },
    },
    pages: {
      signIn: '/auth/signin',
      error: '/auth/error',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
