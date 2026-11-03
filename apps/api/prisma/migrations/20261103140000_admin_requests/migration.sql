ALTER TABLE "Product" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
CREATE TYPE "RequestStatus" AS ENUM ('requested', 'in_review', 'quoted', 'in_production', 'shipped', 'cancelled');
CREATE TABLE "OrderRequest" (
  "id" TEXT NOT NULL,
  "customer" JSONB NOT NULL,
  "items" JSONB NOT NULL,
  "totalCents" INTEGER NOT NULL,
  "status" "RequestStatus" NOT NULL DEFAULT 'requested',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderRequest_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "OrderRequest_status_createdAt_idx" ON "OrderRequest"("status", "createdAt");
