'use client';

import { useSession } from 'next-auth/react';
import { PatientList } from '@/components/patients/PatientList';
import type { UserRole } from '@/types/roles';

export default function PatientsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: UserRole } | undefined)?.role;
  const readOnly = userRole === 'RECEPTIONIST';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">
            {readOnly ? 'View patient records' : 'Manage patient records'}
          </p>
        </div>
      </div>

      <PatientList basePath="/dashboard/patients" readOnly={readOnly} />
    </div>
  );
}
