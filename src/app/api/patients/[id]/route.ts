import { NextResponse } from 'next/server';
import type { Patient as PrismaPatient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';

const parseStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === 'string')
          .map(item => item.trim())
          .filter(Boolean);
      }
    } catch {}

    return trimmed
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

const serializeStringArray = (value: unknown): string | null => {
  const parsed = parseStringArray(value);
  if (parsed.length === 0) return null;
  return parsed.join(', ');
};

type PatientApi = Omit<PrismaPatient, 'allergies'> & { allergies: string[] };

const normalizePatient = (patient: PrismaPatient): PatientApi => ({
  ...patient,
  allergies: parseStringArray(patient.allergies),
});

// GET /api/patients/[id]
// Get a single patient by ID
export const GET = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const patient = await prisma.patient.findUnique({
      where: { id },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(normalizePatient(patient));
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patient' },
      { status: 500 }
    );
  }
},
{ roles: ['ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT'], requireEmailVerification: true }
);

// PUT /api/patients/[id]
// Update a patient
export const PUT = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const data = await request.json();
    const { id } = await params;

    // Convert date strings to Date objects for Prisma
    if (data.dateOfBirth) {
      data.dateOfBirth = new Date(data.dateOfBirth);
    }

    if (data && Object.prototype.hasOwnProperty.call(data, 'allergies')) {
      data.allergies = serializeStringArray(data.allergies);
    }

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(normalizePatient(patient));
  } catch (error) {
    console.error('Error updating patient:', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'A patient with this email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update patient' },
      { status: 500 }
    );
  }
},
{ roles: ['ADMIN', 'HEALTHCARE_PROVIDER'], requireEmailVerification: true }
);

// DELETE /api/patients/[id]
// Delete a patient
export const DELETE = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return NextResponse.json(
      { error: 'Failed to delete patient' },
      { status: 500 }
    );
  }
},
{ roles: ['ADMIN'], requireEmailVerification: true }
);
