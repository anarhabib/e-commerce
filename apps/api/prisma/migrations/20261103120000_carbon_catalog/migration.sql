-- The owner explicitly approved discarding the old lighting catalog and its data.
-- Keep the original migration history intact; apply this transition after it.
BEGIN;
DELETE FROM "Product";
ALTER TABLE "Product" DROP COLUMN "color", DROP COLUMN "side";
ALTER TYPE "ProductCategory" RENAME TO "ProductCategory_lighting";
CREATE TYPE "ProductCategory" AS ENUM ('PADDLES', 'CONSOLE', 'TRIM');
ALTER TABLE "Product" ALTER COLUMN "category" TYPE "ProductCategory"
  USING ("category"::text::"ProductCategory");
DROP TYPE "ProductCategory_lighting";
COMMIT;