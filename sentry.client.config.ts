import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10 % of traces in production; 100 % in dev/preview
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Replay 1 % of sessions normally, 100 % of sessions with an error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media by default (HIPAA-friendly)
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Don't send events when DSN is not configured (local dev without DSN)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  environment: process.env.NODE_ENV,
});
