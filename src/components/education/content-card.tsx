import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

export type ContentType = 'ARTICLE' | 'VIDEO' | 'PODCAST' | 'INFOGRAPHIC' | 'PDF' | 'PRESENTATION' | 'QUIZ';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export interface Content {
  id: string;
  title: string;
  description: string | null;
  type: ContentType;
  difficulty: DifficultyLevel;
  duration: number | null;
  viewCount: number;
  averageRating: number | null;
  thumbnailUrl: string | null;
  category: { name: string; slug: string };
  author: { name: string | null; image: string | null };
  createdAt: string;
  updatedAt: string;
}

interface ContentWithCategory extends Content {
  category: { name: string; slug: string };
  author: { name: string | null; image: string | null };
}

// Map content types to available icons in the Icons object
const CONTENT_TYPE_ICONS: Record<ContentType, keyof typeof Icons> = {
  ARTICLE: 'message',
  VIDEO: 'medical',
  PODCAST: 'message',
  INFOGRAPHIC: 'medical',  // Using medical as fallback for image
  PDF: 'message',         // Using message as fallback for file
  PRESENTATION: 'calendar',
  QUIZ: 'message',        // Using message as fallback for helpCircle
} as const;

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  BEGINNER: 'bg-green-100 text-green-800',
  INTERMEDIATE: 'bg-blue-100 text-blue-800',
  ADVANCED: 'bg-purple-100 text-purple-800',
  EXPERT: 'bg-red-100 text-red-800',
} as const;

interface ContentCardProps {
  content: ContentWithCategory;
  className?: string;
  showCategory?: boolean;
}

export function ContentCard({ 
  content, 
  className = '',
  showCategory = true
}: ContentCardProps) {
  const Icon = Icons[CONTENT_TYPE_ICONS[content.type]];
  const difficultyColor = DIFFICULTY_COLORS[content.difficulty];
  
  return (
    <div className={`h-full flex flex-col border rounded-lg overflow-hidden bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyColor} capitalize`}>
            {content.difficulty.toLowerCase()}
          </span>
          <div className="flex items-center text-sm text-muted-foreground">
            <Icon className="h-4 w-4 mr-1" />
            <span className="capitalize">{content.type.toLowerCase()}</span>
          </div>
        </div>
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
          <Link href={`/education/${content.id}`} className="hover:underline">
            {content.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {content.description ?? 'No description available'}
        </p>
        {content.duration && (
          <div className="text-sm text-muted-foreground mb-3">
            {content.duration} min read
          </div>
        )}
      </div>
      <div className="mt-auto p-4 pt-0">
        <div className="flex items-center justify-between">
          {showCategory && (
            <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {content.category.name}
            </span>
          )}
          <Button variant="link" size="sm" className="px-0 h-auto" asChild>
            <Link href={`/education/${content.id}`} className="text-sm">
              Read more
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
