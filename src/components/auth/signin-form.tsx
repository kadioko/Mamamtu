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

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

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
        throw new Error('No account found with this email address');
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
          throw new Error('Invalid email or password');
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
            title: 'Email Not Verified',
            description: (
              <div>
                <p>Please verify your email address before signing in.</p>
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
                            title: 'Verification Email Sent',
                            description: 'Please check your email for the verification link.',
                          });
                        } else {
                          throw new Error('Failed to resend verification email');
                        }
                      } catch {
                        toast({
                          title: 'Error',
                          description: 'Failed to resend verification email. Please try again later.',
                          variant: 'destructive',
                        });
                      }
                    }}
                  >
                    Resend verification email
                  </button>
                </p>
              </div>
            ),
            variant: 'default',
          });
        } else {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'An error occurred during sign in',
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
        title: 'Error',
        description: `Failed to sign in with ${provider}. Please try again.`,
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
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
              <Label htmlFor="password">Password</Label>
              <a
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              placeholder="••••••••"
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
            Sign In
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
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
          Google
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
          GitHub
        </Button>
      </div>
    </div>
  );
}
