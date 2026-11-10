"use client";
import { Dialog } from "./dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import type { StoreProduct } from "../types";
import { money, type BagSelection } from "../types";

export function BagDialog({
  selections,
  products,
  remove,
  close,
}: {
  selections: BagSelection[];
  products: StoreProduct[];
  remove: (index: number) => void;
  close: () => void;
}) {
  const rows = selections.flatMap((selection, index) => {
    const product = products.find(
      (product) => product.id === selection.productId,
    );
    return product ? [{ ...selection, product, index }] : [];
  });
  return (
    <Dialog id="bag-dialog" title="bag" onClose={close}>
      <div className="eyebrow">YOUR SELECTION</div>
      <h2>Your bag.</h2>
      <p className="muted">
        Design preview — your selection is saved on this device.
      </p>
      <div>
        {rows.length ? (
          rows.map((row) => (
            <div className="bag-row" key={row.index}>
              <div>
                {row.product.name}
                <small>
                  {row.product.make} {row.product.model} · {row.pattern} /{" "}
                  {row.finish}
                </small>
                <button
                  onClick={() => remove(row.index)}
                  aria-label={`Remove ${row.product.name}`}
                >
                  Remove
                </button>
              </div>
              <strong>
                {money(row.product.priceCents, row.product.currency)}
              </strong>
            </div>
          ))
        ) : (
          <p className="muted">Your bag is waiting for its first detail.</p>
        )}
      </div>
      <div className="bag-total">
        <span>Estimated subtotal</span>
        <strong>
          {money(
            rows.reduce((sum, row) => sum + row.product.priceCents, 0),
            rows[0]?.product.currency,
          )}
        </strong>
      </div>
      <p className="preview-note">
        Catalog prices are estimates. Demo products are for design review only.
        Demo checkout only. No payment or real order will be created.
      </p>
      {rows.length ? (
        <Button
          href="/checkout"
          className="bag-checkout"
          onClick={close}
          endIcon={<ArrowUpRight size={16} />}
        >
          Go to checkout
        </Button>
      ) : (
        <Button className="bag-checkout" disabled>
          Go to checkout
        </Button>
      )}
      <button className="text-button" onClick={close}>
        Continue exploring
      </button>
    </Dialog>
  );
}
