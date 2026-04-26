import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  newbornRecordId: z.string().uuid(),
  vaccineName: z.string().min(1),
  doseLabel: z.string().optional(),
  administeredAt: z.string(),
  nextDueAt: z.string().optional(),
  facility: z.string().optional(),
  batchNumber: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => new Date(data.administeredAt) <= new Date(), {
  message: 'Administered date cannot be in the future',
  path: ['administeredAt'],
}).refine((data) => {
  if (!data.nextDueAt) return true;
  return new Date(data.nextDueAt) > new Date(data.administeredAt);
}, {
  message: 'Next due date must be after administered date',
  path: ['nextDueAt'],
});

async function canManage() {
  const session = await auth();
  return session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role);
}

export async function POST(request: NextRequest) {
  if (!(await canManage())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data = schema.parse(await request.json());
  const immunization = await prisma.immunization.create({
    data: {
      ...data,
      administeredAt: new Date(data.administeredAt),
      nextDueAt: data.nextDueAt ? new Date(data.nextDueAt) : undefined,
    },
  });
  return NextResponse.json(immunization, { status: 201 });
}
