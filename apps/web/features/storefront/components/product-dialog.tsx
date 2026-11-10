"use client";
import { Dropdown } from "@/components/ui/dropdown";
import { useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [panel, setPanel] = useState<"options" | "details">("options");
  const panelId = useId();
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
      closeAtEndOnMobile
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
              className="product-gallery-controls"
              aria-label="Product gallery"
            >
              <button
                type="button"
                aria-label="Previous product image"
                onClick={() =>
                  setImageIndex(
                    (imageIndex + images.length - 1) % images.length,
                  )
                }
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <span aria-live="polite">
                {imageIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                aria-label="Next product image"
                onClick={() => setImageIndex((imageIndex + 1) % images.length)}
              >
                <ChevronRight size={16} aria-hidden="true" />
              </button>
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
          <div
            className="detail-panel-switch"
            role="group"
            aria-label="Product information"
          >
            <button
              type="button"
              aria-pressed={panel === "options"}
              aria-controls={panelId}
              onClick={() => setPanel("options")}
            >
              Options
            </button>
            <button
              type="button"
              aria-pressed={panel === "details"}
              aria-controls={panelId}
              onClick={() => setPanel("details")}
            >
              Details
            </button>
          </div>
          <div id={panelId} className="detail-panel">
            {panel === "details" ? (
              <div className="detail-description">
                <p>{product.description}</p>
              </div>
            ) : (
              <>
                <div className="detail-options">
                  <label>
                    Carbon pattern
                    <Dropdown
                      aria-label="Carbon pattern"
                      value={pattern}
                      onChange={(event) =>
                        setPattern(event.target.value as Pattern)
                      }
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
                      onChange={(event) =>
                        setFinish(event.target.value as Finish)
                      }
                    >
                      {product.finishes.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </Dropdown>
                  </label>
                </div>
                <p className="detail-fitment-note">
                  {product.isSample
                    ? "Demo part & price. Confirm fitment and availability."
                    : "Confirm fitment for your vehicle before ordering."}
                </p>
              </>
            )}
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
