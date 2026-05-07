# MamaMtu Upgrade Plan

Last updated: 2026-05-07

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
- Completed Tailwind CSS 4, TypeScript 6, ESLint 10, Resend 6, and lucide-react 1.x upgrade lanes.
- Added `VERCEL_PROTECTION_BYPASS` as the protected preview testing secret name and verified the preview can return HTTP 200 with the bypass header.
- Secured `/api/export` behind verified admin/provider access and audit logging.
- Added Clinical Exports controls to the reports dashboard.
- Added admin Export History to the reports dashboard.
- Rebuilt the public education page with automatic search, working category/type/difficulty filters, sorting, featured resources, and stronger empty/error states.
- Added `docs/EDUCATION_SYSTEM.md`.
- Confirmed local verification with lint, typecheck, Jest, Playwright, production build, and production audit.

## Prisma 7 Status

Prisma 7 is implemented. The schema URL moved into `prisma.config.ts`, and runtime clients use `@prisma/adapter-pg`.

Use the Supabase session pooler for migration commands. The transaction pooler can produce prepared-statement conflicts with Prisma.

CI uses `prisma db push` against a temporary Postgres service because the earliest committed migrations contain SQLite-era SQL. A future cleanup should squash a fresh PostgreSQL baseline migration before relying on `migrate deploy` for brand-new databases.

## Auth Plan

The project currently uses NextAuth v4. Production audit is currently clean because the repo uses a temporary `uuid` override, but the override is not the long-term auth strategy.

Decision:

Keep NextAuth v4 short term because the app already has working credential auth, RBAC, and Prisma adapter wiring. Move Better Auth migration into a separate project because it changes login/session behavior and should be tested as a product flow, not bundled into dependency or database upgrades.

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

Major upgrades completed:

- Tailwind CSS 4.x migration.
- TypeScript 6.x compatibility pass.
- ESLint 10.x compatibility pass.
- Resend 6.x email SDK migration.
- lucide-react 1.x icon audit.

Current decision:

- Keep NextAuth v4 until a dedicated auth migration can preserve credentials login, role claims, session callbacks, and staff account creation.
- Keep the generated PostgreSQL baseline inactive until Supabase backup/restore rehearsal is complete.
- See `docs/MAJOR_UPGRADE_ROADMAP.md` for the dedicated migration plan.

## Next Improvements

- Add automated protected-preview smoke tests using `VERCEL_PROTECTION_BYPASS`.
- Clean the ESLint warning backlog reported by `npm run lint:all`.
- Add deeper end-to-end tests for patient creation, appointment creation, uploads, and submitted clinical forms.
- Add focused education E2E coverage for automatic search, category filters, sorting, featured resources, and publish/unpublish flows.
- Plan Better Auth migration as a dedicated project.
- Activate the PostgreSQL baseline only after Supabase backup and restore rehearsal.

Completed in the current refinement pass:

- Clinical create/edit endpoints now enforce cross-field validation for dates, APGAR scores, gravida/para, and due dates.
- Admin-only delete endpoints exist for pregnancy episodes, ANC visits, newborn records, and immunizations.
- Pregnancy episodes can be archived from the edit screen.
- Patient timelines show role-aware edit links for clinical events.
- Uploaded medical-record attachments render preview/download controls.
- Clinical delete/archive and attachment preview tests were added.
