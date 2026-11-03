import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchParams } from "../api";

type Props = {
  page: number;
  totalPages: number;
  searchParams: SearchParams;
};

// Builds "/products?...&page=N" and keeps every other filter.
function pageHref(searchParams: SearchParams, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      query.append(key, item);
    }
  }
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `/products?${text}` : "/products";
}

const buttonClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 rounded-sm border border-secondary font-mono text-xs font-bold uppercase tracking-wider text-secondary transition sm:w-32";

type NavButtonProps = {
  href: string | null; // null = disabled
  direction: "prev" | "next";
};

function NavButton({ href, direction }: NavButtonProps) {
  const isPrev = direction === "prev";
  const label = isPrev ? "Previous" : "Next";
  const Icon = isPrev ? ChevronLeft : ChevronRight;

  const content = (
    <>
      {isPrev && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
      <span className="hidden sm:inline">{label}</span>
      {!isPrev && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
    </>
  );

  if (!href) {
    return (
      <span
        aria-label={`${label} (unavailable)`}
        aria-disabled="true"
        className={`${buttonClass} pointer-events-none opacity-40`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={`${buttonClass} hover:bg-secondary hover:text-white`}
    >
      {content}
    </Link>
  );
}

export function Pagination({ page, totalPages, searchParams }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 grid grid-cols-[auto_1fr_auto] items-center gap-3"
    >
      <NavButton
        direction="prev"
        href={page > 1 ? pageHref(searchParams, page - 1) : null}
      />

      <p className="text-center font-mono text-xs text-muted">
        Page <span className="font-bold text-secondary">{page}</span> of{" "}
        {totalPages}
      </p>

      <NavButton
        direction="next"
        href={page < totalPages ? pageHref(searchParams, page + 1) : null}
      />
    </nav>
  );
}
