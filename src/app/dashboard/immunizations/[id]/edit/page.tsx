import { notFound } from 'next/navigation';
import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { immunizationFields } from '@/lib/clinicalFields';
import { dateValue, newbornOptions, withOptions } from '@/lib/clinicalOptions';
import { prisma } from '@/lib/prisma';

export default async function EditImmunizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const immunization = await prisma.immunization.findUnique({ where: { id } });
  if (!immunization) notFound();
  const fields = withOptions(immunizationFields, { newbornRecordId: await newbornOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">Edit Immunization</h1><p className="text-muted-foreground">Update vaccine dose and next due date.</p></div>
      <ClinicalForm endpoint={`/api/immunizations/${id}`} method="PUT" fields={fields} successPath="/dashboard/immunizations" submitLabel="Save Immunization" defaults={{ ...immunization, administeredAt: dateValue(immunization.administeredAt), nextDueAt: dateValue(immunization.nextDueAt) } as any} />
    </div>
  );
}
