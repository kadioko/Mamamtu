import { NextResponse } from 'next/server';
import { getAppointments } from '@/services/appointmentService';
import { AppointmentFilter, AppointmentStatus, AppointmentType } from '@/types/appointment';
import { withAuth } from '@/lib/apiAuth';

// Helper function to safely parse enum values
function parseAppointmentStatus(status: string | null): AppointmentStatus | undefined {
  if (!status || !Object.values(AppointmentStatus).includes(status as AppointmentStatus)) {
    return undefined;
  }
  return status as AppointmentStatus;
}

function parseAppointmentType(type: string | null): AppointmentType | undefined {
  if (!type || !Object.values(AppointmentType).includes(type as AppointmentType)) {
    return undefined;
  }
  return type as AppointmentType;
}

function parseOptionalInt(value: string | null, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const GET = withAuth(
  async (request) => {
  try {
    const { searchParams } = new URL(request.url);

    const filter: AppointmentFilter = {
      patientId: searchParams.get('patientId') || undefined,
      status: parseAppointmentStatus(searchParams.get('status')),
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      type: parseAppointmentType(searchParams.get('type')),
      search: searchParams.get('search') || undefined,
      page: parseOptionalInt(searchParams.get('page'), 1),
      limit: parseOptionalInt(searchParams.get('limit'), 10),
    };

    const appointments = await getAppointments(filter);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
},
{ roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT'], requireEmailVerification: true }
);

export const POST = withAuth(
  async (request) => {
    try {
      const data = await request.json();
      const { createAppointment, checkAppointmentConflict } = await import('@/services/appointmentService');
      
      // Check for scheduling conflicts
      const hasConflict = await checkAppointmentConflict(
        data.patientId,
        data.startTime,
        data.endTime
      );
      
      if (hasConflict) {
        return NextResponse.json(
          { error: 'There is a scheduling conflict with another appointment' },
          { status: 400 }
        );
      }
      
      const appointment = await createAppointment(data);
      return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }
},
{ roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'], requireEmailVerification: true }
);
