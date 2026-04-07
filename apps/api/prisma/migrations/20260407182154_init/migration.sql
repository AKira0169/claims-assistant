-- CreateEnum
CREATE TYPE "ClaimType" AS ENUM ('AUTO', 'PROPERTY', 'HEALTH', 'OTHER');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ClaimPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "type" "ClaimType" NOT NULL,
    "status" "ClaimStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "ClaimPriority" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "incidentDate" TIMESTAMP(3),
    "reportDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedAmount" DOUBLE PRECISION,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claimants" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "policyNumber" TEXT NOT NULL,

    CONSTRAINT "claimants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_details" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "detailType" "ClaimType" NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "claim_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim_documents" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_extraction_logs" (
    "id" TEXT NOT NULL,
    "claimId" TEXT,
    "inputText" TEXT NOT NULL,
    "extractedData" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_extraction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "claims_claimNumber_key" ON "claims"("claimNumber");

-- CreateIndex
CREATE UNIQUE INDEX "claimants_claimId_key" ON "claimants"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "claim_details_claimId_key" ON "claim_details"("claimId");

-- AddForeignKey
ALTER TABLE "claimants" ADD CONSTRAINT "claimants_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_details" ADD CONSTRAINT "claim_details_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_documents" ADD CONSTRAINT "claim_documents_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_extraction_logs" ADD CONSTRAINT "ai_extraction_logs_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE SET NULL ON UPDATE CASCADE;
