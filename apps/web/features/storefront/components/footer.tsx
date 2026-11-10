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
          Demo checkout · No payments taken
        </span>
        <Link href="/shop">
          Shop <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
        <button
          type="button"
          className="back-to-top"
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "instant"
                : "smooth",
            })
          }
        >
          Back to top <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
