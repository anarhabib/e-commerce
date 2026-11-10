import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { hashPassword, signIn } from "../src/modules/admin/auth.js";

test("part types are created atomically with products, reused by normalized name, collection-scoped and owner-only", async () => {
  process.env.ADMIN_EMAIL = "types-test@example.com";
  process.env.ADMIN_PASSWORD_HASH = hashPassword("temporary-part-types-test");
  process.env.ADMIN_SESSION_SECRET = randomUUID() + randomUUID();
  const headers = {
    authorization: `Bearer ${signIn(process.env.ADMIN_EMAIL, "temporary-part-types-test")}`,
  };
  const app = buildApp();
  app.log.level = "silent";
  const suffix = randomUUID();
  const ids: string[] = [];
  const codes = new Set<string>();
  const base = {
    name: `Temporary ${suffix}`,
    sku: `PT-${suffix}`,
    slug: `pt-${suffix}`,
    description: "Temporary test only",
    priceCents: 10000,
    stock: 1,
  };
  async function create(extra: object) {
    const response = await app.inject({
      method: "POST",
      url: "/admin/products",
      headers,
      payload: { ...base, price: "100", ...extra, priceCents: undefined },
    });
    if (response.statusCode === 201) {
      ids.push(response.json().id);
      codes.add(response.json().category);
    }
    return response;
  }
  try {
    assert.equal(
      (await app.inject({ method: "GET", url: "/admin/part-types" }))
        .statusCode,
      401,
    );
    const name = `Mirror covers ${suffix}`;
    const first = await create({
      partTypeName: `  Mirror   covers ${suffix}  `,
      collection: "EXTERIOR",
    });
    assert.equal(first.statusCode, 201, first.body);
    const type = first.json().category;
    const second = await create({
      sku: `PT2-${suffix}`,
      slug: `pt2-${suffix}`,
      partTypeName: name.toUpperCase(),
      collection: "EXTERIOR",
    });
    assert.equal(second.statusCode, 201, second.body);
    assert.equal(second.json().category, type);
    const interior = await create({
      sku: `PT3-${suffix}`,
      slug: `pt3-${suffix}`,
      partTypeName: name,
      collection: "INTERIOR",
    });
    assert.equal(interior.statusCode, 201, interior.body);
    assert.notEqual(interior.json().category, type);
    const mismatch = await create({
      sku: `PT4-${suffix}`,
      slug: `pt4-${suffix}`,
      category: type,
      collection: "INTERIOR",
    });
    assert.equal(mismatch.statusCode, 400);
    const unknown = await create({
      sku: `PT5-${suffix}`,
      slug: `pt5-${suffix}`,
      category: "UNKNOWN_CODE",
      collection: "INTERIOR",
    });
    assert.equal(unknown.statusCode, 400);
    const rollbackName = `Rollback ${suffix}`;
    assert.equal(
      (await create({ partTypeName: rollbackName, collection: "EXTERIOR" }))
        .statusCode,
      409,
    );
    assert.equal(
      await prisma.partType.count({
        where: { nameKey: rollbackName.toLowerCase() },
      }),
      0,
    );
    const list = await app.inject({
      method: "GET",
      url: "/admin/part-types",
      headers,
    });
    assert.equal(list.statusCode, 200);
    assert(
      list
        .json()
        .partTypes.some(
          (item: { code: string; name: string }) =>
            item.code === type && item.name === name,
        ),
    );
    const filters = await app.inject({
      method: "GET",
      url: "/products/filters?collection=EXTERIOR",
    });
    assert(
      filters
        .json()
        .categories.some(
          (item: { value: string; label: string; count: number }) =>
            item.value === type && item.label === name && item.count === 2,
        ),
    );
    const filtered = await app.inject({
      method: "GET",
      url: `/products?category=${type}&collection=EXTERIOR`,
    });
    assert.equal(filtered.json().total, 2);
    const updated = await app.inject({
      method: "PATCH",
      url: `/admin/products/${ids[0]}`,
      headers,
      payload: { price: "100", partTypeName: `Edited ${suffix}` },
    });
    assert.equal(updated.statusCode, 200, updated.body);
    codes.add(updated.json().category);
    assert.notEqual(updated.json().category, type);
    const invalidUpdate = await app.inject({
      method: "PATCH",
      url: `/products/${ids[1]}`,
      headers,
      payload: { category: type, partTypeName: "Both" },
    });
    assert.equal(invalidUpdate.statusCode, 400);
    const failedUpdate = await app.inject({
      method: "PATCH",
      url: `/products/${ids[1]}`,
      headers,
      payload: { sku: interior.json().sku, partTypeName: rollbackName },
    });
    assert.equal(failedUpdate.statusCode, 409);
    assert.equal(
      await prisma.partType.count({
        where: { nameKey: rollbackName.toLowerCase() },
      }),
      0,
    );
    const concurrentName = `Concurrent ${suffix}`;
    const concurrent = await Promise.all(
      [1, 2].map((index) =>
        create({
          sku: `PTc${index}-${suffix}`,
          slug: `pt-concurrent-${index}-${suffix}`,
          partTypeName: concurrentName,
          collection: "EXTERIOR",
        }),
      ),
    );
    for (const result of concurrent)
      assert.equal(result.statusCode, 201, result.body);
    assert.equal(concurrent[0].json().category, concurrent[1].json().category);
  } finally {
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    await prisma.partType.deleteMany({ where: { code: { in: [...codes] } } });
    await app.close();
  }
});
