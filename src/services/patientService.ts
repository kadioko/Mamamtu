import { Patient, PatientsResponse, PatientSearchParams } from '@/types/patient';

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

  const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch patients');
  }
  
  return response.json();
};

export const getPatient = async (id: string): Promise<Patient> => {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  
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
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create patient');
  }
  
  return response.json();
};

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<Patient> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update patient');
  }
  
  return response.json();
};

export const deletePatient = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete patient');
  }
};
