# MamaMtu Production Deployment Checklist

**Purpose:** Step-by-step guide to deploy MamaMtu to production for Tanzania launch.

**Last Updated:** 2026-05-28

---

## Pre-Deployment Requirements

Before starting, ensure you have:

- [ ] Domain name purchased (.co.tz preferred: `mamamtu.co.tz`)
- [ ] Vercel account connected to GitHub repo
- [ ] Supabase project created (Production tier)
- [ ] Resend account set up (for email)
- [ ] All local tests passing

---

## Phase 1: Domain & DNS Setup

### 1.1 Purchase Domain (30 minutes)

**Option A: .co.tz Domain (Recommended for Tanzania)**
- Register at: `register.co.tz` or via local registrar
- Cost: ~$20-30/year
- Requires: Business registration docs may be needed

**Option B: .com or .africa Domain**
- Register at: Namecheap, GoDaddy, or Cloudflare
- Cost: ~$10-20/year
- Faster registration (no documentation)

**Your Domain:** `______________________________`

### 1.2 Configure DNS (15 minutes)

In your domain registrar's DNS settings:

```
Type: A
Name: @
Value: 76.76.21.21 (Vercel's IP)
TTL: 3600
```

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### 1.3 Add Domain to Vercel (10 minutes)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domain: `yourdomain.co.tz`
3. Add domain: `www.yourdomain.co.tz` (redirect to apex)
4. Vercel will verify DNS (may take 5-60 minutes)

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Phase 2: Production Database Setup

### 2.1 Create Production Supabase Project (20 minutes)

1. Go to `supabase.com` → New Project
2. Organization: Your company name
3. Project Name: `mamamtu-production`
4. Database Password: [Generate strong password, save in password manager]
5. Region: `EU (West) - Frankfurt` (closest to Tanzania with good latency)
6. Plan: Free tier initially, upgrade to Pro when needed

**Project URL:** `https://________________________.supabase.co`
**API Key:** `________________________________________`

### 2.2 Database Security (15 minutes)

1. Go to Database → Replication (ensure enabled)
2. Go to Database → Backups (verify daily backups enabled)
3. Go to Authentication → Providers → Disable all except Email
4. Go to Settings → API → Enable Row Level Security (RLS) warnings

### 2.3 Run Migrations (10 minutes)

```bash
# In your local project
cd "C:\Users\USER\Documents\Coding\1 of 1\Mamamtu\Mamamtu"

# Set production database URL temporarily
$env:DATABASE_URL="postgresql://postgres:PASSWORD@db.XXXXXXXX.supabase.co:5432/postgres"

# Push schema (for first deployment)
npx prisma db push

# Or run migrations (if you have migration files)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Phase 3: Environment Variables

### 3.1 Local .env.production File (10 minutes)

Create `C:\Users\USER\Documents\Coding\1 of 1\Mamamtu\Mamamtu\.env.production`:

```env
# Database (Supabase Connection Pooler on port 6543)
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10"
DIRECT_DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="https://yourdomain.co.tz"
NEXTAUTH_SECRET="[Generate: openssl rand -base64 32]"

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.co.tz"
NODE_ENV="production"

# Email (Resend)
RESEND_API_KEY="re_[YOUR_RESEND_KEY]"
RESEND_FROM_EMAIL="notifications@yourdomain.co.tz"

# Rate Limiting (Upstash Redis - optional for MVP)
# UPSTASH_REDIS_REST_URL=""
# UPSTASH_REDIS_REST_TOKEN=""

# Vercel Protection Bypass (for automated testing)
# VERCEL_PROTECTION_BYPASS_SECRET=""
```

### 3.2 Vercel Environment Variables (15 minutes)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from `.env.production`
3. Set environment: Production
4. Mark sensitive variables (NEXTAUTH_SECRET, DATABASE_URL, RESEND_API_KEY) as **Encrypted**

**Variables Added:**
- ⬜ DATABASE_URL
- ⬜ DIRECT_DATABASE_URL
- ⬜ NEXTAUTH_URL
- ⬜ NEXTAUTH_SECRET
- ⬜ NEXT_PUBLIC_APP_URL
- ⬜ RESEND_API_KEY
- ⬜ RESEND_FROM_EMAIL

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Phase 4: Pre-Deploy Verification

### 4.1 Local Production Build Test (10 minutes)

```bash
cd "C:\Users\USER\Documents\Coding\1 of 1\Mamamtu\Mamamtu"

# Set production environment temporarily
$env:NODE_ENV="production"

# Build locally (should match Vercel build)
npm run build

# Check for errors
# If successful, you'll see .next/ folder created
```

**Expected Output:**
- No TypeScript errors
- No build failures
- "Build completed successfully" message

### 4.2 Database Connection Test (5 minutes)

```bash
# Test Prisma can connect
npx prisma db pull --dry-run

# Should show schema without errors
```

### 4.3 Seed Data for Production (Optional) (10 minutes)

Decide: Do you want demo accounts in production?

**Option A: Clean Production (Recommended)**
- No seed data
- Only admin account created manually
- Real patient data only

**Option B: Demo Mode**
- Create 2-3 demo patient records
- Clearly marked as "DEMO - NOT REAL"
- For sales demos only

**Your Decision:** _________________________________

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Phase 5: Deploy to Production

### 5.1 First Deploy (10 minutes)

```bash
# Install Vercel CLI if not already
npm i -g vercel

# Login (one-time)
vercel login

# Deploy to production
vercel --prod

# Or use Git push (if connected to GitHub)
git push origin main
# Vercel will auto-deploy
```

### 5.2 Verify Deployment (15 minutes)

Check these URLs:

- ⬜ `https://yourdomain.co.tz` - Homepage loads
- ⬜ `https://yourdomain.co.tz/auth/signin` - Login page loads
- ⬜ `https://yourdomain.co.tz/api/health` - Health check (if you have one)

**Check in browser:**
- No console errors (F12 → Console)
- SSL certificate valid (lock icon in address bar)
- Mobile responsive (use browser dev tools)

### 5.3 Create Admin Account (10 minutes)

1. Go to production sign-up page
2. Create first admin account with your email
3. Verify email (check Resend logs if needed)
4. Log in and confirm dashboard loads

**Admin Email:** _________________________________

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Phase 6: Post-Deploy Checks

### 6.1 Critical Functionality Tests (20 minutes)

Test in production:

- ⬜ Sign up as new user
- ⬜ Log in / log out
- ⬜ Add a test patient (use fake data: "Test Patient")
- ⬜ Create pregnancy record
- ⬜ Log an ANC visit
- ⬜ Generate a report
- ⬜ Export data
- ⬜ Verify audit logs capture the actions

### 6.2 Security Verification (15 minutes)

- ⬜ Check that demo data/staff accounts don't appear in production
- ⬜ Verify role-based access (admin vs provider vs receptionist)
- ⬜ Test that unauthenticated users can't access dashboard
- ⬜ Confirm HTTPS is enforced (http redirects to https)
- ⬜ Verify security headers (check in browser dev tools)

### 6.3 Performance Check (10 minutes)

Use Google PageSpeed Insights:
- ⬜ Mobile score > 70
- ⬜ Desktop score > 80
- ⬜ First Contentful Paint < 2 seconds

### 6.4 Backup Verification (5 minutes)

- ⬜ Confirm Supabase automatic backups enabled
- ⬜ Note backup schedule (daily)
- ⬜ Document how to restore from backup

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Phase 7: Email & Communications

### 7.1 Configure Resend (15 minutes)

1. Add your domain to Resend:
   - Go to `resend.com` → Domains → Add Domain
   - Enter: `yourdomain.co.tz`
   - Add DNS records (DKIM, SPF) to your domain registrar
   - Verify domain (may take up to 24 hours)

2. Set sender email: `notifications@yourdomain.co.tz`

3. Test email sending:
   - Use "forgot password" flow
   - Check that email arrives
   - Verify sender shows correctly

### 7.2 Error Monitoring (Optional for MVP) (10 minutes)

**Option A: Sentry (Recommended)**
1. Create account at `sentry.io`
2. Create Next.js project
3. Add DSN to Vercel env vars
4. Test error capture

**Option B: Vercel Analytics (Included)**
- Already enabled if you set up Vercel Pro
- Check Dashboard → Analytics

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Complete

---

## Phase 8: Documentation & Handoff

### 8.1 Production Credentials Document

Create a secure document (1Password, LastPass, or encrypted file) with:

- [ ] Domain registrar login
- [ ] Vercel login
- [ ] Supabase login
- [ ] Resend login
- [ ] Database passwords
- [ ] NEXTAUTH_SECRET
- [ ] API keys

**Stored in:** _________________________________

### 8.2 Runbook for Team

Document for your team:

```markdown
# MamaMtu Production Runbook

## Access URLs
- Production: https://yourdomain.co.tz
- Admin Dashboard: https://yourdomain.co.tz/dashboard
- Vercel: https://vercel.com/[your-account]/[project]
- Supabase: https://app.supabase.com/project/[ref]

## Deployment
- Auto-deploys on push to main branch
- Manual deploy: `vercel --prod`

## Database
- Connection: Use connection pooler (port 6543)
- Backups: Daily automatic
- Restore: Contact [person] or follow Supabase docs

## Support
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.io
- Resend Support: support@resend.com
- Internal: [Your contact info]

## Emergency Contacts
- Technical Lead: [Name, phone]
- Data Protection Officer: [Name, phone]
```

### 8.3 Sign-Off Checklist

- [ ] All Phase 1-8 steps complete
- [ ] Production site loads correctly
- [ ] Admin account created and tested
- [ ] Email sending verified
- [ ] Security checks passed
- [ ] Team has access to runbook
- [ ] Backup/restore tested
- [ ] Rollback plan documented (previous deployment URL saved)

---

## Emergency Procedures

### If Production Goes Down

1. **Check Vercel Status**
   - Go to `status.vercel.com`
   - If incident reported, wait for resolution

2. **Check Supabase Status**
   - Go to `status.supabase.com`
   - If database issue, check Supabase dashboard

3. **Quick Rollback**
   ```bash
   # In Vercel dashboard
   # Go to Deployments → Previous working deployment → Redeploy
   ```

4. **Contact Support**
   - Vercel Enterprise: Priority support (if on Pro plan)
   - Supabase: support@supabase.io
   - Include: Project ID, error messages, timestamp

5. **Communicate**
   - Post status on your communication channel
   - Update stakeholders
   - Document incident for post-mortem

---

## Timeline Summary

| Phase | Estimated Time | Actual Time | Status |
|-------|---------------|-------------|--------|
| 1. Domain & DNS | 45 min | | ⬜ |
| 2. Database Setup | 45 min | | ⬜ |
| 3. Environment Variables | 25 min | | ⬜ |
| 4. Pre-Deploy Verification | 25 min | | ⬜ |
| 5. Deploy | 20 min | | ⬜ |
| 6. Post-Deploy Checks | 50 min | | ⬜ |
| 7. Email & Monitoring | 25 min | | ⬜ |
| 8. Documentation | 30 min | | ⬜ |
| **TOTAL** | **~4-5 hours** | | |

---

## Next Steps After Deployment

1. [ ] Add production URL to all documentation
2. [ ] Update GOING_LIVE_STRATEGY.md milestone ("Production app live" → checked)
3. [ ] Schedule first pilot clinic demo
4. [ ] Create WhatsApp Business account for support
5. [ ] Set up Google Analytics (optional)

---

## Questions or Issues?

If you get stuck:
1. Check Vercel/Supabase documentation
2. Search error messages online
3. Check GitHub issues for similar problems
4. Contact support with specific error messages

**Good luck with the launch!**
