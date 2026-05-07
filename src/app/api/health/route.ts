import { NextResponse } from 'next/server';
import { getProductionHealthReport } from '@/lib/productionHealth';

export async function GET() {
  const report = await getProductionHealthReport();
  const memUsage = process.memoryUsage();
  const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

  const healthcheck = {
    status: report.status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: report.checks.find((check) => check.name === 'Database connectivity')?.status === 'error' ? 'error' : 'ok',
      readiness: report.checks.map((check) => ({
        name: check.name,
        status: check.status,
        detail: check.detail,
      })),
      memory: memUsedMB / memTotalMB < 0.9 ? 'ok' : 'warning',
    },
  };

  const statusCode = healthcheck.status === 'error' ? 503 : 200;
  
  return NextResponse.json(healthcheck, { status: statusCode });
}
