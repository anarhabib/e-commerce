"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Car, X } from "lucide-react";
import type { ProductFacets } from "../types";
import { formatCategory } from "../utils";

export function ProductFilters({ facets }: { facets: ProductFacets }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const vehicle = ["year", "make", "model"]
    .map((key) => searchParams.get(key))
    .filter(Boolean)
    .join(" ");

  const selected = searchParams.getAll("category");

  const options = [
    ...facets.categories,
    ...selected
      .filter((s) => !facets.categories.some((c) => c.value === s))
      .map((value) => ({ value, count: 0 })),
  ];

  function toggleCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    next.forEach((item) => params.append("category", item));
    params.delete("page"); // new filter starts at page 1
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearVehicle() {
    const params = new URLSearchParams(searchParams.toString());
    ["make", "model", "year"].forEach((key) => params.delete(key));
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <aside className="space-y-6">
      <section className="rounded-sm border border-secondary/10 bg-white p-4">
        <p className="flex justify-between font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
          Active vehicle
          <Car className="h-4 w-4" />
        </p>
        {vehicle ? (
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-bold text-secondary">
              {vehicle}
            </p>
            <button
              type="button"
              onClick={clearVehicle}
              className="text-muted hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">No vehicle selected</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-wider text-muted">
          Product type
        </h2>
        <ul className="space-y-2">
          {options.map((option) => (
            <li key={option.value}>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleCategory(option.value)}
                  className="h-4 w-4 accent-primary"
                />
                <span>{formatCategory(option.value)}</span>
                <span className="text-muted">({option.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
