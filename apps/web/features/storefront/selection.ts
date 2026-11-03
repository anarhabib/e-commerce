import type { BagSelection, StoreProduct } from "./types";

export const selectionKey = "carbignite-bag-v2";
export function parseSelection(
  value: string | null,
  products: Pick<StoreProduct, "id" | "patterns" | "finishes">[],
): BagSelection[] {
  try {
    const data: unknown = JSON.parse(value ?? "[]");
    if (!Array.isArray(data)) return [];
    const byId = new Map(products.map((product) => [product.id, product]));
    return data
      .filter((item): item is BagSelection => {
        if (!item || typeof item !== "object") return false;
        const product = byId.get(item.productId);
        return Boolean(
          product &&
          product.patterns.includes(item.pattern) &&
          product.finishes.includes(item.finish),
        );
      })
      .slice(0, 50)
      .map(({ productId, pattern, finish }) => ({
        productId,
        pattern,
        finish,
      }));
  } catch {
    return [];
  }
}
