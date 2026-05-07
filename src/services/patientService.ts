import { Patient, PatientsResponse, PatientSearchParams, MedicalRecordsResponse } from '@/types/patient';

const API_BASE_URL = '/api/patients';

export const getPatients = async (params?: PatientSearchParams): Promise<PatientsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  
  return response.json();
};

export const getPatient = async (id: string): Promise<Patient> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient');
  }
  
  return response.json();
};

export const createPatient = async (data: Partial<Patient>): Promise<Patient> => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to create patient');
  }
  
  return response.json();
};

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to update patient');
  }
  
  return response.json();
};

export const deletePatient = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to delete patient');
  }
};

export const searchPatients = async (query: string, limit = 10): Promise<Patient[]> => {
  const queryParams = new URLSearchParams({ search: query, limit: String(limit) });
  const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to search patients');
  }

  const result: PatientsResponse = await response.json();
  return result.data;
};

export const getPatientMedicalRecords = async (
  patientId: string,
  params?: { page?: number; limit?: number; recordType?: string }
): Promise<MedicalRecordsResponse> => {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
  }

  const response = await fetch(
    `${API_BASE_URL}/${patientId}/records?${queryParams.toString()}`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch patient medical records');
  }

  return response.json();
};

export const exportPatients = async (format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  const exportFormat = format === 'json' ? 'csv' : format;
  const response = await fetch('/api/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      type: 'patients',
      format: exportFormat,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to export patients');
  }

  return response.blob();
};
