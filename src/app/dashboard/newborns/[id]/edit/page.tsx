import { notFound } from 'next/navigation';
import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { newbornFields } from '@/lib/clinicalFields';
import { dateValue, patientOptions, pregnancyOptions, withOptions } from '@/lib/clinicalOptions';
import { prisma } from '@/lib/prisma';

export default async function EditNewbornPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const newborn = await prisma.newbornRecord.findUnique({ where: { id } });
  if (!newborn) notFound();
  const fields = withOptions(newbornFields, { motherPatientId: await patientOptions(), pregnancyEpisodeId: await pregnancyOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">Edit Newborn Record</h1><p className="text-muted-foreground">Update birth, APGAR, and complication details.</p></div>
      <ClinicalForm endpoint={`/api/newborn-records/${id}`} method="PUT" fields={fields} successPath="/dashboard/newborns" submitLabel="Save Newborn Record" defaults={{ ...newborn, dateOfBirth: dateValue(newborn.dateOfBirth) } as any} />
    </div>
  );
}
