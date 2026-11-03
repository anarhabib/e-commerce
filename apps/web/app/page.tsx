import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Homepage } from "@/features/carbignite/homepage";
import { StorefrontShell } from "@/features/carbignite/storefront-shell";
import "@/features/carbignite/style.css";
import "@/features/carbignite/interactions.css";
import "@/features/carbignite/integration.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });
export const metadata: Metadata = {
  title: "CARBIGNITE — Carbon, considered.",
  description: "Carbon fiber replacement parts, made with intention.",
};
export default function Home() {
  return (
    <div className={dmSans.variable}>
      <StorefrontShell>
        <Homepage />
      </StorefrontShell>
    </div>
  );
}
