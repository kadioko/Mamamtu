'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PatientForm } from '@/components/patients/PatientForm';
import { getPatient, updatePatient } from '@/services/patientService';
import type { Patient } from '@/types/patient';

export default function EditDashboardPatientPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPatient(params.id)
      .then(setPatient)
      .catch(() => setError('Failed to load patient'));
  }, [params.id]);

  const handleSubmit = async (data: Partial<Patient>) => {
    const updatedPatient = await updatePatient(params.id, data);
    toast.success('Patient updated successfully');
    router.push(`/dashboard/patients/${updatedPatient.id}`);
  };

  if (error) {
    return <div className="p-6 text-destructive">{error}</div>;
  }

  if (!patient) {
    return <div className="p-6 text-muted-foreground">Loading patient...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Patient</h1>
        <p className="text-muted-foreground">Update demographics, contacts, and clinical notes.</p>
      </div>
      <PatientForm initialData={patient} onSubmit={handleSubmit} submitButtonText="Save Patient" />
    </div>
  );
}
