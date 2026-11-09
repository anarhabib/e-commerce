import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Run after `pnpm --filter @carbignite/web build`. Uses an isolated mock API;
// neither real credentials nor the product database are touched.
test(
  "production catalog cache reuses reads and expires only after successful product writes",
  { timeout: 90000 },
  async () => {
    const counts = new Map();
    let revision = 1;
    let failWrite = false;
    const product = () => ({
      id: "cache-fixture",
      name: `Cache fixture revision ${revision}`,
      slug: "cache-fixture",
      description: "Cache test only",
      sku: "CACHE-TEST",
      category: "TRIM",
      priceCents: 1000,
      currency: "USD",
      stock: 1,
      patterns: ["Woven"],
      finishes: ["Gloss"],
      make: "Cache make",
      model: "Cache model",
      yearFrom: 2020,
      yearTo: 2025,
      imageUrl: null,
      imageUrls: [],
      photoIndex: null,
      isSample: false,
    });
    const backend = createServer(async (req, res) => {
      for await (const chunk of req) {
        void chunk; // Drain the mock request body before responding.
      }
      counts.set(req.url, (counts.get(req.url) ?? 0) + 1);
      const url = new URL(req.url, "http://localhost");
      res.setHeader("Content-Type", "application/json");
      if (url.pathname === "/products/filters") {
        return res.end(
          JSON.stringify({
            makes: ["Cache make"],
            categories: [{ value: "TRIM", count: 1 }],
            vehicles: [
              {
                make: "Cache make",
                model: "Cache model",
                yearFrom: 2020,
                yearTo: 2025,
              },
            ],
          }),
        );
      }
      if (url.pathname === "/products") {
        return res.end(
          JSON.stringify({
            products: [product()],
            total: 1,
            totalPages: 1,
            page: 1,
            limit: Number(url.searchParams.get("limit") ?? 20),
          }),
        );
      }
      if (url.pathname.startsWith("/admin/products") && req.method !== "GET") {
        if (failWrite) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "Invalid product" }));
        }
        revision++;
        res.statusCode = req.method === "DELETE" ? 204 : 200;
        return res.end(
          req.method === "DELETE" ? undefined : JSON.stringify(product()),
        );
      }
      return res.end(JSON.stringify({ success: true }));
    });
    backend.listen(0, "127.0.0.1");
    await once(backend, "listening");
    const portProbe = createServer();
    portProbe.listen(0, "127.0.0.1");
    await once(portProbe, "listening");
    const port = portProbe.address().port;
    await new Promise((resolve) => portProbe.close(resolve));
    const origin = `http://127.0.0.1:${port}`;
    const require = createRequire(import.meta.url);
    let output = "";
    const child = spawn(
      process.execPath,
      [
        require.resolve("next/dist/bin/next"),
        "start",
        "-H",
        "127.0.0.1",
        "-p",
        String(port),
      ],
      {
        cwd: fileURLToPath(new URL("..", import.meta.url)),
        env: {
          ...process.env,
          API_URL: `http://127.0.0.1:${backend.address().port}`,
          NEXT_TELEMETRY_DISABLED: "1",
        },
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    );
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    const catalogReads = () =>
      [...counts]
        .filter(([url]) => url.startsWith("/products"))
        .reduce((sum, [, count]) => sum + count, 0);
    const read = async (path) => {
      const response = await fetch(`${origin}${path}`);
      assert.equal(response.status, 200, `${path}: ${output}`);
      return response.text();
    };
    const write = (path, method, authenticated = true) =>
      fetch(`${origin}/api/admin/${path}`, {
        method,
        headers: {
          Origin: `http://localhost:${port}`,
          "Content-Type": "application/json",
          ...(authenticated
            ? { Cookie: "carbignite-owner-session=cache-test-owner" }
            : {}),
        },
        body:
          method === "DELETE"
            ? undefined
            : JSON.stringify({ name: "Cache test" }),
      });
    try {
      const deadline = Date.now() + 30000;
      for (;;) {
        try {
          await read("/shop");
          break;
        } catch (error) {
          if (Date.now() > deadline || child.exitCode !== null)
            throw new Error(`${error.message}\n${output}`);
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }
      assert.match(await read("/shop"), /Cache fixture revision 1/);
      assert.equal((await fetch(`${origin}/products`)).status, 404);
      const warm = catalogReads();
      await read("/shop");
      assert.equal(
        catalogReads(),
        warm,
        "repeat shop visits must hit the cache",
      );
      const homepage = await read("/");
      assert.match(homepage, /href="\/shop\?collection=INTERIOR"/);
      assert.match(homepage, /href="\/shop\?collection=EXTERIOR"/);
      assert.doesNotMatch(homepage, /Best sellers/);
      const homepageWarm = catalogReads();
      await read("/");
      assert.equal(
        catalogReads(),
        homepageWarm,
        "homepage and full bag catalog stay cached",
      );
      await read("/shop?search=Cache&sort=price-asc");
      assert.ok(
        catalogReads() > homepageWarm,
        "a new search/sort has its own cache entry",
      );
      const filteredWarm = catalogReads();
      await read("/shop?sort=price-asc&search=Cache");
      assert.equal(
        catalogReads(),
        filteredWarm,
        "equivalent query order reuses cached data",
      );

      const unauthorized = await write(
        "products/cache-fixture",
        "PATCH",
        false,
      );
      assert.equal(unauthorized.status, 401);
      await read("/shop");
      assert.equal(catalogReads(), filteredWarm);
      failWrite = true;
      assert.equal(
        (await write("products/cache-fixture", "PATCH")).status,
        400,
      );
      failWrite = false;
      await read("/shop");
      assert.equal(
        catalogReads(),
        filteredWarm,
        "failed saves must preserve the cache",
      );
      assert.equal((await write("orders/cache-order", "PATCH")).status, 200);
      await read("/shop");
      assert.equal(
        catalogReads(),
        filteredWarm,
        "order updates do not expire product data",
      );

      for (const method of ["POST", "PATCH", "DELETE"]) {
        const before = catalogReads();
        const response = await write(
          method === "POST" ? "products" : "products/cache-fixture",
          method,
        );
        assert.equal(response.status, method === "DELETE" ? 204 : 200);
        if (method === "DELETE") assert.equal(await response.text(), "");
        assert.match(
          await read("/shop"),
          new RegExp(`Cache fixture revision ${revision}`),
        );
        assert.ok(
          catalogReads() > before,
          `${method} must expire cached catalog queries`,
        );
        assert.match(
          await read("/"),
          new RegExp(`Cache fixture revision ${revision}`),
        );
        assert.match(
          await read("/shop?search=Cache&sort=price-asc"),
          new RegExp(`Cache fixture revision ${revision}`),
        );
        const refreshed = catalogReads();
        await read("/shop");
        assert.equal(
          catalogReads(),
          refreshed,
          "reads are cached again after invalidation",
        );
      }
      assert.equal((await fetch(`${origin}/api/admin/products`)).status, 401);
      // Authorized admin reads also bypass the public catalog cache.
      const adminReadsBefore = counts.get("/admin/products") ?? 0;
      const headers = { Cookie: "carbignite-owner-session=cache-test-owner" };
      for (let i = 0; i < 2; i++)
        assert.equal(
          (await fetch(`${origin}/api/admin/products`, { headers })).status,
          200,
        );
      assert.equal(
        counts.get("/admin/products") - adminReadsBefore,
        2,
        "admin reads stay uncached",
      );
    } finally {
      if (child.exitCode === null) {
        const exited = once(child, "exit");
        child.kill();
        await exited;
      }
      backend.closeAllConnections();
      await new Promise((resolve) => backend.close(resolve));
    }
  },
);
