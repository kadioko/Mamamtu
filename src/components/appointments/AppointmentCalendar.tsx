'use client';

import { useState, useCallback, useMemo } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Appointment, AppointmentStatus } from '@/types/appointment';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const statusColors = {
  [AppointmentStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [AppointmentStatus.CONFIRMED]: 'bg-green-100 text-green-800 border-green-200',
  [AppointmentStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [AppointmentStatus.COMPLETED]: 'bg-purple-100 text-purple-800 border-purple-200',
  [AppointmentStatus.CANCELLED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [AppointmentStatus.NO_SHOW]: 'bg-red-100 text-red-800 border-red-200',
};

interface AppointmentCalendarProps {
  appointments: Appointment[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  className?: string;
}

export function AppointmentCalendar({
  appointments,
  selectedDate = new Date(),
  onDateSelect,
  onAppointmentClick,
  className,
}: AppointmentCalendarProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  
  // Generate days for the current week view
  const weekStartDate = startOfWeek(currentMonth, { weekStartsOn: 0 });
  const weekDaysList = Array.from({ length: 7 }).map((_, index) => 
    addDays(weekStartDate, index)
  );

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    
    appointments.forEach(appointment => {
      const date = typeof appointment.startTime === 'string' 
        ? format(parseISO(appointment.startTime), 'yyyy-MM-dd')
        : format(appointment.startTime, 'yyyy-MM-dd');
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(appointment);
    });
    
    return grouped;
  }, [appointments]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => addDays(prev, direction === 'prev' ? -7 : 7));
  };

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      router.push(`/appointments?date=${format(date, 'yyyy-MM-dd')}`);
    }
  };

  const handleAppointmentClick = (e: React.MouseEvent, appointment: Appointment) => {
    e.stopPropagation();
    if (onAppointmentClick) {
      onAppointmentClick(appointment);
    } else {
      router.push(`/appointments/${appointment.id}`);
    }
  };

  const handleNewAppointment = (e: React.MouseEvent, date: Date) => {
    e.stopPropagation();
    router.push(`/appointments/new?date=${format(date, 'yyyy-MM-dd')}`);
  };

  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };

  const isSelected = (date: Date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="text-sm"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-t-md overflow-hidden">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className="bg-white p-2 text-center text-sm font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 flex-1 rounded-b-md overflow-hidden">
        {weekDaysList.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          const dayAppointments = appointmentsByDay[dateKey] || [];
          
          return (
            <div
              key={dateKey}
              className={cn(
                'bg-white p-2 flex flex-col min-h-[120px]',
                'hover:bg-gray-50 cursor-pointer transition-colors',
                isToday(date) && 'bg-blue-50',
                isSelected(date) && 'ring-2 ring-blue-500 z-10'
              )}
              onClick={() => handleDateClick(date)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={cn(
                  'text-sm font-medium',
                  isToday(date) ? 'text-blue-700' : 'text-gray-900',
                  isSelected(date) && 'font-bold'
                )}>
                  {format(date, 'd')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-500 hover:text-blue-600 hover:bg-blue-100"
                  onClick={(e) => handleNewAppointment(e, date)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <div className="space-y-1 overflow-y-auto flex-1">
                {dayAppointments.slice(0, 3).map((appointment) => {
                  const startTime = typeof appointment.startTime === 'string' 
                    ? format(parseISO(appointment.startTime), 'h:mma')
                    : format(appointment.startTime, 'h:mma');
                  
                  return (
                    <div
                      key={appointment.id}
                      className={cn(
                        'text-xs p-1 rounded border truncate cursor-pointer',
                        statusColors[appointment.status],
                        'hover:opacity-90 transition-opacity'
                      )}
                      onClick={(e) => handleAppointmentClick(e, appointment)}
                    >
                      <div className="font-medium truncate">{appointment.title}</div>
                      <div className="text-xs opacity-80 truncate">
                        {startTime} • {appointment.patient.firstName}
                      </div>
                    </div>
                  );
                })}
                
                {dayAppointments.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayAppointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
