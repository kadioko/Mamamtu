import { NextRequest, NextResponse } from 'next/server';
import { AuditAction } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/auth';
import { getLatestFacilityAssignments, isSuperAdmin } from '@/lib/admin-scope';
import { prisma } from '@/lib/prisma';
import { generateSecureToken, hashToken } from '@/lib/security';
import { writeAuditLog } from '@/lib/audit';

const accessActionSchema = z.object({
  action: z.enum(['lock', 'unlock', 'force-reset']),
});

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return {
      session,
      response: NextResponse.json({ error: 'Only admins can manage staff access' }, { status: 403 }),
    };
  }

  return { session, response: null };
}

async function isLastActiveAdmin(userId: string) {
  const activeAdmins = await prisma.user.count({
    where: {
      role: 'ADMIN',
      isActive: true,
      OR: [
        { accountLockedUntil: null },
        { accountLockedUntil: { lte: new Date() } },
      ],
      id: { not: userId },
    },
  });

  return activeAdmins === 0;
}

async function canManageTarget(session: NonNullable<Awaited<ReturnType<typeof auth>>>, targetUserId: string) {
  if (isSuperAdmin(session)) return true;

  const assignments = await getLatestFacilityAssignments();
  const adminFacility = assignments.get(session.user.id)?.facilityName;
  const targetFacility = assignments.get(targetUserId)?.facilityName;

  return Boolean(adminFacility && targetFacility && adminFacility === targetFacility);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await assertAdmin();
  if (response) return response;

  const { id } = await params;
  const { action } = accessActionSchema.parse(await request.json());
  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!target || !['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'].includes(target.role)) {
    return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
  }

  if (!await canManageTarget(session, id)) {
    return NextResponse.json({ error: 'You can only manage staff assigned to your clinic' }, { status: 403 });
  }

  if (session?.user?.id === id) {
    return NextResponse.json(
      { error: 'You cannot change access controls for your own account from this panel' },
      { status: 400 },
    );
  }

  if (target.role === 'ADMIN' && (action === 'lock' || action === 'force-reset') && await isLastActiveAdmin(id)) {
    return NextResponse.json(
      { error: 'At least one active unlocked admin account is required' },
      { status: 400 },
    );
  }

  if (action === 'unlock') {
    const user = await prisma.user.update({
      where: { id },
      data: {
        accountLockedUntil: null,
        failedLoginAttempts: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        accountLockedUntil: true,
        passwordResetExpires: true,
        failedLoginAttempts: true,
      },
    });

    await writeAuditLog({
      request,
      userId: session?.user?.id,
      action: AuditAction.AUTH_EVENT,
      resource: 'StaffUser',
      resourceId: id,
      metadata: { adminAction: 'unlock-staff-account', targetEmail: target.email },
    });

    return NextResponse.json({ user });
  }

  if (action === 'lock') {
    const lockedUntil = new Date('2099-12-31T23:59:59.000Z');
    const user = await prisma.user.update({
      where: { id },
      data: {
        accountLockedUntil: lockedUntil,
        failedLoginAttempts: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        accountLockedUntil: true,
        passwordResetExpires: true,
        failedLoginAttempts: true,
      },
    });

    await writeAuditLog({
      request,
      userId: session?.user?.id,
      action: AuditAction.AUTH_EVENT,
      resource: 'StaffUser',
      resourceId: id,
      metadata: { adminAction: 'lock-staff-account', targetEmail: target.email },
    });

    return NextResponse.json({ user });
  }

  const resetToken = generateSecureToken();
  const resetExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const resetUrl = new URL('/auth/reset-password', request.nextUrl.origin);
  resetUrl.searchParams.set('token', resetToken);

  const user = await prisma.user.update({
    where: { id },
    data: {
      passwordResetToken: hashToken(resetToken),
      passwordResetExpires: resetExpires,
      accountLockedUntil: resetExpires,
      failedLoginAttempts: 0,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      accountLockedUntil: true,
      passwordResetExpires: true,
      failedLoginAttempts: true,
    },
  });

  await writeAuditLog({
    request,
    userId: session?.user?.id,
    action: AuditAction.AUTH_EVENT,
    resource: 'StaffUser',
    resourceId: id,
    metadata: {
      adminAction: 'force-password-reset',
      targetEmail: target.email,
      resetExpires: resetExpires.toISOString(),
    },
  });

  return NextResponse.json({
    user,
    resetUrl: resetUrl.toString(),
    resetExpires,
  });
}
