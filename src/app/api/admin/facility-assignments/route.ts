import { NextRequest, NextResponse } from 'next/server';
import { AuditAction } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/admin-scope';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

const assignmentSchema = z.object({
  userId: z.string().min(1),
  facilityName: z.string().trim().min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Only super admins can assign staff to clinics' }, { status: 403 });
  }

  const data = assignmentSchema.parse(await request.json());
  const target = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { id: true, email: true, role: true },
  });

  if (!target || !['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'].includes(target.role)) {
    return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
  }

  await writeAuditLog({
    request,
    userId: session!.user.id,
    action: AuditAction.AUTH_EVENT,
    resource: 'StaffFacilityAssignment',
    resourceId: data.userId,
    metadata: {
      adminAction: 'assign-staff-to-facility',
      targetUserId: target.id,
      targetEmail: target.email,
      targetRole: target.role,
      facilityName: data.facilityName,
    },
  });

  return NextResponse.json({
    message: 'Facility assignment saved',
    assignment: {
      userId: target.id,
      facilityName: data.facilityName,
    },
  });
}
