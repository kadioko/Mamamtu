import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ContentViewer } from '@/components/education/content-viewer';
import { RelatedContent } from '@/components/education/related-content';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentViewerSkeleton } from '@/components/education/content-skeleton';

async function ContentViewerWrapper({ id }: { id: string }) {
  const session = await getAuthSession();
  
  const content = await prisma.content.findFirst({
    where: {
      isPublished: true,
      OR: [{ id }, { slug: id }],
    },
    include: {
      author: {
        select: { name: true, image: true },
      },
      category: true,
      relatedContents: {
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          duration: true,
          thumbnailUrl: true,
          viewCount: true,
          averageRating: true,
        },
        take: 4,
      },
    },
  });

  if (!content) {
    notFound();
  }

  const contentForViewer = {
    ...content,
    createdAt: content.createdAt.toISOString(),
    updatedAt: content.updatedAt.toISOString(),
  };

  // Fetch user progress if authenticated
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-3">
        <ContentViewer content={contentForViewer} userProgress={userProgress} />
      </div>
      
      <div className="lg:col-span-1 space-y-6">
        <RelatedContent 
          contentId={content.id}
          relatedContents={content.relatedContents} 
          categoryId={content.categoryId}
        />
      </div>
    </div>
  );
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="container py-8">
      <Suspense fallback={<ContentViewerSkeleton />}>
        <ContentViewerWrapper id={id} />
      </Suspense>
    </div>
  );
}

// Disable static generation for dynamic content
// Use dynamic rendering instead to avoid database access during build
export const dynamic = 'force-dynamic';
