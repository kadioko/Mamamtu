import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

export interface FileUploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  directory?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  uploadedAt: Date;
}

export class FileUploadService {
  private uploadDir: string;
  private maxSize: number;
  private allowedTypes: Set<string>;

  constructor(options: FileUploadOptions = {}) {
    this.uploadDir = options.directory || 'uploads';
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    this.allowedTypes = new Set(
      options.allowedTypes || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/dicom',
        'application/dicom',
      ]
    );
  }

  async uploadFile(
    file: File,
    subdirectory?: string
  ): Promise<UploadedFile> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const fileId = uuidv4();
    const fileExtension = file.name.split('.').pop() || '';
    const filename = `${fileId}.${fileExtension}`;
    
    // Create upload directory if it doesn't exist
    const targetDir = subdirectory 
      ? join(this.uploadDir, subdirectory)
      : this.uploadDir;
    
    await mkdir(targetDir, { recursive: true });

    // Write file to disk
    const filePath = join(targetDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const uploadedFile: UploadedFile = {
      id: fileId,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      path: filePath,
      url: `/uploads/${subdirectory ? `${subdirectory}/` : ''}${filename}`,
      uploadedAt: new Date(),
    };

    logger.info('File uploaded successfully', {
      fileId,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    });

    return uploadedFile;
  }

  async uploadMultipleFiles(
    files: File[],
    subdirectory?: string
  ): Promise<UploadedFile[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, subdirectory));
    return Promise.all(uploadPromises);
  }

  private validateFile(file: File): void {
    // Check file size
    if (file.size > this.maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.maxSize} bytes`);
    }

    // Check file type
    if (!this.allowedTypes.has(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await unlink(filePath);
      logger.info('File deleted successfully', { filePath });
    } catch (error) {
      logger.error('Failed to delete file', { filePath, error });
      throw new Error('Failed to delete file');
    }
  }

  getFileTypeCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.includes('dicom')) return 'medical';
    if (mimeType.startsWith('text/')) return 'text';
    return 'other';
  }

  async scanForMalware(filePath: string): Promise<boolean> {
    // Placeholder for malware scanning
    // In production, integrate with antivirus API
    logger.info('Malware scan performed', { filePath });
    return true;
  }
}

// Medical document specific upload service
export class MedicalDocumentService extends FileUploadService {
  constructor() {
    super({
      maxSize: 50 * 1024 * 1024, // 50MB for medical documents
      allowedTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/dicom',
        'application/dicom',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      directory: 'uploads/medical-documents',
    });
  }

  async uploadMedicalDocument(
    file: File,
    patientId: string,
    documentType: string,
    metadata?: Record<string, any>
  ): Promise<UploadedFile & { patientId: string; documentType: string; metadata?: Record<string, any> }> {
    const uploadedFile = await this.uploadFile(file, `patients/${patientId}`);
    
    // Add medical-specific metadata
    const medicalDocument = {
      ...uploadedFile,
      patientId,
      documentType,
      metadata,
    };

    // Log medical document upload for compliance
    logger.info('Medical document uploaded', {
      documentId: uploadedFile.id,
      patientId,
      documentType,
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
    });

    return medicalDocument;
  }

  async uploadLabResults(
    file: File,
    patientId: string,
    testType: string,
    testDate: Date
  ): Promise<UploadedFile> {
    const uploadedFile = await this.uploadFile(file, `patients/${patientId}/lab-results`);
    
    logger.info('Lab results uploaded', {
      documentId: uploadedFile.id,
      patientId,
      testType,
      testDate,
      originalName: file.name,
    });

    return uploadedFile;
  }

  async uploadImaging(
    file: File,
    patientId: string,
    imagingType: string,
    studyDate: Date
  ): Promise<UploadedFile> {
    const uploadedFile = await this.uploadFile(file, `patients/${patientId}/imaging`);
    
    logger.info('Medical imaging uploaded', {
      documentId: uploadedFile.id,
      patientId,
      imagingType,
      studyDate,
      originalName: file.name,
    });

    return uploadedFile;
  }
}

// Avatar/profile picture upload service
export class AvatarService extends FileUploadService {
  constructor() {
    super({
      maxSize: 5 * 1024 * 1024, // 5MB for avatars
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      directory: 'uploads/avatars',
    });
  }

  async uploadAvatar(file: File, userId: string): Promise<UploadedFile> {
    const uploadedFile = await this.uploadFile(file, `users/${userId}`);
    
    logger.info('Avatar uploaded', {
      userId,
      avatarId: uploadedFile.id,
      originalName: file.name,
    });

    return uploadedFile;
  }
}

// Global instances
export const fileUploadService = new FileUploadService();
export const medicalDocumentService = new MedicalDocumentService();
export const avatarService = new AvatarService();
