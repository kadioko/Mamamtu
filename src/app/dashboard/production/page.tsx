import { auth } from '@/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProductionHealthReport } from '@/lib/productionHealth';

export const dynamic = 'force-dynamic';

export default async function ProductionHealthPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can view production health.</div>;
  }

  const report = await getProductionHealthReport();

  const statusStyles = {
    ready: 'text-green-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
  } as const;

  const statusLabels = {
    ready: 'Ready',
    warning: 'Review',
    error: 'Fix now',
  } as const;

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Production Health</h1>
            <p className="text-muted-foreground">Deployment readiness checks for auth, storage, rate limiting, email, and database access.</p>
          </div>
          <span className={report.status === 'ok' ? 'text-green-700' : report.status === 'degraded' ? 'text-amber-700' : 'text-red-700'}>
            {report.status.toUpperCase()}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Last checked {new Date(report.generatedAt).toLocaleString()}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {report.checks.map((check) => (
          <Card key={check.name}>
            <CardHeader><CardTitle className="flex items-center justify-between gap-4 text-lg"><span>{check.name}</span><span className={statusStyles[check.status]}>{statusLabels[check.status]}</span></CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{check.detail}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
