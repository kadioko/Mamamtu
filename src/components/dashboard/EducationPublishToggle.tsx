'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function EducationPublishToggle({
  contentId,
  isPublished,
}: {
  contentId: string;
  isPublished: boolean;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const updatePublishState = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update content');
      }

      toast.success(isPublished ? 'Resource unpublished' : 'Resource published');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button variant={isPublished ? 'outline' : 'default'} size="sm" onClick={updatePublishState} disabled={isSaving}>
      {isSaving ? 'Saving...' : isPublished ? 'Unpublish' : 'Publish'}
    </Button>
  );
}
