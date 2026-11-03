import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { buildApp } from "../src/app.js";
import { hashPassword, signIn } from "../src/modules/admin/auth.js";

test("local carbon API: writes, vehicle/category filters, facets and PATCH validation", async () => {
  process.env.ADMIN_EMAIL = "integration@example.com";
  process.env.ADMIN_PASSWORD_HASH = hashPassword("integration-test-only");
  process.env.ADMIN_SESSION_SECRET = randomUUID() + randomUUID();
  const headers = {
    authorization: `Bearer ${signIn(process.env.ADMIN_EMAIL, "integration-test-only")}`,
  };
  const app = buildApp();
  app.log.level = "silent";
  const ids: string[] = [];
  const suffix = randomUUID();
  const make = `Integration-${suffix}`;
  const base = {
    name: "Integration test only",
    description: "Temporary API test; removed after verification",
    make,
    model: "Test model",
    yearFrom: 2015,
    yearTo: 2020,
    priceCents: 12500,
    stock: 2,
    patterns: ["Forged"],
    finishes: ["Matte"],
    imageUrl: "/carbignite/products.webp",
    photoIndex: 2,
  };
  try {
    for (const category of ["PADDLES", "TRIM"]) {
      const response = await app.inject({
        method: "POST",
        headers,
        url: "/products",
        payload: {
          ...base,
          category,
          sku: `${category}-${suffix}`,
          slug: `${category.toLowerCase()}-${suffix}`,
        },
      });
      assert.equal(response.statusCode, 201, response.body);
      ids.push(response.json().id);
    }
    const stored = await app.inject({
      method: "GET",
      url: `/products/${ids[0]}`,
    });
    assert.deepEqual(stored.json().patterns, ["Forged"]);
    assert.deepEqual(stored.json().finishes, ["Matte"]);
    assert.equal(stored.json().photoIndex, 2);
    const query = new URLSearchParams({
      make,
      model: "Test model",
      year: "2018",
      category: "PADDLES",
      limit: "1",
    });
    const listed = await app.inject({
      method: "GET",
      url: `/products?${query}`,
    });
    assert.equal(listed.statusCode, 200);
    assert.equal(listed.json().total, 1);
    assert.equal(listed.json().products[0].id, ids[0]);
    const repriced = await app.inject({ method: "PATCH", headers, url: `/products/${ids[1]}`, payload: { priceCents: 25000, model: null } });
    assert.equal(repriced.statusCode, 200);
    for (const [sort, expected] of [["price-asc", ids[0]], ["price-desc", ids[1]], ["newest", ids[1]]] as const) {
      const sorted = await app.inject({ method: "GET", url: `/products?${new URLSearchParams({ make, sort, limit: "1" })}` });
      assert.equal(sorted.statusCode, 200, sorted.body);
      assert.equal(sorted.json().total, 2);
      assert.equal(sorted.json().totalPages, 2);
      assert.equal(sorted.json().products[0].id, expected);
    }
    const secondPage = await app.inject({ method: "GET", url: `/products?${new URLSearchParams({ make, sort: "price-asc", page: "2", limit: "1" })}` });
    assert.equal(secondPage.json().products[0].id, ids[1]);
    const hidden = await app.inject({ method: "PATCH", headers, url: `/products/${ids[1]}`, payload: { active: false } });
    assert.equal(hidden.statusCode, 200);
    const activeOnly = await app.inject({ method: "GET", url: `/products?${new URLSearchParams({ make, search: suffix })}` });
    assert.equal(activeOnly.json().total, 1);
    assert.equal(activeOnly.json().products[0].id, ids[0]);
    await app.inject({ method: "PATCH", headers, url: `/products/${ids[1]}`, payload: { active: true, model: "Test model" } });
    const facets = await app.inject({
      method: "GET",
      url: `/products/filters?${new URLSearchParams({ make, year: "2018" })}`,
    });
    assert.equal(facets.statusCode, 200);
    assert.deepEqual(
      facets
        .json()
        .categories.map((item: { value: string }) => item.value)
        .sort(),
      ["PADDLES", "TRIM"],
    );
    assert.ok(
      facets
        .json()
        .vehicles.some((vehicle: { make: string }) => vehicle.make === make),
    );
    const invalidRange = await app.inject({
      method: "PATCH",
      headers,
      url: `/products/${ids[0]}`,
      payload: { yearTo: 2010 },
    });
    assert.equal(invalidRange.statusCode, 400, invalidRange.body);
    const unchanged = await app.inject({
      method: "GET",
      url: `/products/${ids[0]}`,
    });
    assert.equal(unchanged.json().yearTo, 2020);
    const cleared = await app.inject({
      method: "PATCH",
      headers,
      url: `/products/${ids[0]}`,
      payload: { imageUrl: null, yearFrom: null },
    });
    assert.equal(cleared.statusCode, 200, cleared.body);
    assert.equal(cleared.json().yearFrom, null);
    const duplicate = await app.inject({
      method: "POST",
      headers,
      url: "/products",
      payload: {
        ...base,
        category: "PADDLES",
        sku: `PADDLES-${suffix}`,
        slug: `duplicate-${suffix}`,
      },
    });
    assert.equal(duplicate.statusCode, 409);
    const oldCategory = await app.inject({
      method: "GET",
      url: "/products?category=HEADLIGHT",
    });
    assert.equal(oldCategory.statusCode, 400);
    const invalidYear = await app.inject({
      method: "GET",
      url: "/products?year=2200",
    });
    assert.equal(invalidYear.statusCode, 400);
    const missing = await app.inject({
      method: "GET",
      url: `/products/missing-${suffix}`,
    });
    assert.equal(missing.statusCode, 404);
  } finally {
    for (const id of ids) {
      const deleted = await app.inject({
        method: "DELETE",
        headers,
        url: `/products/${id}`,
      });
      assert.equal(deleted.statusCode, 204, deleted.body);
    }
    await app.close();
  }
});
