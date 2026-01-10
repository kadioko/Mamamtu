import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/apiAuth';

// POST /api/notifications/mark-all-read - Mark all notifications as read
export const POST = withAuth(
  async (request) => {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: request.user!.id,
          readAt: null,
        },
        data: {
          readAt: new Date(),
          status: 'READ'
        }
      });

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark notifications as read' },
        { status: 500 }
      );
    }
  },
  { requireEmailVerification: true }
);
