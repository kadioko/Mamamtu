import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiAuth';
import { medicalDocumentService, avatarService } from '@/lib/storage/fileUpload';
import { z } from 'zod';

const uploadSchema = z.object({
  type: z.enum(['medical-document', 'lab-results', 'imaging', 'avatar']),
  patientId: z.string().uuid().optional(),
  documentType: z.string().optional(),
  testType: z.string().optional(),
  imagingType: z.string().optional(),
  testDate: z.string().datetime().optional(),
  studyDate: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    // Validate metadata
    const validatedMetadata = uploadSchema.parse(metadata);

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    let uploadedFile;

    switch (validatedMetadata.type) {
      case 'medical-document':
        if (!validatedMetadata.patientId || !validatedMetadata.documentType) {
          return NextResponse.json(
            { error: 'Patient ID and document type are required for medical documents' },
            { status: 400 }
          );
        }
        uploadedFile = await medicalDocumentService.uploadMedicalDocument(
          file,
          validatedMetadata.patientId,
          validatedMetadata.documentType,
          metadata
        );
        break;

      case 'lab-results':
        if (!validatedMetadata.patientId || !validatedMetadata.testType || !validatedMetadata.testDate) {
          return NextResponse.json(
            { error: 'Patient ID, test type, and test date are required for lab results' },
            { status: 400 }
          );
        }
        uploadedFile = await medicalDocumentService.uploadLabResults(
          file,
          validatedMetadata.patientId,
          validatedMetadata.testType,
          new Date(validatedMetadata.testDate)
        );
        break;

      case 'imaging':
        if (!validatedMetadata.patientId || !validatedMetadata.imagingType || !validatedMetadata.studyDate) {
          return NextResponse.json(
            { error: 'Patient ID, imaging type, and study date are required for medical imaging' },
            { status: 400 }
          );
        }
        uploadedFile = await medicalDocumentService.uploadImaging(
          file,
          validatedMetadata.patientId,
          validatedMetadata.imagingType,
          new Date(validatedMetadata.studyDate)
        );
        break;

      case 'avatar':
        // For avatar uploads, we'd get the user ID from the session
        // This is a simplified version - in production, get from auth context
        const userId = metadata.userId || 'default-user';
        uploadedFile = await avatarService.uploadAvatar(file, userId);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      file: uploadedFile,
    });

  } catch (error) {
    console.error('File upload error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          issues: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Handle multiple file uploads
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const metadata = JSON.parse(formData.get('metadata') as string || '{}');

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // For multiple uploads, we'll treat them as medical documents
    const validatedMetadata = uploadSchema.parse(metadata);
    
    if (!validatedMetadata.patientId) {
      return NextResponse.json(
        { error: 'Patient ID is required for multiple uploads' },
        { status: 400 }
      );
    }

    const uploadedFiles = await medicalDocumentService.uploadMultipleFiles(
      files,
      `patients/${validatedMetadata.patientId}`
    );

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    });

  } catch (error) {
    console.error('Multiple file upload error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
