-- CreateTable
CREATE TABLE "SupplementPrescription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "prescribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" TEXT,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplementPrescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplementPrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "frequency" TEXT,
    "timing" TEXT,
    "instructions" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SupplementPrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplementPrescription_organizationId_prescribedAt_idx" ON "SupplementPrescription"("organizationId", "prescribedAt");

-- CreateIndex
CREATE INDEX "SupplementPrescription_patientId_prescribedAt_idx" ON "SupplementPrescription"("patientId", "prescribedAt");

-- CreateIndex
CREATE INDEX "SupplementPrescriptionItem_prescriptionId_idx" ON "SupplementPrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "SupplementPrescriptionItem_category_idx" ON "SupplementPrescriptionItem"("category");

-- AddForeignKey
ALTER TABLE "SupplementPrescription" ADD CONSTRAINT "SupplementPrescription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementPrescription" ADD CONSTRAINT "SupplementPrescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplementPrescriptionItem" ADD CONSTRAINT "SupplementPrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "SupplementPrescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
