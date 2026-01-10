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

// GET /api/patients
// Get all patients with pagination
export const GET = withAuth(
  async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { patientId: { contains: search } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.patient.count({
        where: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { patientId: { contains: search } },
          ],
        },
      }),
    ]);

    return NextResponse.json({
      data: patients.map(normalizePatient),
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
},
{ roles: ['ADMIN', 'HEALTHCARE_PROVIDER'], requireEmailVerification: true }
);

// POST /api/patients
// Create a new patient
export const POST = withAuth(
  async (request) => {
  try {
    const data = await request.json();
    
    // Generate patient ID
    const lastPatient = await prisma.patient.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    
    const nextId = lastPatient 
      ? `PAT-${String(parseInt(lastPatient.patientId.split('-')[1]) + 1).padStart(4, '0')}`
      : 'PAT-0001';

    const patient = await prisma.patient.create({
      data: {
        ...data,
        allergies: serializeStringArray(data?.allergies),
        patientId: nextId,
      },
    });

    return NextResponse.json(normalizePatient(patient), { status: 201 });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient' },
      { status: 500 }
    );
  }
},
{ roles: ['ADMIN', 'HEALTHCARE_PROVIDER'], requireEmailVerification: true }
);
