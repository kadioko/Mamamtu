import type { Session } from 'next-auth';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type FacilityAssignment = {
  userId: string;
  facilityName: string;
  assignedBy?: string | null;
  assignedAt?: string | null;
};

export type HospitalIntegrationConfig = {
  id: string;
  facilityName: string;
  systemName: string;
  integrationType: 'FHIR' | 'HL7' | 'CSV' | 'API';
  status: 'PLANNED' | 'IN_PROGRESS' | 'CONNECTED' | 'PAUSED';
  endpoint?: string | null;
  notes?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
};

export function getSuperAdminEmails() {
  const configured = process.env.SUPER_ADMIN_EMAILS || process.env.SEED_ADMIN_EMAIL || 'admin@mama-tu.health';
  return configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdmin(session: Session | null | undefined) {
  const email = session?.user?.email?.toLowerCase();
  return session?.user?.role === 'ADMIN' && Boolean(email && getSuperAdminEmails().includes(email));
}

function readRecord(value: Prisma.JsonValue | null): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function getFacilityNames() {
  const [medicalRecords, newbornRecords, immunizations] = await Promise.all([
    prisma.medicalRecord.findMany({ where: { facility: { not: null } }, select: { facility: true }, take: 200 }),
    prisma.newbornRecord.findMany({ where: { deliveryFacility: { not: null } }, select: { deliveryFacility: true }, take: 200 }),
    prisma.immunization.findMany({ where: { facility: { not: null } }, select: { facility: true }, take: 200 }),
  ]);

  return Array.from(new Set([
    ...medicalRecords.map((item) => item.facility),
    ...newbornRecords.map((item) => item.deliveryFacility),
    ...immunizations.map((item) => item.facility),
    'Muhimbili ANC Clinic',
    'Amana Regional Clinic',
    'Mwananyamala Maternal Unit',
  ].filter((value): value is string => Boolean(value && value.trim())))).sort();
}

export async function getLatestFacilityAssignments(): Promise<Map<string, FacilityAssignment>> {
  const events = await prisma.auditLog.findMany({
    where: { resource: 'StaffFacilityAssignment' },
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: { user: { select: { email: true } } },
  });

  const assignments = new Map<string, FacilityAssignment>();

  for (const event of events) {
    const metadata = readRecord(event.metadata);
    const userId = typeof metadata.targetUserId === 'string' ? metadata.targetUserId : null;
    const facilityName = typeof metadata.facilityName === 'string' ? metadata.facilityName : null;

    if (!userId || !facilityName || assignments.has(userId)) continue;

    assignments.set(userId, {
      userId,
      facilityName,
      assignedBy: event.user?.email ?? null,
      assignedAt: event.createdAt.toISOString(),
    });
  }

  return assignments;
}

export async function getHospitalIntegrations(): Promise<HospitalIntegrationConfig[]> {
  const events = await prisma.auditLog.findMany({
    where: { resource: 'HospitalIntegration' },
    orderBy: { createdAt: 'desc' },
    take: 500,
    include: { user: { select: { email: true } } },
  });

  const integrations = new Map<string, HospitalIntegrationConfig>();

  for (const event of events) {
    const metadata = readRecord(event.metadata);
    const id = typeof metadata.integrationId === 'string' ? metadata.integrationId : event.resourceId;
    if (!id || integrations.has(id)) continue;

    integrations.set(id, {
      id,
      facilityName: typeof metadata.facilityName === 'string' ? metadata.facilityName : 'Unknown facility',
      systemName: typeof metadata.systemName === 'string' ? metadata.systemName : 'External system',
      integrationType: ['FHIR', 'HL7', 'CSV', 'API'].includes(String(metadata.integrationType))
        ? metadata.integrationType as HospitalIntegrationConfig['integrationType']
        : 'API',
      status: ['PLANNED', 'IN_PROGRESS', 'CONNECTED', 'PAUSED'].includes(String(metadata.status))
        ? metadata.status as HospitalIntegrationConfig['status']
        : 'PLANNED',
      endpoint: typeof metadata.endpoint === 'string' ? metadata.endpoint : null,
      notes: typeof metadata.notes === 'string' ? metadata.notes : null,
      updatedAt: event.createdAt.toISOString(),
      updatedBy: event.user?.email ?? null,
    });
  }

  return [...integrations.values()].sort((a, b) => a.facilityName.localeCompare(b.facilityName));
}
