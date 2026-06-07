import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { buildAuditWhere } from '@/lib/admin-audit';

function csvCell(value: unknown) {
  if (value === null || value === undefined) return '';
  const text = value instanceof Date ? value.toISOString() : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can export audit logs' }, { status: 403 });
  }

  const params = Object.fromEntries(request.nextUrl.searchParams.entries());
  const logs = await prisma.auditLog.findMany({
    take: 1000,
    where: buildAuditWhere(params),
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  const headers = [
    'createdAt',
    'actorEmail',
    'actorName',
    'actorRole',
    'action',
    'resource',
    'resourceId',
    'patientId',
    'ipAddress',
    'userAgent',
    'metadata',
  ];

  const rows = logs.map((log) => [
    log.createdAt,
    log.user?.email,
    log.user?.name,
    log.user?.role,
    log.action,
    log.resource,
    log.resourceId,
    log.patientId,
    log.ipAddress,
    log.userAgent,
    log.metadata ? JSON.stringify(log.metadata) : '',
  ]);

  const csv = [
    headers.map(csvCell).join(','),
    ...rows.map((row) => row.map(csvCell).join(',')),
  ].join('\n');

  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mamamtu-audit-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
