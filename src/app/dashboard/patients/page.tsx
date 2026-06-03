'use client';

import { useSession } from 'next-auth/react';
import { PatientList } from '@/components/patients/PatientList';
import { useTranslation } from '@/lib/i18n';
import type { UserRole } from '@/types/roles';

export default function PatientsPage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const userRole = (session?.user as { role?: UserRole } | undefined)?.role;
  const readOnly = userRole === 'RECEPTIONIST';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('patients.title')}</h1>
          <p className="text-muted-foreground">
            {readOnly ? t('patients.viewOnly') : t('patients.manage')}
          </p>
        </div>
      </div>

      <PatientList basePath="/dashboard/patients" readOnly={readOnly} />
    </div>
  );
}
