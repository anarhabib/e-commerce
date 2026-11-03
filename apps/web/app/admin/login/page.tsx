import { redirect } from "next/navigation";
import { hasOwnerSession } from "@/lib/admin-session";
import { AdminLogin } from "@/features/admin/admin-login";
import "@/features/admin/commerce.css";
import "@/features/admin/admin.css";

export const metadata = {
  title: "Owner sign-in — CARBIGNITE",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await hasOwnerSession()) redirect("/admin");
  return <AdminLogin />;
}
