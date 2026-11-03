"use client";
import { useStorefront } from "./storefront-shell";
import { Hero } from "./components/hero";
import { Principles } from "./components/principles";
import { Collection } from "./components/collection";
import { MaterialSelector } from "./components/material-selector";
import { Approach } from "./components/approach";
import { CustomBrief } from "./components/custom-brief";

export function Homepage() {
  const { openProduct, notify } = useStorefront();
  return (
    <main className="w-full flex-1 carb-wide:mx-auto carb-wide:max-w-[1800px]">
      <Hero />
      <Principles />
      <Collection open={openProduct} />
      <MaterialSelector />
      <Approach />
      <CustomBrief notify={notify} />
    </main>
  );
}
