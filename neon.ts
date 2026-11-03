import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  // Declare your Neon services here
  preview: {
    realtime: {
      allowedOrigins: [
        "http://localhost:3000",
        ...(process.env.APP_ORIGIN
          ? [new URL(process.env.APP_ORIGIN).origin]
          : []),
      ],
    },
  },
  auth: true,
  functions: {
    hello: {
      name: "CARBIGNITE API",
      source: "./hello.ts",
      // Pull/status can evaluate this file without local app secrets. Omitted
      // keys preserve live values; neon:deploy explicitly loads apps/api/.env.
      env: Object.fromEntries(
        [
          "API_ORIGIN_SECRET",
          "ADMIN_EMAIL",
          "ADMIN_PASSWORD_HASH",
          "ADMIN_SESSION_SECRET",
          "NEON_REALTIME_SECRET",
          "NEON_REALTIME_URL",
        ].flatMap((key) =>
          process.env[key] ? [[key, process.env[key]!]] : [],
        ),
      ),
    },
  },
  buckets: {
    // "private" is the default; use "public_read" for anonymous reads
    assets: { access: "private" },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      // Default branch: no overrides, uses project defaults
      return {};
    }
    if (!branch.exists) {
      // New non-default branches: auto-expire
      // Run `neon checkout <name>` to create a new branch with these settings
      return { ttl: "7d" };
    }
    // Existing branch: no changes
    return {};
  },
});
