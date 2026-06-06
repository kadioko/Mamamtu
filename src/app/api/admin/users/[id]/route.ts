import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const updateUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  role: z.enum(['ADMIN', 'HEALTHCARE_PROVIDER', 'RECEPTIONIST']),
  isActive: z.boolean(),
  password: z.string().min(8).optional().or(z.literal('')),
});

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return {
      session,
      response: NextResponse.json({ error: 'Only admins can manage staff accounts' }, { status: 403 }),
    };
  }

  return { session, response: null };
}

async function isLastActiveAdmin(userId: string) {
  const activeAdmins = await prisma.user.count({
    where: {
      role: 'ADMIN',
      isActive: true,
      id: { not: userId },
    },
  });

  return activeAdmins === 0;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await assertAdmin();
  if (response) return response;

  const { id } = await params;
  const data = updateUserSchema.parse(await request.json());
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true },
  });

  if (!target) {
    return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
  }

  const isSelf = session?.user?.id === id;
  if (isSelf && (data.role !== 'ADMIN' || !data.isActive)) {
    return NextResponse.json(
      { error: 'You cannot remove your own admin access or deactivate your own account' },
      { status: 400 },
    );
  }

  if (target.role === 'ADMIN' && (data.role !== 'ADMIN' || !data.isActive) && await isLastActiveAdmin(id)) {
    return NextResponse.json(
      { error: 'At least one active admin account is required' },
      { status: 400 },
    );
  }

  const updateData: {
    name: string;
    email: string;
    role: 'ADMIN' | 'HEALTHCARE_PROVIDER' | 'RECEPTIONIST';
    isActive: boolean;
    emailVerified: Date;
    hashedPassword?: string;
  } = {
    name: data.name,
    email: data.email.toLowerCase(),
    role: data.role,
    isActive: data.isActive,
    emailVerified: new Date(),
  };

  if (data.password) {
    updateData.hashedPassword = await bcrypt.hash(data.password, 10);
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, name: true, email: true, role: true, isActive: true, emailVerified: true, lastLogin: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Another user already has that email address' }, { status: 409 });
    }

    console.error('Error updating staff account:', error);
    return NextResponse.json({ error: 'Failed to update staff account' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, response } = await assertAdmin();
  if (response) return response;

  const { id } = await params;
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });

  if (!target) {
    return NextResponse.json({ error: 'Staff account not found' }, { status: 404 });
  }

  if (session?.user?.id === id) {
    return NextResponse.json(
      { error: 'You cannot deactivate your own account' },
      { status: 400 },
    );
  }

  if (target.role === 'ADMIN' && await isLastActiveAdmin(id)) {
    return NextResponse.json(
      { error: 'At least one active admin account is required' },
      { status: 400 },
    );
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isActive: false },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}
