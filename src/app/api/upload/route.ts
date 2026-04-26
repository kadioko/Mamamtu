import { NextRequest, NextResponse } from 'next/server';
import { AuthenticatedRequest, withAuth } from '@/lib/apiAuth';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { medicalDocumentService, avatarService, fileUploadService } from '@/lib/storage/fileUpload';
import { z } from 'zod';

const uploadSchema = z.object({
  type: z.enum(['medical-document', 'lab-results', 'imaging', 'avatar', 'education-resource']),
  patientId: z.string().uuid().optional(),
  documentType: z.string().optional(),
  testType: z.string().optional(),
  imagingType: z.string().optional(),
  testDate: z.string().datetime().optional(),
  studyDate: z.string().datetime().optional(),
});

async function canUploadForPatient(
  request: AuthenticatedRequest,
  patientId: string
): Promise<boolean> {
  const role = request.user?.role;

  if (role === UserRole.ADMIN || role === UserRole.HEALTHCARE_PROVIDER) {
    return true;
  }

  if (role !== UserRole.PATIENT || !request.user?.id) {
    return false;
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { userId: true },
  });

  return patient?.userId === request.user.id;
}

const handlePost = async (request: AuthenticatedRequest) => {
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
        if (!(await canUploadForPatient(request, validatedMetadata.patientId))) {
          return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions for this patient' },
            { status: 403 }
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
        if (!(await canUploadForPatient(request, validatedMetadata.patientId))) {
          return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions for this patient' },
            { status: 403 }
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
        if (!(await canUploadForPatient(request, validatedMetadata.patientId))) {
          return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions for this patient' },
            { status: 403 }
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
        const userId = request.user?.id;
        if (!userId) {
          return NextResponse.json(
            { error: 'Authenticated user is required for avatar uploads' },
            { status: 401 }
          );
        }
        uploadedFile = await avatarService.uploadAvatar(file, userId);
        break;

      case 'education-resource':
        if (request.user?.role !== UserRole.ADMIN && request.user?.role !== UserRole.HEALTHCARE_PROVIDER) {
          return NextResponse.json(
            { error: 'Forbidden - Insufficient permissions for education uploads' },
            { status: 403 }
          );
        }
        uploadedFile = await fileUploadService.uploadFile(file, 'education');
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
};

// Handle multiple file uploads
const handlePut = async (request: AuthenticatedRequest) => {
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
    if (!(await canUploadForPatient(request, validatedMetadata.patientId))) {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions for this patient' },
        { status: 403 }
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
};

export const POST = withAuth(handlePost, {
  roles: [UserRole.ADMIN, UserRole.HEALTHCARE_PROVIDER, UserRole.PATIENT],
  requireEmailVerification: true,
});

export const PUT = withAuth(handlePut, {
  roles: [UserRole.ADMIN, UserRole.HEALTHCARE_PROVIDER, UserRole.PATIENT],
  requireEmailVerification: true,
});
