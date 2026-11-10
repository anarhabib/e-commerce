import type { Metadata } from "next";
import { DemoCheckout } from "@/features/storefront/demo-checkout";

export const metadata: Metadata = {
  title: "Demo checkout | CARBIGNITE",
  robots: { index: false, follow: false },
};
export default function CheckoutPage() {
  return <DemoCheckout />;
}
