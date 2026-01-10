'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';

export default function VerificationNotice() {
  return (
    <Suspense fallback={<div className="container flex h-screen items-center justify-center">Loading…</div>}>
      <VerificationNoticeContent />
    </Suspense>
  );
}

function VerificationNoticeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleResendVerification = async () => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to resend');
      
      toast({ title: 'Email Sent', description: 'Check your email for the verification link.' });
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to resend',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Icons.logo className="mx-auto mb-4 h-12 w-12" />
          <h1 className="text-2xl font-semibold">Verify Your Email</h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ve sent a verification link to <span className="font-medium">{email}</span>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No email received?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleResendVerification}
              disabled={isLoading || !email}
              className="w-full"
            >
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Resend Verification Email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
