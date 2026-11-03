"use client";
import { useReveal } from "./use-reveal";
import { useStorefront } from "./storefront-shell";
import { Hero } from "./components/hero";
import { Principles } from "./components/principles";
import { Collection } from "./components/collection";
import { MaterialSelector } from "./components/material-selector";
import { Approach } from "./components/approach";
import { CustomBrief } from "./components/custom-brief";

export function Homepage({
  products,
  catalogError,
}: {
  products: import("./types").StoreProduct[];
  catalogError: boolean;
}) {
  const revealRoot = useReveal();
  const { openProduct, notify } = useStorefront();
  return (
    <main
      ref={revealRoot}
      className="w-full flex-1 carb-wide:mx-auto carb-wide:max-w-[1800px]"
    >
      <Hero />
      <Principles />
      <Collection
        open={openProduct}
        products={products}
        catalogError={catalogError}
      />
      <MaterialSelector />
      <Approach />
      <CustomBrief notify={notify} />
    </main>
  );
}
