jest.mock('@auth/prisma-adapter', () => ({
  __esModule: true,
  PrismaAdapter: jest.fn(() => ({})),
}));

jest.mock('next-auth/providers/credentials', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'credentials', name: 'credentials' })),
}));

jest.mock('next-auth/providers/google', () => ({
  __esModule: true,
  default: jest.fn(() => ({ id: 'google', name: 'Google' })),
}));

jest.mock('next-auth', () => ({
  __esModule: true,
  getServerSession: jest.fn(),
}));

jest.mock('@/lib/prisma', () => {
  const user = {
    findFirst: jest.fn(),
  };

  return {
    __esModule: true,
    prisma: { user },
    default: { user },
  };
});

import { authOptions, getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

const mockUser = prisma.user as any;
const mockGetServerSession = getServerSession as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authOptions configuration', () => {
  it('includes credentials provider', () => {
    const providerIds = authOptions.providers.map((p: any) => p.id);
    expect(providerIds).toContain('credentials');
  });

  it('uses JWT session strategy and custom auth pages', () => {
    expect(authOptions.session?.strategy).toBe('jwt');
    expect(authOptions.pages?.signIn).toBe('/auth/signin');
    expect(authOptions.pages?.error).toBe('/auth/error');
  });
});

describe('authOptions.callbacks.session', () => {
  it('copies id, role, emailVerified, and isActive from token to session.user when token is present', async () => {
    const session = {
      user: {
        id: 'original-id',
        role: 'PATIENT',
        emailVerified: null,
        isActive: false,
        name: 'Jane',
        email: 'jane@example.com',
      },
    } as any;

    const token = {
      id: 'user-1',
      role: 'ADMIN',
      emailVerified: new Date('2024-01-02T00:00:00Z'),
      isActive: true,
    } as any;

    const result = await authOptions.callbacks!.session!({ session, token } as any);

    expect(result.user.id).toBe('user-1');
    expect(result.user.role).toBe('ADMIN');
    expect(result.user.emailVerified).toEqual(token.emailVerified);
    expect(result.user.isActive).toBe(true);
  });

  it('returns session unchanged when token is not provided', async () => {
    const session = {
      user: {
        id: 'original-id',
        role: 'PATIENT',
      },
    } as any;

    const result = await authOptions.callbacks!.session!({ session, token: undefined } as any);

    expect(result).toBe(session);
    expect(result.user.id).toBe('original-id');
    expect(result.user.role).toBe('PATIENT');
  });
});

describe('authOptions.callbacks.jwt', () => {
  it('merges token with session.user when trigger is update', async () => {
    const token: any = {
      id: 'user-1',
      role: 'PATIENT',
      email: 'user@example.com',
      foo: 'bar',
    };

    const session: any = {
      user: {
        id: 'user-1',
        role: 'ADMIN',
        emailVerified: new Date('2024-01-02T00:00:00Z'),
        isActive: true,
        extra: 'value',
      },
    };

    const result = await authOptions.callbacks!.jwt!({
      token,
      user: undefined,
      trigger: 'update',
      session,
    } as any);

    expect(result).toEqual({
      ...token,
      ...session.user,
    });
    expect(mockUser.findFirst).not.toHaveBeenCalled();
  });

  it('uses db user when found to enrich token', async () => {
    const token: any = {
      id: 'old-id',
      email: 'user@example.com',
      role: 'PATIENT',
      foo: 'bar',
    };

    const dbUser = {
      id: 'db-user-1',
      name: 'DB User',
      email: 'user@example.com',
      role: 'ADMIN',
      emailVerified: new Date('2024-01-03T00:00:00Z'),
      isActive: true,
    };

    mockUser.findFirst.mockResolvedValueOnce(dbUser);

    const result = await authOptions.callbacks!.jwt!({
      token,
      user: undefined,
      trigger: 'signIn',
      session: undefined,
    } as any);

    expect(mockUser.findFirst).toHaveBeenCalledWith({
      where: { email: token.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isActive: true,
      },
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        emailVerified: dbUser.emailVerified,
        isActive: dbUser.isActive,
        foo: 'bar',
      }),
    );
  });

  it('falls back to user object when no db user is found', async () => {
    const token: any = {
      email: 'user@example.com',
    };

    const user: any = {
      id: 'user-1',
      role: 'ADMIN',
      emailVerified: new Date('2024-01-04T00:00:00Z'),
      isActive: true,
    };

    mockUser.findFirst.mockResolvedValueOnce(null);

    const result = await authOptions.callbacks!.jwt!({
      token,
      user,
      trigger: 'signIn',
      session: undefined,
    } as any);

    expect(result.id).toBe('user-1');
    expect(result.role).toBe('ADMIN');
    expect(result.emailVerified).toEqual(user.emailVerified);
    expect(result.isActive).toBe(true);
  });
});

describe('getAuthSession', () => {
  it('delegates to getServerSession with authOptions', async () => {
    const fakeSession = { user: { id: 'user-1' } } as any;
    mockGetServerSession.mockResolvedValueOnce(fakeSession);

    const result = await getAuthSession();

    expect(mockGetServerSession).toHaveBeenCalledWith(authOptions);
    expect(result).toBe(fakeSession);
  });
});
