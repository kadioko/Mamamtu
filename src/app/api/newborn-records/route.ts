import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  motherPatientId: z.string().uuid().optional(),
  pregnancyEpisodeId: z.string().uuid().optional(),
  name: z.string().optional(),
  dateOfBirth: z.string(),
  sex: z.string().optional(),
  birthWeight: z.coerce.number().optional(),
  apgarOneMinute: z.coerce.number().int().optional(),
  apgarFiveMinutes: z.coerce.number().int().optional(),
  deliveryFacility: z.string().optional(),
  complications: z.array(z.string()).default([]),
  notes: z.string().optional(),
}).refine((data) => new Date(data.dateOfBirth) <= new Date(), {
  message: 'Date of birth cannot be in the future',
  path: ['dateOfBirth'],
}).refine((data) => data.apgarOneMinute === undefined || (data.apgarOneMinute >= 0 && data.apgarOneMinute <= 10), {
  message: 'APGAR score must be between 0 and 10',
  path: ['apgarOneMinute'],
}).refine((data) => data.apgarFiveMinutes === undefined || (data.apgarFiveMinutes >= 0 && data.apgarFiveMinutes <= 10), {
  message: 'APGAR score must be between 0 and 10',
  path: ['apgarFiveMinutes'],
});

async function canManage() {
  const session = await auth();
  return session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role);
}

export async function POST(request: NextRequest) {
  if (!(await canManage())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data = schema.parse(await request.json());
  const record = await prisma.newbornRecord.create({
    data: { ...data, dateOfBirth: new Date(data.dateOfBirth) },
  });
  return NextResponse.json(record, { status: 201 });
}
