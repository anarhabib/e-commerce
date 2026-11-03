import "server-only";

export function apiOriginHeaders(): Record<string, string> {
  return process.env.API_ORIGIN_SECRET
    ? { "x-carbignite-origin": process.env.API_ORIGIN_SECRET }
    : {};
}
