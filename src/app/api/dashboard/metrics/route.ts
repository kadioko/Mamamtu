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
    const [
      activePatientsResult,
      upcomingAppointmentsResult,
      activePregnancyResult,
      alertsResult,
      totalPatientsResult,
      recentAppointmentsResult,
    ] = await Promise.all([
      // Active patients count
      prisma.patient.count({
        where: { isActive: true }
      }),

      // Upcoming appointments count (next 7 days)
      prisma.appointment.count({
        where: {
          startTime: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED'],
          },
        },
      }),

      // Active pregnancies (simulated - could be based on pregnancy records)
      prisma.patient.count({
        where: {
          gender: 'FEMALE',
          dateOfBirth: {
            lte: new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), // 18+ years old
          },
        }
      }),

      // Active alerts (could be based on critical vitals, missed appointments, etc.)
      prisma.appointment.count({
        where: {
          startTime: {
            lt: new Date(),
            gt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
          status: {
            in: ['NO_SHOW', 'CANCELLED'],
          },
        },
      }),

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
      activePatients: {
        count: activePatientsResult,
        change: calculatePercentageChange(activePatientsResult, previousPeriodPatients),
      },
      upcomingAppointments: {
        count: upcomingAppointmentsResult,
        change: calculatePercentageChange(upcomingAppointmentsResult, previousPeriodAppointments),
      },
      activePregnancy: {
        count: activePregnancyResult,
        change: 0, // Placeholder
      },
      alerts: {
        count: alertsResult,
        change: 0, // Placeholder
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
