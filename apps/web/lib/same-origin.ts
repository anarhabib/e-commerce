// Render terminates HTTPS before forwarding to Next. Use a trusted public
// origin from deployment configuration, never client-supplied forwarded headers.
export function isSameOriginRequest(
  origin: string | null,
  requestOrigin: string,
  configuredOrigin?: string,
): boolean {
  if (!origin || origin === "null") return false;
  try {
    const expected = new URL(configuredOrigin || requestOrigin);
    if (!["http:", "https:"].includes(expected.protocol)) return false;
    return origin === expected.origin;
  } catch {
    return false;
  }
}
