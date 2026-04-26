# Vercel Deployment Setup Guide

This app is a Next.js 16 application backed by PostgreSQL, Prisma 7, NextAuth, Upstash Redis, and Vercel Blob.

## Required Vercel Environment Variables

Set these in Vercel Project Settings > Environment Variables for Production, Preview, and Development unless noted.

| Key | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Use the Supabase session pooler for Prisma migrations and app runtime. |
| `NEXTAUTH_SECRET` | Secret used by NextAuth session/JWT signing. |
| `NEXTAUTH_URL` | Production URL, for example `https://mamamtu.vercel.app`. |
| `NEXT_PUBLIC_APP_URL` | Public app URL, for example `https://mamamtu.vercel.app`. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint for shared rate limiting. |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for production uploads. |

Optional:

| Key | Purpose |
| --- | --- |
| `SEED_DATABASE_TOKEN` | Protects `/api/seed` in deployed environments. |
| `RESEND_API_KEY` | Enables real email delivery. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Enables Google OAuth login. |

## Supabase Connection String

Use an encoded password in `DATABASE_URL`. For example, `!` becomes `%21`.

Recommended production format:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<encoded-password>@aws-1-eu-west-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

Use the session pooler on port `5432`. Avoid the transaction pooler for Prisma migrations because prepared statements can conflict.

## Upstash Redis

Redis is used for shared production rate limiting.

1. In Vercel, add the Upstash Redis integration or create a Redis database from Storage/Marketplace.
2. Connect it to this project.
3. Confirm Vercel created:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Redeploy the app.

If these values are missing, the app falls back to local in-memory rate limiting, which is fine for development but not enough for production.

## Vercel Blob

Blob is used for production object-storage uploads.

1. In Vercel, create a Blob store for the project.
2. Confirm Vercel created:
   - `BLOB_READ_WRITE_TOKEN`
3. Redeploy the app.

If this value is missing, local development stores uploads under the local `uploads/` folder.

## Database Migration And Seeding

Run migrations before or during deployment:

```bash
npm run prisma:migrate:deploy
```

Seed staff users and education content:

```bash
npm run prisma:seed
```

The seed command also creates realistic demo clinical data so a fresh environment has patients, appointments, medical records, pregnancy episodes, ANC visits, newborn records, immunizations, notifications, reports data, and long education articles.

Seeded staff accounts:

| Role | Email |
| --- | --- |
| Admin | `admin@mama-tu.health` |
| Provider | `provider@mama-tu.health` |
| Receptionist | `reception@mama-tu.health` |

Default seeded password: `Demo2025!`

## CI Notes

GitHub Actions runs Node 20 with a PostgreSQL service, pushes the current Prisma schema into the temporary CI database, then runs lint/test/build.

The workflow uses `prisma db push --skip-generate` instead of replaying the historical migration files because the oldest migrations were created before the project was fully moved to PostgreSQL and contain SQLite-era SQL such as `DATETIME`. For production database changes, keep using reviewed Prisma migrations.

## Post-Deployment Checks

After redeploying, verify:

- `/education` loads seeded resources.
- `/dashboard/education` can publish/unpublish resources.
- `/dashboard/patients/new` creates a patient.
- `/dashboard/appointments/new` creates an appointment.
- `/dashboard/audit` loads for admin users.
- `/icon`, `/apple-icon`, and `/manifest.json` return app install metadata.
