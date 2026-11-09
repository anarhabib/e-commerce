"use client";
import { useReveal } from "./use-reveal";
import { useStorefront } from "./storefront-shell";
import { Hero } from "./components/hero";
import { Principles } from "./components/principles";
import { Collection } from "./components/collection";
import { MaterialSelector } from "./components/material-selector";
import { Approach } from "./components/approach";
import { CustomBrief } from "./components/custom-brief";

export function Homepage() {
  const revealRoot = useReveal();
  const { notify } = useStorefront();
  return (
    <main
      ref={revealRoot}
      className="w-full flex-1 carb-wide:mx-auto carb-wide:max-w-[1800px]"
    >
      <Hero />
      <Principles />
      <Collection />
      <MaterialSelector />
      <Approach />
      <CustomBrief notify={notify} />
    </main>
  );
}
