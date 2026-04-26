import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  patientId: z.string().uuid(),
  status: z.enum(['ACTIVE', 'DELIVERED', 'LOST_TO_FOLLOW_UP', 'MISCARRIAGE', 'REFERRED']).default('ACTIVE'),
  estimatedDueDate: z.string().optional(),
  lastMenstrualPeriod: z.string().optional(),
  gravida: z.coerce.number().int().min(0).optional(),
  para: z.coerce.number().int().min(0).optional(),
  riskLevel: z.coerce.number().int().min(0).max(5).default(0),
  highRiskFlags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

async function canManage() {
  const session = await auth();
  return session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role);
}

export async function POST(request: NextRequest) {
  if (!(await canManage())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const data = schema.parse(await request.json());
  const episode = await prisma.pregnancyEpisode.create({
    data: {
      ...data,
      estimatedDueDate: data.estimatedDueDate ? new Date(data.estimatedDueDate) : undefined,
      lastMenstrualPeriod: data.lastMenstrualPeriod ? new Date(data.lastMenstrualPeriod) : undefined,
    },
  });
  return NextResponse.json(episode, { status: 201 });
}
