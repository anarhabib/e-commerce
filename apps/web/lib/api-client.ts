import { apiOriginHeaders } from "./api-origin";
const API_URL = process.env.API_URL;

export async function apiGet<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("API_URL is not set. Check apps/web/.env.local");
  }

  const headers = new Headers(options.headers);
  for (const [key, value] of Object.entries(apiOriginHeaders()))
    headers.set(key, value);
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} on ${path}`);
  }

  return res.json() as Promise<T>;
}
