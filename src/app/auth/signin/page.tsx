'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SignInForm } from '@/components/auth/signin-form';
import { useToast } from '@/components/ui/use-toast';
import { Suspense, useEffect } from 'react';

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="container flex h-screen w-screen items-center justify-center">Loading…</div>}>
      <SignInContent />
    </Suspense>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Handle verification success message
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast({
        title: 'Email Verified',
        description: 'Your email has been verified. You can now sign in to your account.',
      });
    }
  }, [searchParams, toast]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your MamaMtu account
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <SignInForm />
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
            <p className="text-center text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
