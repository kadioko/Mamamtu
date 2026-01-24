'use client';

import React, { useState } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/use-toast';

interface MedicalDocumentUploadProps {
  patientId: string;
  onSuccess?: (document: any) => void;
  onCancel?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'LAB_RESULT', label: 'Lab Results' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'IMAGING', label: 'Medical Imaging' },
  { value: 'CONSULTATION_REPORT', label: 'Consultation Report' },
  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
  { value: 'VACCINATION_RECORD', label: 'Vaccination Record' },
  { value: 'CONSENT_FORM', label: 'Consent Form' },
  { value: 'OTHER', label: 'Other' },
];

const LAB_TEST_TYPES = [
  { value: 'BLOOD_TEST', label: 'Blood Test' },
  { value: 'URINE_TEST', label: 'Urine Test' },
  { value: 'X_RAY', label: 'X-Ray' },
  { value: 'ULTRASOUND', label: 'Ultrasound' },
  { value: 'MRI', label: 'MRI' },
  { value: 'CT_SCAN', label: 'CT Scan' },
  { value: 'ECG', label: 'ECG/EKG' },
  { value: 'PATHOLOGY', label: 'Pathology' },
  { value: 'OTHER', label: 'Other' },
];

export function MedicalDocumentUpload({
  patientId,
  onSuccess,
  onCancel,
}: MedicalDocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [testType, setTestType] = useState('');
  const [testDate, setTestDate] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleFileSelect = async (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (!documentType || selectedFiles.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a document type and upload at least one file.',
        variant: 'destructive',
      });
      return;
    }

    if (documentType === 'LAB_RESULT' && !testType) {
      toast({
        title: 'Validation Error',
        description: 'Please select a test type for lab results.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      // Upload each file
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const metadata = {
          type: documentType === 'LAB_RESULT' ? 'lab-results' : 'medical-document',
          patientId,
          documentType,
          testType: documentType === 'LAB_RESULT' ? testType : undefined,
          testDate: documentType === 'LAB_RESULT' ? testDate : undefined,
          description,
        };

        formData.append('metadata', JSON.stringify(metadata));

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);

      toast({
        title: 'Upload Successful',
        description: `${results.length} document(s) uploaded successfully.`,
      });

      onSuccess?.(results);

      // Reset form
      setDocumentType('');
      setTestType('');
      setTestDate('');
      setDescription('');
      setSelectedFiles([]);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload documents.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload Medical Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lab Test Type (conditional) */}
        {documentType === 'LAB_RESULT' && (
          <div className="space-y-2">
            <Label htmlFor="test-type">Test Type *</Label>
            <Select value={testType} onValueChange={setTestType}>
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                {LAB_TEST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Test Date (conditional) */}
        {documentType === 'LAB_RESULT' && (
          <div className="space-y-2">
            <Label htmlFor="test-date">Test Date *</Label>
            <Input
              id="test-date"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add any relevant notes or descriptions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Documents *</Label>
          <FileUpload
            onUpload={handleFileSelect}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.dcm"
            multiple={true}
            maxSize={50 * 1024 * 1024} // 50MB for medical documents
            maxFiles={10}
          />
          <p className="text-xs text-gray-500">
            Accepted formats: PDF, Images (JPG, PNG), Documents (DOC, DOCX, TXT), DICOM
          </p>
        </div>

        {/* Upload Status */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              {selectedFiles.length} file(s) selected for upload
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleUpload}
            disabled={isUploading || !documentType || selectedFiles.length === 0}
            className="flex-1"
          >
            {isUploading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </>
            )}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={isUploading}>
              Cancel
            </Button>
          )}
        </div>

        {/* Security Notice */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
          <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-medium mb-1">Security Notice:</p>
            <p>
              All uploaded documents are encrypted and stored securely. 
              Access is logged and restricted to authorized healthcare providers only.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
