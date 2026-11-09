import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  getProducts,
  getProductFilters,
  type SearchParams,
} from "@/features/products/api";
import { ShopCatalog } from "@/features/storefront/shop-catalog";

export const metadata: Metadata = { title: "Shop | CARBIGNITE" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await searchParams;
  const first = (key: string) =>
    (Array.isArray(raw[key]) ? raw[key][0] : raw[key])?.trim() ?? "";
  const params: Record<string, string> = {};
  if (["INTERIOR", "EXTERIOR"].includes(first("collection")))
    params.collection = first("collection");
  for (const key of ["search", "make", "model"])
    if (first(key)) params[key] = first(key);
  const year = Number(first("year"));
  if (first("year") && Number.isInteger(year) && year >= 1900 && year <= 2100)
    params.year = String(year);
  if (["PADDLES", "CONSOLE", "TRIM"].includes(first("category")))
    params.category = first("category");
  params.sort = ["price-asc", "price-desc"].includes(first("sort"))
    ? first("sort")
    : "newest";
  const page = Number(first("page"));
  params.page =
    Number.isSafeInteger(page) && page > 0 && page <= 1000000
      ? String(page)
      : "1";
  const [list, facets] = await Promise.all([
    getProducts({ ...params, limit: "12" }),
    getProductFilters(
      params.collection ? { collection: params.collection } : {},
    ),
  ]);
  if (list.page > Math.max(1, list.totalPages)) {
    params.page = String(Math.max(1, list.totalPages));
    redirect(`/shop?${new URLSearchParams(params)}`);
  }
  return (
    <ShopCatalog
      key={JSON.stringify(params)}
      list={list}
      facets={facets}
      params={params}
    />
  );
}
