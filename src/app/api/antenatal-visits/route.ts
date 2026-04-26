import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  pregnancyEpisodeId: z.string().uuid(),
  visitDate: z.string(),
  gestationalAgeWeeks: z.coerce.number().int().min(4).max(45).optional(),
  bloodPressure: z.string().optional(),
  weight: z.coerce.number().optional(),
  fundalHeight: z.coerce.number().optional(),
  fetalHeartRate: z.coerce.number().int().optional(),
  dangerSigns: z.array(z.string()).default([]),
  interventions: z.array(z.string()).default([]),
  nextVisitDate: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => new Date(data.visitDate) <= new Date(), {
  message: 'Visit date cannot be in the future',
  path: ['visitDate'],
}).refine((data) => {
  if (!data.nextVisitDate) return true;
  return new Date(data.nextVisitDate) > new Date(data.visitDate);
}, {
  message: 'Next visit date must be after visit date',
  path: ['nextVisitDate'],
});

async function canManage() {
  const session = await auth();
  return session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role) ? session : null;
}

export async function POST(request: NextRequest) {
  const session = await canManage();
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data = schema.parse(await request.json());
  const visit = await prisma.antenatalVisit.create({
    data: {
      ...data,
      visitDate: new Date(data.visitDate),
      nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : undefined,
      recordedBy: session.user.name || session.user.email,
    },
  });
  return NextResponse.json(visit, { status: 201 });
}
