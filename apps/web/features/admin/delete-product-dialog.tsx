"use client";
import { useState } from "react";
import { Dialog } from "@/features/storefront/components/dialog";
import { adminApi } from "./api";
import type { AdminProduct } from "./types";

export function DeleteProductDialog({
  product,
  close,
  deleted,
}: {
  product: AdminProduct;
  close: () => void;
  deleted: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function remove() {
    setBusy(true);
    setError("");
    try {
      await adminApi(`products/${product.id}`, "DELETE");
      deleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete product");
      setBusy(false);
    }
  }
  return (
    <Dialog
      id="delete-product"
      title="delete product confirmation"
      onClose={close}
    >
      <div className="eyebrow">THE COLLECTION / DELETE PRODUCT</div>
      <h2>Remove this detail?</h2>
      <p>
        <strong>{product.name}</strong>
        <br />
        <span className="muted">SKU: {product.sku}</span>
      </p>
      <p>
        This permanently deletes the product from your catalog. Existing order
        requests keep their saved item details. Shared images are retained.
      </p>
      <p className="form-error" role="alert">
        {error}
      </p>
      <div className="delete-product-actions">
        <button
          type="button"
          className="button secondary"
          disabled={busy}
          onClick={close}
        >
          Keep product
        </button>
        <button
          type="button"
          className="button primary"
          disabled={busy}
          onClick={remove}
        >
          {busy ? "Deleting…" : "Delete product"}
        </button>
      </div>
    </Dialog>
  );
}
