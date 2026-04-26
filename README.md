# MamaMtu - Maternal and Newborn Health Support

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)

MamaMtu is a maternal and newborn health management app for clinics, care teams, and demo/training environments. It combines patient records, appointments, clinical maternal/newborn workflows, education resources, audit logs, notifications, and production deployment tooling.

## Current Status

The major platform upgrade is complete:

- Next.js 16, React 19, Tailwind CSS 4, TypeScript 6, ESLint 10, Prisma 7.
- PostgreSQL runtime with Prisma driver adapter support.
- Dashboard screens for patients, appointments, pregnancies, ANC visits, newborns, immunizations, reports, notifications, education management, audit logs, users, and production health.
- Vercel Blob upload support, Upstash Redis rate limiting, Vercel Analytics, and Speed Insights.
- Protected Vercel preview testing with `VERCEL_PROTECTION_BYPASS`.
- Production audit is currently clean with temporary overrides documented in `docs/AUTH_MIGRATION_DECISION.md`.

See [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) for the active roadmap.

## Features

- Patient management with demographic and clinical records.
- Appointment scheduling and status updates.
- Pregnancy episodes, ANC visits, newborn records, and immunization tracking.
- Medical records with upload preview/download support.
- Public education portal plus dashboard publishing controls.
- Reports, notifications, admin audit logs, and staff user management.
- Role-based access for admin, healthcare provider, patient, and receptionist roles.
- PWA icons and install metadata.
- Demo seeding for realistic training scenarios.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Runtime UI | React 19 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL with Prisma 7 |
| Auth | NextAuth v4, with Better Auth migration planned |
| Storage | Vercel Blob with local upload fallback |
| Rate limiting | Upstash Redis with in-memory local fallback |
| Email | Resend |
| Testing | Jest and Testing Library |
| Deployment | Vercel |

## Getting Started

Prerequisites:

- Node.js 20+
- npm
- PostgreSQL or a Supabase/Postgres connection string

Install dependencies:

```bash
npm install
```

Create local environment values:

```bash
cp .env.example .env.local
```

Set at least:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

Generate Prisma client, prepare the database, and seed demo data:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test Accounts

After seeding:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@mama-tu.health` | `Demo2025!` |
| Provider | `provider@mama-tu.health` | `Demo2025!` |
| Receptionist | `reception@mama-tu.health` | `Demo2025!` |

More details are in [docs/TEST_ACCOUNTS.md](docs/TEST_ACCOUNTS.md).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Generate Prisma client and build Next.js |
| `npm run start` | Start production server |
| `npm run lint` | Run CI-blocking ESLint checks |
| `npm run lint:all` | Show the full warning backlog |
| `npm run typecheck` | Run TypeScript without emit |
| `npm test` | Run Jest |
| `npm run test:coverage` | Run Jest coverage |
| `npm run prisma:migrate` | Run local Prisma migrations |
| `npm run prisma:migrate:deploy` | Apply production Prisma migrations |
| `npm run prisma:seed` | Seed staff, education, and demo clinical data |

## Documentation

- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) - current health, next work, and upgrade ideas.
- [VERCEL_SETUP.md](VERCEL_SETUP.md) - deployment variables and production setup.
- [docs/PREVIEW_DEPLOYMENT_TESTING.md](docs/PREVIEW_DEPLOYMENT_TESTING.md) - protected preview testing.
- [docs/MAJOR_UPGRADE_ROADMAP.md](docs/MAJOR_UPGRADE_ROADMAP.md) - completed major dependency upgrades and remaining gated work.
- [docs/AUTH_MIGRATION_DECISION.md](docs/AUTH_MIGRATION_DECISION.md) - Better Auth migration decision.
- [docs/POSTGRES_BASELINE.md](docs/POSTGRES_BASELINE.md) - clean PostgreSQL baseline plan.
- [docs/LINT_WARNING_BACKLOG.md](docs/LINT_WARNING_BACKLOG.md) - warning cleanup plan.

## Deployment

Deploy on Vercel with PostgreSQL, Upstash Redis, and Vercel Blob configured. Use Supabase session pooling on port `5432` for Prisma. Keep preview protection enabled and use the automation bypass token for protected preview checks.

## License

MIT. See [LICENSE](LICENSE).
