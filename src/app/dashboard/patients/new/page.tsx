'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PatientForm } from '@/components/patients/PatientForm';
import { createPatient } from '@/services/patientService';
import type { Patient } from '@/types/patient';

export default function NewDashboardPatientPage() {
  const router = useRouter();

  const handleSubmit = async (data: Partial<Patient>) => {
    const patient = await createPatient(data);
    toast.success('Patient created successfully');
    router.push(`/dashboard/patients/${patient.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">New Patient</h1>
        <p className="text-muted-foreground">Create a patient record for clinical follow-up.</p>
      </div>
      <PatientForm onSubmit={handleSubmit} submitButtonText="Create Patient" />
    </div>
  );
}
