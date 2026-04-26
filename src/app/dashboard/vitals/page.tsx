import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { Activity, HeartPulse } from 'lucide-react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

function isPlainObject(value: Prisma.JsonValue | null): value is Prisma.JsonObject {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function formatVitalLabel(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatVitalValue(value: Prisma.JsonValue) {
  if (value === null) return 'Not recorded';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default async function VitalsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to patient vitals.</div>;
  }

  const records = await prisma.medicalRecord.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          patientId: true,
        },
      },
    },
  });

  const recordsWithVitals = records.filter((record) => isPlainObject(record.vitals));

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Vitals</h1>
          <p className="text-muted-foreground">Latest recorded blood pressure, pulse, temperature, oxygen, and related clinical measurements.</p>
        </div>
        <Button asChild>
          <Link href={'/dashboard/records' as any}>
            <Activity className="mr-2 h-4 w-4" />
            View Records
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {recordsWithVitals.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No vitals have been recorded yet. Add vitals from a patient&apos;s medical record workflow.
            </CardContent>
          </Card>
        ) : (
          recordsWithVitals.map((record) => {
            const vitals = isPlainObject(record.vitals) ? Object.entries(record.vitals) : [];

            return (
              <Card key={record.id} className="border-l-4 border-red-500">
                <CardContent className="space-y-4 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <HeartPulse className="h-4 w-4 text-red-500" />
                        <h2 className="font-semibold">
                          {record.patient.firstName} {record.patient.lastName}
                        </h2>
                        <Badge variant="secondary">{record.patient.patientId}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {record.title} · {record.createdAt.toLocaleDateString()}
                      </p>
                    </div>

                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/patients/${record.patient.id}`}>Open Patient</Link>
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {vitals.map(([key, value]) => (
                      <div key={key} className="rounded-lg border bg-background p-3">
                        <span className="text-xs text-muted-foreground">{formatVitalLabel(key)}</span>
                        <p className="mt-1 text-sm font-medium">{formatVitalValue(value ?? null)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
