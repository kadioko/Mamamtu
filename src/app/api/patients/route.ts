import { NextResponse } from 'next/server';
import type { Patient as PrismaPatient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';
import { 
  createPatientSchema, 
  patientQuerySchema,
  withValidation
} from '@/lib/validation';

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

const serializeStringArray = (value: unknown): string[] | undefined => {
  const parsed = parseStringArray(value);
  return parsed.length === 0 ? undefined : parsed;
};

type PatientApi = Omit<PrismaPatient, 'allergies'> & { allergies: string[] };

const normalizePatient = (patient: PrismaPatient): PatientApi => ({
  ...patient,
  allergies: parseStringArray(patient.allergies),
});

// GET /api/patients
// Get all patients with pagination
export const GET = withAuth(
  withValidation(patientQuerySchema, 'query')(
    async (request, context, query) => {
      try {
        const { page, limit, search, includeInactive, gender, bloodType } = query;
        const skip = (page - 1) * limit;

        // Build where clause
        const where: Record<string, unknown> = {};
        
        if (!includeInactive) {
          where.isActive = true;
        }
        
        if (search) {
          where.OR = [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { patientId: { contains: search, mode: 'insensitive' as const } },
          ];
        }
        
        if (gender) {
          where.gender = gender;
        }
        
        if (bloodType) {
          where.bloodType = bloodType;
        }

        const [patients, total] = await Promise.all([
          prisma.patient.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
          }),
          prisma.patient.count({ where }),
        ]);

        return NextResponse.json({
          data: patients.map(normalizePatient),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
      } catch (error) {
        console.error('Failed to fetch patients:', error);
        return NextResponse.json(
          { error: 'Failed to fetch patients' },
          { status: 500 }
        );
      }
    }
  )
);

// POST /api/patients
// Create a new patient
export const POST = withAuth(
  withValidation(createPatientSchema, 'body')(
    async (request, context, data) => {
      try {
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
            isActive: true,
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
    }
  ),
  { roles: ['ADMIN', 'HEALTHCARE_PROVIDER'], requireEmailVerification: true }
);
