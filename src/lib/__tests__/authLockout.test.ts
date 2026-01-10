jest.mock('@/lib/prisma', () => {
  const user = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };

  return {
    __esModule: true,
    prisma: { user },
    default: { user },
  };
});

jest.mock('bcryptjs', () => ({
  __esModule: true,
  compare: jest.fn(),
}));

import { authorizeCredentials } from '@/lib/auth-credentials';
import { ACCOUNT_LOCKOUT_CONFIG } from '@/lib/security';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

const mockUser = prisma.user as any;
const mockCompare = compare as jest.Mock;

describe('Credentials login lockout behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resets failedLoginAttempts and accountLockedUntil on successful login', async () => {
    mockUser.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      hashedPassword: 'hashed',
      failedLoginAttempts: 3,
      accountLockedUntil: null,
      isActive: true,
      emailVerified: new Date(),
      role: 'PATIENT',
      name: 'Test User',
    });

    mockCompare.mockResolvedValueOnce(true);

    const user = await authorizeCredentials({
      email: 'user@example.com',
      password: 'correct-password',
    });

    expect(user).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
    });

    expect(mockUser.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        lastLogin: expect.any(Date),
        failedLoginAttempts: 0,
        accountLockedUntil: null,
      },
    });
  });

  it('increments failedLoginAttempts on invalid password and locks account at threshold', async () => {
    mockUser.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      hashedPassword: 'hashed',
      failedLoginAttempts: ACCOUNT_LOCKOUT_CONFIG.maxAttempts - 1,
      accountLockedUntil: null,
      isActive: true,
      emailVerified: new Date(),
      role: 'PATIENT',
      name: 'Test User',
    });

    mockCompare.mockResolvedValueOnce(false);

    await expect(
      authorizeCredentials({
        email: 'user@example.com',
        password: 'wrong-password',
      })
    ).rejects.toThrow('Invalid credentials');

    expect(mockUser.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        failedLoginAttempts: ACCOUNT_LOCKOUT_CONFIG.maxAttempts,
        accountLockedUntil: expect.any(Date),
      },
    });
  });

  it('throws account-locked if accountLockedUntil is in the future', async () => {
    mockUser.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      hashedPassword: 'hashed',
      failedLoginAttempts: ACCOUNT_LOCKOUT_CONFIG.maxAttempts,
      accountLockedUntil: new Date(Date.now() + 60_000),
      isActive: true,
      emailVerified: new Date(),
      role: 'PATIENT',
      name: 'Test User',
    });

    await expect(
      authorizeCredentials({
        email: 'user@example.com',
        password: 'any-password',
      })
    ).rejects.toThrow('account-locked');

    expect(mockCompare).not.toHaveBeenCalled();
    expect(mockUser.update).not.toHaveBeenCalled();
  });

  it('throws account-inactive for inactive accounts even with valid password', async () => {
    mockUser.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      hashedPassword: 'hashed',
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      isActive: false,
      emailVerified: new Date(),
      role: 'PATIENT',
      name: 'Test User',
    });

    mockCompare.mockResolvedValueOnce(true);

    await expect(
      authorizeCredentials({
        email: 'user@example.com',
        password: 'correct-password',
      })
    ).rejects.toThrow('account-inactive');
  });

  it('throws email-not-verified for non-admins with unverified email', async () => {
    mockUser.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
      hashedPassword: 'hashed',
      failedLoginAttempts: 0,
      accountLockedUntil: null,
      isActive: true,
      emailVerified: null,
      role: 'PATIENT',
      name: 'Test User',
    });

    mockCompare.mockResolvedValueOnce(true);

    await expect(
      authorizeCredentials({
        email: 'user@example.com',
        password: 'correct-password',
      })
    ).rejects.toThrow('email-not-verified');
  });
});
