CREATE TYPE "CarbonPattern" AS ENUM ('Woven', 'Forged');
CREATE TYPE "CarbonFinish" AS ENUM ('Gloss', 'Satin', 'Matte');
ALTER TABLE "Product"
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
  ADD COLUMN "photoIndex" INTEGER,
  ADD COLUMN "isSample" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "patterns" "CarbonPattern"[] NOT NULL DEFAULT ARRAY['Woven','Forged']::"CarbonPattern"[],
  ADD COLUMN "finishes" "CarbonFinish"[] NOT NULL DEFAULT ARRAY['Gloss','Satin','Matte']::"CarbonFinish"[];
ALTER TABLE "Product" ADD CONSTRAINT "Product_photoIndex_check"
  CHECK ("photoIndex" IS NULL OR "photoIndex" BETWEEN 0 AND 3);