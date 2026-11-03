"use client";
import { useRouter } from "next/navigation";
import Link from "@/components/ui/navigation-link";
import { productImageStyle } from "@/features/products/utils";
import { money, type StoreProduct } from "../types";
import { ArrowUpRight } from "lucide-react";

export function ProductCard({
  product,
  open,
}: {
  product: StoreProduct;
  open: (product: StoreProduct) => void;
}) {
  return (
    <article className="product-card">
      <button
        className="product-image"
        onClick={() => open(product)}
        aria-label={`View ${product.make} ${product.name}`}
      >
        <span
          className="product-photo"
          style={productImageStyle(product)}
          role="img"
          aria-label={
            product.isSample
              ? `AI-generated demo of ${product.name}`
              : product.name
          }
        />
        <span className="product-label">
          {product.isSample ? "REPLACEMENT / DEMO" : "REPLACEMENT PART"}
        </span>
        <span className="product-plus">
          <ArrowUpRight size={16} />
        </span>
      </button>
      <div className="product-meta">
        <span>{product.make?.toUpperCase()}</span>
        <span>{product.model?.toUpperCase()}</span>
      </div>
      <button className="product-title" onClick={() => open(product)}>
        {product.name}
      </button>
      <p className="product-price">
        From <strong>{money(product.priceCents, product.currency)}</strong>{" "}
        <span>{product.currency}</span>
      </p>
    </article>
  );
}

export function Collection({
  open,
  products,
  catalogError,
}: {
  open: (product: StoreProduct) => void;
  products: StoreProduct[];
  catalogError: boolean;
}) {
  const router = useRouter();
  const visible = products.slice(0, 8);
  return (
    <section className="collection section" id="collection">
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE COLLECTION / AUTOMOTIVE</div>
          <h2>Best sellers.</h2>
        </div>
        <div className="heading-note">
          <p>
            Standout details for your driver&apos;s seat.
            <br />
            Explore the full collection to find your fit.
          </p>
          {products.some((product) => product.isSample) && (
            <span className="sample-label">DEMO CATALOG &amp; PRICES</span>
          )}
        </div>
      </div>
      <div className="product-grid">
        {catalogError ? (
          <div className="empty-state" role="status">
            <p>The catalog is temporarily unavailable.</p>
            <button className="text-button" onClick={() => router.refresh()}>
              Try again
            </button>
          </div>
        ) : visible.length ? (
          visible.map((product) => (
            <ProductCard key={product.id} product={product} open={open} />
          ))
        ) : (
          <p className="empty-state">
            New parts are on the way. Explore the shop for the latest
            collection.
          </p>
        )}
      </div>
      <div className="collection-bottom">
        <span aria-live="polite">{visible.length} selected parts</span>
        <Link className="text-button" href="/shop">
          View all products &rarr;
        </Link>
      </div>
    </section>
  );
}
