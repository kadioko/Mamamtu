# Auth Migration Decision

Last updated: 2026-04-26

Current decision: keep NextAuth v4 in production for this upgrade branch, but choose Better Auth as the dedicated migration target.

## Why This Is Separate

Authentication affects sign-in, session cookies, staff roles, patient access, password reset, email verification, Google OAuth, route protection, and audit safety. It should not be bundled with styling, linting, or TypeScript upgrades.

The current app depends on:

- Credential login through `src/lib/auth.ts`.
- Prisma-backed users and adapter tables.
- JWT session callbacks with `session.user.role`, `session.user.id`, `emailVerified`, and `isActive`.
- Staff account creation from the dashboard and seed scripts.
- Protected dashboard/API routes.

## Recommended Target

Use Better Auth as the next self-hosted auth target because Auth.js/NextAuth is now part of Better Auth and the official migration path points there.

Use managed auth such as Clerk/Auth0/Descope only if the product decision is to move identity lifecycle outside this database.

## Audit Driver

`npm audit --omit=dev` previously reported `uuid` through `next-auth@4.24.14`. This branch uses a temporary npm override to force `uuid@14.0.0`, and the audit is currently clean.

The override is a bridge, not the long-term answer. Better Auth remains the preferred migration because it removes the dependency on NextAuth v4 and gives the app a supported auth path.

## Migration Checklist

1. Create a dedicated auth branch.
2. Add tests for admin, provider, receptionist, and patient sign-in behavior.
3. Add tests for inactive-account rejection, role propagation, password reset, and protected API authorization.
4. Map current `User`, `Account`, `Session`, and verification fields to the target auth schema.
5. Port credential and Google OAuth flows.
6. Verify session cookies on local, preview, and production domains.
7. Remove the temporary `uuid` override after NextAuth v4 is removed.
8. Run an audit before and after migration to confirm the auth dependency path is clean without overrides.

## Sources

- Better Auth NextAuth migration guide: `https://better-auth.com/docs/guides/next-auth-migration-guide`
- NextAuth/Auth.js project page: `https://next-auth.js.org/`
