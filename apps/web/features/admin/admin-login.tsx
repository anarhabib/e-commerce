"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
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
          <button className="button primary" disabled={busy}>
            {busy ? "Signing in…" : "Sign in ↗"}
          </button>
        </form>
        <Link className="back-link" href="/">
          Return to storefront ↗
        </Link>
      </section>
    </main>
  );
}
