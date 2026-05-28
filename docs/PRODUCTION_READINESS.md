# Production Readiness

Last updated: 2026-05-28

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

## Supabase Keepalive (Free Tier)

Supabase free-tier projects **auto-pause after 7 days of inactivity**. When paused, the database rejects all connections and users cannot log in.

Two keepalive mechanisms are active:

### 1. Vercel Cron Job (server-side)

`vercel.json` schedules a cron that hits `/api/ping` every 3 days at 08:00 UTC:

```json
"crons": [{ "path": "/api/ping", "schedule": "0 8 */3 * *" }]
```

`/api/ping` runs `SELECT 1` against the database and returns `200 { ok: true }` when healthy, `503` when unreachable. Vercel crons require the **Pro or Hobby plan** — if the project is on the free Vercel plan, use UptimeRobot below instead.

### 2. UptimeRobot Monitor (external, recommended)

Set up a free UptimeRobot monitor at <https://uptimerobot.com>:

1. Sign up free at <https://uptimerobot.com>
2. **Add New Monitor** → type: **HTTP(s)**
3. **Friendly Name:** MamaMtu DB Keepalive
4. **URL:** `https://mamamtu.vercel.app/api/ping`
5. **Monitoring Interval:** every 5 minutes
6. Save — UptimeRobot pings every 5 minutes, which keeps Supabase active indefinitely

UptimeRobot also sends an email alert if the ping fails (database down or app error), giving early warning of any outage.

### Re-seeding after an accidental pause

If the project pauses anyway and users cannot log in, restore test accounts by calling:

```bash
curl -X POST https://mamamtu.vercel.app/api/seed \
  -H "x-seed-token: <SEED_DATABASE_TOKEN from .env>" \
  -H "Content-Type: application/json"
```

This upserts all 4 test accounts with `emailVerified` and `isActive: true`.

---

## Supabase Pooler Note

Use the transaction pooler URL:

```text
aws-1-eu-west-1.pooler.supabase.com:6543
```

Avoid the session pooler on port `5432` for app runtimes. It can produce `MaxClientsInSessionMode` errors when several dashboard tabs or server components hit the database at once.

## Clinical Data Export Controls

The `/api/export` endpoint is intentionally protected behind verified admin or healthcare-provider accounts. Exports are sent with `Cache-Control: no-store` and each successful export writes an audit event with the export type, file format, filters, and row count.

Admins can review recent export activity from the reports dashboard Export History panel or the full audit log at `/dashboard/audit`. See `docs/CLINICAL_EXPORTS.md` for the current export workflow and verification coverage.

## Education Readiness

The public `/education` page depends on the content and category APIs. Before production promotion, confirm seeded or managed content exists, `/api/content` returns published resources, and `/api/content/categories` returns category counts. See `docs/EDUCATION_SYSTEM.md` for the current public browser, automatic search, filters, and content-management workflow.
