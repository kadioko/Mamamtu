# End-to-End Testing

Last updated: 2026-05-07

The project uses Playwright for browser-level smoke coverage.

## Commands

Install browser binaries once per machine:

```bash
npm run e2e:install
```

Run the E2E suite:

```bash
npm run e2e
```

Run against an existing deployment or preview URL:

```bash
E2E_BASE_URL="https://your-preview-url.vercel.app" npm run e2e
```

For protected Vercel previews, configure the automation environment with `VERCEL_PROTECTION_BYPASS`. The Playwright config sends it as the `x-vercel-protection-bypass` header automatically when present.

## Current Coverage

- Public education list and education detail page.
- Education browser rendering after the automatic search/filter upgrade.
- Admin credential login.
- `/api/health`.
- Dashboard patient and appointment creation entry points.
- Reports and notifications pages.
- Clinical Exports and admin Export History on reports.
- Authenticated patient CSV export.
- Anonymous clinical export rejection.
- Education management and upload-adjacent dashboard surfaces.
- Clinical form entry points for pregnancy episodes, ANC visits, newborn records, and immunizations.

## Test Accounts

Defaults:

- `E2E_ADMIN_EMAIL=admin@mama-tu.health`
- `E2E_ADMIN_PASSWORD=Demo2025!`

These match the seeded staff accounts. Override them for shared environments.

## Next E2E Improvements

1. Add isolated test-database setup and teardown.
2. Submit a real patient creation flow and assert the created patient page.
3. Submit a real appointment creation flow.
4. Upload a small test attachment and verify preview/download links.
5. Submit one clinical form per workflow with generated data.
6. Add protected-preview GitHub Actions smoke checks once deployment URL discovery is wired in.
7. Add automatic education search, category filter, sort, and featured-resource checks.
