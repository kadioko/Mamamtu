import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { pregnancyFields } from '@/lib/clinicalFields';
import { patientOptions, withOptions } from '@/lib/clinicalOptions';

export default async function NewPregnancyPage() {
  const fields = withOptions(pregnancyFields, { patientId: await patientOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">New Pregnancy Episode</h1><p className="text-muted-foreground">Start tracking a pregnancy episode, risk level, and due date.</p></div>
      <ClinicalForm endpoint="/api/pregnancy-episodes" fields={fields} successPath="/dashboard/pregnancies" submitLabel="Create Pregnancy" />
    </div>
  );
}
