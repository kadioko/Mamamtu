import { Appointment, CreateAppointmentInput, UpdateAppointmentInput, PaginatedAppointments, AppointmentFilter } from '@/types/appointment';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus, AppointmentType, Prisma } from '@prisma/client';
// removed unused imports

export const getAppointments = async (filter: AppointmentFilter = {}): Promise<PaginatedAppointments> => {
  const {
    patientId,
    status,
    startDate,
    endDate,
    type,
    search,
    page = 1,
    limit = 10,
  } = filter;

  const skip = (page - 1) * limit;

  const where: Prisma.AppointmentWhereInput = {};
  
  if (patientId) where.patientId = patientId;
  if (status) {
    if (Array.isArray(status)) {
      where.status = { in: status };
    } else {
      where.status = status;
    }
  }
  if (type) where.type = type;
  
  if (startDate || endDate) {
    where.AND = [];
    if (startDate) where.AND.push({ startTime: { gte: new Date(startDate) } });
    if (endDate) where.AND.push({ endTime: { lte: new Date(endDate) } });
  }
  
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { notes: { contains: search } },
      {
        patient: {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
          ],
        },
      },
    ];
  }

  const [total, data] = await Promise.all([
    prisma.appointment.count({ where }),
    prisma.appointment.findMany({
      where,
      include: {
        patient: true,
      },
      orderBy: { startTime: 'asc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    data: data as unknown as Appointment[],
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      patient: true,
    },
  });

  return appointment as unknown as Appointment | null;
};

export const createAppointment = async (data: CreateAppointmentInput): Promise<Appointment> => {
  const appointment = await prisma.appointment.create({
    data: {
      ...data,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    },
    include: {
      patient: true,
    },
  });

  return appointment as unknown as Appointment;
};

export const updateAppointment = async (
  id: string,
  data: UpdateAppointmentInput
): Promise<Appointment> => {
  const updateData = { ...data };

  if (data.startTime) (updateData.startTime as Date | string) = new Date(data.startTime);
  if (data.endTime) (updateData.endTime as Date | string) = new Date(data.endTime);
  
  const appointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: {
      patient: true,
    },
  });

  return appointment as unknown as Appointment;
};

export const deleteAppointment = async (id: string): Promise<void> => {
  await prisma.appointment.delete({
    where: { id },
  });
};

export const updateAppointmentStatus = async (
  id: string,
  status: AppointmentStatus
): Promise<Appointment> => {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: {
      patient: true,
    },
  });

  return appointment as unknown as Appointment;
};

// Helper function to check for appointment conflicts
export const checkAppointmentConflict = async (
  patientId: string,
  startTime: Date | string,
  endTime: Date | string,
  excludeAppointmentId?: string
): Promise<boolean> => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  const conflict = await prisma.appointment.findFirst({
    where: {
      id: { not: excludeAppointmentId },
      patientId,
      OR: [
        // Existing appointment starts during the new appointment
        {
          startTime: { gte: start, lt: end },
        },
        // Existing appointment ends during the new appointment
        {
          endTime: { gt: start, lte: end },
        },
        // New appointment is within an existing appointment
        {
          startTime: { lte: start },
          endTime: { gte: end },
        },
      ],
      status: {
        notIn: [AppointmentStatus.CANCELLED, AppointmentStatus.COMPLETED, AppointmentStatus.NO_SHOW],
      },
    },
  });

  return !!conflict;
};
