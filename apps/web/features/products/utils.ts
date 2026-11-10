import { Product } from "./types";

// "SIDE_MARKER" -> "Side marker"
export function formatCategory(category: string): string {
  const text = category.replaceAll("_", " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function productImageStyle(
  product: Pick<Product, "imageUrl" | "photoIndex">,
) {
  const positions = ["0% 0%", "100% 0%", "0% 100%", "100% 100%"];
  const sheetCrop =
    product.photoIndex != null && !product.imageUrl?.startsWith("/media/");
  return {
    backgroundImage: product.imageUrl
      ? `url(${JSON.stringify(product.imageUrl)})`
      : "none",
    backgroundSize: sheetCrop ? "200% 200%" : "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: sheetCrop ? positions[product.photoIndex!] : "center",
  };
}
