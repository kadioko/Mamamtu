import { z } from 'zod';

// Common schemas
const dateSchema = z.string().transform((str) => new Date(str));
const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');
const emailSchema = z.string().email('Invalid email address');

// Patient schemas
export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  dateOfBirth: dateSchema.refine((date) => date < new Date(), 'Date of birth must be in the past'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], {
    errorMap: () => ({ message: 'Gender must be MALE, FEMALE, or OTHER' }),
  }),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().max(200, 'Address too long').optional(),
  city: z.string().max(50, 'City name too long').optional(),
  state: z.string().max(50, 'State name too long').optional(),
  postalCode: z.string().max(20, 'Postal code too long').optional(),
  country: z.string().max(50, 'Country name too long').optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string().max(50, 'Allergy name too long')).optional(),
  medicalHistory: z.string().max(1000, 'Medical history too long').optional(),
  emergencyContactName: z.string().max(100, 'Emergency contact name too long').optional(),
  emergencyContactPhone: phoneSchema.optional(),
  insuranceProvider: z.string().max(100, 'Insurance provider name too long').optional(),
  insuranceNumber: z.string().max(50, 'Insurance number too long').optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const updatePatientSchema = createPatientSchema.partial();

export const patientQuerySchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  search: z.string().max(100, 'Search term too long').optional(),
  includeInactive: z.coerce.boolean().default(false),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
});

// Appointment schemas
export const createAppointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  startTime: dateSchema.refine((date) => date >= new Date(), 'Start time must be in the future'),
  endTime: dateSchema.refine((date) => date >= new Date(), 'End time must be in the future'),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'LAB_TEST', 'ULTRASOUND', 'VACCINATION', 'OTHER'], {
    errorMap: () => ({ message: 'Invalid appointment type' }),
  }),
  location: z.string().max(200, 'Location too long').optional(),
  notes: z.string().max(1000, 'Notes too long').optional(),
  patientId: z.string().uuid('Invalid patient ID'),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const updateAppointmentSchema = createAppointmentSchema.partial();

export const appointmentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  patientId: z.string().uuid().optional(),
  status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  type: z.enum(['CONSULTATION', 'FOLLOW_UP', 'LAB_TEST', 'ULTRASOUND', 'VACCINATION', 'OTHER']).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Medical Record schemas
export const createMedicalRecordSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID'),
  recordType: z.enum([
    'CONSULTATION',
    'LAB_RESULT',
    'PRESCRIPTION',
    'PROCEDURE',
    'ADMISSION',
    'DISCHARGE',
    'VACCINATION',
    'PRENATAL_VISIT',
    'APGAR_SCORE',
    'GENERAL',
  ], {
    errorMap: () => ({ message: 'Invalid record type' }),
  }),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  diagnosis: z.string().max(1000, 'Diagnosis too long').optional(),
  symptoms: z.array(z.string().max(100, 'Symptom description too long')).optional(),
  treatment: z.string().max(2000, 'Treatment description too long').optional(),
  medications: z.array(z.string().max(100, 'Medication name too long')).optional(),
  labResults: z.array(z.string().max(200, 'Lab result description too long')).optional(),
  vitals: z.object({
    bloodPressure: z.string().max(20, 'Blood pressure format too long').optional(),
    heartRate: z.number().min(0).max(300, 'Heart rate out of range').optional(),
    temperature: z.number().min(30).max(45, 'Temperature out of range').optional(),
    weight: z.number().min(0).max(500, 'Weight out of range').optional(),
    height: z.number().min(0).max(300, 'Height out of range').optional(),
    oxygenSaturation: z.number().min(0).max(100, 'Oxygen saturation out of range').optional(),
  }).optional(),
  appointmentId: z.string().uuid().optional(),
  healthcareProvider: z.string().max(100, 'Provider name too long').optional(),
  facility: z.string().max(200, 'Facility name too long').optional(),
  notes: z.string().max(2000, 'Notes too long').optional(),
  attachments: z.array(z.string().url('Invalid attachment URL')).optional(),
});

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();

export const medicalRecordQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  patientId: z.string().uuid().optional(),
  recordType: z.enum([
    'CONSULTATION',
    'LAB_RESULT',
    'PRESCRIPTION',
    'PROCEDURE',
    'ADMISSION',
    'DISCHARGE',
    'VACCINATION',
    'PRENATAL_VISIT',
    'APGAR_SCORE',
    'GENERAL',
  ]).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

// Content schemas
export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  slug: z.string().min(1, 'Slug is required').max(200, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description too long').optional(),
  content: z.string().min(1, 'Content is required'),
  type: z.enum(['ARTICLE', 'VIDEO', 'PDF', 'PRESENTATION', 'QUIZ'], {
    errorMap: () => ({ message: 'Invalid content type' }),
  }),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], {
    errorMap: () => ({ message: 'Invalid difficulty level' }),
  }),
  duration: z.number().min(0, 'Duration must be positive').optional(),
  thumbnailUrl: z.string().url('Invalid thumbnail URL').optional(),
  videoUrl: z.string().url('Invalid video URL').optional(),
  fileUrl: z.string().url('Invalid file URL').optional(),
  categoryId: z.string().uuid('Invalid category ID'),
  tags: z.array(z.string().max(50, 'Tag too long')).max(10, 'Too many tags').optional(),
  isFeatured: z.boolean().default(false),
});

export const updateContentSchema = createContentSchema.partial();

export const contentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  type: z.enum(['ARTICLE', 'VIDEO', 'PDF', 'PRESENTATION', 'QUIZ']).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  categoryId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

// Notification schemas
export const createNotificationSchema = z.object({
  type: z.enum([
    'APPOINTMENT_REMINDER',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_RESCHEDULED',
    'LAB_RESULT_READY',
    'MEDICATION_REMINDER',
    'FOLLOW_UP_REQUIRED',
    'HIGH_RISK_ALERT',
    'SYSTEM_ANNOUNCEMENT',
  ], {
    errorMap: () => ({ message: 'Invalid notification type' }),
  }),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH'], {
    errorMap: () => ({ message: 'Invalid notification channel' }),
  }),
  userId: z.string().uuid('Invalid user ID').optional(),
  appointmentId: z.string().uuid('Invalid appointment ID').optional(),
  patientId: z.string().uuid('Invalid patient ID').optional(),
  scheduledFor: dateSchema.optional(),
  priority: z.number().min(0).max(10, 'Priority must be between 0 and 10').default(0),
  metadata: z.record(z.any()).optional(),
});

export const updateNotificationSchema = createNotificationSchema.partial();

export const notificationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  userId: z.string().uuid().optional(),
  type: z.enum([
    'APPOINTMENT_REMINDER',
    'APPOINTMENT_CANCELLED',
    'APPOINTMENT_RESCHEDULED',
    'LAB_RESULT_READY',
    'MEDICATION_REMINDER',
    'FOLLOW_UP_REQUIRED',
    'HIGH_RISK_ALERT',
    'SYSTEM_ANNOUNCEMENT',
  ]).optional(),
  status: z.enum(['PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']).optional(),
  channel: z.enum(['IN_APP', 'EMAIL', 'SMS', 'PUSH']).optional(),
  unreadOnly: z.coerce.boolean().default(false),
});

// User schemas
export const updateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  email: emailSchema.optional(),
  role: z.enum(['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT', 'RECEPTIONIST']).optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  role: z.enum(['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT', 'RECEPTIONIST']).optional(),
  isActive: z.coerce.boolean().optional(),
});

// Authentication schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'New passwords do not match',
  path: ['confirmNewPassword'],
});

// Export types for TypeScript
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientQueryInput = z.infer<typeof patientQuerySchema>;

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentQueryInput = z.infer<typeof appointmentQuerySchema>;

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type UpdateMedicalRecordInput = z.infer<typeof updateMedicalRecordSchema>;
export type MedicalRecordQueryInput = z.infer<typeof medicalRecordQuerySchema>;

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type ContentQueryInput = z.infer<typeof contentQuerySchema>;

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
