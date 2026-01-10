import type { UserRole } from '@/types/roles';

type RoutePattern = string | RegExp;

export interface RouteConfig {
  pattern: RoutePattern;
  roles?: UserRole[];
  requireEmailVerification?: boolean;
}

// Define route patterns with their access requirements
export const routeConfigs: RouteConfig[] = [
  // Public routes
  { 
    pattern: '/', 
    roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT'] 
  },
  { 
    // Make all NextAuth endpoints public (callbacks, csrf, providers, etc.)
    pattern: /^\/api\/auth(\/.*)?$/,
  },
  { 
    pattern: '/_next', 
    roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT'] 
  },
  { 
    pattern: '/favicon.ico', 
    roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT'] 
  },
  
  // Auth routes (public)
  { 
    pattern: /^\/auth\/(signin|register|forgot-password|reset-password|verify-email|verification-notice)$/ 
  },
  { 
    pattern: /^\/api\/auth\/(signin|register|request-password-reset|reset-password|verify-email|check-user|resend-verification)$/ 
  },
  
  // Protected patient routes
  { 
    pattern: /^\/appointments(\/.*)?$/, 
    roles: ['PATIENT', 'HEALTHCARE_PROVIDER', 'ADMIN'],
    requireEmailVerification: true
  },
  { 
    pattern: /^\/patients(\/.*)?$/, 
    roles: ['HEALTHCARE_PROVIDER', 'ADMIN'],
    requireEmailVerification: true
  },
  
  // Admin routes
  { 
    pattern: /^\/admin(\/.*)?$/, 
    roles: ['ADMIN'],
    requireEmailVerification: true
  },
  { 
    pattern: /^\/api\/admin(\/.*)?$/, 
    roles: ['ADMIN'],
    requireEmailVerification: true
  },
  { 
    pattern: /^\/settings(\/.*)?$/, 
    roles: ['ADMIN', 'HEALTHCARE_PROVIDER'],
    requireEmailVerification: true
  },
  
  // Dashboard routes
  { 
    pattern: /^\/dashboard(\/.*)?$/, 
    roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT'],
    requireEmailVerification: true
  },
];

// Helper function to check if a path matches a pattern
export const isPathAllowed = (path: string, pattern: RoutePattern): boolean => {
  if (typeof pattern === 'string') {
    return path === pattern || path.startsWith(`${pattern}/`);
  }
  return pattern.test(path);
};

// Helper to get route config for a path
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  return routeConfigs.find(config => isPathAllowed(path, config.pattern));
};

// Check if user has required role
export const hasRequiredRole = (userRole: UserRole, requiredRoles?: UserRole[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) return true;
  return requiredRoles.includes(userRole);
};
