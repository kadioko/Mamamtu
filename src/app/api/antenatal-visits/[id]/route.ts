import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  visitDate: z.string().optional(),
  gestationalAgeWeeks: z.coerce.number().int().min(4).max(45).optional().nullable(),
  bloodPressure: z.string().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  fundalHeight: z.coerce.number().optional().nullable(),
  fetalHeartRate: z.coerce.number().int().optional().nullable(),
  dangerSigns: z.array(z.string()).optional(),
  interventions: z.array(z.string()).optional(),
  nextVisitDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

async function canManage() {
  const session = await auth();
  return session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await canManage())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await params;
  const data = schema.parse(await request.json());
  const visit = await prisma.antenatalVisit.update({
    where: { id },
    data: {
      ...data,
      visitDate: data.visitDate ? new Date(data.visitDate) : undefined,
      nextVisitDate: data.nextVisitDate ? new Date(data.nextVisitDate) : data.nextVisitDate === null ? null : undefined,
    },
  });
  return NextResponse.json(visit);
}
