import { execFile } from 'child_process';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import { AuditAction } from '@prisma/client';
import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit';

const execFileAsync = promisify(execFile);

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can reset demo data' }, { status: 403 });
  }

  try {
    const { stdout, stderr } = await execFileAsync(
      process.execPath,
      ['scripts/seed-deck-demo-metrics.js'],
      {
        cwd: process.cwd(),
        timeout: 120000,
        maxBuffer: 1024 * 1024,
        env: process.env,
      },
    );

    await writeAuditLog({
      request,
      userId: session.user.id,
      action: AuditAction.AUTH_EVENT,
      resource: 'DemoData',
      resourceId: 'deck-demo',
      metadata: {
        adminAction: 'reset-deck-demo-data',
        stdout: stdout.slice(-2000),
        stderr: stderr.slice(-2000),
      },
    });

    return NextResponse.json({
      message: 'Demo data reset completed',
      output: stdout.slice(-2000),
    });
  } catch (error) {
    console.error('Demo data reset failed:', error);
    return NextResponse.json(
      {
        error: 'Demo data reset failed',
        detail: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
