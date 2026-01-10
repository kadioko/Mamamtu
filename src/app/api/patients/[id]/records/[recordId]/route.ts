import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';
import { z } from 'zod';

const updateMedicalRecordSchema = z.object({
  recordType: z.enum(['CONSULTATION', 'LAB_RESULT', 'PRESCRIPTION', 'PROCEDURE', 'ADMISSION', 'DISCHARGE', 'VACCINATION', 'PRENATAL_VISIT', 'APISSCOMA', 'GENERAL']).optional(),
  title: z.string().min(1).optional(),
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
});

const toJsonString = (value: unknown): string | null => {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

type MedicalRecordModel = {
  findUnique: (args: { where: { id: string }; include?: Record<string, unknown> }) => Promise<Record<string, unknown> | null>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<Record<string, unknown>>;
  delete: (args: { where: { id: string } }) => Promise<Record<string, unknown>>;
};

const medicalRecordModel = (prisma as unknown as { medicalRecord: MedicalRecordModel })
  .medicalRecord;

// GET /api/patients/[id]/records/[recordId] - Get single medical record
export const GET = withAuth(
  async (request, { params }: { params: Promise<{ id: string; recordId: string }> }) => {
    try {
      const { id: patientId, recordId } = await params;

      const record = await medicalRecordModel.findUnique({
        where: { id: recordId },
        include: {
          appointment: {
            select: {
              title: true,
              startTime: true
            }
          }
        }
      });

      if (!record) {
        return NextResponse.json(
          { error: 'Medical record not found' },
          { status: 404 }
        );
      }

      if (record.patientId !== patientId) {
        return NextResponse.json(
          { error: 'Record does not belong to this patient' },
          { status: 400 }
        );
      }

      return NextResponse.json(record);
    } catch (error) {
      console.error('Error fetching medical record:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  { roles: ['ADMIN', 'HEALTHCARE_PROVIDER'], requireEmailVerification: true }
);

// PUT /api/patients/[id]/records/[recordId] - Update medical record
export const PUT = withAuth(
  async (request, { params }: { params: Promise<{ id: string; recordId: string }> }) => {
    try {
      const { id: patientId, recordId } = await params;
      const body = await request.json();

      // Validate request body
      const validatedData = updateMedicalRecordSchema.parse(body);

      // Check if record exists and belongs to patient
      const existingRecord = await medicalRecordModel.findUnique({
        where: { id: recordId }
      });

      if (!existingRecord) {
        return NextResponse.json(
          { error: 'Medical record not found' },
          { status: 404 }
        );
      }

      if (existingRecord.patientId !== patientId) {
        return NextResponse.json(
          { error: 'Record does not belong to this patient' },
          { status: 400 }
        );
      }

      // Update medical record
      const updateData: Record<string, unknown> = {};
      
      if (validatedData.recordType) updateData.recordType = validatedData.recordType;
      if (validatedData.title) updateData.title = validatedData.title;
      if (validatedData.description !== undefined) updateData.description = validatedData.description;
      if (validatedData.diagnosis !== undefined) updateData.diagnosis = validatedData.diagnosis;
      if (validatedData.treatment !== undefined) updateData.treatment = validatedData.treatment;
      if (validatedData.healthcareProvider !== undefined) updateData.healthcareProvider = validatedData.healthcareProvider;
      if (validatedData.facility !== undefined) updateData.facility = validatedData.facility;
      if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
      
      if (validatedData.symptoms !== undefined) {
        updateData.symptoms = toJsonString(validatedData.symptoms);
      }
      if (validatedData.medications !== undefined) {
        updateData.medications = toJsonString(validatedData.medications);
      }
      if (validatedData.labResults !== undefined) {
        updateData.labResults = toJsonString(validatedData.labResults);
      }
      if (validatedData.vitals !== undefined) {
        updateData.vitals = toJsonString(validatedData.vitals);
      }

      const record = await medicalRecordModel.update({
        where: { id: recordId },
        data: updateData
      });

      return NextResponse.json(record);
    } catch (error) {
      console.error('Error updating medical record:', error);

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
  },
  { roles: ['ADMIN', 'HEALTHCARE_PROVIDER'], requireEmailVerification: true }
);

// DELETE /api/patients/[id]/records/[recordId] - Delete medical record
export const DELETE = withAuth(
  async (request, { params }: { params: Promise<{ id: string; recordId: string }> }) => {
    try {
      const { id: patientId, recordId } = await params;

      // Check if record exists and belongs to patient
      const existingRecord = await medicalRecordModel.findUnique({
        where: { id: recordId }
      });

      if (!existingRecord) {
        return NextResponse.json(
          { error: 'Medical record not found' },
          { status: 404 }
        );
      }

      if (existingRecord.patientId !== patientId) {
        return NextResponse.json(
          { error: 'Record does not belong to this patient' },
          { status: 400 }
        );
      }

      await medicalRecordModel.delete({
        where: { id: recordId }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting medical record:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  },
  { roles: ['ADMIN'], requireEmailVerification: true }
);
