import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

type TimelineItem = {
  at: Date;
  title: string;
  type: string;
  detail?: string | null;
};

export default async function PatientTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to patient timelines.</div>;
  }

  const { id } = await params;
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: true,
      medicalRecords: true,
      pregnancyEpisodes: { include: { antenatalVisits: true, newbornRecords: true } },
      newbornRecords: { include: { immunizations: true } },
    },
  });
  if (!patient) notFound();

  const auditLogs = await prisma.auditLog.findMany({
    where: { patientId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { user: { select: { name: true, email: true } } },
  });

  const items: TimelineItem[] = [
    ...patient.appointments.map((item) => ({ at: item.startTime, title: item.title, type: `Appointment - ${item.status}`, detail: item.type.replace(/_/g, ' ') })),
    ...patient.medicalRecords.map((item) => ({ at: item.createdAt, title: item.title, type: `Medical Record - ${item.recordType}`, detail: item.diagnosis })),
    ...patient.pregnancyEpisodes.map((item) => ({ at: item.startedAt, title: 'Pregnancy episode started', type: item.status.replace(/_/g, ' '), detail: item.highRiskFlags.join(', ') || item.notes })),
    ...patient.pregnancyEpisodes.flatMap((episode) => episode.antenatalVisits.map((visit) => ({ at: visit.visitDate, title: 'ANC visit', type: 'Antenatal Care', detail: [visit.bloodPressure, visit.gestationalAgeWeeks ? `${visit.gestationalAgeWeeks} weeks` : null].filter(Boolean).join(' · ') }))),
    ...patient.newbornRecords.map((item) => ({ at: item.dateOfBirth, title: item.name || 'Newborn recorded', type: 'Birth/Newborn', detail: item.deliveryFacility })),
    ...patient.newbornRecords.flatMap((record) => record.immunizations.map((item) => ({ at: item.administeredAt, title: item.vaccineName, type: 'Immunization', detail: item.doseLabel }))),
    ...auditLogs.map((log) => ({ at: log.createdAt, title: log.action.replace(/_/g, ' '), type: 'Care Activity', detail: log.user?.name || log.user?.email || 'System' })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <div className="space-y-6 p-6">
      <div>
        <Link href={`/dashboard/patients/${patient.id}`} className="text-sm font-medium text-primary hover:underline">Back to patient</Link>
        <h1 className="mt-2 text-3xl font-bold">{patient.firstName} {patient.lastName} Timeline</h1>
        <p className="text-muted-foreground">Appointments, records, pregnancy events, newborn events, immunizations, and audit-safe care activity.</p>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <Card><CardContent className="py-8 text-muted-foreground">No timeline activity yet.</CardContent></Card>
        ) : items.map((item, index) => (
          <Card key={`${item.type}-${item.title}-${index}`}>
            <CardContent className="grid gap-2 p-4 md:grid-cols-[160px_180px_1fr]">
              <p className="text-sm text-muted-foreground">{item.at.toLocaleString()}</p>
              <p className="text-sm font-medium">{item.type}</p>
              <div>
                <p className="font-semibold">{item.title}</p>
                {item.detail && <p className="text-sm text-muted-foreground">{item.detail}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
