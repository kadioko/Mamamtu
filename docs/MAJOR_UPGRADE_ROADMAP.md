# Major Upgrade Roadmap

This document tracks the larger dependency and platform migrations that should be handled as dedicated projects.

## Current Status

Completed in the first roadmap pass:

- `lucide-react` upgraded to `1.11.0`.
- `resend` upgraded to `6.12.2`.
- Production build passes with Next.js 16.2.4 and Prisma 7.8.0.
- Jest passes with 22 suites and 177 tests.
- CI database setup note corrected to use `prisma db push`.

Remaining major lanes:

- Tailwind CSS 4.x migration.
- TypeScript 6.x compatibility pass.
- ESLint 10.x compatibility pass.
- Auth.js or managed-auth migration.
- Clean PostgreSQL baseline migration.

## Auth Migration

Current decision: keep NextAuth v4 short term.

Reason:

- The app relies on credential login, Prisma adapter tables, JWT session callbacks, role claims, email verification state, and staff account creation.
- Auth.js v5 does not require a database schema break for standard NextAuth tables, but it changes the configuration shape and centralizes auth helpers around the root `auth.ts` pattern.
- Managed auth options such as Clerk/Auth0/Descope would move user lifecycle and session behavior outside the current database model, so they need a product-level decision.

Recommended Auth.js project steps:

1. Create a branch dedicated to auth migration.
2. Inventory all auth entry points:
   - `src/lib/auth.ts`
   - `src/auth.ts`
   - `src/proxy.ts`
   - `/api/auth/[...nextauth]`
   - credential sign-in/register/reset flows
   - session usage in dashboard/client components
3. Add migration tests for:
   - admin/provider/receptionist sign-in
   - inactive account rejection
   - role propagation into `session.user.role`
   - protected API route authorization
   - Google OAuth if enabled
4. Port configuration to the Auth.js v5 style and replace server session calls with the new helper consistently.
5. Run a preview deploy and verify cookie/session behavior on the production domain.

Sources checked:

- Auth.js v5 migration guide: `https://authjs.dev/getting-started/migrating-to-v5`
- Better Auth migration note: `https://authjs.dev/getting-started/migrate-to-better-auth`

## Tailwind CSS 4

Current decision: defer.

Reason:

- Tailwind v4 changes configuration toward CSS-first `@theme`.
- The app uses Tailwind 3 config, shadcn-style components, and a broad dashboard UI surface.

Recommended steps:

1. Run `npx @tailwindcss/upgrade` on a branch.
2. Review generated CSS/config changes.
3. Manually verify dashboard, forms, modals, education pages, and dark mode.
4. Keep Tailwind 3 if mobile/browser support below Safari 16.4, Chrome 111, or Firefox 128 is required.

Source checked:

- Tailwind CSS v4 upgrade guide: `https://tailwindcss.com/docs/upgrade-guide`

## TypeScript 6

Current decision: defer until dependency ecosystem is ready.

Recommended steps:

1. Upgrade TypeScript on a branch.
2. Run `next build`, `tsc --noEmit`, and Jest.
3. Check for removed compiler options such as `outFile` and stricter DOM/library types.
4. Track compiler behavior ahead of the TypeScript 7 Go-based compiler transition.

Source checked:

- TypeScript 6 announcement: `https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/`

## ESLint 10

Current decision: defer.

Reason:

- The app uses flat config, Next.js ESLint config, Jest, and TypeScript linting. ESLint major upgrades should wait for `eslint-config-next` compatibility.

Recommended steps:

1. Upgrade ESLint and `eslint-config-next` together.
2. Run `npm run lint --if-present`.
3. Review any rule behavior changes and formatter output.

Source checked:

- ESLint v10 migration guide: `https://eslint.org/docs/latest/use/migrate-to-10.0.0`

## Resend 6

Current decision: complete.

Outcome:

- Upgraded `resend` to `6.12.2`.
- Existing email wrapper in `src/lib/email.ts` remains compatible.
- `npm run build` passed.
- `npm test -- --runInBand --silent` passed.

Follow-up production checks:

1. Send test verification/reset emails from a Vercel preview deployment.
2. Confirm fallback behavior when `RESEND_API_KEY` is missing.
3. Verify the sender domain is still approved in Resend.

## lucide-react 1.x

Current decision: complete.

Outcome:

1. Upgraded `lucide-react` to `1.11.0`.
2. TypeScript build passed with no renamed/removed icon errors.
3. Jest passed.

Follow-up visual checks:

1. Verify sidebar, forms, dashboard action buttons, and empty states in a browser preview.
2. Audit any future icon imports during feature work because lucide 1.x can still expose design-level differences.

## PostgreSQL Baseline Migration

Current decision: defer but important.

Reason:

- The oldest migrations contain SQLite-era SQL such as `DATETIME`.
- CI uses `prisma db push` for temporary databases to avoid replaying those legacy migrations.

Recommended steps:

1. Create a clean database from current `prisma/schema.prisma`.
2. Generate a new PostgreSQL baseline migration from that schema.
3. Mark existing production database state as resolved after confirming Supabase already matches the schema.
4. Replace or archive legacy SQLite-era migrations only after backup and restore rehearsal.
