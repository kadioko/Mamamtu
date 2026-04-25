import { AuditAction, Prisma } from '@prisma/client';
import type { AuthenticatedRequest } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';

interface AuditEventInput {
  request?: Request | AuthenticatedRequest;
  userId?: string | null;
  action: AuditAction;
  resource: string;
  resourceId?: string | null;
  patientId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function writeAuditLog({
  request,
  userId,
  action,
  resource,
  resourceId,
  patientId,
  metadata,
}: AuditEventInput) {
  try {
    const requestUser = request && 'user' in request ? request.user : undefined;
    const resolvedUserId = userId ?? requestUser?.id ?? null;

    await prisma.auditLog.create({
      data: {
        userId: resolvedUserId,
        action,
        resource,
        resourceId,
        patientId,
        metadata: metadata as Prisma.InputJsonValue | undefined,
        ipAddress: request?.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
          || request?.headers.get('x-real-ip')
          || null,
        userAgent: request?.headers.get('user-agent') || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
