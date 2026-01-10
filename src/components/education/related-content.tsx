import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { ContentType } from '@prisma/client';
import Link from 'next/link';
import Image from 'next/image';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: ContentType;
  duration: number | null;
  thumbnailUrl: string | null;
  viewCount: number;
  averageRating: number | null;
}

const contentTypeIcons = {
  [ContentType.ARTICLE]: 'file-text',
  [ContentType.VIDEO]: 'play-circle',
  [ContentType.PDF]: 'file-pdf',
  [ContentType.PRESENTATION]: 'presentation',
  [ContentType.QUIZ]: 'help-circle',
} as const;

interface RelatedContentProps {
  contentId: string;
  relatedContents: Array<{
    id: string;
    title: string;
    slug: string;
    type: ContentType;
    duration: number | null;
    thumbnailUrl: string | null;
    viewCount: number;
    averageRating: number | null;
  }>;
  categoryId: string;
}

export async function RelatedContent({ contentId, relatedContents, categoryId }: RelatedContentProps) {
  // If we have manually provided related contents, use them
  if (relatedContents.length > 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Related Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {relatedContents
            .filter((content) => content.id !== contentId)
            .map((content) => (
              <RelatedContentItem key={content.id} content={content} />
            ))}
        </CardContent>
      </Card>
    );
  }

  // Otherwise, fetch related content from the same category
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/content?category=${categoryId}&limit=4`,
    { next: { revalidate: 60 } } // Revalidate every minute
  );
  
  if (!response.ok) {
    return null;
  }
  
  const { data: related }: { data: ContentItem[] } = await response.json();

  // Filter out the current content and limit to 4 items
  const filteredRelated = related
    .filter((content) => content.id !== contentId)
    .slice(0, 4);

  if (filteredRelated.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">You Might Also Like</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredRelated.map((content) => (
          <RelatedContentItem key={content.id} content={content} />
        ))}
      </CardContent>
    </Card>
  );
}

function RelatedContentItem({ content }: { content: ContentItem }) {
  const IconComponent = Icons[contentTypeIcons[content.type as ContentType] as keyof typeof Icons];
  
  return (
    <Link
      href={`/education/${content.id}`}
      className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md bg-muted group-hover:bg-muted/80">
        {content.thumbnailUrl ? (
          <Image
            src={content.thumbnailUrl}
            alt={content.title}
            width={48}
            height={48}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          <IconComponent className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-1 overflow-hidden">
        <h4 className="text-sm font-medium leading-none truncate">
          {content.title}
        </h4>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="capitalize">{content.type.toLowerCase()}</span>
          <span>•</span>
          <span>{content.duration ? `${content.duration} min` : 'N/A'}</span>
          {content.averageRating !== null && (
            <span className="flex items-center ml-auto">
              <Icons.star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-0.5" />
              {content.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
