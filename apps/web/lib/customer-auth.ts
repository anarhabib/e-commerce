import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

let auth: ReturnType<typeof createNeonAuth> | undefined;
export function customerAuth() {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!baseUrl || !secret) return undefined;
  auth ??= createNeonAuth({ baseUrl, cookies: { secret } });
  return auth;
}
