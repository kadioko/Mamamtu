import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  motherPatientId: z.string().uuid().optional().nullable(),
  pregnancyEpisodeId: z.string().uuid().optional().nullable(),
  name: z.string().optional().nullable(),
  dateOfBirth: z.string().optional(),
  sex: z.string().optional().nullable(),
  birthWeight: z.coerce.number().optional().nullable(),
  apgarOneMinute: z.coerce.number().int().optional().nullable(),
  apgarFiveMinutes: z.coerce.number().int().optional().nullable(),
  deliveryFacility: z.string().optional().nullable(),
  complications: z.array(z.string()).optional(),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  if (!data.dateOfBirth) return true;
  return new Date(data.dateOfBirth) <= new Date();
}, {
  message: 'Date of birth cannot be in the future',
  path: ['dateOfBirth'],
}).refine((data) => data.apgarOneMinute == null || (data.apgarOneMinute >= 0 && data.apgarOneMinute <= 10), {
  message: 'APGAR score must be between 0 and 10',
  path: ['apgarOneMinute'],
}).refine((data) => data.apgarFiveMinutes == null || (data.apgarFiveMinutes >= 0 && data.apgarFiveMinutes <= 10), {
  message: 'APGAR score must be between 0 and 10',
  path: ['apgarFiveMinutes'],
});

async function canManage() {
  const session = await auth();
  return session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canManage())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const data = schema.parse(await request.json());
  const record = await prisma.newbornRecord.update({
    where: { id },
    data: { ...data, dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined },
  });
  return NextResponse.json(record);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can delete newborn records' }, { status: 403 });
  const { id } = await params;
  await prisma.newbornRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
