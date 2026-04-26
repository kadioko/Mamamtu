import { auth } from '@/auth';
import { writeAuditLog } from '@/lib/audit';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const canManageContent = (role?: string) => role === 'ADMIN' || role === 'HEALTHCARE_PROVIDER';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const content = await prisma.content.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
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
      where: { id: content.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get user progress if authenticated
    const session = await auth();
    let userProgress = null;
    
    if (session?.user) {
      userProgress = await prisma.userContentProgress.findUnique({
        where: {
          userId_contentId: {
            userId: session.user.id,
            contentId: content.id,
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

    if (existingContent.authorId !== session.user.id && !canManageContent(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        ...data,
        ...(data.isPublished === true && !existingContent.publishedAt
          ? { publishedAt: new Date() }
          : {}),
        ...(data.isPublished === false ? { publishedAt: null } : {}),
      },
    });

    await writeAuditLog({
      action: 'EDUCATION_CONTENT_UPDATED',
      resource: 'Content',
      resourceId: updatedContent.id,
      metadata: { title: updatedContent.title, isPublished: updatedContent.isPublished },
      request: req,
      userId: session.user.id,
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

    if (existingContent.authorId !== session.user.id && !canManageContent(session.user.role)) {
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

    await writeAuditLog({
      action: 'EDUCATION_CONTENT_DELETED',
      resource: 'Content',
      resourceId: id,
      metadata: { title: existingContent.title },
      request: req,
      userId: session.user.id,
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
