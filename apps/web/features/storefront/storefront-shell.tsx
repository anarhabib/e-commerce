"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Header } from "./components/header";
import { ProductDialog } from "./components/product-dialog";
import { Footer } from "./components/footer";
import { BagDialog } from "./components/bag-dialog";
import { AccountDialog } from "./components/account-dialog";
import { parseSelection, selectionKey } from "./selection";
import {
  NotificationProvider,
  NotificationViewport,
  useNotificationActions,
} from "@/components/ui/notifications";
import type { StoreProduct, BagSelection } from "./types";

const StorefrontContext = createContext<{
  openProduct: (product: StoreProduct) => void;
  notify: (message: string) => void;
  products: StoreProduct[];
  catalogError: boolean;
  bag: BagSelection[];
  bagReady: boolean;
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
  const { notify } = useNotificationActions();
  const storefront = useMemo(
    () => ({
      openProduct: setProduct,
      notify,
      products,
      catalogError,
      bag,
      bagReady: ready,
    }),
    [notify, products, catalogError, bag, ready],
  );

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
      const restored = parseSelection(savedBag, products);
      setBag((current) =>
        JSON.stringify(current) === JSON.stringify(restored)
          ? current
          : restored,
      );
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
    <StorefrontContext.Provider value={storefront}>
      <div
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
        {panel === "account" && <AccountDialog close={() => setPanel(null)} />}
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
