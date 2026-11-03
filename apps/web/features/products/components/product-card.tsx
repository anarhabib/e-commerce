import type { Product } from "../types";
import { formatPrice, productImageStyle } from "../utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex w-full flex-col overflow-hidden rounded-md border border-(--line) bg-(--paper)">
      <div
        className="relative aspect-3/2 bg-(--soft)"
        role="img"
        aria-label={product.name}
        style={productImageStyle(product)}
      />
      <div className="flex flex-1 flex-col border-t border-(--line) px-3 py-2.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-(--muted)">
          {product.category}
        </p>
        <h3 className="min-h-14 py-2 font-semibold leading-snug">
          {product.name}
        </h3>
        <p className="mt-2 text-xs text-(--muted)">
          {[
            product.make,
            product.model,
            product.yearFrom && product.yearTo
              ? `${product.yearFrom}–${product.yearTo}`
              : null,
          ]
            .filter(Boolean)
            .join(" ")}
        </p>
        <p className="mt-auto pt-3 text-base font-bold">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
    </article>
  );
}
