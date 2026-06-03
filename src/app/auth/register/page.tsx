'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { useTranslation } from '@/lib/i18n';

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('auth.register.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.register.subtitle')}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <RegisterForm />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {t('auth.hasAccount')}{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:underline"
            >
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
