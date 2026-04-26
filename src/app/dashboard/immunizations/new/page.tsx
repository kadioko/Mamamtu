import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { immunizationFields } from '@/lib/clinicalFields';
import { newbornOptions, withOptions } from '@/lib/clinicalOptions';

export default async function NewImmunizationPage() {
  const fields = withOptions(immunizationFields, { newbornRecordId: await newbornOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">New Immunization</h1><p className="text-muted-foreground">Record administered vaccines and upcoming due dates.</p></div>
      <ClinicalForm endpoint="/api/immunizations" fields={fields} successPath="/dashboard/immunizations" submitLabel="Create Immunization" />
    </div>
  );
}
