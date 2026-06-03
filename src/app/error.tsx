'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">{t('errors.somethingWentWrong')}</CardTitle>
          <CardDescription>
            {t('errors.unexpectedError')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <div className="rounded-md bg-muted p-4 overflow-auto max-h-48">
              <p className="text-sm font-mono text-destructive">{error.message}</p>
              {error.digest && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {t('errors.errorId')} {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex-1" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('errors.tryAgain')}
            </Button>
            <Button
              onClick={() => { window.location.href = '/'; }}
              className="flex-1"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              {t('errors.goHome')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
