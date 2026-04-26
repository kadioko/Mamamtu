import { notFound } from 'next/navigation';
import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { ArchivePregnancyButton, DeleteClinicalButton } from '@/components/dashboard/ClinicalActions';
import { pregnancyFields } from '@/lib/clinicalFields';
import { dateValue, patientOptions, withOptions } from '@/lib/clinicalOptions';
import { prisma } from '@/lib/prisma';

export default async function EditPregnancyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const episode = await prisma.pregnancyEpisode.findUnique({ where: { id } });
  if (!episode) notFound();
  const fields = withOptions(pregnancyFields, { patientId: await patientOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div><h1 className="text-3xl font-bold">Edit Pregnancy Episode</h1><p className="text-muted-foreground">Update pregnancy status, risk details, and care notes.</p></div>
        <div className="flex gap-2">
          <ArchivePregnancyButton endpoint={`/api/pregnancy-episodes/${id}`} redirectTo="/dashboard/pregnancies" />
          <DeleteClinicalButton endpoint={`/api/pregnancy-episodes/${id}`} redirectTo="/dashboard/pregnancies" />
        </div>
      </div>
      <ClinicalForm endpoint={`/api/pregnancy-episodes/${id}`} method="PUT" fields={fields} successPath="/dashboard/pregnancies" submitLabel="Save Pregnancy" defaults={{ ...episode, estimatedDueDate: dateValue(episode.estimatedDueDate), lastMenstrualPeriod: dateValue(episode.lastMenstrualPeriod) } as any} />
    </div>
  );
}
