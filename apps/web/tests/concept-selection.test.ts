import test from "node:test";
import assert from "node:assert/strict";
import { parseSelection } from "../features/carbignite/selection";

const valid = { productId: "concept-1", pattern: "Woven", finish: "Gloss" };

test("corrupted browser storage never prevents the homepage from loading", () => {
  for (const value of [null, "{", "null", "42", "{}", '"hello"'])
    assert.deepEqual(parseSelection(value), []);
});
test("rejects real/unknown product IDs and unsupported material options", () => {
  const invalid = [
    null,
    {},
    { ...valid, productId: "real-prisma-cuid" },
    { ...valid, pattern: "Plastic" },
    { ...valid, finish: "Chrome" },
  ];
  assert.deepEqual(parseSelection(JSON.stringify([...invalid, valid])), [
    valid,
  ]);
});
test("never restores injected prices, quantities, stock, or customer fields", () => {
  assert.deepEqual(
    parseSelection(
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
test("caps restored selections and keeps distinct finish/pattern combinations", () => {
  assert.equal(
    parseSelection(JSON.stringify(Array(1000).fill(valid))).length,
    50,
  );
  const variants = [valid, { ...valid, pattern: "Forged", finish: "Matte" }];
  assert.deepEqual(parseSelection(JSON.stringify(variants)), variants);
});
