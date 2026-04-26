import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, MapPin, Plus } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage() {
  const appointments = await prisma.appointment.findMany({
    take: 20,
    orderBy: { startTime: 'asc' },
    where: {
      endTime: { gte: new Date() },
    },
    include: {
      patient: { select: { firstName: true, lastName: true, patientId: true } },
    },
  });

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage upcoming patient visits and follow-ups.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No upcoming appointments yet.
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className="border-l-4 border-primary">
              <CardContent className="p-4">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h3 className="font-medium">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {appointment.title} · {appointment.type.replace(/_/g, ' ')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {appointment.startTime.toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {appointment.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {appointment.location && (
                        <span className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          {appointment.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                    {appointment.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
