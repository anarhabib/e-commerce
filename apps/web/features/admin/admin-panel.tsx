"use client";
import { Dropdown } from "@/components/ui/dropdown";
import { useNotificationActions } from "@/components/ui/notifications";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Pagination } from "@/features/products/components/pagination";
import { productImageStyle } from "@/features/products/utils";
import { useEffect, useState } from "react";
import { useLiveOrders } from "./use-live-orders";
import Link from "@/components/ui/navigation-link";
import { useRouter } from "next/navigation";
import { adminApi, AdminApiError } from "./api";
import { ProductEditor } from "./product-editor";
import { DeleteProductDialog } from "./delete-product-dialog";
import { OrderDetail } from "./order-detail";
import { RequestEditor } from "./request-editor";
import {
  type AdminProduct,
  type Order,
  type Overview,
  type Page,
  statuses,
  money,
  reference,
  statusName,
} from "./types";

type Tab = "overview" | "orders" | "products";
export function AdminPanel() {
  const router = useRouter();
  const { notify, dismissAll } = useNotificationActions();
  const [access, setAccess] = useState<"checking" | "guest" | "owner">(
    "checking",
  );
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const liveOrders = useLiveOrders(
    access === "owner" && tab !== "products",
    setRevision,
  );
  const [overview, setOverview] = useState<Overview | null>(null);
  const [products, setProducts] = useState<Page<{
    products: AdminProduct[];
  }> | null>(null);
  const [orders, setOrders] = useState<Page<{ orders: Order[] }> | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<
    { product: AdminProduct | null; duplicate?: boolean } | undefined
  >(undefined);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [intake, setIntake] = useState(false);
  useEffect(() => {
    let active = true;
    adminApi("session")
      .then(() => {
        if (active) setAccess("owner");
      })
      .catch((err) => {
        if (active) {
          setAccess("guest");
          router.replace("/admin/login");
          if (!(err instanceof AdminApiError && err.status === 401))
            setError(err.message);
        }
      });
    return () => {
      active = false;
    };
  }, [router]);
  useEffect(() => {
    if (access !== "owner") return;
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        if (tab === "overview") {
          const data = await adminApi<Overview>("overview");
          if (active) setOverview(data);
        }
        if (tab === "products") {
          const data = await adminApi<Page<{ products: AdminProduct[] }>>(
            `products?${new URLSearchParams({ search, page: String(page), limit: "10" })}`,
          );
          if (active) setProducts(data);
        }
        if (tab === "orders") {
          const data = await adminApi<Page<{ orders: Order[] }>>(
            `orders?${new URLSearchParams({ ...(status ? { status } : {}), page: String(page) })}`,
          );
          if (active) setOrders(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Unable to load workshop",
          );
          if (err instanceof AdminApiError && err.status === 401) {
            setAccess("guest");
            router.replace("/admin/login");
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [access, tab, page, search, status, revision, router]);
  function switchTab(value: Tab) {
    if (value === tab) return;
    dismissAll();
    setTab(value);
    setPage(1);
    setLoading(true);
    setError("");
  }
  function refresh(message: string) {
    if (editing !== undefined) router.refresh();
    setEditing(undefined);
    setDeleting(null);
    setOrder(null);
    setIntake(false);
    notify(message);
    setLoading(true);
    setRevision((r) => r + 1);
  }
  function duplicateProduct(product: AdminProduct) {
    const suffix = crypto.randomUUID().slice(0, 8);
    setEditing({
      duplicate: true,
      product: {
        ...product,
        name: `${product.name.slice(0, 193)} (copy)`,
        sku: `${product.sku.slice(0, 36)}-copy-${suffix}`,
        slug: `${product.slug}-copy-${suffix}`,
        active: false,
        stock: 0,
      },
    });
  }
  async function logout() {
    setBusy(true);
    setError("");
    try {
      await adminApi("logout", "POST");
      setAccess("guest");
      setOverview(null);
      setOrders(null);
      setProducts(null);
      dismissAll();
      router.replace("/admin/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign out");
    } finally {
      setBusy(false);
    }
  }
  function cards(list: Order[]) {
    return list.length ? (
      list.map((o) => (
        <article className="order-card" key={o.id}>
          <div className="order-card-top">
            <div>
              <strong>
                {reference(o)} · {o.customer.name}
              </strong>
              <p>
                {new Date(o.createdAt).toLocaleDateString()} ·{" "}
                {o.customer.country}
              </p>
            </div>
            <span className={`status ${o.status}`}>{statusName(o.status)}</span>
          </div>
          <div className="order-card-bottom">
            <span>
              {o.items.reduce((sum, i) => sum + i.quantity, 0)} part(s) ·{" "}
              {money(o.totalCents)} estimated
            </span>
            <button className="order-detail-button" onClick={() => setOrder(o)}>
              View request ↗
            </button>
          </div>
        </article>
      ))
    ) : (
      <div className="empty-panel">
        <h3>A quiet workshop. For now.</h3>
        <p>
          No order requests match this view. Record a customer inquiry using New
          request.
        </p>
      </div>
    );
  }
  function changePage(nextPage: number) {
    if (loading || nextPage === page) return;
    setPage(nextPage);
    setLoading(true);
  }
  return (
    <main className="admin-main">
      <aside className="admin-sidebar">
        <div className="eyebrow">THE WORKSHOP / STORE MANAGEMENT</div>
        <h2>
          Behind
          <br />
          the <em>details.</em>
        </h2>
        <nav className="admin-nav" aria-label="Admin section">
          {(["overview", "orders", "products"] as Tab[]).map((name, index) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              aria-current={tab === name ? "page" : undefined}
              onClick={() => switchTab(name)}
            >
              {name === "orders"
                ? "Order requests"
                : name === "overview"
                  ? "Overview"
                  : "Products"}
              <span>0{index + 1}</span>
            </button>
          ))}
        </nav>
        <Link className="back-link" href="/">
          ↗ View storefront
        </Link>
        <div className="admin-note">
          OWNER ACCESS
          <br />
          <span>Products &amp; order requests</span>
          {liveOrders && <p role="status">{liveOrders}</p>}
        </div>
      </aside>
      <div className="admin-workspace">
        <div className="admin-title">
          <div>
            <div className="eyebrow">CARBIGNITE / CONTROL ROOM</div>
            <h1>
              {
                {
                  overview: "Store overview.",
                  orders: "Every build, in view.",
                  products: "Considered details.",
                }[tab]
              }
            </h1>
          </div>
          <span className="owner-badge">
            {access === "checking"
              ? "Checking access"
              : access === "owner"
                ? "Store owner"
                : "Sign in required"}
          </span>
        </div>
        {error && (
          <div className="form-error" role="alert">
            {error}{" "}
            {access === "owner" && (
              <button
                className="text-button"
                onClick={() => setRevision((r) => r + 1)}
              >
                Retry ↗
              </button>
            )}
          </div>
        )}
        {access === "checking" && <LoadingBar label="Checking owner access" />}
        {access === "guest" && <LoadingBar label="Opening owner sign-in" />}
        {access === "owner" && (
          <>
            <div className="admin-session">
              <button className="text-button" disabled={busy} onClick={logout}>
                Sign out ↗
              </button>
            </div>
            {busy && <LoadingBar label="Signing out" />}
            {loading && <LoadingBar label="Loading workshop" />}
            {!loading && !error && tab === "overview" && overview && (
              <section>
                <div className="metric-grid">
                  {[
                    [
                      "ORDER REQUESTS",
                      overview.orders,
                      "Every build starts somewhere.",
                    ],
                    [
                      "AWAITING REVIEW",
                      overview.pending,
                      "Your next conversations.",
                    ],
                    [
                      "ACTIVE PRODUCTS",
                      overview.products,
                      "Details ready to discover.",
                    ],
                  ].map(([label, value, copy]) => (
                    <article key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                      <p>{copy}</p>
                    </article>
                  ))}
                </div>
                <div className="section-title">
                  <h2>The latest requests.</h2>
                  <button
                    className="text-button"
                    onClick={() => switchTab("orders")}
                  >
                    View all ↗
                  </button>
                </div>
                {cards(overview.recent)}
                <div className="admin-help">
                  <div className="eyebrow">A CONSIDERED WORKFLOW</div>
                  <h3>Request. Confirm. Create.</h3>
                  <p>
                    Review each build, confirm fitment and pricing, then move
                    the request into production. Payment processing is not
                    connected.
                  </p>
                </div>
              </section>
            )}
            {tab === "products" && (
              <section>
                <div className="table-toolbar">
                  <h2>The collection</h2>
                  <div>
                    <input
                      type="search"
                      aria-label="Search products"
                      placeholder="Search your collection…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                        setLoading(true);
                      }}
                    />
                    <button
                      className="button primary"
                      onClick={() => setEditing({ product: null })}
                    >
                      Add product <span>+</span>
                    </button>
                  </div>
                </div>
                {!loading && !error && products && (
                  <>
                    <p className="admin-product-count" aria-live="polite">
                      {products.total === 0
                        ? "No products"
                        : `Showing ${(products.page - 1) * (products.limit ?? 10) + 1}–${Math.min(products.page * (products.limit ?? 10), products.total)} of ${products.total} products`}
                    </p>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            {[
                              "Product",
                              "Vehicle",
                              "Price",
                              "Stock",
                              "Status",
                              "Actions",
                            ].map((h) => (
                              <th key={h} scope="col">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {products.products.length ? (
                            products.products.map((p) => (
                              <tr key={p.id}>
                                <td>
                                  <div className="table-product">
                                    {p.imageUrl && (
                                      <span
                                        className="summary-image"
                                        style={productImageStyle(p)}
                                        role="img"
                                        aria-label={
                                          p.isSample
                                            ? `Concept ${p.name}`
                                            : p.name
                                        }
                                      />
                                    )}
                                    <span>
                                      {p.name}
                                      <small>
                                        {p.category} · {p.sku}
                                        {p.isSample ? " · Demo" : ""}
                                      </small>
                                    </span>
                                  </div>
                                </td>
                                <td>
                                  {p.make || "—"}
                                  <small>
                                    {p.model} {p.yearFrom}
                                    {p.yearTo ? `–${p.yearTo}` : ""}
                                  </small>
                                </td>
                                <td>{money(p.priceCents)}</td>
                                <td>{p.stock}</td>
                                <td>
                                  <span
                                    className={`status ${p.active ? "product-active" : "product-hidden"}`}
                                  >
                                    {p.active ? "Active" : "Hidden"}
                                  </span>
                                </td>
                                <td>
                                  <div className="product-row-actions">
                                    <button
                                      className="edit-button"
                                      onClick={() => setEditing({ product: p })}
                                      aria-label={`Edit ${p.name}`}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="edit-button"
                                      onClick={() => duplicateProduct(p)}
                                      aria-label={`Duplicate ${p.name}`}
                                    >
                                      Duplicate
                                    </button>
                                    <button
                                      className="edit-button delete-product-button"
                                      onClick={() => setDeleting(p)}
                                      aria-label={`Delete ${p.name}`}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6}>
                                No products match this search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      page={page}
                      totalPages={products.totalPages}
                      onPageChange={changePage}
                      disabled={loading}
                    />
                  </>
                )}
              </section>
            )}
            {tab === "orders" && (
              <section>
                <div className="table-toolbar">
                  <h2>Order requests</h2>
                  <div>
                    <label>
                      Filter status
                      <Dropdown
                        aria-label="Filter request status"
                        value={status}
                        onChange={(e) => {
                          setStatus(e.target.value);
                          setPage(1);
                          setLoading(true);
                        }}
                      >
                        <option value="">All statuses</option>
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {statusName(s)}
                          </option>
                        ))}
                      </Dropdown>
                    </label>
                    <button
                      className="button primary"
                      onClick={() => setIntake(true)}
                    >
                      New request +
                    </button>
                  </div>
                </div>
                {!loading && !error && orders && (
                  <>
                    {cards(orders.orders)}
                    <Pagination
                      page={page}
                      totalPages={orders.totalPages}
                      onPageChange={changePage}
                      disabled={loading}
                    />
                  </>
                )}
              </section>
            )}
          </>
        )}
        {access === "owner" && editing !== undefined && (
          <ProductEditor
            product={editing.product}
            duplicate={editing.duplicate}
            close={() => setEditing(undefined)}
            saved={() =>
              refresh(
                editing.duplicate ? "Product copy created." : "Product saved.",
              )
            }
          />
        )}
        {access === "owner" && deleting && (
          <DeleteProductDialog
            product={deleting}
            close={() => setDeleting(null)}
            deleted={() => {
              if (products?.products.length === 1 && page > 1)
                setPage((current) => current - 1);
              router.refresh();
              refresh("Product deleted.");
            }}
          />
        )}
        {access === "owner" && order && (
          <OrderDetail
            order={order}
            close={() => setOrder(null)}
            saved={() => refresh("Request status updated.")}
          />
        )}
        {access === "owner" && intake && (
          <RequestEditor
            close={() => setIntake(false)}
            saved={() => refresh("Order request saved. No payment taken.")}
          />
        )}
      </div>
    </main>
  );
}
