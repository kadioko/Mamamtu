/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // unsafe-eval needed for Next.js dev HMR; Sentry CDN allowed for error reporting
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://browser.sentry-cdn.com",
      "script-src-elem 'self' 'unsafe-inline' https://vercel.live https://browser.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "connect-src 'self' wss: ws: https://vercel.live https://*.sentry.io",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  outputFileTracingIncludes: {
    '/api/admin/demo/reset': [
      './scripts/seed-deck-demo-metrics.js',
      './node_modules/@prisma/adapter-pg/**/*',
      './node_modules/@prisma/driver-adapter-utils/**/*',
      './node_modules/pg/**/*',
      './node_modules/pg-*/**/*',
      './node_modules/postgres-array/**/*',
      './node_modules/postgres-bytea/**/*',
      './node_modules/postgres-date/**/*',
      './node_modules/postgres-interval/**/*',
      './node_modules/pgpass/**/*',
      './node_modules/split2/**/*',
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry organisation + project (set these in CI/Vercel env vars)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for source-map uploads (set in CI, never committed)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps only in CI to avoid slow local builds
  silent: true,
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger in production
  disableLogger: true,

  // Tunnel requests through your own domain to bypass ad-blockers
  tunnelRoute: '/monitoring',

  // Automatically instrument Next.js 13+ App Router
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
});
