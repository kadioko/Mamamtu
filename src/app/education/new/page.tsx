'use client';

import { ContentEditor } from '@/components/education/content-editor';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewContentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: unknown) => {
    try {
      setIsSubmitting(true);

      const input =
        data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
      const isPublished = input.isPublished === true;
      
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          isPublished,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      const result = await response.json();
      
      toast.success('Content created successfully!');
      router.push(`/education/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating content:', error);
      toast.error('Failed to create content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Content</h1>
          <p className="text-muted-foreground">
            Add a new educational resource to the platform
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      <ContentEditor 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
      />
    </div>
  );
}
