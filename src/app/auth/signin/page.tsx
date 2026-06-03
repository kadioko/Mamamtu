'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SignInForm } from '@/components/auth/signin-form';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/lib/i18n';
import { Suspense, useEffect } from 'react';

export default function SignInPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="container flex h-screen w-screen items-center justify-center">{t('auth.loading')}</div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Handle verification success message
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast({
        title: t('auth.emailVerified'),
        description: t('auth.emailVerifiedDesc'),
      });
    }
  }, [searchParams, toast, t]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">{t('auth.signin.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.signin.subtitle')}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <SignInForm />
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              {t('auth.noAccount')}{' '}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                {t('auth.signUp')}
              </Link>
            </p>
            <p className="text-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
