"use client";

import { useEffect, useRef } from "react";

// Call from the component that owns this DOM subtree: its effect runs after hydration.
// The shared shell must never mutate pages that are still streaming/hydrating.
export function useReveal() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = root.current!;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    // Cleanup leaves the page readable, even if observation is unavailable on restart.
    element.classList.remove("motion-ready");
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.08 },
    );
    const register = () => {
      element
        .querySelectorAll<HTMLElement>(
          ".section-heading,.filter-bar,.material-copy,.atelier>div,.custom>.eyebrow,.custom>h2,.custom>div:last-child,.principles>span,.product-card",
        )
        .forEach((target, index) => {
          // Classes survive Strict Mode cleanup and Fast Refresh; observations do not.
          if (!target.classList.contains("reveal")) {
            target.classList.add("reveal");
            target.style.setProperty(
              "--reveal-delay",
              target.matches(".product-card,.principles>span")
                ? `${(index % 4) * 65}ms`
                : "0ms",
            );
          }
          if (preference.matches) {
            target.classList.add("is-visible");
          } else if (!target.classList.contains("is-visible")) {
            observer.observe(target);
          }
        });
    };
    const updateMotion = () => {
      observer.disconnect();
      element.classList.remove("motion-ready");
      register();
      if (!preference.matches) element.classList.add("motion-ready");
    };
    updateMotion();
    const mutation = new MutationObserver(register);
    mutation.observe(element, { childList: true, subtree: true });
    preference.addEventListener("change", updateMotion);
    return () => {
      observer.disconnect();
      mutation.disconnect();
      preference.removeEventListener("change", updateMotion);
      element.classList.remove("motion-ready");
    };
  }, []);
  return root;
}
