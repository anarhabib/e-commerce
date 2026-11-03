import { AdminPanel } from "@/features/admin/admin-panel";
import { redirect } from "next/navigation";
import { hasOwnerSession } from "@/lib/admin-session";
import "@/features/admin/commerce.css";
import "@/features/admin/admin.css";

export const metadata = {
  title: "Workshop — CARBIGNITE",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await hasOwnerSession())) redirect("/admin/login");
  return <AdminPanel />;
}
