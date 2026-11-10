"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Dialog } from "@/features/storefront/components/dialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Car, SlidersHorizontal, X } from "lucide-react";
import { formatCategory } from "../utils";

type Props = {
  total: number;
  children: ReactNode;
  categoryLabels?: Record<string, string>;
};

const chipClass =
  "inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-primary/30 bg-primary-soft px-2.5 py-1.5 font-mono text-xs font-bold text-primary";

const CloseFiltersContext = createContext<(() => void) | undefined>(undefined);
export function useCloseMobileFilters() {
  return useContext(CloseFiltersContext);
}

export function MobileFilters({ total, children, categoryLabels = {} }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const categories = searchParams.getAll("category");
  const vehicle = ["year", "make", "model"]
    .map((key) => searchParams.get(key))
    .filter(Boolean)
    .join(" ");
  const search = searchParams.get("search");
  const collection = searchParams.get("collection");
  const activeCount =
    categories.length +
    (vehicle ? 1 : 0) +
    (search ? 1 : 0) +
    (collection ? 1 : 0);

  const openSheet = () => setOpen(true);
  const closeSheet = () => setOpen(false);

  // Remove some params from the URL, keep everything else, go back to page 1
  function removeParams(keys: string[], onlyValue?: string) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of keys) {
      if (onlyValue) {
        const kept = params.getAll(key).filter((v) => v !== onlyValue);
        params.delete(key);
        kept.forEach((v) => params.append(key, v));
      } else {
        params.delete(key);
      }
    }
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className="shop-mobile-filters">
      {/* Sticky toolbar: stays under the header while scrolling */}
      <div className="mobile-filter-toolbar sticky top-[87px] z-20 carb-mobile:top-[72px] -mx-4 border-b border-secondary/10 bg-tertiary/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={openSheet}
            className="mobile-filter-toggle inline-flex h-10 items-center gap-2 rounded-sm bg-secondary px-4 font-mono text-xs font-bold uppercase tracking-wider text-white"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px]">
                {activeCount}
              </span>
            )}
          </button>
          <p className="font-mono text-xs text-muted">{total} products</p>
        </div>

        {/* Active filters as removable chips (scroll sideways if many) */}
        {activeCount > 0 && (
          <ul className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
            {collection && (
              <li>
                <button
                  type="button"
                  onClick={() => removeParams(["collection"])}
                  className={chipClass}
                  aria-label={`Remove ${formatCategory(collection)} collection`}
                >
                  {formatCategory(collection)} <X className="h-3.5 w-3.5" />
                </button>
              </li>
            )}
            {search && (
              <li>
                <button
                  type="button"
                  onClick={() => removeParams(["search"])}
                  className={chipClass}
                  aria-label={`Remove search ${search}`}
                >
                  {search}
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            )}
            {vehicle && (
              <li>
                <button
                  type="button"
                  onClick={() => removeParams(["make", "model", "year"])}
                  className={chipClass}
                  aria-label={`Remove vehicle ${vehicle}`}
                >
                  <Car className="h-3.5 w-3.5" />
                  {vehicle}
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            )}
            {categories.map((category) => (
              <li key={category}>
                <button
                  type="button"
                  onClick={() => removeParams(["category"], category)}
                  className={chipClass}
                  aria-label={`Remove ${categoryLabels[category] ?? formatCategory(category)}`}
                >
                  {categoryLabels[category] ?? formatCategory(category)}
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {open && (
        <Dialog
          id="shop-filters"
          title="Filters"
          className="shop-filter-sheet"
          onClose={closeSheet}
        >
          <h2>Filters</h2>
          <CloseFiltersContext.Provider value={closeSheet}>
            {children}
          </CloseFiltersContext.Provider>
        </Dialog>
      )}
    </div>
  );
}
