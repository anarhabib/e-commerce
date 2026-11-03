"use client";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Dropdown } from "@/components/ui/dropdown";
import { useState, type FormEvent } from "react";
import { Dialog } from "@/features/storefront/components/dialog";
import { adminApi } from "./api";
import type { AdminProduct } from "./types";
import { ProductGallery } from "./product-gallery";

export function ProductEditor({
  product,
  duplicate = false,
  close,
  saved,
}: {
  product: AdminProduct | null;
  duplicate?: boolean;
  close: () => void;
  saved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>(
    product?.imageUrls?.length
      ? product.imageUrls
      : product?.imageUrl
        ? [product.imageUrl]
        : [],
  );
  const [photoIndex, setPhotoIndex] = useState<number | null>(
    product?.imageUrl?.startsWith("/media/")
      ? null
      : (product?.photoIndex ?? null),
  );
  const [uploading, setUploading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) || "").trim();
    const number = (key: string) => (text(key) ? Number(text(key)) : null);
    const body = {
      name: text("name"),
      sku: text("sku"),
      slug: text("slug"),
      description: text("description"),
      category: text("category"),
      price: text("price"),
      stock: number("stock"),
      active: data.has("active"),
      isSample: data.has("isSample"),
      currency: "USD",
      make: text("make") || null,
      model: text("model") || null,
      yearFrom: number("yearFrom"),
      yearTo: number("yearTo"),
      imageUrls: images,
      photoIndex: images[0]?.startsWith("/media/") ? null : photoIndex,
      patterns: data.getAll("patterns"),
      finishes: data.getAll("finishes"),
    };
    try {
      await adminApi(
        product && !duplicate ? `products/${product.id}` : "products",
        product && !duplicate ? "PATCH" : "POST",
        body,
      );
      saved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save product");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog id="edit-product" title="product editor" onClose={close}>
      <div className="eyebrow">THE COLLECTION / PRODUCT DETAILS</div>
      <h2>
        {duplicate
          ? "Duplicate product."
          : product
            ? "Edit product."
            : "A new detail."}
      </h2>
      {duplicate && (
        <p className="duplicate-product-note">
          Review this copy before saving. It has a new SKU and slug, starts
          hidden with zero stock, and shares the original product’s images.
        </p>
      )}
      {busy && <LoadingBar label="Saving product" />}
      <form onSubmit={submit} aria-busy={busy}>
        <fieldset disabled={busy || uploading}>
          <label>
            Product name
            <input
              name="name"
              required
              maxLength={200}
              defaultValue={product?.name}
            />
          </label>
          <div className="field-grid">
            <label>
              SKU
              <input
                name="sku"
                required
                maxLength={50}
                defaultValue={product?.sku}
              />
            </label>
            <label>
              URL slug
              <input
                name="slug"
                required
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                defaultValue={product?.slug}
              />
              <small>Lowercase words separated by dashes.</small>
            </label>
            <label>
              Make
              <input name="make" defaultValue={product?.make || ""} />
            </label>
            <label>
              Model / fitment
              <input name="model" defaultValue={product?.model || ""} />
            </label>
            <label>
              Starting year
              <input
                name="yearFrom"
                type="number"
                min={1900}
                max={2100}
                defaultValue={product?.yearFrom ?? ""}
              />
            </label>
            <label>
              Ending year
              <input
                name="yearTo"
                type="number"
                min={1900}
                max={2100}
                defaultValue={product?.yearTo ?? ""}
              />
            </label>
            <label>
              Category
              <Dropdown
                name="category"
                aria-label="Product category"
                defaultValue={product?.category || "PADDLES"}
              >
                <option value="PADDLES">Paddles</option>
                <option value="CONSOLE">Console</option>
                <option value="TRIM">Trim</option>
              </Dropdown>
            </label>
            <label>
              Price (USD)
              <input
                name="price"
                type="number"
                min="0.01"
                max="100000"
                step="0.01"
                required
                defaultValue={
                  product ? (product.priceCents / 100).toFixed(2) : ""
                }
              />
            </label>
            <label>
              Available quantity
              <input
                name="stock"
                type="number"
                min={0}
                max={2147483647}
                step={1}
                required
                defaultValue={product?.stock ?? 0}
              />
            </label>
            <label>
              Concept image crop
              <Dropdown
                name="photoIndex"
                aria-label="Concept image crop"
                value={
                  images[0]?.startsWith("/media/") ? "" : (photoIndex ?? "")
                }
                disabled={images[0]?.startsWith("/media/")}
                onChange={(event) =>
                  setPhotoIndex(
                    event.target.value === ""
                      ? null
                      : Number(event.target.value),
                  )
                }
              >
                <option value="">Single image</option>
                <option value="0">Paddle shifters</option>
                <option value="1">Console surround</option>
                <option value="2">Cupholder insert</option>
                <option value="3">Steering trim</option>
              </Dropdown>
            </label>
          </div>
          <ProductGallery
            images={images}
            setImages={setImages}
            photoIndex={photoIndex}
            changeCover={() => setPhotoIndex(null)}
            busy={busy || uploading}
            setUploading={setUploading}
          />
          {uploading && <LoadingBar label="Uploading images" />}
          <label>
            Description
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={product?.description}
            />
          </label>
          <fieldset className="option-group">
            <legend>Patterns (choose at least one)</legend>
            {["Woven", "Forged"].map((value) => (
              <label key={value}>
                <input
                  type="checkbox"
                  name="patterns"
                  value={value}
                  defaultChecked={
                    !product || product.patterns.some((p) => p === value)
                  }
                />
                {value}
              </label>
            ))}
          </fieldset>
          <fieldset className="option-group">
            <legend>Finishes (choose at least one)</legend>
            {["Gloss", "Satin", "Matte"].map((value) => (
              <label key={value}>
                <input
                  type="checkbox"
                  name="finishes"
                  value={value}
                  defaultChecked={
                    !product || product.finishes.some((f) => f === value)
                  }
                />
                {value}
              </label>
            ))}
          </fieldset>
          <label className="consent">
            <input
              name="active"
              type="checkbox"
              defaultChecked={product?.active ?? true}
            />
            <span>Visible in storefront</span>
          </label>
          <label className="consent">
            <input
              name="isSample"
              type="checkbox"
              defaultChecked={product?.isSample ?? false}
            />
            <span>Illustrative demo product</span>
          </label>
          <p className="form-error" role="alert">
            {error}
          </p>
          <button className="button primary" type="submit">
            {busy ? "Saving…" : "Save product"}
            <span>↗</span>
          </button>
        </fieldset>
      </form>
    </Dialog>
  );
}
