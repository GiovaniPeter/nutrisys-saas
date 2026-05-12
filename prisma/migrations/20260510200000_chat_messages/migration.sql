CREATE TYPE "ChatSender" AS ENUM ('PROFESSIONAL', 'PATIENT');

CREATE TABLE "ChatMessage" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "sender" "ChatSender" NOT NULL,
  "text" TEXT NOT NULL,
  "attachmentUrl" TEXT,
  "attachmentType" TEXT,
  "readByProfessionalAt" TIMESTAMP(3),
  "readByPatientAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChatMessage_organizationId_createdAt_idx" ON "ChatMessage"("organizationId", "createdAt");
CREATE INDEX "ChatMessage_patientId_createdAt_idx" ON "ChatMessage"("patientId", "createdAt");
CREATE INDEX "ChatMessage_organizationId_readByProfessionalAt_idx" ON "ChatMessage"("organizationId", "readByProfessionalAt");

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
