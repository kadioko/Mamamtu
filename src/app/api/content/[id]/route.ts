import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        author: {
          select: { name: true, image: true },
        },
        category: true,
        relatedContents: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            duration: true,
            thumbnailUrl: true,
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { message: 'Content not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.content.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Get user progress if authenticated
    const session = await auth();
    let userProgress = null;
    
    if (session?.user) {
      const { id: contentId } = await params;
      userProgress = await prisma.userContentProgress.findUnique({
        where: {
          userId_contentId: {
            userId: session.user.id,
            contentId,
          },
        },
      });
    }

    return NextResponse.json({
      ...content,
      userProgress,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const data = await req.json();
    
    // Check if content exists and user is the author
    const { id } = await params;
    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      return NextResponse.json(
        { message: 'Content not found' },
        { status: 404 }
      );
    }

    if (existingContent.authorId !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        ...data,
        ...(data.isPublished && !existingContent.publishedAt
          ? { publishedAt: new Date() }
          : {}),
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Error updating content:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if content exists and user is the author
    const { id } = await params;
    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      return NextResponse.json(
        { message: 'Content not found' },
        { status: 404 }
      );
    }

    if (existingContent.authorId !== session.user.id) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete related records first
    await prisma.userContentProgress.deleteMany({
      where: { contentId: id },
    });

    await prisma.contentComment.deleteMany({
      where: { contentId: id },
    });

    // Delete the content
    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
