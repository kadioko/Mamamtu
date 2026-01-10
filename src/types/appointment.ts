import { Patient } from './patient';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  FOLLOW_UP = 'FOLLOW_UP',
  LAB_TEST = 'LAB_TEST',
  ULTRASOUND = 'ULTRASOUND',
  VACCINATION = 'VACCINATION',
  OTHER = 'OTHER',
}

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  status: AppointmentStatus;
  type: AppointmentType;
  location?: string;
  notes?: string;
  patient: Patient;
  patientId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

export interface CreateAppointmentInput {
  title: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  type: AppointmentType;
  location?: string;
  notes?: string;
  patientId: string;
}

export interface UpdateAppointmentInput extends Partial<CreateAppointmentInput> {
  status?: AppointmentStatus;
}

export interface AppointmentFilter {
  patientId?: string;
  status?: AppointmentStatus | AppointmentStatus[];
  startDate?: Date | string;
  endDate?: Date | string;
  type?: AppointmentType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedAppointments {
  data: Appointment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
