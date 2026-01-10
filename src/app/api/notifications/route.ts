import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';
import { NotificationType } from '@prisma/client';

// GET /api/notifications - Get user's notifications
export const GET = withAuth(
  async (request) => {
    try {
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const unreadOnly = searchParams.get('unreadOnly') === 'true';
      const typeParam = searchParams.get('type');

      const skip = (page - 1) * limit;

      const where = {
        userId: request.user!.id,
        ...(unreadOnly && { readAt: null }),
        ...(typeParam && Object.values(NotificationType).includes(typeParam as NotificationType) && { type: typeParam as NotificationType }),
      };

      const [notifications, total, unreadCount] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit,
          include: {
            appointment: {
              select: {
                title: true,
                startTime: true,
              }
            },
            patient: {
              select: {
                firstName: true,
                lastName: true,
              }
            }
          }
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
          where: {
            userId: request.user!.id,
            readAt: null,
          }
        })
      ]);

      return NextResponse.json({
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }
  },
  { requireEmailVerification: true }
);

// POST /api/notifications - Create a notification (admin/system only)
export const POST = withAuth(
  async (request) => {
    try {
      const data = await request.json();

      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          channel: data.channel || 'IN_APP',
          userId: data.userId,
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
          priority: data.priority || 0,
          metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
        },
      });

      return NextResponse.json(notification, { status: 201 });
    } catch (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      );
    }
  },
  { roles: ['ADMIN', 'HEALTHCARE_PROVIDER'], requireEmailVerification: true }
);
