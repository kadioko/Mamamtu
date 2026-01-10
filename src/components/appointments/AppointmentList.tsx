'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { CalendarDays, Clock, User, Stethoscope, MoreVertical, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const statusVariantMap = {
  [AppointmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  [AppointmentStatus.CONFIRMED]: 'bg-green-100 text-green-800 hover:bg-green-200',
  [AppointmentStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  [AppointmentStatus.COMPLETED]: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  [AppointmentStatus.CANCELLED]: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  [AppointmentStatus.NO_SHOW]: 'bg-red-100 text-red-800 hover:bg-red-200',
};

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onStatusChange: (id: string, status: AppointmentStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function AppointmentList({
  appointments,
  onEdit,
  onStatusChange,
  onDelete,
  isLoading = false,
}: AppointmentListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>(appointments);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAppointments(appointments);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = appointments.filter(
        (appt) =>
          appt.title.toLowerCase().includes(searchLower) ||
          appt.patient.firstName.toLowerCase().includes(searchLower) ||
          appt.patient.lastName.toLowerCase().includes(searchLower) ||
          appt.type.toLowerCase().includes(searchLower) ||
          appt.status.toLowerCase().includes(searchLower)
      );
      setFilteredAppointments(filtered);
    }
  }, [searchTerm, appointments]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      setIsDeleting((prev) => ({ ...prev, [id]: true }));
      await onDelete(id);
      toast.success('Appointment deleted successfully');
    } catch (error) {
      console.error('Error deleting appointment:', error);
      toast.error('Failed to delete appointment');
    } finally {
      setIsDeleting((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      setIsUpdatingStatus((prev) => ({ ...prev, [id]: true }));
      await onStatusChange(id, status);
      toast.success('Appointment status updated');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    } finally {
      setIsUpdatingStatus((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatAppointmentTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const formatDuration = (start: string | Date, end: string | Date) => {
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    const durationInMinutes = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 bg-gray-200 rounded-md animate-pulse" />
        <div className="border rounded-md">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-4 border-b last:border-b-0">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No appointments</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new appointment.
        </p>
        <div className="mt-6">
          <Button onClick={() => router.push('/appointments/new')}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-md">
          <Input
            type="search"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <Button onClick={() => router.push('/appointments/new')}>
          <CalendarPlus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="font-medium">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div>{formatAppointmentTime(appointment.startTime)}</div>
                        <div className="text-xs text-gray-500">
                          {formatAppointmentTime(appointment.endTime)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-gray-500" />
                      {appointment.type.replace(/_/g, ' ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {formatDuration(appointment.startTime, appointment.endTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`${statusVariantMap[appointment.status]} capitalize`}
                      variant="outline"
                    >
                      {appointment.status.toLowerCase().replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(appointment)}>
                          Edit
                        </DropdownMenuItem>
                        {appointment.status !== AppointmentStatus.COMPLETED && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(appointment.id, AppointmentStatus.COMPLETED)
                            }
                            disabled={isUpdatingStatus[appointment.id]}
                          >
                            {isUpdatingStatus[appointment.id] ? 'Updating...' : 'Mark as Completed'}
                          </DropdownMenuItem>
                        )}
                        {appointment.status !== AppointmentStatus.CANCELLED && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(appointment.id, AppointmentStatus.CANCELLED)
                            }
                            disabled={isUpdatingStatus[appointment.id]}
                          >
                            {isUpdatingStatus[appointment.id] ? 'Updating...' : 'Cancel Appointment'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(appointment.id)}
                          className="text-red-600 focus:text-red-600"
                          disabled={isDeleting[appointment.id]}
                        >
                          {isDeleting[appointment.id] ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No appointments found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
