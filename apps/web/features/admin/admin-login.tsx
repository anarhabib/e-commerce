"use client";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { LoadingBar } from "@/components/ui/loading-bar";
import { useState, type FormEvent } from "react";
import Link from "@/components/ui/navigation-link";
import { useRouter } from "next/navigation";
import { adminApi } from "./api";

export function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      await adminApi("login", "POST", {
        email: form.get("email"),
        password: form.get("password"),
      });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
      setBusy(false);
    }
  }
  return (
    <main className="owner-login-page">
      <section className="owner-login-card" aria-labelledby="owner-login-title">
        <div className="eyebrow">OWNER ACCESS</div>
        <h1 id="owner-login-title">The workshop.</h1>
        <p>Sign in to manage your store.</p>
        {busy && <LoadingBar label="Signing in" />}
        <form onSubmit={login} aria-busy={busy}>
          <label>
            Email
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              disabled={busy}
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              maxLength={256}
              required
              disabled={busy}
            />
          </label>
          <p className="form-error" role="alert">
            {error}
          </p>
          <Button
            type="submit"
            disabled={busy}
            endIcon={!busy && <ArrowUpRight size={16} />}
          >
            {busy ? "Signing in…" : <>Sign in </>}
          </Button>
        </form>
        <Link className="back-link" href="/">
          Return to storefront{" "}
          <ArrowUpRight className="admin-arrow" size={16} aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
