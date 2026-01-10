export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';

export interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | Date;
  gender: Gender;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  bloodType?: BloodType;
  allergies: string[];
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}



export interface PatientsResponse {
  data: Patient[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
  };
}

// Medical Records Types
export type RecordType = 'CONSULTATION' | 'LAB_RESULT' | 'PRESCRIPTION' | 'PROCEDURE' | 'ADMISSION' | 'DISCHARGE' | 'VACCINATION' | 'PRENATAL_VISIT' | 'APISSCOMA' | 'GENERAL';

export interface MedicalRecord {
  id: string;
  patientId: string;
  recordType: RecordType;
  title: string;
  description?: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  medications?: Medication[];
  labResults?: LabResult[];
  vitals?: Vitals;
  appointmentId?: string;
  healthcareProvider?: string;
  facility?: string;
  notes?: string;
  attachments?: string[]; // File URLs
  createdAt: string | Date;
  updatedAt: string | Date;
  recordedBy: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

export interface LabResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  status: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  notes?: string;
}

export interface Vitals {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  gestationalAge?: number; // weeks for prenatal
}

export interface MedicalRecordsResponse {
  data: MedicalRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MedicalRecordFormData {
  recordType: RecordType;
  title: string;
  description?: string;
  diagnosis?: string;
  symptoms?: string[];
  treatment?: string;
  healthcareProvider?: string;
  facility?: string;
  notes?: string;
  vitals?: Partial<Vitals>;
  medications?: Partial<Medication>[];
  labResults?: Partial<LabResult>[];
}

export interface PatientSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof Patient;
  sortOrder?: 'asc' | 'desc';
}
