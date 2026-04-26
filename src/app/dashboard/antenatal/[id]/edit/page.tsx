import { notFound } from 'next/navigation';
import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { antenatalFields } from '@/lib/clinicalFields';
import { dateValue, pregnancyOptions, withOptions } from '@/lib/clinicalOptions';
import { prisma } from '@/lib/prisma';

export default async function EditAntenatalVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const visit = await prisma.antenatalVisit.findUnique({ where: { id } });
  if (!visit) notFound();
  const fields = withOptions(antenatalFields, { pregnancyEpisodeId: await pregnancyOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">Edit ANC Visit</h1><p className="text-muted-foreground">Update visit measurements and next steps.</p></div>
      <ClinicalForm endpoint={`/api/antenatal-visits/${id}`} method="PUT" fields={fields} successPath="/dashboard/antenatal" submitLabel="Save ANC Visit" defaults={{ ...visit, visitDate: dateValue(visit.visitDate), nextVisitDate: dateValue(visit.nextVisitDate) } as any} />
    </div>
  );
}
