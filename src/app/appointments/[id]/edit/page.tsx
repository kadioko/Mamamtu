import { notFound, redirect } from 'next/navigation';
import { getAppointmentById } from '@/services/appointmentService';
import { getPatients } from '@/services/patientService';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';

export const dynamic = 'force-dynamic';

export default async function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    return notFound();
  }

  // Get the appointment data
  let appointment;
  try {
    appointment = await getAppointmentById(id);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return notFound();
  }

  if (!appointment) {
    return notFound();
  }

  // Fetch patients for the dropdown
  const patientsResponse = await getPatients({ limit: 100 });
  const patients = patientsResponse.data.map(patient => ({
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
  }));


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
        <p className="text-muted-foreground">
          Update the appointment details
        </p>
      </div>

      <div className="max-w-4xl">
        <AppointmentForm
          initialData={{
            ...appointment,
            patientId: appointment.patient.id,
            startTime: new Date(appointment.startTime),
            endTime: new Date(appointment.endTime),
          }}
          patients={patients}
          onCancel={async () => {
            'use server';
            redirect(`/appointments/${id}`);
          }}
        />
      </div>
    </div>
  );
}
