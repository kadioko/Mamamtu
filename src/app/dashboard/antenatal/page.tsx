import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AntenatalVisitsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to ANC visits.</div>;
  }

  const visits = await prisma.antenatalVisit.findMany({
    take: 50,
    orderBy: { visitDate: 'desc' },
    include: {
      pregnancyEpisode: {
        include: { patient: { select: { id: true, firstName: true, lastName: true, patientId: true } } },
      },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">ANC Visits</h1>
        <p className="text-muted-foreground">Review antenatal measurements, danger signs, and next visit dates.</p>
      </div>
      <div className="grid gap-4">
        {visits.length === 0 ? (
          <Card><CardContent className="py-8 text-muted-foreground">No ANC visits recorded yet.</CardContent></Card>
        ) : visits.map((visit) => (
          <Card key={visit.id}>
            <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-6">
              <div className="md:col-span-2">
                <span className="text-muted-foreground">Patient</span>
                <p>
                  <Link href={`/dashboard/patients/${visit.pregnancyEpisode.patient.id}`} className="font-medium hover:underline">
                    {visit.pregnancyEpisode.patient.firstName} {visit.pregnancyEpisode.patient.lastName}
                  </Link>
                </p>
              </div>
              <div><span className="text-muted-foreground">Visit</span><p>{visit.visitDate.toLocaleDateString()}</p></div>
              <div><span className="text-muted-foreground">GA</span><p>{visit.gestationalAgeWeeks ? `${visit.gestationalAgeWeeks} weeks` : 'Not set'}</p></div>
              <div><span className="text-muted-foreground">BP</span><p>{visit.bloodPressure ?? 'Not set'}</p></div>
              <div><span className="text-muted-foreground">Next</span><p>{visit.nextVisitDate?.toLocaleDateString() ?? 'Not set'}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
