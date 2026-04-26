import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ProductionHealthPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return <div className="p-6 text-muted-foreground">Only admins can view production health.</div>;
  }

  const checks = [
    { name: 'Database', ok: true, detail: `${await prisma.patient.count()} patient records reachable` },
    { name: 'Redis rate limiting', ok: Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN), detail: process.env.UPSTASH_REDIS_REST_URL ? 'Upstash env configured' : 'Missing Upstash env' },
    { name: 'Blob uploads', ok: Boolean(process.env.BLOB_READ_WRITE_TOKEN), detail: process.env.BLOB_READ_WRITE_TOKEN ? 'Vercel Blob token configured' : 'Missing Blob token' },
    { name: 'Email delivery', ok: Boolean(process.env.RESEND_API_KEY), detail: process.env.RESEND_API_KEY ? 'Resend key configured' : 'Console fallback active' },
    { name: 'Public URL', ok: Boolean(process.env.NEXT_PUBLIC_APP_URL), detail: process.env.NEXT_PUBLIC_APP_URL || 'Missing NEXT_PUBLIC_APP_URL' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Production Health</h1>
        <p className="text-muted-foreground">Deployment readiness checks for storage, rate limiting, email, and database access.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <Card key={check.name}>
            <CardHeader><CardTitle className="flex items-center justify-between text-lg"><span>{check.name}</span><span className={check.ok ? 'text-green-700' : 'text-amber-700'}>{check.ok ? 'Ready' : 'Needs setup'}</span></CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{check.detail}</p></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
