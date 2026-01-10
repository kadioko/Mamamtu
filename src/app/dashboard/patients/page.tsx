import { PatientList } from '@/components/patients/PatientList';

export default function PatientsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records</p>
        </div>
      </div>

      <PatientList basePath="/dashboard/patients" />
    </div>
  );
}
