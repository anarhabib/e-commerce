import type { Metadata } from "next";
import { connection } from "next/server";
import { getStorefrontProducts } from "@/features/products/api";
import type { Product } from "@/features/products/types";
import {
  DM_Sans,
  Hanken_Grotesk,
  Inter,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { StorefrontShell } from "@/features/storefront/storefront-shell";
import "@/features/storefront/style.css";
import "@/features/storefront/interactions.css";
import "@/features/storefront/integration.css";
import "@/components/ui/dropdown.css";
import "@/components/ui/notifications.css";
import "@/components/ui/loading-bar.css";
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans" });

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CARBIGNITE",
  description: "Carbon fiber replacement parts, made with intention.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  let products: Product[] = [];
  let catalogError = false;
  try {
    products = await getStorefrontProducts();
  } catch (error) {
    catalogError = true;
    console.error("Catalog request failed", error);
  }
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${hanken.variable} ${inter.variable} ${jetbrains.variable}`}
    >
      <body>
        <StorefrontShell products={products} catalogError={catalogError}>
          {children}
        </StorefrontShell>
      </body>
    </html>
  );
}
