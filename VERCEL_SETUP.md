# Vercel Deployment Setup Guide

## Overview
This guide explains how to configure your Mamamtu application for deployment on Vercel with SQLite database support.

## Important: Vercel + SQLite Limitations

Vercel is a **Serverless platform** with the following constraints:

1. **Read-Only Filesystem at Runtime**: You can read the `dev.db` file to display data, but you cannot save new data (user sign-ups, form submissions) to it once the site is live.

2. **Data Reset**: Every time your function "sleeps" and wakes up, the database resets to the version you deployed.

3. **Recommendation**: For a professional health platform like Mamamtu, consider migrating to a hosted PostgreSQL database (e.g., Supabase, Railway, or Neon).

## Step 1: Add Environment Variables to Vercel

### Via Vercel Dashboard:

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **Mamamtu** project
3. Navigate to **Settings > Environment Variables**
4. Add the following variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `DATABASE_URL` | `file:./prisma/dev.db` | Production, Preview, Development |
| `NEXTAUTH_SECRET` | `[generate-a-strong-secret]` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://mamamtu-[hash].vercel.app` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://mamamtu-[hash].vercel.app` | Production |

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 2: Database File in Git

✅ **Already Done**: The `prisma/dev.db` file has been added to your Git repository.

This ensures:
- Vercel can access the database during the build process
- The database is available at runtime for read operations
- The `.gitignore` has been updated to allow the `.db` file

## Step 3: Verify Prisma Configuration

Your `prisma/schema.prisma` should have:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

This is already configured in your project.

## Step 4: Deploy to Vercel

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

## Step 5: Post-Deployment Verification

After deployment:
1. Visit your Vercel deployment URL
2. Test read operations (viewing patients, appointments, content)
3. Check that static pages load correctly
4. Verify API endpoints respond properly

## Important Notes

### Data Persistence
- **Read Operations**: ✅ Work fine with SQLite on Vercel
- **Write Operations**: ❌ Will fail or data will be lost after function sleep
- **Solution**: Migrate to PostgreSQL for production use

### Build Process
- Vercel will run `npm run build` which includes `prisma generate`
- The database file must exist for `generateStaticParams` queries to work
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
- Verify the value matches your local `.env` file

### Database File Not Found
- Confirm `prisma/dev.db` is committed to Git
- Check `.gitignore` allows the `.db` file
- Run `git status` to verify the file is tracked

### Prisma Client Generation Fails
- Ensure `postinstall` script runs: `prisma generate`
- Check that `@prisma/client` is in `package.json` dependencies
- Verify Prisma schema is valid

## Support

For more information:
- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Prisma Vercel Guide](https://www.prisma.io/docs/orm/deployment/deployment-guides/deploying-to-vercel)
- [SQLite Limitations on Vercel](https://vercel.com/docs/storage/vercel-kv/limits)
