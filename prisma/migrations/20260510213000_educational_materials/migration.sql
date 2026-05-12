CREATE TABLE "EducationalMaterial" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "audience" TEXT,
  "description" TEXT,
  "content" TEXT,
  "designUrl" TEXT,
  "imageUrl" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EducationalMaterial_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EducationalMaterial_organizationId_createdAt_idx" ON "EducationalMaterial"("organizationId", "createdAt");
CREATE INDEX "EducationalMaterial_organizationId_category_idx" ON "EducationalMaterial"("organizationId", "category");

ALTER TABLE "EducationalMaterial" ADD CONSTRAINT "EducationalMaterial_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
