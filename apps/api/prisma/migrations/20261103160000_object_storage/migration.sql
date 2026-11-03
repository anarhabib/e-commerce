-- Preserve existing image bytes. New uploads may use the private Neon bucket.
ALTER TABLE "MediaAsset" ALTER COLUMN "data" DROP NOT NULL;
ALTER TABLE "MediaAsset" ADD COLUMN "objectKey" TEXT;
CREATE UNIQUE INDEX "MediaAsset_objectKey_key" ON "MediaAsset"("objectKey");
