import { redirect } from 'next/navigation';
import { getPatients } from '@/services/patientService';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';

export const dynamic = 'force-dynamic';

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  // Get default date from URL params if provided
  const defaultDate = resolvedSearchParams.date
    ? new Date(resolvedSearchParams.date as string)
    : new Date();

  // Set default time to next hour
  defaultDate.setHours(defaultDate.getHours() + 1, 0, 0, 0);

  // End time is 1 hour after start time by default
  const defaultEndDate = new Date(defaultDate);
  defaultEndDate.setHours(defaultDate.getHours() + 1);

  // Fetch patients for the dropdown
  const patientsResponse = await getPatients({ limit: 100 });
  const patients = patientsResponse.data.map(patient => ({
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
  }));

  // Submission is handled inside AppointmentForm client component

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Appointment</h1>
        <p className="text-muted-foreground">
          Schedule a new appointment for a patient
        </p>
      </div>

      <div className="max-w-4xl">
        <AppointmentForm
          patients={patients}
          onCancel={async () => {
            'use server';
            redirect('/appointments');
          }}
        />
      </div>
    </div>
  );
}
