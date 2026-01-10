import { Suspense } from 'react';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { AppointmentListWrapper } from '@/components/appointments/AppointmentListWrapper';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { getAppointments } from '@/services/appointmentService';
import { AppointmentStatus } from '@/types/appointment';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));

  // Fetch all necessary data in parallel
  const [upcomingAppointments, todayAppointments] = await Promise.all([
    getAppointments({
      startDate: new Date().toISOString(),
      status: [
        AppointmentStatus.SCHEDULED,
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.IN_PROGRESS,
      ],
      limit: 50,
    }),
    getAppointments({
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
      limit: 50,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage and schedule patient appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Suspense fallback={<AppointmentListSkeleton />}>
            <AppointmentListWrapper
              appointments={upcomingAppointments.data}
              isLoading={false}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="today" className="space-y-4">
          <Suspense fallback={<AppointmentListSkeleton />}>
            <AppointmentListWrapper
              appointments={todayAppointments.data}
              isLoading={false}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Suspense fallback={<CalendarSkeleton />}>
            <div className="rounded-lg border p-4">
              <AppointmentCalendar
                appointments={upcomingAppointments.data}
                selectedDate={today}
              />
            </div>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Skeleton loaders
function AppointmentListSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-64" />
      <div className="rounded-md border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <Skeleton className="h-[600px] w-full" />
    </div>
  );
}
