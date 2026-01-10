jest.mock('next/server', () => {
  const createJsonResponse = (body: any, init?: { status?: number }) => {
    const status = init?.status ?? 200;
    return {
      status,
      json: async () => body,
      headers: {
        get: () => null,
      },
    };
  };

  const createRedirectResponse = (url: URL | string) => {
    const href = typeof url === 'string' ? url : url.toString();
    return {
      status: 307,
      headers: {
        get: (name: string) => (name.toLowerCase() === 'location' ? href : null),
      },
    };
  };

  return {
    __esModule: true,
    NextResponse: {
      json: createJsonResponse,
      redirect: createRedirectResponse,
    },
  };
});

import { POST as registerPOST } from '@/app/api/auth/register/route';
import { GET as verifyGET } from '@/app/api/auth/verify-email/route';
import { POST as requestResetPOST } from '@/app/api/auth/request-password-reset/route';
import { POST as resetPasswordPOST } from '@/app/api/auth/reset-password/route';

jest.mock('@/lib/prisma', () => {
  const user = {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  return {
    __esModule: true,
    prisma: { user },
    default: { user },
  };
});

jest.mock('@/lib/email', () => ({
  __esModule: true,
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('@/lib/rateLimiter', () => ({
  __esModule: true,
  checkRateLimit: jest.fn(() => ({ limited: false })),
  getClientIdentifier: jest.fn(() => 'test-client'),
  generalRateLimiter: {},
}));

import { prisma } from '@/lib/prisma';
import { sendVerificationEmail, sendPasswordResetEmail } from '@/lib/email';
import { hashToken, verifyPassword } from '@/lib/security';
import { checkRateLimit, getClientIdentifier } from '@/lib/rateLimiter';

const mockUser = prisma.user as any;
const mockSendVerificationEmail = sendVerificationEmail as jest.Mock;
const mockSendPasswordResetEmail = sendPasswordResetEmail as jest.Mock;
const mockCheckRateLimit = checkRateLimit as jest.Mock;
const mockGetClientIdentifier = getClientIdentifier as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth API flows', () => {
  describe('register POST', () => {
    it('registers a new user and sends a verification email with a hashed token stored in DB', async () => {
      const body = {
        name: 'Jane Doe',
        email: 'User@example.com',
        password: 'StrongXyZ19!',
      };

      const req = {
        json: jest.fn().mockResolvedValue(body),
      } as any;

      mockCheckRateLimit.mockReturnValueOnce({ limited: false });
      mockGetClientIdentifier.mockReturnValueOnce('client-1');

      mockUser.findFirst.mockResolvedValueOnce(null);

      mockUser.create.mockResolvedValueOnce({
        id: 'user-1',
        name: body.name,
        email: body.email.toLowerCase(),
        role: 'PATIENT',
        hashedPassword: 'hashed-password',
        emailVerificationToken: 'hashed-token',
        emailVerificationExpires: new Date(Date.now() + 86400000),
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await registerPOST(req as any);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.message).toMatch(/registration successful/i);
      expect(json.user.email).toBe('user@example.com');
      expect(json.user).not.toHaveProperty('hashedPassword');
      expect(json.user).not.toHaveProperty('emailVerificationToken');

      expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
      const [, , rawToken] = mockSendVerificationEmail.mock.calls[0];

      const createArgs = mockUser.create.mock.calls[0][0];
      expect(createArgs.data.emailVerificationToken).not.toBe(rawToken);
      expect(createArgs.data.emailVerificationToken).toMatch(/^[0-9a-f]{64}$/i);
    });

    it('returns 400 if user with email already exists', async () => {
      const body = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'StrongXyZ19!',
      };

      const req = {
        json: jest.fn().mockResolvedValue(body),
      } as any;

      mockUser.findFirst.mockResolvedValueOnce({ id: 'existing-id' });

      const res = await registerPOST(req as any);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.message).toMatch(/already exists/i);
      expect(mockUser.create).not.toHaveBeenCalled();
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('verify-email GET', () => {
    it('verifies email with valid token and redirects to signin', async () => {
      const token = 'verify-token-123';
      const tokenHash = hashToken(token);

      mockUser.findFirst.mockResolvedValueOnce({
        id: 'user-1',
        emailVerificationToken: tokenHash,
      });

      const req = {
        url: `http://localhost/auth/verify-email?token=${token}`,
      } as any;

      const res = await verifyGET(req as any);

      expect(mockUser.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            emailVerificationToken: tokenHash,
          }),
        }),
      );

      expect(mockUser.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          emailVerified: expect.any(Date),
          emailVerificationToken: null,
          emailVerificationExpires: null,
          isActive: true,
        }),
      });

      const location = res.headers.get('location');
      expect(location).toBe('http://localhost/auth/signin?verified=true');
    });

    it('redirects to error page for invalid or expired token', async () => {
      mockUser.findFirst.mockResolvedValueOnce(null);

      const req = {
        url: 'http://localhost/auth/verify-email?token=bad-token',
      } as any;

      const res = await verifyGET(req as any);
      const location = res.headers.get('location');
      expect(location).toBe('http://localhost/auth/error?error=invalid-or-expired-token');
      expect(mockUser.update).not.toHaveBeenCalled();
    });
  });

  describe('request-password-reset POST', () => {
    it('returns generic success for unknown email', async () => {
      const body = { email: 'unknown@example.com' };
      const req = { json: jest.fn().mockResolvedValue(body) } as any;

      mockUser.findUnique.mockResolvedValueOnce(null);

      const res = await requestResetPOST(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toMatch(/if an account with that email exists/i);
      expect(mockUser.update).not.toHaveBeenCalled();
      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('creates reset token, stores hashed version, and sends email', async () => {
      const body = { email: 'User@example.com' };
      const req = { json: jest.fn().mockResolvedValue(body) } as any;

      mockUser.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Jane',
      });

      const res = await requestResetPOST(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toMatch(/if an account with that email exists/i);

      expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(1);
      const [, , rawToken] = mockSendPasswordResetEmail.mock.calls[0];

      const updateArgs = mockUser.update.mock.calls[0][0];
      expect(updateArgs.where).toEqual({ id: 'user-1' });
      expect(updateArgs.data.passwordResetToken).not.toBe(rawToken);
      expect(updateArgs.data.passwordResetToken).toMatch(/^[0-9a-f]{64}$/i);
      expect(updateArgs.data.passwordResetExpires).toBeInstanceOf(Date);
    });
  });

  describe('reset-password POST', () => {
    it('rejects invalid or expired token', async () => {
      const body = { token: 'bad-token', password: 'NewStrongPass19!' };
      const req = { json: jest.fn().mockResolvedValue(body) } as any;

      mockUser.findFirst.mockResolvedValueOnce(null);

      const res = await resetPasswordPOST(req as any);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/invalid or expired reset token/i);
      expect(mockUser.update).not.toHaveBeenCalled();
    });

    it('updates password, clears reset token, and unlocks account', async () => {
      const body = { token: 'reset-token-123', password: 'NewStrongPass19!' };
      const req = { json: jest.fn().mockResolvedValue(body) } as any;

      mockUser.findFirst.mockResolvedValueOnce({ id: 'user-1' });

      let updateData: any;
      mockUser.update.mockImplementationOnce(async (args: any) => {
        updateData = args.data;
        return { id: 'user-1', ...args.data };
      });

      const res = await resetPasswordPOST(req as any);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toMatch(/password has been reset successfully/i);

      expect(updateData.passwordResetToken).toBeNull();
      expect(updateData.passwordResetExpires).toBeNull();
      expect(updateData.failedLoginAttempts).toBe(0);
      expect(updateData.accountLockedUntil).toBeNull();

      const isValid = await verifyPassword(body.password, updateData.hashedPassword);
      expect(isValid).toBe(true);
    });
  });
});
