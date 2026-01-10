import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';

// GET /api/notifications/preferences - Get user notification preferences
export const GET = withAuth(
  async (request) => {
    try {
      let preferences = await prisma.notificationPreference.findUnique({
        where: { userId: request.user!.id }
      });

      // Create default preferences if none exist
      if (!preferences) {
        preferences = await prisma.notificationPreference.create({
          data: {
            userId: request.user!.id,
          }
        });
      }

      return NextResponse.json(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }
  },
  { requireEmailVerification: true }
);

// PUT /api/notifications/preferences - Update notification preferences
export const PUT = withAuth(
  async (request) => {
    try {
      const data = await request.json();

      const preferences = await prisma.notificationPreference.upsert({
        where: { userId: request.user!.id },
        update: {
          enableInApp: data.enableInApp,
          enableEmail: data.enableEmail,
          enableSMS: data.enableSMS,
          enablePush: data.enablePush,
          appointmentReminders: data.appointmentReminders,
          labResults: data.labResults,
          medicationReminders: data.medicationReminders,
          followUpAlerts: data.followUpAlerts,
          highRiskAlerts: data.highRiskAlerts,
          systemAnnouncements: data.systemAnnouncements,
          reminderHoursBefore: data.reminderHoursBefore,
          quietHoursStart: data.quietHoursStart,
          quietHoursEnd: data.quietHoursEnd,
        },
        create: {
          userId: request.user!.id,
          enableInApp: data.enableInApp ?? true,
          enableEmail: data.enableEmail ?? true,
          enableSMS: data.enableSMS ?? false,
          enablePush: data.enablePush ?? true,
          appointmentReminders: data.appointmentReminders ?? true,
          labResults: data.labResults ?? true,
          medicationReminders: data.medicationReminders ?? true,
          followUpAlerts: data.followUpAlerts ?? true,
          highRiskAlerts: data.highRiskAlerts ?? true,
          systemAnnouncements: data.systemAnnouncements ?? true,
          reminderHoursBefore: data.reminderHoursBefore ?? 24,
          quietHoursStart: data.quietHoursStart,
          quietHoursEnd: data.quietHoursEnd,
        }
      });

      return NextResponse.json(preferences);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }
  },
  { requireEmailVerification: true }
);
