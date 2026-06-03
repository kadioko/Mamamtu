'use client';

import { format, parseISO } from 'date-fns';
import { CalendarDays, User, Stethoscope, MapPin, FileText, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AppointmentStatusBadge } from './AppointmentStatusBadge';

interface AppointmentDetailProps {
  appointment: Appointment;
  onEdit?: () => void;
  onStatusChange?: (status: AppointmentStatus) => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

export function AppointmentDetail({
  appointment,
  onEdit,
  onStatusChange,
  onDelete,
  isLoading = false,
}: AppointmentDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const formatDateTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMMM d, yyyy h:mm a');
  };

  const formatDuration = (start: string | Date, end: string | Date) => {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    const mins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  const handleStatusChange = async (status: AppointmentStatus) => {
    if (!onStatusChange) return;
    try {
      setIsUpdatingStatus(true);
      await onStatusChange(status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const confirmDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete();
      router.push('/appointments');
    } catch (err) {
      console.error('Error deleting appointment:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const isPastAppointment = new Date(appointment.endTime) < new Date();
  const isCancellable = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(
    appointment.status
  );

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{appointment.title}</h1>
          <p className="text-muted-foreground">
            {formatDateTime(appointment.startTime)} – {formatDateTime(appointment.endTime)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={onEdit} disabled={isLoading}>
            Edit
          </Button>

          {appointment.status === AppointmentStatus.SCHEDULED && (
            <Button
              variant="default"
              onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}
              disabled={isLoading || isUpdatingStatus}
            >
              {isUpdatingStatus ? 'Confirming…' : 'Confirm'}
            </Button>
          )}

          {appointment.status === AppointmentStatus.CONFIRMED && (
            <Button
              variant="default"
              onClick={() => handleStatusChange(AppointmentStatus.IN_PROGRESS)}
              disabled={isLoading || isUpdatingStatus}
            >
              {isUpdatingStatus ? 'Updating…' : 'Start Appointment'}
            </Button>
          )}

          {appointment.status === AppointmentStatus.IN_PROGRESS && (
            <Button
              variant="default"
              onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}
              disabled={isLoading || isUpdatingStatus}
            >
              {isUpdatingStatus ? 'Completing…' : 'Complete'}
            </Button>
          )}

          {isCancellable && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)}
              disabled={isLoading || isUpdatingStatus}
            >
              {isUpdatingStatus ? 'Cancelling…' : 'Cancel'}
            </Button>
          )}

          {onDelete && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isLoading || isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </Button>
          )}
        </div>
      </div>

      {/* Missed-appointment alert */}
      {isPastAppointment && appointment.status === AppointmentStatus.SCHEDULED && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Missed Appointment</AlertTitle>
          <AlertDescription>
            This appointment was scheduled but not completed. Please update the status.
          </AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Date & Time
                  </div>
                  <div>
                    <div>{formatDateTime(appointment.startTime)}</div>
                    <div className="text-sm text-muted-foreground">
                      Duration: {formatDuration(appointment.startTime, appointment.endTime)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Type
                  </div>
                  <div>{appointment.type.replace(/_/g, ' ')}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Location
                  </div>
                  <div>{appointment.location || 'Not specified'}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <AppointmentStatusBadge status={appointment.status} />
                </div>
              </div>

              {appointment.description && (
                <div className="space-y-1 pt-2 border-t">
                  <div className="text-sm font-medium text-muted-foreground flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Description
                  </div>
                  <p className="whitespace-pre-line">{appointment.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {appointment.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {appointment.notes.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Patient</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    {appointment.patient.firstName} {appointment.patient.lastName}
                  </div>
                  {appointment.patient.dateOfBirth && (
                    <div className="text-sm text-muted-foreground">
                      DOB:{' '}
                      {format(
                        parseISO(String(appointment.patient.dateOfBirth)),
                        'MMM d, yyyy'
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
