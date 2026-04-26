'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UploadedFile = {
  url: string;
  originalName: string;
};

export function FileUploadField({
  patientId,
  onUploaded,
}: {
  patientId?: string;
  onUploaded: (files: UploadedFile[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  async function upload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      if (files.length === 1) formData.append('file', files[0]);
      else files.forEach((file) => formData.append('files', file));
      formData.append('metadata', JSON.stringify({
        type: 'medical-document',
        patientId,
        documentType: 'clinical-attachment',
      }));

      const response = await fetch('/api/upload', {
        method: files.length === 1 ? 'POST' : 'PUT',
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Upload failed');
      }
      const result = await response.json();
      const uploaded = result.files || [result.file];
      onUploaded(uploaded.map((file: UploadedFile) => ({ url: file.url, originalName: file.originalName })));
      toast.success('File uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Attachments</Label>
      <Input id="file-upload" type="file" multiple onChange={upload} disabled={isUploading || !patientId} />
      <p className="text-xs text-muted-foreground">
        {isUploading ? 'Uploading...' : 'Upload PDFs, images, or clinical documents. Vercel Blob is used in production.'}
      </p>
    </div>
  );
}
