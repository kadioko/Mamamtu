import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { ContentCard, type Content, type ContentType } from './content-card';
import { ContentListSkeleton } from './content-skeleton';
import { ContentListError, ContentListEmpty } from './content-states';

interface ContentListProps {
  contents: Content[] | null;
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  className?: string;
}

export function ContentList({
  contents,
  total,
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 9,
  isLoading = false,
  error = null,
  onRetry = () => window.location.reload(),
  className = '',
}: ContentListProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  // Show loading state
  if (isLoading) {
    return <ContentListSkeleton count={pageSize} />;
  }

  // Show error state
  if (error) {
    return <ContentListError error={error} onRetry={onRetry} />;
  }

  // Show empty state
  if (!contents || contents.length === 0) {
    return <ContentListEmpty />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contents.map((content) => (
          <ContentCard 
            key={content.id} 
            content={content} 
            showCategory={false}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{total}</span> results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Previous</span>
            </Button>
            
            <div className="flex items-center justify-center px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1"
            >
              <span className="sr-only sm:not-sr-only">Next</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
