import { routeConfigs, isPathAllowed, getRouteConfig, hasRequiredRole } from '@/lib/rbac';
import type { UserRole } from '@/types/roles';

describe('rbac helpers', () => {
  describe('isPathAllowed', () => {
    it('matches exact string paths and subpaths', () => {
      expect(isPathAllowed('/', '/')).toBe(true);
      expect(isPathAllowed('/dashboard', '/dashboard')).toBe(true);
      expect(isPathAllowed('/dashboard/stats', '/dashboard')).toBe(true);
      expect(isPathAllowed('/dash', '/dashboard')).toBe(false);
    });

    it('matches regex patterns correctly', () => {
      const authApiPattern = /^\/api\/auth(\/.*)?$/;

      expect(isPathAllowed('/api/auth', authApiPattern)).toBe(true);
      expect(isPathAllowed('/api/auth/signin', authApiPattern)).toBe(true);
      expect(isPathAllowed('/api/auth/callback/credentials', authApiPattern)).toBe(true);
      expect(isPathAllowed('/api/other', authApiPattern)).toBe(false);
    });
  });

  describe('getRouteConfig', () => {
    it('returns the correct config for a public auth route', () => {
      const config = getRouteConfig('/auth/signin');
      expect(config).toBeDefined();
      expect(config?.roles).toBeUndefined();
      expect(config?.requireEmailVerification).toBeUndefined();
    });

    it('returns the correct config for appointments routes', () => {
      const rootConfig = getRouteConfig('/appointments');
      const nestedConfig = getRouteConfig('/appointments/123');

      expect(rootConfig).toBeDefined();
      expect(nestedConfig).toBeDefined();

      expect(rootConfig?.roles).toEqual(
        expect.arrayContaining(['PATIENT', 'HEALTHCARE_PROVIDER', 'ADMIN']),
      );
      expect(rootConfig?.requireEmailVerification).toBe(true);
      expect(nestedConfig).toEqual(rootConfig);
    });

    it('returns the correct config for admin API routes', () => {
      const config = getRouteConfig('/api/admin/users');
      expect(config).toBeDefined();
      expect(config?.roles).toEqual(['ADMIN']);
      expect(config?.requireEmailVerification).toBe(true);
    });

    it('returns undefined for unknown routes', () => {
      const config = getRouteConfig('/unknown-route');
      expect(config).toBeUndefined();
    });
  });

  describe('hasRequiredRole', () => {
    const admin: UserRole = 'ADMIN';
    const provider: UserRole = 'HEALTHCARE_PROVIDER';
    const patient: UserRole = 'PATIENT';

    it('returns true when no roles are required', () => {
      expect(hasRequiredRole(admin, undefined)).toBe(true);
      expect(hasRequiredRole(patient, [])).toBe(true);
    });

    it('returns true when user role is included in requiredRoles', () => {
      expect(hasRequiredRole(admin, ['ADMIN'])).toBe(true);
      expect(hasRequiredRole(provider, ['ADMIN', 'HEALTHCARE_PROVIDER'])).toBe(true);
      expect(hasRequiredRole(patient, ['PATIENT', 'HEALTHCARE_PROVIDER'])).toBe(true);
    });

    it('returns false when user role is not included in requiredRoles', () => {
      expect(hasRequiredRole(patient, ['ADMIN'])).toBe(false);
      expect(hasRequiredRole(provider, ['PATIENT'])).toBe(false);
    });
  });

  describe('routeConfigs integrity (smoke tests)', () => {
    it('includes config for dashboard requiring verified roles', () => {
      const config = getRouteConfig('/dashboard');
      expect(config).toBeDefined();
      expect(config?.roles).toEqual(
        expect.arrayContaining(['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT']),
      );
      expect(config?.requireEmailVerification).toBe(true);
    });
  });
});
