-- Add SectorId column to Direktorlukler table
ALTER TABLE "Direktorlukler" 
ADD COLUMN IF NOT EXISTS "SektorId" INTEGER NULL;

-- Add foreign key constraint
ALTER TABLE "Direktorlukler"
ADD CONSTRAINT "FK_Direktorlukler_Sektorler" 
FOREIGN KEY ("SektorId") 
REFERENCES "Sektorler"("Id") 
ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS "IX_Direktorlukler_SektorId" 
ON "Direktorlukler"("SektorId");

-- Update existing directorates if needed (optional - you may want to set SectorId manually)
-- UPDATE "Direktorlukler" SET "SektorId" = 1 WHERE "SektorId" IS NULL;

