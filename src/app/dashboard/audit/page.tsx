import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AuditLogPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can view audit logs.</div>;
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Recent sensitive actions across patients, records, and education content.</p>
      </div>
      <div className="grid gap-3">
        {logs.length === 0 ? (
          <Card><CardContent className="py-8 text-muted-foreground">No audit events yet.</CardContent></Card>
        ) : logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-6">
              <div><span className="text-muted-foreground">When</span><p>{log.createdAt.toLocaleString()}</p></div>
              <div><span className="text-muted-foreground">Actor</span><p>{log.user?.email ?? 'System'}</p></div>
              <div><span className="text-muted-foreground">Action</span><p>{log.action.replace(/_/g, ' ')}</p></div>
              <div><span className="text-muted-foreground">Resource</span><p>{log.resource}</p></div>
              <div><span className="text-muted-foreground">IP</span><p>{log.ipAddress ?? 'Unknown'}</p></div>
              <div><span className="text-muted-foreground">Resource ID</span><p className="truncate">{log.resourceId ?? '-'}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
