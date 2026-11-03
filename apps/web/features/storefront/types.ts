import type { Product } from "@/features/products/types";

// Material-study controls use the same domain values as the API.
export const patterns = ["Woven", "Forged"] as const;
export const finishes = ["Gloss", "Satin", "Matte"] as const;
export type Pattern = (typeof patterns)[number];
export type Finish = (typeof finishes)[number];
export type StoreProduct = Product;
export type BagSelection = {
  productId: string;
  pattern: Pattern;
  finish: Finish;
};
export const money = (cents: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
