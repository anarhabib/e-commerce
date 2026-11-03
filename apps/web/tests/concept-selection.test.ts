import test from "node:test";
import assert from "node:assert/strict";
import { parseSelection } from "../features/storefront/selection";
import type { StoreProduct } from "../features/storefront/types";

const products: Pick<StoreProduct, "id" | "patterns" | "finishes">[] = [
  {
    id: "database-product-a",
    patterns: ["Woven", "Forged"],
    finishes: ["Gloss", "Satin", "Matte"],
  },
  { id: "database-product-b", patterns: ["Forged"], finishes: ["Matte"] },
];
const valid = { productId: products[0].id, pattern: "Woven", finish: "Gloss" };
const parse = (value: string | null) => parseSelection(value, products);

test("corrupted storage never prevents the homepage from loading", () => {
  for (const value of [null, "{", "null", "42", "{}", '"hello"'])
    assert.deepEqual(parse(value), []);
});
test("accepts database IDs and rejects removed IDs and unsupported product options", () => {
  const invalid = [
    null,
    {},
    { ...valid, productId: "deleted-product" },
    { ...valid, pattern: "Plastic" },
    { ...valid, finish: "Chrome" },
    { ...valid, productId: products[1].id },
  ];
  assert.deepEqual(parse(JSON.stringify([...invalid, valid])), [valid]);
  assert.deepEqual(parseSelection(JSON.stringify([valid]), []), []);
});
test("stored prices, quantities, stock and customer fields are never trusted", () => {
  assert.deepEqual(
    parse(
      JSON.stringify([
        {
          ...valid,
          priceCents: 1,
          quantity: 999,
          stock: 999,
          email: "discard@example.com",
        },
      ]),
    ),
    [valid],
  );
});
test("caps selection size and preserves distinct supported database variants", () => {
  assert.equal(parse(JSON.stringify(Array(1000).fill(valid))).length, 50);
  const variants = [
    valid,
    { productId: products[1].id, pattern: "Forged", finish: "Matte" },
  ];
  assert.deepEqual(parse(JSON.stringify(variants)), variants);
});
