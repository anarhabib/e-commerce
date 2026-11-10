import assert from "node:assert/strict";
import test from "node:test";
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from "../src/modules/products/schema.js";

const product = {
  name: "Test carbon part",
  slug: "test-carbon-part",
  sku: "TEST-CF-1",
  description: "Test only",
  priceCents: 10000,
};

test("collections default to Interior and reject unknown values", () => {
  const input = { ...product, category: "TRIM" };
  assert.equal(createProductSchema.parse(input).collection, "INTERIOR");
  for (const collection of ["INTERIOR", "EXTERIOR"]) {
    assert.equal(
      createProductSchema.parse({ ...input, collection }).collection,
      collection,
    );
    assert.equal(
      listProductsQuerySchema.parse({ collection }).collection,
      collection,
    );
    assert.equal(
      updateProductSchema.parse({ collection }).collection,
      collection,
    );
  }
  assert.equal(
    createProductSchema.safeParse({ ...input, collection: "OTHER" }).success,
    false,
  );
  assert.equal(
    listProductsQuerySchema.safeParse({ collection: "OTHER" }).success,
    false,
  );
});

test("dynamic part type codes are accepted and malformed codes rejected", () => {
  for (const category of [
    "PADDLES",
    "CONSOLE",
    "TRIM",
    "MIRROR_COVERS_AB123456",
  ]) {
    assert.equal(
      createProductSchema.parse({ ...product, category }).category,
      category,
    );
  }
  assert.equal(
    createProductSchema.safeParse({ ...product, category: "invalid code!" })
      .success,
    false,
  );
  assert.equal(
    listProductsQuerySchema.safeParse({ category: "invalid code!" }).success,
    false,
  );
});

test("new part type names are normalized and mutually exclusive with existing codes", () => {
  assert.equal(
    createProductSchema.parse({
      ...product,
      partTypeName: "  Mirror   covers  ",
    }).partTypeName,
    "Mirror covers",
  );
  assert.equal(createProductSchema.safeParse(product).success, false);
  assert.equal(
    createProductSchema.safeParse({
      ...product,
      category: "TRIM",
      partTypeName: "Other",
    }).success,
    false,
  );
  assert.equal(
    createProductSchema.safeParse({ ...product, partTypeName: "   " }).success,
    false,
  );
});

test("lighting-only fields are rejected on creates and updates", () => {
  assert.equal(
    createProductSchema.safeParse({
      ...product,
      category: "TRIM",
      color: "Clear",
    }).success,
    false,
  );
  assert.equal(updateProductSchema.safeParse({ side: "Left" }).success, false);
});

test("vehicle filtering and minor-unit prices remain supported", () => {
  const query = listProductsQuerySchema.parse({
    make: "Porsche",
    model: "911",
    year: "2020",
    category: ["PADDLES", "TRIM"],
  });
  assert.equal(query.year, 2020);
  assert.deepEqual(query.category, ["PADDLES", "TRIM"]);
  assert.equal(query.page, 1);
  assert.equal(
    createProductSchema.safeParse({
      ...product,
      category: "TRIM",
      priceCents: 1.5,
    }).success,
    false,
  );
});

test("invalid fitment year ranges are rejected", () => {
  assert.equal(
    createProductSchema.safeParse({
      ...product,
      category: "TRIM",
      yearFrom: 2020,
      yearTo: 2010,
    }).success,
    false,
  );
  assert.equal(
    updateProductSchema.safeParse({ yearFrom: 2020, yearTo: 2010 }).success,
    false,
  );
  assert.equal(
    listProductsQuerySchema.safeParse({ year: "2200" }).success,
    false,
  );
});

test("nullable product details can be cleared without accepting empty updates", () => {
  assert.equal(
    updateProductSchema.safeParse({
      imageUrl: null,
      make: null,
      model: null,
      yearFrom: null,
      yearTo: null,
    }).success,
    true,
  );
  assert.equal(updateProductSchema.safeParse({}).success, false);
});

test("catalog presentation fields reject invalid options and image protocols", () => {
  const base = { ...product, category: "TRIM" };
  assert.equal(
    createProductSchema.safeParse({
      ...base,
      imageUrl: "/carbignite/products.webp",
      photoIndex: 3,
      patterns: ["Forged"],
      finishes: ["Matte"],
    }).success,
    true,
  );
  for (const invalid of [
    { photoIndex: 4 },
    { patterns: [] },
    { finishes: ["Chrome"] },
    { imageUrl: "javascript:alert(1)" },
  ]) {
    assert.equal(
      createProductSchema.safeParse({ ...base, ...invalid }).success,
      false,
    );
  }
});
