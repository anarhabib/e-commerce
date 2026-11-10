"use client";
import { Button } from "@/components/ui/button";
import { useReveal } from "./use-reveal";

import Link from "@/components/ui/navigation-link";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { Dropdown } from "@/components/ui/dropdown";
import { LoadingBar } from "@/components/ui/loading-bar";
import type { ProductList } from "@/features/products/api";
import type { ProductFacets } from "@/features/products/types";
import { formatCategory } from "@/features/products/utils";
import { Pagination } from "@/features/products/components/pagination";
import { VehicleSelector } from "@/features/products/components/vehicle-selector";
import {
  MobileFilters,
  useCloseMobileFilters,
} from "@/features/products/components/mobile-filters";
import { ProductCard } from "./components/collection";
import { useStorefront } from "./storefront-shell";

type FilterProps = {
  facets: ProductFacets;
  params: Record<string, string>;
  pending: boolean;
  apply: (query: URLSearchParams) => void;
};

function ShopFilterForm({ facets, params, pending, apply }: FilterProps) {
  const close = useCloseMobileFilters();
  const searchId = useId();
  const [vehicle, setVehicle] = useState({
    make: params.make ?? "",
    model: params.model ?? "",
    year: params.year ?? "",
  });
  const [search, setSearch] = useState(params.search ?? "");
  const [category, setCategory] = useState(params.category ?? "");
  const [collection, setCollection] = useState(params.collection ?? "");
  const [sort, setSort] = useState(params.sort ?? "newest");
  return (
    <form
      className="shop-filter-form"
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        const query = new URLSearchParams();
        for (const [key, value] of Object.entries({
          ...vehicle,
          search: search.trim(),
          category,
          collection,
          sort,
        })) {
          if (value) query.set(key, value);
        }
        apply(query);
        close?.();
      }}
    >
      <section className="shop-vehicle" aria-label="Vehicle selection">
        <h2>Find parts for your vehicle</h2>
        <p className="muted">Choose a make, then narrow by model and year.</p>
        <VehicleSelector
          vehicles={facets.vehicles}
          availableMakes={facets.makes}
          value={vehicle}
          onVehicleChange={setVehicle}
          columns="sm:grid-cols-3"
          className="shop-vehicle-fields"
        />
      </section>
      <div className="shop-filters">
        <div>
          <label htmlFor={searchId}>Search products</label>
          <div className="shop-search-field">
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Name or SKU"
            />
            {search && (
              <button
                className="shop-search-clear"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  document.getElementById(searchId)?.focus();
                }}
              >
                <X size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
        <label>
          Collection
          <Dropdown
            value={collection}
            onChange={(event) => setCollection(event.target.value)}
          >
            <option value="">Interior &amp; Exterior</option>
            <option value="INTERIOR">Interior</option>
            <option value="EXTERIOR">Exterior</option>
          </Dropdown>
        </label>
        <label>
          Part type
          <Dropdown
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {facets.categories.map(({ value, label }) => (
              <option key={value} value={value}>
                {label ?? formatCategory(value)}
              </option>
            ))}
          </Dropdown>
        </label>
        <label>
          Sort by
          <Dropdown
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </Dropdown>
        </label>
      </div>
      <div className="shop-filter-actions">
        <Link
          href="/shop"
          className="text-button"
          onClick={() => {
            setVehicle({ make: "", model: "", year: "" });
            setSearch("");
            setCategory("");
            setCollection("");
            setSort("newest");
            close?.();
          }}
        >
          Clear filters
        </Link>
        <Button className="shop-submit" type="submit" disabled={pending}>
          {pending ? "Searching…" : "Search"}
        </Button>
      </div>
    </form>
  );
}

export function ShopCatalog({
  list,
  facets,
  params,
}: {
  list: ProductList;
  facets: ProductFacets;
  params: Record<string, string>;
}) {
  const revealRoot = useReveal();
  const { openProduct } = useStorefront();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function apply(query: URLSearchParams) {
    startTransition(() => router.push(`/shop?${query}`));
  }
  return (
    <main
      ref={revealRoot}
      className="shop-page section w-full flex-1"
      aria-busy={pending}
    >
      {pending && <LoadingBar fixed label="Searching products" />}
      <div className="section-heading">
        <div>
          <div className="eyebrow">THE COLLECTION / AUTOMOTIVE</div>
          <h1>
            {params.collection === "INTERIOR"
              ? "Interior details."
              : params.collection === "EXTERIOR"
                ? "Exterior details."
                : "Find your next detail."}
          </h1>
        </div>
        <p className="muted">
          Carbon fiber replacement parts, made with intention.
        </p>
      </div>
      <div className="shop-desktop-filters">
        <ShopFilterForm
          facets={facets}
          params={params}
          pending={pending}
          apply={apply}
        />
      </div>
      <div className="shop-mobile-controls">
        <MobileFilters
          total={list.total}
          categoryLabels={Object.fromEntries(
            facets.categories.map((type) => [
              type.value,
              type.label ?? formatCategory(type.value),
            ]),
          )}
        >
          <ShopFilterForm
            facets={facets}
            params={params}
            pending={pending}
            apply={apply}
          />
        </MobileFilters>
      </div>
      <div className="collection-bottom shop-summary">
        <span role="status">
          {list.total} matching {list.total === 1 ? "product" : "products"}
        </span>
      </div>
      <div className="product-grid">
        {list.products.length ? (
          list.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              open={openProduct}
            />
          ))
        ) : (
          <div className="empty-state">
            <h2>No products found.</h2>
            <p>Try another search, make or category.</p>
            <Link className="text-button" href="/shop">
              Clear filters
            </Link>
          </div>
        )}
      </div>
      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        searchParams={params}
        pathname="/shop"
      />
    </main>
  );
}
