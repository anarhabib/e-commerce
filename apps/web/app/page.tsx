import type { Metadata } from "next";
import { Homepage } from "@/features/storefront/homepage";
export const metadata: Metadata = {
  title: "CARBIGNITE — Carbon, considered.",
  description: "Carbon fiber replacement parts, made with intention.",
};
export default function Home() {
  return <Homepage />;
}
