import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function ImmunizationsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to immunizations.</div>;
  }

  const immunizations = await prisma.immunization.findMany({
    take: 50,
    orderBy: { administeredAt: 'desc' },
    include: { newbornRecord: { select: { name: true, dateOfBirth: true } } },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Immunizations</h1>
          <p className="text-muted-foreground">Review newborn vaccines, doses, batches, and next due dates.</p>
        </div>
        <Button asChild><Link href="/dashboard/immunizations/new">New Immunization</Link></Button>
      </div>
      <div className="grid gap-4">
        {immunizations.length === 0 ? (
          <Card><CardContent className="py-8 text-muted-foreground">No immunizations recorded yet.</CardContent></Card>
        ) : immunizations.map((immunization) => (
          <Card key={immunization.id}>
            <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-6">
              <div><span className="text-muted-foreground">Vaccine</span><p className="font-medium">{immunization.vaccineName}</p></div>
              <div><span className="text-muted-foreground">Dose</span><p>{immunization.doseLabel ?? 'Not set'}</p></div>
              <div><span className="text-muted-foreground">Administered</span><p>{immunization.administeredAt.toLocaleDateString()}</p></div>
              <div><span className="text-muted-foreground">Next due</span><p>{immunization.nextDueAt?.toLocaleDateString() ?? 'Not set'}</p></div>
              <div><span className="text-muted-foreground">Facility</span><p>{immunization.facility ?? 'Not set'}</p></div>
              <div><span className="text-muted-foreground">Newborn</span><p>{immunization.newbornRecord.name ?? 'Unnamed newborn'}</p></div>
              <div className="md:col-span-6"><Link href={`/dashboard/immunizations/${immunization.id}/edit` as any} className="text-sm font-medium text-primary hover:underline">Edit immunization</Link></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
