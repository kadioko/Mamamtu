import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/ping
 *
 * Lightweight keepalive endpoint. Runs a minimal DB query so the
 * Supabase project stays active and does not auto-pause on the free tier.
 *
 * Called by:
 *  - Vercel cron job (vercel.json) every 3 days
 *  - UptimeRobot monitor every 5 minutes (external)
 *
 * Returns 200 { ok: true } when the database is reachable.
 * Returns 503 { ok: false } when the database is unreachable.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json(
      { ok: false, ts: new Date().toISOString() },
      { status: 503 },
    );
  }
}
