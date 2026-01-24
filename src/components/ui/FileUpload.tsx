'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, File, Image, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function FileUpload({
  onUpload,
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.csv,.xls,.xlsx',
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 5,
  className,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
      return [];
    }

    Array.from(files).forEach((file) => {
      if (file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
        return;
      }

      if (accept && !isFileTypeAccepted(file, accept)) {
        errors.push(`${file.name} is not an accepted file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      throw new Error(errors.join('\n'));
    }

    return validFiles;
  }, [maxSize, maxFiles, accept]);

  const handleFiles = useCallback(async (files: FileList) => {
    try {
      const validFiles = validateFiles(files);
      
      const newUploads: UploadProgress[] = validFiles.map(file => ({
        file,
        progress: 0,
        status: 'pending',
      }));

      setUploads(prev => [...prev, ...newUploads]);

      // Simulate upload progress
      for (let i = 0; i < newUploads.length; i++) {
        const upload = newUploads[i];
        
        // Update status to uploading
        setUploads(prev => 
          prev.map(u => 
            u.file === upload.file 
              ? { ...u, status: 'uploading' as const }
              : u
          )
        );

        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setUploads(prev => 
            prev.map(u => 
              u.file === upload.file 
                ? { ...u, progress }
                : u
            )
          );
        }

        // Mark as success
        setUploads(prev => 
          prev.map(u => 
            u.file === upload.file 
              ? { ...u, status: 'success' as const, progress: 100 }
              : u
          )
        );
      }

      // Call the upload callback
      await onUpload(validFiles);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Mark all pending uploads as error
      setUploads(prev => 
        prev.map(u => 
          u.status === 'pending' || u.status === 'uploading'
            ? { ...u, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
            : u
        )
      );
    }
  }, [validateFiles, onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [disabled, handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeUpload = useCallback((file: File) => {
    setUploads(prev => prev.filter(u => u.file !== file));
  }, []);

  const getFileIcon = useCallback((file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  }, []);

  const getStatusColor = useCallback((status: UploadProgress['status']) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'uploading': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors',
          isDragging && 'border-blue-400 bg-blue-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 mb-2">
              {disabled ? 'Upload disabled' : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max {formatFileSize(maxSize)}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
            >
              Select Files
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getFileIcon(upload.file)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium truncate">
                      {upload.file.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs', getStatusColor(upload.status))}>
                        {upload.status}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(upload.file)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {upload.status === 'uploading' && (
                    <Progress value={upload.progress} className="h-2" />
                  )}
                  
                  {upload.status === 'error' && (
                    <div className="flex items-center gap-2 mt-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-xs text-red-600">{upload.error}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(upload.file.size)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isFileTypeAccepted(file: File, accept: string): boolean {
  const acceptedTypes = accept.split(',').map(type => type.trim());
  const fileName = file.name.toLowerCase();
  
  return acceptedTypes.some(type => {
    if (type.startsWith('.')) {
      return fileName.endsWith(type.toLowerCase());
    }
    return file.type === type;
  });
}
