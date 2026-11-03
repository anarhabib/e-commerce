import {
  getProducts,
  getProductFilters,
  type SearchParams,
} from "@/features/products/api";
import { ProductGrid } from "@/features/products/components/product-grid";
import { ProductFilters } from "@/features/products/components/product-filters";
import { Pagination } from "@/features/products/components/pagination";
import { MobileFilters } from "@/features/products/components/mobile-filters";
import { VehicleSelector } from "@/features/products/components/vehicle-selector";

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value) ?? "";
  const initialVehicle = {
    make: first(params.make),
    model: first(params.model),
    year: first(params.year),
  };
  const [list, facets] = await Promise.all([
    getProducts(params),
    getProductFilters(params),
  ]);
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <section
        aria-labelledby="vehicle-heading"
        className="mb-8 rounded-sm border border-(--line) bg-(--paper) p-4 sm:p-6"
      >
        <h1 id="vehicle-heading" className="text-2xl font-semibold">
          Find parts for your vehicle
        </h1>
        <p className="mt-2 text-sm text-(--muted)">
          Choose a make, then narrow by model and year.
        </p>
        <VehicleSelector
          key={JSON.stringify(initialVehicle)}
          vehicles={facets.vehicles}
          initialVehicle={initialVehicle}
          columns="sm:grid-cols-3"
          className="mt-4"
        />
      </section>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Phones and tablets: sticky toolbar + bottom sheet */}
        <div className="lg:hidden">
          <MobileFilters facets={facets} total={list.total} />
        </div>

        {/* Desktop sidebar */}
        <div className="hidden pt-8 lg:block">
          <ProductFilters facets={facets} />
        </div>

        <section>
          {/* On phones the count is already in the toolbar */}
          <p className="mb-4 hidden font-mono text-xs text-muted lg:block">
            {list.total} products
          </p>
          <ProductGrid products={list.products} />
          <Pagination
            page={list.page}
            totalPages={list.totalPages}
            searchParams={params}
          />
        </section>
      </div>
    </main>
  );
}
