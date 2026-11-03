"use client";

export default function CatalogError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-20">
      <h1 className="text-3xl font-semibold">
        Catalog temporarily unavailable
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        We couldn’t load the catalog. Please try again later.
      </p>
      <button className="button primary mt-6" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
