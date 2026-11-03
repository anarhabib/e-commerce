import { getHomepageProducts } from "@/features/products/api";
import type { Metadata } from "next";
import { Homepage } from "@/features/storefront/homepage";
export const metadata: Metadata = {
  title: "CARBIGNITE — Carbon, considered.",
  description: "Carbon fiber replacement parts, made with intention.",
};
export default async function Home() {
  let products: import("@/features/products/types").Product[] = [];
  let catalogError = false;
  try { products = await getHomepageProducts(); } catch { catalogError = true; }
  return <Homepage products={products} catalogError={catalogError} />;
}
