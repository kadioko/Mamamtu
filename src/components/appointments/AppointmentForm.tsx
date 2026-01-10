'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Appointment, CreateAppointmentInput, AppointmentStatus, AppointmentType } from '@/types/appointment';

const appointmentFormSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100),
  description: z.string().optional(),
  startTime: z.date({
    message: 'Start time is required',
  }),
  endTime: z.date({
    message: 'End time is required',
  }),
  type: z.nativeEnum(AppointmentType, {
    message: 'Appointment type is required',
  }),
  location: z.string().optional(),
  notes: z.string().optional(),
  patientId: z.string().min(1, 'Patient is required'),
});

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  onSuccess?: () => void;
  onCancel?: () => void;
  patients: Array<{ id: string; name: string }>;
}

export function AppointmentForm({ initialData, onSuccess, onCancel, patients }: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const defaultValues: Partial<AppointmentFormValues> = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    startTime: initialData?.startTime ? new Date(initialData.startTime) : new Date(),
    endTime: initialData?.endTime ? new Date(initialData.endTime) : new Date(Date.now() + 3600000), // 1 hour later
    type: initialData?.type || AppointmentType.CONSULTATION,
    location: initialData?.location || '',
    notes: initialData?.notes || '',
    patientId: initialData?.patientId || '',
  };

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (initialData) {
      form.reset(defaultValues);
    }
  }, [initialData]);

  const onSubmit = async (data: AppointmentFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = initialData?.id 
        ? `/api/appointments/${initialData.id}`
        : '/api/appointments';
      
      const method = initialData?.id ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save appointment');
      }

      const result = await response.json();
      toast.success(initialData?.id ? 'Appointment updated successfully' : 'Appointment created successfully');
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/appointments');
      }
    } catch (err) {
      console.error('Error saving appointment:', err);
      setError(err instanceof Error ? err.message : 'Failed to save appointment');
      toast.error('Failed to save appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Selection */}
        <div className="space-y-2">
          <Label htmlFor="patientId">Patient</Label>
          <Select
            onValueChange={(value) => form.setValue('patientId', value)}
            defaultValue={form.getValues('patientId')}
            disabled={!!initialData?.id}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.patientId && (
            <p className="text-sm text-red-500">{form.formState.errors.patientId.message}</p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="Appointment title"
            {...form.register('title')}
          />
          {form.formState.errors.title && (
            <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
          )}
        </div>

        {/* Start Time */}
        <div className="space-y-2">
          <Label>Start Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !form.watch('startTime') && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('startTime') ? (
                  format(form.watch('startTime'), 'PPP HH:mm')
                ) : (
                  <span>Pick a date and time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.watch('startTime')}
                onSelect={(date) => date && form.setValue('startTime', date)}
                initialFocus
              />
              <div className="p-4">
                <Input
                  type="time"
                  value={form.watch('startTime') ? format(form.watch('startTime'), 'HH:mm') : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date(form.watch('startTime'));
                    newDate.setHours(hours, minutes);
                    form.setValue('startTime', newDate, { shouldValidate: true });
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
          {form.formState.errors.startTime && (
            <p className="text-sm text-red-500">{form.formState.errors.startTime.message}</p>
          )}
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <Label>End Time</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !form.watch('endTime') && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {form.watch('endTime') ? (
                  format(form.watch('endTime'), 'PPP HH:mm')
                ) : (
                  <span>Pick a date and time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={form.watch('endTime')}
                onSelect={(date) => date && form.setValue('endTime', date)}
                initialFocus
              />
              <div className="p-4">
                <Input
                  type="time"
                  value={form.watch('endTime') ? format(form.watch('endTime'), 'HH:mm') : ''}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date(form.watch('endTime'));
                    newDate.setHours(hours, minutes);
                    form.setValue('endTime', newDate, { shouldValidate: true });
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
          {form.formState.errors.endTime && (
            <p className="text-sm text-red-500">{form.formState.errors.endTime.message}</p>
          )}
        </div>

        {/* Appointment Type */}
        <div className="space-y-2">
          <Label>Appointment Type</Label>
          <Select
            onValueChange={(value: AppointmentType) => form.setValue('type', value)}
            defaultValue={form.getValues('type')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select appointment type" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(AppointmentType).map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.type && (
            <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="Appointment location"
            {...form.register('location')}
          />
          {form.formState.errors.location && (
            <p className="text-sm text-red-500">{form.formState.errors.location.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Appointment description"
          className="min-h-[100px]"
          {...form.register('description')}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes"
          className="min-h-[100px]"
          {...form.register('notes')}
        />
        {form.formState.errors.notes && (
          <p className="text-sm text-red-500">{form.formState.errors.notes.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onCancel ? onCancel() : router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData?.id ? 'Update Appointment' : 'Create Appointment'}
        </Button>
      </div>
    </form>
  );
}
