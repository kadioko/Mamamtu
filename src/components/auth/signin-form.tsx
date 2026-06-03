'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { useTranslation } from '@/lib/i18n';

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
  const { t } = useTranslation();

  const signInSchema = z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  });

  type SignInValues = z.infer<typeof signInSchema>;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (values: SignInValues) => {
    setIsLoading(true);

    try {
      const userCheck = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email }),
      });

      const userData = await userCheck.json();

      if (userCheck.status === 404) {
        throw new Error(t('auth.errors.noAccount'));
      }

      if (userData && !userData.emailVerified) {
        throw new Error('email-not-verified');
      }

      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          throw new Error(t('auth.errors.invalidCredentials'));
        }
        throw new Error(result.error);
      }

      if (result?.url) {
        router.push(callbackUrl as Route);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'email-not-verified') {
          const emailValue = getValues('email');
          toast({
            title: t('auth.emailNotVerified'),
            description: (
              <div>
                <p>{t('auth.emailNotVerifiedDesc')}</p>
                <p className="mt-2">
                  <button
                    className="font-medium text-primary hover:underline"
                    onClick={async () => {
                      try {
                        const res = await fetch('/api/auth/resend-verification', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: emailValue }),
                        });
                        if (res.ok) {
                          toast({
                            title: t('auth.verificationSent'),
                            description: t('auth.verificationSentDesc'),
                          });
                        } else {
                          throw new Error(t('auth.resendFailed'));
                        }
                      } catch {
                        toast({
                          title: t('common.error'),
                          description: t('auth.resendFailedDesc'),
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    {t('auth.resendVerification')}
                  </button>
                </p>
              </div>
            ),
            variant: 'default',
          });
        } else {
          toast({
            title: t('common.error'),
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: t('common.error'),
          description: t('auth.signInError'),
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast({
        title: t('common.error'),
        description: t('auth.errors.oauthError').replace('{provider}', provider),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-1">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <Input
              id="email"
              placeholder={t('auth.emailPlaceholder')}
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <a
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                {t('auth.forgotPassword')}
              </a>
            </div>
            <Input
              id="password"
              placeholder={t('auth.passwordPlaceholder')}
              type="password"
              autoComplete="current-password"
              disabled={isLoading}
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            {t('auth.signin.button')}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t('auth.orContinueWith')}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleOAuthSignIn('google')}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.google className="mr-2 h-4 w-4" />
          )}
          {t('auth.google')}
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={() => handleOAuthSignIn('github')}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.github className="mr-2 h-4 w-4" />
          )}
          {t('auth.github')}
        </Button>
      </div>
    </div>
  );
}
