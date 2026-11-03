import { createRealtime, rawSql } from "@neon/realtime/server";

export type OrderSummary = { total: number; latest: string };
export async function sealOwnerOrderSummary() {
  const {
    NEON_REALTIME_SECRET: secret,
    NEON_REALTIME_URL: url,
    DATABASE_URL: databaseUrl,
  } = process.env;
  if (!secret || !url || !databaseUrl) return { enabled: false as const };
  const realtime = createRealtime({
    secret,
    db: decodeURIComponent(new URL(databaseUrl).pathname.slice(1)),
  });
  const query = rawSql<OrderSummary>(
    `SELECT count(*)::int AS total, coalesce(max("updatedAt")::text, '') AS latest FROM "OrderRequest"`,
  );
  // Only the authenticated owner endpoint calls this. No customer details are
  // included; the browser refetches its authorized page after a summary change.
  return { enabled: true as const, url, query: await realtime.seal({ query }) };
}
