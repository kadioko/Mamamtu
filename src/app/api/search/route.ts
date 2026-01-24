import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiAuth';
import { prisma } from '@/lib/prisma';
import { advancedSearchService, SearchFilters } from '@/lib/search/advancedSearch';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().optional(),
  model: z.enum(['patient', 'appointment', 'medicalRecord', 'content', 'global']).default('patient'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  patientId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.array(z.string()).optional(),
  type: z.array(z.string()).optional(),
  gender: z.array(z.string()).optional(),
  bloodType: z.array(z.string()).optional(),
  minAge: z.coerce.number().min(0).max(120).optional(),
  maxAge: z.coerce.number().min(0).max(120).optional(),
  includeInactive: z.coerce.boolean().default(false),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Parse and validate search parameters
    const validatedParams = searchSchema.parse(params);
    
    // Build filters
    const filters: SearchFilters = {
      query: validatedParams.query,
      patientId: validatedParams.patientId,
      includeInactive: validatedParams.includeInactive,
      sortBy: validatedParams.sortBy,
      sortOrder: validatedParams.sortOrder,
      limit: validatedParams.limit,
      offset: (validatedParams.page - 1) * validatedParams.limit,
    };

    // Add date range if provided
    if (validatedParams.startDate || validatedParams.endDate) {
      filters.dateRange = {
        start: validatedParams.startDate ? new Date(validatedParams.startDate) : new Date(0),
        end: validatedParams.endDate ? new Date(validatedParams.endDate) : new Date(),
      };
    }

    // Add array filters
    if (validatedParams.categories) filters.categories = validatedParams.categories;
    if (validatedParams.tags) filters.tags = validatedParams.tags;
    if (validatedParams.status) filters.status = validatedParams.status;
    if (validatedParams.type) filters.type = validatedParams.type;
    if (validatedParams.gender) filters.gender = validatedParams.gender;
    if (validatedParams.bloodType) filters.bloodType = validatedParams.bloodType;

    // Add age range if provided
    if (validatedParams.minAge !== undefined || validatedParams.maxAge !== undefined) {
      filters.ageRange = {
        min: validatedParams.minAge || 0,
        max: validatedParams.maxAge || 120,
      };
    }

    let result;

    switch (validatedParams.model) {
      case 'patient':
        result = await searchPatients(filters);
        break;
      case 'appointment':
        result = await searchAppointments(filters);
        break;
      case 'medicalRecord':
        result = await searchMedicalRecords(filters);
        break;
      case 'content':
        result = await searchContent(filters);
        break;
      case 'global':
        result = await globalSearch(filters);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid search model' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Search error:', error);
    
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
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

async function searchPatients(filters: SearchFilters) {
  const query = advancedSearchService.buildPatientSearchQuery(filters);
  
  const [patients, total] = await Promise.all([
    prisma.patient.findMany(query),
    prisma.patient.count({ where: query.where }),
  ]);

  // Normalize allergies field
  const normalizedPatients = patients.map(patient => ({
    ...patient,
    allergies: patient.allergies ? 
      (typeof patient.allergies === 'string' ? patient.allergies.split(',').map(a => a.trim()).filter(Boolean) : patient.allergies)
      : [],
  }));

  return {
    items: normalizedPatients,
    total,
    page: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
    totalPages: Math.ceil(total / (filters.limit || 10)),
  };
}

async function searchAppointments(filters: SearchFilters) {
  const query = advancedSearchService.buildAppointmentSearchQuery(filters);
  
  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany(query),
    prisma.appointment.count({ where: query.where }),
  ]);

  return {
    items: appointments,
    total,
    page: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
    totalPages: Math.ceil(total / (filters.limit || 10)),
  };
}

async function searchMedicalRecords(filters: SearchFilters) {
  const query = advancedSearchService.buildMedicalRecordSearchQuery(filters);
  
  const [records, total] = await Promise.all([
    prisma.medicalRecord.findMany(query),
    prisma.medicalRecord.count({ where: query.where }),
  ]);

  // Normalize array fields
  const normalizedRecords = records.map(record => ({
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

  return {
    items: normalizedRecords,
    total,
    page: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
    totalPages: Math.ceil(total / (filters.limit || 10)),
  };
}

async function searchContent(filters: SearchFilters) {
  const query = advancedSearchService.buildContentSearchQuery(filters);
  
  const [content, total] = await Promise.all([
    prisma.content.findMany(query),
    prisma.content.count({ where: query.where }),
  ]);

  return {
    items: content,
    total,
    page: Math.floor((filters.offset || 0) / (filters.limit || 10)) + 1,
    totalPages: Math.ceil(total / (filters.limit || 10)),
  };
}

async function globalSearch(filters: SearchFilters) {
  const limit = Math.min(filters.limit || 10, 5); // Limit to 5 results per model for global search
  
  const [patients, appointments, medicalRecords, content] = await Promise.all([
    searchPatients({ ...filters, limit }),
    searchAppointments({ ...filters, limit }),
    searchMedicalRecords({ ...filters, limit }),
    searchContent({ ...filters, limit }),
  ]);

  return {
    patients: patients.items,
    appointments: appointments.items,
    medicalRecords: medicalRecords.items,
    content: content.items,
    total: patients.total + appointments.total + medicalRecords.total + content.total,
  };
}
