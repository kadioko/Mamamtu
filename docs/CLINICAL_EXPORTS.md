# Clinical Exports

Last updated: 2026-05-28

Clinical exports are available from `/dashboard/reports` for verified admin and healthcare-provider accounts.

## What Can Be Exported

- Patients
- Appointments
- Medical records

Supported formats:

- CSV
- PDF

Appointments and medical-record exports support an optional date range from the dashboard export panel.

## Security Controls

- The `/api/export` endpoint requires an authenticated, email-verified `ADMIN` or `HEALTHCARE_PROVIDER` account.
- Anonymous users receive `401 Unauthorized`.
- Users without the required role receive `403 Forbidden`.
- Export responses use `Cache-Control: no-store`.
- Each successful export writes an audit event with dataset type, format, filters, and row count.

## Admin Review

Admins can review recent export activity directly on `/dashboard/reports` in the Export History section.

The full audit trail remains available at:

```text
/dashboard/audit
```

## Verification

The Playwright dashboard suite checks:

- The reports page renders Clinical Exports.
- The reports page renders Export History for admins.
- A signed-in admin can export patient CSV data.
- Anonymous requests to `/api/export` are rejected.
