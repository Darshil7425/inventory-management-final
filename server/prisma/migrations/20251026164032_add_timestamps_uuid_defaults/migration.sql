
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Products' AND column_name = 'createdAt'
  ) THEN
    ALTER TABLE "Products"
      ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Products' AND column_name = 'updatedAt'
  ) THEN
    ALTER TABLE "Products"
      ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
  END IF;
END$$;

-- Backfill any NULLs (in case a previous attempt added the column w/o default)
UPDATE "Products"
SET "updatedAt" = CURRENT_TIMESTAMP
WHERE "updatedAt" IS NULL;
