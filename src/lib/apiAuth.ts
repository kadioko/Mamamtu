import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole } from '@prisma/client';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
  };
}

export type ApiHandler = (
  request: AuthenticatedRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware to protect API routes with authentication and role-based access control
 */
export function withAuth(
  handler: ApiHandler,
  options?: {
    roles?: UserRole[];
    requireEmailVerification?: boolean;
  }
) {
  return async (request: NextRequest, context?: any) => {
    try {
      // Get session
      const session = await auth();

      // Check if user is authenticated
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Unauthorized - Please sign in' },
          { status: 401 }
        );
      }

      // Check email verification if required
      if (options?.requireEmailVerification && !session.user.emailVerified) {
        return NextResponse.json(
          { error: 'Email verification required' },
          { status: 403 }
        );
      }

      // Check role-based access
      if (options?.roles && options.roles.length > 0) {
        const userRole = session.user.role as UserRole;
        if (!options.roles.includes(userRole)) {
          return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Attach user to request
      const authenticatedRequest = request as AuthenticatedRequest;
      authenticatedRequest.user = {
        id: session.user.id,
        email: session.user.email || '',
        role: session.user.role as UserRole,
        name: session.user.name || undefined,
      };

      // Call the handler
      return handler(authenticatedRequest, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to check if user has specific role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Helper to check if user can access patient data
 * Patients can only access their own data, healthcare providers and admins can access all
 */
export function canAccessPatient(
  userRole: UserRole,
  userId: string,
  patientUserId?: string | null
): boolean {
  // Admins and healthcare providers can access all patients
  if (userRole === 'ADMIN' || userRole === 'HEALTHCARE_PROVIDER') {
    return true;
  }

  // Patients can only access their own data
  if (userRole === 'PATIENT' && patientUserId) {
    return userId === patientUserId;
  }

  return false;
}
