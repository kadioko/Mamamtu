import Link from 'next/link';
import { prisma } from '@/lib/prisma';
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

  const patientRecords = await prisma.patient.findMany({
    where: { isActive: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 100,
    select: { id: true, firstName: true, lastName: true, patientId: true },
  });
  const patients = patientRecords.map(patient => ({
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName} (${patient.patientId})`,
  }));

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
          initialData={{
            startTime: defaultDate,
            endTime: defaultEndDate,
          }}
        />
        {patients.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Add a patient before scheduling appointments.{' '}
            <Link href="/dashboard/patients/new" className="font-medium text-primary hover:underline">
              Create patient
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
