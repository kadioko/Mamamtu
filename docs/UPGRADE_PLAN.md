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
- Added repeatable staff user seeding for admin, provider, and receptionist accounts.
- Confirmed TypeScript, production build, and Jest pass locally.

## Prisma 7 Status

Prisma 7 is implemented. The schema URL moved into `prisma.config.ts`, and runtime clients use `@prisma/adapter-pg`.

Use the Supabase session pooler for migration commands. The transaction pooler can produce prepared-statement conflicts with Prisma.

## Auth Plan

The project currently uses NextAuth v4. `npm audit` still reports a moderate advisory through `uuid`, which is pulled by NextAuth v4.

Decision:

Keep NextAuth v4 short term because the app already has working credential auth, RBAC, and Prisma adapter wiring. Move auth migration into a separate project because Auth.js/managed auth changes login/session behavior and should be tested as a product flow, not bundled into database upgrades.

When that project starts, preserve the existing role model: `ADMIN`, `HEALTHCARE_PROVIDER`, `PATIENT`, and `RECEPTIONIST`.

## Next Improvements

- Add dashboard screens for pregnancy episodes, ANC visits, newborn records, and immunizations.
- Add an audit-log viewer for admins.
- Configure Upstash Redis in Vercel to activate shared production rate limiting.
- Configure Vercel Blob in Vercel to activate object-storage uploads.
- Add content management controls for publishing education resources from the dashboard.
