# MamaMtu Upgrade Plan

## Completed

- Upgraded the app to patched Next.js 16 and React 19 versions.
- Replaced deprecated `src/middleware.ts` with Next.js 16 `src/proxy.ts`.
- Scoped local file uploads under a static `uploads/` root and blocked unsafe upload subdirectories.
- Added idempotent demo education content seeding for the public education page.
- Confirmed TypeScript, production build, and Jest pass locally.

## Prisma 7 Plan

Prisma 7 is a major upgrade, so treat it as its own branch.

1. Read the Prisma 7 migration guide before changing versions.
2. Upgrade `prisma` and `@prisma/client` together.
3. Regenerate the client and run `npx prisma validate`.
4. Run `npx prisma migrate status` against the Supabase session pooler.
5. Run the full test suite and production build.
6. Check deployment logs for connection pooling behavior before promoting.

Use the Supabase session pooler for migration commands. The transaction pooler can produce prepared-statement conflicts with Prisma.

## Auth Plan

The project currently uses NextAuth v4. `npm audit` still reports a moderate advisory through `uuid`, which is pulled by NextAuth v4.

Recommended path:

1. Keep NextAuth v4 short term because the app already has working credential auth, RBAC, and Prisma adapter wiring.
2. Rotate secrets before production because credentials were handled during setup.
3. Plan a separate auth upgrade decision:
   - Move to Auth.js if you want continuity with the current architecture.
   - Move to Clerk/Auth0/Descope if you want managed auth, hosted account security, and less custom auth maintenance.
4. Whichever path is chosen, preserve the existing role model: `ADMIN`, `HEALTHCARE_PROVIDER`, `PATIENT`, and `RECEPTIONIST`.

## Next Improvements

- Add an audit log for patient record reads and edits.
- Add Redis or Upstash-backed rate limiting for production.
- Move uploaded medical files to object storage instead of local disk on Vercel.
- Add richer maternal health models: pregnancy episodes, ANC visits, delivery records, newborn records, immunizations, and high-risk flags.
- Add content management controls for publishing education resources from the dashboard.
