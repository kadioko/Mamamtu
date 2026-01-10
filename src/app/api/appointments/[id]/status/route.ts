import { NextRequest, NextResponse } from 'next/server';
import { AppointmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// PATCH /api/appointments/[id]/status - Update appointment status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, notes } = await request.json();

    // Validate status
    if (!Object.values(AppointmentStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid appointment status' },
        { status: 400 }
      );
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status as AppointmentStatus,
        ...(notes && { notes }),
        updatedAt: new Date(),
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // TODO: Send notifications to patient if needed
    // This could trigger email/SMS notifications based on status change

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update appointment status' },
      { status: 500 }
    );
  }
}

// GET /api/appointments/[id]/status - Get appointment status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        startTime: true,
        endTime: true,
        notes: true,
        patient: {
          select: {
            firstName: true,
            lastName: true,
            patientId: true,
          },
        },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment status' },
      { status: 500 }
    );
  }
}
