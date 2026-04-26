'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function EducationFileUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify({ type: 'education-resource' }));
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Upload failed');
      }
      const result = await response.json();
      onUploaded(result.file.url);
      toast.success('Education file uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <Input type="file" onChange={upload} disabled={isUploading} />
      <Button type="button" variant="outline" size="sm" disabled className="hidden">
        {isUploading ? 'Uploading...' : 'Upload'}
      </Button>
      <p className="text-xs text-muted-foreground">{isUploading ? 'Uploading to storage...' : 'Upload a PDF, image, or presentation and use its URL.'}</p>
    </div>
  );
}
