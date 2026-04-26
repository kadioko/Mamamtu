import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to reports.</div>;
  }

  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setDate(today.getDate() + 30);

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
  ]);

  const metrics = [
    { label: 'Active Patients', value: patientCount, href: '/dashboard/patients' },
    { label: 'Active Pregnancies', value: activePregnancies, href: '/dashboard/pregnancies' },
    { label: 'High-Risk Pregnancies', value: highRiskPregnancies, href: '/dashboard/pregnancies' },
    { label: 'Missed ANC Follow-up', value: missedAncPregnancies, href: '/dashboard/pregnancies' },
    { label: 'Upcoming Appointments', value: upcomingAppointments, href: '/dashboard/appointments' },
    { label: 'Completed Appointments', value: completedAppointments, href: '/dashboard/appointments' },
    { label: 'Newborn Records', value: newbornCount, href: '/dashboard/newborns' },
    { label: 'Immunizations Due Soon', value: dueImmunizations, href: '/dashboard/immunizations' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Operational snapshot for maternal, newborn, and appointment workflows.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/audit">View Audit Log</Link>
        </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Clinical Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clinical records yet.</p>
          ) : recentRecords.map((record) => (
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
