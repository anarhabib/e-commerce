import { apiGet } from "@/lib/api-client";
import { catalogCacheOptions } from "@/lib/catalog-cache";
import { cache } from "react";
import type { Product, ProductFacets } from "./types";

export type ProductList = {
  products: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type SearchParams = Record<string, string | string[] | undefined>;

function toQueryString(params: SearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      query.append(key, item);
    }
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}

export function getProducts(params: SearchParams = {}) {
  return apiGet<ProductList>(
    `/products${toQueryString(params)}`,
    catalogCacheOptions,
  );
}

export function getProductFilters(params: SearchParams = {}) {
  return apiGet<ProductFacets>(
    `/products/filters${toQueryString(params)}`,
    catalogCacheOptions,
  );
}

export const getStorefrontProducts = cache(async (): Promise<Product[]> => {
  const products: Product[] = [];
  for (let page = 1; ; page += 1) {
    const result = await getProducts({ page: String(page), limit: "100" });
    products.push(...result.products);
    if (page >= result.totalPages) return products;
  }
});
