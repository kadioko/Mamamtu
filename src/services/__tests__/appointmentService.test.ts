import { getAppointments, getAppointmentById, createAppointment, updateAppointment, deleteAppointment, updateAppointmentStatus, checkAppointmentConflict } from '@/services/appointmentService';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => {
  const appointment = {
    count: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  };

  return {
    __esModule: true,
    prisma: { appointment },
    default: { appointment },
  };
});

const mockAppointment = prisma.appointment as any;

const baseAppointment: any = {
  id: 'appt-1',
  title: 'Prenatal Checkup',
  description: 'Routine visit',
  startTime: new Date('2024-01-01T10:00:00Z'),
  endTime: new Date('2024-01-01T11:00:00Z'),
  status: 'SCHEDULED',
  type: 'CONSULTATION',
  location: 'Clinic',
  notes: 'Bring previous reports',
  patientId: 'patient-1',
  patient: {
    id: 'patient-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '+123456789',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('appointmentService', () => {
  describe('getAppointments', () => {
    it('returns paginated appointments with default paging when no filter is provided', async () => {
      mockAppointment.count.mockResolvedValueOnce(1);
      mockAppointment.findMany.mockResolvedValueOnce([baseAppointment]);

      const result = await getAppointments();

      expect(mockAppointment.count).toHaveBeenCalledWith({ where: {} });
      expect(mockAppointment.findMany).toHaveBeenCalledWith({
        where: {},
        include: { patient: true },
        orderBy: { startTime: 'asc' },
        skip: 0,
        take: 10,
      });

      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(result.data[0].id).toBe('appt-1');
    });

    it('applies filters for patient, status array, dates, type, search, and custom paging', async () => {
      mockAppointment.count.mockResolvedValueOnce(0);
      mockAppointment.findMany.mockResolvedValueOnce([]);

      const filter = {
        patientId: 'patient-1',
        status: ['SCHEDULED', 'CONFIRMED'] as any,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        type: 'CONSULTATION' as any,
        search: 'Jane',
        page: 2,
        limit: 5,
      };

      await getAppointments(filter);

      expect(mockAppointment.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            patientId: 'patient-1',
          }),
        }),
      );

      const args = mockAppointment.findMany.mock.calls[0][0];

      expect(args.where.patientId).toBe('patient-1');
      expect(args.where.status).toEqual({ in: filter.status });
      expect(args.where.type).toBe(filter.type);

      expect(args.where.AND).toEqual([
        { startTime: { gte: expect.any(Date) } },
        { endTime: { lte: expect.any(Date) } },
      ]);

      expect(args.where.OR).toEqual(
        expect.arrayContaining([
          { title: { contains: 'Jane' } },
          { description: { contains: 'Jane' } },
          { notes: { contains: 'Jane' } },
          expect.objectContaining({
            patient: expect.objectContaining({
              OR: expect.arrayContaining([
                { firstName: { contains: 'Jane' } },
                { lastName: { contains: 'Jane' } },
                { phone: { contains: 'Jane' } },
              ]),
            }),
          }),
        ]),
      );

      expect(args.skip).toBe(5);
      expect(args.take).toBe(5);
    });
  });

  describe('getAppointmentById', () => {
    it('returns appointment when found', async () => {
      mockAppointment.findUnique.mockResolvedValueOnce(baseAppointment);

      const result = await getAppointmentById('appt-1');

      expect(mockAppointment.findUnique).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        include: { patient: true },
      });
      expect(result?.id).toBe('appt-1');
    });

    it('returns null when not found', async () => {
      mockAppointment.findUnique.mockResolvedValueOnce(null);

      const result = await getAppointmentById('missing-id');

      expect(result).toBeNull();
    });
  });

  describe('createAppointment', () => {
    it('creates appointment and converts date strings to Date', async () => {
      mockAppointment.create.mockResolvedValueOnce(baseAppointment);

      const input = {
        title: 'Prenatal Checkup',
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        type: 'CONSULTATION' as any,
        patientId: 'patient-1',
        description: 'Routine',
        location: 'Clinic',
        notes: 'Note',
      };

      const result = await createAppointment(input);

      const createArgs = mockAppointment.create.mock.calls[0][0];
      expect(createArgs.data).toEqual(
        expect.objectContaining({
          title: input.title,
          description: input.description,
          type: input.type,
          patientId: input.patientId,
        }),
      );
      expect(createArgs.data.startTime).toBeInstanceOf(Date);
      expect(createArgs.data.endTime).toBeInstanceOf(Date);

      expect(createArgs.include).toEqual({ patient: true });
      expect(result.id).toBe('appt-1');
    });
  });

  describe('updateAppointment', () => {
    it('updates appointment and converts optional date strings', async () => {
      mockAppointment.update.mockResolvedValueOnce(baseAppointment);

      const result = await updateAppointment('appt-1', {
        title: 'Updated',
        startTime: '2024-01-01T09:00:00Z',
        endTime: '2024-01-01T10:00:00Z',
      });

      const updateArgs = mockAppointment.update.mock.calls[0][0];

      expect(updateArgs.where).toEqual({ id: 'appt-1' });
      expect(updateArgs.data.title).toBe('Updated');
      expect(updateArgs.data.startTime).toBeInstanceOf(Date);
      expect(updateArgs.data.endTime).toBeInstanceOf(Date);
      expect(updateArgs.include).toEqual({ patient: true });

      expect(result.id).toBe('appt-1');
    });
  });

  describe('deleteAppointment', () => {
    it('deletes appointment by id', async () => {
      mockAppointment.delete.mockResolvedValueOnce(undefined);

      await deleteAppointment('appt-1');

      expect(mockAppointment.delete).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
      });
    });
  });

  describe('updateAppointmentStatus', () => {
    it('updates appointment status', async () => {
      mockAppointment.update.mockResolvedValueOnce(baseAppointment);

      const result = await updateAppointmentStatus('appt-1', 'COMPLETED' as any);

      expect(mockAppointment.update).toHaveBeenCalledWith({
        where: { id: 'appt-1' },
        data: { status: 'COMPLETED' },
        include: { patient: true },
      });
      expect(result.id).toBe('appt-1');
    });
  });

  describe('checkAppointmentConflict', () => {
    it('returns false when no conflict is found', async () => {
      mockAppointment.findFirst.mockResolvedValueOnce(null);

      const hasConflict = await checkAppointmentConflict(
        'patient-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T11:00:00Z',
      );

      expect(mockAppointment.findFirst).toHaveBeenCalledWith({
        where: expect.objectContaining({
          patientId: 'patient-1',
          status: {
            notIn: ['CANCELLED', 'COMPLETED', 'NO_SHOW'],
          },
        }),
      });

      expect(hasConflict).toBe(false);
    });

    it('returns true when conflict is found, with optional excludeAppointmentId', async () => {
      mockAppointment.findFirst.mockResolvedValueOnce(baseAppointment);

      const hasConflict = await checkAppointmentConflict(
        'patient-1',
        '2024-01-01T10:00:00Z',
        '2024-01-01T11:00:00Z',
        'exclude-id',
      );

      const args = mockAppointment.findFirst.mock.calls[0][0];

      expect(args.where.id).toEqual({ not: 'exclude-id' });
      expect(args.where.patientId).toBe('patient-1');
      expect(Array.isArray(args.where.OR)).toBe(true);

      expect(hasConflict).toBe(true);
    });
  });
});
