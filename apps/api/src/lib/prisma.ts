import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@neon/functions";

// Keep Prisma's schema/query API while using portable JavaScript on Neon Functions.
// Prisma owns each pool's lifetime, so disconnect/reconnect also works in tests.
class NeonPrismaPg extends PrismaPg {
  override async connect() {
    const adapter = await super.connect();
    attachDatabasePool(adapter.underlyingDriver());
    return adapter;
  }
}

export const prisma = new PrismaClient({
  adapter: new NeonPrismaPg({
    connectionString: process.env.DATABASE_URL?.replace(
      "sslmode=require",
      "sslmode=verify-full",
    ),
    max: 5,
  }),
});
