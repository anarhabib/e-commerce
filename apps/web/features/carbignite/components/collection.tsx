"use client";
import { useState } from "react";
import { conceptProducts } from "../catalog";
import { money, type ConceptProduct } from "../types";

export function ProductCard({
  product,
  open,
}: {
  product: ConceptProduct;
  open: (product: ConceptProduct) => void;
}) {
  return (
    <article className="product-card">
      <button
        className="product-image"
        onClick={() => open(product)}
        aria-label={`View ${product.make} ${product.name}`}
      >
        <span
          className={`product-photo photo-${product.photo}`}
          role="img"
          aria-label={`AI-generated concept of ${product.name}`}
        />
        <span className="product-label">REPLACEMENT / CONCEPT</span>
        <span className="product-plus">↗</span>
      </button>
      <div className="product-meta">
        <span>{product.make.toUpperCase()}</span>
        <span>{product.model.toUpperCase()}</span>
      </div>
      <button className="product-title" onClick={() => open(product)}>
        {product.name}
      </button>
      <p className="product-price">
        From <strong>{money(product.priceCents)}</strong> <span>USD</span>
      </p>
    </article>
  );
}

export function Collection({
  open,
}: {
  open: (product: ConceptProduct) => void;
}) {
  const [category, setCategory] = useState("all");
  const [make, setMake] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const [hasFiltered, setHasFiltered] = useState(false);
  const filtered = conceptProducts.filter(
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
          <span className="sample-label">
            DESIGN PREVIEW · SAMPLE CATALOG &amp; PRICES
          </span>
        </div>
      </div>
      <div className="filter-bar">
        <div className="filter-tabs" role="group" aria-label="Product category">
          {["all", "Paddles", "Console", "Trim"].map((value) => (
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
                  All parts <sup>{conceptProducts.length}</sup>
                </>
              ) : (
                value
              )}
            </button>
          ))}
        </div>
        <label className="vehicle-filter">
          <span>YOUR VEHICLE</span>
          <select
            aria-label="Filter by vehicle make"
            value={make}
            onChange={(event) => {
              setHasFiltered(true);
              setMake(event.target.value);
              setExpanded(true);
            }}
          >
            <option value="all">All makes</option>
            {["Ferrari", "Lamborghini", "Porsche", "McLaren"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <div
        key={`${category}:${make}`}
        className={`product-grid${hasFiltered ? " motion-safe:animate-[carbignite-filter-in_480ms_cubic-bezier(0.22,1,0.36,1)]" : ""}`}
      >
        {visible.length ? (
          visible.map((product) => (
            <ProductCard key={product.id} product={product} open={open} />
          ))
        ) : (
          <p className="empty-state">
            No concept parts match this selection. Try another make or category.
          </p>
        )}
      </div>
      <div className="collection-bottom">
        <span aria-live="polite">
          Showing {visible.length} of {filtered.length} concept parts
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
