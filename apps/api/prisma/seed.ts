import { readFileSync } from "node:fs";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { createProductSchema } from "../src/modules/products/schema.js";
const prisma = new PrismaClient();
try {
  const rows: unknown[] = JSON.parse(
    readFileSync(new URL("./demo-products.json", import.meta.url), "utf8"),
  );
  for (const row of rows) {
    const data = createProductSchema.parse(row);
    await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: data,
    });
  }
  console.log(
    `Ensured ${rows.length} demo catalog records exist. Existing records were preserved.`,
  );
} finally {
  await prisma.$disconnect();
}
