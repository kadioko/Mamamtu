import { NextRequest, NextResponse } from 'next/server';
import { AuditAction } from '@prisma/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';

const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST']),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Only admins can create staff accounts' }, { status: 403 });
  }

  const data = userSchema.parse(await request.json());
  const email = data.email.trim().toLowerCase();
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: data.name,
      role: data.role,
      hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
    create: {
      name: data.name,
      email,
      role: data.role,
      hashedPassword,
      isActive: true,
      emailVerified: new Date(),
    },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  await writeAuditLog({
    request,
    userId: session.user.id,
    action: AuditAction.AUTH_EVENT,
    resource: 'StaffUser',
    resourceId: user.id,
    metadata: { adminAction: 'create-or-reactivate-staff-account', targetEmail: user.email, role: user.role },
  });

  return NextResponse.json(user, { status: 201 });
}
