-- CreateTable
CREATE TABLE "LabExam" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "laboratoryName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabExamResult" (
    "id" TEXT NOT NULL,
    "labExamId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "referenceRange" TEXT,
    "interpretation" TEXT,

    CONSTRAINT "LabExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LabExam_organizationId_examDate_idx" ON "LabExam"("organizationId", "examDate");

-- CreateIndex
CREATE INDEX "LabExam_patientId_examDate_idx" ON "LabExam"("patientId", "examDate");

-- CreateIndex
CREATE INDEX "LabExamResult_labExamId_idx" ON "LabExamResult"("labExamId");

-- CreateIndex
CREATE INDEX "LabExamResult_name_idx" ON "LabExamResult"("name");

-- AddForeignKey
ALTER TABLE "LabExam" ADD CONSTRAINT "LabExam_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabExam" ADD CONSTRAINT "LabExam_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabExamResult" ADD CONSTRAINT "LabExamResult_labExamId_fkey" FOREIGN KEY ("labExamId") REFERENCES "LabExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
