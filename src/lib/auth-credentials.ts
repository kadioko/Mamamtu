import { compare } from 'bcryptjs';
import { prisma } from './prisma';
import { ACCOUNT_LOCKOUT_CONFIG } from './security';

interface Credentials {
  email?: string | null;
  password?: string | null;
}

export async function authorizeCredentials(credentials: Credentials) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Missing credentials');
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user || !user.hashedPassword) {
    throw new Error('Invalid credentials');
  }

  const now = new Date();

  if (user.accountLockedUntil && user.accountLockedUntil > now) {
    throw new Error('account-locked');
  }

  const isPasswordValid = await compare(credentials.password, user.hashedPassword);

  if (!isPasswordValid) {
    const failedAttempts = (user.failedLoginAttempts || 0) + 1;

    const updateData: {
      failedLoginAttempts: number;
      accountLockedUntil?: Date | null;
    } = {
      failedLoginAttempts: failedAttempts,
    };

    if (failedAttempts >= ACCOUNT_LOCKOUT_CONFIG.maxAttempts) {
      updateData.accountLockedUntil = new Date(
        Date.now() + ACCOUNT_LOCKOUT_CONFIG.lockoutDuration,
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    throw new Error('Invalid credentials');
  }

  if (!user.isActive) {
    throw new Error('account-inactive');
  }

  if (!user.emailVerified && user.role !== 'ADMIN') {
    throw new Error('email-not-verified');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      accountLockedUntil: null,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
  };
}
