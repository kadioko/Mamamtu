# PostgreSQL Baseline Migration

Last updated: 2026-04-26

A clean PostgreSQL baseline SQL file has been generated at:

```text
prisma/baseline/postgresql-baseline.sql
```

This file is intentionally not inside `prisma/migrations/` yet. Keeping it outside active migrations prevents CI or production deploys from replaying it while legacy migrations still exist.

## Why This Exists

The oldest migrations were created during the SQLite era and include SQL such as `DATETIME`, which fails on PostgreSQL. CI currently uses `prisma db push` for temporary databases to avoid replaying those old migrations.

The baseline gives us a clean PostgreSQL-only schema snapshot generated from the current `prisma/schema.prisma`.

## Drift Check

The current configured database was checked against `prisma/schema.prisma` with Prisma Migrate diff, and no schema difference was detected.

```bash
npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
```

## Generated With

```bash
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script --output prisma/baseline/postgresql-baseline.sql
```

## Activation Plan

1. Back up the Supabase production database.
2. Restore that backup into a rehearsal database.
3. Confirm the rehearsal database matches the current Prisma schema.
4. Archive the old SQLite-era migration folders.
5. Move the baseline SQL into a new first migration folder.
6. Use Prisma Migrate resolve on production only after confirming schema drift is clean.
7. Update CI from `prisma db push` back to `prisma migrate deploy` once the baseline is active.

Do not activate the baseline directly against production without a backup and restore rehearsal.
