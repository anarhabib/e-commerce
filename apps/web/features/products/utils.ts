import { Product } from "./types";

export function formatPrice(priceCents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(priceCents / 100);
}

// "Honda Civic 2006-2008", or null if we know nothing about the vehicle
export function formatFitment(
  p: Pick<Product, "make" | "model" | "yearFrom" | "yearTo">,
): string | null {
  const vehicle = [p.make, p.model].filter(Boolean).join(" ");
  if (!vehicle) return null;

  let years = "";
  if (p.yearFrom && p.yearTo) {
    years =
      p.yearFrom === p.yearTo ? `${p.yearFrom}` : `${p.yearFrom}-${p.yearTo}`;
  } else if (p.yearFrom) {
    years = `${p.yearFrom}+`;
  }

  return [vehicle, years].filter(Boolean).join(" ");
}

// "SIDE_MARKER" -> "Side marker"
export function formatCategory(category: string): string {
  const text = category.replaceAll("_", " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function productImageStyle(
  product: Pick<Product, "imageUrl" | "photoIndex">,
) {
  const positions = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
  return {
    backgroundImage: product.imageUrl
      ? `url(${JSON.stringify(product.imageUrl)})`
      : "none",
    backgroundSize: product.photoIndex == null ? "cover" : "200% 200%",
    backgroundPosition:
      product.photoIndex == null ? "center" : positions[product.photoIndex],
  };
}
