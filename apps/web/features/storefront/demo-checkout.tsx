"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorefront } from "./storefront-shell";
import { money } from "./types";

export function DemoCheckout() {
  const { bag, bagReady, products, catalogError } = useStorefront();
  const [complete, setComplete] = useState(false);
  const rows = bag.flatMap((selection) => {
    const product = products.find((item) => item.id === selection.productId);
    return product ? [{ ...selection, product }] : [];
  });
  function finish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rows.length) return;
    setComplete(true);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  return (
    <main className="checkout-page section w-full flex-1">
      <div className="eyebrow">DESIGN PREVIEW / NO PAYMENT</div>
      <h1>{complete ? "Demo complete." : "Your next detail."}</h1>
      <p className="checkout-intro">
        Demo checkout only. No payment is collected and no real order is placed.
        Use sample details to try the form.
      </p>
      {!bagReady ? (
        <p role="status">Loading your bag…</p>
      ) : catalogError ? (
        <p role="alert">
          The catalog is unavailable. Please try again later; your saved bag has
          been kept.
        </p>
      ) : complete ? (
        <section className="checkout-confirmation" aria-live="polite">
          <Check size={28} aria-hidden="true" />
          <h2>You’ve previewed checkout.</h2>
          <p>
            No order was created, no email was sent and your bag is unchanged.
            The details you entered are not saved or submitted.
          </p>
          <Button href="/shop" endIcon={<ArrowUpRight size={16} />}>
            Continue shopping
          </Button>
        </section>
      ) : !rows.length ? (
        <section className="checkout-empty">
          <h2>Your bag is empty.</h2>
          <p>Add a part to preview checkout.</p>
          <Button href="/shop" endIcon={<ArrowUpRight size={16} />}>
            Explore the shop
          </Button>
        </section>
      ) : (
        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={finish}>
            <h2>Contact &amp; delivery</h2>
            <div className="checkout-fields">
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={120}
                />
              </label>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
              <label className="checkout-wide">
                Address
                <input
                  name="address"
                  autoComplete="street-address"
                  required
                  maxLength={250}
                />
              </label>
              <label>
                City
                <input
                  name="city"
                  autoComplete="address-level2"
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Postal code
                <input
                  name="postal"
                  autoComplete="postal-code"
                  required
                  maxLength={30}
                />
              </label>
              <label className="checkout-wide">
                Country
                <input
                  name="country"
                  autoComplete="country-name"
                  required
                  maxLength={100}
                />
              </label>
            </div>
            <div className="checkout-payment">
              <h3>Payment</h3>
              <p>
                Demo mode — no card or payment details needed. Shipping and
                taxes are not calculated.
              </p>
            </div>
            <Button type="submit" endIcon={<ArrowUpRight size={16} />}>
              Complete demo checkout
            </Button>
          </form>
          <aside className="checkout-summary" aria-label="Bag summary">
            <h2>Your selection</h2>
            {rows.map((row, index) => (
              <div className="checkout-item" key={index}>
                <div>
                  <strong>{row.product.name}</strong>
                  <small>
                    {row.product.make} {row.product.model} · {row.pattern} /{" "}
                    {row.finish}
                  </small>
                </div>
                <span>
                  {money(row.product.priceCents, row.product.currency)}
                </span>
              </div>
            ))}
            <div className="bag-total">
              <span>Estimated parts subtotal</span>
              <strong>
                {money(
                  rows.reduce((sum, row) => sum + row.product.priceCents, 0),
                  rows[0]?.product.currency,
                )}
              </strong>
            </div>
            <p className="preview-note">
              Includes {rows.length} {rows.length === 1 ? "part" : "parts"}.
              Demo prices and fitment need confirmation. This is not a final
              quote.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
