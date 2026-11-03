"use client";
import { useState } from "react";
import { Dialog } from "./dialog";
import { productImageStyle } from "@/features/products/utils";
import {
  money,
  type Pattern,
  type Finish,
  type StoreProduct,
  type BagSelection,
} from "../types";

export function ProductDialog({
  product,
  close,
  add,
}: {
  product: StoreProduct;
  close: () => void;
  add: (selection: BagSelection) => void;
}) {
  const [pattern, setPattern] = useState<Pattern>(product.patterns[0]);
  const [finish, setFinish] = useState<Finish>(product.finishes[0]);
  return (
    <Dialog
      id="product-dialog"
      title={`${product.name} details`}
      onClose={close}
    >
      <div className="detail-grid">
        <div
          className="detail-image"
          style={productImageStyle(product)}
          role="img"
          aria-label={
            product.isSample
              ? `AI-generated demo of ${product.name}`
              : product.name
          }
        />
        <div className="detail-copy">
          <div className="eyebrow">
            {product.make?.toUpperCase()} / {product.model}
          </div>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          {product.isSample && (
            <p className="preview-note">
              Demo fitment and price. Compatibility, stock and lead time require
              confirmation.
            </p>
          )}
          <div className="detail-options">
            <label>
              Carbon pattern
              <select
                value={pattern}
                onChange={(event) => setPattern(event.target.value as Pattern)}
              >
                {product.patterns.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <label>
              Finish
              <select
                value={finish}
                onChange={(event) => setFinish(event.target.value as Finish)}
              >
                {product.finishes.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="button primary"
            id="add-bag"
            disabled={!product.isSample && product.stock < 1}
            onClick={() => add({ productId: product.id, pattern, finish })}
          >
            Add to bag{" "}
            <span>{money(product.priceCents, product.currency)}</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
