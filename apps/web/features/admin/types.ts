import type { Product } from "@/features/products/types";
export type AdminProduct = Product & { active: boolean };
export const statuses = [
  "requested",
  "in_review",
  "quoted",
  "in_production",
  "shipped",
  "cancelled",
] as const;
export type Status = (typeof statuses)[number];
export type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postal: string;
  country: string;
  note: string;
};
export type Order = {
  id: string;
  status: Status;
  createdAt: string;
  customer: Customer;
  totalCents: number;
  items: {
    productId: string;
    name: string;
    make: string | null;
    model: string | null;
    pattern: string;
    finish: string;
    quantity: number;
    unitCents: number;
  }[];
};
export type Page<T> = { total: number; page: number; limit?: number; totalPages: number } & T;
export type Overview = {
  orders: number;
  pending: number;
  products: number;
  recent: Order[];
};
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export const statusName = (status: string) => status.replaceAll("_", " ");
export const reference = (order: Order) =>
  `CB-${order.id.slice(0, 8).toUpperCase()}`;
