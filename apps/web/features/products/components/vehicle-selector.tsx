"use client";
import { Dropdown } from "@/components/ui/dropdown";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { VehicleOption } from "../types";

type Props = {
  vehicles: VehicleOption[];
  className?: string;
  columns?: string;
  initialVehicle?: { make: string; model: string; year: string };
  availableMakes?: string[];
  allowEmpty?: boolean;
  value?: { make: string; model: string; year: string };
  onVehicleChange?: (vehicle: {
    make: string;
    model: string;
    year: string;
  }) => void;
  fieldsOnly?: boolean;
};

const selectStyles = "w-full";

export function VehicleSelector({
  vehicles,
  className,
  columns,
  initialVehicle = { make: "", model: "", year: "" },
  availableMakes,
  allowEmpty = false,
  value,
  onVehicleChange,
  fieldsOnly = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localVehicle, setLocalVehicle] = useState(initialVehicle);
  const { make, model, year } = value ?? localVehicle;
  function changeVehicle(vehicle: typeof initialVehicle) {
    if (value === undefined) setLocalVehicle(vehicle);
    onVehicleChange?.(vehicle);
  }

  // Distinct makes, sorted
  const makes = useMemo(
    () => [...new Set(availableMakes ?? vehicles.map((v) => v.make))].sort(),
    [vehicles, availableMakes],
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
    changeVehicle({ make: value, model: "", year: "" });
  }

  function handleModelChange(value: string) {
    changeVehicle({ make, model: value, year: "" });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!make && !allowEmpty) return;

    const params = new URLSearchParams(searchParams.toString());
    ["make", "model", "year", "page"].forEach((key) => params.delete(key));
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", year);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const fields = (
    <div className={`grid gap-2 ${columns ?? ""}`}>
      <Dropdown
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
      </Dropdown>

      <Dropdown
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
      </Dropdown>

      <Dropdown
        aria-label="Year"
        value={year}
        onChange={(e) => changeVehicle({ make, model, year: e.target.value })}
        disabled={!model || years.length === 0}
        className={selectStyles}
      >
        <option value="">Year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Dropdown>
    </div>
  );

  if (fieldsOnly) return <div className={className}>{fields}</div>;

  return (
    <form onSubmit={handleSubmit} className={className}>
      {fields}

      <Button
        type="submit"
        disabled={!make && !allowEmpty}
        className="mt-3 w-full"
      >
        Find parts
      </Button>
    </form>
  );
}
