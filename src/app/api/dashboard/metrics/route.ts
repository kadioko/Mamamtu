import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

// GET /api/dashboard/metrics - Get real dashboard metrics
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parallel queries for better performance
    const now = new Date();
    const [
      mothersRegisteredResult,
      ancVisitsRecordedResult,
      followUpsScheduledResult,
      activePregnanciesResult,
      totalPatientsResult,
      recentAppointmentsResult,
    ] = await Promise.all([
      // Active mother records
      prisma.patient.count({
        where: { isActive: true, gender: 'FEMALE' }
      }),

      // All ANC visits recorded in the demo environment
      prisma.antenatalVisit.count(),

      // Future scheduled follow-up appointments
      prisma.appointment.count({
        where: {
          type: 'FOLLOW_UP',
          startTime: {
            gte: now,
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
      }),

      // Active pregnancies
      prisma.pregnancyEpisode.count({ where: { status: 'ACTIVE' } }),

      // Total patients
      prisma.patient.count(),

      // Recent appointments (last 30 days)
      prisma.appointment.count({
        where: {
          startTime: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ]);

    // Calculate percentage changes (comparing to previous period)
    const previousPeriodStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
    const currentPeriodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const [previousPeriodPatients, previousPeriodAppointments] = await Promise.all([
      prisma.patient.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lt: currentPeriodStart,
          },
        },
      }),
      prisma.appointment.count({
        where: {
          startTime: {
            gte: previousPeriodStart,
            lt: currentPeriodStart,
          },
        },
      }),
    ]);

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const metrics = {
      mothersRegistered: {
        count: mothersRegisteredResult,
        change: calculatePercentageChange(mothersRegisteredResult, previousPeriodPatients),
      },
      ancVisitsRecorded: {
        count: ancVisitsRecordedResult,
        change: 0,
      },
      followUpsScheduled: {
        count: followUpsScheduledResult,
        change: 0,
      },
      activePregnancies: {
        count: activePregnanciesResult,
        change: 0,
      },
      // Legacy aliases retained for older dashboard clients.
      activePatients: {
        count: mothersRegisteredResult,
        change: calculatePercentageChange(mothersRegisteredResult, previousPeriodPatients),
      },
      upcomingAppointments: {
        count: ancVisitsRecordedResult,
        change: calculatePercentageChange(ancVisitsRecordedResult, previousPeriodAppointments),
      },
      activePregnancy: {
        count: activePregnanciesResult,
        change: 0,
      },
      alerts: {
        count: followUpsScheduledResult,
        change: 0,
      },
      totalPatients: totalPatientsResult,
      recentAppointments: recentAppointmentsResult,
      appointmentsToday: await prisma.appointment.count({
        where: {
          startTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
      }),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
