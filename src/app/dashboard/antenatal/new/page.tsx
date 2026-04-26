import { ClinicalForm } from '@/components/dashboard/ClinicalForm';
import { antenatalFields } from '@/lib/clinicalFields';
import { pregnancyOptions, withOptions } from '@/lib/clinicalOptions';

export default async function NewAntenatalVisitPage() {
  const fields = withOptions(antenatalFields, { pregnancyEpisodeId: await pregnancyOptions() });
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div><h1 className="text-3xl font-bold">New ANC Visit</h1><p className="text-muted-foreground">Record antenatal vitals, interventions, and follow-up date.</p></div>
      <ClinicalForm endpoint="/api/antenatal-visits" fields={fields} successPath="/dashboard/antenatal" submitLabel="Create ANC Visit" />
    </div>
  );
}
