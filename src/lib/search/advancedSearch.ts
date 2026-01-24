import { Prisma } from '@prisma/client';

export interface SearchFilters {
  query?: string;
  patientId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  tags?: string[];
  status?: string[];
  priority?: string[];
  type?: string[];
  gender?: string[];
  bloodType?: string[];
  ageRange?: {
    min: number;
    max: number;
  };
  includeInactive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

export class AdvancedSearchService {
  private static instance: AdvancedSearchService;

  static getInstance(): AdvancedSearchService {
    if (!AdvancedSearchService.instance) {
      AdvancedSearchService.instance = new AdvancedSearchService();
    }
    return AdvancedSearchService.instance;
  }

  // Build search query for patients
  buildPatientSearchQuery(filters: SearchFilters): Prisma.PatientFindManyArgs {
    const where: Prisma.PatientWhereInput = {};
    const orderBy: Prisma.PatientOrderByWithRelationInput = {};

    // Text search
    if (filters.query) {
      where.OR = [
        { firstName: { contains: filters.query, mode: 'insensitive' } },
        { lastName: { contains: filters.query, mode: 'insensitive' } },
        { patientId: { contains: filters.query, mode: 'insensitive' } },
        { email: { contains: filters.query, mode: 'insensitive' } },
        { phone: { contains: filters.query, mode: 'insensitive' } },
        { address: { contains: filters.query, mode: 'insensitive' } },
        { city: { contains: filters.query, mode: 'insensitive' } },
        { notes: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Gender filter
    if (filters.gender && filters.gender.length > 0) {
      where.gender = { in: filters.gender as any[] };
    }

    // Blood type filter
    if (filters.bloodType && filters.bloodType.length > 0) {
      where.bloodType = { in: filters.bloodType as any[] };
    }

    // Age range filter
    if (filters.ageRange) {
      const now = new Date();
      const minDate = new Date(now.getFullYear() - filters.ageRange.max, now.getMonth(), now.getDate());
      const maxDate = new Date(now.getFullYear() - filters.ageRange.min, now.getMonth(), now.getDate());
      
      where.dateOfBirth = {
        gte: minDate,
        lte: maxDate,
      };
    }

    // Active status filter
    if (!filters.includeInactive) {
      where.isActive = true;
    }

    // Sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy as keyof Prisma.PatientOrderByWithRelationInput;
      orderBy[sortField] = filters.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return {
      where,
      orderBy,
      skip: filters.offset,
      take: filters.limit,
    };
  }

  // Build search query for appointments
  buildAppointmentSearchQuery(filters: SearchFilters): Prisma.AppointmentFindManyArgs {
    const where: Prisma.AppointmentWhereInput = {};
    const orderBy: Prisma.AppointmentOrderByWithRelationInput = {};

    // Text search
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { location: { contains: filters.query, mode: 'insensitive' } },
        { notes: { contains: filters.query, mode: 'insensitive' } },
        { patient: { firstName: { contains: filters.query, mode: 'insensitive' } } },
        { patient: { lastName: { contains: filters.query, mode: 'insensitive' } } },
        { patient: { patientId: { contains: filters.query, mode: 'insensitive' } } },
      ];
    }

    // Patient filter
    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    // Date range filter
    if (filters.dateRange) {
      where.startTime = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status as any[] };
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      where.type = { in: filters.type as any[] };
    }

    // Sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy as keyof Prisma.AppointmentOrderByWithRelationInput;
      orderBy[sortField] = filters.sortOrder || 'asc';
    } else {
      orderBy.startTime = 'asc';
    }

    return {
      where,
      orderBy,
      skip: filters.offset,
      take: filters.limit,
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
    };
  }

  // Build search query for medical records
  buildMedicalRecordSearchQuery(filters: SearchFilters): Prisma.MedicalRecordFindManyArgs {
    const where: Prisma.MedicalRecordWhereInput = {};
    const orderBy: Prisma.MedicalRecordOrderByWithRelationInput = {};

    // Text search
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { diagnosis: { contains: filters.query, mode: 'insensitive' } },
        { treatment: { contains: filters.query, mode: 'insensitive' } },
        { notes: { contains: filters.query, mode: 'insensitive' } },
        { symptoms: { hasSome: [filters.query] } },
        { medications: { hasSome: [filters.query] } },
        { labResults: { hasSome: [filters.query] } },
      ];
    }

    // Patient filter
    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    // Date range filter
    if (filters.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }

    // Record type filter
    if (filters.type && filters.type.length > 0) {
      where.recordType = { in: filters.type as any[] };
    }

    // Sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy as keyof Prisma.MedicalRecordOrderByWithRelationInput;
      orderBy[sortField] = filters.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return {
      where,
      orderBy,
      skip: filters.offset,
      take: filters.limit,
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
    };
  }

  // Build search query for content
  buildContentSearchQuery(filters: SearchFilters): Prisma.ContentFindManyArgs {
    const where: Prisma.ContentWhereInput = {};
    const orderBy: Prisma.ContentOrderByWithRelationInput = {};

    // Text search
    if (filters.query) {
      where.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        { content: { contains: filters.query, mode: 'insensitive' } },
        { slug: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      where.categoryId = { in: filters.categories };
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      where.type = { in: filters.type as any[] };
    }

    // Published status
    where.isPublished = true;

    // Sorting
    if (filters.sortBy) {
      const sortField = filters.sortBy as keyof Prisma.ContentOrderByWithRelationInput;
      orderBy[sortField] = filters.sortOrder || 'asc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return {
      where,
      orderBy,
      skip: filters.offset,
      take: filters.limit,
    };
  }

  // Generate search facets for better filtering
  async generateSearchFacets(model: 'patient' | 'appointment' | 'medicalRecord' | 'content'): Promise<Record<string, Array<{ value: string; count: number }>>> {
    // This would typically query the database to get facet counts
    // For now, return empty facets - implement based on your specific needs
    return {};
  }

  // Full-text search across multiple models
  async globalSearch(query: string, options: {
    models?: Array<'patient' | 'appointment' | 'medicalRecord' | 'content'>;
    limit?: number;
  } = {}): Promise<{
    patients: any[];
    appointments: any[];
    medicalRecords: any[];
    content: any[];
  }> {
    const { models = ['patient', 'appointment', 'medicalRecord', 'content'], limit = 10 } = options;
    const results = {
      patients: [],
      appointments: [],
      medicalRecords: [],
      content: [],
    };

    const filters: SearchFilters = {
      query,
      limit,
    };

    // This would typically execute database queries
    // For now, return empty results - implement with actual database calls
    return results;
  }

  // Advanced filtering with complex conditions
  buildAdvancedQuery(filters: SearchFilters, model: string): any {
    // This method can handle more complex filtering logic
    // such as nested conditions, custom operators, etc.
    switch (model) {
      case 'patient':
        return this.buildPatientSearchQuery(filters);
      case 'appointment':
        return this.buildAppointmentSearchQuery(filters);
      case 'medicalRecord':
        return this.buildMedicalRecordSearchQuery(filters);
      case 'content':
        return this.buildContentSearchQuery(filters);
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  // Parse and validate search filters
  parseFilters(rawFilters: Record<string, any>): SearchFilters {
    const filters: SearchFilters = {};

    // Parse basic string fields
    if (rawFilters.query) filters.query = String(rawFilters.query);
    if (rawFilters.patientId) filters.patientId = String(rawFilters.patientId);

    // Parse date range
    if (rawFilters.startDate || rawFilters.endDate) {
      filters.dateRange = {
        start: rawFilters.startDate ? new Date(rawFilters.startDate) : new Date(0),
        end: rawFilters.endDate ? new Date(rawFilters.endDate) : new Date(),
      };
    }

    // Parse array fields
    if (rawFilters.categories) {
      filters.categories = Array.isArray(rawFilters.categories) 
        ? rawFilters.categories 
        : String(rawFilters.categories).split(',');
    }

    if (rawFilters.tags) {
      filters.tags = Array.isArray(rawFilters.tags) 
        ? rawFilters.tags 
        : String(rawFilters.tags).split(',');
    }

    if (rawFilters.status) {
      filters.status = Array.isArray(rawFilters.status) 
        ? rawFilters.status 
        : String(rawFilters.status).split(',');
    }

    if (rawFilters.type) {
      filters.type = Array.isArray(rawFilters.type) 
        ? rawFilters.type 
        : String(rawFilters.type).split(',');
    }

    if (rawFilters.gender) {
      filters.gender = Array.isArray(rawFilters.gender) 
        ? rawFilters.gender 
        : String(rawFilters.gender).split(',');
    }

    if (rawFilters.bloodType) {
      filters.bloodType = Array.isArray(rawFilters.bloodType) 
        ? rawFilters.bloodType 
        : String(rawFilters.bloodType).split(',');
    }

    // Parse age range
    if (rawFilters.minAge || rawFilters.maxAge) {
      filters.ageRange = {
        min: parseInt(rawFilters.minAge) || 0,
        max: parseInt(rawFilters.maxAge) || 120,
      };
    }

    // Parse boolean fields
    if (rawFilters.includeInactive !== undefined) {
      filters.includeInactive = Boolean(rawFilters.includeInactive);
    }

    // Parse sorting
    if (rawFilters.sortBy) filters.sortBy = String(rawFilters.sortBy);
    if (rawFilters.sortOrder) filters.sortOrder = rawFilters.sortOrder as 'asc' | 'desc';

    // Parse pagination
    if (rawFilters.limit) filters.limit = parseInt(rawFilters.limit);
    if (rawFilters.offset) filters.offset = parseInt(rawFilters.offset);

    return filters;
  }
}

export const advancedSearchService = AdvancedSearchService.getInstance();
