import { NextResponse } from 'next/server';
import { getAppointments } from '@/services/appointmentService';
import { AppointmentFilter, AppointmentStatus, AppointmentType } from '@/types/appointment';
import { withAuth } from '@/lib/apiAuth';
import { appointmentQuerySchema, createAppointmentSchema, withValidation } from '@/lib/validation';

export const GET = withAuth(
  withValidation(appointmentQuerySchema, 'query')(
    async (request, context, query) => {
      try {
        const filter: AppointmentFilter = {
          ...query,
          status: query.status as AppointmentStatus | AppointmentStatus[] | undefined,
          type: query.type as AppointmentType | undefined,
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
    }
  ),
  { roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT', 'RECEPTIONIST'], requireEmailVerification: true }
);

export const POST = withAuth(
  withValidation(createAppointmentSchema, 'body')(
    async (request, context, data) => {
      try {
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
      
      const appointment = await createAppointment(data as Parameters<typeof createAppointment>[0]);
      return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }
    }
  ),
  { roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST'], requireEmailVerification: true }
);
