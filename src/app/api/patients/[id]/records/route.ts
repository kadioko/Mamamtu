import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { MedicalRecordFormData } from '@/types/patient';
import { withAuth } from '@/lib/apiAuth';

const createMedicalRecordSchema = z.object({
  recordType: z.enum(['CONSULTATION', 'LAB_RESULT', 'PRESCRIPTION', 'PROCEDURE', 'ADMISSION', 'DISCHARGE', 'VACCINATION', 'PRENATAL_VISIT', 'APISSCOMA', 'GENERAL']),
  title: z.string().min(1),
  description: z.string().optional(),
  diagnosis: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  treatment: z.string().optional(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string().optional(),
    instructions: z.string().optional()
  })).optional(),
  labResults: z.array(z.object({
    testName: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    referenceRange: z.string().optional(),
    status: z.enum(['NORMAL', 'HIGH', 'LOW', 'CRITICAL']),
    notes: z.string().optional()
  })).optional(),
  vitals: z.object({
    temperature: z.number().optional(),
    bloodPressureSystolic: z.number().optional(),
    bloodPressureDiastolic: z.number().optional(),
    heartRate: z.number().optional(),
    respiratoryRate: z.number().optional(),
    oxygenSaturation: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    bmi: z.number().optional(),
    gestationalAge: z.number().optional()
  }).optional(),
  healthcareProvider: z.string().optional(),
  facility: z.string().optional(),
  notes: z.string().optional(),
  appointmentId: z.string().optional()
});

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

const parseJsonArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const parseJsonObject = <T extends object>(value: unknown): T | undefined => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const keys = Object.keys(value as Record<string, unknown>);
    if (keys.length === 0) return undefined;
    return value as T;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === '{}' || trimmed === 'null') return undefined;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const keys = Object.keys(parsed as Record<string, unknown>);
        if (keys.length === 0) return undefined;
        return parsed as T;
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const toJsonString = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

type MedicalRecordRow = Record<string, unknown>;

type MedicalRecordModel = {
  findMany: (args: unknown) => Promise<MedicalRecordRow[]>;
  count: (args: unknown) => Promise<number>;
  create: (args: unknown) => Promise<MedicalRecordRow>;
};

// Temporary workaround for Prisma model that may not be properly generated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const medicalRecordModel = (prisma as unknown as { medicalRecord: MedicalRecordModel })
  .medicalRecord;

const normalizeMedicalRecord = (record: MedicalRecordRow) => ({
  ...record,
  symptoms: parseStringArray(record['symptoms']),
  medications: parseJsonArray(record['medications']),
  labResults: parseJsonArray(record['labResults']),
  vitals: parseJsonObject(record['vitals']),
  attachments: parseJsonArray(record['attachments']),
});

// GET /api/patients/[id]/records - Get medical records for a patient
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const recordType = searchParams.get('recordType');

    const { id: patientId } = await params;

    // Check if patient exists and user has permission
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const where = {
      patientId,
      ...(recordType && { recordType })
    };

    const [records, total] = await Promise.all([
      medicalRecordModel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          appointment: {
            select: {
              title: true,
              startTime: true
            }
          }
        }
      }),
      medicalRecordModel.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data: records.map(normalizeMedicalRecord),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/patients/[id]/records - Create a new medical record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: patientId } = await params;
    const body: MedicalRecordFormData = await request.json();

    // Validate request body
    const validatedData = createMedicalRecordSchema.parse(body);

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Create medical record
    const record = await medicalRecordModel.create({
      data: {
        ...validatedData,
        patientId,
        recordedBy: session.user.id,
        symptoms: toJsonString(validatedData.symptoms),
        medications: toJsonString(validatedData.medications),
        labResults: toJsonString(validatedData.labResults),
        vitals: toJsonString(validatedData.vitals),
        attachments: JSON.stringify([]),
      }
    });

    return NextResponse.json(normalizeMedicalRecord(record), { status: 201 });
  } catch (error) {
    console.error('Error creating medical record:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
