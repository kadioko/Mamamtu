'use client';

import { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Patient, Gender, BloodType } from '@/types/patient';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Validation schema - simplified to avoid type conflicts
const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  insuranceProvider: z.string().optional(),
  insuranceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Partial<Patient>;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export function PatientForm({ 
  initialData, 
  onSubmit, 
  isSubmitting: isSubmittingProp = false,
  submitButtonText = 'Submit' 
}: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Use the prop if provided, otherwise use local state for backward compatibility
  const submitting = isSubmittingProp !== undefined ? isSubmittingProp : isSubmitting;

  // Initialize form with default values
  const getDefaultValues = (): FormValues => {
    if (!initialData) {
      return {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'PREFER_NOT_TO_SAY' as const,
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        bloodType: 'UNKNOWN' as const,
        allergies: '',
        medicalHistory: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        insuranceProvider: '',
        insuranceNumber: '',
        notes: ''
      };
    }

    return {
      firstName: initialData.firstName || '',
      lastName: initialData.lastName || '',
      dateOfBirth: initialData.dateOfBirth
        ? format(new Date(initialData.dateOfBirth), 'yyyy-MM-dd')
        : '',
      gender: initialData.gender || 'PREFER_NOT_TO_SAY',
      phone: initialData.phone || '',
      email: initialData.email || '',
      address: initialData.address || '',
      city: initialData.city || '',
      state: initialData.state || '',
      postalCode: initialData.postalCode || '',
      country: initialData.country || '',
      bloodType: (initialData.bloodType as BloodType) || 'UNKNOWN',
      allergies: Array.isArray(initialData.allergies)
        ? initialData.allergies.join(', ')
        : (initialData.allergies || ''),
      medicalHistory: initialData.medicalHistory || '',
      emergencyContactName: initialData.emergencyContactName || '',
      emergencyContactPhone: initialData.emergencyContactPhone || '',
      insuranceProvider: initialData.insuranceProvider || '',
      insuranceNumber: initialData.insuranceNumber || '',
      notes: initialData.notes || ''
    };
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(patientSchema),
    mode: 'onBlur',
    defaultValues: getDefaultValues()
  });
  
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setError,
  } = form;

  // Handle form submission
  const handleFormSubmit = async (formData: FormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Transform data for API submission
      const dataToSubmit = {
        ...formData,
        gender: (formData.gender || 'PREFER_NOT_TO_SAY') as Gender,
        bloodType: (formData.bloodType || 'UNKNOWN') as BloodType,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        allergies: formData.allergies
          ? formData.allergies.split(',').map((a: string) => a.trim()).filter(Boolean)
          : [],
      };

      await onSubmit(dataToSubmit);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      
      let errorMessage = 'An error occurred while submitting the form';
      
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        error.issues.forEach((issue: z.ZodIssue) => {
          const field = issue.path?.[0] as keyof FormValues | undefined;
          if (field) {
            setError(field, {
              type: 'manual',
              message: issue.message,
            });
          }
        });
        return;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Form Header */}
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {initialData?.id ? 'Edit Patient' : 'Add New Patient'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {initialData?.id 
                ? 'Update the patient details below.' 
                : 'Fill in the form below to add a new patient.'}
            </p>
          </div>
          
          {/* Error Alert */}
          {submitError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{submitError}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <Input id="firstName" {...field} className={errors.firstName ? 'border-red-500' : ''} />
                  )}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <Input id="lastName" {...field} className={errors.lastName ? 'border-red-500' : ''} />
                  )}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
              </div>

            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="date"
                        id="dateOfBirth"
                        max={new Date().toISOString().split('T')[0]}
                        {...field}
                        className={errors.dateOfBirth ? 'border-red-500' : ''}
                      />
                    )}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="gender"
                        aria-label="Gender"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value as Gender)}
                        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          errors.gender
                            ? 'border-red-500 bg-red-50'
                            : 'border-input bg-background'
                        }`}
                      >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                      </select>
                    )}
                  />
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => <Input type="tel" id="phone" {...field} />}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <Input type="email" id="email" {...field} />}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Medical Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Controller
                    name="bloodType"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="bloodType"
                        aria-label="Blood Type"
                        {...field}
                        className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                          errors.bloodType
                            ? 'border-red-500 bg-red-50'
                            : 'border-input bg-background'
                        }`}
                      >
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="UNKNOWN">Unknown</option>
                      </select>
                    )}
                  />
                  {errors.bloodType && <p className="text-sm text-red-500">{errors.bloodType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Controller
                    name="allergies"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        id="allergies"
                        rows={3}
                        {...field}
                        placeholder="List any known allergies (medications, foods, etc.)"
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Controller
                    name="medicalHistory"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        id="medicalHistory"
                        rows={4}
                        {...field}
                        placeholder="Previous medical history, surgeries, conditions..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Address Information</h3>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => <Input id="address" {...field} />}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => <Input id="city" {...field} />}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Controller
                      name="postalCode"
                      control={control}
                      render={({ field }) => <Input id="postalCode" {...field} />}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => <Input id="country" {...field} />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Controller
                  name="emergencyContactName"
                  control={control}
                  render={({ field }) => <Input id="emergencyContactName" {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Controller
                  name="emergencyContactPhone"
                  control={control}
                  render={({ field }) => <Input type="tel" id="emergencyContactPhone" {...field} />}
                />
              </div>
            </div>
          </div>

          {/* Insurance Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Insurance Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Controller
                  name="insuranceProvider"
                  control={control}
                  render={({ field }) => <Input id="insuranceProvider" {...field} />}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Insurance Number</Label>
                <Controller
                  name="insuranceNumber"
                  control={control}
                  render={({ field }) => <Input id="insuranceNumber" {...field} />}
                />
              </div>
            </div>
          </div>

          {/* Additional Notes Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    id="notes"
                    rows={3}
                    {...field}
                    placeholder="Any additional notes or special instructions..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
              />
            </div>
          </div>

          {/* Form Footer */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={submitting}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-[120px] px-4 py-2"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg 
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {submitButtonText}...
                </span>
              ) : (
                <span>{submitButtonText}</span>
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
