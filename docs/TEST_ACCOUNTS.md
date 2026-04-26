# Test Accounts

Last updated: 2026-04-26

Use these accounts after running the seed scripts or the protected `/api/seed` endpoint.

## Staff Login Accounts

Default password for all seeded staff accounts:

```text
Demo2025!
```

| Role | Name | Email | Password |
| --- | --- | --- | --- |
| Administrator | Dr. Amina Hassan | `admin@mama-tu.health` | `Demo2025!` |
| Healthcare Provider | Dr. Omar Al-Sayed | `provider@mama-tu.health` | `Demo2025!` |
| Receptionist | Sarah Johnson | `reception@mama-tu.health` | `Demo2025!` |

## Seed Commands

Create or refresh the staff accounts:

```bash
npm run seed:staff
```

Create staff accounts, education content, patients, appointments, pregnancies, ANC visits, newborn records, immunizations, reports, notifications, and audit-friendly demo activity:

```bash
npm run prisma:seed
```

## Environment Overrides

The staff seed script supports these optional overrides:

```env
SEED_STAFF_PASSWORD="change-this-demo-password"
SEED_ADMIN_EMAIL="admin@mama-tu.health"
SEED_PROVIDER_EMAIL="provider@mama-tu.health"
SEED_RECEPTION_EMAIL="reception@mama-tu.health"
```

If these values are not set, the app uses the default accounts listed above.

## Demo Patient Records

The clinical demo seed creates patient records, appointments, medical records, pregnancy episodes, ANC visits, newborn records, immunizations, notifications, and reports. These patients are healthcare records, not login accounts.

Useful demo patient IDs include:

| Patient ID | Scenario |
| --- | --- |
| `DEMO-0001` | High-risk active pregnancy |
| `DEMO-0002` | Teen first pregnancy with anemia support |
| `DEMO-0003` | Postpartum and newborn follow-up |
| `DEMO-0004` | Gestational diabetes monitoring |
| `DEMO-0005` | Missed ANC outreach |
| `DEMO-0006` | Newborn immunization tracking |

## Security Notes

- These accounts are for local development, demos, and preview testing only.
- Change `SEED_STAFF_PASSWORD` before seeding any shared or public environment.
- Do not reuse the demo password for production staff accounts.
- Review seeded users before promoting any preview database to a real production workflow.
