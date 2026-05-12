-- CreateTable
CREATE TABLE "Recall" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "referenceDate" TIMESTAMP(3),
    "generalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recall_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecallMeal" (
    "id" TEXT NOT NULL,
    "recallId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "time" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "RecallMeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecallMealItem" (
    "id" TEXT NOT NULL,
    "recallMealId" TEXT NOT NULL,
    "foodId" TEXT,
    "foodName" TEXT NOT NULL,
    "portion" TEXT NOT NULL,
    "quantity" DECIMAL(8,2) NOT NULL,
    "calories" DECIMAL(8,2) NOT NULL,
    "protein" DECIMAL(8,2) NOT NULL,
    "carbs" DECIMAL(8,2) NOT NULL,
    "fat" DECIMAL(8,2) NOT NULL,
    "fiber" DECIMAL(8,2),
    "notes" TEXT,

    CONSTRAINT "RecallMealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Recall_organizationId_createdAt_idx" ON "Recall"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "Recall_patientId_referenceDate_idx" ON "Recall"("patientId", "referenceDate");

-- CreateIndex
CREATE INDEX "RecallMeal_recallId_idx" ON "RecallMeal"("recallId");

-- CreateIndex
CREATE INDEX "RecallMealItem_recallMealId_idx" ON "RecallMealItem"("recallMealId");

-- CreateIndex
CREATE INDEX "RecallMealItem_foodId_idx" ON "RecallMealItem"("foodId");

-- AddForeignKey
ALTER TABLE "Recall" ADD CONSTRAINT "Recall_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recall" ADD CONSTRAINT "Recall_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecallMeal" ADD CONSTRAINT "RecallMeal_recallId_fkey" FOREIGN KEY ("recallId") REFERENCES "Recall"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecallMealItem" ADD CONSTRAINT "RecallMealItem_recallMealId_fkey" FOREIGN KEY ("recallMealId") REFERENCES "RecallMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
