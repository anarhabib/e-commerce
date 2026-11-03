"use client";
import { useState } from "react";
import { Dialog } from "./dialog";
import {
  patterns,
  finishes,
  money,
  type Pattern,
  type Finish,
  type ConceptProduct,
  type ConceptSelection,
} from "../types";

export function ProductDialog({
  product,
  close,
  add,
}: {
  product: ConceptProduct;
  close: () => void;
  add: (selection: ConceptSelection) => void;
}) {
  const [pattern, setPattern] = useState<Pattern>("Woven");
  const [finish, setFinish] = useState<Finish>("Gloss");
  return (
    <Dialog
      id="product-dialog"
      title={`${product.name} concept details`}
      onClose={close}
    >
      <div className="detail-grid">
        <div
          className={`detail-image photo-${product.photo}`}
          role="img"
          aria-label={`AI-generated concept of ${product.name}`}
        />
        <div className="detail-copy">
          <div className="eyebrow">
            {product.make.toUpperCase()} / {product.model}
          </div>
          <h2>{product.name}</h2>
          <p>
            Replacement part concept. Choose your carbon pattern and finish.
          </p>
          <p className="preview-note">
            Sample fitment and price. Compatibility, installation, stock and
            lead time require confirmation.
          </p>
          <div className="detail-options">
            <label>
              Carbon pattern
              <select
                value={pattern}
                onChange={(event) => setPattern(event.target.value as Pattern)}
              >
                {patterns.map((value) => (
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
                {finishes.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
          <button
            className="button primary"
            id="add-bag"
            onClick={() => add({ productId: product.id, pattern, finish })}
          >
            Add to concept bag <span>{money(product.priceCents)}</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
