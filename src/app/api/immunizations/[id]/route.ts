import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  vaccineName: z.string().min(1).optional(),
  doseLabel: z.string().optional().nullable(),
  administeredAt: z.string().optional(),
  nextDueAt: z.string().optional().nullable(),
  facility: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  if (!data.administeredAt) return true;
  return new Date(data.administeredAt) <= new Date();
}, {
  message: 'Administered date cannot be in the future',
  path: ['administeredAt'],
}).refine((data) => {
  if (!data.administeredAt || !data.nextDueAt) return true;
  return new Date(data.nextDueAt) > new Date(data.administeredAt);
}, {
  message: 'Next due date must be after administered date',
  path: ['nextDueAt'],
});

async function canManage() {
  const session = await auth();
  return session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canManage())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const data = schema.parse(await request.json());
  const immunization = await prisma.immunization.update({
    where: { id },
    data: {
      ...data,
      administeredAt: data.administeredAt ? new Date(data.administeredAt) : undefined,
      nextDueAt: data.nextDueAt ? new Date(data.nextDueAt) : data.nextDueAt === null ? null : undefined,
    },
  });
  return NextResponse.json(immunization);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can delete immunizations' }, { status: 403 });
  const { id } = await params;
  await prisma.immunization.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
