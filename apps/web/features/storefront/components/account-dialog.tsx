"use client";
import { useState, type FormEvent } from "react";
import { customerAuthClient as auth } from "@/lib/customer-auth-client";
import { LoadingBar } from "@/components/ui/loading-bar";
import { Dialog } from "./dialog";

export function AccountDialog({ close }: { close: () => void }) {
  const {
    data: session,
    isPending,
    error: sessionError,
    refetch,
  } = auth.useSession();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [verify, setVerify] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const credentials = {
        email: String(form.get("email")),
        password: String(form.get("password")),
      };
      const result =
        mode === "sign-in"
          ? await auth.signIn.email(credentials)
          : await auth.signUp.email({
              ...credentials,
              name: String(form.get("name")),
            });
      if (result.error)
        throw new Error(
          result.error.message || "Unable to sign in. Please try again.",
        );
      await refetch();
      if (mode === "sign-up")
        setMessage("Your account was created. Sign in if prompted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Account service is unavailable.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function sendCode() {
    if (!session?.user.email) return;
    setBusy(true);
    setError("");
    try {
      const result = await auth.emailOtp.sendVerificationOtp({
        email: session.user.email,
        type: "email-verification",
      });
      if (result.error)
        throw new Error(
          result.error.message || "Unable to send a verification code.",
        );
      setVerify(true);
      setMessage("Check your inbox for a verification code.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send the code.");
    } finally {
      setBusy(false);
    }
  }
  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session?.user.email) return;
    setBusy(true);
    setError("");
    try {
      const result = await auth.emailOtp.verifyEmail({
        email: session.user.email,
        otp: String(new FormData(event.currentTarget).get("code")),
      });
      if (result.error)
        throw new Error(
          result.error.message ||
            "That verification code could not be accepted.",
        );
      await refetch();
      setVerify(false);
      setMessage("Email verified.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify email.");
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const result = await auth.signOut();
      if (result.error)
        throw new Error(result.error.message || "Unable to sign out.");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign out.");
      setBusy(false);
    }
  }
  return (
    <Dialog id="account-dialog" title="your account" onClose={close}>
      <div className="eyebrow">YOUR ACCOUNT</div>
      <h2>
        {session?.user
          ? `Welcome, ${session.user.name || "back"}.`
          : mode === "sign-in"
            ? "Welcome back."
            : "Make it yours."}
      </h2>
      {(isPending || busy) && <LoadingBar label="Updating your account" />}
      {(error || sessionError) && (
        <p className="account-error" role="alert">
          {error || "Account service is unavailable. Please try again."}
        </p>
      )}
      {message && (
        <p className="muted" role="status">
          {message}
        </p>
      )}
      {session?.user ? (
        <div className="account-form">
          <p className="muted">{session.user.email}</p>
          {!session.user.emailVerified && (
            <button
              className="button secondary"
              onClick={sendCode}
              disabled={busy}
            >
              Verify email
            </button>
          )}
          {verify && (
            <form className="account-form" onSubmit={verifyCode}>
              <label htmlFor="account-code">Verification code</label>
              <input
                id="account-code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={12}
              />
              <button className="button primary" disabled={busy}>
                Confirm email
              </button>
            </form>
          )}
          <button className="button primary" disabled={busy} onClick={signOut}>
            Sign out
          </button>
        </div>
      ) : (
        <>
          <p className="muted">Sign in to your CARBIGNITE customer account.</p>
          <form className="account-form" onSubmit={submit} aria-busy={busy}>
            {mode === "sign-up" && (
              <>
                <label htmlFor="account-name">Name</label>
                <input
                  id="account-name"
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </>
            )}
            <label htmlFor="account-email">Email</label>
            <input
              id="account-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
            />
            <label htmlFor="account-password">Password</label>
            <input
              id="account-password"
              name="password"
              type="password"
              autoComplete={
                mode === "sign-in" ? "current-password" : "new-password"
              }
              required
              minLength={mode === "sign-up" ? 8 : 1}
              maxLength={128}
            />
            <button className="button primary" disabled={busy || isPending}>
              {mode === "sign-in" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button
            className="account-switch"
            disabled={busy}
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setError("");
              setMessage("");
            }}
          >
            {mode === "sign-in"
              ? "Create an account"
              : "Already registered? Sign in"}
          </button>
        </>
      )}
    </Dialog>
  );
}
