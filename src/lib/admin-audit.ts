import { AuditAction, Prisma } from '@prisma/client';

export type AuditFilterParams = {
  action?: string | string[];
  userId?: string | string[];
  resource?: string | string[];
  patientId?: string | string[];
  from?: string | string[];
  to?: string | string[];
  q?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function dateAtStart(value: string | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateAtEnd(value: string | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function buildAuditWhere(params: AuditFilterParams): Prisma.AuditLogWhereInput {
  const action = firstParam(params.action);
  const userId = firstParam(params.userId);
  const resource = firstParam(params.resource);
  const patientId = firstParam(params.patientId);
  const from = dateAtStart(firstParam(params.from));
  const to = dateAtEnd(firstParam(params.to));
  const q = firstParam(params.q)?.trim();
  const validActions = Object.values(AuditAction);

  const where: Prisma.AuditLogWhereInput = {};

  if (action && validActions.includes(action as AuditAction)) {
    where.action = action as AuditAction;
  }

  if (userId) {
    where.userId = userId;
  }

  if (resource) {
    where.resource = resource;
  }

  if (patientId) {
    where.patientId = { contains: patientId, mode: 'insensitive' };
  }

  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  if (q) {
    where.OR = [
      { resource: { contains: q, mode: 'insensitive' } },
      { resourceId: { contains: q, mode: 'insensitive' } },
      { patientId: { contains: q, mode: 'insensitive' } },
      { ipAddress: { contains: q, mode: 'insensitive' } },
      { user: { is: { email: { contains: q, mode: 'insensitive' } } } },
      { user: { is: { name: { contains: q, mode: 'insensitive' } } } },
    ];
  }

  return where;
}

export function auditParamsToSearch(params: AuditFilterParams) {
  const search = new URLSearchParams();

  for (const key of ['action', 'userId', 'resource', 'patientId', 'from', 'to', 'q'] as const) {
    const value = firstParam(params[key]);
    if (value) search.set(key, value);
  }

  return search;
}
