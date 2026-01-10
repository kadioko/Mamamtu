import { NextResponse } from 'next/server';
import { 
  getAppointmentById, 
  updateAppointment, 
  deleteAppointment,
  updateAppointmentStatus,
  checkAppointmentConflict
} from '@/services/appointmentService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await getAppointmentById(id);
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const { status, ...updateData } = data;
    
    // If updating appointment time, check for conflicts
    const { id } = await params;
    if (updateData.startTime || updateData.endTime) {
      const existingAppointment = await getAppointmentById(id);
      if (!existingAppointment) {
        return NextResponse.json(
          { error: 'Appointment not found' },
          { status: 404 }
        );
      }

      const hasConflict = await checkAppointmentConflict(
        existingAppointment.patientId,
        updateData.startTime || existingAppointment.startTime,
        updateData.endTime || existingAppointment.endTime,
        id
      );
      
      if (hasConflict) {
        return NextResponse.json(
          { error: 'There is a scheduling conflict with another appointment' },
          { status: 400 }
        );
      }
    }
    
    let updatedAppointment;
    
    // Handle status update separately if needed
    if (status) {
      updatedAppointment = await updateAppointmentStatus(id, status);
    } 
    
    // Handle other updates
    if (Object.keys(updateData).length > 0) {
      updatedAppointment = await updateAppointment(id, updateData);
    }
    
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteAppointment(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
