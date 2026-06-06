import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getRouteConfig, hasRequiredRole } from './lib/rbac';
import type { UserRole } from '@/types/roles';

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (token && pathname === '/auth/signin') {
    const rawCallbackUrl = req.nextUrl.searchParams.get('callbackUrl');
    const fallbackUrl = new URL('/dashboard', req.url);

    if (rawCallbackUrl) {
      try {
        const callbackUrl = new URL(rawCallbackUrl, req.url);
        if (callbackUrl.origin === req.nextUrl.origin && !callbackUrl.pathname.startsWith('/auth/signin')) {
          return NextResponse.redirect(callbackUrl);
        }
      } catch {
        if (rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('/auth/signin')) {
          return NextResponse.redirect(new URL(rawCallbackUrl, req.url));
        }
      }
    }

    return NextResponse.redirect(fallbackUrl);
  }

  const routeConfig = getRouteConfig(pathname);

  if (!routeConfig) {
    return NextResponse.next();
  }

  if (!token) {
    if (routeConfig.roles || routeConfig.requireEmailVerification) {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', encodeURI(req.url));
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  const isEmailVerified = !!token.emailVerified;
  const userRole = token.role as UserRole;

  if (routeConfig.requireEmailVerification && !isEmailVerified) {
    if (userRole === 'ADMIN') {
      return NextResponse.next();
    }
    if (pathname.startsWith('/auth/verification-notice')) {
      return NextResponse.next();
    }
    const verifyEmailUrl = new URL('/auth/verification-notice', req.url);
    verifyEmailUrl.searchParams.set('email', (token.email as string) || '');
    return NextResponse.redirect(verifyEmailUrl);
  }

  if (routeConfig.roles && routeConfig.roles.length > 0) {
    if (!hasRequiredRole(userRole, routeConfig.roles)) {
      return NextResponse.rewrite(new URL('/unauthorized', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
