export const patterns = ["Woven", "Forged"] as const;
export const finishes = ["Gloss", "Satin", "Matte"] as const;
export type Pattern = (typeof patterns)[number];
export type Finish = (typeof finishes)[number];

export type ConceptProduct = {
  source: "concept";
  id: string;
  name: string;
  make: string;
  model: string;
  category: "Paddles" | "Console" | "Trim";
  priceCents: number;
  photo: number;
};
export type ConceptSelection = {
  productId: string;
  pattern: Pattern;
  finish: Finish;
};
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
