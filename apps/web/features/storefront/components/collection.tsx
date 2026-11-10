"use client";
import Link from "@/components/ui/navigation-link";
import { Button } from "@/components/ui/button";
import { productImageStyle } from "@/features/products/utils";
import { money, type StoreProduct } from "../types";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

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
          <ArrowUpRight size={16} aria-hidden="true" />
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

export function Collection() {
  return (
    <section className="collection section" id="collection">
      <div className="section-heading">
        <div>
          <div className="eyebrow">TWO COLLECTIONS / ONE MATERIAL</div>
          <h2>Every detail. Inside &amp; out.</h2>
        </div>
        <Button
          className="collection-shop-link"
          href="/shop"
          endIcon={<ArrowUpRight size={16} />}
        >
          Shop all parts
        </Button>
      </div>
      <div className="collection-categories">
        <Link className="collection-category" href="/shop?collection=INTERIOR">
          <div className="collection-category-art" aria-hidden="true">
            <Image
              src="/carbignite/collection-interior.jpg"
              alt=""
              width={1280}
              height={720}
              sizes="(max-width: 700px) 100vw, 50vw"
            />
          </div>
          <div className="collection-category-copy">
            <div>
              <h3>Interior details</h3>
              <p>Carbon details for your driver&apos;s seat.</p>
            </div>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
          <span className="collection-category-cta">Explore Interior</span>
        </Link>
        <Link className="collection-category" href="/shop?collection=EXTERIOR">
          <div className="collection-category-art" aria-hidden="true">
            <Image
              src="/carbignite/collection-exterior.jpg"
              alt=""
              width={1254}
              height={1254}
              sizes="(max-width: 700px) 100vw, 50vw"
            />
          </div>
          <div className="collection-category-copy">
            <div>
              <h3>Exterior details</h3>
              <p>Carbon details for the road ahead.</p>
            </div>
            <ArrowUpRight size={22} aria-hidden="true" />
          </div>
          <span className="collection-category-cta">Explore Exterior</span>
        </Link>
      </div>
    </section>
  );
}
