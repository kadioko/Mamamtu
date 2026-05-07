import { NextResponse } from 'next/server';
import { AuditAction, AppointmentStatus, AppointmentType, RecordType, UserRole, type Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { csvExporter } from '@/lib/export/csvExporter';
import { pdfExporter } from '@/lib/export/pdfExporter';
import { withAuth, type AuthenticatedRequest } from '@/lib/apiAuth';
import { writeAuditLog } from '@/lib/audit';

const dateRangeSchema = z.object({
  start: z.string().datetime().or(z.string().date()),
  end: z.string().datetime().or(z.string().date()),
});

const exportFiltersSchema = z.object({
  patientId: z.string().uuid().optional(),
  gender: z.array(z.enum(['MALE', 'FEMALE', 'OTHER'])).optional(),
  bloodType: z.array(z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])).optional(),
  includeInactive: z.boolean().optional(),
  ageRange: z.object({
    min: z.number().int().min(0),
    max: z.number().int().min(0),
  }).optional(),
  dateRange: dateRangeSchema.optional(),
  status: z.array(z.nativeEnum(AppointmentStatus)).optional(),
  type: z.array(z.union([z.nativeEnum(AppointmentType), z.nativeEnum(RecordType)])).optional(),
}).optional();

const exportSchema = z.object({
  type: z.enum(['patients', 'appointments', 'medical-records', 'medical-record']),
  format: z.enum(['csv', 'pdf']),
  patientId: z.string().uuid().optional(),
  recordId: z.string().uuid().optional(),
  filters: exportFiltersSchema,
});

type ExportRequest = z.infer<typeof exportSchema>;
type ExportFilters = NonNullable<ExportRequest['filters']>;

function exportResponse(content: BodyInit, filename: string, format: ExportRequest['format']) {
  return new NextResponse(content, {
    headers: {
      'Content-Type': format === 'csv' ? 'text/csv' : 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.${format}"`,
      'Cache-Control': 'no-store',
    },
  });
}

async function auditExport(request: AuthenticatedRequest, payload: ExportRequest, rowCount: number) {
  await writeAuditLog({
    request,
    action: AuditAction.AUTH_EVENT,
    resource: 'Export',
    resourceId: payload.recordId ?? payload.patientId ?? null,
    patientId: payload.patientId ?? null,
    metadata: {
      type: payload.type,
      format: payload.format,
      rowCount,
      filters: payload.filters ?? {},
    },
  });
}

async function handlePost(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const validatedData = exportSchema.parse(body);
    const today = new Date().toISOString().split('T')[0];

    switch (validatedData.type) {
      case 'patients': {
        const data = await getPatientsData(validatedData.filters);
        const filename = `patients-${today}`;
        const content = validatedData.format === 'csv'
          ? csvExporter.exportPatientsToCSV(data)
          : pdfExporter.generatePatientReportPDF(data);
        await auditExport(request, validatedData, data.length);
        return exportResponse(content, filename, validatedData.format);
      }

      case 'appointments': {
        const data = await getAppointmentsData(validatedData.filters);
        const filename = `appointments-${today}`;
        const content = validatedData.format === 'csv'
          ? csvExporter.exportAppointmentsToCSV(data)
          : pdfExporter.generateAppointmentReportPDF(data);
        await auditExport(request, validatedData, data.length);
        return exportResponse(content, filename, validatedData.format);
      }

      case 'medical-records': {
        const data = await getMedicalRecordsData(validatedData.filters);
        const filename = `medical-records-${today}`;
        const content = validatedData.format === 'csv'
          ? csvExporter.exportMedicalRecordsToCSV(data)
          : pdfExporter.generatePatientReportPDF(data);
        await auditExport(request, validatedData, data.length);
        return exportResponse(content, filename, validatedData.format);
      }

      case 'medical-record': {
        if (!validatedData.recordId) {
          return NextResponse.json(
            { error: 'Record ID is required for single medical record export' },
            { status: 400 }
          );
        }

        const record = await prisma.medicalRecord.findUnique({
          where: { id: validatedData.recordId },
          include: { patient: true },
        });

        if (!record) {
          return NextResponse.json(
            { error: 'Medical record not found' },
            { status: 404 }
          );
        }

        const filename = `medical-record-${record.patient.patientId}-${today}`;
        const content = validatedData.format === 'csv'
          ? csvExporter.exportMedicalRecordsToCSV([record])
          : pdfExporter.generateMedicalRecordPDF(record, record.patient);
        await auditExport(request, { ...validatedData, patientId: record.patientId }, 1);
        return exportResponse(content, filename, validatedData.format);
      }
    }
  } catch (error) {
    console.error('Export error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

async function getPatientsData(filters: ExportFilters = {}) {
  const where: Prisma.PatientWhereInput = {};

  if (filters.patientId) where.id = filters.patientId;
  if (filters.gender?.length) where.gender = { in: filters.gender };
  if (filters.bloodType?.length) where.bloodType = { in: filters.bloodType };

  if (filters.ageRange) {
    const now = new Date();
    const minDate = new Date(now.getFullYear() - filters.ageRange.max, now.getMonth(), now.getDate());
    const maxDate = new Date(now.getFullYear() - filters.ageRange.min, now.getMonth(), now.getDate());
    where.dateOfBirth = { gte: minDate, lte: maxDate };
  }

  if (!filters.includeInactive) where.isActive = true;

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return patients.map(patient => ({
    ...patient,
    allergies: patient.allergies || [],
  }));
}

async function getAppointmentsData(filters: ExportFilters = {}) {
  const where: Prisma.AppointmentWhereInput = {};

  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.dateRange) {
    where.startTime = {
      gte: new Date(filters.dateRange.start),
      lte: new Date(filters.dateRange.end),
    };
  }
  if (filters.status?.length) where.status = { in: filters.status };
  if (filters.type?.length) {
    where.type = { in: filters.type.filter((type): type is AppointmentType => Object.values(AppointmentType).includes(type as AppointmentType)) };
  }

  return prisma.appointment.findMany({
    where,
    orderBy: { startTime: 'desc' },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          patientId: true,
        },
      },
    },
  });
}

async function getMedicalRecordsData(filters: ExportFilters = {}) {
  const where: Prisma.MedicalRecordWhereInput = {};

  if (filters.patientId) where.patientId = filters.patientId;
  if (filters.dateRange) {
    where.createdAt = {
      gte: new Date(filters.dateRange.start),
      lte: new Date(filters.dateRange.end),
    };
  }
  if (filters.type?.length) {
    where.recordType = { in: filters.type.filter((type): type is RecordType => Object.values(RecordType).includes(type as RecordType)) };
  }

  return prisma.medicalRecord.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          patientId: true,
        },
      },
    },
  });
}

export const POST = withAuth(handlePost, {
  roles: [UserRole.ADMIN, UserRole.HEALTHCARE_PROVIDER],
  requireEmailVerification: true,
});
