-- CreateEnum
CREATE TYPE "FoodDiaryStatus" AS ENUM ('PENDING', 'APPROVED', 'NEEDS_ADJUSTMENT');

-- CreateTable
CREATE TABLE "FoodDiaryEntry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "entryTime" TEXT,
    "description" TEXT NOT NULL,
    "photoUrl" TEXT,
    "status" "FoodDiaryStatus" NOT NULL DEFAULT 'PENDING',
    "feedbackNote" TEXT,
    "feedbackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodDiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FoodDiaryEntry_organizationId_entryDate_idx" ON "FoodDiaryEntry"("organizationId", "entryDate");

-- CreateIndex
CREATE INDEX "FoodDiaryEntry_patientId_entryDate_idx" ON "FoodDiaryEntry"("patientId", "entryDate");

-- CreateIndex
CREATE INDEX "FoodDiaryEntry_organizationId_status_idx" ON "FoodDiaryEntry"("organizationId", "status");

-- AddForeignKey
ALTER TABLE "FoodDiaryEntry" ADD CONSTRAINT "FoodDiaryEntry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodDiaryEntry" ADD CONSTRAINT "FoodDiaryEntry_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
