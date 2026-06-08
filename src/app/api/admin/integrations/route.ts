import { NextRequest, NextResponse } from 'next/server';
import { AuditAction } from '@prisma/client';
import { z } from 'zod';
import { auth } from '@/auth';
import { isSuperAdmin } from '@/lib/admin-scope';
import { writeAuditLog } from '@/lib/audit';

const integrationSchema = z.object({
  facilityName: z.string().trim().min(1),
  systemName: z.string().trim().min(1),
  integrationType: z.enum(['FHIR', 'HL7', 'CSV', 'API']),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'CONNECTED', 'PAUSED']),
  endpoint: z.string().trim().optional().or(z.literal('')),
  notes: z.string().trim().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Only super admins can manage hospital integrations' }, { status: 403 });
  }

  const data = integrationSchema.parse(await request.json());
  const integrationId = `${data.facilityName}-${data.systemName}-${data.integrationType}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  await writeAuditLog({
    request,
    userId: session!.user.id,
    action: AuditAction.AUTH_EVENT,
    resource: 'HospitalIntegration',
    resourceId: integrationId,
    metadata: {
      adminAction: 'upsert-hospital-integration',
      integrationId,
      facilityName: data.facilityName,
      systemName: data.systemName,
      integrationType: data.integrationType,
      status: data.status,
      endpoint: data.endpoint || null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json({
    message: 'Hospital integration saved',
    integrationId,
  });
}
