"use client";
import { Dropdown } from "@/components/ui/dropdown";
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
  const [imageIndex, setImageIndex] = useState(0);
  const images = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  return (
    <Dialog
      id="product-dialog"
      title={`${product.name} details`}
      onClose={close}
    >
      <div className="detail-grid">
        <div className="product-gallery-viewer">
          <div
            className="detail-image"
            style={productImageStyle({
              imageUrl: images[imageIndex] ?? null,
              photoIndex: imageIndex === 0 ? product.photoIndex : null,
            })}
            role="img"
            aria-label={
              product.isSample
                ? `AI-generated demo of ${product.name}`
                : product.name
            }
          />
          {images.length > 1 && (
            <div
              className="product-gallery-thumbnails"
              aria-label="Product gallery"
            >
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={imageIndex === index}
                  onClick={() => setImageIndex(index)}
                  style={productImageStyle({
                    imageUrl: image,
                    photoIndex: index === 0 ? product.photoIndex : null,
                  })}
                />
              ))}
            </div>
          )}
          {!images.length && (
            <p className="muted">Product photos coming soon.</p>
          )}
        </div>
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
              <Dropdown
                aria-label="Carbon pattern"
                value={pattern}
                onChange={(event) => setPattern(event.target.value as Pattern)}
              >
                {product.patterns.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Dropdown>
            </label>
            <label>
              Finish
              <Dropdown
                aria-label="Finish"
                value={finish}
                onChange={(event) => setFinish(event.target.value as Finish)}
              >
                {product.finishes.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </Dropdown>
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
