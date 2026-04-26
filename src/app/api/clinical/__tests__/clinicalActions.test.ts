/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { PUT as archivePregnancy, DELETE as deletePregnancy } from '@/app/api/pregnancy-episodes/[id]/route';
import { DELETE as deleteAntenatalVisit } from '@/app/api/antenatal-visits/[id]/route';
import { DELETE as deleteNewbornRecord } from '@/app/api/newborn-records/[id]/route';
import { DELETE as deleteImmunization } from '@/app/api/immunizations/[id]/route';

jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    pregnancyEpisode: {
      update: jest.fn(),
      delete: jest.fn(),
    },
    antenatalVisit: {
      delete: jest.fn(),
    },
    newbornRecord: {
      delete: jest.fn(),
    },
    immunization: {
      delete: jest.fn(),
    },
  },
}));

const { auth } = jest.requireMock('@/auth') as { auth: jest.Mock };
const { prisma } = jest.requireMock('@/lib/prisma') as {
  prisma: {
    pregnancyEpisode: { update: jest.Mock; delete: jest.Mock };
    antenatalVisit: { delete: jest.Mock };
    newbornRecord: { delete: jest.Mock };
    immunization: { delete: jest.Mock };
  };
};

const params = { params: Promise.resolve({ id: 'clinical-id' }) };

describe('clinical archive and delete endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockResolvedValue({
      user: {
        id: 'admin-id',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });
  });

  it('archives a pregnancy episode by updating its status', async () => {
    prisma.pregnancyEpisode.update.mockResolvedValue({
      id: 'clinical-id',
      status: 'REFERRED',
    });

    const request = new NextRequest('http://localhost/api/pregnancy-episodes/clinical-id', {
      method: 'PUT',
      body: JSON.stringify({ status: 'REFERRED', notes: 'Archived from test' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await archivePregnancy(request, params);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe('REFERRED');
    expect(prisma.pregnancyEpisode.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'clinical-id' },
        data: expect.objectContaining({ status: 'REFERRED' }),
      })
    );
  });

  it('rejects pregnancy deletion for non-admin users', async () => {
    auth.mockResolvedValue({
      user: {
        id: 'provider-id',
        email: 'provider@example.com',
        role: 'HEALTHCARE_PROVIDER',
      },
    });

    const request = new NextRequest('http://localhost/api/pregnancy-episodes/clinical-id', {
      method: 'DELETE',
    });

    const response = await deletePregnancy(request, params);

    expect(response.status).toBe(403);
    expect(prisma.pregnancyEpisode.delete).not.toHaveBeenCalled();
  });

  it('allows admins to delete clinical records from each model', async () => {
    prisma.pregnancyEpisode.delete.mockResolvedValue({ id: 'clinical-id' });
    prisma.antenatalVisit.delete.mockResolvedValue({ id: 'clinical-id' });
    prisma.newbornRecord.delete.mockResolvedValue({ id: 'clinical-id' });
    prisma.immunization.delete.mockResolvedValue({ id: 'clinical-id' });

    const request = new NextRequest('http://localhost/api/clinical/clinical-id', {
      method: 'DELETE',
    });

    const responses = await Promise.all([
      deletePregnancy(request, params),
      deleteAntenatalVisit(request, params),
      deleteNewbornRecord(request, params),
      deleteImmunization(request, params),
    ]);

    expect(responses.map((response) => response.status)).toEqual([200, 200, 200, 200]);
    expect(prisma.pregnancyEpisode.delete).toHaveBeenCalledWith({ where: { id: 'clinical-id' } });
    expect(prisma.antenatalVisit.delete).toHaveBeenCalledWith({ where: { id: 'clinical-id' } });
    expect(prisma.newbornRecord.delete).toHaveBeenCalledWith({ where: { id: 'clinical-id' } });
    expect(prisma.immunization.delete).toHaveBeenCalledWith({ where: { id: 'clinical-id' } });
  });
});
