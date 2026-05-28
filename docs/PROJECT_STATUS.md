# Project Status

Last updated: 2026-05-28

## Team Update

**Dr. Jade Wiles Jr., DHA** has joined as Health Science Specialist. He brings cross-sector public health leadership, health policy expertise, coalition-building experience (including faith-based health networks), stakeholder engagement, and academic health sciences teaching. His advisory role directly strengthens the compliance, grant narrative, clinical safety, community engagement, and ethical leadership dimensions of the Tanzania launch. See `docs/MAMAMTU_ORG_CONFIG.md` and `docs/GOING_LIVE_STRATEGY.md` for full bio.

**Pilot Clinic Outreach:** Weeks 1 and 2 are complete. **14 emails sent** (9 private clinics: Aga Khan, Shree Hindu Mandal, Premier Care, Dar IVF, Hans Mgaya Hospital, NuLife, Komakoma Polyclinic, Kairuki Hospital, Columbia Africa IST Clinic; 2 faith-based networks: CSSC + BAKWATA; 3 NGOs: MDH, Amref, Jhpiego). All emails CC'd gmariki@necuva.com. Live tracker: `docs/MamaMtu_Outreach_Tracker.csv`. Week 3 follow-up is the active phase — scheduling demos and in-person visits. See `docs/TANZANIA_PILOT_CLINICS.md`.

**New pilot docs committed:**
- `docs/MamaMtu_Pilot_Terms.md` — signed pilot agreement template with full terms
- `docs/MamaMtu_Pilot_Info_Sheet_EN_SW.md` — bilingual one-page info sheet (English + Swahili)
- `docs/MamaMtu_Outreach_Tracker.csv` — live contact tracking spreadsheet for all 14 outreach targets

---

## Health Summary

MamaMtu is in a strong post-upgrade state. The major platform migrations are complete, the dependency tree is current, CI uses a PostgreSQL service, and protected Vercel preview testing now has a bypass-token path for automation.

Latest local checks:

- `npm outdated --long`: no outdated packages listed.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test -- --runInBand --silent`: 177 passed.
- `npm run e2e -- --project=chromium`: 11 passed.
- `npm run build`: passed.
- `npm audit --omit=dev`: 0 vulnerabilities.

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
- Playwright E2E foundation for login, education, health, dashboard, patients, appointments, uploads, reports, notifications, and clinical form entry points.

## Completed Product Work

- Dashboard screens for patients, appointments, pregnancies, ANC visits, newborns, immunizations, reports, notifications, education resources, audit logs, user management, and production health.
- Create/edit forms for pregnancy, ANC, newborn, and immunization workflows.
- Delete/archive controls for clinical records where appropriate.
- Patient timeline with role-aware clinical edit links.
- Upload preview/download management for attachments.
- Education resource publishing controls.
- Public education browser with automatic search, URL-backed filters, sorting, featured resources, and live result counts.
- Demo seed data for patients, appointments, records, pregnancies, ANC visits, newborns, immunizations, reports, notifications, audit logs, and long-form education content.
- Secured clinical export API with verified admin/provider access, no-store download responses, and audit logging.
- Reports dashboard Clinical Exports panel for patient, appointment, and medical-record downloads.
- Admin Export History on the reports dashboard for recent audited export activity.
- Education system documentation covering public browsing, automatic behavior, content management, and API parameters.

## Best Next Upgrades

1. Wire Playwright E2E into protected-preview smoke tests.
   Use the `VERCEL_PROTECTION_BYPASS` GitHub secret to verify key deployed pages after preview deployment.

2. Continue the ESLint warning cleanup.
   First pass reduced the backlog from 307 to 181 warnings. Next focus should be shared library `any` usage, dashboard page data types, then React Hooks compiler warnings.

3. Do the Better Auth migration as its own branch.
   Current NextAuth v4 works, but the `uuid` override is a bridge. Better Auth is the chosen long-term self-hosted auth path.

4. Rehearse the PostgreSQL baseline activation.
   Back up Supabase, restore into a rehearsal DB, verify drift, then replace legacy SQLite-era migrations with the generated PostgreSQL baseline.

5. Deepen the E2E tests from smoke coverage into create/update workflows.
   Current tests verify entry points, rendering, education reading, health, export security, dashboard export controls, and dashboard education management presence. Next add automatic education filter checks, real patient creation, appointment creation, attachment upload, and clinical record submission in an isolated test database.

6. Add production observability review.
   Confirm Web Analytics, Speed Insights, logs, health dashboard, upload storage, Redis rate limiting, and email delivery all behave in a preview/prod environment.

## Recommended Work Order

1. Protected-preview Playwright workflow.
2. Deeper E2E create/update journey tests.
3. Lint warning cleanup pass.
4. Auth migration.
5. PostgreSQL baseline activation.
6. Product polish and clinical reporting improvements.

## Watch Items

- Keep the Vercel protection bypass token secret. Rotate it if it has been shared outside a trusted channel.
- Do not activate the PostgreSQL baseline directly in production without backup and restore rehearsal.
- Do not remove the `uuid` override until NextAuth v4 is removed or the auth dependency path is otherwise clean.
- Keep demo passwords out of shared public environments.

---

## x10 Think: Full "What's Left" Analysis (2026-05-28)

A comprehensive look across every dimension of MamaMtu — platform, product, compliance, team, outreach, funding, and community.

---

### 1. PLATFORM & INFRASTRUCTURE

| # | What's Left | Priority |
|---|---|---|
| 1.1 | **Protected-preview Playwright CI** — Wire E2E suite into GitHub Actions using `VERCEL_PROTECTION_BYPASS` so every Vercel preview is smoke-tested automatically | Critical |
| 1.2 | **PostgreSQL baseline activation** — Backup Supabase → restore into rehearsal DB → verify zero schema drift → replace SQLite-era migrations with the clean baseline | Critical |
| 1.3 | **Better Auth migration** — Dedicated branch replacing NextAuth v4 and removing the temporary `uuid` override; includes credential flow, Prisma adapter tables, JWT callbacks, role claims, email verification, and staff account lifecycle | High |
| 1.4 | **Error monitoring** — Sentry (free tier) or similar wired to production; capture unhandled exceptions, API 5xx, and client-side React error boundaries | High |
| 1.5 | **Production environment hardening** — Confirm all env vars are set in Vercel production (not just preview): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `VERCEL_BLOB_*` | Critical |
| 1.6 | **Custom domain** — Register `mamamtu.co.tz` (or `.africa`), configure in Vercel, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`, set Resend sender domain | High |
| 1.7 | **Database backup strategy** — Automate daily Supabase backups; document restore procedure; test restore at least once before first real patient data enters | High |
| 1.8 | **Production observability review** — Verify Vercel Analytics, Speed Insights, logs, Redis rate-limiting counters, Blob upload storage, and email delivery work end-to-end in production | Medium |
| 1.9 | **ESLint warning cleanup** — 181 warnings remain; next pass targets shared library `any` types, dashboard page data types, then React Hooks compiler warnings | Medium |
| 1.10 | **Offline/PWA hardening** — Verify service worker caching strategy works reliably for low-connectivity Tanzania environments; test sync-on-reconnect for form submissions | High |

---

### 2. PRODUCT & CLINICAL FEATURES

| # | What's Left | Priority |
|---|---|---|
| 2.1 | **Tanzania language localization** — Swahili interface toggle (already referenced in Doctor Welcome Package but not yet implemented); replace any Kenya-specific copy with Tanzania; use Tanzania regions/districts; support TZS currency display | Critical |
| 2.2 | **SMS appointment reminders** — Africa's Talking integration for real SMS delivery (not just placeholder); patients don't need smartphones; reminder logic already modeled, needs provider wiring | High |
| 2.3 | **High-risk pregnancy flagging UI** — Automatic risk-flag display already referenced in Doctor Welcome Package; needs clinical logic (pre-eclampsia, multiple birth, previous complications) surfaced clearly in dashboard and patient timeline | High |
| 2.4 | **Ministry of Health report generation** — Printable/exportable MoH-format reports (MTUHA or equivalent Tanzania standard); currently exports are CSV/Excel, not Ministry-format | High |
| 2.5 | **Referral tracking** — Ability to record that a patient was referred to a higher-level facility; referral reason, destination, date, follow-up status; key for funder impact metrics | High |
| 2.6 | **Patient-facing portal / SMS-only flow** — Patients can confirm appointments via SMS reply; lightweight patient view (optional); reduces missed appointments | Medium |
| 2.7 | **Deeper E2E test coverage** — Add create/update journey tests: real patient creation, pregnancy + ANC + newborn records, appointment booking, attachment upload, clinical record submission, all in an isolated test DB | High |
| 2.8 | **Demo/seed data separation** — Ensure demo credentials and seed data cannot be activated in production; environment-gated seed scripts; no demo passwords displayed in any production screen | Critical |
| 2.9 | **Multi-clinic / multi-location support** — Foundation for enterprise tier: one organisation account with multiple facility sub-accounts; data isolation between facilities | Medium |
| 2.10 | **Audit log review tooling** — Admin UI for reviewing audit logs in detail (filter by user, action type, date range, patient); currently logs are recorded but review UI is basic | Medium |

---

### 3. COMPLIANCE & LEGAL

| # | What's Left | Priority |
|---|---|---|
| 3.1 | **Data Protection Officer formally assigned** — Currently interim (Godfrey Mariki); formalize with signed DPO responsibility document; register with Tanzania Personal Data Protection Commission if required | Critical |
| 3.2 | **Privacy policy published** — Live URL on `mamamtu.co.tz/privacy`; English + Swahili; Version 1.0 with effective date | Critical |
| 3.3 | **Terms of service published** — Clinic agreement terms; SaaS terms; disclaimer that MamaMtu is not a diagnostic system | High |
| 3.4 | **Patient consent forms printed and distributed** — 20 copies per clinic (English + Swahili); consent version v1.0 dated; witness signature field; FOR CLINIC USE section | Critical |
| 3.5 | **Privacy notice posters distributed** — A4 laminated for each clinic waiting area; English + Swahili; "Your health records are secure" | High |
| 3.6 | **Breach response plan finalized** — Incident commander assigned (with 24/7 contact); Tanzania Data Protection Commissioner contact details filled in; legal counsel identified | High |
| 3.7 | **Data residency documentation** — Written policy explaining EU Frankfurt hosting and why this is acceptable for Tanzania patients; available on request for clinic administrators | High |
| 3.8 | **Clinical safety staff acknowledgment forms** — Each clinical staff member at pilot clinics signs the clinical safety statement; original signed copies retained | High |
| 3.9 | **Ministry of Health alignment check** — Confirm no regulatory sandbox or pre-approval is required before handling real patient records; document outcome | Critical |
| 3.10 | **Data retention automation** — Scheduled job that flags/archives records past their retention window; currently policy exists but no automated enforcement | Medium |

---

### 4. PILOT CLINIC OPERATIONS

| # | What's Left | Priority |
|---|---|---|
| 4.1 | **Week 3: Follow-up on 14 sent emails** — 3–5 day follow-up cadence; WhatsApp for clinics where email reliability is uncertain; tracker: `docs/MamaMtu_Outreach_Tracker.csv` | Active now |
| 4.2 | **Schedule 2-3 clinic demo meetings** — Convert responses into in-person or Zoom demo sessions; bring tablet with live demo | Active now |
| 4.3 | **Visit 1-2 clinics in person** — If no email response after follow-up; bring printed pilot info sheet + consent form samples | Active now |
| 4.4 | **Sign first pilot agreement** — `docs/MamaMtu_Pilot_Terms.md` ready; first clinic signs within Week 4 | Active now |
| 4.5 | **Staff training session** — 2-hour session (in-person or Zoom) per clinic; use Quick Start Guide; designate MamaMtu Champions | Upcoming |
| 4.6 | **Provision tablets if needed** — 1-2 tablets per clinic if requested; configure offline sync and local browser bookmarks | Upcoming |
| 4.7 | **Tracking spreadsheet maintained** — Live outreach status table: clinic name, type, location, contact, date contacted, response, meeting date, status | Active now |
| 4.8 | **Refine pitch based on feedback** — Capture objections and questions from Week 2 responses; update script and FAQ | Active now |
| 4.9 | **Dr. Jade Wiles Jr. advisory input on clinic engagement** — Leverage his coalition-building and stakeholder engagement expertise for faith-based clinics (CSSC, BAKWATA) and NGO partners | Active now |
| 4.10 | **Impact measurement baseline** — Before clinics go live: record current missed appointment rate, paper record time per patient, and staff hours on admin; then measure change at 30/60/90 days | Upcoming |

---

### 5. FUNDING & GRANTS

| # | What's Left | Priority |
|---|---|---|
| 5.1 | **COSTECH application** — Submit to COSTECH / NFAST; maternal/newborn digital health concept note; include pilot data once available | High |
| 5.2 | **Grand Challenges Canada concept note** — Draft digital health concept note aligned with their maternal/newborn and data governance portfolio | High |
| 5.3 | **UNFPA Tanzania partnership conversation** — One-page concept note; pitch as a pilot partner for maternal health data and workflow strengthening; Dr. Wiles can support framing | High |
| 5.4 | **Tanzania Startup Association membership** — Join TSA for investor introductions, policy updates, ecosystem visibility, and startup week participation | Medium |
| 5.5 | **10-slide Tanzania pitch deck** — Complete deck including problem, solution, market, traction (pilot data), business model, team (now including Dr. Wiles), ask, and impact metrics | High |
| 5.6 | **2-minute demo video** — Screen recording of core workflow: patient registration → ANC visit → risk flag → appointment reminder → report export | High |
| 5.7 | **Clinic letters of intent** — Collect signed LOIs from pilot clinics; required for most grant applications | High |
| 5.8 | **Impact measurement plan** — Formal document: pregnancies tracked, ANC follow-up rate, high-risk flags, referrals made, facility usage hours; used for grant reporting | High |
| 5.9 | **Angel investor short list** — Identify 10 East Africa-focused angels or micro-VCs (Ventures Platform, Microtraction, Launch Africa, Founders Factory Africa, Health54, Catalyst Fund) | Medium |
| 5.10 | **Business bank account and accountant** — Open business account for revenue; engage accountant familiar with SaaS and Tanzania company structure | Medium |

---

### 6. MARKETING & COMMUNITY

| # | What's Left | Priority |
|---|---|---|
| 6.1 | **Landing page published** — Basic marketing page on custom domain: tagline, core features, pricing, pilot call-to-action, contact form | High |
| 6.2 | **Pricing page live** — Free / Pro / Enterprise tiers; TZS pricing prominently displayed; "Start free pilot" CTA | High |
| 6.3 | **WhatsApp Business number configured** — Dedicated WhatsApp Business account for support; auto-reply with response time expectations | High |
| 6.4 | **LinkedIn presence** — Company page for MamaMtu; CEO/founder profile updated; posts on maternal health in Tanzania | Medium |
| 6.5 | **First case study** — After first clinic goes live: document their journey, numbers (patients registered, appointments kept, staff time saved); publish as blog post and PDF | Upcoming |
| 6.6 | **Medical Association of Tanzania engagement** — Introduce MamaMtu through Medical Association of Tanzania and APHFTA (Association of Private Health Facilities in Tanzania) | Medium |
| 6.7 | **Tanzania Midwives Association outreach** — Midwives are primary MamaMtu users; their endorsement builds clinical credibility | Medium |
| 6.8 | **Swahili content marketing** — Blog posts and social content in Swahili on maternal health best practices, clinic management tips; builds SEO and trust | Medium |
| 6.9 | **Referral program** — Clinics get 1 month free for each referral that converts; simple referral tracking mechanism | Upcoming |
| 6.10 | **Dr. Wiles as thought leadership voice** — Author posts / recorded talks on community health transformation, ethical healthcare leadership, and health equity in East Africa; positions MamaMtu as a credible, expert-backed platform | Medium |

---

### 7. PRODUCT EXPANSION (NEXT 6-12 MONTHS)

| # | What's Left | Priority |
|---|---|---|
| 7.1 | **Freemium gating** — Enforce 100-patient limit on free tier; upgrade prompt; billing integration (Stripe or M-Pesa) | High |
| 7.2 | **M-Pesa / mobile money billing** — Tanzania clinics pay via mobile money; integrate M-Pesa payment for Pro subscriptions | High |
| 7.3 | **USSD interface** — Ultra-low-bandwidth fallback for clinics with feature phones; register patient via USSD code | Medium |
| 7.4 | **Expanded analytics dashboard** — Month-over-month trends, ANC completion rates, high-risk outcome tracking, geographic heat maps, cohort retention by facility | Medium |
| 7.5 | **AI-assisted risk scoring** — Pattern-based flagging of high-risk pregnancies using historical ANC data; advisory only, not diagnostic | Future |
| 7.6 | **Interoperability** — HL7 FHIR export for integration with national DHIS2 or OpenMRS instances used by NGO partners | Future |
| 7.7 | **Multi-language support expansion** — After Swahili: Luganda (Uganda), Kinyarwanda (Rwanda), Amharic (Ethiopia) for East Africa expansion | Future |
| 7.8 | **Telemedicine referral workflow** — Integrate video consultation booking for high-risk cases referred to specialists | Future |
| 7.9 | **Community health worker (CHW) mobile module** — Lightweight PWA for CHWs to record home visits, community outreach, and referrals offline | Future |
| 7.10 | **Postnatal + child health tracking** — Extend beyond delivery: track child growth, immunization schedules through age 5; unlock pediatric market | Future |
