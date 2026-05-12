ALTER TABLE "Patient" ADD COLUMN "portalAccessCode" TEXT;
ALTER TABLE "Patient" ADD COLUMN "portalEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Patient_portalAccessCode_key" ON "Patient"("portalAccessCode");
