# Major Upgrade Roadmap

This document tracks the larger dependency and platform migrations that should be handled as dedicated projects.

Last updated: 2026-05-28 (canonical source for all upgrade history; `UPGRADE_PLAN.md` and `AUTH_MIGRATION_DECISION.md` removed — content preserved here)

## Current Status

Completed:

- **Full dependency update pass — 2026-05-28.** 31 packages updated to latest semver-compatible versions. Key moves:
  - next 16.2.4 → 16.2.6, react/react-dom 19.2.5 → 19.2.6
  - tailwindcss/@tailwindcss/postcss 4.2.4 → 4.3.0
  - eslint 10.2.1 → 10.4.0, typescript-eslint 8.59.0 → 8.60.0, @eslint/compat 2.0.5 → 2.1.0
  - @playwright/test 1.59.1 → 1.60.0, jest 30.3.0 → 30.4.2, ts-jest 29.4.9 → 29.4.11
  - lucide-react 1.11.0 → 1.17.0, framer-motion 12.38.0 → 12.40.0, zod 4.3.6 → 4.4.3
  - react-hook-form 7.74.0 → 7.76.1, date-fns 4.1.0 → 4.3.0, @upstash/redis 1.37.0 → 1.38.0
  - @vercel/blob 2.3.3 → 2.4.0, pg 8.20.0 → 8.21.0, msw 2.13.6 → 2.14.6, postcss → 8.5.15, resend → 6.12.4
  - Post-update: lint ✓, typecheck ✓, 177/177 tests ✓, build ✓, 0 audit vulnerabilities ✓. Net: 4 added, 14 removed, 195 changed.
- `lucide-react` at `1.17.0` (latest after update pass).
- `resend` at `6.12.4` (latest).
- Tailwind CSS at `4.3.0` (latest).
- TypeScript upgraded to `6.0.3`.
- ESLint at `10.4.0` (latest).
- `lint` and `typecheck` scripts added.
- Production audit is clean with temporary transitive overrides for `postcss`, `svix`, and `uuid`.
- A clean PostgreSQL baseline SQL artifact was generated at `prisma/baseline/postgresql-baseline.sql`.
- CI database setup note corrected to use `prisma db push`.
- Vercel preview protection remains enabled, with `VERCEL_PROTECTION_BYPASS` available for automation checks.
- `npm outdated` currently reports 0 outdated packages.
- Tanzania-first launch planning has been added in `docs/GOING_LIVE_STRATEGY.md`, including compliance, pilot, revenue, and funding workstreams.

Remaining gated decisions:

- Better Auth migration, now mainly to remove the temporary NextAuth v4 compatibility bridge and own auth lifecycle on a supported path.
- Replacing legacy migrations with the PostgreSQL baseline after a production backup and restore rehearsal.
- Adding protected-preview smoke tests that exercise deployed routes with the bypass header.
- Tanzania go-live hardening: compliance notes, pilot-safe production configuration, localized reporting language, and funding/demo collateral.

## Tanzania Go-Live Hardening

Current decision: add Tanzania launch readiness as a product/platform workstream before scaling beyond pilots.

Reason:

- The launch market is Tanzania first, not Kenya.
- Health workflows touch sensitive maternal/newborn data and require a clear privacy, consent, audit, retention, and clinical-safety posture before real patient usage.
- Tanzania-specific partners and funders such as COSTECH, Tanzania Startup Association, UNFPA Tanzania, UNICEF-style innovation calls, and Grand Challenges Canada-style digital health calls expect local relevance, evidence, and compliance readiness.

Recommended project steps:

1. Localize product language and reporting labels:
   - replace Kenya-specific copy where it appears in product, docs, seed data, demo flows, and pitch collateral;
   - use Tanzania regions/districts rather than counties;
   - ensure currency examples support TZS pricing.
2. Create Tanzania pilot compliance documents:
   - privacy notice;
   - patient consent language;
   - data retention policy;
   - breach response plan;
   - clinical safety statement clarifying that MamaMtu supports workflow, records, reminders, and reporting, not diagnosis.
3. Add production readiness checks for Tanzania pilots:
   - production Supabase backup and restore test;
   - audit log verification for patient exports and record reads;
   - role-based access checks for admin, provider, receptionist, and patient;
   - demo/seed data separation from real production data.
4. Prepare funder and partner collateral:
   - one-page concept note for COSTECH/UNFPA/UNICEF-style conversations;
   - 10-slide Tanzania pitch deck;
   - clinic pilot letter of intent template;
   - impact measurement plan for pregnancies tracked, ANC follow-up, high-risk flags, referrals, and facility usage.
5. Add pilot-safe E2E coverage:
   - sign in as Tanzania pilot staff;
   - create a test patient with Tanzania-style phone/address data;
   - create pregnancy/ANC/newborn records;
   - verify exports and audit logging;
   - verify no demo credentials are displayed in production.

External sources checked:

- UNFPA Tanzania maternal health page: `https://tanzania.unfpa.org/en/topics/maternal-health-9`
- Grand Challenges Canada digital health portfolio: `https://www.grandchallenges.ca/digital-health/`
- COSTECH innovation page: `https://crweb.costech.or.tz/costech/innovation`
- Tanzania Startup Association: `https://tsa.co.tz/`

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

- Upgraded `tailwindcss` to `4.3.0` (latest as of 2026-05-28).
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

- Upgraded ESLint to `10.4.0` (latest as of 2026-05-28).
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

- Upgraded `resend` to `6.12.4` (latest as of 2026-05-28).
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
