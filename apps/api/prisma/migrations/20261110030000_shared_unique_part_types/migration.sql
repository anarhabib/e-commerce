BEGIN;
ALTER TABLE "Product" DROP CONSTRAINT "Product_category_collection_fkey";
-- Preserve product collection, sharing one type across Interior and Exterior.
CREATE TEMP TABLE part_type_merge ON COMMIT DROP AS
SELECT code, first_value(code) OVER (
  PARTITION BY lower(regexp_replace(trim(normalize(name, NFKC)), '\s+', ' ', 'g'))
  ORDER BY length(code), code
) AS canonical FROM "PartType";
UPDATE "Product" p SET category = m.canonical
FROM part_type_merge m WHERE p.category = m.code AND m.code <> m.canonical;
DELETE FROM "PartType" t USING part_type_merge m
WHERE t.code = m.code AND m.code <> m.canonical;
DROP INDEX "PartType_code_collection_key";
DROP INDEX "PartType_collection_nameKey_key";
ALTER TABLE "PartType" DROP COLUMN collection;
UPDATE "PartType" SET name = regexp_replace(trim(normalize(name, NFKC)), '\s+', ' ', 'g'),
  "nameKey" = lower(regexp_replace(trim(normalize(name, NFKC)), '\s+', ' ', 'g'));
CREATE UNIQUE INDEX "PartType_nameKey_key" ON "PartType"("nameKey");
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_fkey" FOREIGN KEY (category)
  REFERENCES "PartType"(code) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
