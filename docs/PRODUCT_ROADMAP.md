# MamaMtu Product Roadmap

**Last updated:** 2026-05-28
**Market:** Tanzania-first, East Africa expansion later
**Mission:** Give every clinic the tools to track every pregnancy, flag every risk, and reach every mother — without paper.

---

## Where We Are Now

The platform is **built and deployed**. Core clinical workflows are live on Vercel. We are in active pilot outreach (Week 3) targeting 14 clinics in Dar es Salaam.

**What works today:**

- Patient registration and profile management
- Pregnancy episodes, ANC visits, newborn records, immunizations
- Appointment scheduling and management
- Vitals recording (BP, temperature, weight, gestational age, etc.)
- File attachments on medical records (lab results, USS scans, documents)
- Role-based access: Admin, Healthcare Provider, Receptionist
- Clinical exports (CSV/Excel) with audit logging
- Education resource library with public search
- Email notifications via Resend
- Audit log for all sensitive actions
- Staff user management
- Production deployment: Vercel + Supabase + Redis + Blob storage

---

## Roadmap Phases

### Phase 0 — Pilot Readiness (Now → End of June 2026)

**Goal:** Sign first pilot clinic. Get real staff using it with real patients.

#### Infrastructure (must be done before first real patient data)

| Item | Status | Priority |
| --- | --- | --- |
| Production env vars verified in Vercel (`RESEND_API_KEY`, `UPSTASH_REDIS_*`, `VERCEL_BLOB_*`) | ⬜ Verify | Critical |
| Database backup strategy — daily Supabase backups automated, restore tested | ⬜ | Critical |
| PostgreSQL baseline activation — replace SQLite-era migrations with clean baseline | ⬜ | Critical |
| Custom domain (`mamamtu.co.tz` or `.africa`) registered and configured | ⬜ | High |
| Sentry error monitoring wired to production | ⬜ | High |
| Supabase keepalive active — `/api/ping` cron every 3 days ✅ | ✅ Done | Done |
| UptimeRobot 5-min monitor on `/api/ping` | ⬜ Set up manually | Medium |

#### Product (must work before pilots go live)

| Item | Status | Priority |
| --- | --- | --- |
| Swahili interface toggle — full UI localization in Kiswahili | ⬜ | Critical |
| Patient consent form collection and storage in system | ⬜ | Critical |
| High-risk pregnancy flag UI — clear visual in dashboard and patient timeline | ⬜ | High |
| Referral tracking — record reason, destination facility, date, follow-up status | ⬜ | High |
| Clinic onboarding flow — first-time setup wizard for new clinic admins | ⬜ | High |
| Staff account self-service password reset | ⬜ | High |
| Remove all Kenya-specific copy; use Tanzania regions and districts throughout | ⬜ | High |

---

### Phase 1 — First Live Pilots (July – September 2026)

**Goal:** 2–3 clinics actively using the platform with real patients. Collect feedback. Start building evidence for funders.

#### Platform

| Item | Status | Priority |
| --- | --- | --- |
| Better Auth migration (replace NextAuth v4, remove `uuid` override) | ⬜ | High |
| Protected-preview Playwright CI — E2E auto-run on every Vercel preview | ⬜ | High |
| Deeper E2E test coverage — real patient creation, ANC/newborn records, attachments | ⬜ | High |
| ESLint warning cleanup — 181 warnings, starting with `any` types | ⬜ | Medium |
| Offline/PWA hardening — service worker caching for low-connectivity Tanzania use | ⬜ | High |

#### Clinical Features

| Item | Status | Priority |
| --- | --- | --- |
| SMS appointment reminders via Africa's Talking | ⬜ | High |
| Ministry of Health report format (MTUHA-compatible printable export) | ⬜ | High |
| UTI and infection flagging — symptom entry triggers provider alert | ⬜ | Medium |
| Pre-eclampsia / high-BP alert threshold logic in ANC visit form | ⬜ | High |
| Missed appointment follow-up — auto-flag overdue ANC visits | ⬜ | High |
| Basic patient summary printout (one-page clinic card) | ⬜ | Medium |

#### Growth & Compliance

| Item | Status | Priority |
| --- | --- | --- |
| Tanzania Personal Data Protection Act 2022 — consent, retention, breach response finalized | ⬜ | Critical |
| Pilot feedback survey (Google Form or Typeform) sent to all pilot clinic staff at 30 days | ⬜ | High |
| First impact metrics report for funders (patients registered, ANC visits recorded, high-risk flags, exports generated) | ⬜ | High |
| COSTECH/NFAST innovation fund application submitted | ⬜ | High |
| Grand Challenges Canada concept note submitted | ⬜ | Medium |

---

### Phase 2 — Pilot to Product (October 2026 – March 2027)

**Goal:** 5–10 paying clinics. First revenue. First grant received. Expand beyond Dar es Salaam.

#### Platform

| Item | Status | Priority |
| --- | --- | --- |
| Multi-clinic architecture — one admin view across locations | ⬜ | High |
| Role: Midwife — distinct permissions from Doctor/Provider | ⬜ | Medium |
| Production observability dashboard — Redis rate-limit counters, Blob storage, email delivery visible to admin | ⬜ | Medium |
| Automated nightly DB backup + restore rehearsal pipeline | ⬜ | High |

#### Clinical Features

| Item | Status | Priority |
| --- | --- | --- |
| Symptom-based clinical advisory — provider alert when entered symptoms match flagged conditions (UTI, pre-eclampsia, anaemia, malaria in pregnancy) | ⬜ | High |
| Telemedicine session booking — link or embed video consult | ⬜ | Medium |
| Patient-facing lightweight view — SMS-confirmed appointment, basic health record summary | ⬜ | Medium |
| Immunization schedule auto-generation for newborns (Tanzania EPI schedule) | ⬜ | High |
| Postnatal visit tracking — 6-week check, 6-month check | ⬜ | High |
| Drug/medication stock alert for clinic (basic stock tracking) | ⬜ | Low |

#### Revenue & Business

| Item | Status | Priority |
| --- | --- | --- |
| Billing system — freemium → Pro tier upgrade flow in-app | ⬜ | High |
| Pro tier: TZS 100,000–150,000/month/clinic or ~$40/month | ⬜ | High |
| Flutterwave or M-Pesa payment integration for Tanzania billing | ⬜ | High |
| First MoH partnership meeting or sandbox approval initiated | ⬜ | High |
| East Africa expansion research — Kenya, Uganda, Rwanda regulatory landscape | ⬜ | Medium |

---

### Phase 3 — Scale (2027 and beyond)

**Goal:** 50+ clinics across Tanzania. First East Africa expansion. Sustainable revenue covers ops.

| Theme | Items |
| --- | --- |
| **AI / Clinical Intelligence** | Risk prediction model for maternal outcomes; anomaly detection in vitals trends; automated MoH reporting |
| **Community Health Workers** | CHW mobile app (low-data, offline-first) for village-level ANC tracking and referral |
| **Interoperability** | HL7 FHIR export; OpenMRS integration; DHIS2 data push for national reporting |
| **East Africa Expansion** | Kenya (`mamamtu.co.ke`), Uganda, Rwanda deployments; local compliance per country |
| **Research Partnerships** | Anonymized aggregate data for public health researchers; IRB-approved data sharing agreements |
| **Telemedicine** | Full integrated consult workflow with billing |

---

## Feature Status Legend

| Symbol | Meaning |
| --- | --- |
| ✅ Done | Shipped and working in production |
| ⬜ | Not started |
| 🔄 | In progress |
| ❌ | Blocked / decision needed |

---

## What MamaMtu Is (and Is Not)

**Is:** A clinical record management, workflow, scheduling, reminders, and reporting tool for maternal and newborn health at the facility level.

**Is not:** A diagnostic system, a symptom checker, or a replacement for clinical judgment. All clinical decisions remain with the healthcare provider.

This boundary is stated in the Pilot Terms, the Doctor Welcome Package, and all funder materials. Future "symptom flag" features will alert the *provider*, never advise the *patient* directly.

---

## Related Documents

- `docs/PROJECT_STATUS.md` — current platform health and completed work
- `docs/GOING_LIVE_STRATEGY.md` — revenue models, funding pipeline, compliance checklist
- `docs/MAJOR_UPGRADE_ROADMAP.md` — technical dependency upgrades (Tailwind 4, ESLint 10, Better Auth)
- `docs/TANZANIA_PILOT_CLINICS.md` — outreach tracker and clinic status
- `docs/PRODUCTION_READINESS.md` — infrastructure checklist for going fully live
- `docs/MamaMtu_Pilot_Terms.md` — pilot agreement template
