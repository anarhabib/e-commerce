"use client";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Dropdown } from "@/components/ui/dropdown";
import { useState, type FormEvent } from "react";
import { Dialog } from "@/features/storefront/components/dialog";
import { adminApi } from "./api";
import { type Order, money, reference, statuses, statusName } from "./types";

export function OrderDetail({
  order,
  close,
  saved,
}: {
  order: Order;
  close: () => void;
  saved: () => void;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const status = new FormData(event.currentTarget).get("status");
    try {
      await adminApi(`orders/${order.id}`, "PATCH", { status });
      saved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save status");
    } finally {
      setBusy(false);
    }
  }
  const c = order.customer;
  return (
    <Dialog id="order-detail" title="order request details" onClose={close}>
      {busy && <LoadingBar label="Updating workshop" />}
      <div className="eyebrow">
        ORDER REQUEST / {new Date(order.createdAt).toLocaleDateString()}
      </div>
      <h2>{reference(order)}</h2>
      <span className={`status ${order.status}`}>
        {statusName(order.status)}
      </span>
      <div className="order-detail-lines">
        {order.items.map((item, index) => (
          <div key={index}>
            <span>
              {item.name}
              <small>
                {item.make} {item.model} · {item.pattern} / {item.finish} · Qty{" "}
                {item.quantity}
                <br />
                {money(item.unitCents)} each
              </small>
            </span>
            <strong>{money(item.unitCents * item.quantity)}</strong>
          </div>
        ))}
        <div>
          <span>Estimated parts subtotal</span>
          <strong>{money(order.totalCents)}</strong>
        </div>
      </div>
      <div className="address-block">
        {c.name}
        <br />
        {c.email} · {c.phone}
        <br />
        {c.address}
        <br />
        {c.city}, {c.region} {c.postal}
        <br />
        {c.country}
        {c.note && (
          <>
            <br />
            <br />
            Build notes: {c.note}
          </>
        )}
      </div>
      <p className="microcopy">
        No payment taken. Confirm fitment, final quote, taxes and shipping
        before production. This request does not reserve stock.
      </p>
      <form onSubmit={submit} className="order-detail-status">
        <Dropdown
          name="status"
          aria-label="Order request status"
          defaultValue={order.status}
          disabled={busy}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusName(s)}
            </option>
          ))}
        </Dropdown>
        <button disabled={busy} className="button primary">
          {busy ? "Saving…" : "Update status ↗"}
        </button>
      </form>
      <p className="form-error" role="alert">
        {error}
      </p>
    </Dialog>
  );
}
