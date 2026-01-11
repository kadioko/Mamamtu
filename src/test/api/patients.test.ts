import { GET, POST } from '@/app/api/patients/route';
import { NextRequest } from 'next/server';

// Mock Prisma
const mockPrisma = {
  patient: {
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
};

jest.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      role: 'HEALTHCARE_PROVIDER',
    },
  })),
}));

describe('/api/patients', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/patients', () => {
    it('returns paginated patients', async () => {
      const mockPatients = [
        {
          id: '1',
          patientId: 'P001',
          firstName: 'Jane',
          lastName: 'Doe',
          allergies: ['Penicillin'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          patientId: 'P002',
          firstName: 'John',
          lastName: 'Smith',
          allergies: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.patient.findMany.mockResolvedValue(mockPatients);
      mockPrisma.patient.count.mockResolvedValue(2);

      const request = new NextRequest('http://localhost:3000/api/patients?page=1&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        data: [
          {
            ...mockPatients[0],
            allergies: ['Penicillin'],
          },
          {
            ...mockPatients[1],
            allergies: [],
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });
    });

    it('handles pagination parameters', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);
      mockPrisma.patient.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/patients?page=2&limit=5');
      await GET(request);

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit
          take: 5,
        })
      );
    });

    it('uses default pagination values', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);
      mockPrisma.patient.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/patients');
      await GET(request);

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        })
      );
    });

    it('filters active patients by default', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);
      mockPrisma.patient.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/patients');
      await GET(request);

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isActive: true,
          },
        })
      );
    });

    it('includes inactive patients when requested', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);
      mockPrisma.patient.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/patients?includeInactive=true');
      await GET(request);

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {}, // No isActive filter
        })
      );
    });

    it('handles search by name', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);
      mockPrisma.patient.count.mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/patients?search=Jane');
      await GET(request);

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isActive: true,
            OR: [
              { firstName: { contains: 'Jane', mode: 'insensitive' } },
              { lastName: { contains: 'Jane', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('handles database errors', async () => {
      mockPrisma.patient.findMany.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Failed to fetch patients' });
    });

    it('normalizes allergies from string to array', async () => {
      const mockPatientWithStringAllergies = {
        id: '1',
        patientId: 'P001',
        firstName: 'Jane',
        lastName: 'Doe',
        allergies: 'Penicillin,Sulfa', // String instead of array
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.patient.findMany.mockResolvedValue([mockPatientWithStringAllergies]);
      mockPrisma.patient.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data[0].allergies).toEqual(['Penicillin', 'Sulfa']);
    });

    it('handles empty allergies string', async () => {
      const mockPatientWithEmptyAllergies = {
        id: '1',
        patientId: 'P001',
        firstName: 'Jane',
        lastName: 'Doe',
        allergies: '', // Empty string
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.patient.findMany.mockResolvedValue([mockPatientWithEmptyAllergies]);
      mockPrisma.patient.count.mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/patients');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data[0].allergies).toEqual([]);
    });
  });

  describe('POST /api/patients', () => {
    it('creates a new patient', async () => {
      const newPatient = {
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        phone: '+254712345678',
        email: 'jane.doe@example.com',
        allergies: ['Penicillin'],
      };

      const createdPatient = {
        id: '1',
        patientId: 'P001',
        ...newPatient,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.patient.create.mockResolvedValue(createdPatient);

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(createdPatient);
      expect(mockPrisma.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ...newPatient,
            allergies: ['Penicillin'],
            isActive: true,
          },
        })
      );
    });

    it('generates patient ID automatically', async () => {
      const newPatient = {
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
      };

      mockPrisma.patient.create.mockResolvedValue({
        id: '1',
        patientId: 'P001',
        ...newPatient,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      expect(mockPrisma.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patientId: expect.stringMatching(/^P\d{3}$/),
          }),
        })
      );
    });

    it('handles allergies as array', async () => {
      const newPatient = {
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
        allergies: ['Penicillin', 'Sulfa'],
      };

      mockPrisma.patient.create.mockResolvedValue({
        id: '1',
        patientId: 'P001',
        ...newPatient,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      await POST(request);

      expect(mockPrisma.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            allergies: ['Penicillin', 'Sulfa'],
          }),
        })
      );
    });

    it('handles missing required fields', async () => {
      const invalidPatient = {
        firstName: 'Jane',
        // Missing required fields
      };

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(invalidPatient),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error');
    });

    it('handles invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid request body' });
    });

    it('handles database errors during creation', async () => {
      const newPatient = {
        firstName: 'Jane',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        gender: 'FEMALE',
      };

      mockPrisma.patient.create.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/patients', {
        method: 'POST',
        body: JSON.stringify(newPatient),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create patient' });
    });
  });
});
