# Project Status

Last updated: 2026-04-26

## Health Summary

MamaMtu is in a strong post-upgrade state. The major platform migrations are complete, the dependency tree is current, CI uses a PostgreSQL service, and protected Vercel preview testing now has a bypass-token path for automation.

Latest local checks:

- `npm outdated --long`: no outdated packages listed.
- `npm run lint:all -- --format stylish`: 0 errors, 307 warnings.
- Previous major-roadmap verification passed lint, typecheck, tests, build, and production audit.

## Completed Platform Work

- Next.js 16 and React 19.
- Tailwind CSS 4.
- TypeScript 6.
- ESLint 10 with React and React Hooks rules enabled through compatibility helpers.
- Prisma 7 with PostgreSQL driver adapter.
- Resend 6.
- lucide-react 1.x.
- Upstash Redis-backed production rate limiting.
- Vercel Blob-backed production upload storage.
- Vercel Analytics and Speed Insights.
- PWA/browser app icons.
- Protected preview testing with `VERCEL_PROTECTION_BYPASS`.
- Clean production audit with temporary transitive overrides.

## Completed Product Work

- Dashboard screens for patients, appointments, pregnancies, ANC visits, newborns, immunizations, reports, notifications, education resources, audit logs, user management, and production health.
- Create/edit forms for pregnancy, ANC, newborn, and immunization workflows.
- Delete/archive controls for clinical records where appropriate.
- Patient timeline with role-aware clinical edit links.
- Upload preview/download management for attachments.
- Education resource publishing controls.
- Demo seed data for patients, appointments, records, pregnancies, ANC visits, newborns, immunizations, reports, notifications, audit logs, and long-form education content.

## Best Next Upgrades

1. Add automated protected-preview smoke tests.
   Use the `VERCEL_PROTECTION_BYPASS` GitHub secret to verify key deployed pages after preview deployment.

2. Clean the ESLint warning backlog.
   Start with unused imports and variables, then shared library `any` usage, then dashboard page data types, then React Hooks compiler warnings.

3. Do the Better Auth migration as its own branch.
   Current NextAuth v4 works, but the `uuid` override is a bridge. Better Auth is the chosen long-term self-hosted auth path.

4. Rehearse the PostgreSQL baseline activation.
   Back up Supabase, restore into a rehearsal DB, verify drift, then replace legacy SQLite-era migrations with the generated PostgreSQL baseline.

5. Add end-to-end tests for real user journeys.
   Cover login, education reading, patient creation, appointment creation, uploads, reports, notifications, and clinical form flows.

6. Add production observability review.
   Confirm Web Analytics, Speed Insights, logs, health dashboard, upload storage, Redis rate limiting, and email delivery all behave in a preview/prod environment.

## Recommended Work Order

1. Preview smoke test workflow.
2. Lint warning cleanup pass.
3. End-to-end journey tests.
4. Auth migration.
5. PostgreSQL baseline activation.
6. Product polish and clinical reporting improvements.

## Watch Items

- Keep the Vercel protection bypass token secret. Rotate it if it has been shared outside a trusted channel.
- Do not activate the PostgreSQL baseline directly in production without backup and restore rehearsal.
- Do not remove the `uuid` override until NextAuth v4 is removed or the auth dependency path is otherwise clean.
- Keep demo passwords out of shared public environments.
