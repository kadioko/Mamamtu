import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function NewbornRecordsPage() {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to newborn records.</div>;
  }

  const records = await prisma.newbornRecord.findMany({
    take: 50,
    orderBy: { dateOfBirth: 'desc' },
    include: {
      motherPatient: { select: { id: true, firstName: true, lastName: true, patientId: true } },
      _count: { select: { immunizations: true } },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Newborn Records</h1>
        <p className="text-muted-foreground">Track births, APGAR scores, birth weight, and linked immunizations.</p>
      </div>
      <div className="grid gap-4">
        {records.length === 0 ? (
          <Card><CardContent className="py-8 text-muted-foreground">No newborn records recorded yet.</CardContent></Card>
        ) : records.map((record) => (
          <Card key={record.id}>
            <CardContent className="grid gap-3 p-4 text-sm md:grid-cols-6">
              <div><span className="text-muted-foreground">Baby</span><p className="font-medium">{record.name ?? 'Unnamed newborn'}</p></div>
              <div><span className="text-muted-foreground">DOB</span><p>{record.dateOfBirth.toLocaleDateString()}</p></div>
              <div><span className="text-muted-foreground">Sex</span><p>{record.sex ?? 'Not set'}</p></div>
              <div><span className="text-muted-foreground">Weight</span><p>{record.birthWeight ? `${record.birthWeight} kg` : 'Not set'}</p></div>
              <div><span className="text-muted-foreground">APGAR</span><p>{record.apgarOneMinute ?? '-'} / {record.apgarFiveMinutes ?? '-'}</p></div>
              <div>
                <span className="text-muted-foreground">Mother</span>
                <p>{record.motherPatient ? <Link href={`/dashboard/patients/${record.motherPatient.id}`} className="hover:underline">{record.motherPatient.firstName} {record.motherPatient.lastName}</Link> : 'Not linked'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
