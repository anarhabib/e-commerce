import { readFileSync } from "node:fs";
import { prisma } from "../src/lib/prisma.js";
import { createProductSchema } from "../src/modules/products/schema.js";
try {
  const rows: unknown[] = JSON.parse(
    readFileSync(new URL("./demo-products.json", import.meta.url), "utf8"),
  );
  for (const row of rows) {
    const data = createProductSchema.parse(row);
    if (!data.category || data.partTypeName)
      throw new Error(
        "Demo fixtures must reference their existing part type code",
      );
    const name = data.category
      .toLowerCase()
      .replaceAll("_", " ")
      .replace(/^./, (value) => value.toUpperCase());
    await prisma.partType.upsert({
      where: { code: data.category },
      update: {},
      create: {
        code: data.category,
        name,
        nameKey: name.toLowerCase(),
      },
    });
    const { partTypeName, ...fields } = data;
    void partTypeName;
    await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: { ...fields, category: data.category },
    });
  }
  console.log(
    `Ensured ${rows.length} demo catalog records exist. Existing records were preserved.`,
  );
} finally {
  await prisma.$disconnect();
}
