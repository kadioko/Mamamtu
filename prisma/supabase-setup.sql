-- ============================================================
-- MamaMtu - Supabase PostgreSQL Setup
-- Run this entire script in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'HEALTHCARE_PROVIDER', 'PATIENT', 'RECEPTIONIST');
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "AppointmentType" AS ENUM ('CONSULTATION', 'FOLLOW_UP', 'LAB_TEST', 'ULTRASOUND', 'VACCINATION', 'OTHER');

-- Users table
CREATE TABLE "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "emailVerificationToken" TEXT,
    "emailVerificationExpires" TIMESTAMP(3),
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PATIENT',
    "hashedPassword" TEXT,
    "salt" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "accountLockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");

-- Account table (NextAuth OAuth)
CREATE TABLE "Account" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- Session table (NextAuth)
CREATE TABLE "Session" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- VerificationToken table (NextAuth)
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Patient table
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "patientId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT DEFAULT 'Tanzania',
    "bloodType" TEXT,
    "allergies" TEXT,
    "medicalHistory" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "insuranceProvider" TEXT,
    "insuranceNumber" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Patient_patientId_key" ON "Patient"("patientId");
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");
CREATE INDEX "Patient_patientId_idx" ON "Patient"("patientId");
CREATE INDEX "Patient_lastName_firstName_idx" ON "Patient"("lastName", "firstName");
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");
CREATE INDEX "Patient_email_idx" ON "Patient"("email");

-- Appointment table
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "type" TEXT NOT NULL,
    "location" TEXT,
    "notes" TEXT,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Appointment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");
CREATE INDEX "Appointment_startTime_endTime_idx" ON "Appointment"("startTime", "endTime");
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");
CREATE INDEX "Appointment_createdById_idx" ON "Appointment"("createdById");

-- MedicalRecord table
CREATE TABLE "MedicalRecord" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "patientId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "diagnosis" TEXT,
    "symptoms" TEXT,
    "treatment" TEXT,
    "medications" TEXT,
    "labResults" TEXT,
    "vitals" TEXT,
    "appointmentId" TEXT,
    "healthcareProvider" TEXT,
    "facility" TEXT,
    "notes" TEXT,
    "attachments" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");
CREATE INDEX "MedicalRecord_recordType_idx" ON "MedicalRecord"("recordType");
CREATE INDEX "MedicalRecord_recordedBy_idx" ON "MedicalRecord"("recordedBy");
CREATE INDEX "MedicalRecord_createdAt_idx" ON "MedicalRecord"("createdAt");

-- ContentCategory table
CREATE TABLE "ContentCategory" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentCategory_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContentCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ContentCategory_name_key" ON "ContentCategory"("name");
CREATE UNIQUE INDEX "ContentCategory_slug_key" ON "ContentCategory"("slug");
CREATE INDEX "ContentCategory_name_idx" ON "ContentCategory"("name");
CREATE INDEX "ContentCategory_slug_idx" ON "ContentCategory"("slug");

-- Content table
CREATE TABLE "Content" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" INTEGER,
    "thumbnailUrl" TEXT,
    "videoUrl" TEXT,
    "fileUrl" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tags" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "averageRating" REAL DEFAULT 0,
    "ratingsCount" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Content_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Content_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Content_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ContentCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");
CREATE INDEX "Content_title_idx" ON "Content"("title");
CREATE INDEX "Content_slug_idx" ON "Content"("slug");
CREATE INDEX "Content_authorId_idx" ON "Content"("authorId");
CREATE INDEX "Content_categoryId_idx" ON "Content"("categoryId");
CREATE INDEX "Content_isPublished_idx" ON "Content"("isPublished");
CREATE INDEX "Content_isFeatured_idx" ON "Content"("isFeatured");

-- UserContentProgress table
CREATE TABLE "UserContentProgress" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "rating" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserContentProgress_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserContentProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserContentProgress_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "UserContentProgress_userId_idx" ON "UserContentProgress"("userId");
CREATE INDEX "UserContentProgress_contentId_idx" ON "UserContentProgress"("contentId");
CREATE INDEX "UserContentProgress_isCompleted_idx" ON "UserContentProgress"("isCompleted");
CREATE UNIQUE INDEX "UserContentProgress_userId_contentId_key" ON "UserContentProgress"("userId", "contentId");

-- ContentComment table
CREATE TABLE "ContentComment" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "body" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "parentId" TEXT,
    "isEdited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContentComment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ContentComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContentComment_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContentComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ContentComment"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "ContentComment_contentId_idx" ON "ContentComment"("contentId");
CREATE INDEX "ContentComment_userId_idx" ON "ContentComment"("userId");
CREATE INDEX "ContentComment_parentId_idx" ON "ContentComment"("parentId");

-- RelatedContents join table
CREATE TABLE "_RelatedContents" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RelatedContents_A_fkey" FOREIGN KEY ("A") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RelatedContents_B_fkey" FOREIGN KEY ("B") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "_RelatedContents_AB_unique" ON "_RelatedContents"("A", "B");
CREATE INDEX "_RelatedContents_B_index" ON "_RelatedContents"("B");

-- Notification table
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "patientId" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "readAt" TIMESTAMP(3),
    "metadata" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");
CREATE INDEX "Notification_scheduledFor_idx" ON "Notification"("scheduledFor");
CREATE INDEX "Notification_type_idx" ON "Notification"("type");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- NotificationPreference table
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "enableInApp" BOOLEAN NOT NULL DEFAULT true,
    "enableEmail" BOOLEAN NOT NULL DEFAULT true,
    "enableSMS" BOOLEAN NOT NULL DEFAULT false,
    "enablePush" BOOLEAN NOT NULL DEFAULT true,
    "appointmentReminders" BOOLEAN NOT NULL DEFAULT true,
    "labResults" BOOLEAN NOT NULL DEFAULT true,
    "medicationReminders" BOOLEAN NOT NULL DEFAULT true,
    "followUpAlerts" BOOLEAN NOT NULL DEFAULT true,
    "highRiskAlerts" BOOLEAN NOT NULL DEFAULT true,
    "systemAnnouncements" BOOLEAN NOT NULL DEFAULT true,
    "reminderHoursBefore" INTEGER NOT NULL DEFAULT 24,
    "quietHoursStart" INTEGER,
    "quietHoursEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- Prisma migrations tracking table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) NOT NULL,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMPTZ,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMPTZ,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
