import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const healthcheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      memory: 'unknown',
    },
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database = 'ok';
  } catch {
    healthcheck.checks.database = 'error';
    healthcheck.status = 'degraded';
  }

  // Check memory usage
  const memUsage = process.memoryUsage();
  const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  
  if (memUsedMB / memTotalMB < 0.9) {
    healthcheck.checks.memory = 'ok';
  } else {
    healthcheck.checks.memory = 'warning';
    if (healthcheck.status === 'ok') {
      healthcheck.status = 'degraded';
    }
  }

  const statusCode = healthcheck.status === 'ok' ? 200 : 503;
  
  return NextResponse.json(healthcheck, { status: statusCode });
}
