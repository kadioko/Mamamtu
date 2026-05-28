# Project Status

Last updated: 2026-05-28

## Team

| Name | Role |
| --- | --- |
| **Godfrey Mariki** | Founder & CEO, Full-stack Developer (Tanzania-based) |
| **Dr. Jade Wiles Jr., DHA** | Health Science Specialist — Doctor of Health Administration, public health leader, educator, and global reconciliation advocate. Specializes in health policy, coalition-building, stakeholder engagement, health equity, and ethical leadership. Founder of Awaken Millennial LLC. Prior roles: Momentum Health Development Corporation, AFSCME, The Outreach Team, Baltimore Mayor's Office of Government Relations. Full bio: `docs/MAMAMTU_ORG_CONFIG.md`. |

---

## Platform Health (2026-05-28)

| Check | Result |
| --- | --- |
| `npm outdated` | 0 outdated — 31 packages updated in last pass |
| `npm run lint` | ✅ Passed |
| `npm run typecheck` | ✅ Passed |
| `npm test -- --runInBand --silent` | ✅ 177 passed (22 suites) |
| `npm run e2e -- --project=chromium` | ✅ 11 passed |
| `npm run build` | ✅ Next.js 16.2.6, Prisma 7.8.0 |
| `npm audit --omit=dev` | ✅ 0 vulnerabilities |

---

## Completed Platform Work

- Next.js 16 + React 19
- Tailwind CSS 4
- TypeScript 6
- ESLint 10 with React and React Hooks rules via compatibility helpers
- Prisma 7 with PostgreSQL driver adapter (`prisma.config.ts`)
- Resend 6 email SDK
- lucide-react 1.x icon library
- Upstash Redis-backed production rate limiting
- Vercel Blob-backed production upload storage
- Vercel Analytics and Speed Insights
- PWA/browser app icons
- Protected preview testing with `VERCEL_PROTECTION_BYPASS`
- Clean production audit (temporary transitive overrides: `uuid`, `postcss`, `svix`)
- Playwright E2E foundation: login, education, health, dashboard, patients, appointments, uploads, reports, notifications, clinical form entry points

## Completed Product Work

- Dashboard screens: patients, appointments, pregnancies, ANC visits, newborns, immunizations, reports, notifications, education resources, audit logs, staff user management, production health
- Create/edit forms: pregnancy episodes, ANC visits, newborn records, immunization records
- Delete/archive controls for clinical records
- Patient timeline with role-aware clinical edit links
- Upload preview/download management for attachments
- Education resource publishing controls
- Public education browser: automatic search, URL-backed filters, sorting, featured resources, live result counts
- Demo seed data: patients, appointments, records, pregnancies, ANC visits, newborns, immunizations, reports, notifications, audit logs, long-form education content
- Secured clinical export API: verified admin/provider access, no-store download responses, audit logging
- Reports dashboard: Clinical Exports panel + Admin Export History

## Pilot Clinic Outreach

**Current phase: Week 3 — Follow-up**

- **Weeks 1 & 2 ✅ Complete** — 14 outreach emails sent
- 9 private clinics: Aga Khan, Shree Hindu Mandal, Premier Care, Dar IVF, Hans Mgaya Hospital, NuLife, Komakoma Polyclinic, Kairuki Hospital, Columbia Africa IST Clinic
- 2 faith-based networks: CSSC, BAKWATA
- 3 NGOs: MDH, Amref, Jhpiego
- All emails CC'd <gmariki@necuva.com>
- Live tracker: `docs/MamaMtu_Outreach_Tracker.csv`

**Pilot documents ready:**

- `docs/MamaMtu_Pilot_Terms.md` — full pilot agreement with signing block
- `docs/MamaMtu_Pilot_Info_Sheet_EN_SW.md` — bilingual one-page info sheet (English + Swahili)
- `docs/MamaMtu_Outreach_Tracker.csv` — live tracker for all 14 contacts
- `docs/pdfs/MamaMtu_Pilot_Info_Sheet.html` — print-ready PDF version
- `docs/pdfs/MamaMtu_Pilot_Terms.html` — print-ready PDF version

**Immediate actions (Week 3):**

1. Follow up on all 14 contacts at 3–5 day cadence
2. Schedule 2–3 demo meetings
3. Visit 1–2 clinics in person if email has gone cold
4. Close first signed pilot agreement by end of Week 4

---

## Best Next Upgrades

1. **Protected-preview Playwright CI** — Wire E2E into GitHub Actions using `VERCEL_PROTECTION_BYPASS`.
2. **ESLint warning cleanup** — 181 warnings remain; target shared library `any`, dashboard page types, then React Hooks compiler warnings.
3. **Better Auth migration** — Dedicated branch replacing NextAuth v4, removing `uuid` override.
4. **PostgreSQL baseline activation** — Backup Supabase → rehearsal restore → verify drift → replace SQLite-era migrations.
5. **Deeper E2E journeys** — Real patient creation, ANC/newborn records, appointment booking, attachment upload in isolated test DB.
6. **Production observability** — Confirm Analytics, Speed Insights, Redis rate limiting, Blob storage, email delivery end-to-end.

## Recommended Work Order

1. Protected-preview Playwright CI workflow
2. Deeper E2E create/update journeys
3. ESLint warning cleanup pass
4. Better Auth migration
5. PostgreSQL baseline activation
6. Tanzania localization + SMS reminders
7. Product polish and MoH report format

## Watch Items

- Keep the Vercel protection bypass token secret — rotate if shared outside trusted channels.
- Do not activate the PostgreSQL baseline directly in production without backup and restore rehearsal.
- Do not remove the `uuid` override until NextAuth v4 is removed.
- Keep demo passwords out of shared/public environments.
- `UPGRADE_PLAN.md` and `AUTH_MIGRATION_DECISION.md` have been removed — their content is fully preserved in `MAJOR_UPGRADE_ROADMAP.md`.

---

## x10 Think: Full "What's Left" Analysis (2026-05-28)

A comprehensive look across every dimension of MamaMtu — platform, product, compliance, team, outreach, funding, and community.

---

### 1. PLATFORM & INFRASTRUCTURE

| # | What's Left | Priority |
| --- | --- | --- |
| 1.1 | **Protected-preview Playwright CI** — Wire E2E suite into GitHub Actions using `VERCEL_PROTECTION_BYPASS` so every Vercel preview is smoke-tested automatically | Critical |
| 1.2 | **PostgreSQL baseline activation** — Backup Supabase → restore into rehearsal DB → verify zero schema drift → replace SQLite-era migrations with the clean baseline | Critical |
| 1.3 | **Better Auth migration** — Dedicated branch replacing NextAuth v4 and removing the temporary `uuid` override; credential flow, Prisma adapter tables, JWT callbacks, role claims, email verification, staff account lifecycle | High |
| 1.4 | **Error monitoring** — Sentry (free tier) or similar wired to production; capture unhandled exceptions, API 5xx, and client-side React error boundaries | High |
| 1.5 | **Production environment hardening** — Confirm all env vars set in Vercel production: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `RESEND_API_KEY`, `UPSTASH_REDIS_REST_URL`, `VERCEL_BLOB_*` | Critical |
| 1.6 | **Custom domain** — Register `mamamtu.co.tz` (or `.africa`); configure in Vercel; update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`; set Resend sender domain | High |
| 1.7 | **Database backup strategy** — Automate daily Supabase backups; document restore procedure; test restore before first real patient data enters | High |
| 1.8 | **Production observability review** — Verify Vercel Analytics, Speed Insights, logs, Redis rate-limiting counters, Blob upload storage, and email delivery end-to-end | Medium |
| 1.9 | **ESLint warning cleanup** — 181 warnings remain; target shared library `any` types, dashboard page data types, then React Hooks compiler warnings | Medium |
| 1.10 | **Offline/PWA hardening** — Verify service worker caching strategy works for low-connectivity Tanzania environments; test sync-on-reconnect for form submissions | High |

---

### 2. PRODUCT & CLINICAL FEATURES

| # | What's Left | Priority |
| --- | --- | --- |
| 2.1 | **Tanzania language localization** — Swahili interface toggle (referenced in welcome package but not yet implemented); remove any Kenya-specific copy; use Tanzania regions/districts; TZS currency display | Critical |
| 2.2 | **SMS appointment reminders** — Africa's Talking integration for real SMS delivery; reminder logic modeled, needs provider wiring | High |
| 2.3 | **High-risk pregnancy flagging UI** — Clinical logic (pre-eclampsia, multiple birth, prior complications) surfaced clearly in dashboard and patient timeline | High |
| 2.4 | **Ministry of Health report generation** — Printable/exportable MoH-format reports (MTUHA or Tanzania standard); current exports are CSV/Excel only | High |
| 2.5 | **Referral tracking** — Record patient referrals: reason, destination facility, date, follow-up status; key for funder impact metrics | High |
| 2.6 | **Patient-facing SMS-only flow** — Patients confirm appointments via SMS reply; lightweight patient view; reduces missed appointments | Medium |
| 2.7 | **Deeper E2E test coverage** — Real patient creation, pregnancy + ANC + newborn records, appointment booking, attachment upload, clinical record submission in isolated test DB | High |
| 2.8 | **Demo/seed data separation** — Environment-gated seed scripts; no demo credentials accessible in production | Critical |
| 2.9 | **Multi-clinic / multi-location support** — Foundation for enterprise tier: one org with multiple facility sub-accounts; data isolation between facilities | Medium |
| 2.10 | **Audit log review tooling** — Admin UI for filtering audit logs by user, action type, date range, patient; current logging is solid but review UI is basic | Medium |

---

### 3. COMPLIANCE & LEGAL

| # | What's Left | Priority |
| --- | --- | --- |
| 3.1 | **Data Protection Officer formally assigned** — Currently interim (Godfrey Mariki); formalize with signed DPO responsibility document; register with Tanzania PDPC if required | Critical |
| 3.2 | **Privacy policy published** — Live URL at `mamamtu.co.tz/privacy`; English + Swahili; Version 1.0 with effective date | Critical |
| 3.3 | **Terms of service published** — Clinic agreement terms; SaaS terms; disclaimer that MamaMtu is not a diagnostic system | High |
| 3.4 | **Patient consent forms printed and distributed** — 20 copies per clinic (English + Swahili); consent version v1.0 dated; witness signature field | Critical |
| 3.5 | **Privacy notice posters distributed** — A4 laminated for each clinic waiting area; English + Swahili; "Your health records are secure" | High |
| 3.6 | **Breach response plan finalized** — Incident commander assigned (24/7 contact); Tanzania PDPC contact details; legal counsel identified | High |
| 3.7 | **Data residency documentation** — Written policy explaining EU Frankfurt hosting and Tanzania patient acceptability | High |
| 3.8 | **Clinical safety staff acknowledgment forms** — Each clinical staff at pilot clinics signs the clinical safety statement; originals retained | High |
| 3.9 | **Ministry of Health alignment check** — Confirm no regulatory sandbox or pre-approval required before handling real patient records | Critical |
| 3.10 | **Data retention automation** — Scheduled job to flag/archive records past retention window; policy exists but no automated enforcement | Medium |

---

### 4. PILOT CLINIC OPERATIONS

| # | What's Left | Priority |
| --- | --- | --- |
| 4.1 | **Week 3: Follow up on 14 sent emails** — 3–5 day cadence; WhatsApp where email reliability is uncertain; tracker: `docs/MamaMtu_Outreach_Tracker.csv` | Active now |
| 4.2 | **Schedule 2–3 clinic demo meetings** — Convert responses into in-person or Zoom demos; bring tablet with live demo | Active now |
| 4.3 | **Visit 1–2 clinics in person** — If no email response after follow-up; bring printed pilot info sheet + consent form samples | Active now |
| 4.4 | **Sign first pilot agreement** — `docs/MamaMtu_Pilot_Terms.md` ready; first clinic signs within Week 4 | Active now |
| 4.5 | **Staff training session** — 2-hour session (in-person or Zoom) per clinic; Quick Start Guide; designate MamaMtu Champions | Upcoming |
| 4.6 | **Provision tablets if needed** — 1–2 tablets per clinic on request; configure offline sync and browser bookmarks | Upcoming |
| 4.7 | **Maintain outreach tracker** — Live status per clinic: contacted → responded → demo scheduled → signed → live | Active now |
| 4.8 | **Refine pitch from feedback** — Capture objections and questions from Week 2–3 responses; update script and FAQ | Active now |
| 4.9 | **Dr. Wiles advisory input on clinic engagement** — Leverage coalition-building and stakeholder engagement expertise for faith-based (CSSC, BAKWATA) and NGO partners | Active now |
| 4.10 | **Impact measurement baseline** — Before clinics go live: record missed appointment rate, paper record time per patient, staff hours on admin; measure change at 30/60/90 days | Upcoming |

---

### 5. FUNDING & GRANTS

| # | What's Left | Priority |
| --- | --- | --- |
| 5.1 | **COSTECH / NFAST application** — Submit maternal/newborn digital health concept note; template ready at `docs/TANZANIA_GRANT_TEMPLATES.md` | High |
| 5.2 | **Grand Challenges Canada concept note** — Digital health concept note aligned with maternal/newborn and data governance portfolio | High |
| 5.3 | **UNFPA Tanzania partnership conversation** — One-page concept note; pitch as pilot partner; Dr. Wiles can support framing | High |
| 5.4 | **Tanzania Startup Association membership** — Join TSA for investor introductions, policy updates, ecosystem visibility | Medium |
| 5.5 | **10-slide Tanzania pitch deck** — Problem, solution, market, traction, business model, team (incl. Dr. Wiles), ask, impact metrics | High |
| 5.6 | **2-minute demo video** — Screen recording: patient registration → ANC visit → risk flag → appointment reminder → report export | High |
| 5.7 | **Clinic letters of intent** — 2–3 signed letters from interested clinics; strong signal for funders | High |
| 5.8 | **Impact measurement plan** — Formal document: pregnancies tracked, ANC follow-up rate, high-risk flags, referrals, facility usage; used for grant reporting | High |
| 5.9 | **Angel investor short list** — Identify 10 East Africa-focused angels or micro-VCs (Ventures Platform, Microtraction, Launch Africa, Founders Factory Africa, Health54, Catalyst Fund) | Medium |
| 5.10 | **Business bank account and accountant** — Open business account for revenue; engage accountant familiar with SaaS and Tanzania company structure | Medium |

---

### 6. MARKETING & COMMUNITY

| # | What's Left | Priority |
| --- | --- | --- |
| 6.1 | **Landing page published** — Basic marketing page on custom domain: tagline, core features, pricing, pilot CTA, contact form | High |
| 6.2 | **Pricing page live** — Free / Pro / Enterprise tiers; TZS pricing prominently displayed; "Start free pilot" CTA | High |
| 6.3 | **WhatsApp Business number configured** — Dedicated account for support; auto-reply with response time expectations | High |
| 6.4 | **LinkedIn presence** — Company page for MamaMtu; CEO profile updated; posts on maternal health in Tanzania | Medium |
| 6.5 | **First case study** — After first clinic goes live: document their journey, numbers (patients registered, appointments kept, staff time saved); publish as blog post and PDF | Upcoming |
| 6.6 | **Medical Association of Tanzania engagement** — Introduce MamaMtu through MAT and APHFTA (Association of Private Health Facilities in Tanzania) | Medium |
| 6.7 | **Tanzania Midwives Association outreach** — Midwives are primary users; their endorsement builds clinical credibility | Medium |
| 6.8 | **Swahili content marketing** — Blog posts and social content in Swahili on maternal health best practices, clinic management tips; builds SEO and trust | Medium |
| 6.9 | **Referral program** — Clinics get 1 month free for each referral that converts | Upcoming |
| 6.10 | **Dr. Wiles as thought leadership voice** — Author posts and recorded talks on community health transformation, ethical healthcare leadership, and health equity in East Africa | Medium |

---

### 7. PRODUCT EXPANSION (NEXT 6–12 MONTHS)

| # | What's Left | Priority |
| --- | --- | --- |
| 7.1 | **Freemium gating** — Enforce 100-patient limit on free tier; upgrade prompt; billing integration (Stripe or M-Pesa) | High |
| 7.2 | **M-Pesa / mobile money billing** — Tanzania clinics pay via mobile money; integrate M-Pesa for Pro subscriptions | High |
| 7.3 | **USSD interface** — Ultra-low-bandwidth fallback for clinics with feature phones | Medium |
| 7.4 | **Expanded analytics dashboard** — Month-over-month trends, ANC completion rates, high-risk outcome tracking, geographic heat maps, cohort retention by facility | Medium |
| 7.5 | **AI-assisted risk scoring** — Pattern-based flagging using historical ANC data; advisory only, not diagnostic | Future |
| 7.6 | **Interoperability** — HL7 FHIR export for integration with national DHIS2 or OpenMRS instances | Future |
| 7.7 | **Multi-language expansion** — After Swahili: Luganda (Uganda), Kinyarwanda (Rwanda), Amharic (Ethiopia) | Future |
| 7.8 | **Telemedicine referral workflow** — Video consultation booking for high-risk cases referred to specialists | Future |
| 7.9 | **Community health worker (CHW) mobile module** — Lightweight PWA for CHWs: home visits, community outreach, offline referrals | Future |
| 7.10 | **Postnatal + child health tracking** — Extend beyond delivery: child growth, immunization schedules through age 5 | Future |
