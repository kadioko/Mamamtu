import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';

// GET /api/notifications/[id] - Get single notification
export const GET = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      const notification = await prisma.notification.findUnique({
        where: { id },
        include: {
          appointment: {
            select: {
              title: true,
              startTime: true,
              type: true,
            }
          },
          patient: {
            select: {
              firstName: true,
              lastName: true,
              patientId: true,
            }
          }
        }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      // Check if user owns this notification
      if (notification.userId !== request.user!.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      return NextResponse.json(notification);
    } catch (error) {
      console.error('Error fetching notification:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification' },
        { status: 500 }
      );
    }
  },
  { requireEmailVerification: true }
);

// DELETE /api/notifications/[id] - Delete notification
export const DELETE = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      const notification = await prisma.notification.findUnique({
        where: { id },
        select: { userId: true }
      });

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      if (notification.userId !== request.user!.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      await prisma.notification.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error deleting notification:', error);
      return NextResponse.json(
        { error: 'Failed to delete notification' },
        { status: 500 }
      );
    }
  },
  { requireEmailVerification: true }
);
