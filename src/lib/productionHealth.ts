import { prisma } from '@/lib/prisma';

export type HealthSeverity = 'ready' | 'warning' | 'error';

export interface ProductionHealthCheck {
  name: string;
  status: HealthSeverity;
  detail: string;
}

export interface ProductionHealthReport {
  status: 'ok' | 'degraded' | 'error';
  generatedAt: string;
  checks: ProductionHealthCheck[];
}

function isConfigured(value: string | undefined) {
  return Boolean(value && value.trim() && !value.includes('replace-with'));
}

export function analyzeDatabaseUrl(databaseUrl = process.env.DATABASE_URL) {
  if (!databaseUrl) {
    return {
      status: 'error' as const,
      detail: 'DATABASE_URL is missing.',
    };
  }

  try {
    const url = new URL(databaseUrl);
    const isSupabasePooler = url.hostname.includes('pooler.supabase.com');
    const isSupabaseDirect = url.hostname.includes('supabase.co');
    const isTransactionPooler = isSupabasePooler && url.port === '6543';
    const isSessionPooler = isSupabasePooler && url.port === '5432';
    const hasSslMode = url.searchParams.get('sslmode') === 'require';

    if (isTransactionPooler) {
      return {
        status: 'ready' as const,
        detail: `Supabase transaction pooler configured on port ${url.port}${hasSslMode ? ' with sslmode=require' : ''}.`,
      };
    }

    if (isSessionPooler) {
      return {
        status: 'warning' as const,
        detail: 'Supabase session pooler is configured. Use the transaction pooler on port 6543 to avoid MaxClientsInSessionMode errors.',
      };
    }

    if (isSupabaseDirect) {
      return {
        status: 'warning' as const,
        detail: 'Direct Supabase database URL detected. Prefer the transaction pooler on port 6543 for app runtimes.',
      };
    }

    return {
      status: 'ready' as const,
      detail: `Database host ${url.hostname}${url.port ? `:${url.port}` : ''} configured.`,
    };
  } catch {
    return {
      status: 'error' as const,
      detail: 'DATABASE_URL is not a valid PostgreSQL URL.',
    };
  }
}

export function getEnvironmentReadinessChecks(): ProductionHealthCheck[] {
  const databaseUrlCheck = analyzeDatabaseUrl();
  const hasUpstashRedis = Boolean(
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) ||
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
  );

  return [
    {
      name: 'Database URL',
      status: databaseUrlCheck.status,
      detail: databaseUrlCheck.detail,
    },
    {
      name: 'NextAuth secret',
      status: isConfigured(process.env.NEXTAUTH_SECRET) ? 'ready' : 'error',
      detail: isConfigured(process.env.NEXTAUTH_SECRET)
        ? 'NEXTAUTH_SECRET is configured.'
        : 'NEXTAUTH_SECRET is missing or still set to a placeholder.',
    },
    {
      name: 'NextAuth URL',
      status: isConfigured(process.env.NEXTAUTH_URL) ? 'ready' : 'warning',
      detail: process.env.NEXTAUTH_URL || 'NEXTAUTH_URL is missing.',
    },
    {
      name: 'Public app URL',
      status: isConfigured(process.env.NEXT_PUBLIC_APP_URL) ? 'ready' : 'warning',
      detail: process.env.NEXT_PUBLIC_APP_URL || 'NEXT_PUBLIC_APP_URL is missing.',
    },
    {
      name: 'Redis rate limiting',
      status: hasUpstashRedis ? 'ready' : 'warning',
      detail: hasUpstashRedis
        ? 'Upstash Redis REST env vars are configured.'
        : 'Upstash Redis REST env vars are missing, so production rate limiting falls back to per-instance memory.',
    },
    {
      name: 'Blob uploads',
      status: process.env.BLOB_READ_WRITE_TOKEN ? 'ready' : 'warning',
      detail: process.env.BLOB_READ_WRITE_TOKEN
        ? 'Vercel Blob token is configured.'
        : 'BLOB_READ_WRITE_TOKEN is missing, so uploads use local fallback behavior.',
    },
    {
      name: 'Email delivery',
      status: process.env.RESEND_API_KEY ? 'ready' : 'warning',
      detail: process.env.RESEND_API_KEY
        ? 'Resend API key is configured.'
        : 'RESEND_API_KEY is missing, so email delivery uses the console fallback.',
    },
  ];
}

function summarizeStatus(checks: ProductionHealthCheck[]): ProductionHealthReport['status'] {
  if (checks.some((check) => check.status === 'error')) return 'error';
  if (checks.some((check) => check.status === 'warning')) return 'degraded';
  return 'ok';
}

export async function getProductionHealthReport(): Promise<ProductionHealthReport> {
  const checks = [...getEnvironmentReadinessChecks()];

  try {
    const start = performance.now();
    const patientCount = await prisma.patient.count();
    const elapsedMs = Math.round(performance.now() - start);

    checks.unshift({
      name: 'Database connectivity',
      status: elapsedMs > 2000 ? 'warning' : 'ready',
      detail: `${patientCount} patient records reachable in ${elapsedMs}ms.`,
    });
  } catch (error) {
    checks.unshift({
      name: 'Database connectivity',
      status: 'error',
      detail: error instanceof Error ? error.message : 'Database query failed.',
    });
  }

  return {
    status: summarizeStatus(checks),
    generatedAt: new Date().toISOString(),
    checks,
  };
}
