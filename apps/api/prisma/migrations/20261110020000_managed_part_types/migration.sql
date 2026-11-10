BEGIN;
CREATE TABLE "PartType" (
  "code" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "nameKey" TEXT NOT NULL,
  "collection" "ProductCollection" NOT NULL
);
CREATE UNIQUE INDEX "PartType_code_collection_key" ON "PartType"("code", "collection");
CREATE UNIQUE INDEX "PartType_collection_nameKey_key" ON "PartType"("collection", "nameKey");
ALTER TABLE "Product" ALTER COLUMN "category" TYPE TEXT USING "category"::text;
DROP TYPE "ProductCategory";
INSERT INTO "PartType" ("code", "name", "nameKey", "collection")
SELECT DISTINCT "category", initcap(lower("category")), lower("category"), 'INTERIOR'::"ProductCollection"
FROM "Product" WHERE "collection" = 'INTERIOR';
-- Preserve any existing Exterior assignments of the former fixed part types.
INSERT INTO "PartType" ("code", "name", "nameKey", "collection")
SELECT DISTINCT "category" || '_EXTERIOR', initcap(lower("category")), lower("category"), 'EXTERIOR'::"ProductCollection"
FROM "Product" WHERE "collection" = 'EXTERIOR';
UPDATE "Product" SET "category" = "category" || '_EXTERIOR' WHERE "collection" = 'EXTERIOR';
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_collection_fkey"
FOREIGN KEY ("category", "collection") REFERENCES "PartType"("code", "collection") ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
