import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const progress = await prisma.userContentProgress.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: id,
        },
      },
    });

    return NextResponse.json(progress || { progress: 0, isCompleted: false });
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { progress, isCompleted, notes, rating, feedback } = await req.json();

    // Validate progress
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return NextResponse.json(
        { message: 'Progress must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Check if content exists
    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id },
    });

    if (!content) {
      return NextResponse.json(
        { message: 'Content not found' },
        { status: 404 }
      );
    }

    // Update or create progress
    const updatedProgress = await prisma.userContentProgress.upsert({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: id,
        },
      },
      update: {
        progress,
        ...(isCompleted !== undefined && {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        }),
        lastAccessedAt: new Date(),
        ...(notes !== undefined && { notes }),
        ...(rating !== undefined && { rating }),
        ...(feedback !== undefined && { feedback }),
      },
      create: {
        userId: session.user.id,
        contentId: id,
        progress,
        isCompleted: isCompleted || false,
        completedAt: isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
        notes,
        rating,
        feedback,
      },
    });

    // Update content stats if rating is provided
    if (rating !== undefined) {
      const contentStats = await prisma.content.findUnique({
        where: { id },
        select: { averageRating: true, ratingsCount: true },
      });

      if (contentStats) {
        const prevCount = (contentStats.ratingsCount ?? 0);
        const prevAvg = (contentStats.averageRating ?? 0);
        const newRatingsCount = prevCount + 1;
        const newAverageRating = ((prevAvg * prevCount) + rating) / newRatingsCount;

        await prisma.content.update({
          where: { id },
          data: {
            averageRating: newAverageRating,
            ratingsCount: newRatingsCount,
          },
        });
      }
    }

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
