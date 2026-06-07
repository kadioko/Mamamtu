import Link from 'next/link';
import type { Prisma, PregnancyStatus } from '@prisma/client';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

type PregnancySearchParams = {
  risk?: string;
  status?: PregnancyStatus;
};

type Props = {
  searchParams?: Promise<PregnancySearchParams>;
};

export default async function PregnanciesPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role)) {
    return <div className="p-6 text-muted-foreground">You do not have access to pregnancy episodes.</div>;
  }

  const resolvedSearchParams = await searchParams;
  const statusFilter = resolvedSearchParams?.status;
  const riskFilter = resolvedSearchParams?.risk;
  const validStatuses: PregnancyStatus[] = ['ACTIVE', 'DELIVERED', 'LOST_TO_FOLLOW_UP', 'MISCARRIAGE', 'REFERRED'];
  const where: Prisma.PregnancyEpisodeWhereInput = {};
  const activeFilters: string[] = [];

  if (statusFilter && validStatuses.includes(statusFilter)) {
    where.status = statusFilter;
    activeFilters.push(statusFilter.replace(/_/g, ' '));
  }

  if (riskFilter === 'high') {
    where.riskLevel = { gte: 2 };
    where.status = 'ACTIVE';
    activeFilters.push('High risk active pregnancies');
  }

  const episodes = await prisma.pregnancyEpisode.findMany({
    take: 50,
    where,
    orderBy: riskFilter === 'high'
      ? [{ riskLevel: 'desc' }, { estimatedDueDate: 'asc' }]
      : [{ status: 'asc' }, { estimatedDueDate: 'asc' }],
    include: {
      patient: { select: { id: true, firstName: true, lastName: true, patientId: true } },
      _count: { select: { antenatalVisits: true, newbornRecords: true } },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pregnancy Episodes</h1>
          <p className="text-muted-foreground">Track active pregnancies, due dates, risk flags, and linked ANC visits.</p>
          {activeFilters.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary">{filter}</Badge>
              ))}
            </div>
          ) : null}
        </div>
        <Button asChild><Link href="/dashboard/pregnancies/new">New Pregnancy</Link></Button>
      </div>
      <div className="grid gap-4">
        {episodes.length === 0 ? (
          <Card><CardContent className="py-8 text-muted-foreground">No pregnancy episodes recorded yet.</CardContent></Card>
        ) : episodes.map((episode) => (
          <Card key={episode.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                <Link href={`/dashboard/patients/${episode.patient.id}`} className="hover:underline">
                  {episode.patient.firstName} {episode.patient.lastName}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm md:grid-cols-5">
              <div><span className="text-muted-foreground">Patient ID</span><p>{episode.patient.patientId}</p></div>
              <div><span className="text-muted-foreground">Status</span><p>{episode.status.replace(/_/g, ' ')}</p></div>
              <div><span className="text-muted-foreground">EDD</span><p>{episode.estimatedDueDate?.toLocaleDateString() ?? 'Not set'}</p></div>
              <div><span className="text-muted-foreground">Risk</span><p>{episode.riskLevel > 0 ? `Level ${episode.riskLevel}` : 'Routine'}</p></div>
              <div><span className="text-muted-foreground">ANC Visits</span><p>{episode._count.antenatalVisits}</p></div>
              <div className="md:col-span-5"><Link href={`/dashboard/pregnancies/${episode.id}/edit` as any} className="text-sm font-medium text-primary hover:underline">Edit episode</Link></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
