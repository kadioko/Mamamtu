import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';

// POST /api/notifications/[id]/read - Mark notification as read
export const POST = withAuth(
  async (request, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      
      const notification = await prisma.notification.findUnique({
        where: { id },
        select: { userId: true, readAt: true }
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

      // Only update if not already read
      if (!notification.readAt) {
        await prisma.notification.update({
          where: { id },
          data: {
            readAt: new Date(),
            status: 'READ'
          }
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark notification as read' },
        { status: 500 }
      );
    }
  },
  { requireEmailVerification: true }
);
