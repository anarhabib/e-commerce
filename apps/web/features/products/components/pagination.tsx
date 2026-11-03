"use client";

import Link from "@/components/ui/navigation-link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SearchParams } from "../api";

type Props = {
  page: number;
  totalPages: number;
  searchParams?: SearchParams;
  pathname?: string;
  onPageChange?: (page: number) => void;
  disabled?: boolean;
};

// Keeps every filter when moving between pages.
function pageHref(searchParams: SearchParams, page: number, pathname: string) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page" || value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      query.append(key, item);
    }
  }
  if (page > 1) query.set("page", String(page));
  const text = query.toString();
  return text ? `${pathname}?${text}` : pathname;
}

const buttonClass = "catalog-page-button";

type NavButtonProps = {
  href: string | null; // null = disabled
  direction: "prev" | "next";
  onClick?: () => void;
};

function NavButton({ href, direction, onClick }: NavButtonProps) {
  const isPrev = direction === "prev";
  const label = isPrev ? "Previous" : "Next";
  const Icon = isPrev ? ChevronLeft : ChevronRight;

  const content = (
    <>
      {isPrev && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
      <span className="catalog-page-label">{label}</span>
      {!isPrev && <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={buttonClass}
      >
        {content}
      </button>
    );
  }

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
    <Link href={href} aria-label={label} className={buttonClass}>
      {content}
    </Link>
  );
}

export function Pagination({
  page,
  totalPages,
  searchParams = {},
  pathname = "/products",
  onPageChange,
  disabled = false,
}: Props) {
  if (totalPages <= 1) return null;
  const pages = [...new Set([1, page - 1, page, page + 1, totalPages])]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  return (
    <nav aria-label="Pagination" className="catalog-pagination">
      <NavButton
        direction="prev"
        href={
          !disabled && page > 1
            ? pageHref(searchParams, page - 1, pathname)
            : null
        }
        onClick={
          !disabled && page > 1 && onPageChange
            ? () => onPageChange(page - 1)
            : undefined
        }
      />

      <div className="catalog-page-numbers">
        {pages.map((value, index) => (
          <span key={value} className="catalog-page-item">
            {index > 0 && value - pages[index - 1] > 1 && (
              <span className="catalog-page-gap" aria-hidden="true">
                …
              </span>
            )}
            {onPageChange ? (
              <button
                type="button"
                onClick={() => onPageChange(value)}
                disabled={disabled || value === page}
                aria-label={`Page ${value}`}
                aria-current={value === page ? "page" : undefined}
                className="catalog-page-number"
              >
                {value}
              </button>
            ) : (
              <Link
                href={pageHref(searchParams, value, pathname)}
                aria-label={`Page ${value}`}
                aria-current={value === page ? "page" : undefined}
                className="catalog-page-number"
              >
                {value}
              </Link>
            )}
          </span>
        ))}
      </div>
      <p className="catalog-page-status">
        Page {page} of {totalPages}
      </p>

      <NavButton
        direction="next"
        href={
          !disabled && page < totalPages
            ? pageHref(searchParams, page + 1, pathname)
            : null
        }
        onClick={
          !disabled && page < totalPages && onPageChange
            ? () => onPageChange(page + 1)
            : undefined
        }
      />
    </nav>
  );
}
