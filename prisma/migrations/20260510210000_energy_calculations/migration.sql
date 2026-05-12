CREATE TABLE "EnergyCalculation" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "formula" TEXT NOT NULL,
  "sex" "Sex" NOT NULL,
  "age" INTEGER NOT NULL,
  "weightKg" DECIMAL(6,2) NOT NULL,
  "heightCm" DECIMAL(6,2) NOT NULL,
  "activityFactor" DECIMAL(4,3) NOT NULL,
  "basalMetabolicRate" DECIMAL(8,2) NOT NULL,
  "totalEnergyExpenditure" DECIMAL(8,2) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EnergyCalculation_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnergyCalculation_organizationId_createdAt_idx" ON "EnergyCalculation"("organizationId", "createdAt");
CREATE INDEX "EnergyCalculation_patientId_createdAt_idx" ON "EnergyCalculation"("patientId", "createdAt");

ALTER TABLE "EnergyCalculation" ADD CONSTRAINT "EnergyCalculation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnergyCalculation" ADD CONSTRAINT "EnergyCalculation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
