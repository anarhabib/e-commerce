"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "@/components/ui/navigation-link";

export function Header({
  theme,
  toggleTheme,
  count,
  openBag,
  openAccount,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
  count: number;
  openBag: () => void;
  openAccount: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <>
      <div className="announcement">
        A new expression of carbon.{" "}
        <Link href="/#collection">
          Discover the first collection{" "}
          <span>
            {" "}
            <ArrowUpRight size={16} />
          </span>
        </Link>
      </div>
      <header className={scrolled ? "is-scrolled" : ""}>
        <Link className="wordmark" href="/" aria-label="Carbignite home">
          CARBIGNITE
        </Link>
        <nav
          id="main-navigation"
          className={`carb-mobile:flex carb-mobile:justify-between carb-mobile:top-full ${
            menu
              ? "open carb-mobile:visible carb-mobile:opacity-100 carb-mobile:translate-y-0 carb-mobile:pointer-events-auto carb-mobile:delay-0"
              : "carb-mobile:invisible carb-mobile:opacity-0 carb-mobile:-translate-y-2 carb-mobile:pointer-events-none"
          }`}
          aria-label="Main navigation"
        >
          {[
            ["collection", "The collection"],
            ["material", "The material"],
            ["atelier", "Our approach"],
          ].map(([id, label]) => (
            <Link key={id} href={`/#${id}`} onClick={() => setMenu(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button className="account-link" onClick={openAccount}>
            Account
          </button>
          <button
            className="icon-button"
            id="theme"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            onClick={toggleTheme}
          >
            ◐
          </button>
          <button className="bag-button" onClick={openBag}>
            Bag <span aria-live="polite">{count}</span>
          </button>
          <button
            className="icon-button mobile-menu"
            aria-controls="main-navigation"
            aria-expanded={menu}
            aria-label={menu ? "Close navigation" : "Open navigation"}
            onClick={() => setMenu((open) => !open)}
          >
            <span className="relative block size-5" aria-hidden="true">
              <span
                className={`absolute top-2.25 left-0 h-px w-5 bg-current transition-transform duration-280 ease-[ease] motion-reduce:transition-none ${menu ? "rotate-45" : "-translate-y-1.5"}`}
              />
              <span
                className={`absolute top-2.25 left-0 h-px w-5 bg-current transition-opacity duration-180 ease-[ease] motion-reduce:transition-none ${menu ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute top-2.25 left-0 h-px w-5 bg-current transition-transform duration-280 ease-[ease] motion-reduce:transition-none ${menu ? "-rotate-45" : "translate-y-1.5"}`}
              />
            </span>
          </button>
        </div>
      </header>
    </>
  );
}
