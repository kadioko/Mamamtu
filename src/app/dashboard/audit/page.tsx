import Link from 'next/link';
import { AuditAction } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { auditParamsToSearch, buildAuditWhere, type AuditFilterParams } from '@/lib/admin-audit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, RotateCcw } from 'lucide-react';

export const dynamic = 'force-dynamic';

type Props = {
  searchParams?: Promise<AuditFilterParams>;
};

const actionLabels = Object.values(AuditAction).map((action) => ({
  value: action,
  label: action.replace(/_/g, ' '),
}));

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function metadataSummary(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return '-';
  const record = value as Record<string, unknown>;
  const adminAction = typeof record.adminAction === 'string' ? record.adminAction.replace(/-/g, ' ') : null;
  const targetEmail = typeof record.targetEmail === 'string' ? record.targetEmail : null;
  const type = typeof record.type === 'string' ? record.type.replace(/-/g, ' ') : null;

  return [adminAction, targetEmail, type].filter(Boolean).join(' / ') || '-';
}

export default async function AuditLogPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can view audit logs.</div>;
  }

  const resolvedSearchParams = await searchParams ?? {};
  const where = buildAuditWhere(resolvedSearchParams);
  const exportSearch = auditParamsToSearch(resolvedSearchParams);
  const exportHref = `/api/admin/audit/export${exportSearch.size ? `?${exportSearch.toString()}` : ''}`;

  const [logs, total, users, resources] = await Promise.all([
    prisma.auditLog.findMany({
      take: 100,
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({
      where: { auditLogs: { some: {} } },
      orderBy: { email: 'asc' },
      select: { id: true, name: true, email: true },
    }),
    prisma.auditLog.findMany({
      distinct: ['resource'],
      orderBy: { resource: 'asc' },
      select: { resource: true },
    }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audit Log</h1>
          <p className="text-muted-foreground">Filter sensitive actions by actor, action, patient, resource, and date.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline"><Link href="/dashboard/audit"><RotateCcw className="mr-2 h-4 w-4" />Reset Filters</Link></Button>
          <Button asChild><Link href={exportHref as any}><Download className="mr-2 h-4 w-4" />Export CSV</Link></Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><Filter className="h-5 w-5" />Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="q">Search</Label>
              <Input id="q" name="q" defaultValue={firstParam(resolvedSearchParams.q) ?? ''} placeholder="Email, resource, IP, patient ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <select id="action" name="action" defaultValue={firstParam(resolvedSearchParams.action) ?? ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">All actions</option>
                {actionLabels.map((action) => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">Actor</Label>
              <select id="userId" name="userId" defaultValue={firstParam(resolvedSearchParams.userId) ?? ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">All actors</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.email ?? user.name ?? 'Unnamed user'}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="resource">Resource</Label>
              <select id="resource" name="resource" defaultValue={firstParam(resolvedSearchParams.resource) ?? ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">All resources</option>
                {resources.map((resource) => (
                  <option key={resource.resource} value={resource.resource}>{resource.resource}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input id="patientId" name="patientId" defaultValue={firstParam(resolvedSearchParams.patientId) ?? ''} placeholder="Patient UUID or ID" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" name="from" type="date" defaultValue={firstParam(resolvedSearchParams.from) ?? ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" name="to" type="date" defaultValue={firstParam(resolvedSearchParams.to) ?? ''} />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">Apply Filters</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>Audit Events</CardTitle>
          <p className="text-sm text-muted-foreground">Showing {logs.length} of {total}</p>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-8 text-muted-foreground">No audit events match these filters.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">{log.createdAt.toLocaleString()}</TableCell>
                    <TableCell>
                      <p className="max-w-[220px] truncate">{log.user?.email ?? 'System'}</p>
                      <p className="text-xs text-muted-foreground">{log.user?.role?.replace(/_/g, ' ') ?? '-'}</p>
                    </TableCell>
                    <TableCell>{log.action.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <p>{log.resource}</p>
                      <p className="max-w-[180px] truncate text-xs text-muted-foreground">{log.resourceId ?? '-'}</p>
                    </TableCell>
                    <TableCell>{log.ipAddress ?? 'Unknown'}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{metadataSummary(log.metadata)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
