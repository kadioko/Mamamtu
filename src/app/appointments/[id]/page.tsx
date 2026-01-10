import { notFound, redirect } from 'next/navigation';
import { getAppointmentById } from '@/services/appointmentService';
import { AppointmentDetail } from '@/components/appointments/AppointmentDetail';
import type { AppointmentStatus } from '@/types/appointment';

export const dynamic = 'force-dynamic';

export default async function AppointmentPage({
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

  async function updateAppointmentStatus(status: AppointmentStatus) {
    'use server';
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/appointments/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error instanceof Error ? error : new Error('Failed to update appointment status');
    }
  }

  async function deleteAppointment(): Promise<void> {
    'use server';
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/appointments/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error instanceof Error ? error : new Error('Failed to delete appointment');
    }
  }

  return (
    <div className="container mx-auto py-6">
      <AppointmentDetail
        appointment={appointment}
        onEdit={() => redirect(`/appointments/${id}/edit`)}
        onStatusChange={updateAppointmentStatus}
        onDelete={async () => {
          'use server';
          await deleteAppointment();
          redirect('/appointments');
        }}
      />
    </div>
  );
}
