export type ProductCategory = "PADDLES" | "CONSOLE" | "TRIM";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  category: ProductCategory;
  priceCents: number;
  imageUrl: string | null;
  stock: number;
  currency: string;
  photoIndex: number | null;
  isSample: boolean;
  patterns: ("Woven" | "Forged")[];
  finishes: ("Gloss" | "Satin" | "Matte")[];
  make: string | null;
  model: string | null;
  yearFrom: number | null;
  yearTo: number | null;
};

export type VehicleOption = {
  make: string;
  model: string;
  yearFrom: number | null;
  yearTo: number | null;
};

export type FacetOptions = { value: string; count: number };
export type ProductFacets = {
  categories: FacetOptions[];
  vehicles: VehicleOption[];
};
