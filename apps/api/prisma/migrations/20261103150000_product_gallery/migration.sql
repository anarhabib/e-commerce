ALTER TABLE "Product" ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
UPDATE "Product" SET "imageUrls" = ARRAY["imageUrl"] WHERE "imageUrl" IS NOT NULL;
CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "data" BYTEA NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);
