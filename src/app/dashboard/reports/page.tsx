import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClinicalExportPanel } from '@/components/dashboard/ClinicalExportPanel';

export const dynamic = 'force-dynamic';

type RecentMedicalRecord = Prisma.MedicalRecordGetPayload<{
  include: {
    patient: { select: { id: true; firstName: true; lastName: true; patientId: true } };
  };
}>;

type RecentExportAudit = Prisma.AuditLogGetPayload<{
  include: {
    user: { select: { name: true; email: true; role: true } };
  };
}>;

function readExportMetadata(metadata: Prisma.JsonValue | null) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {
      type: 'Unknown',
      format: 'Unknown',
      rowCount: 'Unknown',
    };
  }

  const exportType = typeof metadata.type === 'string' ? metadata.type : 'Unknown';
  const format = typeof metadata.format === 'string' ? metadata.format.toUpperCase() : 'Unknown';
  const rowCount = typeof metadata.rowCount === 'number' ? metadata.rowCount.toLocaleString() : 'Unknown';

  return {
    type: exportType.replace(/-/g, ' '),
    format,
    rowCount,
  };
}

export default async function ReportsPage() {
  let session: Awaited<ReturnType<typeof auth>> = null;

  try {
    session = await auth();
  } catch (error) {
    console.warn('Unable to read reports session:', error);
  }

  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to reports.</div>;
  }

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

  let reportData: {
    patientCount: number;
    activePregnancies: number;
    highRiskPregnancies: number;
    missedAncPregnancies: number;
    upcomingAppointments: number;
    completedAppointments: number;
    newbornCount: number;
    dueImmunizations: number;
    recentRecords: RecentMedicalRecord[];
    recentExports: RecentExportAudit[];
  };

  try {
    const isAdmin = session.user.role === 'ADMIN';
    const [
      patientCount,
      activePregnancies,
      highRiskPregnancies,
      missedAncPregnancies,
      upcomingAppointments,
      completedAppointments,
      newbornCount,
      dueImmunizations,
      recentRecords,
      recentExports,
    ] = await Promise.all([
      prisma.patient.count({ where: { isActive: true } }),
      prisma.pregnancyEpisode.count({ where: { status: 'ACTIVE' } }),
      prisma.pregnancyEpisode.count({ where: { riskLevel: { gte: 2 }, status: 'ACTIVE' } }),
      prisma.pregnancyEpisode.count({ where: { status: 'LOST_TO_FOLLOW_UP' } }),
      prisma.appointment.count({ where: { startTime: { gte: today }, status: { in: ['SCHEDULED', 'CONFIRMED'] } } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.newbornRecord.count(),
      prisma.immunization.count({ where: { nextDueAt: { gte: today, lte: nextMonth } } }),
      prisma.medicalRecord.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { patient: { select: { id: true, firstName: true, lastName: true, patientId: true } } },
      }),
      isAdmin
        ? prisma.auditLog.findMany({
            take: 5,
            where: { resource: 'Export' },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true, role: true } } },
          })
        : Promise.resolve([]),
    ]);

    reportData = {
      patientCount,
      activePregnancies,
      highRiskPregnancies,
      missedAncPregnancies,
      upcomingAppointments,
      completedAppointments,
      newbornCount,
      dueImmunizations,
      recentRecords,
      recentExports,
    };
  } catch (error) {
    console.error('Error loading dashboard reports:', error);
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Operational snapshot for maternal, newborn, and appointment workflows.</p>
        </div>
        <Card>
          <CardContent className="py-8 text-muted-foreground">
            Reports could not be loaded right now. Please refresh in a moment.
          </CardContent>
        </Card>
      </div>
    );
  }

  const metrics = [
    { label: 'Active Patients', value: reportData.patientCount, href: '/dashboard/patients' },
    { label: 'Active Pregnancies', value: reportData.activePregnancies, href: '/dashboard/pregnancies' },
    { label: 'High-Risk Pregnancies', value: reportData.highRiskPregnancies, href: '/dashboard/pregnancies' },
    { label: 'Missed ANC Follow-up', value: reportData.missedAncPregnancies, href: '/dashboard/pregnancies' },
    { label: 'Upcoming Appointments', value: reportData.upcomingAppointments, href: '/dashboard/appointments' },
    { label: 'Completed Appointments', value: reportData.completedAppointments, href: '/dashboard/appointments' },
    { label: 'Newborn Records', value: reportData.newbornCount, href: '/dashboard/newborns' },
    { label: 'Immunizations Due Soon', value: reportData.dueImmunizations, href: '/dashboard/immunizations' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Operational snapshot for maternal, newborn, and appointment workflows.</p>
        </div>
        {session.user.role === 'ADMIN' ? (
          <Button asChild variant="outline">
            <Link href="/dashboard/audit">View Audit Log</Link>
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.label} href={metric.href as any} className="block">
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{metric.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <ClinicalExportPanel userRole={session.user.role} />

      {session.user.role === 'ADMIN' ? (
        <Card>
          <CardHeader className="gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Export History</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Recent clinical data downloads recorded by the audit system.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/audit">Open Full Audit Log</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {reportData.recentExports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No exports have been recorded yet.</p>
            ) : reportData.recentExports.map((event) => {
              const metadata = readExportMetadata(event.metadata);

              return (
                <div key={event.id} className="grid gap-3 border-b pb-3 text-sm last:border-0 last:pb-0 md:grid-cols-5">
                  <div>
                    <span className="text-muted-foreground">When</span>
                    <p>{event.createdAt.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Actor</span>
                    <p className="truncate">{event.user?.email ?? 'System'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dataset</span>
                    <p className="capitalize">{metadata.type}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format</span>
                    <p>{metadata.format}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rows</span>
                    <p>{metadata.rowCount}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recent Clinical Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reportData.recentRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clinical records yet.</p>
          ) : reportData.recentRecords.map((record) => (
            <div key={record.id} className="flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{record.title}</p>
                <p className="text-sm text-muted-foreground">
                  {record.patient.firstName} {record.patient.lastName} · {record.recordType.replace(/_/g, ' ')}
                </p>
              </div>
              <span className="text-sm text-muted-foreground">{record.createdAt.toLocaleDateString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
