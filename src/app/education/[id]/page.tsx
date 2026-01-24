import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentViewer } from '@/components/education/content-viewer';
import { RelatedContent } from '@/components/education/related-content';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentViewerSkeleton } from '@/components/education/content-skeleton';

async function ContentViewerWrapper({ id }: { id: string }) {
  const session = await getAuthSession();
  
  // Fetch the content
  const content = await prisma.content.findUnique({
    where: { id, isPublished: true },
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
          contentId: id,
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

function ContentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="container py-8">
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading content</AlertTitle>
        <AlertDescription>
          <p>{error.message}</p>
          <Button variant="outline" size="sm" onClick={resetErrorBoundary} className="mt-2">
            Try again
          </Button>
        </AlertDescription>
      </Alert>
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
      <ErrorBoundary
        FallbackComponent={ContentErrorFallback}
        onReset={() => {
          window.location.href = '/education';
        }}
      >
        <Suspense fallback={<ContentViewerSkeleton />}>
          {/* @ts-expect-error Server Component */}
          <ContentViewerWrapper id={id} __serverComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

// Disable static generation for dynamic content
// Use dynamic rendering instead to avoid database access during build
export const dynamic = 'force-dynamic';
