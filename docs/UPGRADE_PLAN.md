# MamaMtu Upgrade Plan

## Completed

- Upgraded the app to patched Next.js 16 and React 19 versions.
- Replaced deprecated `src/middleware.ts` with Next.js 16 `src/proxy.ts`.
- Scoped local file uploads under a static `uploads/` root and blocked unsafe upload subdirectories.
- Added idempotent demo education content seeding for the public education page.
- Upgraded Prisma to 7.x using `prisma.config.ts` and the PostgreSQL driver adapter.
- Added database-backed audit logs for sensitive patient and medical-record access.
- Added schema foundations for pregnancy episodes, antenatal visits, newborn records, and immunizations.
- Added optional Upstash Redis-backed rate limiting.
- Added optional Vercel Blob-backed upload storage.
- Configured production Upstash Redis and Vercel Blob environment variables in Vercel.
- Added repeatable staff user seeding for admin, provider, and receptionist accounts.
- Added dashboard screens for pregnancy episodes, ANC visits, newborn records, immunizations, education management, and admin audit logs.
- Added PWA/web app icons for browser tabs and mobile install surfaces.
- Confirmed TypeScript, production build, and Jest pass locally.
- Updated GitHub Actions to build ephemeral CI databases from the current Prisma schema instead of replaying legacy SQLite-era migrations.
- Added realistic demo clinical seeding for patients, appointments, records, pregnancies, ANC visits, newborns, immunizations, notifications, reports, audit logs, and long education articles.
- Added create/edit surfaces for pregnancy episodes, ANC visits, newborn records, and immunizations.
- Added patient timeline, admin staff user management, Vercel Blob upload UI, Vercel Analytics/Speed Insights, and production health checks.

## Prisma 7 Status

Prisma 7 is implemented. The schema URL moved into `prisma.config.ts`, and runtime clients use `@prisma/adapter-pg`.

Use the Supabase session pooler for migration commands. The transaction pooler can produce prepared-statement conflicts with Prisma.

CI uses `prisma db push` against a temporary Postgres service because the earliest committed migrations contain SQLite-era SQL. A future cleanup should squash a fresh PostgreSQL baseline migration before relying on `migrate deploy` for brand-new databases.

## Auth Plan

The project currently uses NextAuth v4. `npm audit` still reports a moderate advisory through `uuid`, which is pulled by NextAuth v4.

Decision:

Keep NextAuth v4 short term because the app already has working credential auth, RBAC, and Prisma adapter wiring. Move auth migration into a separate project because Auth.js/managed auth changes login/session behavior and should be tested as a product flow, not bundled into database upgrades.

When that project starts, preserve the existing role model: `ADMIN`, `HEALTHCARE_PROVIDER`, `PATIENT`, and `RECEPTIONIST`.

## Production Services

These Vercel-side services are now expected in production:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `BLOB_READ_WRITE_TOKEN`

When those values are present, the app uses shared Redis-backed rate limiting and Vercel Blob upload storage. Without them, local development still works with in-memory rate limiting and local upload storage.

After changing these values in Vercel, redeploy the app so server functions receive the new environment.

## Dependency Status

Safe semver dependency updates have been applied with `npm update`.

Major upgrades intentionally left for separate work:

- Tailwind CSS 4.x migration.
- TypeScript 6.x compatibility pass.
- ESLint 10.x compatibility pass.
- Resend 6.x email SDK migration.
- lucide-react 1.x icon audit.
- Auth migration from NextAuth v4 to Auth.js or managed auth.
- Squash legacy SQLite-era migrations into a clean PostgreSQL baseline migration.

Current decision:

- Keep NextAuth v4 until a dedicated auth migration can preserve credentials login, role claims, session callbacks, and staff account creation.
- Do not force Tailwind 4, TypeScript 6, ESLint 10, Resend 6, or lucide-react 1.x in this feature pass. Each is a separate compatibility project with UI/build risk.
- See `docs/MAJOR_UPGRADE_ROADMAP.md` for the dedicated migration plan.

## Next Improvements

- Add richer validation and delete/archive actions for clinical forms.
- Add role-aware edit controls inside patient timelines.
- Add preview/download management for uploaded attachments.
- Plan Auth.js or managed-auth migration as a dedicated project, since audit still flags `uuid` through NextAuth v4.
- Add tests around clinical delete/archive endpoints and attachment previews.
