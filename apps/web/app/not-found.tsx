import { Button } from "@/components/ui/button";
import Link from "@/components/ui/navigation-link";
import { ArrowUpRight } from "lucide-react";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="eyebrow">404 / PAGE NOT FOUND</p>
      <h1>This page could not be found.</h1>
      <p>The link may have changed. Explore the shop or return home.</p>
      <div className="not-found-actions">
        <Button href="/shop" endIcon={<ArrowUpRight size={16} />}>
          Explore the shop
        </Button>
        <Link href="/">Return home</Link>
      </div>
    </main>
  );
}
