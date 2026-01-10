import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';

interface ContentListErrorProps {
  error: Error;
  onRetry: () => void;
}

export function ContentListError({ error, onRetry }: ContentListErrorProps) {
  return (
    <Alert variant="destructive" className="my-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error loading content</AlertTitle>
      <AlertDescription>
        <p className="mb-4">{error.message}</p>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <Icons.refresh className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export function ContentListEmpty() {
  return (
    <div className="text-center py-12">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-medium">No content found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Try adjusting your search or filter to find what you&apos;re looking for.
      </p>
    </div>
  );
}
