CREATE TYPE "ProductCollection" AS ENUM ('INTERIOR', 'EXTERIOR');
ALTER TABLE "Product" ADD COLUMN "collection" "ProductCollection" NOT NULL DEFAULT 'INTERIOR';
