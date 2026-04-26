import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { newbornFields } from '@/lib/clinicalFields';
import { patientOptions, pregnancyOptions, withOptions } from '@/lib/clinicalOptions';

export default async function NewNewbornPage() {
  const fields = withOptions(newbornFields, { motherPatientId: await patientOptions(), pregnancyEpisodeId: await pregnancyOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">New Newborn Record</h1><p className="text-muted-foreground">Create a newborn birth record and link it to mother or pregnancy.</p></div>
      <ClinicalForm endpoint="/api/newborn-records" fields={fields} successPath="/dashboard/newborns" submitLabel="Create Newborn Record" />
    </div>
  );
}
