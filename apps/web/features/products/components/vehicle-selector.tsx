"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { VehicleOption } from "../types";

type Props = {
  vehicles: VehicleOption[];
  className?: string;
  columns?: string;
  initialVehicle?: { make: string; model: string; year: string };
};

const selectStyles =
  "w-full rounded-sm border border-secondary/20 bg-white p-2.5 font-mono text-xs text-secondary focus:border-primary focus:outline-none disabled:opacity-50";

export function VehicleSelector({
  vehicles,
  className,
  columns,
  initialVehicle = { make: "", model: "", year: "" },
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [make, setMake] = useState(initialVehicle.make);
  const [model, setModel] = useState(initialVehicle.model);
  const [year, setYear] = useState(initialVehicle.year);

  // Distinct makes, sorted
  const makes = useMemo(
    () => [...new Set(vehicles.map((v) => v.make))].sort(),
    [vehicles],
  );

  // Distinct models of the chosen make
  const models = useMemo(
    () =>
      [
        ...new Set(vehicles.filter((v) => v.make === make).map((v) => v.model)),
      ].sort(),
    [vehicles, make],
  );

  // Every year covered by the chosen model (newest first)
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const v of vehicles) {
      if (v.make !== make || v.model !== model) continue;
      if (v.yearFrom === null) continue;
      const end = v.yearTo ?? v.yearFrom;
      for (let y = v.yearFrom; y <= end; y++) set.add(y);
    }
    return [...set].sort((a, b) => b - a);
  }, [vehicles, make, model]);

  function handleMakeChange(value: string) {
    setMake(value);
    setModel(""); // a new make invalidates model and year
    setYear("");
  }

  function handleModelChange(value: string) {
    setModel(value);
    setYear("");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!make) return;

    const params = new URLSearchParams(searchParams.toString());
    ["make", "model", "year", "page"].forEach((key) => params.delete(key));
    params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", year);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`grid gap-2 ${columns ?? ""}`}>
        <select
          aria-label="Make"
          value={make}
          onChange={(e) => handleMakeChange(e.target.value)}
          className={selectStyles}
        >
          <option value="">Make</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          aria-label="Model"
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          disabled={!make}
          className={selectStyles}
        >
          <option value="">Model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          aria-label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          disabled={!model || years.length === 0}
          className={selectStyles}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={!make} className="mt-3 w-full">
        Find parts
      </Button>
    </form>
  );
}
