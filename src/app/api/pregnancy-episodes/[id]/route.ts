import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  status: z.enum(['ACTIVE', 'DELIVERED', 'LOST_TO_FOLLOW_UP', 'MISCARRIAGE', 'REFERRED']).optional(),
  estimatedDueDate: z.string().optional().nullable(),
  lastMenstrualPeriod: z.string().optional().nullable(),
  gravida: z.coerce.number().int().min(0).optional().nullable(),
  para: z.coerce.number().int().min(0).optional().nullable(),
  riskLevel: z.coerce.number().int().min(0).max(5).optional(),
  highRiskFlags: z.array(z.string()).optional(),
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
  const episode = await prisma.pregnancyEpisode.update({
    where: { id },
    data: {
      ...data,
      estimatedDueDate: data.estimatedDueDate ? new Date(data.estimatedDueDate) : data.estimatedDueDate === null ? null : undefined,
      lastMenstrualPeriod: data.lastMenstrualPeriod ? new Date(data.lastMenstrualPeriod) : data.lastMenstrualPeriod === null ? null : undefined,
    },
  });
  return NextResponse.json(episode);
}
