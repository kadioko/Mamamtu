'use client';

import { ReactNode, useEffect } from 'react';
import { WebSocketService } from '@/lib/websocket';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AppointmentEventData {
  id: string;
  title: string;
  startTime: string;
  status?: string;
}

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const webSocketService = WebSocketService.getInstance();
    
    // Handle appointment created event
    const handleAppointmentCreated = (data: AppointmentEventData) => {
      toast.success(`New appointment: ${data.title}`, {
        description: `Scheduled for ${new Date(data.startTime).toLocaleString()}`,
        action: {
          label: 'View',
          onClick: () => router.push(`/appointments/${data.id}`),
        },
      });
    };

    // Handle appointment updated event
    const handleAppointmentUpdated = (data: AppointmentEventData) => {
      toast.info(`Appointment updated: ${data.title}`, {
        description: data.status ? `Status: ${data.status}` : 'Details updated',
        action: {
          label: 'View',
          onClick: () => router.push(`/appointments/${data.id}`),
        },
      });
    };

    // Handle appointment deleted event
    const handleAppointmentDeleted = (data: AppointmentEventData) => {
      toast.warning(`Appointment deleted: ${data.title}`);
      router.refresh(); // Refresh the page to update the UI
    };

    // Subscribe to WebSocket events with proper typing
    const unsubscribeCreated = webSocketService.on<AppointmentEventData>('appointmentCreated', handleAppointmentCreated);
    const unsubscribeUpdated = webSocketService.on<AppointmentEventData>('appointmentUpdated', handleAppointmentUpdated);
    const unsubscribeDeleted = webSocketService.on<AppointmentEventData>('appointmentDeleted', handleAppointmentDeleted);

    // Clean up subscriptions on unmount
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [router]);

  return <>{children}</>;
}
