"use client";
import Link from "@/components/ui/navigation-link";
export default function ShopError({ reset }: { reset: () => void }) {
  return <main className="shop-page section w-full flex-1"><h1>Catalog temporarily unavailable</h1><p>We couldn’t load the products. Please try again.</p><button className="button primary" onClick={reset}>Try again</button><Link href="/shop" className="text-button">Clear filters</Link></main>;
}
