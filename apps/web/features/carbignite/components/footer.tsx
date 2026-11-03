import Link from "next/link";
export function Footer() {
  return (
    <footer className="w-full carb-wide:mx-auto carb-wide:max-w-[1800px]">
      <div className="footer-top">
        <Link className="wordmark" href="/">
          CARBIGNITE
        </Link>
        <span>CARBON, CONSIDERED.</span>
        <Link href="/#collection">Explore the collection ↗</Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} CARBIGNITE</span>
        <span>
          AI-generated concept imagery · Sample catalog &amp; prices · Checkout
          not connected
        </span>
        <Link href="/products">Product catalog ↗</Link>
        <Link href="#">Back to top ↑</Link>
      </div>
    </footer>
  );
}
