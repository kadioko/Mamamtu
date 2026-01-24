# Vercel Deployment Setup Guide

## Overview

This guide explains how to configure your Mamamtu application for deployment on Vercel with PostgreSQL database support (Supabase/Neon recommended).

## Important: Vercel + PostgreSQL

Vercel is a **Serverless platform** with the following constraints:

1. **Read-Only Filesystem at Runtime**: You can read the database to display data, but you cannot save new data (user sign-ups, form submissions) to it once the site is live.

2. **Data Reset**: Every time your function "sleeps" and wakes up, the database resets to the version you deployed.

3. **Recommendation**: For a professional health platform like Mamamtu, consider migrating to a hosted PostgreSQL database (e.g., Supabase, Railway, or Neon).

## Step 1: Set Up PostgreSQL Database

### Option A: Supabase (Recommended)

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Note down your connection string from Settings > Database

### Option B: Neon

1. Go to [Neon](https://neon.tech)
2. Create a new project
3. Get your connection string

### Option C: Railway or Other Providers

Use any PostgreSQL-compatible provider.

## Step 2: Update Environment Variables in Vercel

Add these to your Vercel project settings (Settings > Environment Variables):

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://username:password@hostname:5432/database_name?schema=public` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `[generate-a-strong-secret]` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://mamamtu-[hash].vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://mamamtu-[hash].vercel.app` | Production |

**Replace the placeholders:**

- `username`: Your database username
- `password`: Your database password
- `hostname`: Your database host (e.g., `db.xxxx.supabase.co` for Supabase)
- `database_name`: Your database name
- `[hash]`: Your actual Vercel deployment URL hash

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 3: Verify Prisma Configuration

Your `prisma/schema.prisma` has been updated to use PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

The schema has been optimized for PostgreSQL with:
- Proper array support for `allergies`, `tags`, `symptoms`, `medications`
- JSONB support for complex data like `labResults`, `vitals`, `metadata`
- All data types are PostgreSQL-compatible

## Step 4: Database Migration

### For Existing SQLite Data

If you have existing data in SQLite, you'll need to export and import it to PostgreSQL. Prisma provides tools for this:

```bash
# Export SQLite data (if needed)
npx prisma db push --force-reset

# Then import to PostgreSQL after setting up the database
npx prisma db push
```

### For Fresh PostgreSQL Setup

```bash
# After setting DATABASE_URL to PostgreSQL connection string
npx prisma db push
npx prisma db seed  # If you have seed data
```

## Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel will automatically detect Next.js and build your project
4. Set environment variables in project settings
5. Deploy!

### Option B: Via Vercel CLI

```bash
npx vercel deploy --prod --yes
```

## Step 6: Post-Deployment Verification

After deployment:

1. Visit your Vercel deployment URL
2. Test read operations (viewing patients, appointments, content)
3. Check that static pages load correctly
4. Verify API endpoints respond properly

## Important Notes

### Data Persistence

- **Read Operations**: Work fine with PostgreSQL on Vercel
- **Write Operations**: Full persistence with PostgreSQL
- **Solution**: PostgreSQL provides full data persistence

### Build Process

- Vercel will run `npm run build` which includes `prisma generate`
- The database connection must be available for `generateStaticParams` queries to work
- All static pages will be pre-rendered during build

### Recommended Next Steps

For production use, consider:

1. **Migrate to PostgreSQL**:
   - Supabase (Free tier available)
   - Railway
   - Neon
   - AWS RDS

2. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update Environment Variables**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

## Troubleshooting

### Build Fails with "DATABASE_URL not found"

- Ensure `DATABASE_URL` is set in Vercel project settings
- Check that the variable is set for the correct environment (Production)
- Verify the value matches your PostgreSQL connection string

### Database Connection Fails

- Confirm your PostgreSQL database is accessible from Vercel's IP ranges
- Check that the connection string format is correct
- Verify database credentials are valid

### Prisma Client Generation Fails

- Ensure `postinstall` script runs: `prisma generate`
- Check that `@prisma/client` is in `package.json` dependencies
- Verify Prisma schema is valid

## Support

For more information:

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Prisma Vercel Guide](https://www.prisma.io/docs/orm/deployment/deployment-guides/deploying-to-vercel)
- [PostgreSQL on Vercel](https://vercel.com/docs/storage/vercel-postgres)
