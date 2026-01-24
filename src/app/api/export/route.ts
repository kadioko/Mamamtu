import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';
import { csvExporter } from '@/lib/export/csvExporter';
import { pdfExporter } from '@/lib/export/pdfExporter';
import { z } from 'zod';

const exportSchema = z.object({
  type: z.enum(['patients', 'appointments', 'medical-records', 'medical-record']),
  format: z.enum(['csv', 'pdf']),
  patientId: z.string().uuid().optional(),
  recordId: z.string().uuid().optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = exportSchema.parse(body);

    let data;
    let filename;
    let content;

    switch (validatedData.type) {
      case 'patients':
        data = await getPatientsData(validatedData.filters);
        filename = `patients-${new Date().toISOString().split('T')[0]}`;
        
        if (validatedData.format === 'csv') {
          content = csvExporter.exportPatientsToCSV(data);
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${filename}.csv"`,
            },
          });
        } else {
          content = pdfExporter.generatePatientReportPDF(data);
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}.pdf"`,
            },
          });
        }

      case 'appointments':
        data = await getAppointmentsData(validatedData.filters);
        filename = `appointments-${new Date().toISOString().split('T')[0]}`;
        
        if (validatedData.format === 'csv') {
          content = csvExporter.exportAppointmentsToCSV(data);
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${filename}.csv"`,
            },
          });
        } else {
          content = pdfExporter.generateAppointmentReportPDF(data);
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}.pdf"`,
            },
          });
        }

      case 'medical-records':
        data = await getMedicalRecordsData(validatedData.filters);
        filename = `medical-records-${new Date().toISOString().split('T')[0]}`;
        
        if (validatedData.format === 'csv') {
          content = csvExporter.exportMedicalRecordsToCSV(data);
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${filename}.csv"`,
            },
          });
        } else {
          content = pdfExporter.generatePatientReportPDF(data); // Reuse patient report format
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}.pdf"`,
            },
          });
        }

      case 'medical-record':
        if (!validatedData.recordId) {
          return NextResponse.json(
            { error: 'Record ID is required for single medical record export' },
            { status: 400 }
          );
        }

        const record = await prisma.medicalRecord.findUnique({
          where: { id: validatedData.recordId },
          include: {
            patient: true,
          },
        });

        if (!record) {
          return NextResponse.json(
            { error: 'Medical record not found' },
            { status: 404 }
          );
        }

        filename = `medical-record-${record.patient.patientId}-${new Date().toISOString().split('T')[0]}`;
        
        if (validatedData.format === 'csv') {
          // For single record, create a CSV with just that record
          content = csvExporter.exportMedicalRecordsToCSV([record]);
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="${filename}.csv"`,
            },
          });
        } else {
          content = pdfExporter.generateMedicalRecordPDF(record, record.patient);
          return new NextResponse(content, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${filename}.pdf"`,
            },
          });
        }

      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        );
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
          }))
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

async function getPatientsData(filters?: Record<string, any>) {
  const where: any = {};
  
  if (filters?.patientId) {
    where.id = filters.patientId;
  }
  
  if (filters?.gender && filters.gender.length > 0) {
    where.gender = { in: filters.gender };
  }
  
  if (filters?.bloodType && filters.bloodType.length > 0) {
    where.bloodType = { in: filters.bloodType };
  }
  
  if (filters?.ageRange) {
    const now = new Date();
    const minDate = new Date(now.getFullYear() - filters.ageRange.max, now.getMonth(), now.getDate());
    const maxDate = new Date(now.getFullYear() - filters.ageRange.min, now.getMonth(), now.getDate());
    
    where.dateOfBirth = {
      gte: minDate,
      lte: maxDate,
    };
  }
  
  if (!filters?.includeInactive) {
    where.isActive = true;
  }

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  // Normalize allergies field - already an array in PostgreSQL
  return patients.map(patient => ({
    ...patient,
    allergies: patient.allergies || [],
  }));
}

async function getAppointmentsData(filters?: Record<string, any>) {
  const where: any = {};
  
  if (filters?.patientId) {
    where.patientId = filters.patientId;
  }
  
  if (filters?.dateRange) {
    where.startTime = {
      gte: new Date(filters.dateRange.start),
      lte: new Date(filters.dateRange.end),
    };
  }
  
  if (filters?.status && filters.status.length > 0) {
    where.status = { in: filters.status };
  }
  
  if (filters?.type && filters.type.length > 0) {
    where.type = { in: filters.type };
  }

  return await prisma.appointment.findMany({
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

async function getMedicalRecordsData(filters?: Record<string, any>) {
  const where: any = {};
  
  if (filters?.patientId) {
    where.patientId = filters.patientId;
  }
  
  if (filters?.dateRange) {
    where.createdAt = {
      gte: new Date(filters.dateRange.start),
      lte: new Date(filters.dateRange.end),
    };
  }
  
  if (filters?.type && filters.type.length > 0) {
    where.recordType = { in: filters.type };
  }

  const records = await prisma.medicalRecord.findMany({
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

  // Normalize array fields
  return records.map(record => ({
    ...record,
    symptoms: record.symptoms ? 
      (typeof record.symptoms === 'string' ? JSON.parse(record.symptoms) : record.symptoms)
      : [],
    medications: record.medications ? 
      (typeof record.medications === 'string' ? JSON.parse(record.medications) : record.medications)
      : [],
    labResults: record.labResults ? 
      (typeof record.labResults === 'string' ? JSON.parse(record.labResults) : record.labResults)
      : [],
    vitals: record.vitals ? 
      (typeof record.vitals === 'string' ? JSON.parse(record.vitals) : record.vitals)
      : null,
    attachments: record.attachments ? 
      (typeof record.attachments === 'string' ? JSON.parse(record.attachments) : record.attachments)
      : [],
  }));
}
