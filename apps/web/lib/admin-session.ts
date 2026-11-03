import { cookies } from "next/headers";

export const ownerCookieName = "carbignite-owner-session";
export const ownerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 8 * 60 * 60,
};

// Cookie presence alone is insufficient: Fastify verifies its signature, role and expiry.
export async function hasOwnerSession(): Promise<boolean> {
  const token = (await cookies()).get(ownerCookieName)?.value;
  if (!token || !process.env.API_URL) return false;
  try {
    const response = await fetch(`${process.env.API_URL}/admin/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
