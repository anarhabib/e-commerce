"use client";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Dropdown } from "@/components/ui/dropdown";
import { useState, type FormEvent } from "react";
import { Dialog } from "@/features/storefront/components/dialog";
import { adminApi } from "./api";
import type { AdminProduct } from "./types";

export function RequestEditor({
  close,
  saved,
}: {
  close: () => void;
  saved: () => void;
}) {
  const [product, setProduct] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [id] = useState(() => crypto.randomUUID());
  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setProduct(null);
    const sku = String(
      new FormData(event.currentTarget).get("sku") || "",
    ).trim();
    try {
      const result = await adminApi<{ products: AdminProduct[] }>(
        `products?search=${encodeURIComponent(sku)}`,
      );
      const match = result.products.find((p) => p.sku === sku && p.active);
      if (!match) throw new Error("Enter an exact, active product SKU.");
      setProduct(match);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load product");
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    const customer = Object.fromEntries(
      [
        "name",
        "email",
        "phone",
        "address",
        "city",
        "region",
        "postal",
        "country",
        "note",
      ].map((key) => [key, String(data.get(key) || "")]),
    );
    try {
      await adminApi("orders", "POST", {
        id,
        customer,
        items: [
          {
            productId: product.id,
            pattern: data.get("pattern"),
            finish: data.get("finish"),
            quantity: Number(data.get("quantity")),
          },
        ],
      });
      saved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save request");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog id="new-request" title="new order request" onClose={close}>
      {busy && <LoadingBar label="Updating workshop" />}
      <div className="eyebrow">OWNER INTAKE / PHONE OR EMAIL</div>
      <h2>A new request.</h2>
      <p className="microcopy">
        Record a customer inquiry. Prices are checked on the server. No payment
        is taken or stock reserved.
      </p>
      <form onSubmit={lookup}>
        <label>
          Exact product SKU
          <input name="sku" required />
        </label>
        <button className="text-button" disabled={busy}>
          Find product ↗
        </button>
      </form>
      {product && (
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            <p>
              {product.name} · {product.stock} available
            </p>
            <div className="field-grid">
              <label>
                Pattern
                <Dropdown key={`${product.id}-pattern`} name="pattern">
                  {product.patterns.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Dropdown>
              </label>
              <label>
                Finish
                <Dropdown key={`${product.id}-finish`} name="finish">
                  {product.finishes.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </Dropdown>
              </label>
              <label>
                Quantity
                <input
                  name="quantity"
                  type="number"
                  min={1}
                  max={Math.min(product.stock, 100)}
                  required
                  defaultValue={1}
                />
              </label>
              {[
                "name",
                "email",
                "phone",
                "address",
                "city",
                "region",
                "postal",
                "country",
              ].map((key) => (
                <label key={key}>
                  {key}
                  <input
                    name={key}
                    type={key === "email" ? "email" : "text"}
                    required={key === "name" || key === "email"}
                    maxLength={
                      key === "address" ? 300 : key === "email" ? 254 : 100
                    }
                  />
                </label>
              ))}
            </div>
            <label>
              Build notes
              <textarea name="note" maxLength={2000} />
            </label>
            <button className="button primary">
              {busy ? "Saving…" : "Save request ↗"}
            </button>
          </fieldset>
        </form>
      )}
      <p className="form-error" role="alert">
        {error}
      </p>
    </Dialog>
  );
}
