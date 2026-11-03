"use client";
import { Dropdown } from "@/components/ui/dropdown";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStorefront } from "../storefront-shell";
import { formatCategory, productImageStyle } from "@/features/products/utils";
import { money, type StoreProduct } from "../types";

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
        <span className="product-plus">↗</span>
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
}: {
  open: (product: StoreProduct) => void;
}) {
  const { products, catalogError } = useStorefront();
  const router = useRouter();
  const categories = [...new Set(products.map((product) => product.category))];
  const makes = [
    ...new Set(
      products
        .map((product) => product.make)
        .filter((make): make is string => Boolean(make)),
    ),
  ];
  const [category, setCategory] = useState("all");
  const [make, setMake] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const filtered = products.filter(
    (product) =>
      (category === "all" || product.category === category) &&
      (make === "all" || product.make === make),
  );
  const visible = expanded ? filtered : filtered.slice(0, 4);
  return (
    <section className="collection section" id="collection">
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE FIRST COLLECTION / AUTOMOTIVE</div>
          <h2>
            Small details.
            <br />
            Significant difference.
          </h2>
        </div>
        <div className="heading-note">
          <p>
            Interior essentials. Reimagined in carbon.
            <br />
            Find the next detail for your driver&apos;s seat.
          </p>
          {products.some((product) => product.isSample) && (
            <span className="sample-label">DEMO CATALOG &amp; PRICES</span>
          )}
        </div>
      </div>
      <div className="filter-bar">
        <div className="filter-tabs" role="group" aria-label="Product category">
          {["all", ...categories].map((value) => (
            <button
              key={value}
              className={category === value ? "active" : ""}
              aria-pressed={category === value}
              onClick={() => {
                setHasFiltered(true);
                setCategory(value);
                setExpanded(false);
              }}
            >
              {value === "all" ? (
                <>
                  All parts <sup>{products.length}</sup>
                </>
              ) : (
                formatCategory(value)
              )}
            </button>
          ))}
        </div>
        <label className="vehicle-filter">
          <span>YOUR VEHICLE</span>
          <Dropdown
            aria-label="Filter by vehicle make"
            value={make}
            onChange={(event) => {
              setHasFiltered(true);
              setMake(event.target.value);
              setExpanded(true);
            }}
          >
            <option value="all">All makes</option>
            {makes.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </Dropdown>
        </label>
      </div>
      <div
        key={`${category}:${make}`}
        className={`product-grid${hasFiltered ? " motion-safe:animate-[carbignite-filter-in_480ms_cubic-bezier(0.22,1,0.36,1)]" : ""}`}
      >
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
            No parts match this selection. Try another make or category.
          </p>
        )}
      </div>
      <div className="collection-bottom">
        <span aria-live="polite">
          Showing {visible.length} of {filtered.length} parts
        </span>
        <button
          className="text-button"
          hidden={filtered.length <= 4}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Show selected parts <span>↑</span>
            </>
          ) : (
            <>
              Explore all parts <span>↗</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
}
