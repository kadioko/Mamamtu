import { prisma } from '@/lib/prisma';
import type { ClinicalField } from '@/components/dashboard/ClinicalForm';

export async function patientOptions() {
  const patients = await prisma.patient.findMany({
    where: { isActive: true },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    select: { id: true, firstName: true, lastName: true, patientId: true },
  });
  return patients.map((patient) => ({
    value: patient.id,
    label: `${patient.firstName} ${patient.lastName} (${patient.patientId})`,
  }));
}

export async function pregnancyOptions() {
  const episodes = await prisma.pregnancyEpisode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { patient: { select: { firstName: true, lastName: true, patientId: true } } },
  });
  return episodes.map((episode) => ({
    value: episode.id,
    label: `${episode.patient.firstName} ${episode.patient.lastName} (${episode.patient.patientId}) - ${episode.status.replace(/_/g, ' ')}`,
  }));
}

export async function newbornOptions() {
  const newborns = await prisma.newbornRecord.findMany({
    orderBy: { dateOfBirth: 'desc' },
    select: { id: true, name: true, dateOfBirth: true },
  });
  return newborns.map((newborn) => ({
    value: newborn.id,
    label: `${newborn.name || 'Unnamed newborn'} (${newborn.dateOfBirth.toLocaleDateString()})`,
  }));
}

export function withOptions(fields: ClinicalField[], options: Record<string, Array<{ label: string; value: string }>>) {
  return fields.map((field) => {
    if (field.type !== 'select' || !options[field.name]) return field;
    return { ...field, options: options[field.name] };
  });
}

export function dateValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : '';
}
