# Going Live: Revenue & Funding Strategy

**Document Purpose:** Tanzania-first roadmap to take MamaMtu from development to live production with revenue generation, pilot partnerships, compliance readiness, and funding pathways.

**Last Updated:** 2026-05-17

**Launch Market:** Tanzania first, with East Africa expansion later.

---

## Phase 1: Pre-Launch Readiness (Weeks 1-2)

### Technical Checklist

| Item | Status | Priority | Owner |
|------|--------|----------|-------|
| All tests passing (Jest + Playwright) | ⬜ | Critical | Dev |
| TypeScript zero errors | ⬜ | Critical | Dev |
| Production build successful | ⬜ | Critical | Dev |
| Database migrated to production PostgreSQL | ⬜ | Critical | Dev |
| Environment variables configured | ⬜ | Critical | Dev |
| SSL/HTTPS enabled | ⬜ | Critical | Dev |
| Backup strategy in place | ⬜ | High | Dev |
| Error monitoring (Sentry/similar) | ⬜ | High | Dev |
| Performance monitoring | ⬜ | Medium | Dev |
| GDPR/privacy compliance audit | ⬜ | Critical | Legal/Product |

### Health App Specific Compliance

**Must-Have for Healthcare Data:**

- [ ] **Data Encryption**: At rest and in transit
- [ ] **Access Controls**: Role-based (already implemented)
- [ ] **Audit Logging**: Track all data access (partially implemented)
- [ ] **Data Residency**: Confirm where patient data is stored
- [ ] **Consent Management**: Explicit patient consent for data use
- [ ] **Data Retention Policy**: How long to keep records
- [ ] **Breach Response Plan**: 72-hour notification procedure

**Tanzania-Specific Considerations:**

- [ ] **Ministry of Health alignment**: Confirm digital health registration, approval, or sandbox requirements before handling real patient records.
- [ ] **Personal Data Protection Act, 2022**: Prepare consent, privacy notice, data processor/controller responsibilities, breach response, and retention policy.
- [ ] **Digital Health Strategy alignment**: Position MamaMtu as maternal/newborn workflow, referral, reporting, and quality-improvement software.
- [ ] **COSTECH/NFAST innovation route**: Track COSTECH calls and registration expectations for health innovation and research pilots.
- [ ] **Facility-level approvals**: Secure written pilot agreements with each clinic, hospital, or NGO site.
- [ ] **Clinical safety boundary**: Avoid claiming diagnosis or medical advice; present the app as record management, workflow support, reminders, and reporting.
- [ ] **Data hosting decision**: Document whether production data is hosted in-region, EU, or another jurisdiction and why this is acceptable.

**Tanzania Health Context for Pitching:**

- UNFPA Tanzania identifies reducing preventable maternal and newborn mortality as a national priority and notes use of innovative approaches, including mHealth, to reach marginalized women in rural areas.
- MamaMtu should pitch itself as a facility and care-team tool for better antenatal care tracking, high-risk pregnancy visibility, respectful care workflows, referrals, follow-ups, and reporting.

---

## Phase 2: Deployment Strategy

### Recommended: Vercel Pro + Supabase

**Why This Stack:**
- **Vercel**: Optimized for Next.js, global CDN, serverless functions
- **Supabase**: PostgreSQL with row-level security, auth, storage
- **Cost**: ~$20-50/month to start, scales with usage

**Deployment Steps:**

```bash
# 1. Production database setup
npm run prisma:migrate:deploy

# 2. Seed production with minimal data
npm run seed:staff  # Create admin accounts only

# 3. Deploy to Vercel
vercel --prod

# 4. Configure environment variables in Vercel dashboard
# - DATABASE_URL (Supabase pooled connection)
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL
# - RESEND_API_KEY (for emails)
# - UPSTASH_REDIS_REST_URL (rate limiting)
```

### Custom Domain Setup

1. Purchase domain: `mamamtu.co.tz`, `mamamtu.africa`, or `mamamtu.com`
2. Configure in Vercel: Project Settings > Domains
3. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`
4. Set up email sending from custom domain (Resend)

---

## Phase 3: Revenue Models

### Model A: Tanzania Freemium SaaS (Recommended)

**Free Tier:**
- Up to 100 patients
- Basic appointments
- Standard reports
- Community email support

**Pro Tier - TZS 100,000-150,000/month/clinic or USD $39-59/month:**
- Unlimited patients
- Advanced analytics
- Custom branding
- Priority support
- API access
- Export capabilities

**Enterprise - TZS 400,000+/month or custom NGO/hospital pricing:**
- Multi-location support
- Dedicated account manager
- Custom integrations
- SLA guarantees
- On-premise deployment option

### Model B: Per-User Licensing

- **Provider/Admin**: TZS 30,000-40,000/month
- **Receptionist**: TZS 10,000-15,000/month
- **Read-only Viewer**: Free

### Model C: Transaction-Based

- Free platform
- Charge per SMS notification through a Tanzania SMS aggregator
- Charge per telemedicine session (10% commission)
- Charge for premium features (AI insights, advanced reporting)

### Model D: Grant-Funded + Freemium

- Core platform free (grant-funded)
- Revenue from premium add-ons
- Data insights (anonymized) for research partnerships

---

## Phase 4: Funding Pathways

### Immediate (0-3 months): Bootstrapping & Grants

### Tanzania-Fit Grant and Funding Pipeline

| Opportunity | Fit for MamaMtu | What to Do Next | Source / Notes |
| --- | --- | --- | --- |
| **COSTECH / NFAST** | Very high for Tanzania-based science, technology, and innovation pilots | Contact COSTECH innovation office, track current calls, ask about health innovation and digital health eligibility | COSTECH states NFAST provides financial support for researchers and innovators in nationally prioritized areas |
| **Grand Challenges Canada - Digital Health / Transition to Scale** | High because digital health portfolio supports maternal and newborn health, data governance, privacy, and interoperability | Track open calls and prepare a maternal/newborn digital health concept note | `https://www.grandchallenges.ca/digital-health/` |
| **UNICEF Venture Fund / Health Solutions** | High if the solution helps children, young people, maternal/newborn outcomes, or frontline health systems | Track UNICEF Innovation calls and apply when health-tech rounds open | Search result confirms health-tech startup funding around maternal/newborn/child health; page may block scraping |
| **UNFPA Tanzania partnership route** | High for maternal health alignment, especially rural access, midwives, ANC, and mHealth | Do not pitch as a generic startup grant; pitch as a pilot partner for maternal health data/workflow strengthening | UNFPA Tanzania maternal health page highlights mHealth and new technologies |
| **FUNGUO / EU-supported Tanzania startup ecosystem** | Medium-high for Tanzania startup growth, investment readiness, and grant/technical assistance | Join Tanzania Startup Association and monitor FUNGUO/EU ecosystem calls | Search results identify FUNGUO as EU co-financed Tanzania startup support |
| **Tanzania Startup Association (TSA)** | High ecosystem value, not necessarily direct grant | Join/engage for investor introductions, policy updates, startup week, and ecosystem visibility | TSA works on advocacy, investment, insights, and partnerships |
| **GSMA Innovation Fund** | Medium-high if MamaMtu includes SMS, USSD, mobile money, or rural mobile health delivery | Track annual calls and frame around mobile-enabled maternal health access | Best fit if mobile operator partnership is included |
| **Villgro Africa / Impact Health Investors** | Medium-high for health impact venture support | Prepare pilot evidence, business model, and clinical partner letters | Verify current Tanzania eligibility before applying |
| **D-Prize** | Medium if framed as distribution of a proven intervention rather than original software | Use only if focusing on scaling proven ANC reminders/referral workflows | Verify open challenge categories |
| **Google for Startups / Africa ecosystem programs** | Medium for cloud credits, mentorship, and startup visibility | Apply after landing pilots and clear traction metrics | Better for scale/readiness than earliest validation |

**Application Strategy:**

- Lead with maternal health impact metrics
- Emphasize Tanzania first: Dar es Salaam, Dodoma, Mwanza, Arusha, Morogoro, and underserved rural districts
- Highlight tech-for-good angle
- Include pilot data (even small)
- Include Ministry of Health alignment, clinic letters of intent, and a data protection plan
- Do not apply as “an app idea”; apply as a maternal/newborn health workflow and data quality improvement intervention

### Short-term (3-6 months): Angel & Pre-Seed

**Target Investors:**

- **Local Ecosystem**: Tanzania Startup Association, COSTECH, FUNGUO-linked demo days, Sahara Ventures ecosystem events
- **Healthtech Angels**: Rock Health (US), Healthtech Angel Network
- **Diaspora Investors**: Tanzanians in US/EU/UK interested in impact
- **Micro-VCs**: Ventures Platform, Microtraction, Launch Africa, Founders Factory Africa, Health54, Catalyst Fund-style programs

**Pitch Deck Essentials:**
1. Problem: Preventable maternal and newborn mortality and fragmented antenatal/postnatal records in Tanzania
2. Solution: MamaMtu platform demo (2-min video)
3. Market: $2B+ African healthtech market
4. Traction: Pilot users, waitlist, LOIs from clinics
5. Business Model: SaaS + grants hybrid
6. Team: Technical + healthcare advisory
7. Ask: $50K-150K for 6-month runway
8. Impact Metrics: Lives saved, clinics served

### Medium-term (6-12 months): Seed & Strategic

**Target:** $500K-1.5M seed round

**Strategic Partners to Approach:**

- **Telecoms**: Vodacom Tanzania, Airtel Tanzania, Yas/Tigo Tanzania, Halotel
- **Pharma**: GSK, Novartis (CSR/health access initiatives)
- **Health Systems**: Aga Khan Health Services Tanzania, private maternity clinics, faith-based hospitals, regional referral hospitals
- **Development Orgs**: D-tree, Pathfinder, Jhpiego, Amref Tanzania, Touch Foundation, Management and Development for Health (MDH), UNFPA Tanzania, UNICEF Tanzania
- **Government/Innovation**: Ministry of Health, PORALG health teams, COSTECH, Tanzania Startup Association

---

## Phase 5: Go-to-Market (GTM) Strategy

### Target Customer Segments

**Tier 1: Private Clinics (Primary)**

- Small-medium private clinics in Dar es Salaam, Dodoma, Mwanza, Arusha, Mbeya, Morogoro, and Zanzibar
- 5-50 staff members
- Already use some digital tools
- Decision maker: Clinic owner/administrator

**Tier 2: Faith-Based Hospitals**

- Mission and faith-based hospitals through Christian Social Services Commission (CSSC), BAKWATA-affiliated health providers, and regional hospital networks
- Already serving maternal health
- Grant-funded, budget-conscious
- Decision maker: Hospital administrator

**Tier 3: Public Health Facilities**
- Government health centers
- Longer sales cycle
- Requires Ministry of Health, PORALG, regional, council, or district health leadership alignment
- Decision maker: Regional/council health management teams and facility leadership

### Launch Strategy: "Land and Expand"

**Month 1-2: Beta Launch**
- 3-5 pilot clinics (offer 3 months free)
- Intensive feedback collection
- Case studies and testimonials
- Refine product-market fit

**Month 3-4: Referral Program**
- Clinics get 1 month free for each referral
- Target 10 paying clinics
- Launch basic website with pricing

**Month 5-6: Scale**
- Digital marketing (Google Ads, Facebook)
- Health conference/startup ecosystem presence in Tanzania
- Partnership with medical associations
- Target 25 paying clinics

### Marketing Channels

**Digital (Low Cost):**

- SEO: "clinic management system Tanzania", "maternal health software Tanzania", "patient management system Tanzania"
- Content: Blog on maternal health best practices
- LinkedIn: Target clinic owners, healthcare administrators
- WhatsApp Business: Primary support channel

**Partnerships:**

- Tanzania Startup Association
- COSTECH innovation ecosystem
- Medical Association of Tanzania
- Association of Private Health Facilities in Tanzania (APHFTA)
- Tanzania Midwives Association and nursing/midwifery training institutions
- Digital health implementing NGOs and maternal health programs

**Direct Sales:**
- Cold outreach to clinics in target areas
- Demo days at medical conferences
- Webinars on "Digital Transformation for Clinics"

---

## Phase 6: Key Metrics to Track

### Product Metrics

| Metric | Target (Month 6) | Target (Month 12) |
|--------|------------------|-------------------|
| Active Clinics | 25 | 100 |
| Patient Records | 5,000 | 50,000 |
| Monthly Active Users | 150 | 600 |
| Retention Rate | 80% | 85% |
| NPS Score | 50+ | 60+ |

### Revenue Metrics

| Metric | Month 6 | Month 12 |
|--------|---------|----------|
| MRR (Monthly Recurring Revenue) | $1,000 | $8,000 |
| ARPU (Average Revenue Per User) | $40 | $45 |
| Churn Rate | <10% | <5% |
| CAC (Customer Acquisition Cost) | < $200 | < $150 |
| LTV (Lifetime Value) | > $800 | > $1,200 |

### Impact Metrics (For Grants)

- Pregnancies tracked
- ANC (Antenatal Care) visits facilitated
- High-risk pregnancies identified early
- Referrals made
- Geographic coverage (regions/districts)

---

## Phase 7: Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|------------|
| Data breach | Encryption, audit logs, insurance |
| Downtime | Vercel SLA, database backups, status page |
| Scaling issues | Monitor, auto-scaling, performance budgets |
| Compliance changes | Legal counsel, regular audits |

### Business Risks

| Risk | Mitigation |
|------|------------|
| Slow sales | Diversify: grants + revenue |
| Competition | Focus on maternal health niche |
| Regulatory blocks | Early MOH engagement |
| User adoption | In-person training, WhatsApp support |

---

## Phase 8: Immediate Action Items (This Week)

### Technical
- [ ] Run full test suite and fix any failures
- [ ] Perform production build test
- [ ] Set up Vercel project with production environment
- [ ] Configure production Supabase database
- [ ] Set up error monitoring (Sentry free tier)

### Business
- [ ] Register domain name
- [ ] Create simple landing page (can be basic Next.js page)
- [ ] Draft privacy policy and terms of service
- [ ] Open business bank account (for revenue)
- [ ] Register business entity (if not done)
- [ ] Confirm whether Tanzania company registration, NGO partnership, or hybrid structure is best for first pilots
- [ ] Prepare a Tanzania data protection and clinical safety note

### Grants
- [ ] Identify 3 grant applications to submit this month
- [ ] Draft initial application for highest-fit opportunity
- [ ] Collect any pilot data or user testimonials
- [ ] Prepare 2-minute demo video
- [ ] Contact COSTECH and Tanzania Startup Association
- [ ] Prepare one-page concept note for UNFPA/UNICEF-style partner conversations

### Sales
- [ ] List 10 target clinics for pilot program
- [ ] Draft outreach email template
- [ ] Prepare pricing page
- [ ] Create simple pitch deck (10 slides)

---

## Resources & Templates

### Pitch Deck Structure
1. Cover: MamaMtu + tagline
2. Problem: Maternal health statistics + personal story
3. Solution: 30-second demo video
4. Product: Key screenshots
5. Market: TAM/SAM/SOM
6. Business Model: Pricing slide
7. Traction: Pilot data, waitlist, LOIs
8. Competition: Competitive matrix
9. Team: Founders + advisors
10. Ask: Funding request + use of funds
11. Impact: Lives saved, SDG alignment
12. Contact: Email, phone, demo link

### Grant Application Checklist
- [ ] Organization registration documents
- [ ] Team CVs/bios
- [ ] Technical architecture overview
- [ ] Budget breakdown (6-12 months)
- [ ] Letters of support from pilot clinics
- [ ] Impact measurement plan
- [ ] Sustainability plan (post-grant)

### Pricing Page Template

```
MamaMtu Pricing

Free
Perfect for small clinics getting started
- Up to 100 patients
- Basic appointments
- Standard reports
- Email support
- START FREE

Pro - $49/month
For growing clinics
- Unlimited patients
- Advanced analytics
- Custom branding
- Priority WhatsApp support
- API access
- Export to Excel/PDF
- START PRO TRIAL

Enterprise - Custom
For hospital chains & NGOs
- Everything in Pro
- Multi-location support
- Custom integrations
- Dedicated support
- On-premise option
- CONTACT SALES
```

---

## Success Milestones

### 30 Days
- [ ] Production app live on custom domain
- [ ] 3 pilot clinics signed up
- [ ] First grant application submitted
- [ ] Basic marketing website published

### 90 Days
- [ ] 10 paying clinics
- [ ] $500+ MRR
- [ ] 2 grants awarded or in final round
- [ ] 1 case study published

### 180 Days
- [ ] 25 paying clinics
- [ ] $1,500+ MRR
- [ ] First angel investment or major grant
- [ ] Expansion to 2nd Tanzania region

### 365 Days
- [ ] 100 paying clinics
- [ ] $8,000+ MRR
- [ ] Seed funding raised or profitable
- [ ] Recognition as a leading maternal health platform in Tanzania

---

## Emergency Contacts & Support

**Technical Issues:**
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io
- Resend Support: support@resend.com

**Legal/Compliance:**
- Data Protection Officer: [assign someone]
- Legal counsel: [find healthcare-specialized lawyer]

**Business:**
- Accountant: [find one familiar with SaaS]
- Bank relationship manager: [assign]

---

## Next Steps Right Now

1. **Review this document** with team/advisors
2. **Pick ONE funding pathway** to focus on first (grant vs. angel vs. bootstrap)
3. **Set up production deployment** (technical foundation)
4. **Create calendar** with grant deadlines and milestones
5. **Start pilot outreach** to 3-5 clinics

**Remember:** Perfect is the enemy of shipped. Get the core product live, start generating value, and iterate based on real user feedback.

---

**Document Owner:** [Founder/CEO Name]
**Review Schedule:** Weekly until launch, monthly post-launch
**Success Metric:** Clinics served, revenue generated, lives impacted
