# Production Readiness

Last updated: 2026-05-07

Use this checklist before preview promotion or production deploys.

## Quick Checks

Run the local environment doctor:

```bash
npm run env:doctor
```

Open the admin dashboard health screen:

```text
/dashboard/production
```

Check the public health endpoint:

```text
/api/health
```

## Required Production Settings

| Setting | Expected |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler URL on port `6543` |
| `DATABASE_POOL_MAX` | `1` for Supabase pooler stability |
| `NEXTAUTH_SECRET` | Strong non-placeholder secret |
| `NEXTAUTH_URL` | Production site URL |
| `NEXT_PUBLIC_APP_URL` | Production site URL |

## Recommended Production Settings

| Setting | Purpose |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Shared production rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Shared production rate limiting |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob uploads |
| `RESEND_API_KEY` | Real email delivery |

## Supabase Pooler Note

Use the transaction pooler URL:

```text
aws-1-eu-west-1.pooler.supabase.com:6543
```

Avoid the session pooler on port `5432` for app runtimes. It can produce `MaxClientsInSessionMode` errors when several dashboard tabs or server components hit the database at once.

## Clinical Data Export Controls

The `/api/export` endpoint is intentionally protected behind verified admin or healthcare-provider accounts. Exports are sent with `Cache-Control: no-store` and each successful export writes an audit event with the export type, file format, filters, and row count.
