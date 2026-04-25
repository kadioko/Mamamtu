-- CreateEnum
CREATE TYPE "PregnancyStatus" AS ENUM ('ACTIVE', 'DELIVERED', 'LOST_TO_FOLLOW_UP', 'MISCARRIAGE', 'REFERRED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PATIENT_VIEWED', 'PATIENT_UPDATED', 'PATIENT_DELETED', 'MEDICAL_RECORD_VIEWED', 'MEDICAL_RECORD_CREATED', 'MEDICAL_RECORD_UPDATED', 'MEDICAL_RECORD_DELETED', 'EDUCATION_CONTENT_CREATED', 'EDUCATION_CONTENT_UPDATED', 'EDUCATION_CONTENT_DELETED', 'AUTH_EVENT');

-- CreateTable
CREATE TABLE "PregnancyEpisode" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" "PregnancyStatus" NOT NULL DEFAULT 'ACTIVE',
    "estimatedDueDate" TIMESTAMP(3),
    "lastMenstrualPeriod" TIMESTAMP(3),
    "gravida" INTEGER,
    "para" INTEGER,
    "riskLevel" INTEGER NOT NULL DEFAULT 0,
    "highRiskFlags" TEXT[],
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PregnancyEpisode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AntenatalVisit" (
    "id" TEXT NOT NULL,
    "pregnancyEpisodeId" TEXT NOT NULL,
    "visitDate" TIMESTAMP(3) NOT NULL,
    "gestationalAgeWeeks" INTEGER,
    "bloodPressure" TEXT,
    "weight" DOUBLE PRECISION,
    "fundalHeight" DOUBLE PRECISION,
    "fetalHeartRate" INTEGER,
    "dangerSigns" TEXT[],
    "interventions" TEXT[],
    "nextVisitDate" TIMESTAMP(3),
    "notes" TEXT,
    "recordedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AntenatalVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewbornRecord" (
    "id" TEXT NOT NULL,
    "motherPatientId" TEXT,
    "pregnancyEpisodeId" TEXT,
    "name" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "sex" TEXT,
    "birthWeight" DOUBLE PRECISION,
    "apgarOneMinute" INTEGER,
    "apgarFiveMinutes" INTEGER,
    "deliveryFacility" TEXT,
    "complications" TEXT[],
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewbornRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Immunization" (
    "id" TEXT NOT NULL,
    "newbornRecordId" TEXT NOT NULL,
    "vaccineName" TEXT NOT NULL,
    "doseLabel" TEXT,
    "administeredAt" TIMESTAMP(3) NOT NULL,
    "nextDueAt" TIMESTAMP(3),
    "facility" TEXT,
    "batchNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Immunization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "patientId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PregnancyEpisode_patientId_idx" ON "PregnancyEpisode"("patientId");
CREATE INDEX "PregnancyEpisode_status_idx" ON "PregnancyEpisode"("status");
CREATE INDEX "PregnancyEpisode_estimatedDueDate_idx" ON "PregnancyEpisode"("estimatedDueDate");
CREATE INDEX "PregnancyEpisode_riskLevel_idx" ON "PregnancyEpisode"("riskLevel");

-- CreateIndex
CREATE INDEX "AntenatalVisit_pregnancyEpisodeId_idx" ON "AntenatalVisit"("pregnancyEpisodeId");
CREATE INDEX "AntenatalVisit_visitDate_idx" ON "AntenatalVisit"("visitDate");
CREATE INDEX "AntenatalVisit_nextVisitDate_idx" ON "AntenatalVisit"("nextVisitDate");

-- CreateIndex
CREATE INDEX "NewbornRecord_motherPatientId_idx" ON "NewbornRecord"("motherPatientId");
CREATE INDEX "NewbornRecord_pregnancyEpisodeId_idx" ON "NewbornRecord"("pregnancyEpisodeId");
CREATE INDEX "NewbornRecord_dateOfBirth_idx" ON "NewbornRecord"("dateOfBirth");

-- CreateIndex
CREATE INDEX "Immunization_newbornRecordId_idx" ON "Immunization"("newbornRecordId");
CREATE INDEX "Immunization_administeredAt_idx" ON "Immunization"("administeredAt");
CREATE INDEX "Immunization_nextDueAt_idx" ON "Immunization"("nextDueAt");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_resource_resourceId_idx" ON "AuditLog"("resource", "resourceId");
CREATE INDEX "AuditLog_patientId_idx" ON "AuditLog"("patientId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "PregnancyEpisode" ADD CONSTRAINT "PregnancyEpisode_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AntenatalVisit" ADD CONSTRAINT "AntenatalVisit_pregnancyEpisodeId_fkey" FOREIGN KEY ("pregnancyEpisodeId") REFERENCES "PregnancyEpisode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "NewbornRecord" ADD CONSTRAINT "NewbornRecord_motherPatientId_fkey" FOREIGN KEY ("motherPatientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "NewbornRecord" ADD CONSTRAINT "NewbornRecord_pregnancyEpisodeId_fkey" FOREIGN KEY ("pregnancyEpisodeId") REFERENCES "PregnancyEpisode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Immunization" ADD CONSTRAINT "Immunization_newbornRecordId_fkey" FOREIGN KEY ("newbornRecordId") REFERENCES "NewbornRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
