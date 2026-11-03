import { conceptProducts } from "./catalog";
import { finishes, patterns, type ConceptSelection } from "./types";

// A versioned, separate key prevents mixing illustrative parts with real orders.
export const selectionKey = "carbignite-concept-selection-v1";
export function parseSelection(value: string | null): ConceptSelection[] {
  try {
    const data: unknown = JSON.parse(value ?? "[]");
    if (!Array.isArray(data)) return [];
    return data
      .filter((item): item is ConceptSelection => {
        if (!item || typeof item !== "object") return false;
        return (
          conceptProducts.some((product) => product.id === item.productId) &&
          patterns.includes(item.pattern) &&
          finishes.includes(item.finish)
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
