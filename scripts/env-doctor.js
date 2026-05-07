require('dotenv').config({ path: '.env.local', quiet: true });
require('dotenv').config({ quiet: true });

function isConfigured(value) {
  return Boolean(value && value.trim() && !value.includes('replace-with'));
}

function checkDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return ['error', 'DATABASE_URL is missing.'];
  }

  try {
    const url = new URL(databaseUrl);
    const isSupabasePooler = url.hostname.includes('pooler.supabase.com');
    const isSupabaseDirect = url.hostname.includes('supabase.co');

    if (isSupabasePooler && url.port === '6543') {
      return ['ready', 'DATABASE_URL uses the Supabase transaction pooler on port 6543.'];
    }

    if (isSupabasePooler && url.port === '5432') {
      return ['warning', 'DATABASE_URL uses the Supabase session pooler on port 5432. Prefer transaction pooler port 6543.'];
    }

    if (isSupabaseDirect) {
      return ['warning', 'DATABASE_URL appears to be a direct Supabase database URL. Prefer transaction pooler port 6543.'];
    }

    return ['ready', `DATABASE_URL points to ${url.hostname}${url.port ? `:${url.port}` : ''}.`];
  } catch {
    return ['error', 'DATABASE_URL is not a valid URL.'];
  }
}

const checks = [
  ['Database URL', ...checkDatabaseUrl()],
  ['NextAuth secret', isConfigured(process.env.NEXTAUTH_SECRET) ? 'ready' : 'error', isConfigured(process.env.NEXTAUTH_SECRET) ? 'NEXTAUTH_SECRET is configured.' : 'NEXTAUTH_SECRET is missing or placeholder.'],
  ['NextAuth URL', isConfigured(process.env.NEXTAUTH_URL) ? 'ready' : 'warning', process.env.NEXTAUTH_URL || 'NEXTAUTH_URL is missing.'],
  ['Public app URL', isConfigured(process.env.NEXT_PUBLIC_APP_URL) ? 'ready' : 'warning', process.env.NEXT_PUBLIC_APP_URL || 'NEXT_PUBLIC_APP_URL is missing.'],
  [
    'Redis rate limiting',
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) || (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ? 'ready' : 'warning',
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? 'Upstash Redis REST URL is configured.' : 'Upstash Redis env vars are missing.',
  ],
  ['Blob uploads', process.env.BLOB_READ_WRITE_TOKEN ? 'ready' : 'warning', process.env.BLOB_READ_WRITE_TOKEN ? 'Vercel Blob token is configured.' : 'BLOB_READ_WRITE_TOKEN is missing.'],
  ['Email delivery', process.env.RESEND_API_KEY ? 'ready' : 'warning', process.env.RESEND_API_KEY ? 'Resend API key is configured.' : 'RESEND_API_KEY is missing; console fallback active.'],
];

console.table(checks.map(([name, status, detail]) => ({ name, status, detail })));

if (checks.some(([, status]) => status === 'error')) {
  process.exitCode = 1;
}
