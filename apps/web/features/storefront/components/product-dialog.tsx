"use client";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import { useId, useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
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
  const [enlarged, setEnlarged] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const [panel, setPanel] = useState<"options" | "details">("options");
  const panelId = useId();
  const images = product.imageUrls?.length
    ? product.imageUrls
    : product.imageUrl
      ? [product.imageUrl]
      : [];
  const sheetCrop =
    imageIndex === 0 &&
    product.photoIndex != null &&
    !images[imageIndex]?.startsWith("/media/");
  const swipe = {
    onTouchStart: (event: TouchEvent<HTMLElement>) => {
      const touch = event.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    },
    onTouchEnd: (event: TouchEvent<HTMLElement>) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start || images.length < 2) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      if (
        Math.abs(dx) > 50 &&
        Math.abs(dx) > Math.abs(touch.clientY - start.y) * 1.5
      )
        setImageIndex(
          (index) =>
            (index + (dx < 0 ? 1 : -1) + images.length) % images.length,
        );
    },
  };
  const gallery = images.length > 1 && (
    <div className="product-gallery-navigation" aria-label="Product gallery">
      <div className="product-gallery-controls">
        <button
          type="button"
          aria-label="Previous product image"
          onClick={() =>
            setImageIndex((imageIndex + images.length - 1) % images.length)
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
      <div className="product-gallery-thumbnails">
        {images.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            aria-label={`View ${index === 0 ? "cover image" : `gallery photo ${index}`}`}
            aria-pressed={imageIndex === index}
            onClick={() => setImageIndex(index)}
            style={productImageStyle({
              imageUrl: image,
              photoIndex: index === 0 ? product.photoIndex : null,
            })}
          />
        ))}
      </div>
    </div>
  );
  return (
    <Dialog
      id="product-dialog"
      title={`${product.name} ${enlarged ? "enlarged image" : "details"}`}
      onClose={() => (enlarged ? setEnlarged(false) : close())}
      closeAtEndOnMobile
    >
      {enlarged ? (
        <div className="product-enlarged-view" {...swipe}>
          {product.photoIndex != null &&
          !images[imageIndex]?.startsWith("/media/") &&
          imageIndex === 0 ? (
            <div
              className="product-enlarged-sheet"
              role="img"
              aria-label={product.name}
              style={productImageStyle(product)}
            />
          ) : (
            <Image
              src={images[imageIndex]}
              alt={product.name}
              width={1600}
              height={1600}
              unoptimized
              className="product-enlarged-photo"
            />
          )}
          {gallery}
        </div>
      ) : (
        <div className="detail-grid">
          <div className="product-gallery-viewer">
            <button
              type="button"
              className={`detail-image${images.length && !sheetCrop ? " has-single-photo" : ""}`}
              onClick={() => setEnlarged(true)}
              disabled={!images.length}
              aria-label={`Enlarge ${product.name} image`}
              {...swipe}
              style={
                sheetCrop
                  ? productImageStyle({
                      imageUrl: images[imageIndex] ?? null,
                      photoIndex: imageIndex === 0 ? product.photoIndex : null,
                    })
                  : undefined
              }
            >
              {images.length > 0 && !sheetCrop && (
                <Image
                  src={images[imageIndex]}
                  alt={product.name}
                  width={1600}
                  height={1600}
                  unoptimized
                  className="detail-photo"
                />
              )}
              <span className="product-image-zoom">
                <ZoomIn size={16} aria-hidden="true" />
              </span>
            </button>
            {gallery}
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
            <Button
              type="submit"
              id="add-bag"
              disabled={!product.isSample && product.stock < 1}
              onClick={() => add({ productId: product.id, pattern, finish })}
            >
              Add to bag{" "}
              <span>{money(product.priceCents, product.currency)}</span>
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
