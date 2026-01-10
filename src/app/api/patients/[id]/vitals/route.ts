import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

type VitalsData = {
  temperature?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  gestationalAge?: number;
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

type MedicalRecordRow = Record<string, unknown>;

type MedicalRecordModel = {
  findMany: (args: unknown) => Promise<MedicalRecordRow[]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const medicalRecordModel = (prisma as unknown as { medicalRecord: MedicalRecordModel })
  .medicalRecord;

// GET /api/patients/[id]/vitals - Get vitals history for a patient
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
    const limit = parseInt(searchParams.get('limit') || '20');

    const { id: patientId } = await params;

    // Check if patient exists
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Fetch medical records that contain vitals
    const records = await medicalRecordModel.findMany({
      where: {
        patientId,
        vitals: { not: null }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        vitals: true,
        createdAt: true,
        recordType: true,
        title: true
      }
    });

    // Parse vitals from each record
    const vitalsHistory = records
      .map(record => {
        const vitals = parseJsonObject<VitalsData>(record.vitals);
        if (!vitals) return null;

        return {
          id: record.id,
          vitals,
          recordedAt: record.createdAt,
          recordType: record.recordType,
          title: record.title
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Calculate latest vitals
    const latestVitals = vitalsHistory.length > 0 ? vitalsHistory[0].vitals : null;

    return NextResponse.json({
      latest: latestVitals,
      history: vitalsHistory,
      total: vitalsHistory.length
    });
  } catch (error) {
    console.error('Error fetching vitals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
