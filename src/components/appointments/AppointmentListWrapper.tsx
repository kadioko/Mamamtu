'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppointmentList } from './AppointmentList';
import { Appointment, AppointmentStatus } from '@/types/appointment';

interface AppointmentListWrapperProps {
  appointments: Appointment[];
  isLoading?: boolean;
}

export function AppointmentListWrapper({
  appointments,
  isLoading = false,
}: AppointmentListWrapperProps) {
  const router = useRouter();

  const handleEdit = (appointment: Appointment) => {
    router.push(`/appointments/${appointment.id}/edit`);
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const response = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update appointment status');
      }

      toast.success('Appointment status updated successfully');
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }

      toast.success('Appointment deleted successfully');
      // Reload the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
      throw error;
    }
  };

  return (
    <AppointmentList
      appointments={appointments}
      onEdit={handleEdit}
      onStatusChange={handleStatusChange}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
}
