"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Header } from "./components/header";
import { ProductDialog } from "./components/product-dialog";
import { Footer } from "./components/footer";
import { BagDialog } from "./components/bag-dialog";
import { Dialog } from "./components/dialog";
import { parseSelection, selectionKey } from "./selection";
import {
  NotificationProvider,
  NotificationViewport,
  useNotifications,
} from "@/components/ui/notifications";
import type { StoreProduct, BagSelection } from "./types";

const StorefrontContext = createContext<{
  openProduct: (product: StoreProduct) => void;
  notify: (message: string) => void;
  products: StoreProduct[];
  catalogError: boolean;
} | null>(null);

export function useStorefront() {
  const value = useContext(StorefrontContext);
  if (!value) throw new Error("useStorefront requires StorefrontShell");
  return value;
}

function StorefrontContent({
  children,
  products,
  catalogError,
}: {
  children: ReactNode;
  products: StoreProduct[];
  catalogError: boolean;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [bag, setBag] = useState<BagSelection[]>([]);
  const [ready, setReady] = useState(false);
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [panel, setPanel] = useState<"bag" | "account" | null>(null);
  const { notify } = useNotifications();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Browser persistence is optional; restricted storage must not break the page.
    let savedTheme: string | null = null;
    let savedBag: string | null = null;
    try {
      savedTheme = localStorage.getItem("carbignite-theme");
      savedBag = localStorage.getItem(selectionKey);
    } catch {}
    const frame = requestAnimationFrame(() => {
      setTheme(savedTheme === "dark" ? "dark" : "light");
      setBag(parseSelection(savedBag, products));
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [products]);
  useEffect(() => {
    if (!ready || catalogError) return;
    try {
      localStorage.setItem(selectionKey, JSON.stringify(bag));
      localStorage.setItem("carbignite-theme", theme);
    } catch {}
  }, [ready, bag, theme, catalogError]);
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

  function add(selection: BagSelection) {
    if (!parseSelection(JSON.stringify([selection]), products).length) {
      notify("This product or option is no longer available.", "error");
      return;
    }
    if (bag.length >= 50) {
      notify("Your bag is full. Remove a part first.", "info");
      return;
    }
    setBag((current) => [...current, selection]);
    setProduct(null);
    notify("Added to your bag");
  }
  return (
    <StorefrontContext.Provider
      value={{
        openProduct: setProduct,
        notify,
        products,
        catalogError,
      }}
    >
      <div
        ref={root}
        className="carbignite flex min-h-screen w-full max-w-none flex-col leading-[normal]"
        data-theme={theme}
      >
        <Header
          theme={theme}
          toggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
          count={bag.length}
          openBag={() => setPanel("bag")}
          openAccount={() => setPanel("account")}
        />
        {children}
        <Footer />
        {product && (
          <ProductDialog
            key={product.id}
            product={product}
            close={() => setProduct(null)}
            add={add}
          />
        )}
        {panel === "bag" && (
          <BagDialog
            selections={bag}
            products={products}
            remove={(index) =>
              setBag((current) => current.filter((_, i) => i !== index))
            }
            close={() => setPanel(null)}
          />
        )}
        {panel === "account" && (
          <Dialog
            id="account-dialog"
            title="account availability"
            onClose={() => setPanel(null)}
          >
            <div className="eyebrow">ACCOUNT</div>
            <h2>Coming next.</h2>
            <p className="muted">
              Account access is not connected in this homepage preview. No
              sign-in or customer information is collected here.
            </p>
            <button className="button primary" onClick={() => setPanel(null)}>
              Continue exploring <span>↗</span>
            </button>
          </Dialog>
        )}
        <NotificationViewport />
      </div>
    </StorefrontContext.Provider>
  );
}

export function StorefrontShell(props: {
  children: ReactNode;
  products: StoreProduct[];
  catalogError: boolean;
}) {
  return (
    <NotificationProvider>
      <StorefrontContent {...props} />
    </NotificationProvider>
  );
}
