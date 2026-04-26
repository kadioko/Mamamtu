# Major Upgrade Roadmap

This document tracks the larger dependency and platform migrations that should be handled as dedicated projects.

Last updated: 2026-04-26

## Current Status

Completed:

- `lucide-react` upgraded to `1.11.0`.
- `resend` upgraded to `6.12.2`.
- Tailwind CSS upgraded to `4.2.4`.
- TypeScript upgraded to `6.0.3`.
- ESLint upgraded to `10.2.1`.
- `lint` and `typecheck` scripts added.
- Production audit is clean with temporary transitive overrides for `postcss`, `svix`, and `uuid`.
- A clean PostgreSQL baseline SQL artifact was generated at `prisma/baseline/postgresql-baseline.sql`.
- CI database setup note corrected to use `prisma db push`.
- Vercel preview protection remains enabled, with `VERCEL_PROTECTION_BYPASS` available for automation checks.
- `npm outdated --long` currently reports no outdated packages.

Remaining gated decisions:

- Better Auth migration, now mainly to remove the temporary NextAuth v4 compatibility bridge and own auth lifecycle on a supported path.
- Replacing legacy migrations with the PostgreSQL baseline after a production backup and restore rehearsal.
- Adding protected-preview smoke tests that exercise deployed routes with the bypass header.

## Auth Migration

Current decision: keep NextAuth v4 short term with a temporary `uuid` override, and plan Better Auth as a dedicated migration project.

Reason:

- Auth.js/NextAuth is now part of Better Auth, and Better Auth is the forward-looking migration path.
- The app relies on credential login, Prisma adapter tables, JWT session callbacks, role claims, email verification state, and staff account creation.
- Better Auth or managed auth would change session, user lifecycle, and database ownership, so this should not be mixed into dependency upgrades.

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
4. Choose one target:
   - Better Auth for self-hosted auth with stronger long-term library direction.
   - Clerk/Auth0/Descope for managed identity and lower app-maintenance burden.
   - Auth.js v5 only if preserving the current NextAuth mental model is the priority.
5. Run a preview deploy and verify cookie/session behavior on the production domain.

Sources checked:

- Better Auth migration guide: `https://better-auth.com/docs/guides/next-auth-migration-guide`
- NextAuth/Auth.js project page: `https://next-auth.js.org/`

## Tailwind CSS 4

Current decision: complete.

Outcome:

- Upgraded `tailwindcss` to `4.2.4`.
- Added `@tailwindcss/postcss`.
- Updated `postcss.config.mjs` to use the new v4 PostCSS plugin.
- Updated `src/app/globals.css` to use `@import "tailwindcss"` with the existing config bridged through `@config`.
- `npm run build` passes.

Follow-up visual checks:

1. Verify dashboard, forms, modals, education pages, and dark mode in browser preview.
2. Later convert the remaining JavaScript Tailwind config into CSS-first `@theme` tokens if desired.

Source checked:

- Tailwind CSS v4 upgrade guide: `https://tailwindcss.com/docs/upgrade-guide`

## TypeScript 6

Current decision: complete.

Outcome:

1. Upgraded TypeScript to `6.0.3`.
2. Removed deprecated `baseUrl` from `tsconfig.json`.
3. Added `npm run typecheck`.
4. `npm run typecheck` passes.
5. `npm run build` passes.

Source checked:

- TypeScript 6 announcement: `https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/`

## ESLint 10

Current decision: complete with a compatibility note.

Outcome:

- Upgraded ESLint to `10.2.1`.
- Added `npm run lint`.
- Replaced the old `FlatCompat` config with a native flat config that uses `@next/eslint-plugin-next` and `typescript-eslint`.
- Re-enabled React and React Hooks rules through `@eslint/compat`.
- `npm run lint` passes.

Compatibility note:

- `eslint-plugin-react@7.37.5` still needs `@eslint/compat` under ESLint 10.
- Existing `any`, unused-variable, and React Hooks compiler-style issues are warnings, not CI-blocking errors. They should be cleaned up incrementally.

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

Current decision: baseline artifact generated, activation deferred until database backup rehearsal.

Reason:

- The oldest migrations contain SQLite-era SQL such as `DATETIME`.
- CI uses `prisma db push` for temporary databases to avoid replaying those legacy migrations.
- A clean PostgreSQL baseline was generated from the current Prisma schema at `prisma/baseline/postgresql-baseline.sql`.

Activation steps:

1. Back up Supabase production.
2. Restore the backup into a rehearsal database.
3. Confirm the rehearsal schema matches `prisma/schema.prisma`.
4. Move the baseline SQL into a new first migration only after old migrations are archived.
5. Mark the production database baseline as resolved with Prisma Migrate after confirming no schema drift.

## Preview Automation

Current decision: keep Vercel Deployment Protection enabled and use `VERCEL_PROTECTION_BYPASS` for automation.

Recommended next steps:

1. Add a GitHub Actions smoke-test job that runs after preview deployment URLs are available.
2. Pass the bypass token as the `x-vercel-protection-bypass` header.
3. Verify `/education`, `/auth/signin`, `/api/health`, and selected dashboard routes.
4. Keep manual preview testing signed in through Vercel.
