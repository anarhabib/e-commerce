"use client";
import { ArrowUpRight } from "lucide-react";
import { useStorefront } from "../storefront-shell";
import Link from "@/components/ui/navigation-link";
export function Footer() {
  const { products } = useStorefront();
  return (
    <footer className="w-full carb-wide:mx-auto carb-wide:max-w-[1800px]">
      <div className="footer-top">
        <Link className="wordmark" href="/">
          CARBIGNITE
        </Link>
        <span>CARBON, CONSIDERED.</span>
        <Link href="/#collection">
          Explore the collection{" "}
          <ArrowUpRight
            size={16}
            aria-hidden="true"
            style={{ display: "inline-block", verticalAlign: "middle" }}
          />
        </Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CARBIGNITE</span>
        <span>
          {products.some((product) => product.isSample)
            ? "AI-generated demo imagery · Demo catalog & prices · "
            : ""}
          Checkout not connected
        </span>
        <Link href="/products">
          Product catalog <ArrowUpRight size={16} />
        </Link>
        <Link href="#">Back to top ↑</Link>
      </div>
    </footer>
  );
}
